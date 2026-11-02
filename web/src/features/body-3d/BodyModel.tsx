import { useGLTF, type CameraControls } from '@react-three/drei'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  Bone,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  Plane,
  Quaternion,
  Raycaster,
  SkinnedMesh,
  SphereGeometry,
  Vector2,
  Vector3,
  type Object3D,
} from 'three'
import type { BodyView } from '../../api/anatomy'
import {
  createBoneMaterial,
  createContextMaterial,
  createHeadMaterial,
  createMuscleMaterial,
  createSharedUniforms,
  paletteFor,
  type BodyStyle,
  type FigureMaterial,
} from './bodyMaterials'
import { VIEW_AZIMUTH } from './camera'
import { MODEL_URL, parseNodeName } from './modelNodes'
import { PosedPicker, SurfaceAnchor } from './picking'
import { POSABLE_JOINTS, clampJointQuaternion, dragJointFor, poseQuaternions, type JointName, type Pose } from './pose'
import type { BodyShape } from './profile'

export type ViewerMode = 'explore' | 'pose'

interface BodyModelProps {
  selectedId: string | null
  hoveredId: string | null
  view: BodyView
  style: BodyStyle
  shape: BodyShape
  mode: ViewerMode
  /** Target pose; a new object (even with equal content) re-applies it. */
  pose: Pose
  onSelect: (id: string, anchor: SurfaceAnchor) => void
  onHover: (id: string | null) => void
  /** Called when the selection changes without a click, e.g. from the roster. */
  onAutoAnchor: (anchor: SurfaceAnchor) => void
  /** The user dragged a limb, so the figure no longer matches a preset. */
  onPoseEdited: () => void
  /** Theme accent colours (hex) for selection, glow and handles. */
  accent: string
  accentDeep: string
  /** First frame with the figure drawn (shaders compiled, picking ready). */
  onReady: () => void
  anchorRef: React.RefObject<SurfaceAnchor | null>
  controls: React.RefObject<CameraControls | null>
}

/** Pixels the pointer may travel between down and up and still count as a click. */
const CLICK_SLOP = 5
const REVEAL_SECONDS = 1.9
const SWEEP_SECONDS = 0.75
const BLACK = new Color('#000000')

interface Figure {
  meshes: SkinnedMesh[]
  muscles: Map<string, SkinnedMesh[]>
  bones: SkinnedMesh[]
  context: SkinnedMesh[]
  head: SkinnedMesh[]
  joints: Map<JointName | 'root', Bone>
  /** Rest-pose ankle height, for keeping the feet planted. */
  restAnkleY: number
}

export function BodyModel(props: BodyModelProps) {
  const {
    selectedId,
    hoveredId,
    view,
    style,
    shape,
    mode,
    pose,
    onSelect,
    onHover,
    onAutoAnchor,
    onPoseEdited,
    onReady,
    anchorRef,
    controls,
    accent,
    accentDeep,
  } = props
  const readyRef = useRef(false)
  const { scene } = useGLTF(MODEL_URL, false, true)
  const { camera, gl } = useThree()
  const shared = useMemo(() => createSharedUniforms(), [])
  const group = useRef<Group>(null)

  const figure = useMemo<Figure>(() => {
    const meshes: SkinnedMesh[] = []
    const muscles = new Map<string, SkinnedMesh[]>()
    const bones: SkinnedMesh[] = []
    const context: SkinnedMesh[] = []
    const head: SkinnedMesh[] = []
    const joints = new Map<JointName | 'root', Bone>()
    scene.traverse((o: Object3D) => {
      if (o instanceof Bone && o.name.startsWith('joint-')) joints.set(o.name.slice(6) as JointName, o)
      if (!(o instanceof SkinnedMesh)) return
      // Bounds are from the rest pose; posed limbs must never be culled.
      o.frustumCulled = false
      const node = parseNodeName(o.name)
      o.userData.node = node
      meshes.push(o)
      if (node.kind === 'bones') bones.push(o)
      else if (node.kind === 'context') context.push(o)
      else if (node.kind === 'head') head.push(o)
      else if (node.kind === 'muscle') muscles.set(node.muscleId, [...(muscles.get(node.muscleId) ?? []), o])
    })
    scene.updateMatrixWorld(true)
    const ankle = joints.get('ankle-l')!.getWorldPosition(new Vector3())
    return { meshes, muscles, bones, context, head, joints, restAnkleY: ankle.y }
  }, [scene])

  // Materials for the chosen look.
  useEffect(() => {
    const created: FigureMaterial[] = []
    const make = <T extends FigureMaterial>(m: T) => (created.push(m), m)
    for (const m of figure.bones) m.material = make(createBoneMaterial(style, shared, accent))
    for (const m of figure.context) m.material = make(createContextMaterial(style, shared))
    for (const m of figure.head) m.material = make(createHeadMaterial(style, shared, accent))
    for (const list of figure.muscles.values()) for (const m of list) m.material = make(createMuscleMaterial(style, shared))
    return () => created.forEach((m) => m.dispose())
  }, [figure, style, shared, accent])

  const palette = useMemo(() => paletteFor(style, accent, accentDeep), [style, accent, accentDeep])
  useEffect(() => {
    shared.uEdgeColor.value.set(accent)
  }, [shared, accent])

  // Created in an effect (it patches mesh.raycast), not during render.
  const pickerRef = useRef<PosedPicker | null>(null)
  useEffect(() => {
    const picker = new PosedPicker(figure.meshes)
    pickerRef.current = picker
    return () => {
      picker.dispose()
      pickerRef.current = null
    }
  }, [figure])

  // ---- Pose ---------------------------------------------------------------
  const targets = useRef(poseQuaternions({}))
  const poseState = useRef({ dirty: false, settledFor: 0, dragging: false, groundY: 0 })

  useEffect(() => {
    targets.current = poseQuaternions(pose)
    poseState.current.dirty = true
  }, [pose])

  // Joint handles, visible in pose mode. Attached to the bones in an effect
  // so StrictMode's double render can't leave a second set behind.
  const handles = useRef<Mesh[]>([])
  useEffect(() => {
    const geometry = new SphereGeometry(0.016, 16, 12)
    const material = new MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.9, depthTest: false })
    const list: Mesh[] = []
    for (const name of POSABLE_JOINTS) {
      const bone = figure.joints.get(name)
      if (!bone) continue
      const h = new Mesh(geometry, material)
      h.renderOrder = 10
      h.visible = false
      h.raycast = () => {}
      bone.add(h)
      list.push(h)
    }
    handles.current = list
    return () => {
      list.forEach((h) => h.removeFromParent())
      geometry.dispose()
      material.dispose()
      handles.current = []
    }
  }, [figure, accent])

  // ---- Selection sweep & intro reveal -------------------------------------
  const anim = useRef({ reveal: 0, sweepT: 1, sweepFrom: 0, sweepTo: 0, sweepId: null as string | null })

  useEffect(() => {
    const a = anim.current
    const picker = pickerRef.current
    if (!selectedId || !picker) return
    const box = boxOf(figure.muscles.get(selectedId) ?? [], picker)
    if (!box) return
    a.sweepId = selectedId
    a.sweepFrom = box.min.y - 0.05
    a.sweepTo = box.max.y + 0.05
    a.sweepT = 0
  }, [selectedId, figure])

  // Anchor the leader line when the selection changes without a click.
  useEffect(() => {
    const picker = pickerRef.current
    if (!selectedId || !picker || anchorRef.current?.muscleId === selectedId) return
    const anchor = findAnchor(selectedId, figure.muscles.get(selectedId) ?? [], view, picker)
    if (anchor) onAutoAnchor(anchor)
  }, [selectedId, view, figure, anchorRef, onAutoAnchor])

  // ---- Per-frame animation --------------------------------------------------
  const tmpQ = useMemo(() => new Quaternion(), [])
  const spineBend = useMemo(() => new Quaternion(), [])
  const xAxis = useMemo(() => new Vector3(1, 0, 0), [])
  const v = useMemo(() => new Vector3(), [])

  useFrame(({ clock }, delta) => {
    const k = 1 - Math.exp(-delta * 10)

    // Intro: reveal the figure from the pedestal up.
    const a = anim.current
    a.reveal = Math.min(1, a.reveal + delta / REVEAL_SECONDS)
    const e = a.reveal < 0.5 ? 4 * a.reveal ** 3 : 1 - (-2 * a.reveal + 2) ** 3 / 2
    // Written every frame so the figure can never be left hidden.
    shared.uReveal.value = a.reveal >= 1 ? 99 : -0.05 + e * (shape.scaleY * 1.75 + 0.1)
    if (a.sweepT < 1) a.sweepT = Math.min(1, a.sweepT + delta / SWEEP_SECONDS)

    // Body shape: ease scale and shader uniforms toward the profile.
    const g = group.current
    if (g) {
      g.scale.x += (shape.scaleXZ - g.scale.x) * k
      g.scale.z += (shape.scaleXZ - g.scale.z) * k
      g.scale.y += (shape.scaleY - g.scale.y) * k
    }
    shared.uInflate.value += (shape.inflate - shared.uInflate.value) * k
    shared.uBelly.value += (shape.belly - shared.uBelly.value) * k
    shared.uDefinition.value += (shape.definition - shared.uDefinition.value) * k
    shared.uSoftness.value += (shape.softness - shared.uSoftness.value) * k
    shared.uDesat.value += ((palette.desaturates ? shape.desaturate : 0) - shared.uDesat.value) * k

    // Pose: slerp joints toward their targets (age adds a forward stoop).
    const ps = poseState.current
    let moving = false
    if (!ps.dragging) {
      spineBend.setFromAxisAngle(xAxis, shape.spineBend)
      const pk = 1 - Math.exp(-delta * 7)
      for (const name of POSABLE_JOINTS) {
        const bone = figure.joints.get(name)
        if (!bone) continue
        const target = name === 'spine' ? tmpQ.copy(targets.current.spine).multiply(spineBend) : targets.current[name]
        if (bone.quaternion.angleTo(target) > 0.0015) {
          bone.quaternion.slerp(target, pk)
          moving = true
        }
      }
    }
    // Keep the lowest foot on the pedestal whatever the pose.
    const root = figure.joints.get('root')
    if (root) {
      root.updateMatrixWorld(true)
      const scaleY = g?.scale.y ?? 1
      const al = figure.joints.get('ankle-l')!.getWorldPosition(v).y
      const ar = figure.joints.get('ankle-r')!.getWorldPosition(v).y
      // Shift the root so the lowest ankle sits at its rest height.
      const groundY = root.position.y + figure.restAnkleY - Math.min(al, ar) / scaleY
      ps.groundY += (groundY - ps.groundY) * (ps.dragging ? 1 : k)
      root.position.y = ps.groundY
    }
    if (moving || ps.dragging) {
      ps.dirty = true
      ps.settledFor = 0
    } else if (ps.dirty) {
      ps.settledFor += delta
      if (ps.settledFor > 0.12 && pickerRef.current) {
        pickerRef.current.update()
        ps.dirty = false
      }
    }

    // Muscle colours, hover rim and selection sweep.
    const pulse = 0.55 + Math.sin(clock.elapsedTime * 3) * 0.25
    for (const [id, meshes] of figure.muscles) {
      const selected = id === selectedId
      const hovered = id === hoveredId
      const color = selected ? palette.selected : hovered ? palette.hover : selectedId ? palette.dim : palette.muscle
      const emissive = selected ? palette.selectedEmissive : hovered ? palette.hoverEmissive : BLACK
      for (const mesh of meshes) {
        const m = mesh.material as FigureMaterial
        m.color.lerp(color, k)
        m.emissive.lerp(emissive, k)
        m.emissiveIntensity = selected ? pulse : 1
        const u = m.userData.u
        u.uRim.value += ((hovered && !selected ? palette.hoverRim : 0) - u.uRim.value) * k
        if (selected && a.sweepId === id && a.sweepT < 1) {
          u.uSweep.value = a.sweepFrom + (a.sweepTo - a.sweepFrom) * (1 - (1 - a.sweepT) ** 2)
          u.uSweepAmount.value = 3 * Math.sin(Math.PI * a.sweepT)
        } else u.uSweepAmount.value = 0
      }
    }

    for (const h of handles.current) h.visible = mode === 'pose'

    if (!readyRef.current) {
      readyRef.current = true
      onReady()
    }
  })

  // ---- Pointer handling -----------------------------------------------------
  const pointerDown = useRef({ x: 0, y: 0 })
  const muscleOf = (e: ThreeEvent<PointerEvent | MouseEvent>) => {
    const node = e.object.userData.node
    return node?.kind === 'muscle' ? (node.muscleId as string) : null
  }

  const startDrag = (e: ThreeEvent<PointerEvent>) => {
    const mesh = e.object as SkinnedMesh
    const face = e.face
    if (!face || !mesh.skeleton) return
    const joint = dragJointFor(dominantJoint(mesh, face.a))
    const bone = joint && figure.joints.get(joint)
    if (!joint || !bone) return

    e.stopPropagation()
    const ps = poseState.current
    ps.dragging = true
    if (controls.current) controls.current.enabled = false
    document.body.style.cursor = 'grabbing'

    const pivot = bone.getWorldPosition(new Vector3())
    const plane = new Plane().setFromNormalAndCoplanarPoint(camera.getWorldDirection(new Vector3()).negate(), pivot)
    const prev = plane.projectPoint(e.point, new Vector3())
    const raycaster = new Raycaster()
    const ndc = new Vector2()
    const now = new Vector3()
    const qBone = new Quaternion()
    const qParent = new Quaternion()
    const delta = new Quaternion()

    const move = (ev: PointerEvent) => {
      const r = gl.domElement.getBoundingClientRect()
      ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1)
      raycaster.setFromCamera(ndc, camera)
      if (!raycaster.ray.intersectPlane(plane, now)) return
      bone.getWorldPosition(pivot)
      const from = prev.clone().sub(pivot)
      const to = now.clone().sub(pivot)
      if (from.length() < 0.025 || to.length() < 0.025) return
      // Rotate the bone (in world space) by the swing of the pointer around
      // the joint, then express that in the parent's frame and clamp.
      delta.setFromUnitVectors(from.normalize(), to.normalize())
      bone.getWorldQuaternion(qBone)
      bone.parent!.getWorldQuaternion(qParent)
      const local = qParent.invert().multiply(delta.multiply(qBone))
      bone.quaternion.copy(clampJointQuaternion(joint, local))
      targets.current[joint].copy(bone.quaternion)
      if (joint === 'spine') targets.current.spine.multiply(spineBend.clone().invert())
      prev.copy(now)
    }
    const up = () => {
      ps.dragging = false
      ps.dirty = true
      if (controls.current) controls.current.enabled = true
      document.body.style.cursor = ''
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      onPoseEdited()
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <group ref={group}>
      <primitive
        object={scene}
        onPointerMove={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation()
          if (poseState.current.dragging) return
          if (mode === 'pose') {
            const mesh = e.object as SkinnedMesh
            const draggable = e.face && mesh.skeleton && dragJointFor(dominantJoint(mesh, e.face.a))
            document.body.style.cursor = draggable ? 'grab' : 'default'
            onHover(null)
            return
          }
          const id = muscleOf(e)
          onHover(id)
          document.body.style.cursor = id ? 'pointer' : 'grab'
        }}
        onPointerOut={() => {
          onHover(null)
          if (!poseState.current.dragging) document.body.style.cursor = ''
        }}
        onPointerDown={(e: ThreeEvent<PointerEvent>) => {
          pointerDown.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY }
          if (mode === 'pose') startDrag(e)
        }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation()
          if (mode === 'pose') return
          const moved = Math.hypot(e.nativeEvent.clientX - pointerDown.current.x, e.nativeEvent.clientY - pointerDown.current.y)
          const id = muscleOf(e)
          if (!id || moved > CLICK_SLOP) return
          const anchor = SurfaceAnchor.fromHit(id, e)
          if (anchor) onSelect(id, anchor)
        }}
      />
    </group>
  )
}

/** The skeleton joint (without "joint-") with the most influence on a vertex. */
function dominantJoint(mesh: SkinnedMesh, vertex: number): string {
  const idx = mesh.geometry.attributes.skinIndex
  const wt = mesh.geometry.attributes.skinWeight
  let best = 0
  let joint = 0
  for (let c = 0; c < 4; c++) {
    const w = wt.getComponent(vertex, c)
    if (w > best) {
      best = w
      joint = idx.getComponent(vertex, c)
    }
  }
  return mesh.skeleton.bones[joint]?.name.replace(/^joint-/, '') ?? 'root'
}

function boxOf(meshes: SkinnedMesh[], picker: PosedPicker) {
  let box = null
  for (const m of meshes) {
    const b = picker.worldBox(m)
    if (b) box = box ? box.union(b) : b
  }
  return box
}

const raycaster = new Raycaster()

/**
 * Finds a visible surface point on a muscle for the leader line: cast a ray
 * from the viewing direction at the side of the muscle nearest the info panel.
 */
function findAnchor(muscleId: string, meshes: SkinnedMesh[], view: BodyView, picker: PosedPicker): SurfaceAnchor | null {
  if (!meshes.length) return null
  const az = VIEW_AZIMUTH[view]
  const toward = new Vector3(Math.sin(az), 0, Math.cos(az))
  // The panel is on the right of the screen: the body's left side from the
  // front, its right side from the back.
  const prefer = view === 'front' ? 'l' : 'r'
  const rank = (m: SkinnedMesh) => (m.userData.node.side === prefer ? 0 : 1)
  const ordered = [...meshes].sort((a, b) => rank(a) - rank(b))
  for (const mesh of ordered) {
    const box = picker.worldBox(mesh)
    if (!box) continue
    const center = box.getCenter(new Vector3())
    raycaster.set(center.clone().addScaledVector(toward, 2), toward.clone().negate())
    const hit = raycaster.intersectObject(mesh, false)[0]
    if (hit) return SurfaceAnchor.fromHit(muscleId, hit)
  }
  return null
}

useGLTF.preload(MODEL_URL, false, true)

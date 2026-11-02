import { useGLTF } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Color, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Raycaster, Vector3, type Object3D } from 'three'
import type { BodyView } from '../../api/anatomy'
import { VIEW_AZIMUTH } from './camera'
import { MODEL_URL, parseNodeName } from './modelNodes'

export interface Anchor {
  muscleId: string
  point: Vector3
  normal: Vector3
}

interface BodyModelProps {
  selectedId: string | null
  hoveredId: string | null
  view: BodyView
  onSelect: (id: string, anchor: Anchor) => void
  onHover: (id: string | null) => void
  /** Called when the selection changes without a click, e.g. from the roster. */
  onAutoAnchor: (anchor: Anchor) => void
  anchorRef: React.RefObject<Anchor | null>
}

const COLORS = {
  muscle: new Color('#8f2b33'),
  muscleDim: new Color('#5a2128'),
  hover: new Color('#d0505c'),
  selected: new Color('#34e0c4'),
  selectedEmissive: new Color('#0d8f7c'),
  hoverEmissive: new Color('#5a1018'),
  none: new Color('#000000'),
}

/** Pixels the pointer may travel between down and up and still count as a click. */
const CLICK_SLOP = 5

// Shared by all instances; the model is only mounted once.
const raycaster = new Raycaster()
const tmp = new Vector3()

export function BodyModel({ selectedId, hoveredId, view, onSelect, onHover, onAutoAnchor, anchorRef }: BodyModelProps) {
  const { scene } = useGLTF(MODEL_URL, false, true)

  // Give every muscle mesh its own material so it can animate independently.
  const muscles = useMemo(() => {
    const byId = new Map<string, Mesh[]>()
    const bone = new MeshStandardMaterial({ color: '#e9dcc3', roughness: 0.62, metalness: 0 })
    const context = new MeshPhysicalMaterial({
      color: COLORS.muscleDim,
      roughness: 0.5,
      clearcoat: 0.25,
      clearcoatRoughness: 0.5,
    })

    scene.traverse((o: Object3D) => {
      if (!(o instanceof Mesh)) return
      const node = parseNodeName(o.name)
      o.userData.node = node
      if (node.kind === 'bones') o.material = bone
      else if (node.kind === 'context') o.material = context
      else if (node.kind === 'muscle') {
        o.material = new MeshPhysicalMaterial({
          color: COLORS.muscle.clone(),
          emissive: COLORS.none.clone(),
          roughness: 0.42,
          // Clearcoat gives the wet sheen of muscle tissue; sheen/transmission
          // are skipped as they cost more than they add at this scale.
          clearcoat: 0.35,
          clearcoatRoughness: 0.35,
        })
        const list = byId.get(node.muscleId) ?? []
        list.push(o)
        byId.set(node.muscleId, list)
      }
    })
    return byId
  }, [scene])

  // Anchor the leader line when the selection changes without a click.
  useEffect(() => {
    if (!selectedId || anchorRef.current?.muscleId === selectedId) return
    const meshes = muscles.get(selectedId)
    if (!meshes?.length) return
    const anchor = findAnchor(selectedId, meshes, view)
    if (anchor) onAutoAnchor(anchor)
  }, [selectedId, view, muscles, anchorRef, onAutoAnchor])

  // Ease colours toward their target state every frame.
  useFrame(({ clock }, delta) => {
    const k = 1 - Math.exp(-delta * 12)
    const pulse = 0.55 + Math.sin(clock.elapsedTime * 3) * 0.25
    for (const [id, meshes] of muscles) {
      const selected = id === selectedId
      const hovered = id === hoveredId
      const color = selected ? COLORS.selected : hovered ? COLORS.hover : selectedId ? COLORS.muscleDim : COLORS.muscle
      const emissive = selected ? COLORS.selectedEmissive : hovered ? COLORS.hoverEmissive : COLORS.none
      for (const mesh of meshes) {
        const m = mesh.material as MeshPhysicalMaterial
        m.color.lerp(color, k)
        m.emissive.lerp(emissive, k)
        m.emissiveIntensity = selected ? pulse : 1
      }
    }
  })

  const pointerDown = useRef({ x: 0, y: 0 })

  const muscleOf = (e: ThreeEvent<PointerEvent | MouseEvent>) => {
    const node = e.object.userData.node
    return node?.kind === 'muscle' ? (node.muscleId as string) : null
  }

  return (
    <primitive
      object={scene}
      onPointerMove={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        const id = muscleOf(e)
        onHover(id)
        document.body.style.cursor = id ? 'pointer' : 'grab'
      }}
      onPointerOut={() => {
        onHover(null)
        document.body.style.cursor = ''
      }}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        pointerDown.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY }
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        const moved = Math.hypot(e.nativeEvent.clientX - pointerDown.current.x, e.nativeEvent.clientY - pointerDown.current.y)
        const id = muscleOf(e)
        if (!id || moved > CLICK_SLOP || !e.face) return
        const normal = e.face.normal.clone().transformDirection(e.object.matrixWorld)
        onSelect(id, { muscleId: id, point: e.point.clone(), normal })
      }}
    />
  )
}

/**
 * Finds a visible surface point on a muscle for the leader line: cast a ray
 * from the viewing direction at the side of the muscle nearest the info panel.
 */
function findAnchor(muscleId: string, meshes: Mesh[], view: BodyView): Anchor | null {
  const az = VIEW_AZIMUTH[view]
  const towardCamera = new Vector3(Math.sin(az), 0, Math.cos(az))
  // The panel sits on the right of the screen: that's the body's left side
  // from the front, and the body's right side from the back.
  const preferSide = view === 'front' ? 'l' : 'r'
  const mesh = meshes.find((m) => m.userData.node.side === preferSide) ?? meshes[0]

  mesh.geometry.computeBoundingBox()
  const center = mesh.geometry.boundingBox!.getCenter(new Vector3()).applyMatrix4(mesh.matrixWorld)

  raycaster.set(tmp.copy(center).addScaledVector(towardCamera, 2), towardCamera.clone().negate())
  const hit = raycaster.intersectObject(mesh, false)[0]
  if (hit?.face) {
    return {
      muscleId,
      point: hit.point.clone(),
      normal: hit.face.normal.clone().transformDirection(mesh.matrixWorld),
    }
  }
  return { muscleId, point: center, normal: towardCamera }
}

useGLTF.preload(MODEL_URL, false, true)

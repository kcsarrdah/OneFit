import {
  Bvh,
  CameraControls,
  ContactShadows,
  Environment,
  Lightformer,
  PerformanceMonitor,
  useProgress,
} from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { Suspense, useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { Vector3, type Group } from 'three'
import type { BodyView, MuscleSummary } from '../../api/anatomy'
import { BodyModel, type Anchor } from './BodyModel'
import {
  BODY_CENTER_Y,
  DISTANCE,
  VIEW_AZIMUTH,
  focusTargetY,
  shortestAzimuth,
  viewForAzimuth,
} from './camera'
import { leaderPoints, toSvgPoints } from './leader'
import { Platform } from './Platform'

export interface BodyViewerProps {
  muscles: MuscleSummary[]
  selectedId: string | null
  hoveredId: string | null
  view: BodyView
  /** A muscle was clicked on the model. The camera stays on the side the user chose. */
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
  onViewChange: (view: BodyView) => void
  /** The element the leader line runs to (the info panel). */
  leaderTargetRef: RefObject<HTMLElement | null>
}

const POLAR = Math.PI / 2 - 0.06

export default function BodyViewer(props: BodyViewerProps) {
  const leader = useRef<LeaderElements>({ line: null, dot: null, end: null })
  const container = useRef<HTMLDivElement>(null)
  const visible = useOnScreen(container)
  // Step quality down on slow devices: drop post-processing, then resolution.
  const [quality, setQuality] = useState<'high' | 'low'>('high')

  return (
    <div ref={container} className="relative h-full w-full">
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={quality === 'high' ? [1, 1.5] : 1}
        camera={{ position: [0, BODY_CENTER_Y, DISTANCE.overview], fov: 32, near: 0.05, far: 30 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        aria-label="3D body model. Drag to rotate, scroll to zoom, click a muscle to select it."
      >
        <PerformanceMonitor onDecline={() => setQuality('low')} flipflops={2} />
        <Suspense fallback={null}>
          <Scene {...props} leader={leader} />
          {quality === 'high' && (
            <EffectComposer multisampling={2}>
              <Bloom mipmapBlur luminanceThreshold={0.75} luminanceSmoothing={0.2} intensity={0.9} />
              <Vignette offset={0.25} darkness={0.55} />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
      <LoadingOverlay />
      <LeaderOverlay leader={leader} />
    </div>
  )
}

/** Pauses rendering while the stage is scrolled out of view. */
function useOnScreen(ref: RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
  return visible
}

interface LeaderElements {
  line: SVGPolylineElement | null
  dot: SVGCircleElement | null
  end: SVGCircleElement | null
}

function Scene({
  muscles,
  selectedId,
  hoveredId,
  view,
  onSelect,
  onHover,
  onViewChange,
  leaderTargetRef,
  leader,
}: BodyViewerProps & { leader: RefObject<LeaderElements> }) {
  const controls = useRef<CameraControls>(null)
  const anchor = useRef<Anchor | null>(null)
  const lastView = useRef<BodyView>(view)

  // Re-aim at the selected muscle: turn to its side if asked and shift the
  // look-at height toward it, keeping the user's zoom level.
  const focus = useCallback((y: number, azimuth?: number) => {
    const c = controls.current
    if (!c) return
    const az = shortestAzimuth(c.azimuthAngle, azimuth ?? c.azimuthAngle)
    const ty = focusTargetY(y)
    const pos = new Vector3().setFromSphericalCoords(c.distance, c.polarAngle, az).add(new Vector3(0, ty, 0))
    void c.setLookAt(pos.x, pos.y, pos.z, 0, ty, 0, true)
  }, [])

  // Turn the figure when the requested side differs from what the camera shows.
  useEffect(() => {
    const c = controls.current
    if (!c || viewForAzimuth(c.azimuthAngle) === view) return
    lastView.current = view
    void c.rotateTo(shortestAzimuth(c.azimuthAngle, VIEW_AZIMUTH[view]), POLAR, true)
  }, [view])

  const handleSelect = useCallback(
    (id: string, a: Anchor) => {
      anchor.current = a
      onSelect(id)
      focus(a.point.y)
    },
    [onSelect, focus],
  )

  const handleAutoAnchor = useCallback(
    (a: Anchor) => {
      // The default selection on load keeps the intro framing.
      const initial = anchor.current === null
      anchor.current = a
      if (initial) return
      const m = muscles.find((x) => x.id === a.muscleId)
      focus(a.point.y, m && !m.views.includes(view) ? VIEW_AZIMUTH[m.views[0]] : VIEW_AZIMUTH[view])
    },
    [focus, muscles, view],
  )

  useLeaderLine(anchor, selectedId, leader, leaderTargetRef)
  useIdleSway(controls, selectedId)

  return (
    <>
      <color attach="background" args={['#070a12']} />
      <fog attach="fog" args={['#070a12', 6, 11]} />

      <CameraControls
        ref={controls}
        makeDefault
        minDistance={DISTANCE.min}
        maxDistance={DISTANCE.max}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2 + 0.12}
        smoothTime={0.35}
        draggingSmoothTime={0.12}
        onChange={() => {
          const c = controls.current
          if (!c) return
          const v = viewForAzimuth(c.azimuthAngle)
          if (v !== lastView.current) {
            lastView.current = v
            onViewChange(v)
          }
        }}
        onStart={() => {
          document.body.style.cursor = 'grabbing'
          markInteraction()
        }}
        onEnd={() => {
          document.body.style.cursor = ''
        }}
      />
      <InitialFraming controls={controls} />

      <CameraRig />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2} position={[0, 4, 3]} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#56c7ff" position={[-4, 1.5, -2]} scale={[2, 5, 1]} />
        <Lightformer form="rect" intensity={1} color="#ffd2b8" position={[4, 1, 1]} scale={[2, 4, 1]} />
      </Environment>

      <Bvh firstHitOnly>
        <BodyModel
          selectedId={selectedId}
          hoveredId={hoveredId}
          view={view}
          onSelect={handleSelect}
          onHover={onHover}
          onAutoAnchor={handleAutoAnchor}
          anchorRef={anchor}
        />
      </Bvh>
      <Platform />
      <ContactShadows position={[0, 0.004, 0]} scale={1.4} blur={2.4} far={1.2} opacity={0.7} resolution={512} frames={1} />
    </>
  )
}

/**
 * Studio lighting that turns with the camera, so whichever side you orbit
 * to gets a warm key light and a cool rim from behind.
 */
function CameraRig() {
  const rig = useRef<Group>(null)
  useFrame(({ camera }) => {
    if (rig.current) rig.current.rotation.y = Math.atan2(camera.position.x, camera.position.z)
  })
  return (
    <group ref={rig}>
      <ambientLight intensity={0.3} />
      <directionalLight position={[2.2, 3.2, 3]} intensity={2.3} color="#fff1e6" />
      <directionalLight position={[-1.5, 1.2, 2.5]} intensity={0.6} color="#ffd9cc" />
      <directionalLight position={[-3, 2.2, -2.5]} intensity={2.6} color="#5fd3ff" />
      <directionalLight position={[3, 1, -2.5]} intensity={1.2} color="#7f9cff" />
      <directionalLight position={[0.5, -0.6, 2.5]} intensity={0.7} color="#ffcbb8" />
    </group>
  )
}

let lastInteraction = performance.now()
const markInteraction = () => {
  lastInteraction = performance.now()
}

const IDLE_AFTER_MS = 6000
const SWAY = { amplitude: 0.32, speed: 0.22, rampSeconds: 2.5 }

/**
 * After a few idle seconds, gently sway the camera around the current side
 * like a character-select screen. Any interaction or selection stops it.
 */
function useIdleSway(controls: RefObject<CameraControls | null>, selectedId: string | null) {
  const sway = useRef<{ base: number; t: number; offset: number } | null>(null)

  useEffect(() => {
    markInteraction()
  }, [selectedId])

  useEffect(() => {
    const stop = () => markInteraction()
    window.addEventListener('pointerdown', stop)
    window.addEventListener('wheel', stop, { passive: true })
    window.addEventListener('keydown', stop)
    return () => {
      window.removeEventListener('pointerdown', stop)
      window.removeEventListener('wheel', stop)
      window.removeEventListener('keydown', stop)
    }
  }, [])

  useFrame((_, delta) => {
    const c = controls.current
    if (!c) return
    const idle = performance.now() - lastInteraction > IDLE_AFTER_MS
    if (!idle) {
      sway.current = null
      return
    }
    const s = (sway.current ??= { base: c.azimuthAngle, t: 0, offset: 0 })
    s.t += delta
    const ramp = Math.min(1, s.t / SWAY.rampSeconds)
    const next = Math.sin(s.t * SWAY.speed * Math.PI * 2 * 0.25) * SWAY.amplitude * ramp * ramp
    void c.rotate(next - s.offset, 0, false)
    s.offset = next
  })
}

/** Start zoomed out and glide into the default framing once loaded. */
function InitialFraming({ controls }: { controls: RefObject<CameraControls | null> }) {
  useEffect(() => {
    const c = controls.current
    if (!c) return
    void c.setLookAt(0.9, BODY_CENTER_Y + 0.6, DISTANCE.overview + 1.4, 0, BODY_CENTER_Y, 0, false)
    void c.setLookAt(0, BODY_CENTER_Y, DISTANCE.overview, 0, BODY_CENTER_Y, 0, true)
  }, [controls])
  return null
}

const LINE_DRAW_SECONDS = 0.45
const projected = new Vector3()
const toCamera = new Vector3()

/**
 * Projects the anchor into screen space every frame and writes the leader
 * line straight to the SVG, so camera motion never re-renders React.
 * (.oxlintrc.json allows these per-frame mutations in this folder.)
 */
function useLeaderLine(
  anchor: RefObject<Anchor | null>,
  selectedId: string | null,
  leader: RefObject<LeaderElements>,
  target: RefObject<HTMLElement | null>,
) {
  const { camera, gl } = useThree()
  const state = useRef({ opacity: 0, drawn: 0, id: null as string | null })

  useFrame((_, delta) => {
    const { line, dot, end } = leader.current
    if (!line || !dot || !end) return
    const s = state.current
    const a = anchor.current

    if (s.id !== selectedId) {
      s.id = selectedId
      s.drawn = 0
    }

    let points: ReturnType<typeof leaderPoints> = null
    let facing = false
    if (a && selectedId && a.muscleId === selectedId && target.current) {
      toCamera.copy(camera.position).sub(a.point).normalize()
      facing = a.normal.dot(toCamera) > -0.05
      projected.copy(a.point).project(camera)
      const canvas = gl.domElement.getBoundingClientRect()
      const x = canvas.left + ((projected.x + 1) / 2) * canvas.width
      const y = canvas.top + ((1 - projected.y) / 2) * canvas.height
      const inView = projected.z < 1 && x >= canvas.left && x <= canvas.right && y >= canvas.top && y <= canvas.bottom
      if (inView) points = leaderPoints({ x, y }, target.current.getBoundingClientRect())
    }

    const visible = points !== null && facing
    s.opacity += ((visible ? 1 : 0) - s.opacity) * (1 - Math.exp(-delta * 10))
    if (visible) s.drawn = Math.min(1, s.drawn + delta / LINE_DRAW_SECONDS)

    const group = line.parentElement as SVGGElement | null
    if (group) group.style.opacity = s.opacity.toFixed(3)
    if (!points) return

    line.setAttribute('points', toSvgPoints(points))
    // Ease-out draw-on: dash offset runs from full length to zero.
    const eased = 1 - Math.pow(1 - s.drawn, 3)
    line.style.strokeDashoffset = (1 - eased).toFixed(3)
    dot.setAttribute('cx', points[0].x.toFixed(1))
    dot.setAttribute('cy', points[0].y.toFixed(1))
    const last = points[points.length - 1]
    end.setAttribute('cx', last.x.toFixed(1))
    end.setAttribute('cy', last.y.toFixed(1))
    end.style.opacity = eased > 0.98 ? '1' : '0'
  })
}

// Portalled to <body>: the stage panel's backdrop-filter would otherwise
// become the containing block for this fixed-position overlay.
function LeaderOverlay({ leader }: { leader: RefObject<LeaderElements> }) {
  return createPortal(
    <svg aria-hidden className="pointer-events-none fixed inset-0 z-20 h-dvh w-dvw overflow-visible">
      <g style={{ opacity: 0 }}>
        <polyline
          ref={(el) => {
            leader.current.line = el
          }}
          pathLength={1}
          strokeDasharray="1"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={1.5}
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 4px var(--color-accent))' }}
        />
        <circle
          ref={(el) => {
            leader.current.dot = el
          }}
          r={4}
          fill="var(--color-ink-950)"
          stroke="var(--color-accent)"
          strokeWidth={2}
          className="leader-dot"
        />
        <circle
          ref={(el) => {
            leader.current.end = el
          }}
          r={3}
          fill="var(--color-accent)"
        />
      </g>
    </svg>,
    document.body,
  )
}

function LoadingOverlay() {
  const { active, progress } = useProgress()
  if (!active) return null
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3" role="status">
      <p className="font-display text-sm font-semibold tracking-[0.3em] text-ink-300 uppercase">Loading anatomy</p>
      <div className="h-1 w-48 overflow-hidden rounded-full bg-ink-800">
        <div className="h-full bg-accent transition-[width] duration-200" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

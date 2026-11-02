import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { BodyView } from './api/anatomy'
import { useMuscles } from './api/queries'
import { Panel, SegmentedControl } from './components/ui'
import { viewForMuscle } from './features/body-3d/camera'
import { POSE_PRESETS, type Pose, type PosePreset } from './features/body-3d/posePresets'
import {
  DEFAULT_PROFILE,
  PROFILE_LIMITS,
  bodyShape,
  clampProfile,
  type BodyProfile,
  type Units,
} from './features/body-3d/profile'
import { BODY_STYLES, type BodyStyle } from './features/body-3d/styles'
import { supportsWebGL } from './features/body-3d/webgl'
import { BodyMap } from './features/body-map/BodyMap'
import { MuscleDetail } from './features/muscle-detail/MuscleDetail'
import { BodyProfilePanel } from './features/profile/BodyProfilePanel'
import { MuscleRoster } from './features/roster/MuscleRoster'
import { useStoredState } from './hooks/useStoredState'
import { THEMES, THEME_LIST, isThemeId, motivationFor, type ThemeId } from './theme/themes'

// three.js is large, so the 3D viewer loads in its own chunk.
const BodyViewer = lazy(() => import('./features/body-3d/BodyViewer'))

const VIEW_OPTIONS: { value: BodyView; label: string }[] = [
  { value: 'front', label: 'Front' },
  { value: 'back', label: 'Back' },
]

type Mode = 'explore' | 'pose'
const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: 'explore', label: 'Explore' },
  { value: 'pose', label: 'Pose' },
]

const isProfile = (v: unknown): v is BodyProfile => {
  if (typeof v !== 'object' || v === null) return false
  const p = v as Record<string, unknown>
  return (Object.keys(PROFILE_LIMITS) as (keyof BodyProfile)[]).every((k) => typeof p[k] === 'number')
}
const isStyle = (v: unknown): v is BodyStyle => BODY_STYLES.some((s) => s.value === v)
const isUnits = (v: unknown): v is Units => v === 'metric' || v === 'imperial'

export default function App() {
  const muscles = useMuscles()
  const [view, setView] = useState<BodyView>('front')
  const [selectedId, setSelectedId] = useState<string | null>('chest')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const detailRef = useRef<HTMLDivElement>(null)
  const [use3D] = useState(supportsWebGL)

  const [storedProfile, setProfile] = useStoredState('profile', DEFAULT_PROFILE, isProfile)
  const profile = clampProfile(storedProfile)
  const { heightCm, weightKg, age } = profile
  const shape = useMemo(() => bodyShape({ heightCm, weightKg, age }), [heightCm, weightKg, age])
  const [units, setUnits] = useStoredState<Units>('units', 'metric', isUnits)
  const [style, setStyle] = useStoredState<BodyStyle>('style', 'hologram', isStyle)

  const [themeId, setThemeId] = useStoredState<ThemeId>('theme', 'iron', isThemeId)
  const theme = THEMES[themeId]
  useEffect(() => {
    document.documentElement.dataset.theme = themeId
  }, [themeId])
  const [motivation] = useState(() => motivationFor(new Date()))

  const [mode, setMode] = useState<Mode>('explore')
  // A fresh object each time so re-picking the same preset re-applies it.
  const [pose, setPose] = useState<{ preset: PosePreset | 'custom'; pose: Pose }>({ preset: 'relaxed', pose: {} })
  const applyPreset = (preset: PosePreset) => setPose({ preset, pose: { ...POSE_PRESETS[preset].pose } })
  const onPoseEdited = useCallback(() => setPose((p) => ({ ...p, preset: 'custom' })), [])

  const byId = useMemo(() => new Map((muscles.data ?? []).map((m) => [m.id, m])), [muscles.data])
  const names = useMemo(() => Object.fromEntries([...byId].map(([id, m]) => [id, m.name])), [byId])

  const changeView = useCallback((next: BodyView) => {
    // A hovered muscle can vanish behind the figure without a pointerleave.
    setHoveredId(null)
    setView(next)
  }, [])

  // Selecting a muscle that isn't visible from the current side turns the figure.
  const select = useCallback(
    (id: string) => {
      setSelectedId(id)
      const muscle = byId.get(id)
      if (muscle) {
        const next = viewForMuscle(muscle.views, view)
        if (next !== view) changeView(next)
      }
    },
    [byId, view, changeView],
  )

  const focusName = hoveredId ? names[hoveredId] : selectedId ? names[selectedId] : undefined

  return (
    <div className="mx-auto flex min-h-dvh max-w-[1520px] flex-col px-4 py-5 lg:h-dvh lg:px-6">
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <p className="font-display text-xs font-bold tracking-[0.3em] text-accent uppercase">
            OneFit <span className="text-ink-400">·</span> <span className="text-ink-300">{theme.tagline}</span>
          </p>
          <h1 className="font-display text-3xl font-bold tracking-wide uppercase sm:text-4xl">Muscle Explorer</h1>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <p className="hidden font-display text-sm font-semibold tracking-wide text-ink-300 uppercase italic md:block">
            “{motivation}”
          </p>
          <ThemePicker value={themeId} onChange={setThemeId} />
        </div>
      </header>
      <div aria-hidden className="stripe-bar mt-3 h-1 rounded-full" />

      {muscles.isError ? (
        <Panel className="mt-6 p-6">
          <p className="font-semibold text-warm">Can't reach the OneFit API.</p>
          <p className="mt-1 text-sm text-ink-300">
            Start the backend with <code className="rounded bg-ink-800 px-1.5 py-0.5">cd backend && go run .</code> and
            reload. ({muscles.error.message})
          </p>
        </Panel>
      ) : (
        <main className="mt-5 grid min-h-0 flex-1 gap-4 lg:grid-cols-[250px_minmax(360px,1fr)_minmax(360px,420px)]">
          <div className="order-3 flex min-h-0 flex-col gap-4 lg:order-1">
            {use3D && (
              <BodyProfilePanel profile={profile} units={units} onChange={setProfile} onUnitsChange={setUnits} />
            )}
            <div className="min-h-0 flex-1">
              <MuscleRoster
                muscles={muscles.data ?? []}
                selectedId={selectedId}
                hoveredId={hoveredId}
                onSelect={select}
                onHover={setHoveredId}
              />
            </div>
          </div>

          <Panel className="relative order-1 flex h-[70dvh] min-h-[480px] flex-col overflow-hidden lg:order-2 lg:h-auto lg:min-h-0">
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 p-4">
              <SegmentedControl label="Body side" value={view} options={VIEW_OPTIONS} onChange={changeView} />
              <p
                className="truncate font-display text-lg font-semibold tracking-wider text-ink-100 uppercase drop-shadow"
                aria-live="polite"
              >
                {focusName ?? '—'}
              </p>
            </div>

            <div className="relative min-h-0 flex-1">
              {use3D ? (
                <Suspense fallback={<StageMessage>Loading 3D viewer…</StageMessage>}>
                  <BodyViewer
                    muscles={muscles.data ?? []}
                    selectedId={selectedId}
                    hoveredId={hoveredId}
                    view={view}
                    onSelect={setSelectedId}
                    onHover={setHoveredId}
                    onViewChange={changeView}
                    leaderTargetRef={detailRef}
                    style={style}
                    shape={shape}
                    mode={mode}
                    pose={pose.pose}
                    onPoseEdited={onPoseEdited}
                    theme={theme}
                  />
                </Suspense>
              ) : (
                <div className="flex h-full items-center justify-center p-4 pt-16">
                  <BodyMap
                    view={view}
                    selectedId={selectedId}
                    hoveredId={hoveredId}
                    names={names}
                    onSelect={select}
                    onHover={setHoveredId}
                  />
                </div>
              )}
            </div>

            {use3D ? (
              <StageToolbar
                mode={mode}
                onModeChange={setMode}
                preset={pose.preset}
                onPreset={applyPreset}
                style={style}
                onStyleChange={setStyle}
              />
            ) : (
              <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-ink-400">
                Click a muscle · switch sides to see the back
              </p>
            )}
          </Panel>

          <div ref={detailRef} className="order-2 min-h-0 lg:order-3">
            <MuscleDetail muscleId={selectedId} />
          </div>
        </main>
      )}

      <footer className="mt-3 text-center text-[11px] text-ink-400">
        3D anatomy: BodyParts3D, © The Database Center for Life Science, licensed under{' '}
        <a className="underline hover:text-ink-300" href="https://creativecommons.org/licenses/by/4.0/">
          CC BY 4.0
        </a>
        , simplified for the web.
      </footer>
    </div>
  )
}

function ThemePicker({ value, onChange }: { value: ThemeId; onChange: (t: ThemeId) => void }) {
  return (
    <div role="radiogroup" aria-label="Theme" className="flex items-center gap-1 rounded-xl border border-ink-700 bg-ink-900/80 p-1">
      {THEME_LIST.map((t) => (
        <button
          key={t.id}
          type="button"
          role="radio"
          aria-checked={value === t.id}
          onClick={() => onChange(t.id)}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-display text-xs font-semibold tracking-wider uppercase transition-colors ${
            value === t.id ? 'bg-ink-700 text-ink-100' : 'text-ink-400 hover:text-ink-100'
          }`}
        >
          <span aria-hidden className="size-2.5 rounded-full" style={{ background: t.accent, boxShadow: `0 0 8px ${t.accent}` }} />
          {t.label}
        </button>
      ))}
    </div>
  )
}

function StageToolbar({
  mode,
  onModeChange,
  preset,
  onPreset,
  style,
  onStyleChange,
}: {
  mode: Mode
  onModeChange: (m: Mode) => void
  preset: PosePreset | 'custom'
  onPreset: (p: PosePreset) => void
  style: BodyStyle
  onStyleChange: (s: BodyStyle) => void
}) {
  return (
    // Overlaid on the stage from `sm` up; below the canvas on phones so it
    // never covers the figure.
    <div className="relative z-10 flex flex-col gap-2 border-t border-ink-700/60 p-3 sm:pointer-events-none sm:absolute sm:inset-x-0 sm:bottom-0 sm:border-0 sm:p-4">
      <p className="hidden text-center text-xs text-ink-400 drop-shadow sm:block">
        {mode === 'pose'
          ? 'Drag an arm, leg or the torso to pose it · drag empty space to rotate'
          : 'Drag to rotate · pinch or scroll to zoom · tap a muscle'}
      </p>
      {mode === 'pose' && (
        <div className="pointer-events-auto flex flex-wrap justify-center gap-1.5" role="group" aria-label="Pose presets">
          {(Object.keys(POSE_PRESETS) as PosePreset[]).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={preset === p}
              onClick={() => onPreset(p)}
              className={`rounded-full border px-3 py-1 text-xs font-medium backdrop-blur transition-colors ${
                preset === p
                  ? 'border-accent/60 bg-accent-soft text-accent'
                  : 'border-ink-600 bg-ink-900/70 text-ink-300 hover:border-ink-400 hover:text-ink-100'
              }`}
            >
              {POSE_PRESETS[p].label}
            </button>
          ))}
        </div>
      )}
      <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-2">
        <SegmentedControl label="Viewer mode" value={mode} options={MODE_OPTIONS} onChange={onModeChange} />
        <div role="radiogroup" aria-label="Look" className="flex items-center gap-1 rounded-xl border border-ink-700 bg-ink-900/80 p-1 backdrop-blur">
          {BODY_STYLES.map((s) => (
            <button
              key={s.value}
              type="button"
              role="radio"
              aria-checked={style === s.value}
              title={s.hint}
              onClick={() => onStyleChange(s.value)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                style === s.value ? 'bg-ink-700 text-ink-100' : 'text-ink-400 hover:text-ink-100'
              }`}
            >
              <span aria-hidden className={`size-2.5 rounded-full ${STYLE_SWATCH[s.value]}`} />
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const STYLE_SWATCH: Record<BodyStyle, string> = {
  hologram: 'bg-gradient-to-br from-[#9a2c35] to-accent',
  anatomical: 'bg-gradient-to-br from-[#8f2b33] to-[#e9dcc3]',
  sculpt: 'bg-gradient-to-br from-[#b9c0cf] to-[#7d8599]',
}

function StageMessage({ children }: { children: ReactNode }) {
  return <div className="flex h-full items-center justify-center text-sm text-ink-400">{children}</div>
}

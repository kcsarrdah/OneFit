import { lazy, Suspense, useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import type { BodyView } from './api/anatomy'
import { useMuscles } from './api/queries'
import { Panel, SegmentedControl } from './components/ui'
import { viewForMuscle } from './features/body-3d/camera'
import { supportsWebGL } from './features/body-3d/webgl'
import { BodyMap } from './features/body-map/BodyMap'
import { MuscleDetail } from './features/muscle-detail/MuscleDetail'
import { MuscleRoster } from './features/roster/MuscleRoster'

// three.js is large, so the 3D viewer loads in its own chunk.
const BodyViewer = lazy(() => import('./features/body-3d/BodyViewer'))

const VIEW_OPTIONS: { value: BodyView; label: string }[] = [
  { value: 'front', label: 'Front' },
  { value: 'back', label: 'Back' },
]

export default function App() {
  const muscles = useMuscles()
  const [view, setView] = useState<BodyView>('front')
  const [selectedId, setSelectedId] = useState<string | null>('chest')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const detailRef = useRef<HTMLDivElement>(null)
  const [use3D] = useState(supportsWebGL)

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
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-xs font-bold tracking-[0.3em] text-accent uppercase">OneFit</p>
          <h1 className="font-display text-3xl font-bold tracking-wide sm:text-4xl">Muscle Explorer</h1>
        </div>
        <p className="hidden max-w-xs text-right text-sm text-ink-400 md:block">
          Pick a muscle to see how to strengthen it and keep it flexible.
        </p>
      </header>

      {muscles.isError ? (
        <Panel className="mt-6 p-6">
          <p className="font-semibold text-warm">Can't reach the OneFit API.</p>
          <p className="mt-1 text-sm text-ink-300">
            Start the backend with <code className="rounded bg-ink-800 px-1.5 py-0.5">cd backend && go run .</code> and
            reload. ({muscles.error.message})
          </p>
        </Panel>
      ) : (
        <main className="mt-5 grid min-h-0 flex-1 gap-4 lg:grid-cols-[220px_minmax(360px,1fr)_minmax(360px,420px)]">
          <div className="order-3 min-h-0 lg:order-1">
            <MuscleRoster
              muscles={muscles.data ?? []}
              selectedId={selectedId}
              hoveredId={hoveredId}
              onSelect={select}
              onHover={setHoveredId}
            />
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

            <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-ink-400">
              {use3D ? 'Drag to rotate · pinch or scroll to zoom · tap a muscle' : 'Click a muscle · switch sides to see the back'}
            </p>
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

function StageMessage({ children }: { children: ReactNode }) {
  return <div className="flex h-full items-center justify-center text-sm text-ink-400">{children}</div>
}

import { useMemo, useState } from 'react'
import type { BodyView } from './api/anatomy'
import { useMuscles } from './api/queries'
import { Panel, SegmentedControl } from './components/ui'
import { BodyMap } from './features/body-map/BodyMap'
import { musclesOnView } from './features/body-map/bodyPaths'
import { MuscleDetail } from './features/muscle-detail/MuscleDetail'
import { MuscleRoster } from './features/roster/MuscleRoster'

const VIEW_OPTIONS: { value: BodyView; label: string }[] = [
  { value: 'front', label: 'Front' },
  { value: 'back', label: 'Back' },
]

export default function App() {
  const muscles = useMuscles()
  const [view, setView] = useState<BodyView>('front')
  const [selectedId, setSelectedId] = useState<string | null>('chest')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const names = useMemo(
    () => Object.fromEntries((muscles.data ?? []).map((m) => [m.id, m.name])),
    [muscles.data],
  )

  // Selecting a muscle that isn't drawn on the current side turns the figure.
  const select = (id: string) => {
    setSelectedId(id)
    if (!musclesOnView(view).has(id)) {
      changeView(view === 'front' ? 'back' : 'front')
    }
  }

  const changeView = (next: BodyView) => {
    // The hovered muscle unmounts with the old figure without a pointerleave.
    setHoveredId(null)
    setView(next)
  }

  const focusName = hoveredId ? names[hoveredId] : selectedId ? names[selectedId] : undefined

  return (
    <div className="mx-auto flex min-h-dvh max-w-[1440px] flex-col px-4 py-5 lg:h-dvh lg:px-6">
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
        <main className="mt-5 grid min-h-0 flex-1 gap-4 lg:grid-cols-[240px_minmax(320px,1fr)_minmax(360px,440px)]">
          <div className="order-3 min-h-0 lg:order-1">
            <MuscleRoster
              muscles={muscles.data ?? []}
              selectedId={selectedId}
              hoveredId={hoveredId}
              onSelect={select}
              onHover={setHoveredId}
            />
          </div>

          <Panel className="relative order-1 flex min-h-[560px] flex-col items-center overflow-hidden p-4 lg:order-2 lg:min-h-0">
            <div className="flex w-full items-center justify-between gap-3">
              <SegmentedControl label="Body side" value={view} options={VIEW_OPTIONS} onChange={changeView} />
              <p className="truncate font-display text-lg font-semibold tracking-wider text-ink-100 uppercase" aria-live="polite">
                {focusName ?? '—'}
              </p>
            </div>

            <div className="relative mt-2 flex min-h-0 w-full flex-1 items-center justify-center">
              <div
                aria-hidden
                className="platform-ring pointer-events-none absolute bottom-[2%] h-40 w-72 rounded-full border border-accent/30 shadow-[0_0_60px_-10px_var(--color-accent)]"
              >
                <div className="absolute inset-6 rounded-full border border-dashed border-accent/20" />
              </div>
              <div key={view} className="figure-turn relative h-full max-h-[760px] w-full">
                <BodyMap
                  view={view}
                  selectedId={selectedId}
                  hoveredId={hoveredId}
                  names={names}
                  onSelect={select}
                  onHover={setHoveredId}
                />
              </div>
            </div>
            <p className="text-xs text-ink-400">Click a muscle · switch sides to see the back</p>
          </Panel>

          <div className="order-2 min-h-0 lg:order-3">
            <MuscleDetail muscleId={selectedId} />
          </div>
        </main>
      )}
    </div>
  )
}

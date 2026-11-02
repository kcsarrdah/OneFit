import { useMemo, useState } from 'react'
import type { BodyRegion, MuscleSummary } from '../../api/anatomy'
import { Panel } from '../../components/ui'

const REGION_LABELS: Record<BodyRegion, string> = {
  upper: 'Upper body',
  core: 'Core',
  lower: 'Lower body',
}

const REGION_ORDER: BodyRegion[] = ['upper', 'core', 'lower']

interface MuscleRosterProps {
  muscles: MuscleSummary[]
  selectedId: string | null
  hoveredId: string | null
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}

export function MuscleRoster({ muscles, selectedId, hoveredId, onSelect, onHover }: MuscleRosterProps) {
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = q
      ? muscles.filter(
          (m) => m.name.toLowerCase().includes(q) || m.scientific_names.some((n) => n.toLowerCase().includes(q)),
        )
      : muscles
    return REGION_ORDER.map((region) => ({
      region,
      muscles: matches.filter((m) => m.region === region),
    })).filter((g) => g.muscles.length > 0)
  }, [muscles, query])

  return (
    <Panel className="flex min-h-0 flex-col p-4 lg:h-full">
      <h2 className="font-display text-xs font-bold tracking-[0.2em] text-ink-400 uppercase">Muscle roster</h2>
      <label className="mt-3 block">
        <span className="sr-only">Search muscles</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="w-full rounded-lg border border-ink-700 bg-ink-950/60 px-3 py-2 text-sm text-ink-100 placeholder:text-ink-400 focus:border-accent/60 focus:outline-none"
        />
      </label>

      <nav aria-label="Muscles" className="mt-3 -mr-2 min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
        {groups.map((g) => (
          <div key={g.region}>
            <h3 className="mb-1.5 text-[11px] font-semibold tracking-wider text-ink-400 uppercase">
              {REGION_LABELS[g.region]}
            </h3>
            <ul className="space-y-1">
              {g.muscles.map((m) => {
                const selected = m.id === selectedId
                const hovered = m.id === hoveredId
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(m.id)}
                      onPointerEnter={() => onHover(m.id)}
                      onPointerLeave={() => onHover(null)}
                      aria-current={selected || undefined}
                      className={`group flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        selected
                          ? 'border-accent/50 bg-accent-soft text-ink-100'
                          : hovered
                            ? 'border-ink-600 bg-ink-800 text-ink-100'
                            : 'border-transparent text-ink-300 hover:border-ink-600 hover:bg-ink-800 hover:text-ink-100'
                      }`}
                    >
                      <span className="font-medium">{m.name}</span>
                      <span className="text-[10px] tracking-wider text-ink-400 uppercase">{m.views.join(' · ')}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
        {groups.length === 0 && <p className="text-sm text-ink-400">No muscles match “{query}”.</p>}
      </nav>
    </Panel>
  )
}

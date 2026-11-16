import { useMemo, useState, type ReactNode } from 'react'
import type { Difficulty, FlexibilityExercise, Muscle, StrengthExercise } from '../../api/anatomy'
import { useMuscle } from '../../api/queries'
import { Badge, Panel, SegmentedControl } from '../../components/ui'

type Tab = 'overview' | 'strength' | 'flexibility'

const TABS: { value: Tab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'strength', label: 'Strength' },
  { value: 'flexibility', label: 'Flexibility' },
]

export function MuscleDetail({ muscleId }: { muscleId: string | null }) {
  const { data: muscle, isPending, isError, error, refetch } = useMuscle(muscleId)

  if (muscleId === null) {
    return (
      <Panel className="flex h-full items-center justify-center p-8 text-center">
        <div>
          <p className="font-display text-2xl font-semibold tracking-wide">Select a muscle</p>
          <p className="mt-2 text-sm text-ink-300">Tap any muscle on the body or pick one from the roster.</p>
        </div>
      </Panel>
    )
  }

  if (isError) {
    return (
      <Panel className="p-6">
        <p className="font-semibold text-warm">Couldn't load this muscle.</p>
        <p className="mt-1 text-sm text-ink-300">{error.message}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-lg border border-ink-600 px-3 py-1.5 text-sm hover:bg-ink-800"
        >
          Try again
        </button>
      </Panel>
    )
  }

  if (isPending) {
    return (
      <Panel className="space-y-3 p-6" aria-busy="true">
        <div className="h-8 w-1/2 animate-pulse rounded bg-ink-800" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-ink-800" />
        <div className="h-20 animate-pulse rounded bg-ink-800" />
      </Panel>
    )
  }

  // Keyed so tab and filter state reset when the selection changes.
  return <MuscleDetailContent key={muscle.id} muscle={muscle} />
}

function MuscleDetailContent({ muscle }: { muscle: Muscle }) {
  const [tab, setTab] = useState<Tab>('overview')

  return (
    <Panel className="panel-enter flex min-h-0 flex-col lg:h-full">
      <header className="border-b border-ink-700/80 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">{muscle.region}</Badge>
          {muscle.views.map((v) => (
            <Badge key={v}>{v}</Badge>
          ))}
        </div>
        <h2 className="mt-3 font-display text-4xl leading-none font-bold tracking-wide">{muscle.name}</h2>
        <p className="mt-1.5 text-sm text-ink-400 italic">{muscle.scientific_names.join(' · ')}</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-300">{muscle.summary}</p>
        <div className="mt-4">
          <SegmentedControl label="Detail section" value={tab} options={TABS} onChange={setTab} />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {tab === 'overview' && <Overview muscle={muscle} />}
        {tab === 'strength' && <StrengthList exercises={muscle.strength} />}
        {tab === 'flexibility' && <FlexibilityList exercises={muscle.flexibility} />}
      </div>
    </Panel>
  )
}

function Overview({ muscle }: { muscle: Muscle }) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="section-title">What it does</h3>
        <ul className="mt-2 space-y-1.5 text-sm text-ink-300">
          {muscle.functions.map((f) => (
            <li key={f} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
              {f}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="section-title">Coach's notes</h3>
        <ul className="mt-2 space-y-2">
          {muscle.tips.map((t) => (
            <li key={t} className="rounded-lg border border-ink-700 bg-ink-800/60 p-3 text-sm text-ink-300">
              {t}
            </li>
          ))}
        </ul>
      </section>
      <section className="grid grid-cols-2 gap-3">
        <Stat label="Strength moves" value={muscle.strength.length} />
        <Stat label="Stretches & mobility" value={muscle.flexibility.length} />
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-950/40 p-3">
      <p className="font-display text-3xl font-bold text-accent">{value}</p>
      <p className="text-xs text-ink-400">{label}</p>
    </div>
  )
}

function StrengthList({ exercises }: { exercises: StrengthExercise[] }) {
  const [equipment, setEquipment] = useState<string>('all')
  const options = useMemo(() => [...new Set(exercises.map((e) => e.equipment))].sort(), [exercises])
  const shown = equipment === 'all' ? exercises : exercises.filter((e) => e.equipment === equipment)

  return (
    <div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by equipment">
        {['all', ...options].map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={equipment === o}
            onClick={() => setEquipment(o)}
            className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${
              equipment === o
                ? 'border-accent/60 bg-accent-soft text-accent'
                : 'border-ink-700 text-ink-300 hover:border-ink-600 hover:text-ink-100'
            }`}
          >
            {o}
          </button>
        ))}
      </div>
      <ul className="mt-4 space-y-3">
        {shown.map((e) => (
          <li key={e.name}>
            <ExerciseCard
              title={e.name}
              meta={
                <>
                  <Badge>{e.equipment}</Badge>
                  <DifficultyMeter level={e.difficulty} />
                </>
              }
              dose={e.prescription}
              cues={e.cues}
              videoUrl={e.video_url}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

const FLEX_TONE = { static: 'accent', dynamic: 'warm', mobility: 'neutral' } as const

function FlexibilityList({ exercises }: { exercises: FlexibilityExercise[] }) {
  return (
    <ul className="space-y-3">
      {exercises.map((e) => (
        <li key={e.name}>
          <ExerciseCard
            title={e.name}
            meta={<Badge tone={FLEX_TONE[e.type]}>{e.type}</Badge>}
            dose={e.duration}
            cues={e.cues}
            videoUrl={e.video_url}
          />
        </li>
      ))}
    </ul>
  )
}

function ExerciseCard({
  title,
  meta,
  dose,
  cues,
  videoUrl,
}: {
  title: string
  meta: ReactNode
  dose: string
  cues: string[]
  videoUrl?: string
}) {
  return (
    <article className="rounded-xl border border-ink-700 bg-ink-800/50 p-4 transition-colors hover:border-ink-600">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-display text-lg leading-tight font-semibold tracking-wide">{title}</h4>
        <span className="shrink-0 rounded-md bg-ink-950/60 px-2 py-1 font-mono text-xs text-accent">{dose}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div>
      <ol className="mt-3 space-y-1 text-sm text-ink-300">
        {cues.map((c, i) => (
          <li key={c} className="flex gap-2">
            <span className="font-mono text-xs leading-5 text-ink-400">{i + 1}</span>
            {c}
          </li>
        ))}
      </ol>
      {videoUrl && (
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Watch tutorial for ${title} (opens YouTube in a new tab)`}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-ink-600 bg-ink-950/50 px-2.5 py-1.5 text-xs font-medium text-ink-300 transition-colors hover:border-warm/60 hover:text-ink-100"
        >
          <PlayIcon />
          Watch tutorial
        </a>
      )}
    </article>
  )
}

const DIFFICULTY_LEVEL: Record<Difficulty, number> = { beginner: 1, intermediate: 2, advanced: 3 }

function DifficultyMeter({ level }: { level: Difficulty }) {
  const n = DIFFICULTY_LEVEL[level]
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-400 capitalize" title={`Difficulty: ${level}`}>
      <span className="flex gap-0.5" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span key={i} className={`h-2.5 w-1.5 rounded-sm ${i <= n ? 'bg-warm' : 'bg-ink-600'}`} />
        ))}
      </span>
      {level}
    </span>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 20 14" className="h-3 w-4" aria-hidden>
      <rect width="20" height="14" rx="4" fill="#ff3d3d" />
      <path d="M8 4l5 3-5 3z" fill="white" />
    </svg>
  )
}

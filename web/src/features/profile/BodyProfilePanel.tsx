import { useId, type CSSProperties } from 'react'
import { Panel } from '../../components/ui'
import {
  BODY_FAT_BANDS,
  DEFAULT_PROFILE,
  PROFILE_LIMITS,
  bmi,
  bmiCategory,
  bodyFatBand,
  composition,
  fatSiteThickness,
  fatStores,
  ffmiCategory,
  formatHeight,
  formatWeight,
  type BodyFatBand,
  type BodyProfile,
  type Units,
} from '../body-3d/profile'

interface BodyProfilePanelProps {
  profile: BodyProfile
  units: Units
  showFat: boolean
  onChange: (profile: BodyProfile) => void
  onUnitsChange: (units: Units) => void
  onShowFatChange: (show: boolean) => void
}

const TONE_TEXT: Record<BodyFatBand['tone'], string> = {
  warn: 'text-warm',
  caution: 'text-amber-300',
  good: 'text-accent',
  ok: 'text-ink-100',
}

const BMI_TONE = {
  Underweight: 'text-sky-300',
  'Healthy range': 'text-accent',
  Overweight: 'text-amber-300',
  Obese: 'text-warm',
} as const

// Body-fat slider track: one colour stop per band, so the ranges are visible.
const BAND_COLORS = ['#ff5a5a', '#ffb23d', '#c8ff2e', '#2ee6a0', '#8fa3c0', '#ffb23d', '#ff5a5a']
const FAT = PROFILE_LIMITS.bodyFatPct
const pctOf = (v: number) => ((v - FAT.min) / (FAT.max - FAT.min)) * 100
const BAND_TRACK = BODY_FAT_BANDS.map((b, i) => {
  const start = Math.max(0, pctOf(b.from))
  const end = i + 1 < BODY_FAT_BANDS.length ? pctOf(BODY_FAT_BANDS[i + 1].from) : 100
  return `${BAND_COLORS[i]} ${start}% ${end}%`
}).join(', ')

/** Bars are drawn against a fixed scale so they visibly grow with body fat. */
const SITE_SCALE_MM = 60

export function BodyProfilePanel({ profile, units, showFat, onChange, onUnitsChange, onShowFatChange }: BodyProfilePanelProps) {
  const bmiValue = bmi(profile)
  const { leanKg, fatKg, ffmi } = composition(profile)
  const band = bodyFatBand(profile.bodyFatPct)
  const stores = fatStores(profile)
  const { sites } = fatSiteThickness(profile)
  const bandIndex = BODY_FAT_BANDS.indexOf(band)
  const nextFrom = BODY_FAT_BANDS[bandIndex + 1]?.from
  const isDefault = (Object.keys(DEFAULT_PROFILE) as (keyof BodyProfile)[]).every((k) => profile[k] === DEFAULT_PROFILE[k])

  return (
    <Panel className="p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xs font-bold tracking-[0.2em] text-ink-400 uppercase">Your body</h2>
        <div role="radiogroup" aria-label="Units" className="flex rounded-md border border-ink-700 p-0.5 text-[10px] font-semibold">
          {(['metric', 'imperial'] as const).map((u) => (
            <button
              key={u}
              type="button"
              role="radio"
              aria-checked={units === u}
              onClick={() => onUnitsChange(u)}
              className={`rounded px-1.5 py-0.5 tracking-wider uppercase transition-colors ${
                units === u ? 'bg-ink-700 text-ink-100' : 'text-ink-400 hover:text-ink-300'
              }`}
            >
              {u === 'metric' ? 'cm·kg' : 'ft·lb'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <Slider
          label="Height"
          value={profile.heightCm}
          display={formatHeight(profile.heightCm, units)}
          {...PROFILE_LIMITS.heightCm}
          mark={DEFAULT_PROFILE.heightCm}
          onChange={(heightCm) => onChange({ ...profile, heightCm })}
        />
        <Slider
          label="Weight"
          value={profile.weightKg}
          display={formatWeight(profile.weightKg, units)}
          {...PROFILE_LIMITS.weightKg}
          mark={DEFAULT_PROFILE.weightKg}
          onChange={(weightKg) => onChange({ ...profile, weightKg })}
        />
        <Slider
          label="Body fat"
          value={profile.bodyFatPct}
          display={`${profile.bodyFatPct}%`}
          {...PROFILE_LIMITS.bodyFatPct}
          mark={DEFAULT_PROFILE.bodyFatPct}
          track={BAND_TRACK}
          onChange={(bodyFatPct) => onChange({ ...profile, bodyFatPct })}
        />
        <Slider
          label="Age"
          value={profile.age}
          display={`${profile.age} yrs`}
          {...PROFILE_LIMITS.age}
          mark={DEFAULT_PROFILE.age}
          onChange={(age) => onChange({ ...profile, age })}
        />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2">
        <Stat label="BMI" value={bmiValue.toFixed(1)} sub={bmiCategory(bmiValue)} subClass={BMI_TONE[bmiCategory(bmiValue)]} />
        <Stat
          label="FFMI"
          value={ffmi.toFixed(1)}
          sub={ffmiCategory(ffmi)}
          title="Fat-free mass index: muscle relative to height. ~25 is about the natural limit."
        />
        <Stat label="Lean mass" value={formatWeight(leanKg, units)} />
        <Stat label="Fat mass" value={formatWeight(fatKg, units)} />
      </dl>

      <section aria-labelledby="fat-map-title" className="mt-3 rounded-lg border border-ink-700 bg-ink-950/50 p-3">
        <div className="flex items-center justify-between gap-2">
          <h3 id="fat-map-title" className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-ink-400 uppercase">
            <span aria-hidden className="size-2.5 rounded-full bg-gradient-to-br from-[#fff0c4] to-[#f7a93a]" />
            Fat map
          </h3>
          <button
            type="button"
            role="switch"
            aria-checked={showFat}
            aria-label="Show fat layer on the model"
            onClick={() => onShowFatChange(!showFat)}
            className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-ink-300 uppercase"
          >
            Layer
            <span
              aria-hidden
              className={`relative h-4 w-7 rounded-full transition-colors ${showFat ? 'bg-[#f7a93a]' : 'bg-ink-700'}`}
            >
              <span
                className={`absolute top-0.5 size-3 rounded-full bg-ink-100 transition-transform ${showFat ? 'translate-x-3.5' : 'translate-x-0.5'}`}
              />
            </span>
          </button>
        </div>
        <ul className="mt-2.5 space-y-1.5" aria-label="Estimated fat thickness under the skin">
          {sites.map((site) => (
            <li key={site.label} className="grid grid-cols-[96px_1fr_40px] items-center gap-2 text-[11px]">
              <span className="truncate text-ink-300">{site.label}</span>
              <span aria-hidden className="h-1.5 overflow-hidden rounded-full bg-ink-800">
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-[#ffe9a8] to-[#f7a93a] transition-[width] duration-300"
                  style={{ width: `${Math.min(100, (site.mm / SITE_SCALE_MM) * 100)}%` }}
                />
              </span>
              <span className="text-right font-semibold text-ink-100 tabular-nums">{site.mm < 1 ? '<1' : Math.round(site.mm)} mm</span>
            </li>
          ))}
        </ul>
        <p className="mt-2.5 text-[11px] leading-snug text-ink-400">
          <span className="font-semibold text-ink-300">{stores.subcutaneousL.toFixed(1)} L</span> under the skin,{' '}
          <span className="font-semibold text-ink-300">{stores.visceralL.toFixed(1)} L</span> around the organs (it pushes the
          belly out). Muscle size comes only from lean mass, so the yellow layer is what you'd gain or lose.
        </p>
        <p className="mt-1.5 text-[10px] text-ink-400/80">
          Typical male pattern: belly and waist fill first and empty last. Women store more on hips and thighs.
        </p>
      </section>

      <section aria-live="polite" className="mt-3 rounded-lg border border-ink-700 bg-ink-950/50 p-3">
        <div className="flex items-baseline justify-between gap-2">
          <p className={`font-display text-base font-bold tracking-wide uppercase ${TONE_TEXT[band.tone]}`}>{band.label}</p>
          <p className="text-[11px] text-ink-400 tabular-nums">
            {band.from === 0 ? `< ${nextFrom}%` : nextFrom ? `${band.from}–${nextFrom - 1}%` : `${band.from}%+`}
          </p>
        </div>
        <ul className="mt-2 space-y-1 text-xs text-ink-300">
          {band.looks.map((l) => (
            <li key={l} className="flex gap-1.5">
              <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" />
              {l}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] leading-snug text-ink-400">{band.note}</p>
        <p className="mt-1.5 text-[10px] text-ink-400/80">Ranges are for men; women's are roughly 8–10 points higher.</p>
      </section>

      {!isDefault && (
        <button
          type="button"
          onClick={() => onChange(DEFAULT_PROFILE)}
          className="mt-2 w-full text-center text-[11px] text-ink-400 transition-colors hover:text-ink-100"
        >
          Reset to default body
        </button>
      )}
    </Panel>
  )
}

function Stat({
  label,
  value,
  sub,
  subClass = 'text-ink-400',
  title,
}: {
  label: string
  value: string
  sub?: string
  subClass?: string
  title?: string
}) {
  return (
    <div className="rounded-lg border border-ink-700 bg-ink-950/50 px-2.5 py-2" title={title}>
      <dt className="text-[10px] font-semibold tracking-wider text-ink-400 uppercase">{label}</dt>
      <dd className="font-display text-lg leading-tight font-bold tabular-nums">{value}</dd>
      {sub && <dd className={`text-[10px] font-semibold ${subClass}`}>{sub}</dd>}
    </div>
  )
}

function Slider({
  label,
  value,
  display,
  min,
  max,
  mark,
  track,
  onChange,
}: {
  label: string
  value: number
  display: string
  min: number
  max: number
  mark: number
  /** Optional custom track gradient stops (replaces the accent fill). */
  track?: string
  onChange: (v: number) => void
}) {
  const id = useId()
  const pct = ((value - min) / (max - min)) * 100
  const markPct = ((mark - min) / (max - min)) * 100
  const style = { '--fill': `${pct}%`, '--mark': `${markPct}%`, ...(track ? { '--bands': track } : {}) } as CSSProperties
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-xs font-medium text-ink-300">
          {label}
        </label>
        <span className="font-display text-sm font-semibold text-ink-100 tabular-nums">{display}</span>
      </div>
      <div className="relative mt-1.5">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          aria-valuetext={display}
          onChange={(e) => onChange(Number(e.target.value))}
          className={track ? 'range range-bands' : 'range'}
          style={style}
        />
      </div>
    </div>
  )
}

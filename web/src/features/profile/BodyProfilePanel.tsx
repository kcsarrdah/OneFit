import { useId, type CSSProperties } from 'react'
import { Panel } from '../../components/ui'
import {
  DEFAULT_PROFILE,
  PROFILE_LIMITS,
  bmi,
  bmiCategory,
  formatHeight,
  formatWeight,
  type BodyProfile,
  type Units,
} from '../body-3d/profile'

interface BodyProfilePanelProps {
  profile: BodyProfile
  units: Units
  onChange: (profile: BodyProfile) => void
  onUnitsChange: (units: Units) => void
}

const CATEGORY_TONE = {
  Underweight: 'text-sky-300',
  'Healthy range': 'text-accent',
  Overweight: 'text-amber-300',
  Obese: 'text-warm',
} as const

export function BodyProfilePanel({ profile, units, onChange, onUnitsChange }: BodyProfilePanelProps) {
  const value = bmi(profile)
  const category = bmiCategory(value)
  const isDefault =
    profile.heightCm === DEFAULT_PROFILE.heightCm &&
    profile.weightKg === DEFAULT_PROFILE.weightKg &&
    profile.age === DEFAULT_PROFILE.age

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
              className={`rounded px-1.5 py-0.5 uppercase tracking-wider transition-colors ${
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
          label="Age"
          value={profile.age}
          display={`${profile.age} yrs`}
          {...PROFILE_LIMITS.age}
          mark={DEFAULT_PROFILE.age}
          onChange={(age) => onChange({ ...profile, age })}
        />
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg border border-ink-700 bg-ink-950/50 px-3 py-2">
        <div>
          <p className="text-[10px] font-semibold tracking-wider text-ink-400 uppercase">BMI</p>
          <p className="font-display text-xl leading-none font-bold tabular-nums">{value.toFixed(1)}</p>
        </div>
        <p className={`text-right text-xs font-semibold ${CATEGORY_TONE[category]}`} aria-live="polite">
          {category}
        </p>
      </div>
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

function Slider({
  label,
  value,
  display,
  min,
  max,
  mark,
  onChange,
}: {
  label: string
  value: number
  display: string
  min: number
  max: number
  mark: number
  onChange: (v: number) => void
}) {
  const id = useId()
  const pct = ((value - min) / (max - min)) * 100
  const markPct = ((mark - min) / (max - min)) * 100
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
          className="range"
          style={{ '--fill': `${pct}%`, '--mark': `${markPct}%` } as CSSProperties}
        />
      </div>
    </div>
  )
}

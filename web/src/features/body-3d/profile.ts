/** The user's body, which reshapes the 3D figure. */
export interface BodyProfile {
  heightCm: number
  weightKg: number
  age: number
  bodyFatPct: number
}

export const PROFILE_LIMITS = {
  heightCm: { min: 140, max: 210 },
  weightKg: { min: 40, max: 160 },
  age: { min: 16, max: 90 },
  bodyFatPct: { min: 4, max: 45 },
} as const

/** Matches the source model: a 171 cm adult of average, fairly fit build. */
export const DEFAULT_PROFILE: BodyProfile = { heightCm: 171, weightKg: 70, age: 30, bodyFatPct: 15 }
const MODEL_HEIGHT_CM = 171
const MODEL_BODY_FAT = DEFAULT_PROFILE.bodyFatPct

/** Body composition: what the weight is made of. */
export function composition({ heightCm, weightKg, bodyFatPct }: BodyProfile) {
  const fatKg = (weightKg * bodyFatPct) / 100
  const leanKg = weightKg - fatKg
  const m = heightCm / 100
  // Fat-free mass index, normalised to 1.8 m (Kouri et al. 1995).
  const ffmi = leanKg / (m * m) + 6.1 * (1.8 - m)
  return { fatKg, leanKg, ffmi }
}

/** The source figure's own fat-free mass index; reshaping is relative to it. */
const MODEL_FFMI = composition(DEFAULT_PROFILE).ffmi

export type BmiCategory = 'Underweight' | 'Healthy range' | 'Overweight' | 'Obese'

export function bmi({ heightCm, weightKg }: BodyProfile): number {
  const m = heightCm / 100
  return weightKg / (m * m)
}

export function bmiCategory(value: number): BmiCategory {
  if (value < 18.5) return 'Underweight'
  if (value < 25) return 'Healthy range'
  if (value < 30) return 'Overweight'
  return 'Obese'
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
}

export interface BodyShape {
  /** 0..1 how sharply muscle separations show (1 = very lean). */
  definition: number
  /** 0..1 how soft and matte the surface looks from fat (1 = high body fat). */
  softness: number
  /** Vertical scale from the feet up. */
  scaleY: number
  /** Horizontal scale; taller people are a little broader, not proportionally. */
  scaleXZ: number
  /** Metres added (or removed) along each muscle's surface normal. */
  inflate: number
  /** Extra forward bulge around the abdomen at higher BMI, in metres. */
  belly: number
  /** Forward bend of the upper spine with age, in radians. */
  spineBend: number
  /** 0..1 loss of muscle colour saturation with age. */
  desaturate: number
}

/** Maps a profile to how the figure should be reshaped. */
export function bodyShape(profile: BodyProfile): BodyShape {
  const scaleY = profile.heightCm / MODEL_HEIGHT_CM
  const { ffmi } = composition(profile)
  const ageing = smoothstep(45, 88, profile.age)
  return {
    scaleY,
    scaleXZ: 1 + (scaleY - 1) * 0.35,
    // Lean mass builds muscle size; fat adds a soft layer over everything.
    // Muscle loss with age slightly offsets both.
    inflate:
      clamp((ffmi - MODEL_FFMI) * 0.0016, -0.006, 0.012) +
      clamp((profile.bodyFatPct - MODEL_BODY_FAT) * 0.00055, -0.004, 0.016) -
      ageing * 0.0025,
    belly: smoothstep(20, 42, profile.bodyFatPct) * 0.06,
    definition: smoothstep(30, 6, profile.bodyFatPct),
    softness: smoothstep(20, 40, profile.bodyFatPct),
    spineBend: ageing * ((11 * Math.PI) / 180),
    desaturate: ageing * 0.35,
  }
}

/** Rounds and clamps a (possibly partial or older) stored profile. */
export function clampProfile(p: Partial<BodyProfile>): BodyProfile {
  const full = { ...DEFAULT_PROFILE, ...p }
  const fix = (k: keyof BodyProfile) => clamp(Math.round(full[k]), PROFILE_LIMITS[k].min, PROFILE_LIMITS[k].max)
  return { heightCm: fix('heightCm'), weightKg: fix('weightKg'), age: fix('age'), bodyFatPct: fix('bodyFatPct') }
}

export interface BodyFatBand {
  label: string
  /** Inclusive lower bound, in percent (male ranges). */
  from: number
  /** What you'd typically see at this level. */
  looks: string[]
  /** Sustainability / health context. */
  note: string
  tone: 'warn' | 'good' | 'ok' | 'caution'
}

/**
 * Typical appearance by body fat for men. Women carry roughly 8–10 points
 * more essential fat, so shift the ranges up accordingly.
 */
export const BODY_FAT_BANDS: BodyFatBand[] = [
  {
    label: 'Stage lean',
    from: 0,
    looks: ['Striations across chest, shoulders and quads', 'Paper-thin skin, deep cuts between every muscle', 'Veins across abs, arms and legs'],
    note: 'Below ~6% is competition-day territory. Essential fat is ~3%: hormones, energy and mood suffer; not sustainable.',
    tone: 'warn',
  },
  {
    label: 'Shredded',
    from: 6,
    looks: ['Full six-pack and obliques', 'Clear separation between shoulder heads and chest', 'Visible veins on arms and lower abs'],
    note: 'Achievable for short phases with strict diet and training. Hard to hold year-round.',
    tone: 'caution',
  },
  {
    label: 'Athletic',
    from: 10,
    looks: ['Abs clearly visible, lower abs softer', 'Defined arms and shoulders', 'Some vascularity in the forearms'],
    note: 'The classic "fitness model" look. Sustainable with consistent training and eating.',
    tone: 'good',
  },
  {
    label: 'Fit',
    from: 14,
    looks: ['Upper abs outlined in good light', 'Muscle shape visible, edges softer', 'Little visible vascularity'],
    note: 'Healthy and easy to maintain for most active people.',
    tone: 'good',
  },
  {
    label: 'Average',
    from: 18,
    looks: ['Abs hidden, smooth midsection', 'Muscle outlines soft', 'Some fat on the waist and lower back'],
    note: 'Typical for many adults. Still within a healthy range.',
    tone: 'ok',
  },
  {
    label: 'Above average',
    from: 25,
    looks: ['Rounder belly and love handles', 'Little muscle definition', 'Softer chest and arms'],
    note: 'Health risks (blood pressure, insulin resistance) start rising above ~25%.',
    tone: 'caution',
  },
  {
    label: 'High',
    from: 32,
    looks: ['Fat over the whole body, prominent belly', 'Muscle shape not visible'],
    note: 'Associated with significantly higher health risks. Strength training plus a modest calorie deficit is the proven way down.',
    tone: 'warn',
  },
]

export function bodyFatBand(pct: number): BodyFatBand {
  return [...BODY_FAT_BANDS].reverse().find((b) => pct >= b.from) ?? BODY_FAT_BANDS[0]
}

export type FfmiCategory = 'Below average' | 'Average' | 'Athletic' | 'Very muscular' | 'Elite'

/** Rough male FFMI bands; ~25 is about the natural ceiling. */
export function ffmiCategory(ffmi: number): FfmiCategory {
  if (ffmi < 18) return 'Below average'
  if (ffmi < 20) return 'Average'
  if (ffmi < 22) return 'Athletic'
  if (ffmi < 24) return 'Very muscular'
  return 'Elite'
}

export type Units = 'metric' | 'imperial'

export function formatHeight(cm: number, units: Units): string {
  if (units === 'metric') return `${Math.round(cm)} cm`
  const totalIn = Math.round(cm / 2.54)
  return `${Math.floor(totalIn / 12)}′ ${totalIn % 12}″`
}

export function formatWeight(kg: number, units: Units): string {
  return units === 'metric' ? `${Math.round(kg)} kg` : `${Math.round(kg * 2.20462)} lb`
}

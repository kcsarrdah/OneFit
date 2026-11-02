/** The user's body, which reshapes the 3D figure. */
export interface BodyProfile {
  heightCm: number
  weightKg: number
  age: number
}

export const PROFILE_LIMITS = {
  heightCm: { min: 140, max: 210 },
  weightKg: { min: 40, max: 160 },
  age: { min: 16, max: 90 },
} as const

/** Matches the source model: a 171 cm adult of average build. */
export const DEFAULT_PROFILE: BodyProfile = { heightCm: 171, weightKg: 70, age: 30 }
const MODEL_HEIGHT_CM = 171
const MODEL_BMI = 23

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
  const b = bmi(profile)
  const ageing = smoothstep(45, 88, profile.age)
  return {
    scaleY,
    scaleXZ: 1 + (scaleY - 1) * 0.35,
    // Muscle loss with age slightly offsets bulk from weight.
    inflate: clamp((b - MODEL_BMI) * 0.0014, -0.007, 0.022) - ageing * 0.0025,
    belly: smoothstep(25, 42, b) * 0.055,
    spineBend: ageing * ((11 * Math.PI) / 180),
    desaturate: ageing * 0.35,
  }
}

export function clampProfile(p: BodyProfile): BodyProfile {
  return {
    heightCm: clamp(Math.round(p.heightCm), PROFILE_LIMITS.heightCm.min, PROFILE_LIMITS.heightCm.max),
    weightKg: clamp(Math.round(p.weightKg), PROFILE_LIMITS.weightKg.min, PROFILE_LIMITS.weightKg.max),
    age: clamp(Math.round(p.age), PROFILE_LIMITS.age.min, PROFILE_LIMITS.age.max),
  }
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

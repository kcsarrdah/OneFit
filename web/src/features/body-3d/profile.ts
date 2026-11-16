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

/** Essential fat (organs, nerves, marrow) in men, as a share of body weight. */
const ESSENTIAL_FAT = 0.03
/** Litres of adipose tissue per kg of fat (tissue is ~80% lipid, ~0.92 kg/L). */
const ADIPOSE_L_PER_KG = 1.3

/**
 * Where the fat is: essential fat stays in the organs; the rest is stored as
 * adipose tissue, mostly under the skin (subcutaneous) and partly around the
 * abdominal organs (visceral). Men's visceral share grows as they gain fat.
 */
export function fatStores(profile: BodyProfile) {
  const { fatKg } = composition(profile)
  const essentialKg = Math.min(fatKg, profile.weightKg * ESSENTIAL_FAT)
  const storedKg = fatKg - essentialKg
  const visceralShare = 0.08 + 0.1 * smoothstep(12, 35, profile.bodyFatPct)
  return {
    essentialKg,
    subcutaneousL: storedKg * (1 - visceralShare) * ADIPOSE_L_PER_KG,
    visceralL: storedKg * visceralShare * ADIPOSE_L_PER_KG,
  }
}

/** Body surface area in m² (Du Bois formula). */
export function bodySurfaceArea({ heightCm, weightKg }: BodyProfile): number {
  return 0.007184 * weightKg ** 0.425 * heightCm ** 0.725
}

export interface FatSite {
  label: string
  /** Thickness relative to the body's average (matches the 3D fat layer). */
  factor: number
}

/**
 * Typical male fat pattern, as relative thickness. These match the weights
 * baked into the 3D fat layer (scripts/lib/fatLayer.mjs), so the numbers
 * and the figure agree.
 */
export const FAT_SITES: FatSite[] = [
  { label: 'Belly', factor: 3.2 },
  { label: 'Love handles', factor: 2.6 },
  { label: 'Lower back', factor: 1.95 },
  { label: 'Thighs', factor: 1.1 },
  { label: 'Chest', factor: 1.55 },
  { label: 'Under the chin', factor: 1.55 },
  { label: 'Back of the arms', factor: 1.05 },
  { label: 'Calves & forearms', factor: 0.4 },
]

/** Estimated subcutaneous fat thickness at each site, in mm. */
export function fatSiteThickness(profile: BodyProfile) {
  // Litres per square metre is millimetres.
  const meanMm = fatStores(profile).subcutaneousL / bodySurfaceArea(profile)
  return { meanMm, sites: FAT_SITES.map((s) => ({ ...s, mm: meanMm * s.factor })) }
}

export interface BodyShape {
  /** Vertical scale from the feet up. */
  scaleY: number
  /** Horizontal scale; taller people are a little broader, not proportionally. */
  scaleXZ: number
  /** Metres added (or removed) along each muscle's surface normal (lean mass only). */
  inflate: number
  /** Adipose tissue under the skin, in litres: the 3D fat layer's volume. */
  subcutaneousL: number
  /** Adipose tissue around the organs, in litres: pushes the belly out. */
  visceralL: number
  /** Forward bend of the upper spine with age, in radians. */
  spineBend: number
  /** 0..1 loss of muscle colour saturation with age. */
  desaturate: number
}

/** Most a muscle surface may move along its normal, in metres. */
const MAX_INFLATE = 0.008

/** Maps a profile to how the figure should be reshaped. */
export function bodyShape(profile: BodyProfile): BodyShape {
  const scaleY = profile.heightCm / MODEL_HEIGHT_CM
  const { ffmi } = composition(profile)
  const ageing = smoothstep(45, 88, profile.age)
  const { subcutaneousL, visceralL } = fatStores(profile)
  return {
    scaleY,
    scaleXZ: 1 + (scaleY - 1) * 0.35,
    // Muscle size comes from lean mass only; fat is a separate layer.
    // Muscle loss with age slightly offsets it.
    // Saturates softly: past ~8 mm the thin forearm and calf shells split.
    inflate: MAX_INFLATE * Math.tanh(((ffmi - MODEL_FFMI) * 0.0016) / MAX_INFLATE) - ageing * 0.0025,
    subcutaneousL,
    visceralL,
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

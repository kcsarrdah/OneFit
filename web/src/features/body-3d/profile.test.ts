import { describe, expect, it } from 'vitest'
import {
  BODY_FAT_BANDS,
  DEFAULT_PROFILE,
  bmi,
  bmiCategory,
  bodyFatBand,
  bodyShape,
  clampProfile,
  composition,
  ffmiCategory,
  formatHeight,
  formatWeight,
} from './profile'

describe('bmi', () => {
  it('computes BMI and its category', () => {
    expect(bmi({ ...DEFAULT_PROFILE, heightCm: 180, weightKg: 81 })).toBeCloseTo(25)
    expect(bmiCategory(17)).toBe('Underweight')
    expect(bmiCategory(22)).toBe('Healthy range')
    expect(bmiCategory(27)).toBe('Overweight')
    expect(bmiCategory(33)).toBe('Obese')
  })
})

describe('bodyShape', () => {
  it('leaves the default profile almost unchanged', () => {
    const s = bodyShape(DEFAULT_PROFILE)
    expect(s.scaleY).toBe(1)
    expect(s.scaleXZ).toBe(1)
    expect(Math.abs(s.inflate)).toBeLessThan(0.002)
    expect(s.belly).toBe(0)
    expect(s.spineBend).toBe(0)
  })

  it('scales with height, but less in width than in height', () => {
    const tall = bodyShape({ ...DEFAULT_PROFILE, heightCm: 200 })
    expect(tall.scaleY).toBeGreaterThan(1.15)
    expect(tall.scaleXZ).toBeGreaterThan(1)
    expect(tall.scaleXZ).toBeLessThan(tall.scaleY)
  })

  it('adds muscle size with lean mass, within limits', () => {
    const heavy = bodyShape({ ...DEFAULT_PROFILE, weightKg: 100 })
    const light = bodyShape({ ...DEFAULT_PROFILE, weightKg: 50 })
    expect(heavy.inflate).toBeGreaterThan(0.005)
    expect(heavy.inflate).toBeLessThanOrEqual(0.028)
    expect(heavy.belly).toBe(0) // same body fat, so no belly
    expect(light.inflate).toBeLessThan(0)
  })

  it('separates fat from muscle: same weight, different body fat', () => {
    const lean = bodyShape({ ...DEFAULT_PROFILE, weightKg: 85, bodyFatPct: 8 })
    const soft = bodyShape({ ...DEFAULT_PROFILE, weightKg: 85, bodyFatPct: 32 })
    expect(lean.definition).toBeGreaterThan(0.9)
    expect(soft.definition).toBe(0)
    expect(soft.belly).toBeGreaterThan(lean.belly)
    expect(lean.belly).toBe(0)
  })

  it('bends posture and fades muscle tone with age', () => {
    const old = bodyShape({ ...DEFAULT_PROFILE, age: 85 })
    expect(old.spineBend).toBeGreaterThan(0.1)
    expect(old.desaturate).toBeGreaterThan(0.25)
    expect(bodyShape({ ...DEFAULT_PROFILE, age: 40 }).spineBend).toBe(0)
  })
})

describe('clampProfile', () => {
  it('rounds and clamps to supported ranges', () => {
    expect(clampProfile({ heightCm: 250.4, weightKg: 10, age: 45.6, bodyFatPct: 1 })).toEqual({
      heightCm: 210,
      weightKg: 40,
      age: 46,
      bodyFatPct: 4,
    })
  })

  it('fills in fields missing from older saved profiles', () => {
    expect(clampProfile({ heightCm: 180, weightKg: 80, age: 30 }).bodyFatPct).toBe(DEFAULT_PROFILE.bodyFatPct)
  })
})

describe('body composition', () => {
  it('splits weight into lean and fat mass', () => {
    const c = composition({ ...DEFAULT_PROFILE, weightKg: 80, bodyFatPct: 20 })
    expect(c.fatKg).toBeCloseTo(16)
    expect(c.leanKg).toBeCloseTo(64)
  })

  it('computes a normalised FFMI', () => {
    // 1.8 m, 81 kg, 10% fat -> lean 72.9 kg -> FFMI 22.5 (normalisation adds 0 at 1.8 m)
    expect(composition({ ...DEFAULT_PROFILE, heightCm: 180, weightKg: 81, bodyFatPct: 10 }).ffmi).toBeCloseTo(22.5, 1)
    expect(ffmiCategory(17)).toBe('Below average')
    expect(ffmiCategory(21)).toBe('Athletic')
    expect(ffmiCategory(25)).toBe('Elite')
  })

  it('describes every body fat level with an ordered band', () => {
    for (let i = 1; i < BODY_FAT_BANDS.length; i++) expect(BODY_FAT_BANDS[i].from).toBeGreaterThan(BODY_FAT_BANDS[i - 1].from)
    expect(bodyFatBand(5).label).toBe('Stage lean')
    expect(bodyFatBand(8).label).toBe('Shredded')
    expect(bodyFatBand(12).label).toBe('Athletic')
    expect(bodyFatBand(15).label).toBe('Fit')
    expect(bodyFatBand(20).label).toBe('Average')
    expect(bodyFatBand(28).label).toBe('Above average')
    expect(bodyFatBand(40).label).toBe('High')
  })
})

describe('formatting', () => {
  it('formats height and weight in both unit systems', () => {
    expect(formatHeight(180, 'metric')).toBe('180 cm')
    expect(formatHeight(180, 'imperial')).toBe('5′ 11″')
    expect(formatWeight(70, 'metric')).toBe('70 kg')
    expect(formatWeight(70, 'imperial')).toBe('154 lb')
  })
})

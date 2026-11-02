import { describe, expect, it } from 'vitest'
import { DEFAULT_PROFILE, bmi, bmiCategory, bodyShape, clampProfile, formatHeight, formatWeight } from './profile'

describe('bmi', () => {
  it('computes BMI and its category', () => {
    expect(bmi({ heightCm: 180, weightKg: 81, age: 30 })).toBeCloseTo(25)
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

  it('adds bulk and a belly with weight, within limits', () => {
    const heavy = bodyShape({ ...DEFAULT_PROFILE, weightKg: 160 })
    const light = bodyShape({ ...DEFAULT_PROFILE, weightKg: 40 })
    expect(heavy.inflate).toBeGreaterThan(0.01)
    expect(heavy.inflate).toBeLessThanOrEqual(0.022)
    expect(heavy.belly).toBeGreaterThan(0)
    expect(light.inflate).toBeLessThan(0)
    expect(light.inflate).toBeGreaterThanOrEqual(-0.007 - 0.0025)
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
    expect(clampProfile({ heightCm: 250.4, weightKg: 10, age: 45.6 })).toEqual({ heightCm: 210, weightKg: 40, age: 46 })
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

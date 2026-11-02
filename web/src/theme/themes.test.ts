import { describe, expect, it } from 'vitest'
import { MOTIVATION, THEMES, THEME_LIST, isThemeId, motivationFor } from './themes'

describe('themes', () => {
  it('defines valid hex colours for the 3D scene', () => {
    for (const t of THEME_LIST) {
      for (const c of [t.accent, t.accentDeep, t.sceneBg]) expect(c).toMatch(/^#[0-9a-f]{6}$/i)
      expect(THEMES[t.id]).toBe(t)
    }
  })

  it('validates stored theme ids', () => {
    expect(isThemeId('iron')).toBe(true)
    expect(isThemeId('light')).toBe(false)
    expect(isThemeId(42)).toBe(false)
  })
})

describe('motivationFor', () => {
  it('is stable within a day and changes between days', () => {
    const morning = motivationFor(new Date(2026, 10, 1, 7))
    const night = motivationFor(new Date(2026, 10, 1, 23))
    const tomorrow = motivationFor(new Date(2026, 10, 2, 7))
    expect(morning).toBe(night)
    expect(tomorrow).not.toBe(morning)
    expect(MOTIVATION).toContain(morning)
  })
})

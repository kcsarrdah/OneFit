// Dark, gym-inspired themes. Colours for the page live in index.css under
// [data-theme=...]; the 3D scene reads the same values from here.

export type ThemeId = 'iron' | 'volt' | 'steel' | 'hologram'

export interface Theme {
  id: ThemeId
  label: string
  tagline: string
  /** Main accent: selection, buttons, leader line, platform glow. */
  accent: string
  /** Darker accent for emissive glow. */
  accentDeep: string
  /** 3D background / fog colour. */
  sceneBg: string
}

export const THEMES: Record<ThemeId, Theme> = {
  iron: {
    id: 'iron',
    label: 'Iron',
    tagline: 'Forged in the weight room',
    accent: '#ff6a1f',
    accentDeep: '#8a2a05',
    sceneBg: '#0b0908',
  },
  volt: {
    id: 'volt',
    label: 'Volt',
    tagline: 'High voltage training',
    accent: '#c8ff2e',
    accentDeep: '#4a6b00',
    sceneBg: '#070807',
  },
  steel: {
    id: 'steel',
    label: 'Steel',
    tagline: 'Built rep by rep',
    accent: '#ff3d4a',
    accentDeep: '#7a0d16',
    sceneBg: '#080a10',
  },
  hologram: {
    id: 'hologram',
    label: 'Hologram',
    tagline: 'Know every muscle',
    accent: '#2ee6c5',
    accentDeep: '#0d8f7c',
    sceneBg: '#070a12',
  },
}

export const THEME_LIST = Object.values(THEMES)

/** Short motivational lines; one is shown per day. */
export const MOTIVATION = [
  'Strong is built one rep at a time.',
  'Show up. Lift. Recover. Repeat.',
  'The only bad workout is the one you skipped.',
  'Discipline outlasts motivation.',
  'Earn it under the bar.',
  'Move well, then move heavy.',
  'Small gains every day add up.',
]

export function motivationFor(date: Date): string {
  const start = Date.UTC(date.getFullYear(), 0, 0)
  const day = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - start) / 86_400_000)
  return MOTIVATION[day % MOTIVATION.length]
}

export const isThemeId = (v: unknown): v is ThemeId => typeof v === 'string' && v in THEMES

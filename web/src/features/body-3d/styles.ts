// Look options for the figure (no three.js, safe to import from the page).

export type BodyStyle = 'hologram' | 'anatomical' | 'sculpt'

export const BODY_STYLES: { value: BodyStyle; label: string; hint: string }[] = [
  { value: 'hologram', label: 'Hologram', hint: 'Muscles with a glowing x-ray skeleton' },
  { value: 'anatomical', label: 'Anatomy', hint: 'Textbook colours with ivory bone' },
  { value: 'sculpt', label: 'Sculpt', hint: 'Clean single-tone figure' },
]

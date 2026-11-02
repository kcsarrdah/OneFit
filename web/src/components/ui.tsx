import type { ReactNode } from 'react'

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-ink-700/80 bg-ink-900/70 shadow-[0_0_0_1px_#ffffff05_inset,0_20px_60px_-30px_#000] backdrop-blur ${className}`}
    >
      {children}
    </section>
  )
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'accent' | 'warm' }) {
  const tones = {
    neutral: 'border-ink-600 bg-ink-800 text-ink-300',
    accent: 'border-accent/40 bg-accent-soft text-accent',
    warm: 'border-warm/40 bg-warm/10 text-warm',
  }
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${tones[tone]}`}
    >
      {children}
    </span>
  )
}

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl border border-ink-700 bg-ink-900 p-1">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`rounded-lg px-4 py-1.5 font-display text-sm font-semibold tracking-wider uppercase transition-colors ${
              active ? 'bg-accent text-ink-950 shadow-[0_0_20px_-4px_var(--color-accent)]' : 'text-ink-300 hover:text-ink-100'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

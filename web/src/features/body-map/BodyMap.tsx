import { useId, type KeyboardEvent } from 'react'
import type { BodyView } from '../../api/anatomy'
import { FIGURES, VIEWBOX } from './bodyPaths'

interface BodyMapProps {
  view: BodyView
  selectedId: string | null
  hoveredId: string | null
  /** Display names keyed by muscle id, used for accessible labels. */
  names: Record<string, string>
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}

const MIRROR = `matrix(-1 0 0 1 ${VIEWBOX.width} 0)`

export function BodyMap({ view, selectedId, hoveredId, names, onSelect, onHover }: BodyMapProps) {
  const figure = FIGURES[view]
  const glowId = useId()

  const muscleState = (id: string) =>
    id === selectedId ? 'selected' : id === hoveredId ? 'hovered' : 'idle'

  const onKeyDown = (id: string) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(id)
    }
  }

  // Draws one half of the figure. The mirrored half is decorative for
  // assistive tech, so only the primary half is focusable.
  const half = (mirrored: boolean) => (
    <g transform={mirrored ? MIRROR : undefined} aria-hidden={mirrored || undefined}>
      <path d={figure.silhouette} className="fill-body-skin" />
      <path d={figure.head} className="fill-body-skin" />
      {figure.muscles.map((m) => {
        const state = muscleState(m.id)
        const label = names[m.id] ?? m.id
        return (
          <g
            key={m.id}
            data-muscle={m.id}
            data-state={state}
            className="muscle cursor-pointer outline-none"
            role={mirrored ? undefined : 'button'}
            tabIndex={mirrored ? -1 : 0}
            aria-label={mirrored ? undefined : label}
            aria-pressed={mirrored ? undefined : state === 'selected'}
            onClick={() => onSelect(m.id)}
            onKeyDown={onKeyDown(m.id)}
            onPointerEnter={() => onHover(m.id)}
            onPointerLeave={() => onHover(null)}
            onFocus={mirrored ? undefined : () => onHover(m.id)}
            onBlur={mirrored ? undefined : () => onHover(null)}
            filter={state === 'selected' ? `url(#${glowId})` : undefined}
          >
            {m.paths.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        )
      })}
      <g className="pointer-events-none fill-none stroke-body-detail" strokeWidth={0.6} strokeLinecap="round">
        {figure.details.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </g>
  )

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
      className="h-full w-full select-none"
      role="group"
      aria-label={`Body diagram, ${view} view`}
    >
      <defs>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {half(false)}
      {half(true)}
    </svg>
  )
}

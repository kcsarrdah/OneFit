import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import type { Muscle } from '../../api/anatomy'
import { BodyMap } from './BodyMap'
import { FIGURES } from './bodyPaths'

const names = { chest: 'Chest', glutes: 'Glutes' }

describe('BodyMap', () => {
  it('selects a muscle on click, from either side of the body', () => {
    const onSelect = vi.fn()
    const { container } = render(
      <BodyMap view="front" selectedId={null} hoveredId={null} names={names} onSelect={onSelect} onHover={() => {}} />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Chest' }))
    const [, mirrored] = container.querySelectorAll('[data-muscle="chest"]')
    fireEvent.click(mirrored)

    expect(onSelect).toHaveBeenCalledTimes(2)
    expect(onSelect).toHaveBeenNthCalledWith(2, 'chest')
  })

  it('exposes one focusable control per muscle and selects with the keyboard', async () => {
    const onSelect = vi.fn()
    render(
      <BodyMap view="back" selectedId="glutes" hoveredId={null} names={names} onSelect={onSelect} onHover={() => {}} />,
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(FIGURES.back.muscles.length)
    expect(screen.getByRole('button', { name: 'Glutes' })).toHaveAttribute('aria-pressed', 'true')

    screen.getByRole('button', { name: 'Glutes' }).focus()
    await userEvent.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledWith('glutes')
  })
})

describe('bodyPaths', () => {
  // The diagram and the backend content must agree on muscle ids and views.
  const muscles = JSON.parse(
    readFileSync(resolve(__dirname, '../../../../backend/data/muscles.json'), 'utf8'),
  ) as Muscle[]

  it.each(['front', 'back'] as const)('%s figure matches backend muscle views', (view) => {
    const drawn = FIGURES[view].muscles.map((m) => m.id).sort()
    const expected = muscles.filter((m) => m.views.includes(view)).map((m) => m.id).sort()
    expect(drawn).toEqual(expected)
  })
})

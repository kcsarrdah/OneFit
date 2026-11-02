import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Muscle } from './api/anatomy'
import App from './App'

const muscle = (m: Partial<Muscle> & Pick<Muscle, 'id' | 'name' | 'region' | 'views'>): Muscle => ({
  scientific_names: [],
  summary: `${m.name} summary`,
  functions: ['Does things'],
  tips: ['A tip'],
  strength: [],
  flexibility: [],
  ...m,
})

const MUSCLES: Muscle[] = [
  muscle({
    id: 'chest',
    name: 'Chest',
    region: 'upper',
    views: ['front'],
    strength: [
      { name: 'Push-ups', equipment: 'bodyweight', difficulty: 'beginner', prescription: '3 × 10', cues: ['Go'] },
      { name: 'Bench Press', equipment: 'barbell', difficulty: 'intermediate', prescription: '4 × 5', cues: ['Press'] },
    ],
    flexibility: [{ name: 'Doorway Stretch', type: 'static', duration: '30 s', cues: ['Lean'] }],
  }),
  muscle({ id: 'glutes', name: 'Glutes', region: 'lower', views: ['back'] }),
]

function mockApi() {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url = String(input)
    const json = (body: unknown, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
    if (url.endsWith('/api/anatomy/muscles')) return json({ muscles: MUSCLES, count: MUSCLES.length })
    const found = MUSCLES.find((m) => url.endsWith(`/api/anatomy/muscles/${m.id}`))
    return found ? json({ muscle: found }) : json({ error: 'Muscle not found' }, 404)
  })
}

function renderApp() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>,
  )
}

describe('App', () => {
  beforeEach(() => {
    mockApi()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows the default muscle and filters strength exercises by equipment', async () => {
    const user = userEvent.setup()
    renderApp()

    expect(await screen.findByRole('heading', { level: 2, name: 'Chest' })).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Strength' }))
    expect(screen.getByText('Push-ups')).toBeInTheDocument()
    expect(screen.getByText('Bench Press')).toBeInTheDocument()

    await user.click(within(screen.getByRole('group', { name: 'Filter by equipment' })).getByText('barbell'))
    expect(screen.queryByText('Push-ups')).not.toBeInTheDocument()
    expect(screen.getByText('Bench Press')).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Flexibility' }))
    expect(screen.getByText('Doorway Stretch')).toBeInTheDocument()
  })

  it('turns the figure around when a back-only muscle is picked from the roster', async () => {
    const user = userEvent.setup()
    renderApp()

    const roster = await screen.findByRole('navigation', { name: 'Muscles' })
    await user.click(await within(roster).findByRole('button', { name: /Glutes/ }))

    expect(screen.getByRole('radio', { name: 'Back' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('group', { name: 'Body diagram, back view' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { level: 2, name: 'Glutes' })).toBeInTheDocument()
  })

  it('falls back to the 2D body map when WebGL is unavailable', async () => {
    renderApp()
    expect(await screen.findByRole('group', { name: 'Body diagram, front view' })).toBeInTheDocument()
    expect(screen.getByText(/switch sides to see the back/)).toBeInTheDocument()
  })

  it('credits the 3D anatomy source', () => {
    renderApp()
    expect(screen.getByText(/BodyParts3D/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'CC BY 4.0' })).toHaveAttribute(
      'href',
      'https://creativecommons.org/licenses/by/4.0/',
    )
  })

  it('shows an error when the API is unreachable', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))
    renderApp()
    expect(await screen.findByText("Can't reach the OneFit API.")).toBeInTheDocument()
  })
})

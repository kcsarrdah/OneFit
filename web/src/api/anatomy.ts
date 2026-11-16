// Types mirror backend/models/muscle.go.

export type BodyView = 'front' | 'back'
export type BodyRegion = 'upper' | 'core' | 'lower'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type FlexibilityType = 'static' | 'dynamic' | 'mobility'

export interface MuscleSummary {
  id: string
  name: string
  scientific_names: string[]
  region: BodyRegion
  views: BodyView[]
  summary: string
}

export interface StrengthExercise {
  name: string
  equipment: string
  difficulty: Difficulty
  prescription: string
  cues: string[]
  /** How-to video: a curated video or a YouTube search for tutorials. */
  video_url: string
}

export interface FlexibilityExercise {
  name: string
  type: FlexibilityType
  duration: string
  cues: string[]
  video_url: string
}

export interface Muscle extends MuscleSummary {
  functions: string[]
  tips: string[]
  strength: StrengthExercise[]
  flexibility: FlexibilityExercise[]
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

async function getJSON<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { signal })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new ApiError(res.status, body?.error ?? `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

export async function fetchMuscles(signal?: AbortSignal): Promise<MuscleSummary[]> {
  const data = await getJSON<{ muscles: MuscleSummary[] }>('/api/anatomy/muscles', signal)
  return data.muscles
}

export async function fetchMuscle(id: string, signal?: AbortSignal): Promise<Muscle> {
  const data = await getJSON<{ muscle: Muscle }>(
    `/api/anatomy/muscles/${encodeURIComponent(id)}`,
    signal,
  )
  return data.muscle
}

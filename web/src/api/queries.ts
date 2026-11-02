import { queryOptions, useQuery } from '@tanstack/react-query'
import { fetchMuscle, fetchMuscles } from './anatomy'

// Anatomy content is static reference data, so cache it for the session.
const STATIC = { staleTime: Infinity, gcTime: Infinity } as const

export const musclesQuery = queryOptions({
  queryKey: ['anatomy', 'muscles'],
  queryFn: ({ signal }) => fetchMuscles(signal),
  ...STATIC,
})

export const muscleQuery = (id: string) =>
  queryOptions({
    queryKey: ['anatomy', 'muscles', id],
    queryFn: ({ signal }) => fetchMuscle(id, signal),
    ...STATIC,
  })

export function useMuscles() {
  return useQuery(musclesQuery)
}

export function useMuscle(id: string | null) {
  return useQuery({ ...muscleQuery(id ?? ''), enabled: id !== null })
}

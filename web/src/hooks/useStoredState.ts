import { useCallback, useState } from 'react'

const PREFIX = 'onefit:'

function read<T>(key: string, fallback: T, validate: (v: unknown) => v is T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw === null) return fallback
    const parsed: unknown = JSON.parse(raw)
    return validate(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

/**
 * useState that remembers its value in localStorage for this viewer.
 * Storage can be missing or blocked, so every access is guarded and the
 * fallback is used when the stored value is absent or invalid.
 */
export function useStoredState<T>(key: string, fallback: T, validate: (v: unknown) => v is T) {
  const [value, setValue] = useState<T>(() => read(key, fallback, validate))
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const v = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
        try {
          localStorage.setItem(PREFIX + key, JSON.stringify(v))
        } catch {
          // Storage unavailable (private mode, blocked): keep in memory only.
        }
        return v
      })
    },
    [key],
  )
  return [value, set] as const
}

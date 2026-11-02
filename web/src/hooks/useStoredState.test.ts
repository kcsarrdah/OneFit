import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useStoredState } from './useStoredState'

const isNumber = (v: unknown): v is number => typeof v === 'number'

describe('useStoredState', () => {
  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('persists values and restores them on the next mount', () => {
    const first = renderHook(() => useStoredState('n', 1, isNumber))
    act(() => first.result.current[1](5))
    expect(first.result.current[0]).toBe(5)
    first.unmount()

    const second = renderHook(() => useStoredState('n', 1, isNumber))
    expect(second.result.current[0]).toBe(5)
  })

  it('ignores invalid stored values', () => {
    localStorage.setItem('onefit:n', JSON.stringify('nope'))
    const { result } = renderHook(() => useStoredState('n', 1, isNumber))
    expect(result.current[0]).toBe(1)
  })

  it('keeps working when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const { result } = renderHook(() => useStoredState('n', 1, isNumber))
    expect(result.current[0]).toBe(1)
    act(() => result.current[1]((v) => v + 1))
    expect(result.current[0]).toBe(2)
  })
})

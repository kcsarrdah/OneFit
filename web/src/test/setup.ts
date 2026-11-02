import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom has no WebGL; behave like a browser without it (the app falls back
// to the 2D body map) instead of logging "not implemented" errors.
HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext

afterEach(() => {
  cleanup()
})

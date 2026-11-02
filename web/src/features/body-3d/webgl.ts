let supported: boolean | undefined

/** Whether this browser can create a WebGL2 context (cached). */
export function supportsWebGL(): boolean {
  if (supported !== undefined) return supported
  try {
    const canvas = document.createElement('canvas')
    supported = !!canvas.getContext('webgl2')
  } catch {
    supported = false
  }
  return supported
}

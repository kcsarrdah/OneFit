/**
 * Node naming contract for public/models/body.glb, produced by
 * scripts/build-body-model.mjs:
 *
 *   muscle-<muscleId>-<l|r|c>  selectable muscle group, one node per side
 *   context                    other muscles, rendered but not selectable
 *   bones                      the skeleton, joined into one mesh
 *
 * Names avoid ':' '.' '/' and brackets, which three's GLTFLoader strips.
 */

export const MODEL_URL = '/models/body.glb'

export type Side = 'l' | 'r' | 'c'

export type ModelNode =
  | { kind: 'muscle'; muscleId: string; side: Side }
  | { kind: 'context' }
  | { kind: 'bones' }
  | { kind: 'unknown' }

export function parseNodeName(name: string): ModelNode {
  if (name === 'bones') return { kind: 'bones' }
  if (name === 'context') return { kind: 'context' }
  const m = /^muscle-([a-z0-9-]+)-([lrc])$/.exec(name)
  if (m) return { kind: 'muscle', muscleId: m[1], side: m[2] as Side }
  return { kind: 'unknown' }
}

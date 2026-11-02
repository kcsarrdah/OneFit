/**
 * Node naming contract for public/models/body.glb, produced by
 * scripts/build-body-model.mjs:
 *
 *   muscle-<muscleId>-<l|r|c>  selectable muscle group, one node per side
 *   context                    other muscles, rendered but not selectable
 *   bones                      the skeleton (minus the skull), joined into one mesh
 *   head                       a sculpted, faceless head shaped on the skull
 *   joint-<name>               rig joints (scripts/lib/rig.mjs), driving the skin
 *
 * Names avoid ':' '.' '/' and brackets, which three's GLTFLoader strips.
 */

export const MODEL_URL = '/models/body.glb'

export type Side = 'l' | 'r' | 'c'

export type ModelNode =
  | { kind: 'muscle'; muscleId: string; side: Side }
  | { kind: 'context' }
  | { kind: 'bones' }
  | { kind: 'head' }
  | { kind: 'joint'; joint: string }
  | { kind: 'unknown' }

export function parseNodeName(name: string): ModelNode {
  if (name === 'bones') return { kind: 'bones' }
  if (name === 'head') return { kind: 'head' }
  if (name === 'context') return { kind: 'context' }
  const j = /^joint-([a-z]+(?:-[lr])?)$/.exec(name)
  if (j) return { kind: 'joint', joint: j[1] }
  const m = /^muscle-([a-z0-9-]+)-([lrc])$/.exec(name)
  if (m) return { kind: 'muscle', muscleId: m[1], side: m[2] as Side }
  return { kind: 'unknown' }
}

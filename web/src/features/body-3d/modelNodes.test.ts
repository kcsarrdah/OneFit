import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Muscle } from '../../api/anatomy'
import { parseNodeName } from './modelNodes'
import { POSABLE_JOINTS } from './posePresets'

describe('parseNodeName', () => {
  it('parses muscle nodes, including hyphenated ids', () => {
    expect(parseNodeName('muscle-upper-back-l')).toEqual({ kind: 'muscle', muscleId: 'upper-back', side: 'l' })
    expect(parseNodeName('muscle-chest-r')).toEqual({ kind: 'muscle', muscleId: 'chest', side: 'r' })
  })

  it('recognises bones and context meshes', () => {
    expect(parseNodeName('bones')).toEqual({ kind: 'bones' })
    expect(parseNodeName('context')).toEqual({ kind: 'context' })
    expect(parseNodeName('head')).toEqual({ kind: 'head' })
  })

  it('recognises rig joints', () => {
    expect(parseNodeName('joint-shoulder-l')).toEqual({ kind: 'joint', joint: 'shoulder-l' })
    expect(parseNodeName('joint-spine')).toEqual({ kind: 'joint', joint: 'spine' })
  })

  it('rejects anything else', () => {
    expect(parseNodeName('muscle:chest:l')).toEqual({ kind: 'unknown' })
    expect(parseNodeName('muscle-chest-x')).toEqual({ kind: 'unknown' })
  })
})

interface GltfJson {
  nodes: { name?: string; mesh?: number; skin?: number }[]
  skins: { joints: number[] }[]
}

/** Reads the GLB's JSON chunk without decoding geometry. */
function glbJson(path: string): GltfJson {
  const buf = readFileSync(path)
  expect(buf.toString('ascii', 0, 4)).toBe('glTF')
  const jsonLength = buf.readUInt32LE(12)
  expect(buf.toString('ascii', 16, 20)).toBe('JSON')
  return JSON.parse(buf.toString('utf8', 20, 20 + jsonLength)) as GltfJson
}

describe('public/models/body.glb', () => {
  const gltf = glbJson(resolve(__dirname, '../../../public/models/body.glb'))
  const names = gltf.nodes.map((n) => n.name ?? '')

  it('is rigged: every mesh is skinned to the full set of joints', () => {
    // Position quantization gives each mesh its own skin (its own inverse
    // bind matrices), all sharing the same joint nodes.
    for (const n of gltf.nodes) {
      if (n.mesh === undefined) continue
      expect(n.skin, n.name).toBeDefined()
      const jointNames = gltf.skins[n.skin!].joints.map((i) => names[i])
      for (const j of ['root', ...POSABLE_JOINTS]) expect(jointNames, n.name).toContain(`joint-${j}`)
    }
  })
  const muscles = JSON.parse(
    readFileSync(resolve(__dirname, '../../../../backend/data/muscles.json'), 'utf8'),
  ) as Muscle[]

  it('only contains nodes the viewer understands', () => {
    for (const name of names) expect(parseNodeName(name).kind, name).not.toBe('unknown')
  })

  it('has a sculpted head instead of a skull', () => {
    expect(names).toContain('head')
  })

  it('has a left and right mesh for every muscle the API serves', () => {
    for (const m of muscles) {
      const sides = names
        .map(parseNodeName)
        .filter((n) => n.kind === 'muscle' && n.muscleId === m.id)
        .map((n) => (n.kind === 'muscle' ? n.side : null))
      expect(sides, m.id).toContain('l')
      expect(sides, m.id).toContain('r')
    }
  })

  it('has no muscle meshes the API does not know about', () => {
    const ids = new Set(muscles.map((m) => m.id))
    for (const n of names.map(parseNodeName)) if (n.kind === 'muscle') expect(ids.has(n.muscleId), n.muscleId).toBe(true)
  })
})

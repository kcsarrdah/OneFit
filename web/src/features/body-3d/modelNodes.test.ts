import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Muscle } from '../../api/anatomy'
import { parseNodeName } from './modelNodes'

describe('parseNodeName', () => {
  it('parses muscle nodes, including hyphenated ids', () => {
    expect(parseNodeName('muscle-upper-back-l')).toEqual({ kind: 'muscle', muscleId: 'upper-back', side: 'l' })
    expect(parseNodeName('muscle-chest-r')).toEqual({ kind: 'muscle', muscleId: 'chest', side: 'r' })
  })

  it('recognises bones and context meshes', () => {
    expect(parseNodeName('bones')).toEqual({ kind: 'bones' })
    expect(parseNodeName('context')).toEqual({ kind: 'context' })
  })

  it('rejects anything else', () => {
    expect(parseNodeName('muscle:chest:l')).toEqual({ kind: 'unknown' })
    expect(parseNodeName('muscle-chest-x')).toEqual({ kind: 'unknown' })
  })
})

/** Reads node names from the GLB's JSON chunk without decoding geometry. */
function glbNodeNames(path: string): string[] {
  const buf = readFileSync(path)
  expect(buf.toString('ascii', 0, 4)).toBe('glTF')
  const jsonLength = buf.readUInt32LE(12)
  expect(buf.toString('ascii', 16, 20)).toBe('JSON')
  const json = JSON.parse(buf.toString('utf8', 20, 20 + jsonLength)) as { nodes: { name?: string }[] }
  return json.nodes.map((n) => n.name ?? '')
}

describe('public/models/body.glb', () => {
  const names = glbNodeNames(resolve(__dirname, '../../../public/models/body.glb'))
  const muscles = JSON.parse(
    readFileSync(resolve(__dirname, '../../../../backend/data/muscles.json'), 'utf8'),
  ) as Muscle[]

  it('only contains nodes the viewer understands', () => {
    for (const name of names) expect(parseNodeName(name).kind, name).not.toBe('unknown')
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

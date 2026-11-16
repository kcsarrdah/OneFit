import { describe, expect, it } from 'vitest'
import { JOINTS, boneJoint, skinAttributes, vertexWeights } from './rig.mjs'

// Joint positions roughly matching the built model (metres).
const joints = {
  root: [0, 0, 0],
  spine: [0, 1.12, -0.05],
  'shoulder-l': [0.153, 1.383, -0.03],
  'elbow-l': [0.209, 1.116, -0.04],
  'wrist-l': [0.251, 0.885, 0.005],
  'shoulder-r': [-0.153, 1.383, -0.03],
  'elbow-r': [-0.209, 1.116, -0.04],
  'wrist-r': [-0.251, 0.885, 0.005],
  'hip-l': [0.081, 0.886, -0.03],
  'knee-l': [0.075, 0.446, -0.034],
  'ankle-l': [0.069, 0.077, -0.035],
  'hip-r': [-0.081, 0.886, -0.03],
  'knee-r': [-0.075, 0.446, -0.034],
  'ankle-r': [-0.069, 0.077, -0.035],
}
const name = (i) => JOINTS[Number(i)].name

describe('boneJoint', () => {
  it('binds limb bones to the joint they rotate about', () => {
    expect(boneJoint('humerus', 'l')).toBe('shoulder-l')
    expect(boneJoint('ulna', 'r')).toBe('elbow-r')
    expect(boneJoint('distal-phalanx-of-thumb', 'l')).toBe('wrist-l')
    expect(boneJoint('femur', 'r')).toBe('hip-r')
    expect(boneJoint('patella', 'l')).toBe('knee-l')
    expect(boneJoint('calcaneus', 'r')).toBe('ankle-r')
  })

  it('keeps the trunk and the shoulder blade off the arm chain', () => {
    expect(boneJoint('scapula', 'l')).toBe('spine')
    expect(boneJoint('fifth-rib', 'r')).toBe('spine')
    expect(boneJoint('sacrum', 'l')).toBe('root')
    expect(boneJoint('fifth-lumbar-vertebra', 'l')).toBe('root')
  })
})

describe('vertexWeights', () => {
  const sum = (w) => Object.values(w).reduce((a, b) => a + b, 0)

  it('always sums to one', () => {
    for (const [p, hint] of [
      [[0.2, 1.25, 0], 'arm'],
      [[0.17, 1.4, 0], 'shoulder'],
      [[0.08, 0.6, 0], 'leg'],
      [[0.1, 0.95, -0.08], 'hip'],
      [[0, 1.3, 0.1], 'torso'],
    ])
      expect(sum(vertexWeights(p, hint, joints))).toBeCloseTo(1)
  })

  it('splits the arm at the elbow', () => {
    const upper = vertexWeights([0.19, 1.25, -0.03], 'arm', joints)
    const fore = vertexWeights([0.23, 1.0, -0.02], 'arm', joints)
    expect(name(Object.keys(upper).sort((a, b) => upper[b] - upper[a])[0])).toBe('shoulder-l')
    expect(name(Object.keys(fore).sort((a, b) => fore[b] - fore[a])[0])).toBe('elbow-l')
  })

  it('uses the correct side', () => {
    const w = vertexWeights([-0.08, 0.6, 0], 'leg', joints)
    expect(Object.keys(w).map(name)).toContain('hip-r')
    expect(Object.keys(w).map(name)).not.toContain('hip-l')
  })

  it('leaves torso muscles on the trunk', () => {
    const w = vertexWeights([0.05, 1.3, 0.12], 'torso', joints)
    expect(Object.keys(w).map(name)).toEqual(['spine'])
  })
})

describe('skinAttributes', () => {
  it('binds rigid vertices to a single joint with full weight', () => {
    const { joints: j, weights } = skinAttributes(new Float32Array([0.2, 1.2, 0]), null, joints, () => 'elbow-l')
    expect(name(j[0])).toBe('elbow-l')
    expect([...weights]).toEqual([1, 0, 0, 0])
  })
})

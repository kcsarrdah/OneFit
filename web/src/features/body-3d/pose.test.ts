import { Euler, MathUtils, Quaternion, Vector3 } from 'three'
import { describe, expect, it } from 'vitest'
import { POSABLE_JOINTS, POSE_PRESETS, clampJointDegrees, clampJointQuaternion, dragJointFor, poseQuaternions } from './pose'

describe('presets', () => {
  it('only reference real joints and stay within joint limits', () => {
    for (const { pose } of Object.values(POSE_PRESETS)) {
      for (const [joint, deg] of Object.entries(pose)) {
        expect(POSABLE_JOINTS).toContain(joint)
        expect(clampJointDegrees(joint as never, deg as [number, number, number])).toEqual(deg)
      }
    }
  })

  it('mirror the arms: raising both arms sideways moves them apart', () => {
    const q = poseQuaternions(POSE_PRESETS.tpose.pose)
    const down = new Vector3(0, -1, 0)
    const left = down.clone().applyQuaternion(q['shoulder-l'])
    const right = down.clone().applyQuaternion(q['shoulder-r'])
    expect(left.x).toBeGreaterThan(0.9) // body's left is +X
    expect(right.x).toBeLessThan(-0.9)
  })

  it('bends knees backwards and hips forwards in a squat', () => {
    const q = poseQuaternions(POSE_PRESETS.squat.pose)
    const thigh = new Vector3(0, -1, 0).applyQuaternion(q['hip-l'])
    expect(thigh.z).toBeGreaterThan(0.9) // thigh points forward (+Z)
    const shin = new Vector3(0, -1, 0).applyQuaternion(q['knee-l'])
    expect(shin.z).toBeLessThan(-0.9) // shin folds back relative to the thigh
  })

  it('rest pose is identity everywhere', () => {
    for (const q of Object.values(poseQuaternions({}))) expect(q.equals(new Quaternion())).toBe(true)
  })
})

describe('joint limits', () => {
  it('stops knees bending forwards', () => {
    expect(clampJointDegrees('knee-l', [-40, 10, 10])).toEqual([0, 0, 0])
  })

  it('mirrors side-specific limits for the right side', () => {
    expect(clampJointDegrees('shoulder-l', [0, 0, 170])).toEqual([0, 0, 170])
    expect(clampJointDegrees('shoulder-r', [0, 0, -170])).toEqual([0, 0, -170])
    expect(clampJointDegrees('shoulder-r', [0, 0, 170])).toEqual([0, 0, 30])
  })

  it('clamps quaternions', () => {
    const q = new Quaternion().setFromEuler(new Euler(MathUtils.degToRad(-90), 0, 0))
    const e = new Euler().setFromQuaternion(clampJointQuaternion('knee-l', q))
    expect(MathUtils.radToDeg(e.x)).toBeCloseTo(0)
  })
})

describe('dragJointFor', () => {
  it('maps skin joints to draggable joints', () => {
    expect(dragJointFor('elbow-l')).toBe('elbow-l')
    expect(dragJointFor('root')).toBeNull()
    expect(dragJointFor('nope')).toBeNull()
  })
})

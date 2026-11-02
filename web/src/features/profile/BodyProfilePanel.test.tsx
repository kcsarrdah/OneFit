import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { DEFAULT_PROFILE, type BodyProfile, type Units } from '../body-3d/profile'
import { BodyProfilePanel } from './BodyProfilePanel'

function Harness() {
  const [profile, setProfile] = useState<BodyProfile>(DEFAULT_PROFILE)
  const [units, setUnits] = useState<Units>('metric')
  return <BodyProfilePanel profile={profile} units={units} onChange={setProfile} onUnitsChange={setUnits} />
}

describe('BodyProfilePanel', () => {
  it('updates values, BMI and category as sliders move', () => {
    render(<Harness />)
    expect(screen.getByText('171 cm')).toBeInTheDocument()
    expect(screen.getByText('Healthy range')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Weight'), { target: { value: '110' } })
    expect(screen.getByText('110 kg')).toBeInTheDocument()
    expect(screen.getByText('37.6')).toBeInTheDocument()
    expect(screen.getByText('Obese')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '64' } })
    expect(screen.getByText('64 yrs')).toBeInTheDocument()
  })

  it('explains the current body fat range and composition', () => {
    render(<Harness />)
    expect(screen.getByText('Fit')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Body fat'), { target: { value: '8' } })
    expect(screen.getByText('8%')).toBeInTheDocument()
    expect(screen.getByText('Shredded')).toBeInTheDocument()
    expect(screen.getByText('Full six-pack and obliques')).toBeInTheDocument()
    expect(screen.getByText('64 kg')).toBeInTheDocument() // lean mass at 70 kg, 8%
    expect(screen.getByText('6 kg')).toBeInTheDocument() // fat mass

    fireEvent.change(screen.getByLabelText('Body fat'), { target: { value: '35' } })
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('switches units without changing the body', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('radio', { name: 'ft·lb' }))
    expect(screen.getByText('5′ 7″')).toBeInTheDocument()
    expect(screen.getByText('154 lb')).toBeInTheDocument()
    expect(screen.getByLabelText('Height')).toHaveAttribute('aria-valuetext', '5′ 7″')
  })

  it('offers a reset only after a change', async () => {
    render(<Harness />)
    expect(screen.queryByRole('button', { name: 'Reset to default body' })).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Height'), { target: { value: '190' } })
    await userEvent.click(screen.getByRole('button', { name: 'Reset to default body' }))
    expect(screen.getByText('171 cm')).toBeInTheDocument()
  })
})

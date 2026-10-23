import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import LevelSelectScreen from './LevelSelectScreen'

describe('LevelSelectScreen', () => {
  it('renders the four work days', () => {
    render(<LevelSelectScreen onBack={() => {}} onSelectDay={() => {}} />)

    expect(screen.getByRole('button', { name: /dia 1/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dia 2/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dia 3/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dia 4/i })).toBeInTheDocument()
  })

  it('calls onSelectDay with the day id when a day card is clicked', async () => {
    const user = userEvent.setup()
    const onSelectDay = vi.fn()
    render(<LevelSelectScreen onBack={() => {}} onSelectDay={onSelectDay} />)

    await user.click(screen.getByRole('button', { name: /dia 1/i }))

    expect(onSelectDay).toHaveBeenCalledTimes(1)
    expect(onSelectDay).toHaveBeenCalledWith(1)
  })

  it('calls onBack when the Voltar button is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(<LevelSelectScreen onBack={onBack} onSelectDay={() => {}} />)

    await user.click(screen.getByRole('button', { name: /voltar/i }))

    expect(onBack).toHaveBeenCalledTimes(1)
  })
})

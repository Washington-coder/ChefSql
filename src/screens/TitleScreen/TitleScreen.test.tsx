import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import TitleScreen from './TitleScreen'

describe('TitleScreen', () => {
  it('renders the game logo and the main menu buttons', () => {
    render(<TitleScreen onPlay={() => {}} onSandbox={() => {}} />)

    expect(screen.getByRole('heading', { name: /chef sql/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Jogar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sandbox' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Créditos' })).toBeInTheDocument()
  })

  it('calls onPlay when the Jogar button is clicked', async () => {
    const user = userEvent.setup()
    const onPlay = vi.fn()
    render(<TitleScreen onPlay={onPlay} onSandbox={() => {}} />)

    await user.click(screen.getByRole('button', { name: 'Jogar' }))

    expect(onPlay).toHaveBeenCalledTimes(1)
  })

  it('calls onSandbox when the Sandbox button is clicked', async () => {
    const user = userEvent.setup()
    const onSandbox = vi.fn()
    render(<TitleScreen onPlay={() => {}} onSandbox={onSandbox} />)

    await user.click(screen.getByRole('button', { name: 'Sandbox' }))

    expect(onSandbox).toHaveBeenCalledTimes(1)
  })

  it('opens and closes the credits dialog', async () => {
    const user = userEvent.setup()
    render(<TitleScreen onPlay={() => {}} onSandbox={() => {}} />)

    await user.click(screen.getByRole('button', { name: 'Créditos' }))
    expect(screen.getByRole('dialog', { name: /créditos/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes the credits dialog with the Escape key', async () => {
    const user = userEvent.setup()
    render(<TitleScreen onPlay={() => {}} onSandbox={() => {}} />)

    await user.click(screen.getByRole('button', { name: 'Créditos' }))
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

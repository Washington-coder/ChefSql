import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import SqlEditor from './SqlEditor'

function Harness({
  onSubmit = () => {},
  initialValue = '',
}: {
  onSubmit?: (sql: string) => void
  initialValue?: string
}) {
  const [value, setValue] = useState(initialValue)
  return <SqlEditor value={value} onChange={setValue} onSubmit={onSubmit} />
}

describe('SqlEditor', () => {
  it('renders the editor label and the action buttons', () => {
    render(<Harness />)

    expect(screen.getByLabelText('Editor SQL')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Limpar' })).toBeInTheDocument()
  })

  it('calls onSubmit with the typed SQL when Confirmar is clicked', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Harness onSubmit={onSubmit} />)

    const input = screen.getByLabelText('Editor SQL')
    await user.type(input, 'SELECT * FROM geladeira')
    await user.click(screen.getByRole('button', { name: 'Confirmar' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith('SELECT * FROM geladeira')
  })

  it('submits the SQL with Ctrl+Enter', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Harness onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Editor SQL'), 'SELECT 1')
    await user.keyboard('{Control>}{Enter}{/Control}')

    expect(onSubmit).toHaveBeenCalledWith('SELECT 1')
  })

  it('does not submit an empty SQL', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Harness onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Confirmar' }))

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('clears the editor when Limpar is clicked', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Harness onSubmit={onSubmit} initialValue="SELECT 1" />)

    const input = screen.getByLabelText('Editor SQL')
    await user.click(screen.getByRole('button', { name: 'Limpar' }))

    expect(input).toHaveValue('')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('renders Limpar before Confirmar', () => {
    render(<Harness />)

    const limpar = screen.getByRole('button', { name: 'Limpar' })
    const confirmar = screen.getByRole('button', { name: 'Confirmar' })

    expect(limpar.compareDocumentPosition(confirmar) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0)
  })

  it('renders highlighted tokens behind the textarea', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.type(screen.getByLabelText('Editor SQL'), 'SELECT nome FROM geladeira')

    const highlight = document.querySelector<HTMLElement>('.sql-editor__highlight')
    expect(highlight).not.toBeNull()
    expect(highlight?.textContent).toContain('SELECT nome FROM geladeira')

    const keywordToken = highlight?.querySelector('.sql-token--keyword')
    expect(keywordToken?.textContent).toBe('SELECT')
  })

  it('reflects an externally-provided value', () => {
    render(<Harness initialValue="SELECT 42" />)

    expect(screen.getByLabelText('Editor SQL')).toHaveValue('SELECT 42')
    expect(document.querySelector('.sql-editor__highlight')?.textContent).toContain('SELECT 42')
  })
})

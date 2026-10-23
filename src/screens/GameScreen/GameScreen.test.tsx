import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { GameDatabase, SqlOutcome, TableOverview } from '../../game/engine/sqlDatabase'
import GameScreen from './GameScreen'

const mockDatabase: GameDatabase = {
  runQuery: vi.fn((sql: string): SqlOutcome => {
    if (sql.includes('geladeiraa')) {
      return {
        status: 'error',
        code: 'unknown_table',
        message: 'Essa tabela não existe na nossa cozinha.',
        detail: 'no such table: geladeiraa',
      }
    }
    return {
      status: 'success',
      result: {
        columns: ['ingrediente', 'quantidade'],
        rows: [
          ['Alface', 10],
          ['Tomate', 12],
        ],
        rowCount: 2,
        truncated: false,
      },
    }
  }),
  getTableOverviews: vi.fn((): TableOverview[] => [
    {
      name: 'geladeira',
      columns: ['id', 'ingrediente', 'quantidade'],
      rowCount: 12,
      sampleRows: [
        [1, 'Frango', 8],
        [2, 'Carne moída', 5],
      ],
    },
  ]),
  close: vi.fn(),
}

vi.mock('../../game/engine/sqlDatabase', () => ({
  createGameDatabase: vi.fn(() => Promise.resolve(mockDatabase)),
}))

describe('GameScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows a loading state and then the loaded schema', async () => {
    render(<GameScreen dayId={1} onExit={() => {}} />)

    expect(screen.getByText('Preparando o banco da cozinha...')).toBeInTheDocument()

    expect(await screen.findByText('Cardápio do banco')).toBeInTheDocument()
    expect(screen.getByText('geladeira')).toBeInTheDocument()
    expect(screen.getByText('id · ingrediente · quantidade')).toBeInTheDocument()
  })

  it('runs a query from the editor and shows the result table', async () => {
    const user = userEvent.setup()
    render(<GameScreen dayId={1} onExit={() => {}} />)
    await screen.findByText('Cardápio do banco')

    await user.type(
      screen.getByLabelText('Editor SQL'),
      'SELECT ingrediente, quantidade FROM geladeira',
    )
    await user.click(screen.getByRole('button', { name: 'Confirmar' }))

    expect(mockDatabase.runQuery).toHaveBeenCalledWith(
      'SELECT ingrediente, quantidade FROM geladeira',
    )
    const resultPanel = within(screen.getByRole('region', { name: 'Resultado' }))
    expect(resultPanel.getByRole('columnheader', { name: 'ingrediente' })).toBeInTheDocument()
    expect(resultPanel.getByRole('cell', { name: 'Alface' })).toBeInTheDocument()
    expect(resultPanel.getByText('2 linhas retornadas.')).toBeInTheDocument()
  })

  it('shows the friendly error message for a failing query', async () => {
    const user = userEvent.setup()
    render(<GameScreen dayId={1} onExit={() => {}} />)
    await screen.findByText('Cardápio do banco')

    await user.type(screen.getByLabelText('Editor SQL'), 'SELECT * FROM geladeiraa')
    await user.click(screen.getByRole('button', { name: 'Confirmar' }))

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Essa tabela não existe na nossa cozinha.')).toBeInTheDocument()
    expect(screen.getByText('Detalhe: no such table: geladeiraa')).toBeInTheDocument()
  })

  it('re-runs the error animation on every failed submission', async () => {
    const user = userEvent.setup()
    render(<GameScreen dayId={1} onExit={() => {}} />)
    await screen.findByText('Cardápio do banco')

    const input = screen.getByLabelText('Editor SQL')
    const confirmar = screen.getByRole('button', { name: 'Confirmar' })

    await user.type(input, 'SELECT * FROM geladeiraa')
    await user.click(confirmar)
    const firstAlert = screen.getByRole('alert')

    await user.clear(input)
    await user.type(input, 'SELECT * FROM geladeiraaa')
    await user.click(confirmar)
    const secondAlert = screen.getByRole('alert')

    expect(secondAlert).not.toBe(firstAlert)
    expect(secondAlert).toHaveClass('game-screen__error')
  })

  it('fills the editor when an example chip is clicked', async () => {
    const user = userEvent.setup()
    render(<GameScreen dayId={1} onExit={() => {}} />)
    await screen.findByText('Cardápio do banco')

    await user.click(screen.getByRole('button', { name: 'Tabela inexistente' }))

    expect(screen.getByLabelText('Editor SQL')).toHaveValue('SELECT * FROM geladeiraa;')
  })
})

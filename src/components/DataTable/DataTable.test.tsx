import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import DataTable from './DataTable'

describe('DataTable', () => {
  it('renders columns and rows', () => {
    render(
      <DataTable
        columns={['id', 'ingrediente']}
        rows={[
          [1, 'Frango'],
          [2, 'Açafrão'],
        ]}
      />,
    )

    expect(screen.getByRole('columnheader', { name: 'id' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'ingrediente' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Frango' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Açafrão' })).toBeInTheDocument()
  })

  it('renders NULL cells distinctly', () => {
    render(<DataTable columns={['a']} rows={[[null]]} />)

    expect(screen.getByRole('cell', { name: 'NULL' })).toBeInTheDocument()
  })

  it('shows the row count footer', () => {
    render(<DataTable columns={['a']} rows={[[1]]} totalRowCount={1} />)

    expect(screen.getByText('1 linha retornada.')).toBeInTheDocument()
  })

  it('shows the truncation note', () => {
    render(<DataTable columns={['a']} rows={[[1]]} totalRowCount={250} truncated />)

    expect(screen.getByText(/mostrando as primeiras 1 de 250 linhas/i)).toBeInTheDocument()
  })

  it('shows the empty message when there are no columns', () => {
    render(<DataTable columns={[]} rows={[]} />)

    expect(screen.getByText('Nenhuma linha retornada.')).toBeInTheDocument()
    expect(screen.getByText('Nenhuma linha retornada.')).toBeInTheDocument()
  })
})

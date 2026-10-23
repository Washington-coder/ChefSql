import type { CellValue } from '../../game/engine/sqlDatabase'
import './DataTable.css'

interface DataTableProps {
  columns: string[]
  rows: CellValue[][]
  totalRowCount?: number
  truncated?: boolean
  emptyMessage?: string
}

function DataTable({
  columns,
  rows,
  totalRowCount,
  truncated = false,
  emptyMessage = 'Nenhuma linha retornada.',
}: DataTableProps) {
  return (
    <div className="data-table">
      {columns.length === 0 ? (
        <p className="data-table__empty">{emptyMessage}</p>
      ) : (
        <div className="data-table__scroll">
          <table className="data-table__grid">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${rowIndex}-${cellIndex}`}>
                      {cell === null ? (
                        <span className="data-table__null">NULL</span>
                      ) : (
                        String(cell)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {totalRowCount !== undefined ? (
        <p className="data-table__footer">
          {truncated
            ? `Mostrando as primeiras ${rows.length} de ${totalRowCount} linhas.`
            : `${totalRowCount} linha${totalRowCount === 1 ? '' : 's'} retornada${totalRowCount === 1 ? '' : 's'}.`}
        </p>
      ) : null}
    </div>
  )
}

export default DataTable

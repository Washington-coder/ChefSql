import initSqlJs, { type SqlJsStatic } from 'sql.js'
import sqlWasmUrl from './sql-wasm.wasm?url'
import schemaSql from '../levels/schema.sql?raw'
import { toFriendlySqlError, type SqlErrorCode } from './sqlErrors'

export const MAX_RESULT_ROWS = 200

export type CellValue = string | number | null

export interface QueryResult {
  columns: string[]
  rows: CellValue[][]
  rowCount: number
  truncated: boolean
}

export type SqlOutcome =
  | { status: 'success'; result: QueryResult }
  | { status: 'error'; code: SqlErrorCode; message: string; detail: string }

export interface TableOverview {
  name: string
  columns: string[]
  rowCount: number
  sampleRows: CellValue[][]
}

export interface GameDatabase {
  runQuery: (sql: string) => SqlOutcome
  getTableOverviews: (sampleLimit?: number) => TableOverview[]
  close: () => void
}

const BLOCKED_COMMANDS = new Set([
  'CREATE',
  'DROP',
  'ALTER',
  'ATTACH',
  'DETACH',
  'VACUUM',
  'PRAGMA',
  'REINDEX',
  'BEGIN',
  'COMMIT',
  'ROLLBACK',
])

const isNodeEnvironment = typeof window === 'undefined'

let sqlJsPromise: Promise<SqlJsStatic> | null = null

function loadSqlJs(): Promise<SqlJsStatic> {
  // No navegador o Vite serve o .wasm como asset (?url). No Node (testes),
  // o sql.js resolve o .wasm a partir do próprio diretório do módulo.
  sqlJsPromise ??= initSqlJs(isNodeEnvironment ? {} : { locateFile: () => sqlWasmUrl })
  return sqlJsPromise
}

function normalizeCell(value: string | number | Uint8Array | null): CellValue {
  if (value instanceof Uint8Array) {
    return new TextDecoder().decode(value)
  }
  return value
}

export function createGameDatabase(seedSql: string): Promise<GameDatabase> {
  return loadSqlJs().then((SQL) => {
    const db = new SQL.Database()
    db.run(schemaSql)
    db.run(seedSql)
    db.run('PRAGMA foreign_keys = ON')

    function runQuery(sql: string): SqlOutcome {
      const trimmedSql = sql.trim()

      if (trimmedSql.length === 0) {
        return {
          status: 'error',
          code: 'empty',
          message: 'Digite um comando SQL antes de confirmar.',
          detail: '',
        }
      }

      const firstKeyword = /^\w+/.exec(trimmedSql)?.[0].toUpperCase() ?? ''
      if (BLOCKED_COMMANDS.has(firstKeyword)) {
        return {
          status: 'error',
          code: 'blocked_command',
          message:
            'Comandos de estrutura (CREATE, DROP, ALTER, PRAGMA...) estão bloqueados: o cardápio da cozinha já está montado.',
          detail: `Comando "${firstKeyword}" não é permitido.`,
        }
      }

      if (/\bWITH\s+RECURSIVE\b/i.test(trimmedSql)) {
        return {
          status: 'error',
          code: 'heavy_query',
          message:
            'Essa consulta é pesada demais para a nossa cozinha. Tente uma versão mais enxuta, com filtros ou LIMIT.',
          detail: 'WITH RECURSIVE não é permitido.',
        }
      }

      try {
        const results = db.exec(sql)
        const lastResult = results[results.length - 1]

        if (lastResult === undefined) {
          const modified = db.getRowsModified()
          return {
            status: 'success',
            result: { columns: [], rows: [], rowCount: modified, truncated: false },
          }
        }

        const allRows = lastResult.values.map((row) => row.map(normalizeCell))
        const truncated = allRows.length > MAX_RESULT_ROWS
        const rows = truncated ? allRows.slice(0, MAX_RESULT_ROWS) : allRows

        return {
          status: 'success',
          result: {
            columns: lastResult.columns,
            rows,
            rowCount: allRows.length,
            truncated,
          },
        }
      } catch (error) {
        const friendly = toFriendlySqlError(error)
        return {
          status: 'error',
          code: friendly.code,
          message: friendly.message,
          detail: friendly.detail,
        }
      }
    }

    function getTableOverviews(sampleLimit = 5): TableOverview[] {
      const tableResults = db.exec(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
      )
      const tableNames = tableResults[0]?.values.map((row) => String(row[0])) ?? []

      return tableNames.map((name) => {
        const infoResults = db.exec(`PRAGMA table_info("${name}")`)
        const columns = infoResults[0]?.values.map((row) => String(row[1])) ?? []

        const countResults = db.exec(`SELECT COUNT(*) FROM "${name}"`)
        const rowCount = Number(countResults[0]?.values[0]?.[0] ?? 0)

        const previewResults = db.exec(`SELECT * FROM "${name}" LIMIT ${sampleLimit}`)
        const sampleRows = previewResults[0]?.values.map((row) => row.map(normalizeCell)) ?? []

        return { name, columns, rowCount, sampleRows }
      })
    }

    return {
      runQuery,
      getTableOverviews,
      close: () => db.close(),
    }
  })
}

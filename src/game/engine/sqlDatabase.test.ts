// @vitest-environment node
import { describe, expect, it, afterAll } from 'vitest'
import { createGameDatabase, MAX_RESULT_ROWS, type GameDatabase } from './sqlDatabase'
import day1SeedSql from '../levels/day1/seed.sql?raw'

let database: GameDatabase | null = null

describe('createGameDatabase', () => {
  afterAll(() => {
    database?.close()
  })

  it('loads the wasm and creates a database from schema + seed', async () => {
    database = await createGameDatabase(day1SeedSql)

    const overviews = database.getTableOverviews()
    expect(overviews.map((d) => d.name)).toEqual(['clientes', 'geladeira', 'pedidos', 'receitas'])
  })

  it('seeds the day 1 data', () => {
    const outcome = database?.runQuery('SELECT COUNT(*) FROM geladeira')
    expect(outcome).toEqual({
      status: 'success',
      result: { columns: ['COUNT(*)'], rows: [[12]], rowCount: 1, truncated: false },
    })
  })

  it('describes the tables with columns and row counts', () => {
    const geladeira = database?.getTableOverviews().find((d) => d.name === 'geladeira')
    expect(geladeira?.columns).toEqual([
      'id',
      'ingrediente',
      'quantidade',
      'validade',
      'categoria',
      'preco_custo',
    ])
    expect(geladeira?.rowCount).toBe(12)
    expect(geladeira?.sampleRows).toHaveLength(5)
  })

  it('runs a filtered query', () => {
    const outcome = database?.runQuery(
      "SELECT ingrediente, quantidade FROM geladeira WHERE categoria = 'vegetais'",
    )
    expect(outcome?.status).toBe('success')
    if (outcome?.status === 'success') {
      expect(outcome.result.rowCount).toBe(5)
      expect(outcome.result.columns).toEqual(['ingrediente', 'quantidade'])
    }
  })

  it('runs an ordering query', () => {
    const outcome = database?.runQuery(
      'SELECT ingrediente FROM geladeira ORDER BY preco_custo DESC LIMIT 3',
    )
    expect(outcome?.status).toBe('success')
    if (outcome?.status === 'success') {
      expect(outcome.result.rows).toEqual([['Açafrão'], ['Picanha'], ['Camarão']])
    }
  })

  it('reports unknown tables with a friendly error', () => {
    const outcome = database?.runQuery('SELECT * FROM geladeiraa')
    expect(outcome?.status).toBe('error')
    if (outcome?.status === 'error') {
      expect(outcome.code).toBe('unknown_table')
      expect(outcome.message).toContain('geladeira')
    }
  })

  it('reports syntax errors with a friendly error', () => {
    const outcome = database?.runQuery('SELEC 1')
    expect(outcome?.status).toBe('error')
    if (outcome?.status === 'error') {
      expect(outcome.code).toBe('syntax_error')
    }
  })

  it('reports unknown columns', () => {
    const outcome = database?.runQuery('SELECT nome FROM geladeira')
    expect(outcome?.status).toBe('error')
    if (outcome?.status === 'error') {
      expect(outcome.code).toBe('unknown_column')
    }
  })

  it('reports unknown functions', () => {
    const outcome = database?.runQuery('SELECT COUNTX(*) FROM geladeira')
    expect(outcome?.status).toBe('error')
    if (outcome?.status === 'error') {
      expect(outcome.code).toBe('unknown_function')
    }
  })

  it('reports incomplete queries', () => {
    const outcome = database?.runQuery('SELECT * FROM geladeira WHERE')
    expect(outcome?.status).toBe('error')
    if (outcome?.status === 'error') {
      expect(outcome.code).toBe('incomplete_input')
    }
  })

  it('blocks DDL commands', () => {
    const outcome = database?.runQuery('CREATE TABLE cozinha (id INTEGER)')
    expect(outcome?.status).toBe('error')
    if (outcome?.status === 'error') {
      expect(outcome.code).toBe('blocked_command')
    }
  })

  it('blocks recursive CTEs to avoid freezing the page', () => {
    const outcome = database?.runQuery(
      'WITH RECURSIVE cnt(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM cnt) SELECT x FROM cnt',
    )
    expect(outcome?.status).toBe('error')
    if (outcome?.status === 'error') {
      expect(outcome.code).toBe('heavy_query')
    }
  })

  it('rejects duplicate keys', () => {
    const outcome = database?.runQuery(
      "INSERT INTO clientes (id, mesa, status, numero_pessoas, horario_chegada) VALUES (1, 9, 'esperando', 1, '20:00')",
    )
    expect(outcome?.status).toBe('error')
    if (outcome?.status === 'error') {
      expect(outcome.code).toBe('constraint_unique')
    }
  })

  it('rejects missing required fields', () => {
    const outcome = database?.runQuery(
      "INSERT INTO geladeira (id, quantidade, validade, categoria, preco_custo) VALUES (50, 1, '2026-11-01', 'temperos', 1.0)",
    )
    expect(outcome?.status).toBe('error')
    if (outcome?.status === 'error') {
      expect(outcome.code).toBe('constraint_not_null')
    }
  })

  it('rejects pedidos referencing unknown mesas', () => {
    const outcome = database?.runQuery(
      "INSERT INTO pedidos (id, mesa_id, prato_pedido, prioridade) VALUES (99, 999, 'X', 'normal')",
    )
    expect(outcome?.status).toBe('error')
    if (outcome?.status === 'error') {
      expect(outcome.code).toBe('constraint_foreign_key')
    }
  })

  it('reports UNION column mismatches', () => {
    const outcome = database?.runQuery(
      'SELECT id FROM geladeira UNION SELECT ingrediente, quantidade FROM geladeira',
    )
    expect(outcome?.status).toBe('error')
    if (outcome?.status === 'error') {
      expect(outcome.code).toBe('union_columns')
    }
  })

  it('rejects empty queries', () => {
    const outcome = database?.runQuery('   ')
    expect(outcome?.status).toBe('error')
    if (outcome?.status === 'error') {
      expect(outcome.code).toBe('empty')
    }
  })

  it('runs INSERT and UPDATE mutations and reports modified rows', () => {
    const insert = database?.runQuery(
      "INSERT INTO geladeira (id, ingrediente, quantidade, validade, categoria, preco_custo) VALUES (13, 'Manjericão', 4, '2026-10-26', 'temperos', 7.5)",
    )
    expect(insert).toEqual({
      status: 'success',
      result: { columns: [], rows: [], rowCount: 1, truncated: false },
    })

    const update = database?.runQuery('UPDATE geladeira SET quantidade = 0 WHERE id = 13')
    expect(update?.status).toBe('success')
    if (update?.status === 'success') {
      expect(update.result.rowCount).toBe(1)
    }
  })

  it('truncates large results to MAX_RESULT_ROWS', () => {
    const countOutcome = database?.runQuery('SELECT COUNT(*) FROM geladeira')
    const existingRows = countOutcome?.status === 'success' ? countOutcome.result.rows[0][0] : 0
    if (typeof existingRows !== 'number') {
      throw new Error('expected a numeric row count')
    }

    for (let i = 1000; i < 1000 + MAX_RESULT_ROWS + 10; i++) {
      database?.runQuery(
        `INSERT INTO geladeira (id, ingrediente, quantidade, validade, categoria, preco_custo) VALUES (${i}, 'Item ${i}', 1, '2026-12-01', 'vegetais', 1.0)`,
      )
    }

    const big = database?.runQuery('SELECT * FROM geladeira')
    expect(big?.status).toBe('success')
    if (big?.status === 'success') {
      expect(big.result.truncated).toBe(true)
      expect(big.result.rows).toHaveLength(MAX_RESULT_ROWS)
      expect(big.result.rowCount).toBe(existingRows + MAX_RESULT_ROWS + 10)
    }
  })
})

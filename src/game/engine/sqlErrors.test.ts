import { describe, expect, it } from 'vitest'
import { toFriendlySqlError } from './sqlErrors'

describe('toFriendlySqlError', () => {
  it('maps syntax errors', () => {
    const result = toFriendlySqlError(new Error('near "SELEC": syntax error'))
    expect(result.code).toBe('syntax_error')
    expect(result.message).toContain('sintaxe')
    expect(result.detail).toContain('near "SELEC"')
  })

  it('maps parser errors as syntax errors', () => {
    expect(toFriendlySqlError(new Error('parser error'))).toMatchObject({ code: 'syntax_error' })
  })

  it('maps unknown tables', () => {
    const result = toFriendlySqlError(new Error('no such table: geladeiraa'))
    expect(result.code).toBe('unknown_table')
    expect(result.message).toContain('geladeira')
  })

  it('maps unknown columns in SELECT', () => {
    expect(toFriendlySqlError(new Error('no such column: nomes'))).toMatchObject({
      code: 'unknown_column',
    })
  })

  it('maps unknown columns in INSERT', () => {
    expect(toFriendlySqlError(new Error('table geladeira has no column named xyz'))).toMatchObject({
      code: 'unknown_column',
    })
  })

  it('maps unknown functions', () => {
    expect(toFriendlySqlError(new Error('no such function: COUNTT'))).toMatchObject({
      code: 'unknown_function',
    })
  })

  it('maps incomplete inputs', () => {
    expect(toFriendlySqlError(new Error('incomplete input'))).toMatchObject({
      code: 'incomplete_input',
    })
  })

  it('maps unique constraint violations', () => {
    expect(toFriendlySqlError(new Error('UNIQUE constraint failed: clientes.id'))).toMatchObject({
      code: 'constraint_unique',
    })
  })

  it('maps not-null violations', () => {
    expect(
      toFriendlySqlError(new Error('NOT NULL constraint failed: geladeira.ingrediente')),
    ).toMatchObject({ code: 'constraint_not_null' })
  })

  it('maps check violations', () => {
    expect(toFriendlySqlError(new Error('CHECK constraint failed'))).toMatchObject({
      code: 'constraint_check',
    })
  })

  it('maps foreign key violations', () => {
    expect(toFriendlySqlError(new Error('FOREIGN KEY constraint failed'))).toMatchObject({
      code: 'constraint_foreign_key',
    })
  })

  it('maps datatype mismatches', () => {
    expect(toFriendlySqlError(new Error('datatype mismatch'))).toMatchObject({
      code: 'datatype_mismatch',
    })
  })

  it('maps UNION column count mismatches', () => {
    expect(
      toFriendlySqlError(
        new Error(
          'SELECTs to the left and right of UNION do not have the same number of result columns',
        ),
      ),
    ).toMatchObject({ code: 'union_columns' })
  })

  it('falls back to unknown for unexpected errors', () => {
    const result = toFriendlySqlError(new Error('boom: disk I/O error'))
    expect(result.code).toBe('unknown')
    expect(result.detail).toBe('boom: disk I/O error')
  })

  it('handles non-Error values', () => {
    expect(toFriendlySqlError('some string')).toMatchObject({ code: 'unknown' })
  })
})

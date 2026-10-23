import { describe, expect, it } from 'vitest'
import { tokenizeSql } from './sqlSyntax'

describe('tokenizeSql', () => {
  it('marks SELECT as a keyword', () => {
    expect(tokenizeSql('SELECT').at(0)).toEqual({ type: 'keyword', value: 'SELECT' })
  })

  it('is case-insensitive for keywords', () => {
    expect(tokenizeSql('select').at(0)?.type).toBe('keyword')
  })

  it('marks COUNT as a function, not a keyword', () => {
    const tokens = tokenizeSql('COUNT(1)')
    expect(tokens[0]).toEqual({ type: 'function', value: 'COUNT' })
  })

  it('keeps words inside string literals as strings', () => {
    expect(tokenizeSql("'select'").at(0)).toEqual({ type: 'string', value: "'select'" })
  })

  it('marks numbers', () => {
    expect(tokenizeSql('3').at(0)).toEqual({ type: 'number', value: '3' })
    expect(tokenizeSql('2.5').at(0)).toEqual({ type: 'number', value: '2.5' })
  })

  it('marks line comments until end of line', () => {
    const tokens = tokenizeSql('SELECT 1 -- comentário')
    expect(tokens.at(-1)).toEqual({ type: 'comment', value: '-- comentário' })
  })

  it('marks block comments across lines', () => {
    const tokens = tokenizeSql('/* linha 1\nlinha 2 */ SELECT 1')
    expect(tokens[0]).toEqual({ type: 'comment', value: '/* linha 1\nlinha 2 */' })
  })

  it('merges adjacent plain characters into a single token', () => {
    expect(tokenizeSql('ab cd')).toEqual([{ type: 'plain', value: 'ab cd' }])
  })

  it('tokenizes a full query', () => {
    const tokens = tokenizeSql(
      "SELECT nome, quantidade FROM geladeira WHERE categoria = 'vegetais' LIMIT 3",
    )
    expect(tokens[0]).toEqual({ type: 'keyword', value: 'SELECT' })
    expect(tokens).toContainEqual({ type: 'keyword', value: 'FROM' })
    expect(tokens).toContainEqual({ type: 'keyword', value: 'WHERE' })
    expect(tokens).toContainEqual({ type: 'string', value: "'vegetais'" })
    expect(tokens).toContainEqual({ type: 'keyword', value: 'LIMIT' })
    expect(tokens).toContainEqual({ type: 'number', value: '3' })
  })
})

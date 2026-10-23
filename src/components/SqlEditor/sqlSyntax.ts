export type SqlTokenType = 'keyword' | 'string' | 'number' | 'comment' | 'function' | 'plain'

export interface SqlToken {
  type: SqlTokenType
  value: string
}

const SQL_KEYWORDS = new Set([
  'ADD',
  'ALL',
  'ALTER',
  'AND',
  'AS',
  'ASC',
  'BETWEEN',
  'BY',
  'CASE',
  'CHECK',
  'COLUMN',
  'CREATE',
  'DEFAULT',
  'DELETE',
  'DESC',
  'DISTINCT',
  'DROP',
  'ELSE',
  'END',
  'EXISTS',
  'FOREIGN',
  'FROM',
  'FULL',
  'GRANT',
  'GROUP',
  'HAVING',
  'IN',
  'INDEX',
  'INNER',
  'INSERT',
  'INTO',
  'IS',
  'JOIN',
  'KEY',
  'LEFT',
  'LIKE',
  'LIMIT',
  'NOT',
  'NULL',
  'ON',
  'OR',
  'ORDER',
  'OUTER',
  'PRIMARY',
  'REFERENCES',
  'RIGHT',
  'SELECT',
  'SET',
  'TABLE',
  'THEN',
  'UNION',
  'UNIQUE',
  'UPDATE',
  'VALUES',
  'WHEN',
  'WHERE',
])

const SQL_FUNCTIONS = new Set(['AVG', 'COUNT', 'MAX', 'MIN', 'SUM'])

const TOKEN_REGEX =
  /(--[^\n]*|\/\*[\s\S]*?\*\/)|('(?:''|[^'])*')|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_][A-Za-z0-9_]*\b)|([\s\S])/g

export function tokenizeSql(sql: string): SqlToken[] {
  const tokens: SqlToken[] = []
  TOKEN_REGEX.lastIndex = 0

  for (const match of sql.matchAll(TOKEN_REGEX)) {
    const [, commentMatch, stringMatch, numberMatch, wordMatch, other] = match

    let type: SqlTokenType
    let value: string

    if (commentMatch !== undefined) {
      type = 'comment'
      value = commentMatch
    } else if (stringMatch !== undefined) {
      type = 'string'
      value = stringMatch
    } else if (numberMatch !== undefined) {
      type = 'number'
      value = numberMatch
    } else if (wordMatch !== undefined) {
      const upper = wordMatch.toUpperCase()
      if (SQL_FUNCTIONS.has(upper)) {
        type = 'function'
      } else if (SQL_KEYWORDS.has(upper)) {
        type = 'keyword'
      } else {
        type = 'plain'
      }
      value = wordMatch
    } else {
      type = 'plain'
      value = other
    }

    const lastToken = tokens[tokens.length - 1]
    if (type === 'plain' && lastToken !== undefined && lastToken.type === 'plain') {
      lastToken.value += value
    } else {
      tokens.push({ type, value })
    }
  }

  return tokens
}

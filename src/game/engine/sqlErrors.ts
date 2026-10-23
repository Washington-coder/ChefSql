export type SqlErrorCode =
  | 'empty'
  | 'syntax_error'
  | 'unknown_table'
  | 'unknown_column'
  | 'unknown_function'
  | 'incomplete_input'
  | 'constraint_unique'
  | 'constraint_not_null'
  | 'constraint_check'
  | 'constraint_foreign_key'
  | 'datatype_mismatch'
  | 'union_columns'
  | 'blocked_command'
  | 'heavy_query'
  | 'unknown'

export interface FriendlySqlError {
  code: SqlErrorCode
  message: string
  detail: string
}

const ERROR_MESSAGES: Record<Exclude<SqlErrorCode, 'empty'>, string> = {
  syntax_error:
    'Opa! A receita tem um erro de sintaxe. Confira palavras-chave, vírgulas, parênteses e o final do comando.',
  unknown_table:
    'Essa tabela não existe na nossa cozinha. As mesas do banco são: geladeira, clientes, pedidos e receitas.',
  unknown_column:
    'Essa coluna não existe nessa tabela. Confira o nome no Cardápio do banco ao lado.',
  unknown_function:
    'Essa função não existe no nosso fogão. Confira o nome — o SQLite tem AVG, COUNT, MAX, MIN e SUM.',
  incomplete_input:
    'O comando está incompleto: faltou alguma parte da receita. Termine a consulta e tente de novo.',
  constraint_unique:
    'Ops, esse registro já existe! O banco não aceita duplicar esse identificador.',
  constraint_not_null:
    'Faltou preencher um campo obrigatório. Todo ingrediente precisa de um valor aqui.',
  constraint_check:
    'Esse valor não passou na validação da tabela. Confira se está dentro do permitido.',
  constraint_foreign_key:
    'Esse registro referencia uma mesa que não existe. Cadastre a mesa antes de vincular o pedido.',
  datatype_mismatch:
    'O tipo do valor não bate com a coluna: texto vai entre aspas, número fica sem aspas.',
  union_columns:
    'As consultas do UNION precisam ter o mesmo número de colunas para serem combinadas.',
  blocked_command:
    'Comandos de estrutura (CREATE, DROP, ALTER, PRAGMA...) estão bloqueados: o cardápio da cozinha já está montado.',
  heavy_query:
    'Essa consulta é pesada demais para a nossa cozinha. Tente uma versão mais enxuta, com filtros ou LIMIT.',
  unknown: 'Algo deu errado ao executar o comando. Revise a consulta e tente novamente.',
}

function rawErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

export function toFriendlySqlError(error: unknown): FriendlySqlError {
  const rawMessage = rawErrorMessage(error)

  let code: Exclude<SqlErrorCode, 'empty' | 'unknown'>
  if (/near "[^"]*": syntax error/.test(rawMessage) || /parser error/.test(rawMessage)) {
    code = 'syntax_error'
  } else if (/no such table: \S+/.test(rawMessage)) {
    code = 'unknown_table'
  } else if (/no such column: \S+/.test(rawMessage) || /has no column named \S+/.test(rawMessage)) {
    code = 'unknown_column'
  } else if (/no such function: \S+/.test(rawMessage)) {
    code = 'unknown_function'
  } else if (/incomplete input|at end of input/.test(rawMessage)) {
    code = 'incomplete_input'
  } else if (/UNIQUE constraint failed/.test(rawMessage)) {
    code = 'constraint_unique'
  } else if (/NOT NULL constraint failed/.test(rawMessage)) {
    code = 'constraint_not_null'
  } else if (/CHECK constraint failed/.test(rawMessage)) {
    code = 'constraint_check'
  } else if (/FOREIGN KEY constraint failed/.test(rawMessage)) {
    code = 'constraint_foreign_key'
  } else if (/datatype mismatch/.test(rawMessage)) {
    code = 'datatype_mismatch'
  } else if (/do not have the same number of result columns/.test(rawMessage)) {
    code = 'union_columns'
  } else {
    return { code: 'unknown', message: ERROR_MESSAGES.unknown, detail: rawMessage }
  }

  return { code, message: ERROR_MESSAGES[code], detail: rawMessage }
}

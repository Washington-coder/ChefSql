export interface ExampleQuery {
  label: string
  sql: string
}

export interface DayExamples {
  works: ExampleQuery[]
  errors: ExampleQuery[]
}

export const DAY1_EXAMPLES: DayExamples = {
  works: [
    {
      label: 'Tudo na geladeira',
      sql: 'SELECT * FROM geladeira;',
    },
    {
      label: 'Filtrar por categoria',
      sql: "SELECT ingrediente, quantidade FROM geladeira WHERE categoria = 'vegetais';",
    },
    {
      label: 'Perto de vencer',
      sql: "SELECT ingrediente, validade FROM geladeira WHERE validade <= '2026-10-26' ORDER BY validade ASC;",
    },
    {
      label: '3 mais caros',
      sql: 'SELECT ingrediente, preco_custo FROM geladeira ORDER BY preco_custo DESC LIMIT 3;',
    },
    {
      label: 'Juntar pedidos e clientes',
      sql: 'SELECT c.mesa, p.prato_pedido FROM pedidos p INNER JOIN clientes c ON p.mesa_id = c.id ORDER BY c.mesa;',
    },
  ],
  errors: [
    {
      label: 'Tabela inexistente',
      sql: 'SELECT * FROM geladeiraa;',
    },
    {
      label: 'Coluna inexistente',
      sql: 'SELECT nome FROM geladeira;',
    },
    {
      label: 'Erro de sintaxe',
      sql: 'SELEC 1;',
    },
    {
      label: 'Consulta incompleta',
      sql: 'SELECT * FROM geladeira WHERE;',
    },
    {
      label: 'Duplicar identificador',
      sql: "INSERT INTO clientes (id, mesa, status, numero_pessoas, horario_chegada) VALUES (1, 9, 'esperando', 1, '20:00');",
    },
    {
      label: 'Faltou campo obrigatório',
      sql: "INSERT INTO geladeira (id, quantidade, validade, categoria, preco_custo) VALUES (50, 1, '2026-11-01', 'temperos', 1.0);",
    },
  ],
}

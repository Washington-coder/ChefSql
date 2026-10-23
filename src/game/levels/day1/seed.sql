-- Dia 1 — Quiosque de rua
-- Data de referência do jogo: 2026-10-23 (fixa, para manter os testes determinísticos)

INSERT INTO geladeira
  (id, ingrediente,    quantidade, validade,   categoria, preco_custo) VALUES
  (1,  'Frango',       8,          '2026-10-25', 'carnes',    12.5),
  (2,  'Carne moída',  5,          '2026-10-22', 'carnes',    18.9),
  (3,  'Picanha',      3,          '2026-10-24', 'carnes',    89.9),
  (4,  'Camarão',      7,          '2026-10-23', 'carnes',    64.9),
  (5,  'Alface',       10,         '2026-10-27', 'vegetais',   4.5),
  (6,  'Tomate',       12,         '2026-10-24', 'vegetais',   6.2),
  (7,  'Cebola',       9,          '2026-11-05', 'vegetais',   3.8),
  (8,  'Batata',       20,         '2026-11-15', 'vegetais',   5.9),
  (9,  'Limão',        15,         '2026-10-29', 'vegetais',   1.9),
  (10, 'Alho',         6,          '2026-12-01', 'temperos',   2.4),
  (11, 'Açafrão',      2,          '2027-02-01', 'temperos', 220.0),
  (12, 'Páprica',      4,          '2026-10-30', 'temperos',  11.9);

INSERT INTO clientes (id, mesa, status,    numero_pessoas, horario_chegada) VALUES
  (1, 1, 'esperando', 2, '19:05'),
  (2, 2, 'comendo',   4, '18:50'),
  (3, 3, 'irritado',  1, '18:10'),
  (4, 4, 'esperando', 3, '19:12');

INSERT INTO pedidos (id, mesa_id, prato_pedido,          prioridade) VALUES
  (1, 1, 'Filé com fritas',         'normal'),
  (2, 1, 'Suco de limão',           'normal'),
  (3, 2, 'Moqueca de camarão',      'VIP'),
  (4, 3, 'Salada caprese',          'normal'),
  (5, 4, 'Hambúrguer artesanal',    'normal');

INSERT INTO receitas (id, nome_prato,           ingrediente_necessario, quantidade_necessaria) VALUES
  (1,  'Filé com fritas',        'Picanha',        1),
  (2,  'Filé com fritas',        'Batata',         2),
  (3,  'Moqueca de camarão',     'Camarão',        3),
  (4,  'Moqueca de camarão',     'Tomate',         2),
  (5,  'Moqueca de camarão',     'Açafrão',        1),
  (6,  'Salada caprese',         'Alface',         2),
  (7,  'Salada caprese',         'Tomate',         1),
  (8,  'Salada caprese',         'Alho',           1),
  (9,  'Hambúrguer artesanal',   'Carne moída',    2),
  (10, 'Hambúrguer artesanal',   'Cebola',         1),
  (11, 'Suco de limão',          'Limão',          2);

# Especificação Técnica — "Chef SQL"

> Jogo de navegador para praticar SQL no contexto de uma cozinha profissional.
> Documento de especificação destinado a ser lido por outra IA para implementação.

---

## 1. Visão Geral

**Chef SQL** é um jogo educativo de navegador (browser game) em que o jogador assume o papel de um chefe de cozinha que gerencia um restaurante resolvendo desafios reais por meio de comandos SQL.

A progressão acontece por "Dias de Trabalho" (fases da carreira), levando o jogador de um simples quiosque de rua até um restaurante sofisticado. Em cada fase, o jogador recebe missões narrativas e deve escrever a consulta SQL correta em um editor embutido para completá-las.

### Objetivos do jogo
- Ensinar os fundamentos de SQL de forma prática e contextualizada.
- Cobrir gradualmente: `SELECT`, `WHERE`, `LIMIT`, `ORDER BY`, agregações (`COUNT`, `SUM`, `GROUP BY`), modificação de dados (`INSERT`, `UPDATE`, `DELETE`) e `INNER JOIN`.
- Criar uma experiência lúdica com feedback visual imediato (animações reativas aos comandos).

### Objetivo deste documento
Servir de especificação técnica e funcional completa, permitindo que outra IA (ou um desenvolvedor) implemente o jogo sem ambiguidade sobre regras, telas, dados e arquitetura.

---

## 2. Público-alvo e Objetivos de Aprendizagem

**Público-alvo:** iniciantes em SQL (estudantes, entusiastas de dados, desenvolvedores iniciantes) que querem praticar de forma divertida.

Ao final do jogo, o jogador deverá ser capaz de:
1. Escrever consultas `SELECT` com filtros `WHERE` e `LIMIT`.
2. Ordenar resultados com `ORDER BY`.
3. Usar funções de agregação `COUNT`, `SUM` e agrupamentos `GROUP BY`.
4. Inserir, atualizar e deletar registros (`INSERT`, `UPDATE`, `DELETE`).
5. Cruzar tabelas com `INNER JOIN`.

---

## 3. Game Loop (Ciclo Básico de Jogabilidade)

1. O jogador inicia uma fase (um "Dia de Trabalho").
2. Um ajudante (personagem NPC) apresenta o contexto e a missão em forma de narrativa.
3. O jogador escreve um comando SQL no editor.
4. O jogador executa (`Executar` / Enter) o comando.
5. O motor avalia a consulta contra o banco de dados do jogo.
6. Feedback imediato:
   - **Acerto:** animação de sucesso no cenário, pontuação adicionada, progresso da missão avança.
   - **Erro:** mensagem de erro amigável, sem penalidade dura.
7. A **Barra de Paciência** dos clientes diminui com o tempo; se zerar, clientes ficam "irritados" e a pontuação da fase diminui.
8. Ao completar todos os objetivos da fase, o dia é encerrado com uma tela de resultados.

---

## 4. Estrutura de Dados (Banco de Dados do Jogo)

O jogo possui um banco de dados relacional embarcado com quatro tabelas principais. O esquema abaixo é a fonte da verdade para a implementação.

### 4.1 Tabela `geladeira` (estoque / armazém)

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | INTEGER | Chave primária |
| `ingrediente` | TEXT | Nome do ingrediente |
| `quantidade` | INTEGER | Quantidade em estoque |
| `validade` | DATE/TEXT | Data de validade (formato `YYYY-MM-DD`) |
| `categoria` | TEXT | Categoria (`carnes`, `vegetais`, `temperos`) |
| `preco_custo` | REAL | Custo unitário do ingrediente |

### 4.2 Tabela `clientes`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | INTEGER | Chave primária |
| `mesa` | INTEGER | Número da mesa |
| `status` | TEXT | Estado do cliente (`esperando`, `comendo`, `irritado`) |
| `numero_pessoas` | INTEGER | Quantidade de pessoas na mesa |
| `horario_chegada` | TIME/TEXT | Horário de chegada |

### 4.3 Tabela `pedidos`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | INTEGER | Chave primária |
| `mesa_id` | INTEGER | Chave estrangeira → `clientes.id` |
| `prato_pedido` | TEXT | Nome do prato solicitado |
| `prioridade` | TEXT | `VIP` ou `normal` |

### 4.4 Tabela `receitas`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | INTEGER | Chave primária |
| `nome_prato` | TEXT | Nome do prato |
| `ingrediente_necessario` | TEXT | Ingrediente usado na receita |
| `quantidade_necessaria` | INTEGER | Quantidade necessária por porção |

### 4.5 Esquema SQL de referência (SQLite)

```sql
CREATE TABLE geladeira (
  id           INTEGER PRIMARY KEY,
  ingrediente  TEXT NOT NULL,
  quantidade   INTEGER NOT NULL DEFAULT 0,
  validade     TEXT NOT NULL,
  categoria    TEXT NOT NULL,
  preco_custo  REAL NOT NULL DEFAULT 0
);

CREATE TABLE clientes (
  id             INTEGER PRIMARY KEY,
  mesa           INTEGER NOT NULL,
  status         TEXT NOT NULL,
  numero_pessoas INTEGER NOT NULL DEFAULT 1,
  horario_chegada TEXT NOT NULL
);

CREATE TABLE pedidos (
  id           INTEGER PRIMARY KEY,
  mesa_id      INTEGER NOT NULL REFERENCES clientes(id),
  prato_pedido TEXT NOT NULL,
  prioridade   TEXT NOT NULL
);

CREATE TABLE receitas (
  id                   INTEGER PRIMARY KEY,
  nome_prato           TEXT NOT NULL,
  ingrediente_necessario TEXT NOT NULL,
  quantidade_necessaria INTEGER NOT NULL
);
```

> **Nota de implementação:** cada fase pode ter um **seed** (conjunto de dados) próprio, carregado no início do dia. O banco é efêmero por fase (reset a cada dia), exceto o progresso global (ver Seção 10).

---

## 5. Mecânicas de Jogo

### 5.1 Dinâmica SQL (núcleo do jogo)
- O jogador resolve problemas narrativos escrevendo SQL real em um editor com destaque de sintaxe.
- Comandos permitidos por fase evoluem conforme o Dia (ver Seção 6).
- O motor executa o SQL sobre o banco embarcado e compara o **resultado** (linhas/colunas) ou o **estado do banco** (para `INSERT`/`UPDATE`/`DELETE`) com o objetivo da missão.

### 5.2 Barra de Paciência
- Cada mesa de cliente possui um "timer de paciência" visual.
- Se o jogador demora a executar o comando correto, o status do cliente muda de `esperando` → `irritado`.
- Na interface, a linha da tabela correspondente fica destacada em **vermelho**.
- Clientes irritados reduzem a pontuação máxima da fase (mas não travam o progresso).

### 5.3 Visualização Reativa (animações)
- Uma cena 2D (pixel art) no topo da tela reage aos comandos executados. Exemplos:
  - `SELECT` → o chefe abre a geladeira.
  - `DELETE` → o chefe joga itens vencidos no lixo.
  - `INSERT` → o chefe guarda novos ingredientes.
  - `UPDATE` → o chefe reorganiza/etiqueta itens.
  - `JOIN` → uma "linha de montagem" conecta pedidos e receitas.
- O cenário e os personagens possuem animações modernas (tweens, partículas, interpolações suaves) sobre a estética pixel art.

### 5.4 Modo Sandbox
- Modo livre em que o jogador pode escrever qualquer consulta e "inventar receitas" combinando ingredientes.
- Sem timer, sem pontuação, sem missões — apenas exploração do banco.

### 5.5 Sistema de Pontuação
- Pontos por acerto, com bônus por velocidade (paciência restante) e por eficiência (consulta correta em menos tentativas).
- Penalidade leve por cliente irritado.
- Estrelas por fase (1 a 3) baseadas na pontuação final.

### 5.6 Sistema de Dicas
- Botão de dica contextual que mostra uma sugestão gradual.
- Usar dicas reduz a pontuação da fase.

### 5.7 Ao final de cada fase deve haver uma média de avaliação de 0 a 5 estrelas

- Conforme os clientes vão saindo do restaurante eles dão sua avaliação, variando de 0 a 5 estrelas (baseado no tempo de espera)

- Ao final de cada fase é exibido uma média de todas as avaliações dadas pelos npcs daquela fase

---

## 6. Progressão (Missões / Dias)

### Dia 1 — Abertura (quiosque de rua)
- **Foco:** `SELECT`, `WHERE`, `LIMIT`, `ORDER BY`.
- **Missões exemplo:**
  1. "Liste todos os ingredientes da geladeira."
  2. "Encontre os ingredientes que estão para vencer nos próximos 3 dias."
  3. "Mostre os 3 ingredientes mais caros."

### Dia 2 — Horário de Pico (restaurante médio)
- **Foco:** `COUNT`, `SUM`, `GROUP BY`.
- **Missões exemplo:**
  1. "Conte quantas pessoas estão no salão."
  2. "Identifique quantos clientes estão irritados."
  3. "Agrupe os clientes por status."

### Dia 3 — Fornecedor (estoque)
- **Foco:** `INSERT`, `UPDATE`, `DELETE`.
- **Missões exemplo:**
  1. "Registre a chegada de novos ingredientes." (`INSERT`)
  2. "Atualize a quantidade de um item após o uso." (`UPDATE`)
  3. "Remova todos os itens vencidos." (`DELETE`)

### Dia 4 — Banquete / Chefão Final (restaurante sofisticado)
- **Foco:** `INNER JOIN`.
- **Missões exemplo:**
  1. "Cruze os pedidos com as receitas para descobrir quais ingredientes são necessários."
  2. "Liste os pratos pedidos e seus ingredientes."

---

## 7. Personagens

| Personagem | Papel |
|---|---|
| **Chefe (jogador)** | Protagonista controlado pelo jogador; executa as ações SQL. |
| **Ajudante** | NPC que introduz as missões e dá contexto narrativo/dicas. |
| **Clientes** | Entidades que pressionam por velocidade (paciência) e geram os pedidos. |
| **Fornecedor** (Dia 3) | Personagem que entrega ingredientes e motiva as missões de escrita. |

---

## 8. Telas e Fluxo de Navegação

1. **Tela de Título / Menu Principal** — Logo do jogo, botões: "Jogar", "Sandbox", "Créditos/Config".
2. **Seleção de Fase (Mapa da Carreira)** — Dias desbloqueados sequencialmente; mostra estrelas conquistadas.
3. **Tela de Jogo (principal)** — Dividida em áreas (ver Seção 9).
4. **Tela de Resultado do Dia** — Pontuação, estrelas, resumo de acertos/erros, botão "Próximo Dia".
5. **Modo Sandbox** — Editor livre + visualização de dados, sem missão/timer.

---

## 9. Layout da Tela de Jogo (UI/UX)

A tela principal é dividida verticalmente (de cima para baixo):

1. **Área de Cena (topo)** — animação 2D pixel art reativa.
2. **Área de Contexto da Missão** — texto da missão atual + barra de paciência dos clientes.
3. **Área de Dados** — exibição das tabelas do banco e do resultado da última consulta.
4. **Editor SQL** — campo com destaque de sintaxe, botão "Executar" e histórico de consultas.

> Disposição alternativa: editor à esquerda, resultados à direita (layout desktop), colapsando para empilhado no mobile.

---

## 10. Requisitos Funcionais (RF)

- **RF01** — Executar comandos SQL reais (`SELECT`, `WHERE`, `LIMIT`, `ORDER BY`, `COUNT`, `SUM`, `GROUP BY`, `INSERT`, `UPDATE`, `DELETE`, `INNER JOIN`).
- **RF02** — Validar o resultado da consulta contra o objetivo da missão.
- **RF03** — Exibir erro amigável quando o SQL estiver incorreto.
- **RF04** — Barra de paciência por cliente, com transição de status para "irritado".
- **RF05** — Animação reativa ao tipo de comando executado.
- **RF06** — Sistema de pontuação e estrelas por fase.
- **RF07** — Sistema de dicas contextuais.
- **RF08** — Modo Sandbox.
- **RF09** — Progressão sequencial de fases (dias).
- **RF10** — Persistência de progresso (estrelas, dias desbloqueados) entre sessões.

---

## 11. Requisitos Não-Funcionais (RNF)

- **RNF01** — Roda 100% no navegador, sem backend obrigatório.
- **RNF02** — Execução de SQL rápida (< 50 ms por consulta típica).
- **RNF03** — Responsivo (desktop e tablet; mobile opcional).
- **RNF04** — Animações a 60 fps sem travar a digitação.
- **RNF05** — Acessibilidade básica (contraste, tamanho de fonte ajustável).
- **RNF06** — Código modular e testável (o motor de avaliação deve ser isolado da UI).

---

## 12. Tecnologias Recomendadas

### 12.1 Stack principal (recomendada)

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Linguagem | **TypeScript** | Tipagem segura do modelo de dados e do motor de avaliação. |
| Build | **Vite** | Dev server rápido, HMR, ótimo para SPA. |
| UI | **React** | Componentização das telas, ecossistema maduro. |
| Estilo | **CSS Modules** ou **Tailwind CSS** | Escopo isolado e prototipagem rápida. |
| Estado | **Zustand** | Leve, simples, bom para estado do jogo. |
| Motor SQL | **sql.js** (SQLite → WebAssembly) | Executa SQL real no navegador, sem backend. |
| Animações 2D | **Phaser 3** | Excelente para pixel art, spritesheets, tweens e partículas. |
| Testes | **Vitest** + **React Testing Library** | Testes do motor SQL e dos componentes. |
| Persistência | **localStorage** (ou IndexedDB) | Salvar progresso sem backend. |

### 12.2 Alternativas consideradas

- **Sem framework (vanilla JS + Canvas):** mais simples de distribuir, porém menos organizável em um projeto que vai crescer.
- **Angular/Svelte:** viáveis; Svelte é uma boa alternativa leve ao React.
- **Motor SQL próprio (parser customizado):** mais controle, porém muito mais trabalho e risco de comportamento divergente do SQL real. **Não recomendado.**
- **Animações via CSS/SVG:** suficientes se a cena for simples; Phaser é recomendado para cenas com sprites, partículas e estados mais ricos.
- **Backend (Node + banco real):** desnecessário para o MVP; pode ser adicionado futuramente para ranking online.

> **Recomendação final:** React + TypeScript + Vite + Zustand + sql.js + Phaser 3 (cenário) + Vitest.

---

## 13. Arquitetura do Sistema (alto nível)

```
+--------------------------------------------------------------+
|                      Camada de Apresentação (React)          |
|  Tela de Título | Seleção de Fase | Tela de Jogo | Sandbox   |
+--------------------------------------------------------------+
|                    Camada de Jogo / Estado (Zustand)         |
|  Fase atual | Missões | Pontuação | Paciência | Progresso    |
+--------------------------------------------------------------+
|                     Camada de Domínio (núcleo)               |
|  Motor SQL (sql.js) | Avaliador de Missão | Gerador de Seed  |
+--------------------------------------------------------------+
|              Camada de Apresentação Gráfica (Phaser 3)       |
|  Cena 2D pixel art | Animações reativas | Personagens        |
+--------------------------------------------------------------+
|                    Camada de Persistência (localStorage)     |
+--------------------------------------------------------------+
```

Regras importantes de separação:
- O **motor de avaliação** recebe o SQL, executa, e retorna um objeto de resultado (`correto`, `mensagem`, `linhas`, `estadoDoBanco`).
- A **UI** apenas renderiza o resultado e dispara as animações; não contém regras de avaliação.
- O **Phaser** é alimentado por eventos ("comando executado", "acerto", "erro") vindos do estado.

---

## 14. Estrutura de Pastas (sugestão)

```
chef-sql/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── public/
│   └── assets/            # sprites, tilesets, fontes pixel art
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── styles/
    ├── game/
    │   ├── store/         # Zustand stores
    │   ├── engine/        # sql.js wrapper, evaluator
    │   ├── data/          # seeds das fases, definições de missões
    │   ├── scoring/       # regras de pontuação
    │   └── scene/         # Phaser scenes
    ├── components/
    │   ├── EditorSql/
    │   ├── TabelaDados/
    │   ├── BarraPaciencia/
    │   ├── Missao/
    │   └── Resultado/
    ├── screens/
    │   ├── Titulo/
    │   ├── SelecaoFase/
    │   ├── Jogo/
    │   └── Sandbox/
    └── tests/
```

---

## 15. Motor de Avaliação de SQL (especificação)

Cada missão é definida por:
- `descricao` (texto apresentado ao jogador).
- `tipo` (`consulta` ou `mutacao`).
- `validacao`:
  - Para `consulta`: uma **consulta de referência** cujo resultado é comparado com o do jogador.
  - Para `mutacao`: uma lista de **asserções de estado**.
- `dicas` (array ordenado de dicas graduais).
- `pontos_max`.

**Fluxo de avaliação:**
1. Executar SQL do jogador. Em erro → `{ correto: false, tipo: 'erro_sql', mensagem }`.
2. Se `consulta`: executar a consulta de referência e comparar conjuntos/ordem.
3. Se `mutacao`: aplicar asserções de estado.
4. Retornar resultado com métricas para pontuação (tentativas, tempo, dicas usadas, paciência restante).

> Nota: o avaliador deve ser **determinístico** e **puro** (sem dependência da UI), facilitando testes unitários.

---

## 16. Design Visual — Pixel Art Retro + Animações Modernas

### 16.1 Estética
- **Pixel art estilo retro** (16-bit / inspiração em jogos clássicos) para cenários, personagens e objetos.
- Paleta de cores coesa para a cozinha (madeira, metal, vegetais, carnes) com acentos vibrantes.
- Tipografia pixel art para títulos e uma fonte legível para os textos de missão e editor.

### 16.2 Animações modernas sobre o pixel art
- **Interpolações suaves (tweens)** para movimentos de personagens.
- **Partículas** (vapor, faíscas, migalhas) em ações.
- **Easing** moderno (cubic-bezier) em transições de UI.
- **Efeitos de "squash & stretch"** sutis nos personagens ao reagir.
- **Transições de tela** suaves (fade, slide).
- O objetivo é o "retro com fluidez": visual nostálgico, movimento contemporâneo.

### 16.3 Animações específicas por comando

| Comando | Animação |
|---|---|
| `SELECT` | Chefe abre a geladeira; brilho nos itens encontrados. |
| `INSERT` | Chefe guarda caixas de ingredientes nas prateleiras. |
| `UPDATE` | Chefe reetiqueta/reorganiza itens; números sobem. |
| `DELETE` | Chefe joga itens vencidos no lixo; partículas de poeira. |
| `INNER JOIN` | Linhas de montagem conectam pedidos às receitas. |
| Erro | Personagem dá de ombros / ponto de interrogação; leve shake. |

---

## 17. Critérios de Aceitação (resumo)

- [ ] O jogo executa SQL real no navegador via sql.js.
- [ ] Todos os comandos-alvo (Seção 1) estão presentes nas missões.
- [ ] O avaliador valida corretamente acertos e erros por missão.
- [ ] A barra de paciência funciona e reflete status "irritado" na tabela (linha vermelha).
- [ ] Animações reagem ao tipo de comando executado.
- [ ] Modo Sandbox permite consultas livres.
- [ ] Progresso persiste entre sessões.
- [ ] O jogo roda sem backend e é responsivo.
- [ ] Testes unitários cobrem o motor de avaliação.

---

## 18. MVP e Roadmap

### MVP (v1)
- Tela de título, seleção de fase, tela de jogo e resultado.
- Dias 1 e 2 completos.
- Motor SQL + avaliador.
- Barra de paciência + animações básicas de `SELECT`/`DELETE`.
- Modo Sandbox básico.
- Persistência de progresso.

### v2
- Dias 3 e 4 (`INSERT`/`UPDATE`/`DELETE` e `INNER JOIN`).
- Dicas contextuais completas.
- Animações mais ricas (partículas, tweens).
- Efeitos sonoros (opcional).

### v3 (futuro)
- Novas fases (subconsultas, `HAVING`, views).
- Ranking online e compartilhamento de conquistas.
- Editor de fases/customização de missões.

---

## 19. Glossário

| Termo | Definição |
|---|---|
| **Dia / Fase** | Uma etapa da carreira com missões e comandos-alvo específicos. |
| **Seed** | Conjunto inicial de dados carregado no banco ao iniciar a fase. |
| **Missão** | Objetivo individual que o jogador resolve com SQL. |
| **Paciência** | Timer que mede a pressa dos clientes em cada mesa. |
| **Avaliador** | Componente que verifica se o SQL do jogador cumpre a missão. |

---

*Fim da especificação.*
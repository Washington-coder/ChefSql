# AGENTS.md

## Projeto

**Chef SQL** é um jogo de navegador para aprender e praticar SQL. O jogador é um chefe de cozinha que gerencia um restaurante resolvendo missões narrativas com comandos SQL reais (`SELECT`, `WHERE`, `LIMIT`, `ORDER BY`, `COUNT`, `SUM`, `GROUP BY`, `INSERT`, `UPDATE`, `DELETE`, `INNER JOIN`). A progressão é dividida em "Dias de Trabalho" (Dia 1 a Dia 4), do quiosque de rua ao restaurante sofisticado.

- **Especificação funcional completa**: `especificacao-chef-sql.md` — é a **fonte da verdade** para regras do jogo, tabelas, missões, telas e critérios de aceitação. Leia antes de implementar qualquer feature.
- **Visual**: pixel art estilo retro + animações modernas (tweens, partículas, easing suave, squash & stretch).
- **Arquitetura**: SPA 100% client-side, sem backend obrigatório. O SQL roda no navegador via `sql.js` (SQLite em WebAssembly).

## Stack

| Camada | Tecnologia |
|---|---|
| Linguagem | TypeScript (`strict`) |
| Build / dev server | Vite |
| UI | React |
| Estado | Zustand |
| Motor SQL | sql.js |
| Cena 2D / animações de jogo | Phaser 3 |
| Testes | Vitest + React Testing Library (+ Playwright para E2E, opcional) |
| Lint / formatação | ESLint (flat config com type-checking) + Prettier |
| Persistência | `localStorage` (via um módulo de storage isolado) |

> A stack acima é uma proposta da especificação. Se o usuário decidir mudar algo, atualize esta seção, a seção de Comandos e o `README.md` juntos.

## Comandos

```bash
npm install            # instala dependências
npm run dev            # servidor de desenvolvimento do Vite com HMR — http://localhost:5173
npm run build          # type-check (tsc --noEmit) + build de produção do Vite em dist/
npm run preview        # serve o build de produção localmente
npm run typecheck      # verifica tipos sem gerar artefatos (tsc --noEmit)
npm run lint           # ESLint
npm run lint:fix       # corrige lint automaticamente
npm run format         # formata tudo com Prettier
npm run format:check   # verifica formatação (Prettier)
npm test               # roda a suíte de testes (vitest run) uma única vez
npm run test:watch     # roda os testes em modo watch
npm run test:coverage  # roda os testes com relatório de cobertura
npx vitest run src/game/engine/evaluator.test.ts  # roda apenas um arquivo de teste
```

> ⚠️ **Regra obrigatória**: sempre que um comando for **inserido, alterado ou removido** — no `package.json` ou em qualquer outra ferramenta do projeto — atualize o `README.md` **e** esta seção do `AGENTS.md` no mesmo commit/PR. O inverso também vale: nunca remova um script do `package.json` sem removê-lo de ambos os documentos.

## Estrutura (modular por feature)

```
src/
  main.tsx                 # bootstrap do React
  App.tsx                  # roteamento entre telas (title, level select, game, result, sandbox)
  game/
    engine/                # núcleo puro — NÃO importa React nem Phaser
      sqlDatabase.ts       # wrapper do sql.js: criar banco, executar query, reset
      evaluator.ts         # compara a query do jogador com o objetivo da missão
      evaluator.test.ts
      commandDetector.ts   # identifica o tipo de comando (SELECT, DELETE...) para animações
    levels/                # conteúdo do jogo (dados, não lógica)
      day1/
        seed.sql           # dados iniciais do dia
        missions.ts        # definição das missões do dia
      day2/ ...
      schema.sql           # CREATE TABLE das 4 tabelas do jogo
    scoring/
      scoring.ts           # cálculo de pontos e estrelas (funções puras)
      scoring.test.ts
    patience/
      patience.ts          # regras da barra de paciência (funções puras)
      patience.test.ts
    store/                 # stores do Zustand (orquestram engine + scoring + patience)
      gameStore.ts
      progressStore.ts
    scene/                 # Phaser: cenas, sprites, animações
      KitchenScene.ts
      animations.ts
      sceneEvents.ts       # contrato de eventos entre o jogo e a cena
    storage/
      progressStorage.ts   # leitura/escrita no localStorage (único ponto de acesso)
  components/              # componentes de UI reutilizáveis
    SqlEditor/
      SqlEditor.tsx
      SqlEditor.test.tsx
    DataTable/
    PatienceBar/
    MissionPanel/
    HintButton/
  screens/                 # telas completas, compostas de componentes
    TitleScreen/
    LevelSelectScreen/
    GameScreen/
    ResultScreen/
    SandboxScreen/
  shared/                  # utilitários genéricos (formatters, tipos comuns, hooks)
public/
  assets/                  # sprites, spritesheets, tilesets, fontes pixel art
```

Regras da estrutura:

- **Cada pasta tem uma responsabilidade clara** e nenhum arquivo acumula dois papéis.
- **`game/engine`, `game/scoring` e `game/patience` são lógica pura**: não importam React, Phaser, Zustand nem `localStorage`. Isso garante que sejam fáceis de testar.
- **Fluxo de dependência**: `screens` → `components` → `store` → `engine/scoring/patience`. Nunca o contrário. A cena do Phaser apenas **escuta eventos** (`sceneEvents.ts`); ela não decide regras do jogo.
- **Conteúdo separado de lógica**: missões, seeds e textos ficam em `game/levels/`. Adicionar um novo dia ou missão não deve exigir mudar o motor.
- Testes ficam **ao lado do arquivo testado** (`foo.ts` + `foo.test.ts`).

## Nomenclatura e idioma

- **Todo código em inglês**: nomes de variáveis, funções, classes, tipos, arquivos, pastas, componentes, stores, eventos e mensagens de commit no escopo técnico. Ex.: `evaluateQuery`, `PatienceBar`, `missionId`, `isCustomerAngry` — nunca `avaliarConsulta` ou `barraPaciencia`.
- **Exceção — conteúdo do jogo**: tudo que o jogador vê pode ser em português, incluindo textos das missões, falas dos personagens, rótulos da UI e os **nomes das tabelas/colunas do banco do jogo** (`geladeira`, `clientes`, `pedidos`, `receitas`), porque fazem parte da experiência de aprendizado. Esses valores vivem em `game/levels/` (ou em um arquivo de textos), nunca espalhados pelo código.
- Convenções:
  - `camelCase` para variáveis e funções.
  - `PascalCase` para componentes React, classes, tipos e interfaces.
  - `UPPER_SNAKE_CASE` para constantes globais (ex.: `MAX_STARS`, `PATIENCE_DURATION_MS`).
  - Booleanos começam com `is`, `has`, `can`, `should` (ex.: `isCompleted`, `hasUsedHint`).
  - Funções descrevem ação com verbo (ex.: `calculateScore`, `resetDatabase`, `loadProgress`).
  - Hooks começam com `use` (ex.: `usePatienceTimer`).
- Nomes devem ser **descritivos e sem abreviações obscuras** (`customer`, não `cst`; `query`, não `q`, exceto em escopos de 1–2 linhas).

## Filosofia de código: modular e fácil de entender

O objetivo é um código que **qualquer pessoa entenda lendo uma vez**. Prefira simplicidade a abstração.

- **Modularidade > abstração**: divida o código em módulos pequenos com responsabilidades claras, mas **não crie camadas, interfaces, factories ou padrões genéricos "para o futuro"**. Só abstraia quando houver pelo menos 2–3 usos reais (regra de três).
- **Funções pequenas e com um propósito**: se uma função precisa de um comentário explicando "e depois ela também...", ela deve ser dividida.
- **Funções puras sempre que possível**: entradas → saída, sem efeitos colaterais. Efeitos (timers, storage, sql.js, Phaser) ficam nas bordas.
- **Explícito > mágico**: evite metaprogramação, herança profunda, decorators e generics complexos. Composição de funções e objetos simples é o padrão.
- **SOLID e DRY na medida do possível**: aplique quando deixar o código mais claro; não aplique se aumentar indireção sem ganho real.
- **Componentes React**: componentes de apresentação recebem props e renderizam; lógica de jogo fica no store/engine. Componentes com mais de ~150 linhas são candidatos a divisão.
- **Comentários explicam o "porquê"**, não o "o quê". Código autoexplicativo dispensa comentário.
- **Sem números mágicos**: valores de balanceamento (tempo de paciência, pontos, penalidades) ficam em constantes nomeadas, idealmente em um único arquivo de configuração do jogo (ex.: `game/config.ts`).

## Refatoração contínua

- **Sempre sugira refatorações** quando encontrar oportunidades: duplicação, código morto, funções sem uso, nomes ruins, funções longas, acoplamento desnecessário, componentes inchados.
- **Não misture refatoração grande com feature nova sem avisar**: se a refatoração for pequena e local, faça junto; se for grande, **proponha ao usuário** primeiro e faça em um commit separado (`refactor:`).
- **Refatore com rede de segurança**: garanta que há testes cobrindo o comportamento antes de mudar a estrutura. Se não houver, escreva o teste primeiro.
- Ao final de cada tarefa, liste brevemente (se houver) **sugestões de melhoria** que você percebeu mas não implementou.

## Testes automatizados

Testes são obrigatórios. Eles são a especificação executável do jogo.

- **Framework**: Vitest (unitário/integração) + React Testing Library (componentes). Playwright é opcional para fluxos E2E críticos.
- **O que testar obrigatoriamente**:
  - `engine/evaluator`: acerto, erro de sintaxe, resultado errado, ordem relevante vs. irrelevante, missões de mutação (`INSERT`/`UPDATE`/`DELETE`) validadas pelo estado do banco.
  - `engine/commandDetector`: cada tipo de comando mapeado corretamente.
  - `scoring`: cálculo de pontos, bônus, penalidades e estrelas, incluindo casos-limite (0 pontos, pontuação máxima).
  - `patience`: transição `esperando` → `irritado` no tempo correto.
  - **Cada missão de cada dia**: um teste que executa a solução de referência contra o seed e verifica que ela é aceita pelo avaliador. Isso garante que nenhuma missão fique impossível.
  - `storage`: salvar/carregar progresso, incluindo dados corrompidos ou ausentes.
  - Componentes principais (`SqlEditor`, `DataTable`, `PatienceBar`): renderização e interações do usuário.
- **Boas práticas**:
  - Nome do teste descreve o comportamento: `it('marks customer as angry when patience reaches zero')`.
  - Padrão **Arrange / Act / Assert**.
  - Testes independentes e determinísticos: cada teste cria seu próprio banco sql.js; use `vi.useFakeTimers()` para timers de paciência.
  - Teste comportamento, não implementação. Em componentes, busque elementos por papel/texto (`getByRole`), não por classes CSS.
  - Phaser não precisa de teste unitário de renderização; teste apenas a lógica que decide **qual** animação disparar.
- **Cobertura**: meta mínima de **80%** em `src/game/engine`, `src/game/scoring` e `src/game/patience`. Não persiga 100% em UI.
- Bugs corrigidos devem vir acompanhados de um **teste de regressão** que falhava antes da correção.

## Diretrizes técnicas específicas

### TypeScript
- `strict: true`. Evite `any` (use `unknown` + narrowing). Evite casts (`as`) desnecessários.
- Tipos do domínio centralizados por módulo (ex.: `Mission`, `EvaluationResult`, `CustomerStatus`).
- Prefira union types de strings a enums: `type CustomerStatus = 'waiting' | 'eating' | 'angry'`.

### Motor SQL (sql.js)
- Toda interação com o sql.js passa por `sqlDatabase.ts`. Nenhum outro arquivo importa `sql.js` diretamente.
- O arquivo `.wasm` deve ser carregado de forma assíncrona e tratado com estado de loading na UI.
- **Sempre trate erros de SQL** e converta em mensagens amigáveis em português para o jogador. Nunca deixe uma exceção do sql.js derrubar a tela.
- Cada fase cria um banco novo a partir de `schema.sql` + `seed.sql`. Não reaproveite estado entre fases.
- Libere bancos não usados (`db.close()`) para evitar vazamento de memória.
- Proteja o jogo de queries muito pesadas (ex.: limite de linhas exibidas no resultado).

### Estado (Zustand)
- Um store por responsabilidade (`gameStore` para a partida atual, `progressStore` para progresso persistente).
- Actions com nomes de verbo (`submitQuery`, `useHint`, `startLevel`).
- Use seletores para evitar re-renderizações desnecessárias.

### Phaser e animações
- A cena se comunica com o React **somente** por eventos tipados definidos em `sceneEvents.ts` (ex.: `queryExecuted`, `missionCompleted`, `queryFailed`).
- Pixel art: desative suavização (`pixelArt: true`, `image-rendering: pixelated`) e use escala inteira.
- Animações de UI (fora do canvas) via CSS transitions/keyframes; respeite `prefers-reduced-motion`.
- Animações nunca devem bloquear o input do editor SQL.

### Performance e acessibilidade
- Alvo de 60 fps na cena; evite re-render do React a cada frame.
- Lazy-load do Phaser e do sql.js se o bundle inicial ficar grande.
- Contraste adequado, navegação por teclado no editor e botões, foco visível, `aria-label` em botões só com ícone.
- Atalho de teclado para executar a query (ex.: `Ctrl+Enter`).

## Fluxo de trabalho para agentes

1. **Leia** a especificação (`especificacao-chef-sql.md`) e este arquivo antes de começar.
2. **Entenda a tarefa** e, se algo for ambíguo, pergunte ao usuário antes de assumir.
3. **Planeje em passos pequenos** e entregáveis (uma feature/missão/componente por vez).
4. **Escreva ou atualize os testes** do comportamento esperado.
5. **Implemente** a solução mais simples que passa nos testes.
6. **Refatore** mantendo os testes verdes.
7. **Valide** com lint, format, typecheck, testes e build.
8. **Resuma** o que foi feito, os arquivos alterados e as sugestões de refatoração pendentes.

## Commits e versionamento

- **Conventional Commits**: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`, `perf:`, `style:`, `build:`, `ci:`.
- Mensagens curtas e no imperativo (ex.: `feat: add day 1 missions`, `test: cover evaluator ordering rules`).
- Commits pequenos e atômicos: uma mudança lógica por commit.
- Não misture formatação em massa com mudanças de lógica.

## Formatação

- Prettier: sem ponto e vírgula, aspas simples, `printWidth` 100, trailing commas, EOL **LF** (forçado por `.gitattributes`).
- ESLint com regras de React Hooks (`rules-of-hooks`, `exhaustive-deps`) e TypeScript type-aware.
- `no-console` como warning: use `console` apenas em desenvolvimento e remova antes do commit.

## O que NÃO fazer

- **Não instale dependências de terceiros sem antes perguntar** ao usuário.
- **Não desative, remova, pule (`.skip`) ou comente testes existentes** para fazer uma nova feature passar — eles são a especificação do comportamento esperado.
- **Não crie abstrações especulativas** (camadas genéricas, interfaces com uma única implementação, "managers" e "helpers" vagos).
- **Não coloque regra de jogo em componentes React nem na cena do Phaser.**
- **Não use nomes em português no código** (exceto conteúdo voltado ao jogador, conforme a seção de Nomenclatura).
- **Não altere o schema das tabelas do jogo** sem atualizar `schema.sql`, os seeds, as missões afetadas, seus testes e a especificação.
- Não edite arquivos gerados (`dist/`, relatórios de cobertura) nem arquivos de ambiente (`.env`).
- Não deixe código comentado, `TODO` sem contexto ou `console.log` esquecido.

## Critérios de pronto (Definition of Done)

O código só é considerado pronto quando:

- Passa em `npm run lint`, `npm run format:check` e `npm run typecheck`.
- **Toda funcionalidade nova tem testes automatizados** cobrindo o comportamento esperado.
- **Todos os testes passam** (`npm test`).
- `npm run build` termina sem erros.
- Toda missão nova tem um teste validando que sua solução de referência é aceita.
- O código segue a nomenclatura em inglês e a estrutura descrita aqui.
- `README.md` e `AGENTS.md` estão atualizados se comandos, stack ou estrutura mudaram.

## Gotchas

- **sql.js precisa do `.wasm`**: configure o caminho com `locateFile` e garanta que o Vite copie o arquivo para o build (ex.: importar com `?url` ou colocar em `public/`). Em testes (Node), o carregamento é diferente do navegador — centralize isso em `sqlDatabase.ts`.
- **Datas no SQLite**: SQLite não tem tipo `DATE` nativo. Guarde datas como texto `YYYY-MM-DD` e, nas missões de validade, use uma "data atual do jogo" fixa por fase (não `date('now')`), para manter os testes determinísticos.
- **Comparação de resultados**: ao avaliar queries, normalize nomes de colunas/aliases e só exija ordem quando a missão pedir `ORDER BY`.
- **Phaser + React**: crie a instância do Phaser uma única vez e destrua no unmount do componente (cuidado com o `StrictMode` montando duas vezes em desenvolvimento).
- **Timers de paciência**: pause os timers quando a aba perder o foco ou o jogo estiver pausado, para não punir o jogador injustamente.

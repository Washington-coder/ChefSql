# Tarefas do Projeto — Chef SQL

> Lista de tarefas derivada de [`specifications.md`](specifications.md).
> Marque com `[x]` as tarefas concluídas. O número entre parênteses indica a seção da especificação de origem.

## Legenda

- `[x]` — concluído
- `[ ]` — pendente

---

## 1. Infraestrutura e configuração (spec §12, §14)

- [x] Criar `package.json` com scripts de dev, build, typecheck, lint, format e teste
- [x] Instalar dependências: React, React DOM, Zustand, sql.js, Phaser, Vitest, Testing Library, ESLint, Prettier, TypeScript, Vite
- [x] Configurar `tsconfig.json` com `strict: true`
- [x] Configurar `vite.config.ts` (plugin React + runner de testes Vitest)
- [x] Configurar ESLint (flat config com type-checking e regras de React Hooks)
- [x] Configurar Prettier (sem ponto e vírgula, aspas simples, width 100)
- [x] Criar `.gitignore`, `.gitattributes` (EOL LF) e `.prettierignore`
- [x] Criar `index.html` (lang pt-BR, title, root, meta viewport)
- [x] Organizar estrutura de pastas modular (`src/game/engine|levels|scoring|patience|store|scene|storage`, `src/components`, `src/screens`, `src/shared`, `src/styles`, `src/test`)
- [x] Baixar fonte pixel art local (Press Start 2P) em `public/assets/fonts` (offline, sem CDN)
- [x] Criar estilos globais com paleta de cozinha e classes de botão pixel art
- [x] Respeitar `prefers-reduced-motion` (spec §16.2)

## 2. Tela de Título (spec §8, §16)

- [x] Exibir logo "CHEF SQL" com fonte pixel art animada (squash & stretch na entrada)
- [x] Exibir botões "Jogar", "Sandbox" e "Créditos"
- [x] Implementar modal de Créditos (fecha com botão ou tecla `Escape`)
- [x] Animações de fundo (vapor subindo, scanlines CRT)
- [x] Testes da tela de título (renderização, navegação, créditos)
- [x] Navegação básica do `App.tsx` entre as 5 telas (title, level select, game, result, sandbox)

## 3. Banco de dados do jogo (spec §4, §5.1)

- [ ] Criar `src/game/levels/schema.sql` com as 4 tabelas: `geladeira`, `clientes`, `pedidos`, `receitas`
- [ ] Criar wrapper `sqlDatabase.ts` do sql.js (criar banco, executar query, reset, `db.close()`)
- [ ] Carregar o `.wasm` de forma assíncrona com estado de loading na UI (gotcha sql.js)
- [ ] Copiar/importar o `.wasm` para o build do Vite (`?url` ou `public/`)
- [ ] Usar data atual fixa por fase (texto `YYYY-MM-DD`) para validade — determinismo nos testes
- [ ] Proteger o jogo de queries muito pesadas (limite de linhas exibidas)
- [ ] Criar seeds dos dias 1 a 4 em `src/game/levels/dayN/seed.sql`

## 4. Motor de avaliação (spec §5.1, §15)

- [ ] Criar `evaluator.ts` — comparar query do jogador com consulta de referência (colunas/aliases normalizados)
- [ ] Suportar validação por estado do banco para missões de mutação (`INSERT`/`UPDATE`/`DELETE`)
- [ ] Exigir `ORDER BY` somente quando a missão pedir ordem
- [ ] Converter erros de SQL em mensagens amigáveis em português (nunca derrubar a tela)
- [ ] Criar `commandDetector.ts` — identificar tipo de comando (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `JOIN`) para animações
- [ ] Testes do avaliador: acerto, erro de sintaxe, resultado errado, ordem relevante vs. irrelevante, mutações
- [ ] Testes do `commandDetector` para cada tipo de comando

## 5. Seleção de Fase / Mapa da Carreira (spec §8)

- [ ] Implementar tela com os dias desbloqueados sequencialmente
- [ ] Exibir estrelas conquistadas por dia
- [ ] Persistir desbloqueio e estrelas (ver seção 12)

## 6. Tela de Jogo (spec §9)

- [ ] Montar layout vertical: cena 2D no topo, contexto da missão, área de dados, editor SQL
- [ ] Componente `MissionPanel` — texto da missão atual
- [ ] Componente `DataTable` — exibir tabelas do banco e resultado da última query (linha destacada em vermelho quando cliente irritado)
- [ ] Componente `SqlEditor` — editor com destaque de sintaxe, botão "Executar" e histórico de consultas
- [ ] Atalho de teclado `Ctrl+Enter` para executar a query
- [ ] Feedback visual imediato de acerto (animação de sucesso) e erro (mensagem amigável, sem penalidade dura)

## 7. Barra de Paciência (spec §5.2, §5.7, RF04)

- [ ] Implementar `patience.ts` (funções puras) — transição `esperando` → `comendo` → `irritado`
- [ ] Componente `PatienceBar` ligado a cada mesa de cliente
- [ ] Pausar timers quando a aba perder o foco ou o jogo estiver pausado
- [ ] Testes do módulo de paciência (transição no tempo correto, timers falsos)
- [ ] Clientes irritados reduzem a pontuação máxima da fase (mas não travam o progresso)

## 8. Sistema de Avaliação dos Clientes (spec §5.7)

- [ ] Cada cliente sai do restaurante dando avaliação de 0 a 5 estrelas (baseada no tempo de espera)
- [ ] Exibir média das avaliações dos NPCs ao final de cada fase

## 9. Pontuação e Estrelas (spec §5.5, RF06)

- [ ] Implementar `scoring.ts` (funções puras) — pontos por acerto, bônus por velocidade e eficiência (menos tentativas)
- [ ] Penalidade leve por cliente irritado e por uso de dicas
- [ ] Estrelas por fase (1 a 3) baseadas na pontuação final
- [ ] Testes do scoring: casos-limite (0 pontos, pontuação máxima), bônus e penalidades

## 10. Sistema de Dicas (spec §5.6, RF07)

- [ ] Componente `HintButton` — dica contextual gradual (array de dicas ordenadas)
- [ ] Registrar uso de dica para reduzir a pontuação

## 11. Sandbox (spec §5.4, RF08)

- [ ] Implementar modo livre — qualquer consulta, sem timer, sem pontuação, sem missões
- [ ] Exibir tabelas do banco para exploração

## 12. Persistência de progresso (spec §10, RF10)

- [ ] Criar `progressStorage.ts` — único ponto de acesso ao `localStorage`
- [ ] Salvar/carregar: dias desbloqueados, estrelas conquistadas, avaliações
- [ ] Testes do storage: dados corrompidos ou ausentes

## 13. Cena 2D (Phaser) e Animações (spec §5.3, §16)

- [ ] Integrar Phaser com React (instância única, destruir no unmount, cuidado com StrictMode)
- [ ] Criar `KitchenScene.ts` (pixel art, `pixelArt: true`, escala inteira)
- [ ] Definir contrato de eventos em `sceneEvents.ts` (`queryExecuted`, `missionCompleted`, `queryFailed`)
- [ ] Animar `SELECT` → chefe abre a geladeira
- [ ] Animar `DELETE` → chefe joga itens no lixo
- [ ] Animar `INSERT` → chefe guarda caixas nas prateleiras
- [ ] Animar `UPDATE` → chefe reetiqueta/organiza itens
- [ ] Animar `INNER JOIN` → linha de montagem conecta pedidos e receitas
- [ ] Animar erro → personagem dá de ombros / leve shake
- [ ] Sprites/tilesets/fontes em `public/assets/sprites`, `public/assets/tilesets`
- [ ] Lazy-load do Phaser e do sql.js se o bundle inicial ficar grande
- [ ] Manter 60 fps na cena sem re-render do React por frame

## 14. Conteúdo — Dias e Missões (spec §6, §7)

- [ ] **Dia 1 — Quiosque** (`SELECT`, `WHERE`, `LIMIT`, `ORDER BY`): listar ingredientes, validades próximas, 3 ingredientes mais caros
- [ ] **Dia 2 — Horário de Pico** (`COUNT`, `SUM`, `GROUP BY`): contar pessoas no salão, clientes irritados, agrupar por status
- [ ] **Dia 3 — Fornecedor** (`INSERT`, `UPDATE`, `DELETE`): registrar ingredientes, atualizar quantidades, remover vencidos
- [ ] **Dia 4 — Banquete** (`INNER JOIN`): cruzar pedidos com receitas, listar pratos e ingredientes
- [ ] Teste de cada missão de cada dia: solução de referência é aceita pelo avaliador contra o seed
- [ ] Personagens: diálogos e contexto narrativo do Ajudante (e Fornecedor no Dia 3)

## 15. Tela de Resultado do Dia (spec §8, §5.7)

- [ ] Exibir pontuação, estrelas (1 a 3) e média de avaliação (0 a 5)
- [ ] Resumo de acertos/erros
- [ ] Botão "Próximo Dia"

## 16. Testes e Qualidade (spec §17, AGENTS.md "Critérios de pronto")

- [x] Testes da tela de título
- [ ] Testes dos componentes principais (`SqlEditor`, `DataTable`, `PatienceBar`)
- [ ] Cobertura mínima de 80% em `src/game/engine`, `src/game/scoring` e `src/game/patience`
- [ ] Bug corrigido sempre acompanhado de teste de regressão
- [x] Pipeline verde: `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test`, `npm run build`
- [ ] Revisar responsividade (desktop e tablet; mobile opcional, RNF03)
- [ ] Acessibilidade: contraste, navegação por teclado, `aria-label` em botões só com ícone (RNF05)

## 17. Metas do MVP e v2 (spec §18)

- [ ] MVP (v1): dias 1 e 2 completos, motor SQL + avaliador, paciência, animações básicas, sandbox básico, persistência
- [ ] v2: dias 3 e 4, dicas completas, animações ricas (partículas, tweens), efeitos sonoros (opcional)
- [ ] v3 (futuro): subconsultas, `HAVING`, views, ranking online

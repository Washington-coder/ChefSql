import { useEffect, useState } from 'react'
import DataTable from '../../components/DataTable/DataTable'
import SqlEditor from '../../components/SqlEditor/SqlEditor'
import {
  createGameDatabase,
  type GameDatabase,
  type SqlOutcome,
  type TableOverview,
} from '../../game/engine/sqlDatabase'
import { DAY1_EXAMPLES } from '../../game/levels/day1/examples'
import day1SeedSql from '../../game/levels/day1/seed.sql?raw'
import './GameScreen.css'

interface GameScreenProps {
  dayId: number
  onExit: () => void
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; database: GameDatabase; tables: TableOverview[] }

function GameScreen({ dayId, onExit }: GameScreenProps) {
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })
  const [editorValue, setEditorValue] = useState('')
  const [outcome, setOutcome] = useState<SqlOutcome | null>(null)
  const [errorCount, setErrorCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    createGameDatabase(day1SeedSql)
      .then((database) => {
        if (cancelled) {
          database.close()
          return
        }
        setLoadState({ status: 'ready', database, tables: database.getTableOverviews() })
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadState({ status: 'error', message: String(error) })
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  function handleSubmit(sql: string) {
    if (loadState.status !== 'ready') {
      return
    }
    const nextOutcome = loadState.database.runQuery(sql)
    setOutcome(nextOutcome)
    if (nextOutcome.status === 'error') {
      // Muda a key do bloco de erro para a animação CSS disparar de novo a cada falha.
      setErrorCount((count) => count + 1)
    }
  }

  return (
    <main className="game-screen">
      <header className="game-screen__header">
        <button type="button" className="pixel-button" onClick={onExit}>
          ← Sair
        </button>
        <h1 className="game-screen__title">Dia {dayId} · Dia de Trabalho</h1>
        <span className="game-screen__badge" aria-live="polite">
          {loadState.status === 'ready'
            ? 'Banco carregado'
            : loadState.status === 'loading'
              ? 'Carregando...'
              : 'Erro ao carregar'}
        </span>
      </header>

      <section className="game-screen__content" aria-live="polite">
        {loadState.status === 'loading' ? (
          <p className="game-screen__hint">Preparando o banco da cozinha...</p>
        ) : loadState.status === 'error' ? (
          <div className="game-screen__error">
            <p className="game-screen__error-title">Não foi possível abrir a cozinha</p>
            <p className="game-screen__error-message">{loadState.message}</p>
          </div>
        ) : (
          <>
            <section className="game-screen__panel" aria-label="Cardápio do banco">
              <h2 className="game-screen__panel-title">Cardápio do banco</h2>
              <div className="game-screen__schema">
                {loadState.tables.map((table) => (
                  <div key={table.name} className="game-screen__table-card">
                    <div className="game-screen__table-head">
                      <span className="game-screen__table-name">{table.name}</span>
                      <span className="game-screen__table-count">
                        {table.rowCount} linha{table.rowCount === 1 ? '' : 's'}
                      </span>
                    </div>
                    <p className="game-screen__table-columns">{table.columns.join(' · ')}</p>
                    {table.sampleRows.length > 0 ? (
                      <DataTable columns={table.columns} rows={table.sampleRows} />
                    ) : null}
                  </div>
                ))}
              </div>
            </section>

            <section className="game-screen__panel" aria-label="Exemplos">
              <h2 className="game-screen__panel-title">Exemplos para testar</h2>
              <div className="game-screen__examples">
                <p className="game-screen__example-group">Funcionam</p>
                <div className="game-screen__chips">
                  {DAY1_EXAMPLES.works.map((example) => (
                    <button
                      key={example.label}
                      type="button"
                      className="game-screen__chip game-screen__chip--ok"
                      onClick={() => setEditorValue(example.sql)}
                    >
                      {example.label}
                    </button>
                  ))}
                </div>
                <p className="game-screen__example-group">Dão erro de propósito</p>
                <div className="game-screen__chips">
                  {DAY1_EXAMPLES.errors.map((example) => (
                    <button
                      key={example.label}
                      type="button"
                      className="game-screen__chip game-screen__chip--error"
                      onClick={() => setEditorValue(example.sql)}
                    >
                      {example.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="game-screen__panel" aria-label="Resultado">
              <h2 className="game-screen__panel-title">Resultado</h2>
              {outcome === null ? (
                <p className="game-screen__hint">
                  Escolha um exemplo acima ou escreva sua própria consulta e confirme no editor.
                </p>
              ) : outcome.status === 'error' ? (
                <div key={errorCount} className="game-screen__error" role="alert">
                  <p className="game-screen__error-title">Algo deu errado</p>
                  <p className="game-screen__error-message">{outcome.message}</p>
                  {outcome.detail ? (
                    <p className="game-screen__error-detail">Detalhe: {outcome.detail}</p>
                  ) : null}
                </div>
              ) : (
                <DataTable
                  columns={outcome.result.columns}
                  rows={outcome.result.rows}
                  totalRowCount={outcome.result.rowCount}
                  truncated={outcome.result.truncated}
                  emptyMessage="Comando executado: nenhuma linha retornada."
                />
              )}
            </section>
          </>
        )}
      </section>

      <div className="game-screen__editor">
        <SqlEditor value={editorValue} onChange={setEditorValue} onSubmit={handleSubmit} />
      </div>
    </main>
  )
}

export default GameScreen

import { useState } from 'react'
import SqlEditor from '../../components/SqlEditor/SqlEditor'
import './GameScreen.css'

interface GameScreenProps {
  dayId: number
  onExit: () => void
}

function GameScreen({ dayId, onExit }: GameScreenProps) {
  const [lastCommand, setLastCommand] = useState<string | null>(null)

  return (
    <main className="game-screen">
      <header className="game-screen__header">
        <button type="button" className="pixel-button" onClick={onExit}>
          ← Sair
        </button>
        <h1 className="game-screen__title">Dia {dayId} · Dia de Trabalho</h1>
        <span className="game-screen__badge">Em construção</span>
      </header>

      <section className="game-screen__stage" aria-live="polite">
        {lastCommand === null ? (
          <p className="game-screen__empty">
            A cena da cozinha chega em breve. Escreva uma consulta SQL no editor abaixo e confirme
            para testar o highlight de sintaxe.
          </p>
        ) : (
          <div className="game-screen__result">
            <p className="game-screen__result-label">Último comando confirmado:</p>
            <pre className="game-screen__result-sql">{lastCommand}</pre>
          </div>
        )}
      </section>

      <div className="game-screen__editor">
        <SqlEditor onSubmit={setLastCommand} />
      </div>
    </main>
  )
}

export default GameScreen

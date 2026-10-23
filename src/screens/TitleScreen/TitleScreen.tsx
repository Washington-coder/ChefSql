import { useEffect, useRef, useState } from 'react'
import './TitleScreen.css'

interface TitleScreenProps {
  onPlay: () => void
  onSandbox: () => void
}

function TitleScreen({ onPlay, onSandbox }: TitleScreenProps) {
  const [isCreditsOpen, setIsCreditsOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isCreditsOpen) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsCreditsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isCreditsOpen])

  return (
    <main className="title-screen">
      <div className="title-screen__steam" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <section className="title-screen__panel">
        <p className="title-screen__kicker">Bem-vindo ao</p>
        <h1 className="title-screen__logo" aria-label="Chef SQL">
          <span className="title-screen__logo-chef">CHEF</span>
          <span className="title-screen__logo-sql">SQL</span>
        </h1>
        <p className="title-screen__tagline">
          Aprenda SQL gerenciando seu restaurante, um dia de trabalho por vez.
        </p>
        <nav className="title-screen__menu" aria-label="Menu principal">
          <button type="button" className="pixel-button pixel-button--primary" onClick={onPlay}>
            Jogar
          </button>
          <button type="button" className="pixel-button" onClick={onSandbox}>
            Sandbox
          </button>
          <button type="button" className="pixel-button" onClick={() => setIsCreditsOpen(true)}>
            Créditos
          </button>
        </nav>
      </section>

      <footer className="title-screen__footer">v0.1.0 — feito para quem ama SQL e cozinha</footer>

      {isCreditsOpen ? (
        <div className="title-screen__overlay">
          <div
            className="title-screen__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="credits-title"
          >
            <h2 id="credits-title" className="title-screen__dialog-title">
              Créditos
            </h2>
            <p className="title-screen__dialog-text">
              Chef SQL é um jogo educativo para praticar SQL em uma cozinha real.
            </p>
            <ul className="title-screen__credits-list">
              <li>Arte e conceito: pixel art retro + animações modernas</li>
              <li>Stack: React, TypeScript, Vite, Phaser 3, sql.js</li>
            </ul>
            <button
              ref={closeButtonRef}
              type="button"
              className="pixel-button"
              onClick={() => setIsCreditsOpen(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default TitleScreen

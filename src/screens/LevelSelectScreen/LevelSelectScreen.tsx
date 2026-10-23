import './LevelSelectScreen.css'

interface LevelSelectScreenProps {
  onBack: () => void
  onSelectDay: (dayId: number) => void
}

const DAYS = [
  {
    id: 1,
    title: 'Abertura · Quiosque de Rua',
    focus: 'SELECT, WHERE, LIMIT, ORDER BY',
  },
  {
    id: 2,
    title: 'Horário de Pico · Restaurante',
    focus: 'COUNT, SUM, GROUP BY',
  },
  {
    id: 3,
    title: 'Fornecedor · Estoque',
    focus: 'INSERT, UPDATE, DELETE',
  },
  {
    id: 4,
    title: 'Banquete · Cozinha Sofisticada',
    focus: 'INNER JOIN',
  },
]

function LevelSelectScreen({ onBack, onSelectDay }: LevelSelectScreenProps) {
  return (
    <main className="level-select-screen">
      <header className="level-select-screen__header">
        <button
          type="button"
          className="pixel-button level-select-screen__back-button"
          onClick={onBack}
        >
          ← Voltar
        </button>
        <h1 className="level-select-screen__title">Mapa da Carreira</h1>
        <span className="level-select-screen__spacer" aria-hidden="true" />
      </header>

      <section className="level-select-screen__grid" aria-label="Dias de trabalho">
        {DAYS.map((day) => (
          <button
            key={day.id}
            type="button"
            className="level-select-screen__card"
            onClick={() => onSelectDay(day.id)}
          >
            <span className="level-select-screen__card-day">Dia {day.id}</span>
            <span className="level-select-screen__card-title">{day.title}</span>
            <span className="level-select-screen__card-focus">{day.focus}</span>
          </button>
        ))}
      </section>

      <footer className="level-select-screen__footer">
        Escolha um dia para começar seu expediente.
      </footer>
    </main>
  )
}

export default LevelSelectScreen

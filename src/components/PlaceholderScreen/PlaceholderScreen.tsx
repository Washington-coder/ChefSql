import './PlaceholderScreen.css'

interface PlaceholderScreenProps {
  title: string
  description: string
  onBack: () => void
}

function PlaceholderScreen({ title, description, onBack }: PlaceholderScreenProps) {
  return (
    <main className="placeholder-screen">
      <section className="placeholder-screen__panel">
        <h1 className="placeholder-screen__title">{title}</h1>
        <p className="placeholder-screen__description">{description}</p>
        <button type="button" className="pixel-button" onClick={onBack}>
          ← Voltar
        </button>
      </section>
    </main>
  )
}

export default PlaceholderScreen

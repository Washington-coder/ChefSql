import PlaceholderScreen from '../../components/PlaceholderScreen/PlaceholderScreen'

interface GameScreenProps {
  onExit: () => void
}

function GameScreen({ onExit }: GameScreenProps) {
  return (
    <PlaceholderScreen
      title="Dia de Trabalho"
      description="A tela de jogo — cena pixel art, missão, tabelas e editor SQL — é o próximo passo desta carreira."
      onBack={onExit}
    />
  )
}

export default GameScreen

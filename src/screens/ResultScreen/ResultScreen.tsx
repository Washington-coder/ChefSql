import PlaceholderScreen from '../../components/PlaceholderScreen/PlaceholderScreen'

interface ResultScreenProps {
  onBackToTitle: () => void
}

function ResultScreen({ onBackToTitle }: ResultScreenProps) {
  return (
    <PlaceholderScreen
      title="Resultado do Dia"
      description="Aqui aparecerão a pontuação, as estrelas conquistadas e a média de avaliação dos clientes."
      onBack={onBackToTitle}
    />
  )
}

export default ResultScreen

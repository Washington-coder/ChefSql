import PlaceholderScreen from '../../components/PlaceholderScreen/PlaceholderScreen'

interface LevelSelectScreenProps {
  onBack: () => void
}

function LevelSelectScreen({ onBack }: LevelSelectScreenProps) {
  return (
    <PlaceholderScreen
      title="Seleção de Fase"
      description="Escolha seu dia de trabalho. Os dias do quiosque ao restaurante sofisticado são desbloqueados conforme você avança na carreira."
      onBack={onBack}
    />
  )
}

export default LevelSelectScreen

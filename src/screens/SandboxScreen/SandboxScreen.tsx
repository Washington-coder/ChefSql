import PlaceholderScreen from '../../components/PlaceholderScreen/PlaceholderScreen'

interface SandboxScreenProps {
  onBack: () => void
}

function SandboxScreen({ onBack }: SandboxScreenProps) {
  return (
    <PlaceholderScreen
      title="Sandbox"
      description="Explore o banco da cozinha com consultas livres: sem timer, sem missões, apenas experimentação."
      onBack={onBack}
    />
  )
}

export default SandboxScreen

import { useState } from 'react'
import GameScreen from './screens/GameScreen/GameScreen'
import LevelSelectScreen from './screens/LevelSelectScreen/LevelSelectScreen'
import ResultScreen from './screens/ResultScreen/ResultScreen'
import SandboxScreen from './screens/SandboxScreen/SandboxScreen'
import TitleScreen from './screens/TitleScreen/TitleScreen'

export type ScreenName = 'title' | 'levelSelect' | 'game' | 'result' | 'sandbox'

function App() {
  const [screen, setScreen] = useState<ScreenName>('title')

  function navigate(nextScreen: ScreenName) {
    setScreen(nextScreen)
  }

  switch (screen) {
    case 'levelSelect':
      return <LevelSelectScreen onBack={() => navigate('title')} />
    case 'game':
      return <GameScreen onExit={() => navigate('title')} />
    case 'result':
      return <ResultScreen onBackToTitle={() => navigate('title')} />
    case 'sandbox':
      return <SandboxScreen onBack={() => navigate('title')} />
    case 'title':
    default:
      return (
        <TitleScreen onPlay={() => navigate('levelSelect')} onSandbox={() => navigate('sandbox')} />
      )
  }
}

export default App

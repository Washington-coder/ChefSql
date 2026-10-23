import { useState } from 'react'
import GameScreen from './screens/GameScreen/GameScreen'
import LevelSelectScreen from './screens/LevelSelectScreen/LevelSelectScreen'
import ResultScreen from './screens/ResultScreen/ResultScreen'
import SandboxScreen from './screens/SandboxScreen/SandboxScreen'
import TitleScreen from './screens/TitleScreen/TitleScreen'

export type ScreenName = 'title' | 'levelSelect' | 'game' | 'result' | 'sandbox'
export type DayId = 1 | 2 | 3 | 4

function App() {
  const [screen, setScreen] = useState<ScreenName>('title')
  const [activeDay, setActiveDay] = useState<DayId>(1)

  function navigate(nextScreen: ScreenName) {
    setScreen(nextScreen)
  }

  function handleSelectDay(dayId: number) {
    setActiveDay(dayId as DayId)
    navigate('game')
  }

  switch (screen) {
    case 'levelSelect':
      return <LevelSelectScreen onBack={() => navigate('title')} onSelectDay={handleSelectDay} />
    case 'game':
      return <GameScreen dayId={activeDay} onExit={() => navigate('levelSelect')} />
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

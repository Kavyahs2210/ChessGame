import React, { useState } from 'react'
import HomeScreen from './components/HomeScreen'
import RulesScreen from './components/RulesScreen'
import DifficultyScreen from './components/DifficultyScreen'
import Board from './components/Board'

export default function App() {
  const [screen, setScreen] = useState('home') // home | rules | difficulty | game
  const [mode, setMode] = useState(null)        // two-player | solo | trial
  const [difficulty, setDifficulty] = useState('medium')

  function handleHomeSelect(choice) {
    if (choice === 'rules') setScreen('rules')
    else if (choice === 'two-player') { setMode('two-player'); setScreen('game') }
    else if (choice === 'solo') setScreen('difficulty')
  }

  function handleDifficulty(diff) {
    setDifficulty(diff)
    setMode('solo')
    setScreen('game')
  }

  function goHome() { setScreen('home'); setMode(null) }

  return (
    <div style={{
      minHeight:'100vh',
      background:'radial-gradient(ellipse at center, #1a1a2e 0%, #0d0d1a 100%)',
    }}>
      {screen === 'home' && <HomeScreen onSelect={handleHomeSelect} />}

      {screen === 'rules' && (
        <RulesScreen
          onBack={goHome}
          onStartTrial={() => { setMode('trial'); setScreen('game') }}
        />
      )}

      {screen === 'difficulty' && (
        <DifficultyScreen onSelect={handleDifficulty} onBack={goHome} />
      )}

      {screen === 'game' && (
        <div style={{
          display:'flex', flexDirection:'column', alignItems:'center',
          justifyContent:'center', minHeight:'100vh', padding:24,
        }}>
          <h1 style={{
            color:'#f0d9b5', fontFamily:'Georgia, serif',
            fontSize:28, letterSpacing:6, marginBottom:20,
            textShadow:'0 2px 8px rgba(0,0,0,0.6)',
          }}>
            ♟ CHESS
          </h1>
          <Board mode={mode} difficulty={difficulty} onHome={goHome} />
        </div>
      )}
    </div>
  )
}

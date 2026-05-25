import GlassStatus from './scenes/Glass-status.jsx'
import Scene2 from './scenes/Scene2.jsx'
import { useState } from 'react'

export default function App() {
  const [scene, setScene] = useState(null)

  if (scene === 'glass-status') return <GlassStatus />
  if (scene === 'scene-2') return <Scene2 />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#06060e', color: 'white', fontFamily: 'monospace' }}>
      <button onClick={() => setScene('glass-status')}>Glass Status</button>
      <button onClick={() => setScene('scene-2')}>Scene 2</button>
    </div>
  )
}
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

function HandModel () {
    const { scene } = useGLTF('/female-hand-edited.glb')
    return <primitive object={scene} scale={8} position={[0, -200, 0]} />
}

// --- SCENE ---
function Scene() {
  return (
    <>
      {/* ADD YOUR LIGHTING HERE */}
      <ambientLight intensity={0.15} />

      {/* Warm accent from below — gives the spheres a slight glow as they rise */}
      <pointLight position={[0, -4, 0]} intensity={17} color="#4466ff" />

      {/* Cool fill from above */}
      <spotLight position={[0, 5, 2]} intensity={400} color="#aabbff" />
      
      <HandModel />

      <OrbitControls autoRotate autoRotateSpeed={0.3} />
    </>
  )
}

// --- ROOT ---
export default function Scene03() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#73ceb7' }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
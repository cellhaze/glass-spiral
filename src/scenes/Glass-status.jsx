import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Environment, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// --- CONFIG ---
const SPHERE_COUNT = 12       // how many spheres in the spiral
const SPIRAL_RADIUS = 2.2     // how wide the spiral is
const SPIRAL_HEIGHT = 6       // total vertical distance traveled
const SPIRAL_TURNS = 2        // how many times the spiral wraps around
const CYCLE_DURATION = 15      // seconds for one full loop
const SPHERE_SIZE = 0.18

// --- SINGLE SPHERE ---
// Each sphere knows its own offset (0..1) in the spiral cycle.
// Every frame it advances its t value and computes x/y/z from that.
function SpiralSphere({ offset }) {
  const ref = useRef()

  useFrame(({ clock }) => {
    // t runs 0→1 continuously, offset staggers each sphere
    const t = ((clock.getElapsedTime() / CYCLE_DURATION) + offset) % 1

    // y: lerp from bottom to top
    const y = THREE.MathUtils.lerp(-SPIRAL_HEIGHT / 2, SPIRAL_HEIGHT / 2, t)

    // theta: how far around the spiral (in radians)
    const theta = t * Math.PI * 2 * SPIRAL_TURNS

    // x/z: circular position at this angle
    ref.current.position.set(
      Math.cos(theta) * SPIRAL_RADIUS,
      y,
      Math.sin(theta) * SPIRAL_RADIUS
    )

    // slight scale pulse as each sphere rises — fades near top/bottom edges
    const edge = Math.sin(t * Math.PI) // 0→1→0 arc
    ref.current.scale.setScalar(0.6 + edge * 0.4)
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[SPHERE_SIZE, 32, 32]} />
      <meshStandardMaterial
        metalness={1}
        roughness={0.08}
        color="#b0b8c8"
        envMapIntensity={2.5}
      />
    </mesh>
  )
}

// --- SPIRAL GROUP ---
// Creates N spheres, evenly spaced around the cycle
function SpiralSpheres() {
  const offsets = useMemo(
    () => Array.from({ length: SPHERE_COUNT }, (_, i) => i / SPHERE_COUNT),
    []
  )

  return (
    <>
      {offsets.map((offset, i) => (
        <SpiralSphere key={i} offset={offset} />
      ))}
    </>
  )
}

// --- GLASSY DASHBOARD ---
// An Html element anchored at world origin — stays fixed in 3D space
function Dashboard() {
  return (
    <Html
      center
      position={[0, 0, 0]}
      style={{ pointerEvents: 'none' }}
    >
      <div style={{
        width: '260px',
        padding: '28px 32px',
        borderRadius: '50%',
        aspectRatio: '1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 0 60px rgba(140, 160, 255, 0.08), inset 0 0 40px rgba(255,255,255,0.02)',
        color: 'rgba(255,255,255,0.85)',
        fontFamily: '"Courier New", monospace',
        textAlign: 'center',
        userSelect: 'none',
      }}>
        <div style={{
          fontSize: '10px',
          letterSpacing: '0.25em',
          color: 'rgba(255,255,255,0.35)',
          textTransform: 'uppercase',
        }}>
          system
        </div>
        <div style={{
          fontSize: '28px',
          fontWeight: '300',
          letterSpacing: '0.05em',
          color: 'rgba(200, 210, 255, 0.9)',
          lineHeight: 1,
        }}>
          ◎
        </div>
        <div style={{
          fontSize: '10px',
          letterSpacing: '0.3em',
          color: 'rgba(255,255,255,0.2)',
          textTransform: 'uppercase',
        }}>
          online
        </div>
      </div>
    </Html>
  )
}

// --- SCENE ---
function Scene() {
  return (
    <>
      {/* Ambient base light — keep it dim for the metallic look */}
      <ambientLight intensity={0.15} />

      {/* Warm accent from below — gives the spheres a slight glow as they rise */}
      <pointLight position={[0, -4, 0]} intensity={1.2} color="#4466ff" />

      {/* Cool fill from above */}
      <pointLight position={[0, 5, 2]} intensity={0.6} color="#aabbff" />

      {/* Environment map — what makes metalness actually look metallic */}
      <Environment preset="night" />

      <SpiralSpheres />
      <Dashboard />

      {/* Slow auto-rotation, user can still drag */}
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.4}
        enableZoom={true}
        minDistance={4}
        maxDistance={16}
      />
    </>
  )
}

// --- ROOT ---
export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#06060e' }}>
      <Canvas
        camera={{ position: [0, 1, 9], fov: 50 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
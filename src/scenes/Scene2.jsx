import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { createNoise3D } from 'simplex-noise'
import * as THREE from 'three'

// --- CONFIG ---
const BLOB_COUNT = 30
const DRIFT_RADIUS = 5      // how far blobs can wander on x/z
const RISE_HEIGHT = 14         // total vertical range
const NOISE_SCALE = 0.4       // how zoomed in the noise field is (lower = slower drift)
const NOISE_STRENGTH = 1.8    // how strongly noise pushes blobs sideways
const MIN_SPEED = 0.18        // slowest rise speed
const MAX_SPEED = 0.38        // fastest rise speed

// --- SINGLE BLOB ---
function Blob({ seed }) {
  const ref = useRef()
  const noise3D = useMemo(() => createNoise3D(), [])

  // Each blob gets its own randomized properties derived from its seed
  const props = useMemo(() => ({
    speed: THREE.MathUtils.lerp(MIN_SPEED, MAX_SPEED, Math.random()),
    size: THREE.MathUtils.lerp(0.15, 0.45, Math.random()),
    // Random starting y so blobs don't all reset at the same time
    startY: THREE.MathUtils.lerp(-RISE_HEIGHT / 2, RISE_HEIGHT / 2, Math.random()),
    // Noise offset per blob — shifts each one to a different region of the noise field
    noiseOffsetX: seed * 31.7,
    noiseOffsetZ: seed * 17.3,
  }), [seed])

  // Track current y position in a ref so we can mutate it each frame
  const yRef = useRef(props.startY)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // Rise upward at this blob's speed
    yRef.current += props.speed * 0.01

    // Reset to bottom when blob exits the top — random x/z on reset for variety
    if (yRef.current > RISE_HEIGHT / 2) {
      yRef.current = -RISE_HEIGHT / 2
    }

    const y = yRef.current

    // Noise-driven horizontal drift
    // Each axis uses a different slice of the noise field (different z offset)
    const nx = noise3D(
      props.noiseOffsetX + t * NOISE_SCALE,
      y * 0.3,
      0
    ) * NOISE_STRENGTH

    const nz = noise3D(
      props.noiseOffsetZ + t * NOISE_SCALE,
      y * 0.3,
      99.9
    ) * NOISE_STRENGTH

    ref.current.position.set(
      THREE.MathUtils.clamp(nx, -DRIFT_RADIUS, DRIFT_RADIUS),
      y,
      THREE.MathUtils.clamp(nz, -DRIFT_RADIUS, DRIFT_RADIUS)
    )

    // Subtle scale breathe — blobs swell slightly as they rise, shrink near top
    const normalized = (y + RISE_HEIGHT / 2) / RISE_HEIGHT // 0→1 bottom to top
    const breathe = 0.85 + Math.sin(normalized * Math.PI) * 0.15
    ref.current.scale.setScalar(props.size * breathe)
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 32, 32]} />
      {/* REPLACE THIS MATERIAL — this is just a placeholder */}
    <meshStandardMaterial
        color="#ff4422"
        metalness={0}
        roughness={0.6}
        />    
    </mesh>
  )
}

// --- BLOB GROUP ---
function Blobs() {
  return (
    <>
      {Array.from({ length: BLOB_COUNT }, (_, i) => (
        <Blob key={i} seed={i} />
      ))}
    </>
  )
}

function ParticleField() {
  const ref = useRef()
  const noise3D = useMemo(() => createNoise3D(), [])
  const count = 600

  // --- PARTICLE POSITIONS ---
// Three.js uses Float32Array instead of a regular JS array for geometry because
// it stores raw 32-bit floats with no extra overhead — smaller memory footprint
// and faster for the GPU to read. Regular JS arrays store type info alongside
// each value which adds up when you have hundreds of particles.
//
// The array is flat: every 3 slots belongs to one particle [x, y, z].
// To find particle i, we jump to index i * 3:
//   i=0 → arr[0], arr[1], arr[2]  (x, y, z)
//   i=1 → arr[3], arr[4], arr[5]
//   i=2 → arr[6], arr[7], arr[8]
// Three.js knows the array is structured this way because we pass 3
// as the second argument to bufferAttribute.
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 10
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6
    }
    return arr
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const arr = ref.current.geometry.attributes.position.array

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      arr[i3 + 1] += 0.002

      if (arr[i3 + 1] > 5) arr[i3 + 1] = -5

      arr[i3]     += noise3D(i * 0.3, arr[i3 + 1] * 0.2, t * 0.15) * 0.003
      arr[i3 + 2] += noise3D(i * 0.3, arr[i3 + 1] * 0.2, t * 0.15 + 99) * 0.003
    }

    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#aabbff"
        transparent
        opacity={0.4}
        depthWrite={false}
      />
    </points>
  )
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
      <pointLight position={[0, 5, 2]} intensity={20} color="#aabbff" />
      

      <ParticleField />
      <Blobs />

      <OrbitControls autoRotate autoRotateSpeed={0.3} />
    </>
  )
}

// --- ROOT ---
export default function Scene02() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#2d0a0a' }}>
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
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useGLTF } from "@react-three/drei";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

function CloudLayer1() {
  const texture = useTexture("/cloud-no-bg.png");

  return (
    <>
      <mesh scale={7} position={[0, -19, 8]}>
        <planeGeometry args={[10, 5]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0.8}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

function CloudLayer2() {
  const texture = useTexture("/cloud-no-bg2.png");

  return (
    <>
      <mesh scale={20} position={[0, -19, -28]}>
        <planeGeometry args={[10, 5]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0.8}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

function HandModel() {
  const { scene } = useGLTF("/female-hand-edited.glb");
  return (
    <primitive
      object={scene}
      scale={1.2}
      position={[0, -30, 0]}
      rotation={[0, Math.PI / 4, 0]}
    />
  );
}

// --- SCENE ---
function Scene() {
  return (
    <>
      {/* ADD YOUR LIGHTING HERE */}
      <ambientLight intensity={0.15} />

      {/* Cool fill from above */}
      <directionalLight position={[-1, 8, 2]} intensity={1} color="#aabbff" />

      <HandModel />
      <CloudLayer1 />
      <CloudLayer2 />

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.3}
        minAzimuthAngle={-Math.PI / 6}
        maxAzimuthAngle={Math.PI / 6}
        maxDistance={70}
      />
    </>
  );
}

// --- ROOT ---
export default function Scene03() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(to bottom, #00040a, #14426b, #4f74ab)",
      }}
    >
      <Canvas
        style={{ background: "transparent" }}
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}

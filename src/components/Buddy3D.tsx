import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  useGLTF, 
  useTexture,
  Float
} from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useBuddyStore } from '@/store/buddyStore';

// Background Environment Sphere
function ForestBackground() {
  const texture = useTexture('/forest-background.jpg');
  
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

// Treehouse Model - FRONT AND CENTER
function TreehouseModel() {
  const { scene } = useGLTF('/enchanted_treehouse_3d_model.glb');
  
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  
  return (
    <primitive 
      object={scene} 
      scale={4.5}  // BIGGER! Was 2.5
      position={[0, -2, -8]}  // Closer to camera
      rotation={[0, 0, 0]}
    />
  );
}

// Buddy - Positioned near treehouse entrance
function BuddyModel({ onClick }: { onClick?: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const mood = useBuddyStore((state) => state.currentMood);
  
  const { scene } = useGLTF('/buddy-model.glb');
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Breathing
      groupRef.current.scale.y = 1 + Math.sin(time * 2) * 0.03;
      groupRef.current.scale.x = 1 + Math.sin(time * 2) * 0.01;
      groupRef.current.scale.z = 1 + Math.sin(time * 2) * 0.01;
      
      // Mood animations
      switch (mood) {
        case 'happy':
        case 'excited':
          groupRef.current.position.y = -0.5 + Math.sin(time * 3) * 0.1;
          groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
          break;
        case 'tired':
          groupRef.current.rotation.x = Math.sin(time * 0.5) * 0.05 - 0.15;
          break;
        case 'sad':
          groupRef.current.rotation.z = Math.sin(time * 1.5) * 0.05;
          break;
        case 'hungry':
          groupRef.current.rotation.y = Math.sin(time * 2) * 0.2;
          break;
      }
    }
  });
  
  const handleClick = () => {
    if (onClick) onClick();
    if (groupRef.current) {
      groupRef.current.position.y = 0;
      setTimeout(() => {
        if (groupRef.current) groupRef.current.position.y = -0.5;
      }, 300);
    }
  };
  
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={groupRef} position={[3, -0.5, -4]} onClick={handleClick}>
        <primitive object={scene} scale={2.5} />
      </group>
    </Float>
  );
}

// Ground
function Ground() {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial 
        color="#3d5a3d"
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  );
}

// Magical Particles
function MagicalParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particleCount = 200;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = Math.random() * 15;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    
    const colorChoice = Math.random();
    if (colorChoice < 0.5) {
      colors[i * 3] = 1; colors[i * 3 + 1] = 0.9; colors[i * 3 + 2] = 0.3; // Gold
    } else {
      colors[i * 3] = 1; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 0.8; // Light gold
    }
  }
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.01;
      
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.003;
        if (positions[i3 + 1] > 15) positions[i3 + 1] = 0;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Butterflies
function Butterflies() {
  const butterflyRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (butterflyRef.current) {
      butterflyRef.current.children.forEach((butterfly, i) => {
        const time = state.clock.elapsedTime + i * 2;
        butterfly.position.x = Math.cos(time * 0.3) * 6 + (i % 2 === 0 ? 3 : -3);
        butterfly.position.y = 2 + Math.sin(time * 0.5) * 2;
        butterfly.position.z = Math.sin(time * 0.3) * 6 - 5;
        butterfly.rotation.y = time * 0.5;
      });
    }
  });
  
  return (
    <group ref={butterflyRef}>
      {[...Array(12)].map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial 
            color={['#FFD700', '#FFA500', '#FF8C00', '#FFE4B5'][i % 4]}
            emissive={['#FFD700', '#FFA500', '#FF8C00', '#FFE4B5'][i % 4]}
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

// Volumetric light rays
function LightRays() {
  const raysRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (raysRef.current) {
      raysRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });
  
  return (
    <group ref={raysRef} position={[0, 10, -8]}>
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh 
            key={i}
            position={[Math.cos(angle) * 0.5, 0, Math.sin(angle) * 0.5]}
            rotation={[0, -angle, 0]}
          >
            <coneGeometry args={[0.3, 15, 8, 1, true]} />
            <meshBasicMaterial 
              color="#FFE8A1"
              transparent
              opacity={0.1}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Professional Lighting
function SceneLighting() {
  return (
    <>
      {/* Main warm light from above */}
      <directionalLight
        position={[10, 20, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        color="#FFE8A1"
      />
      
      {/* Soft fill light */}
      <directionalLight
        position={[-10, 10, -5]}
        intensity={0.5}
        color="#B5D5FF"
      />
      
      {/* Ambient glow */}
      <ambientLight intensity={0.8} color="#FFE8CC" />
      
      {/* Hemisphere for natural feel */}
      <hemisphereLight args={['#87CEEB', '#8B7355', 0.6]} />
    </>
  );
}

// Loading
function LoadingScene() {
  return (
    <mesh position={[0, 0, -5]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial color="#8B6F47" wireframe />
    </mesh>
  );
}

// Main Component
interface Buddy3DProps {
  onInteraction?: () => void;
  interactive?: boolean;
}

export default function Buddy3D({ onInteraction, interactive = true }: Buddy3DProps) {
  const buddyStore = useBuddyStore();
  
  const handleBuddyClick = () => {
    if (interactive && onInteraction) {
      onInteraction();
      buddyStore.petBuddy();
    }
  };
  
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
      >
        {/* Camera - focused on treehouse */}
        <PerspectiveCamera 
          makeDefault 
          position={[0, 2, 12]}  // Closer to treehouse
          fov={60}
        />
        
        {/* Background */}
        <Suspense fallback={null}>
          <ForestBackground />
        </Suspense>
        
        {/* Lighting */}
        <SceneLighting />
        
        {/* Main Scene */}
        <Suspense fallback={<LoadingScene />}>
          {/* Treehouse - STAR OF THE SHOW */}
          <TreehouseModel />
          
          {/* Buddy */}
          <BuddyModel onClick={handleBuddyClick} />
        </Suspense>
        
        {/* Ground */}
        <Ground />
        
        {/* Magical atmosphere */}
        <MagicalParticles />
        <Butterflies />
        <LightRays />
        
        {/* Post-Processing */}
        <EffectComposer>
          <Bloom
            intensity={0.8}
            luminanceThreshold={0.7}
            luminanceSmoothing={0.9}
          />
          <DepthOfField
            focusDistance={0.02}
            focalLength={0.05}
            bokehScale={2}
          />
          <Vignette
            offset={0.1}
            darkness={0.3}
          />
        </EffectComposer>
        
        {/* Camera Controls */}
        {interactive && (
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={8}
            maxDistance={20}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.5}
            target={[0, 0, -5]}  // Look at treehouse
            maxAzimuthAngle={Math.PI / 3}
            minAzimuthAngle={-Math.PI / 3}
          />
        )}
      </Canvas>
    </div>
  );
}

useGLTF.preload('/buddy-model.glb');
useGLTF.preload('/enchanted_treehouse_3d_model.glb');
useTexture.preload('/forest-background.jpg');

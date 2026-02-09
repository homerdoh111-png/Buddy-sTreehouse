import { useRef, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  useGLTF, 
  Float,
  useTexture
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useBuddyStore } from '@/store/buddyStore';

// Simple 360° Forest Background
function ForestBackground() {
  const texture = useTexture('/forest-background.jpg');
  
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[50, 32, 32]} />
      <meshBasicMaterial 
        map={texture} 
        side={THREE.BackSide}
        toneMapped={false}
      />
    </mesh>
  );
}

// Treehouse - Center Stage
function TreehouseModel() {
  const { scene } = useGLTF('/enchanted_treehouse_3d_model.glb');
  
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        if (child.material) {
          child.material.roughness = 0.7;
          child.material.metalness = 0.1;
          
          // Glow windows
          if (child.name.toLowerCase().includes('window') || 
              child.name.toLowerCase().includes('light')) {
            child.material.emissive = new THREE.Color('#ffe8a1');
            child.material.emissiveIntensity = 1;
          }
        }
      }
    });
  }, [scene]);
  
  return (
    <primitive 
      object={scene} 
      scale={4}  // Big and prominent
      position={[0, -1, -8]}  // Center back
      rotation={[0, 0, 0]}
    />
  );
}

// Buddy - Front and Center
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
          groupRef.current.position.y = 0 + Math.sin(time * 3) * 0.1;
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
      groupRef.current.position.y = 0.5;
      setTimeout(() => {
        if (groupRef.current) groupRef.current.position.y = 0;
      }, 300);
    }
  };
  
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);
  
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
      <group ref={groupRef} position={[0, 0, -2]} onClick={handleClick}>
        <primitive object={scene} scale={2.5} />
      </group>
    </Float>
  );
}

// Simple Magical Particles
function MagicalParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particleCount = 150;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = Math.random() * 15;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    
    // Gold sparkles
    colors[i * 3] = 1;
    colors[i * 3 + 1] = 0.9;
    colors[i * 3 + 2] = 0.5;
  }
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.005;
        if (positions[i3 + 1] > 15) positions[i3 + 1] = 0;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={particleCount} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial 
        size={0.15} 
        vertexColors 
        transparent 
        opacity={0.8} 
        sizeAttenuation 
        blending={THREE.AdditiveBlending} 
      />
    </points>
  );
}

// Simple Lighting
function SimpleLighting() {
  return (
    <>
      {/* Main light */}
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        color="#FFE8CC"
      />
      
      {/* Fill light */}
      <directionalLight 
        position={[-5, 5, -5]} 
        intensity={0.5}
        color="#B0C4DE"
      />
      
      {/* Ambient */}
      <ambientLight intensity={0.6} color="#FFE8CC" />
    </>
  );
}

// Loading
function LoadingScene() {
  return (
    <mesh position={[0, 0, -5]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial 
        color="#8B6F47" 
        wireframe 
        emissive="#FFD700" 
        emissiveIntensity={0.5} 
      />
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
    <div className="w-full h-full absolute inset-0">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      >
        {/* Camera */}
        <PerspectiveCamera 
          makeDefault 
          position={[0, 2, 10]} 
          fov={60}
        />
        
        {/* Simple Scene */}
        <Suspense fallback={<LoadingScene />}>
          {/* Background Image */}
          <ForestBackground />
          
          {/* Treehouse (center back) */}
          <TreehouseModel />
          
          {/* Buddy (center front) */}
          <BuddyModel onClick={handleBuddyClick} />
        </Suspense>
        
        {/* Simple Lighting */}
        <SimpleLighting />
        
        {/* Magical Particles */}
        <MagicalParticles />
        
        {/* Simple Post-Processing */}
        <EffectComposer>
          <Bloom 
            intensity={0.8} 
            luminanceThreshold={0.7} 
            luminanceSmoothing={0.9} 
          />
          <Vignette 
            offset={0.2} 
            darkness={0.4} 
          />
        </EffectComposer>
        
        {/* Camera Controls */}
        {interactive && (
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={6}
            maxDistance={15}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2}
            target={[0, 1, -3]}
            maxAzimuthAngle={Math.PI / 3}
            minAzimuthAngle={-Math.PI / 3}
          />
        )}
      </Canvas>
    </div>
  );
}

// Preload
useGLTF.preload('/buddy-model.glb');
useGLTF.preload('/enchanted_treehouse_3d_model.glb');
useTexture.preload('/forest-background.jpg');

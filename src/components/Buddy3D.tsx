import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  useGLTF, 
  Environment,
  ContactShadows,
  Float,
  SpotLight,
  useAnimations
} from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useBuddyStore } from '@/store/buddyStore';

// Particle System for Sparkles
function Sparkles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particleCount = 50;
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = Math.random() * 5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.002;
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
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#FFD700"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Enhanced GLB Buddy Model
function BuddyGLBModel({ onClick }: { onClick?: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const mood = useBuddyStore((state) => state.currentMood);
  
  // Load GLB model
  const { scene, animations } = useGLTF('/buddy-model.glb');
  const { actions } = useAnimations(animations, groupRef);
  
  // Enhanced breathing and mood animations
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Gentle breathing
      groupRef.current.scale.y = 1 + Math.sin(time * 2) * 0.03;
      groupRef.current.scale.x = 1 + Math.sin(time * 2) * 0.01;
      groupRef.current.scale.z = 1 + Math.sin(time * 2) * 0.01;
      
      // Mood-based animations
      switch (mood) {
        case 'happy':
        case 'excited':
          // Gentle bounce when happy
          groupRef.current.position.y = Math.sin(time * 3) * 0.08;
          groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
          break;
        case 'tired':
          // Slight droop when tired
          groupRef.current.rotation.x = Math.sin(time * 0.5) * 0.05 - 0.15;
          break;
        case 'sad':
          // Subtle sway when sad
          groupRef.current.rotation.z = Math.sin(time * 1.5) * 0.05;
          break;
        case 'hungry':
          // Look around when hungry
          groupRef.current.rotation.y = Math.sin(time * 2) * 0.2;
          break;
      }
    }
  });
  
  const handleClick = () => {
    if (onClick) onClick();
    // Bounce animation on click
    if (groupRef.current) {
      groupRef.current.position.y = 0.5;
      setTimeout(() => {
        if (groupRef.current) groupRef.current.position.y = 0;
      }, 300);
    }
  };
  
  // Enhance materials
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      if (child.material) {
        child.material.roughness = 0.7;
        child.material.metalness = 0.1;
      }
    }
  });
  
  return (
    <Float
      speed={2}
      rotationIntensity={0.2}
      floatIntensity={0.5}
    >
      <group ref={groupRef} position={[0, 0, 0]} onClick={handleClick}>
        <primitive object={scene} scale={1.8} />
      </group>
    </Float>
  );
}

// Fallback Geometric Buddy with Enhanced Materials
function GeometricBuddy({ onClick }: { onClick?: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const mood = useBuddyStore((state) => state.currentMood);
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      // Enhanced breathing
      groupRef.current.scale.y = 1 + Math.sin(time * 2) * 0.04;
      groupRef.current.scale.x = 1 + Math.sin(time * 2) * 0.02;
    }
    
    if (headRef.current) {
      const time = state.clock.getElapsedTime();
      if (mood === 'happy' || mood === 'excited') {
        headRef.current.rotation.z = Math.sin(time * 3) * 0.08;
        headRef.current.position.y = 0.8 + Math.sin(time * 4) * 0.02;
      } else if (mood === 'tired') {
        headRef.current.rotation.x = -0.3 + Math.sin(time * 0.5) * 0.05;
      }
    }
  });
  
  const handleClick = () => {
    if (onClick) onClick();
    if (groupRef.current) {
      groupRef.current.position.y = 1.3;
      setTimeout(() => {
        if (groupRef.current) groupRef.current.position.y = 1;
      }, 300);
    }
  };
  
  const getBodyColor = () => {
    switch (mood) {
      case 'happy':
      case 'excited':
        return '#E5A55D';
      case 'sad':
        return '#B8824A';
      case 'tired':
        return '#C0906B';
      case 'hungry':
        return '#D4944E';
      default:
        return '#D4944E';
    }
  };
  
  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.6}>
      <group ref={groupRef} position={[0, 1, 0]} onClick={handleClick}>
        {/* Body with enhanced material */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial 
            color={getBodyColor()} 
            roughness={0.6}
            metalness={0.1}
            envMapIntensity={0.5}
          />
        </mesh>
        
        {/* Belly */}
        <mesh castShadow receiveShadow position={[0, -0.1, 0.4]}>
          <sphereGeometry args={[0.35, 24, 24]} />
          <meshStandardMaterial 
            color="#F5E6D3" 
            roughness={0.7}
            metalness={0.05}
          />
        </mesh>
        
        {/* Head with enhanced features */}
        <group ref={headRef} position={[0, 0.8, 0]}>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.45, 32, 32]} />
            <meshStandardMaterial 
              color={getBodyColor()} 
              roughness={0.6}
              metalness={0.1}
            />
          </mesh>
          
          {/* Ears with inner detail */}
          <mesh position={[-0.35, 0.35, 0]} castShadow>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial color={getBodyColor()} roughness={0.6} />
          </mesh>
          <mesh position={[-0.35, 0.35, 0.05]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#F5D6B3" roughness={0.7} />
          </mesh>
          
          <mesh position={[0.35, 0.35, 0]} castShadow>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial color={getBodyColor()} roughness={0.6} />
          </mesh>
          <mesh position={[0.35, 0.35, 0.05]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#F5D6B3" roughness={0.7} />
          </mesh>
          
          {/* Muzzle */}
          <mesh position={[0, -0.1, 0.4]}>
            <sphereGeometry args={[0.22, 24, 24]} />
            <meshStandardMaterial color="#F5E6D3" roughness={0.7} />
          </mesh>
          
          {/* Shiny nose */}
          <mesh position={[0, 0, 0.5]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial 
              color="#1A0F0A" 
              roughness={0.2}
              metalness={0.6}
            />
          </mesh>
          
          {/* Eyes with shine */}
          <mesh position={[-0.18, 0.15, 0.35]}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
          </mesh>
          <mesh position={[-0.18, 0.15, 0.42]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#1A1A1A" roughness={0.8} />
          </mesh>
          <mesh position={[-0.16, 0.17, 0.44]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.5} />
          </mesh>
          
          <mesh position={[0.18, 0.15, 0.35]}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
          </mesh>
          <mesh position={[0.18, 0.15, 0.42]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#1A1A1A" roughness={0.8} />
          </mesh>
          <mesh position={[0.20, 0.17, 0.44]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.5} />
          </mesh>
        </group>
        
        {/* Arms */}
        <group position={[-0.5, 0, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color={getBodyColor()} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.4, 0]} castShadow>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color={getBodyColor()} roughness={0.6} />
          </mesh>
        </group>
        
        <group position={[0.5, 0, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color={getBodyColor()} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.4, 0]} castShadow>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color={getBodyColor()} roughness={0.6} />
          </mesh>
        </group>
        
        {/* Legs */}
        <group position={[-0.25, -0.5, 0.1]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.12, 0.3, 16, 16]} />
            <meshStandardMaterial color={getBodyColor()} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.25, 0.1]} castShadow>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color={getBodyColor()} roughness={0.6} />
          </mesh>
        </group>
        
        <group position={[0.25, -0.5, 0.1]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.12, 0.3, 16, 16]} />
            <meshStandardMaterial color={getBodyColor()} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.25, 0.1]} castShadow>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color={getBodyColor()} roughness={0.6} />
          </mesh>
        </group>
      </group>
    </Float>
  );
}

// Professional Lighting Setup
function LightingSetup() {
  return (
    <>
      {/* Key Light - Main dramatic light */}
      <SpotLight
        position={[3, 4, 2]}
        angle={0.5}
        penumbra={1}
        intensity={2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        color="#FFE8CC"
      />
      
      {/* Fill Light - Softer secondary light */}
      <spotLight
        position={[-2, 2, 2]}
        angle={0.6}
        penumbra={1}
        intensity={0.8}
        color="#CCE5FF"
      />
      
      {/* Rim Light - Back highlight */}
      <spotLight
        position={[0, 3, -3]}
        angle={0.5}
        penumbra={1}
        intensity={1.2}
        color="#FFEEDD"
      />
      
      {/* Ambient base light */}
      <ambientLight intensity={0.4} color="#FFEEDD" />
      
      {/* Hemisphere light for natural feel */}
      <hemisphereLight
        args={['#87CEEB', '#DEB887', 0.6]}
      />
    </>
  );
}

// Loading Placeholder
function LoadingBuddy() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime;
    }
  });
  
  return (
    <mesh ref={meshRef} position={[0, 1, 0]}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial 
        color="#D4944E" 
        wireframe 
        emissive="#FFA500"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

// Main Enhanced Buddy 3D Component
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
        {/* Camera */}
        <PerspectiveCamera 
          makeDefault 
          position={[0, 1.5, 4.5]} 
          fov={45}
        />
        
        {/* Professional Lighting */}
        <LightingSetup />
        
        {/* Environment Map for Reflections */}
        <Environment preset="sunset" />
        
        {/* Buddy Model */}
        <Suspense fallback={<LoadingBuddy />}>
          <BuddyGLBModel onClick={handleBuddyClick} />
        </Suspense>
        
        {/* Contact Shadows for Realism */}
        <ContactShadows
          position={[0, -0.5, 0]}
          opacity={0.5}
          scale={10}
          blur={2}
          far={4}
        />
        
        {/* Sparkle Particles */}
        <Sparkles />
        
        {/* Post-Processing Effects */}
        <EffectComposer>
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.9}
            luminanceSmoothing={0.9}
          />
          <DepthOfField
            focusDistance={0.01}
            focalLength={0.05}
            bokehScale={3}
          />
          <Vignette
            offset={0.3}
            darkness={0.5}
          />
        </EffectComposer>
        
        {/* Interactive Controls */}
        {interactive && (
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
            target={[0, 1, 0]}
          />
        )}
      </Canvas>
    </div>
  );
}

// Preload GLB model
useGLTF.preload('/buddy-model.glb');

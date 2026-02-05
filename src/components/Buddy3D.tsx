import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useBuddyStore } from '@/store/buddyStore';

// Geometric Buddy Bear Component
function BuddyModel({ onClick }: { onClick?: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const mood = useBuddyStore((state) => state.currentMood);
  
  // Breathing animation
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      groupRef.current.scale.y = 1 + Math.sin(time * 2) * 0.02;
    }
    
    // Head movement based on mood
    if (headRef.current) {
      const time = state.clock.getElapsedTime();
      if (mood === 'happy' || mood === 'excited') {
        headRef.current.rotation.z = Math.sin(time * 3) * 0.05;
      } else if (mood === 'tired') {
        headRef.current.rotation.x = -0.2;
      }
    }
  });
  
  const handleClick = () => {
    if (onClick) onClick();
    // Add bounce animation
    if (groupRef.current) {
      groupRef.current.position.y = 1.2;
      setTimeout(() => {
        if (groupRef.current) groupRef.current.position.y = 1;
      }, 200);
    }
  };
  
  // Colors based on mood
  const getBodyColor = () => {
    switch (mood) {
      case 'happy':
      case 'excited':
        return '#D4944E'; // Normal fur
      case 'sad':
        return '#B8824A'; // Darker fur
      case 'tired':
        return '#C0906B'; // Muted fur
      case 'hungry':
        return '#D4944E';
      default:
        return '#D4944E';
    }
  };
  
  return (
    <group ref={groupRef} position={[0, 1, 0]} onClick={handleClick}>
      {/* Body */}
      <mesh castShadow position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={getBodyColor()} roughness={0.8} />
      </mesh>
      
      {/* Belly */}
      <mesh position={[0, -0.1, 0.4]}>
        <sphereGeometry args={[0.35, 24, 24]} />
        <meshStandardMaterial color="#F0DCC4" roughness={0.8} />
      </mesh>
      
      {/* Head */}
      <group ref={headRef} position={[0, 0.8, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.45, 32, 32]} />
          <meshStandardMaterial color={getBodyColor()} roughness={0.8} />
        </mesh>
        
        {/* Ears */}
        <mesh position={[-0.35, 0.35, 0]} castShadow>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color={getBodyColor()} roughness={0.8} />
        </mesh>
        <mesh position={[0.35, 0.35, 0]} castShadow>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color={getBodyColor()} roughness={0.8} />
        </mesh>
        
        {/* Muzzle */}
        <mesh position={[0, -0.1, 0.4]}>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshStandardMaterial color="#F0DCC4" roughness={0.8} />
        </mesh>
        
        {/* Nose */}
        <mesh position={[0, 0, 0.5]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#2A1E18" roughness={0.4} />
        </mesh>
        
        {/* Eyes */}
        {/* Left Eye White */}
        <mesh position={[-0.18, 0.15, 0.35]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
        {/* Left Eye Pupil */}
        <mesh position={[-0.18, 0.15, 0.42]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#1A1A1A" />
        </mesh>
        
        {/* Right Eye White */}
        <mesh position={[0.18, 0.15, 0.35]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
        {/* Right Eye Pupil */}
        <mesh position={[0.18, 0.15, 0.42]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#1A1A1A" />
        </mesh>
      </group>
      
      {/* Arms */}
      <group position={[-0.5, 0, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color={getBodyColor()} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={getBodyColor()} roughness={0.8} />
        </mesh>
      </group>
      
      <group position={[0.5, 0, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color={getBodyColor()} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={getBodyColor()} roughness={0.8} />
        </mesh>
      </group>
      
      {/* Legs */}
      <group position={[-0.25, -0.5, 0.1]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.12, 0.3, 16, 16]} />
          <meshStandardMaterial color={getBodyColor()} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.25, 0.1]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color={getBodyColor()} roughness={0.8} />
        </mesh>
      </group>
      
      <group position={[0.25, -0.5, 0.1]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.12, 0.3, 16, 16]} />
          <meshStandardMaterial color={getBodyColor()} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.25, 0.1]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color={getBodyColor()} roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

// Lights Setup
function Lights() {
  return (
    <>
      <ambientLight intensity={0.8} color="#FFE8CC" />
      <directionalLight
        position={[2, 3, 2]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-2, 1, -1]} intensity={0.3} color="#CCDDFF" />
    </>
  );
}

// Main Buddy 3D Component
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
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 1, 4]} fov={50} />
        <Lights />
        <BuddyModel onClick={handleBuddyClick} />
        {interactive && <OrbitControls enablePan={false} enableZoom={false} />}
      </Canvas>
    </div>
  );
}

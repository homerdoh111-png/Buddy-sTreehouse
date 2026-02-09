import { useRef, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  useGLTF, 
  Float,
  useTexture,
  Html
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useBuddyStore } from '@/store/buddyStore';

// Sharp 360° Background - MAXIMUM QUALITY
function ForestBackground() {
  const texture = useTexture('/forest-background.jpg');
  
  // CRITICAL: Maximum sharpness settings
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 16; // Maximum
  texture.generateMipmaps = false; // Disable for maximum sharpness
  texture.needsUpdate = true;
  
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[50, 128, 128]} /> {/* Higher resolution sphere */}
      <meshBasicMaterial 
        map={texture} 
        side={THREE.BackSide}
        toneMapped={false}
      />
    </mesh>
  );
}

// BIGGER Activity Bubble Component
function ActivityBubble({ 
  position, 
  activity, 
  onClick 
}: { 
  position: [number, number, number]; 
  activity: any;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.position.y = position[1] + Math.sin(time * 2 + position[0]) * 0.15;
    }
  });
  
  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.5}>
      <group position={position}>
        {/* Larger glow sphere */}
        <mesh ref={meshRef}>
          <sphereGeometry args={[1.2, 32, 32]} /> {/* Was 0.5, now 1.2! */}
          <meshStandardMaterial 
            color={activity.unlocked ? "#ffffff" : "#999999"}
            transparent
            opacity={0.4}
            metalness={0.2}
            roughness={0.1}
            emissive={activity.unlocked ? "#ffffff" : "#666666"}
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* MUCH bigger HTML button */}
        <Html
          center
          distanceFactor={6} // Was 8, now 6 (makes it bigger!)
          style={{
            pointerEvents: activity.unlocked ? 'auto' : 'none',
            userSelect: 'none'
          }}
        >
          <div
            onClick={activity.unlocked ? onClick : undefined}
            className={`
              w-32 h-32 rounded-3xl flex flex-col items-center justify-center gap-3
              transition-all shadow-2xl border-4
              ${activity.unlocked 
                ? 'bg-white/95 hover:bg-white cursor-pointer hover:scale-110 border-white/70 hover:shadow-[0_0_30px_rgba(255,255,255,0.8)]' 
                : 'bg-gray-400/60 cursor-not-allowed border-gray-400/40'
              }
            `}
          >
            <span className="text-5xl">{activity.icon}</span>
            <span className="text-sm font-bold text-gray-700">{activity.name}</span>
          </div>
        </Html>
        
        {/* Glow point light */}
        {activity.unlocked && (
          <pointLight color="#ffffff" intensity={0.5} distance={3} />
        )}
      </group>
    </Float>
  );
}

// Treehouse - MUCH MUCH BIGGER!
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
          
          if (child.name.toLowerCase().includes('window') || 
              child.name.toLowerCase().includes('light')) {
            child.material.emissive = new THREE.Color('#ffe8a1');
            child.material.emissiveIntensity = 1.5;
          }
        }
      }
    });
  }, [scene]);
  
  return (
    <primitive 
      object={scene} 
      scale={10}  // Was 6, now 10 (MUCH BIGGER!)
      position={[0, -3, -10]}
      rotation={[0, 0, 0]}
    />
  );
}

// Buddy - MUCH BIGGER!
function BuddyModel({ onClick }: { onClick?: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const mood = useBuddyStore((state) => state.currentMood);
  const { scene } = useGLTF('/buddy-model.glb');
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      
      groupRef.current.scale.y = 1 + Math.sin(time * 2) * 0.03;
      groupRef.current.scale.x = 1 + Math.sin(time * 2) * 0.01;
      groupRef.current.scale.z = 1 + Math.sin(time * 2) * 0.01;
      
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
      groupRef.current.position.y = 0.8;
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
      <group ref={groupRef} position={[-3, 0, -3]} onClick={handleClick}>
        <primitive object={scene} scale={5} />  {/* Was 3.5, now 5 (MUCH BIGGER!) */}
      </group>
    </Float>
  );
}

// Magical Particles
function MagicalParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particleCount = 250;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = Math.random() * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    
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
        if (positions[i3 + 1] > 20) positions[i3 + 1] = 0;
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
        size={0.18} 
        vertexColors 
        transparent 
        opacity={0.9} 
        sizeAttenuation 
        blending={THREE.AdditiveBlending} 
      />
    </points>
  );
}

// Lighting
function SimpleLighting() {
  return (
    <>
      <directionalLight 
        position={[5, 12, 5]} 
        intensity={2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        color="#FFE8CC"
      />
      <directionalLight 
        position={[-5, 6, -5]} 
        intensity={0.8}
        color="#B0C4DE"
      />
      <ambientLight intensity={0.8} color="#FFE8CC" />
      <pointLight position={[0, 3, -10]} intensity={2.5} color="#FFD700" distance={15} />
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
  onActivityClick?: (activityId: string) => void;
}

export default function Buddy3D({ onInteraction, interactive = true, onActivityClick }: Buddy3DProps) {
  const buddyStore = useBuddyStore();
  
  const handleBuddyClick = () => {
    if (interactive && onInteraction) {
      onInteraction();
      buddyStore.petBuddy();
    }
  };
  
  // Activities positioned around treehouse - BETTER POSITIONS
  const activities = [
    { 
      id: 'letters', 
      name: 'Letters', 
      icon: '📚', 
      position: [-6, 2, -10] as [number, number, number],
      unlocked: true 
    },
    { 
      id: 'numbers', 
      name: 'Numbers', 
      icon: '🔢', 
      position: [6, 2, -10] as [number, number, number],
      unlocked: true 
    },
    { 
      id: 'colors', 
      name: 'Colors', 
      icon: '🎨', 
      position: [0, 5, -8] as [number, number, number],
      unlocked: true 
    },
    { 
      id: 'shapes', 
      name: 'Shapes', 
      icon: '⭐', 
      position: [-5, -1, -9] as [number, number, number],
      unlocked: false 
    },
    { 
      id: 'music', 
      name: 'Music', 
      icon: '🎵', 
      position: [5, -1, -9] as [number, number, number],
      unlocked: false 
    },
  ];
  
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
          powerPreference: "high-performance"
        }}
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      >
        <PerspectiveCamera 
          makeDefault 
          position={[0, 3, 12]} 
          fov={70}
        />
        
        <Suspense fallback={<LoadingScene />}>
          {/* Sharp Background */}
          <ForestBackground />
          
          {/* MUCH Bigger Models */}
          <TreehouseModel />
          <BuddyModel onClick={handleBuddyClick} />
          
          {/* BIGGER Floating Activity Bubbles */}
          {activities.map((activity) => (
            <ActivityBubble
              key={activity.id}
              position={activity.position}
              activity={activity}
              onClick={() => onActivityClick?.(activity.id)}
            />
          ))}
        </Suspense>
        
        <SimpleLighting />
        <MagicalParticles />
        
        <EffectComposer>
          <Bloom 
            intensity={1.1} 
            luminanceThreshold={0.6} 
            luminanceSmoothing={0.9} 
          />
          <Vignette 
            offset={0.15} 
            darkness={0.3} 
          />
        </EffectComposer>
        
        {interactive && (
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={8}
            maxDistance={20}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2}
            target={[0, 2, -6]}
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

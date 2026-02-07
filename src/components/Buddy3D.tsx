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
  Sky,
  Sphere,
  useTexture
} from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useBuddyStore } from '@/store/buddyStore';

// Treehouse Environment Scene
function TreehouseEnvironment() {
  // Tree Trunk
  function TreeTrunk() {
    return (
      <group position={[0, 0, -2]}>
        {/* Main trunk */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.8, 1, 6, 16]} />
          <meshStandardMaterial 
            color="#5C4033"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
        {/* Bark texture details */}
        {[...Array(5)].map((_, i) => (
          <mesh key={i} position={[0, -2 + i * 1.2, 0]}>
            <torusGeometry args={[0.85, 0.05, 8, 16]} />
            <meshStandardMaterial color="#4A3428" roughness={1} />
          </mesh>
        ))}
      </group>
    );
  }

  // Wooden Platform
  function WoodenPlatform() {
    return (
      <group position={[0, -0.5, 0]}>
        {/* Main platform */}
        <mesh receiveShadow rotation={[0, 0, 0]}>
          <cylinderGeometry args={[3, 3, 0.3, 32]} />
          <meshStandardMaterial 
            color="#8B6F47"
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
        {/* Wood planks */}
        {[...Array(8)].map((_, i) => (
          <mesh 
            key={i} 
            position={[
              Math.cos(i * Math.PI / 4) * 2.5,
              0.16,
              Math.sin(i * Math.PI / 4) * 2.5
            ]}
            rotation={[0, i * Math.PI / 4, 0]}
          >
            <boxGeometry args={[0.2, 0.05, 5]} />
            <meshStandardMaterial color="#6B5744" roughness={0.9} />
          </mesh>
        ))}
        {/* Railing */}
        {[...Array(12)].map((_, i) => (
          <mesh 
            key={`rail-${i}`}
            position={[
              Math.cos(i * Math.PI / 6) * 2.8,
              0.5,
              Math.sin(i * Math.PI / 6) * 2.8
            ]}
          >
            <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
            <meshStandardMaterial color="#8B6F47" roughness={0.8} />
          </mesh>
        ))}
      </group>
    );
  }

  // Leaves and Foliage
  function Foliage() {
    const leafRef = useRef<THREE.Group>(null);
    
    useFrame((state) => {
      if (leafRef.current) {
        leafRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      }
    });
    
    return (
      <group ref={leafRef}>
        {/* Leaf clusters */}
        {[...Array(20)].map((_, i) => {
          const angle = (i / 20) * Math.PI * 2;
          const radius = 3 + Math.random() * 2;
          const height = 2 + Math.random() * 3;
          
          return (
            <mesh 
              key={i}
              position={[
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
              ]}
              rotation={[
                Math.random() * 0.5,
                Math.random() * Math.PI * 2,
                Math.random() * 0.5
              ]}
            >
              <sphereGeometry args={[0.5 + Math.random() * 0.3, 8, 8]} />
              <meshStandardMaterial 
                color={i % 2 === 0 ? "#3A7D44" : "#4A8B55"}
                roughness={0.8}
              />
            </mesh>
          );
        })}
        
        {/* Hanging vines */}
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh 
              key={`vine-${i}`}
              position={[
                Math.cos(angle) * 2.5,
                3,
                Math.sin(angle) * 2.5
              ]}
            >
              <cylinderGeometry args={[0.02, 0.02, 2, 8]} />
              <meshStandardMaterial color="#2D5016" roughness={0.9} />
            </mesh>
          );
        })}
      </group>
    );
  }

  // Treehouse Window
  function TreehouseWindow() {
    return (
      <group position={[2, 1.5, -1.5]} rotation={[0, -Math.PI / 4, 0]}>
        {/* Window frame */}
        <mesh>
          <boxGeometry args={[0.1, 1, 1]} />
          <meshStandardMaterial color="#8B6F47" />
        </mesh>
        {/* Window pane */}
        <mesh position={[0.05, 0, 0]}>
          <planeGeometry args={[0.9, 0.9]} />
          <meshStandardMaterial 
            color="#FFE8A1"
            transparent
            opacity={0.3}
            emissive="#FFE8A1"
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* Cross bars */}
        <mesh position={[0.06, 0, 0]}>
          <boxGeometry args={[0.02, 1, 0.02]} />
          <meshStandardMaterial color="#6B5744" />
        </mesh>
        <mesh position={[0.06, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.02, 1, 0.02]} />
          <meshStandardMaterial color="#6B5744" />
        </mesh>
      </group>
    );
  }

  // Background environment sphere
  function EnvironmentSphere() {
    return (
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[50, 32, 32]} />
        <meshStandardMaterial 
          color="#87CEEB"
          side={THREE.BackSide}
          fog={false}
        />
      </group>
    );
  }

  return (
    <>
      <EnvironmentSphere />
      <TreeTrunk />
      <WoodenPlatform />
      <Foliage />
      <TreehouseWindow />
    </>
  );
}

// Enhanced Particle System
function Sparkles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particleCount = 100; // Increased for magical forest feel
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 15;
    positions[i * 3 + 1] = Math.random() * 6;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
  }
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.03;
      
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.002;
        
        // Keep particles in bounds
        if (positions[i3 + 1] > 6) positions[i3 + 1] = 0;
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
        size={0.08}
        color="#FFD700"
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

// Fireflies for magical atmosphere
function Fireflies() {
  const fireflyRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (fireflyRef.current) {
      fireflyRef.current.children.forEach((firefly, i) => {
        const time = state.clock.elapsedTime + i;
        firefly.position.y = 1 + Math.sin(time * 0.5) * 0.5;
        firefly.position.x = Math.cos(time * 0.3) * 3;
        firefly.position.z = Math.sin(time * 0.3) * 3;
      });
    }
  });
  
  return (
    <group ref={fireflyRef}>
      {[...Array(15)].map((_, i) => (
        <mesh key={i} position={[0, 1, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial 
            color="#FFFF88"
            emissive="#FFFF00"
            emissiveIntensity={2}
          />
        </mesh>
      ))}
    </group>
  );
}

// Enhanced GLB Buddy Model
function BuddyGLBModel({ onClick }: { onClick?: () => void }) {
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
          groupRef.current.position.y = Math.sin(time * 3) * 0.08;
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
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef} position={[0, 0, 0]} onClick={handleClick}>
        <primitive object={scene} scale={1.8} />
      </group>
    </Float>
  );
}

// Loading placeholder
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

// Enhanced Forest Lighting
function ForestLighting() {
  return (
    <>
      {/* Main sun light through trees */}
      <SpotLight
        position={[5, 8, 3]}
        angle={0.6}
        penumbra={1}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        color="#FFF5E1"
      />
      
      {/* Ambient forest light */}
      <ambientLight intensity={0.5} color="#C8E6C9" />
      
      {/* Dappled light through leaves */}
      <spotLight
        position={[-3, 6, -2]}
        angle={0.4}
        penumbra={1}
        intensity={0.8}
        color="#E8F5E9"
      />
      
      {/* Warm ground reflection */}
      <spotLight
        position={[0, -2, 0]}
        angle={1.5}
        penumbra={1}
        intensity={0.3}
        color="#8D6E63"
      />
      
      {/* Hemisphere for natural outdoor feel */}
      <hemisphereLight args={['#87CEEB', '#8D6E63', 0.6]} />
    </>
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
          toneMappingExposure: 1.0
        }}
      >
        <PerspectiveCamera 
          makeDefault 
          position={[0, 1.5, 5]} 
          fov={50}
        />
        
        {/* HDR Environment */}
        <Environment preset="forest" background={false} />
        
        {/* Fog for depth */}
        <fog attach="fog" args={['#87CEEB', 10, 50]} />
        
        {/* Forest Lighting */}
        <ForestLighting />
        
        {/* Treehouse Environment */}
        <TreehouseEnvironment />
        
        {/* Buddy */}
        <Suspense fallback={<LoadingBuddy />}>
          <BuddyGLBModel onClick={handleBuddyClick} />
        </Suspense>
        
        {/* Ground Shadows */}
        <ContactShadows
          position={[0, -0.49, 0]}
          opacity={0.6}
          scale={10}
          blur={2.5}
          far={4}
        />
        
        {/* Magical Particles */}
        <Sparkles />
        <Fireflies />
        
        {/* Post-Processing */}
        <EffectComposer>
          <Bloom
            intensity={0.6}
            luminanceThreshold={0.85}
            luminanceSmoothing={0.9}
          />
          <DepthOfField
            focusDistance={0.02}
            focalLength={0.05}
            bokehScale={2}
          />
          <Vignette offset={0.2} darkness={0.4} />
        </EffectComposer>
        
        {/* Controls */}
        {interactive && (
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
            minAzimuthAngle={-Math.PI / 3}
            maxAzimuthAngle={Math.PI / 3}
            target={[0, 1, 0]}
          />
        )}
      </Canvas>
    </div>
  );
}

useGLTF.preload('/buddy-model.glb');

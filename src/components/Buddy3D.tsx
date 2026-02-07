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
  Sky
} from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useBuddyStore } from '@/store/buddyStore';

// Load Treehouse Model
function TreehouseModel() {
  const { scene } = useGLTF('/enchanted_treehouse_3d_model.glb');
  
  // Enhance materials
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  
  return (
    <primitive 
      object={scene} 
      scale={2.5} 
      position={[0, 0, -3]} 
      rotation={[0, 0, 0]}
    />
  );
}

// Enhanced Buddy Model
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
    }
  });
  
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef} position={[0, 0.5, 0]} onClick={handleClick}>
        <primitive object={scene} scale={1.8} />
      </group>
    </Float>
  );
}

// Lush Forest Environment
function ForestEnvironment() {
  
  // Ground with grass
  function Ground() {
    return (
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[20, 64]} />
        <meshStandardMaterial 
          color="#4A7C3B"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
    );
  }
  
  // Background trees
  function BackgroundTrees() {
    const trees = [];
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const distance = 8 + Math.random() * 5;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      const height = 4 + Math.random() * 3;
      
      trees.push(
        <group key={i} position={[x, 0, z]}>
          {/* Tree trunk */}
          <mesh castShadow position={[0, height / 2, 0]}>
            <cylinderGeometry args={[0.3, 0.4, height, 8]} />
            <meshStandardMaterial color="#5C4033" roughness={0.9} />
          </mesh>
          
          {/* Tree foliage - multiple layers */}
          <mesh castShadow position={[0, height + 1, 0]}>
            <coneGeometry args={[2, 3, 8]} />
            <meshStandardMaterial color="#2D5016" roughness={0.8} />
          </mesh>
          <mesh castShadow position={[0, height + 2.5, 0]}>
            <coneGeometry args={[1.5, 2.5, 8]} />
            <meshStandardMaterial color="#3A6B23" roughness={0.8} />
          </mesh>
          <mesh castShadow position={[0, height + 3.5, 0]}>
            <coneGeometry args={[1, 2, 8]} />
            <meshStandardMaterial color="#4A7C3B" roughness={0.8} />
          </mesh>
        </group>
      );
    }
    return <>{trees}</>;
  }
  
  // Bushes and shrubs
  function Bushes() {
    const bushes = [];
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 3 + Math.random() * 5;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      const size = 0.3 + Math.random() * 0.4;
      
      bushes.push(
        <mesh 
          key={i} 
          position={[x, size / 2, z]}
          castShadow
        >
          <sphereGeometry args={[size, 8, 8]} />
          <meshStandardMaterial 
            color={i % 2 === 0 ? "#3A7D44" : "#4A8B55"}
            roughness={0.9}
          />
        </mesh>
      );
    }
    return <>{bushes}</>;
  }
  
  // Flowers
  function Flowers() {
    const flowers = [];
    const colors = ['#FF6B9D', '#FFD93D', '#6BCF7F', '#A78BFA', '#FB923C'];
    
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 1 + Math.random() * 6;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      flowers.push(
        <group key={i} position={[x, 0, z]}>
          {/* Stem */}
          <mesh>
            <cylinderGeometry args={[0.01, 0.01, 0.3, 4]} />
            <meshStandardMaterial color="#2D5016" />
          </mesh>
          {/* Petals */}
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.08, 6, 6]} />
            <meshStandardMaterial 
              color={color}
              emissive={color}
              emissiveIntensity={0.2}
            />
          </mesh>
        </group>
      );
    }
    return <>{flowers}</>;
  }
  
  // Rocks
  function Rocks() {
    const rocks = [];
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 2 + Math.random() * 6;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      const size = 0.2 + Math.random() * 0.3;
      
      rocks.push(
        <mesh 
          key={i}
          position={[x, size / 2, z]}
          rotation={[
            Math.random() * 0.5,
            Math.random() * Math.PI,
            Math.random() * 0.5
          ]}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[size, 0]} />
          <meshStandardMaterial color="#6B7280" roughness={0.95} />
        </mesh>
      );
    }
    return <>{rocks}</>;
  }
  
  return (
    <>
      <Ground />
      <BackgroundTrees />
      <Bushes />
      <Flowers />
      <Rocks />
    </>
  );
}

// Magical Particles
function MagicalParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particleCount = 150;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = Math.random() * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    
    // Random colors (gold, white, light blue)
    const colorChoice = Math.random();
    if (colorChoice < 0.33) {
      colors[i * 3] = 1; colors[i * 3 + 1] = 0.84; colors[i * 3 + 2] = 0; // Gold
    } else if (colorChoice < 0.66) {
      colors[i * 3] = 1; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1; // White
    } else {
      colors[i * 3] = 0.7; colors[i * 3 + 1] = 0.9; colors[i * 3 + 2] = 1; // Light blue
    }
  }
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.003;
        if (positions[i3 + 1] > 8) positions[i3 + 1] = 0;
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
        size={0.1}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
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
        butterfly.position.x = Math.cos(time * 0.3) * 4;
        butterfly.position.y = 1 + Math.sin(time * 0.5) * 1.5;
        butterfly.position.z = Math.sin(time * 0.3) * 4;
        butterfly.rotation.y = time * 0.5;
      });
    }
  });
  
  return (
    <group ref={butterflyRef}>
      {[...Array(8)].map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial 
            color={['#FF6B9D', '#FFD93D', '#A78BFA', '#6BCF7F'][i % 4]}
            emissive={['#FF6B9D', '#FFD93D', '#A78BFA', '#6BCF7F'][i % 4]}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

// Professional Forest Lighting
function ForestLighting() {
  return (
    <>
      {/* Main sunlight */}
      <SpotLight
        position={[10, 15, 5]}
        angle={0.5}
        penumbra={1}
        intensity={2.5}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-bias={-0.0001}
        color="#FFF8DC"
      />
      
      {/* Fill light */}
      <spotLight
        position={[-8, 10, -5]}
        angle={0.6}
        penumbra={1}
        intensity={1}
        color="#B0C4DE"
      />
      
      {/* Ambient forest light */}
      <ambientLight intensity={0.6} color="#E8F5E9" />
      
      {/* Ground bounce */}
      <hemisphereLight 
        args={['#87CEEB', '#8D6E63', 0.8]}
        position={[0, 1, 0]}
      />
    </>
  );
}

// Loading placeholder
function LoadingScene() {
  return (
    <group>
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#4A7C3B" wireframe />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5, 32]} />
        <meshStandardMaterial color="#2D5016" wireframe />
      </mesh>
    </group>
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
          toneMappingExposure: 1.1
        }}
      >
        {/* Camera */}
        <PerspectiveCamera 
          makeDefault 
          position={[4, 3, 8]} 
          fov={50}
        />
        
        {/* Sky */}
        <Sky
          distance={450000}
          sunPosition={[10, 5, 5]}
          inclination={0.6}
          azimuth={0.25}
        />
        
        {/* HDR Environment */}
        <Environment preset="forest" background={false} />
        
        {/* Fog for atmosphere */}
        <fog attach="fog" args={['#C8E6C9', 15, 40]} />
        
        {/* Lighting */}
        <ForestLighting />
        
        {/* Scene Models */}
        <Suspense fallback={<LoadingScene />}>
          {/* Treehouse */}
          <TreehouseModel />
          
          {/* Buddy */}
          <BuddyModel onClick={handleBuddyClick} />
        </Suspense>
        
        {/* Forest Environment */}
        <ForestEnvironment />
        
        {/* Magical Effects */}
        <MagicalParticles />
        <Butterflies />
        
        {/* Ground Shadows */}
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.5}
          scale={15}
          blur={2}
          far={10}
        />
        
        {/* Post-Processing */}
        <EffectComposer>
          <Bloom
            intensity={0.7}
            luminanceThreshold={0.8}
            luminanceSmoothing={0.9}
          />
          <DepthOfField
            focusDistance={0.015}
            focalLength={0.05}
            bokehScale={2.5}
          />
          <Vignette
            offset={0.15}
            darkness={0.4}
          />
        </EffectComposer>
        
        {/* Camera Controls */}
        {interactive && (
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={3}
            maxDistance={15}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            target={[0, 2, 0]}
          />
        )}
      </Canvas>
    </div>
  );
}

// Preload models
useGLTF.preload('/buddy-model.glb');
useGLTF.preload('/enchanted_treehouse_3d_model.glb');

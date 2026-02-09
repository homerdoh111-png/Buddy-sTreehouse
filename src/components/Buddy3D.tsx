import { useRef, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  useGLTF, 
  Float,
  Environment,
  Lightformer
} from '@react-three/drei';
import { 
  EffectComposer, 
  Bloom, 
  DepthOfField, 
  Vignette,
  HueSaturation,
  BrightnessContrast
} from '@react-three/postprocessing';
import * as THREE from 'three';
import { useBuddyStore } from '@/store/buddyStore';

// Enhanced Forest Environment Model - FILLS THE SCREEN
function ForestEnvironment() {
  const { scene } = useGLTF('/enchanted-forest-environment.glb');
  
  // Enhance all materials in the forest
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        if (child.material) {
          child.material.roughness = 0.6;
          child.material.metalness = 0.1;
          
          // Enhance colors
          if (child.material.color) {
            const hsl = { h: 0, s: 0, l: 0 };
            child.material.color.getHSL(hsl);
            hsl.s = Math.min(1, hsl.s * 1.2);
            hsl.l = Math.min(1, hsl.l * 1.1);
            child.material.color.setHSL(hsl.h, hsl.s, hsl.l);
          }
          
          // Add subtle emissive glow to vegetation
          if (child.name.toLowerCase().includes('leaf') || 
              child.name.toLowerCase().includes('tree') ||
              child.name.toLowerCase().includes('plant') ||
              child.name.toLowerCase().includes('grass')) {
            child.material.emissive = new THREE.Color('#1a3320');
            child.material.emissiveIntensity = 0.15;
          }
          
          // Make ground more lush
          if (child.name.toLowerCase().includes('ground')) {
            if (child.material.color) {
              child.material.color.setHex(0x4a7c3b);
            }
            child.material.emissive = new THREE.Color('#2a4a2a');
            child.material.emissiveIntensity = 0.1;
          }
        }
      }
    });
  }, [scene]);
  
  return (
    <primitive 
      object={scene} 
      scale={8}  // MUCH BIGGER - fills the screen
      position={[0, -2, 0]}  // Center it
      rotation={[0, 0, 0]}
    />
  );
}

// Treehouse Model - INSIDE the forest environment
function TreehouseModel() {
  const { scene } = useGLTF('/enchanted_treehouse_3d_model.glb');
  
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        if (child.material) {
          child.material.roughness = 0.7;
          child.material.metalness = 0.05;
          
          // Add warm glow to windows/lights
          if (child.name.toLowerCase().includes('window') || 
              child.name.toLowerCase().includes('light')) {
            child.material.emissive = new THREE.Color('#ffe8a1');
            child.material.emissiveIntensity = 0.8;
          }
          
          // Enhance wood colors
          if (child.name.toLowerCase().includes('wood')) {
            if (child.material.color) {
              const hsl = { h: 0, s: 0, l: 0 };
              child.material.color.getHSL(hsl);
              hsl.s = Math.min(1, hsl.s * 1.15);
              child.material.color.setHSL(hsl.h, hsl.s, hsl.l);
            }
          }
        }
      }
    });
  }, [scene]);
  
  return (
    <primitive 
      object={scene} 
      scale={2.5}  // Good size
      position={[0, 0, -5]}  // Center-back, INSIDE forest
      rotation={[0, 0, 0]}
    />
  );
}

// Buddy Model - INSIDE the forest, near treehouse
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
      <group ref={groupRef} position={[1.5, 0, -2]} onClick={handleClick}>
        <primitive object={scene} scale={1.8} />
      </group>
    </Float>
  );
}

// Magical Fireflies
function Fireflies() {
  const fireflyRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (fireflyRef.current) {
      fireflyRef.current.children.forEach((firefly, i) => {
        const time = state.clock.elapsedTime + i * 2;
        firefly.position.x = Math.cos(time * 0.3) * 5 + (i % 2 === 0 ? 2 : -2);
        firefly.position.y = 1 + Math.sin(time * 0.5) * 2;
        firefly.position.z = Math.sin(time * 0.3) * 5 - 4;
      });
    }
  });
  
  return (
    <group ref={fireflyRef}>
      {[...Array(20)].map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial 
            color="#FFE8A1"
            emissive="#FFD700"
            emissiveIntensity={2}
            toneMapped={false}
          />
          <pointLight 
            color="#FFE8A1" 
            intensity={0.5} 
            distance={2}
          />
        </mesh>
      ))}
    </group>
  );
}

// Magical Particles
function MagicalParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particleCount = 300;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 1] = Math.random() * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    
    const colorChoice = Math.random();
    if (colorChoice < 0.3) {
      colors[i * 3] = 1; colors[i * 3 + 1] = 0.95; colors[i * 3 + 2] = 0.6;
    } else if (colorChoice < 0.6) {
      colors[i * 3] = 0.8; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 0.9;
    } else {
      colors[i * 3] = 1; colors[i * 3 + 1] = 0.7; colors[i * 3 + 2] = 1;
    }
    
    sizes[i] = Math.random() * 0.2 + 0.05;
  }
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.01;
      
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.003;
        if (positions[i3 + 1] > 20) positions[i3 + 1] = 0;
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
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={sizes}
          itemSize={1}
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

// Volumetric Light
function VolumetricLight() {
  const lightRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });
  
  return (
    <group ref={lightRef} position={[-3, 12, -5]}>
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        return (
          <mesh 
            key={i}
            position={[Math.cos(angle) * 0.3, 0, Math.sin(angle) * 0.3]}
            rotation={[0, -angle, 0]}
          >
            <coneGeometry args={[0.5, 20, 8, 1, true]} />
            <meshBasicMaterial 
              color="#FFE8CC"
              transparent
              opacity={0.08}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Dreamlike Lighting Setup
function DreamlikeLighting() {
  return (
    <>
      <directionalLight
        position={[-8, 15, -3]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        color="#FFE8CC"
      />
      
      <directionalLight
        position={[10, 8, -5]}
        intensity={0.8}
        color="#FFD4A3"
      />
      
      <directionalLight
        position={[0, 10, 10]}
        intensity={0.6}
        color="#C8E6FF"
      />
      
      <ambientLight intensity={0.7} color="#FFE8CC" />
      
      <hemisphereLight 
        args={['#B8E6FF', '#8B6F47', 0.8]}
      />
      
      <pointLight position={[-3, 5, -4]} intensity={1.5} color="#FFD700" distance={8} />
      <pointLight position={[3, 4, -3]} intensity={1.2} color="#FFE8A1" distance={7} />
      <pointLight position={[0, 6, -7]} intensity={1} color="#FFA07A" distance={10} />
    </>
  );
}

// Loading
function LoadingScene() {
  return (
    <group>
      <mesh position={[0, 2, -5]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial 
          color="#8B6F47" 
          wireframe 
          emissive="#FFD700"
          emissiveIntensity={0.5}
        />
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
          toneMappingExposure: 1.3,
          outputColorSpace: THREE.SRGBColorSpace
        }}
      >
        {/* Camera - looking at the whole scene */}
        <PerspectiveCamera 
          makeDefault 
          position={[0, 2, 10]}  // Positioned to see everything
          fov={60}
        />
        
        {/* HDR Environment */}
        <Environment preset="forest">
          <Lightformer intensity={2} position={[0, 10, -10]} scale={[10, 50, 1]} color="#FFE8A1" />
          <Lightformer intensity={1} position={[-10, 5, -5]} scale={[20, 5, 1]} color="#B8E6FF" />
        </Environment>
        
        {/* Fog */}
        <fog attach="fog" args={['#C8E6D9', 20, 60]} />
        
        {/* Lighting */}
        <DreamlikeLighting />
        
        {/* Main Scene - ALL models positioned together */}
        <Suspense fallback={<LoadingScene />}>
          {/* Forest Environment - FILLS SCREEN */}
          <ForestEnvironment />
          
          {/* Treehouse - INSIDE forest */}
          <TreehouseModel />
          
          {/* Buddy - INSIDE forest */}
          <BuddyModel onClick={handleBuddyClick} />
        </Suspense>
        
        {/* Magical Atmosphere */}
        <MagicalParticles />
        <Fireflies />
        <VolumetricLight />
        
        {/* Post-Processing */}
        <EffectComposer>
          <HueSaturation 
            saturation={0.15}
            hue={0}
          />
          
          <BrightnessContrast
            brightness={0.05}
            contrast={0.1}
          />
          
          <Bloom
            intensity={1.2}
            luminanceThreshold={0.6}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          
          <DepthOfField
            focusDistance={0.015}
            focalLength={0.05}
            bokehScale={3}
          />
          
          <Vignette
            offset={0.15}
            darkness={0.35}
          />
        </EffectComposer>
        
        {/* Camera Controls */}
        {interactive && (
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={6}
            maxDistance={20}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.3}
            target={[0, 1, -3]}  // Look at center of scene
            maxAzimuthAngle={Math.PI / 2.5}
            minAzimuthAngle={-Math.PI / 2.5}
          />
        )}
      </Canvas>
    </div>
  );
}

// Preload all models
useGLTF.preload('/buddy-model.glb');
useGLTF.preload('/enchanted_treehouse_3d_model.glb');
useGLTF.preload('/enchanted-forest-environment.glb');

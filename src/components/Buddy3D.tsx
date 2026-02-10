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

// Background
function ForestBackground() {
  const texture = useTexture('/forest-background.jpg');
  
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 16;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[50, 128, 128]} />
      <meshBasicMaterial 
        map={texture} 
        side={THREE.BackSide}
        toneMapped={false}
      />
    </mesh>
  );
}

// Floating, Transparent, ROUND Activity Icon
function ActivityBubble({ 
  position, 
  activity, 
  onClick 
}: { 
  position: [number, number, number]; 
  activity: any;
  onClick: () => void;
}) {
  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.6}>
      <group position={position}>
        {/* ROUND HTML button */}
        <Html
          center
          transform
          distanceFactor={8}
          position={[0, 0, 0]}
          style={{
            pointerEvents: activity.unlocked ? 'auto' : 'none',
            userSelect: 'none',
          }}
        >
          <div
            onClick={activity.unlocked ? onClick : undefined}
            className={`
              flex flex-col items-center justify-center gap-3
              transition-all cursor-pointer
              ${activity.unlocked 
                ? 'bg-white/60 hover:bg-white/70 border-yellow-400/60 hover:border-yellow-500/80' 
                : 'bg-gray-400/50 cursor-not-allowed border-gray-500/40'
              }
            `}
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%', // ROUND!
              border: '6px solid',
              boxShadow: activity.unlocked 
                ? '0 15px 40px rgba(0,0,0,0.3), 0 0 30px rgba(251, 191, 36, 0.4)' 
                : '0 15px 40px rgba(0,0,0,0.25)',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={(e) => {
              if (activity.unlocked) {
                e.currentTarget.style.transform = 'scale(1.15)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = activity.unlocked 
                ? 'rgba(255, 255, 255, 0.6)' 
                : 'rgba(150, 150, 150, 0.5)';
            }}
          >
            <span style={{ fontSize: '80px' }}>{activity.icon}</span>
            <span style={{ 
              fontSize: '20px', 
              fontWeight: 'bold',
              color: '#1f2937'
            }}>
              {activity.name}
            </span>
          </div>
        </Html>
      </group>
    </Float>
  );
}

// Treehouse - 45% BIGGER!
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
            child.material.emissiveIntensity = 2;
          }
        }
      }
    });
  }, [scene]);
  
  return (
    <primitive 
      object={scene} 
      scale={49}  // Was 34, now 49 (45% bigger!)
      position={[0, -7, -18]}
      rotation={[0, 0, 0]}
    />
  );
}

// Buddy - 20% BIGGER + Moved Away!
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
          groupRef.current.position.y = 0 + Math.sin(time * 3) * 0.2;
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
      groupRef.current.position.y = 1.5;
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
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.6}>
      <group ref={groupRef} position={[-9, 0, -8]} onClick={handleClick}> {/* Moved away from treehouse */}
        <primitive object={scene} scale={18} /> {/* Was 15, now 18 (20% bigger!) */}
      </group>
    </Float>
  );
}

// Falling Stars
function FallingStars() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particleCount = 300;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 1] = Math.random() * 25;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    
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
        if (positions[i3 + 1] > 25) positions[i3 + 1] = 0;
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
        size={0.2} 
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
        position={[6, 15, 6]} 
        intensity={2.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        color="#FFE8CC"
      />
      <directionalLight 
        position={[-6, 8, -6]} 
        intensity={1}
        color="#B0C4DE"
      />
      <ambientLight intensity={0.9} color="#FFE8CC" />
      <pointLight position={[0, 4, -18]} intensity={3} color="#FFD700" distance={20} />
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
  
  const activities = [
    { 
      id: 'letters', 
      name: 'Letters', 
      icon: '📚', 
      position: [-20, 6, -18] as [number, number, number],
      unlocked: true 
    },
    { 
      id: 'numbers', 
      name: 'Numbers', 
      icon: '🔢', 
      position: [20, 6, -18] as [number, number, number],
      unlocked: true 
    },
    { 
      id: 'colors', 
      name: 'Colors', 
      icon: '🎨', 
      position: [0, 14, -16] as [number, number, number],
      unlocked: true 
    },
    { 
      id: 'shapes', 
      name: 'Shapes', 
      icon: '⭐', 
      position: [-16, -1, -17] as [number, number, number],
      unlocked: false 
    },
    { 
      id: 'music', 
      name: 'Music', 
      icon: '🎵', 
      position: [16, -1, -17] as [number, number, number],
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
          toneMappingExposure: 1.5,
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
          position={[0, 4, 20]} 
          fov={75}
        />
        
        <Suspense fallback={<LoadingScene />}>
          <ForestBackground />
          <TreehouseModel />
          <BuddyModel onClick={handleBuddyClick} />
          
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
        <FallingStars />
        
        <EffectComposer>
          <Bloom 
            intensity={1.3} 
            luminanceThreshold={0.5} 
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
            minDistance={14}
            maxDistance={30}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2}
            target={[0, 2, -14]}
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

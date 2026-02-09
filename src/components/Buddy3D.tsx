import { useRef, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  useGLTF, 
  Float,
  Environment,
  Lightformer,
  useTexture
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

// 360° Forest Background Sphere - FILLS ALL SPACE
function ForestBackgroundSphere() {
  const texture = useTexture('/forest-background.jpg');
  
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial 
        map={texture} 
        side={THREE.BackSide}
        toneMapped={false}
      />
    </mesh>
  );
}

// Enhanced 3D Forest Environment - MUCH LARGER
function ForestEnvironment() {
  const { scene } = useGLTF('/enchanted-forest-environment.glb');
  const { viewport } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        if (child.material) {
          child.material.roughness = 0.6;
          child.material.metalness = 0.1;
          
          if (child.material.color) {
            const hsl = { h: 0, s: 0, l: 0 };
            child.material.color.getHSL(hsl);
            hsl.s = Math.min(1, hsl.s * 1.3);
            hsl.l = Math.min(1, hsl.l * 1.15);
            child.material.color.setHSL(hsl.h, hsl.s, hsl.l);
          }
          
          if (child.name.toLowerCase().includes('leaf') || 
              child.name.toLowerCase().includes('tree') ||
              child.name.toLowerCase().includes('plant') ||
              child.name.toLowerCase().includes('grass')) {
            child.material.emissive = new THREE.Color('#1a3320');
            child.material.emissiveIntensity = 0.2;
          }
          
          if (child.name.toLowerCase().includes('ground')) {
            if (child.material.color) {
              child.material.color.setHex(0x4a7c3b);
            }
            child.material.emissive = new THREE.Color('#2a4a2a');
            child.material.emissiveIntensity = 0.15;
          }
        }
      }
    });
  }, [scene]);
  
  // MUCH LARGER responsive scaling
  const responsiveScale = Math.max(20, viewport.width * 1.5);
  
  return (
    <group ref={groupRef}>
      <primitive 
        object={scene} 
        scale={responsiveScale}  // 20+ units - HUGE!
        position={[0, -5, 0]}
        rotation={[0, 0, 0]}
      />
    </group>
  );
}

// Additional Ground Plane - NO WHITE SPACE
function GroundPlane() {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
      <planeGeometry args={[500, 500]} />
      <meshStandardMaterial 
        color="#3d5a3d"
        roughness={0.9}
        metalness={0.05}
      />
    </mesh>
  );
}

// Treehouse
function TreehouseModel() {
  const { scene } = useGLTF('/enchanted_treehouse_3d_model.glb');
  const { viewport } = useThree();
  
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        if (child.material) {
          child.material.roughness = 0.7;
          child.material.metalness = 0.05;
          
          if (child.name.toLowerCase().includes('window') || 
              child.name.toLowerCase().includes('light')) {
            child.material.emissive = new THREE.Color('#ffe8a1');
            child.material.emissiveIntensity = 0.8;
          }
          
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
  
  const scale = Math.min(3.5, viewport.width * 0.25);
  
  return (
    <primitive 
      object={scene} 
      scale={scale}
      position={[0, -1, -5]}
      rotation={[0, 0, 0]}
    />
  );
}

// Buddy
function BuddyModel({ onClick }: { onClick?: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const mood = useBuddyStore((state) => state.currentMood);
  const { scene } = useGLTF('/buddy-model.glb');
  const { viewport } = useThree();
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      
      groupRef.current.scale.y = 1 + Math.sin(time * 2) * 0.03;
      groupRef.current.scale.x = 1 + Math.sin(time * 2) * 0.01;
      groupRef.current.scale.z = 1 + Math.sin(time * 2) * 0.01;
      
      switch (mood) {
        case 'happy':
        case 'excited':
          groupRef.current.position.y = -1 + Math.sin(time * 3) * 0.1;
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
      groupRef.current.position.y = -0.5;
      setTimeout(() => {
        if (groupRef.current) groupRef.current.position.y = -1;
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
  
  const scale = Math.min(2.2, viewport.width * 0.15);
  
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
      <group ref={groupRef} position={[1.5, -1, -2]} onClick={handleClick}>
        <primitive object={scene} scale={scale} />
      </group>
    </Float>
  );
}

// Fireflies
function Fireflies() {
  const fireflyRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (fireflyRef.current) {
      fireflyRef.current.children.forEach((firefly, i) => {
        const time = state.clock.elapsedTime + i * 2;
        firefly.position.x = Math.cos(time * 0.3) * 5 + (i % 2 === 0 ? 2 : -2);
        firefly.position.y = 0 + Math.sin(time * 0.5) * 2;
        firefly.position.z = Math.sin(time * 0.3) * 5 - 4;
      });
    }
  });
  
  return (
    <group ref={fireflyRef}>
      {[...Array(25)].map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial 
            color="#FFE8A1"
            emissive="#FFD700"
            emissiveIntensity={2.5}
            toneMapped={false}
          />
          <pointLight color="#FFE8A1" intensity={0.6} distance={3} />
        </mesh>
      ))}
    </group>
  );
}

// Particles
function MagicalParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particleCount = 400;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 1] = Math.random() * 25;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    
    const colorChoice = Math.random();
    if (colorChoice < 0.3) {
      colors[i * 3] = 1; colors[i * 3 + 1] = 0.95; colors[i * 3 + 2] = 0.6;
    } else if (colorChoice < 0.6) {
      colors[i * 3] = 0.8; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 0.9;
    } else {
      colors[i * 3] = 1; colors[i * 3 + 1] = 0.7; colors[i * 3 + 2] = 1;
    }
    
    sizes[i] = Math.random() * 0.25 + 0.05;
  }
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.01;
      
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.003;
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
        <bufferAttribute attach="attributes-size" count={particleCount} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial size={0.15} vertexColors transparent opacity={0.9} sizeAttenuation blending={THREE.AdditiveBlending} />
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
      {[...Array(15)].map((_, i) => {
        const angle = (i / 15) * Math.PI * 2;
        return (
          <mesh 
            key={i}
            position={[Math.cos(angle) * 0.4, 0, Math.sin(angle) * 0.4]}
            rotation={[0, -angle, 0]}
          >
            <coneGeometry args={[0.6, 25, 10, 1, true]} />
            <meshBasicMaterial color="#FFE8CC" transparent opacity={0.1} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
          </mesh>
        );
      })}
    </group>
  );
}

// Lighting
function DreamlikeLighting() {
  return (
    <>
      <directionalLight position={[-8, 18, -3]} intensity={2} castShadow shadow-mapSize={[4096, 4096]} shadow-camera-left={-25} shadow-camera-right={25} shadow-camera-top={25} shadow-camera-bottom={-25} color="#FFE8CC" />
      <directionalLight position={[10, 10, -5]} intensity={1} color="#FFD4A3" />
      <directionalLight position={[0, 12, 10]} intensity={0.8} color="#C8E6FF" />
      <ambientLight intensity={0.8} color="#FFE8CC" />
      <hemisphereLight args={['#B8E6FF', '#8B6F47', 1]} />
      <pointLight position={[-3, 6, -4]} intensity={2} color="#FFD700" distance={10} />
      <pointLight position={[3, 5, -3]} intensity={1.5} color="#FFE8A1" distance={9} />
      <pointLight position={[0, 7, -7]} intensity={1.2} color="#FFA07A" distance={12} />
    </>
  );
}

// Loading
function LoadingScene() {
  return (
    <mesh position={[0, 0, -5]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial color="#8B6F47" wireframe emissive="#FFD700" emissiveIntensity={0.5} />
    </mesh>
  );
}

// Responsive Camera
function ResponsiveCamera() {
  const { viewport, camera } = useThree();
  
  useEffect(() => {
    if (viewport.width / viewport.height < 1) {
      camera.position.set(0, 1, 13);
    } else {
      camera.position.set(0, 1, 11);
    }
    camera.updateProjectionMatrix();
  }, [viewport, camera]);
  
  return null;
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
          toneMappingExposure: 1.4,
          outputColorSpace: THREE.SRGBColorSpace
        }}
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 1, 11]} fov={70} />
        <ResponsiveCamera />
        
        {/* 360° Background - FILLS ALL SPACE! */}
        <Suspense fallback={null}>
          <ForestBackgroundSphere />
        </Suspense>
        
        <Environment preset="forest">
          <Lightformer intensity={2.5} position={[0, 10, -10]} scale={[10, 50, 1]} color="#FFE8A1" />
          <Lightformer intensity={1.5} position={[-10, 5, -5]} scale={[20, 5, 1]} color="#B8E6FF" />
        </Environment>
        
        <fog attach="fog" args={['#C8E6D9', 25, 70]} />
        
        <DreamlikeLighting />
        
        <Suspense fallback={<LoadingScene />}>
          {/* Ground Plane - NO WHITE SPACE */}
          <GroundPlane />
          
          {/* 3D Forest - MUCH LARGER */}
          <ForestEnvironment />
          
          {/* Treehouse */}
          <TreehouseModel />
          
          {/* Buddy */}
          <BuddyModel onClick={handleBuddyClick} />
        </Suspense>
        
        <MagicalParticles />
        <Fireflies />
        <VolumetricLight />
        
        <EffectComposer>
          <HueSaturation saturation={0.2} hue={0} />
          <BrightnessContrast brightness={0.08} contrast={0.15} />
          <Bloom intensity={1.4} luminanceThreshold={0.55} luminanceSmoothing={0.9} mipmapBlur />
          <DepthOfField focusDistance={0.012} focalLength={0.05} bokehScale={3.5} />
          <Vignette offset={0.1} darkness={0.3} />
        </EffectComposer>
        
        {interactive && (
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={7}
            maxDistance={22}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            target={[0, 0, -3]}
            maxAzimuthAngle={Math.PI / 2.5}
            minAzimuthAngle={-Math.PI / 2.5}
          />
        )}
      </Canvas>
    </div>
  );
}

useGLTF.preload('/buddy-model.glb');
useGLTF.preload('/enchanted_treehouse_3d_model.glb');
useGLTF.preload('/enchanted-forest-environment.glb');
useTexture.preload('/forest-background.jpg');

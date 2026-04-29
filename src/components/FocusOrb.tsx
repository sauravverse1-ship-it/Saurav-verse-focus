import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

interface FocusOrbProps {
  isRunning: boolean;
  color?: string;
}

const AnimatedOrb: React.FC<{ isRunning: boolean; color: string }> = ({ isRunning, color }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * (isRunning ? 0.5 : 0.1);
    meshRef.current.rotation.y = t * (isRunning ? 0.3 : 0.05);
    
    // Pulse effect
    const scale = isRunning ? 1 + Math.sin(t * 2) * 0.05 : 1;
    meshRef.current.scale.set(scale, scale, scale);
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <MeshDistortMaterial
          color={color}
          speed={isRunning ? 5 : 2}
          distort={isRunning ? 0.4 : 0.2}
          radius={1}
          metalness={0.8}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </Sphere>
    </Float>
  );
};

export const FocusOrb: React.FC<FocusOrbProps> = ({ isRunning, color = "#7cf9ff" }) => {
  return (
    <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} />
        <AnimatedOrb isRunning={isRunning} color={color} />
      </Canvas>
    </div>
  );
};

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface FireBreathingSceneProps {
  isRunning: boolean;
  intensity: number; // 0 to 1
}

const FireParticles: React.FC<{ isRunning: boolean; intensity: number }> = ({ isRunning, intensity }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = isRunning ? 400 : 150; // Reduced count for standard performance

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(500 * 3); 
    const col = new Float32Array(500 * 3);

    for (let i = 0; i < 500; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.4;
        pos[i * 3] = Math.cos(angle) * radius;
        pos[i * 3 + 1] = Math.random() * 3;
        pos[i * 3 + 2] = Math.sin(angle) * radius;

        const mix = Math.random();
        col[i * 3] = 1;
        col[i * 3 + 1] = 0.2 + Math.random() * (mix < 0.6 ? 0.3 : 0.8);
        col[i * 3 + 2] = 0;
    }
    return [pos, col];
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    const positionsAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = positionsAttr.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      let idx = i * 3;
      // Move upward - normalized speed
      const speed = delta * (isRunning ? 4 : 0.8);
      arr[idx + 1] += speed;

      // Noise horizontal movement
      arr[idx] += Math.sin(t * 3 + arr[idx + 1]) * 0.002;
      arr[idx + 2] += Math.cos(t * 3 + arr[idx + 1]) * 0.002;

      // Reset when too high
      if (arr[idx + 1] > 3.5) {
        arr[idx + 1] = 0;
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * (isRunning ? 0.6 : 0.2);
        arr[idx] = Math.cos(angle) * radius;
        arr[idx + 2] = Math.sin(angle) * radius;
      }
    }
    positionsAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
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
        size={0.08}
        vertexColors
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
};

const EmberCore: React.FC<{ isRunning: boolean }> = ({ isRunning }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    
    useFrame((state) => {
      if (!meshRef.current) return;
      const t = state.clock.getElapsedTime();
      const s = isRunning ? 1 + Math.sin(t * 10) * 0.1 : 0.8;
      meshRef.current.scale.set(s, s, s);
    });

    return (
        <mesh ref={meshRef} position={[0, -0.5, 0]}>
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshBasicMaterial color="#ff4400" transparent opacity={0.8} />
        </mesh>
    );
}

export const FireBreathingScene: React.FC<FireBreathingSceneProps> = ({ isRunning, intensity }) => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <Canvas camera={{ position: [0, 1, 4], fov: 40 }} gl={{ antialias: false, powerPreference: 'high-performance' }}>
        <color attach="background" args={['#0a0a0f']} />
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 0]} color="#ff4400" intensity={isRunning ? 2 : 0} />
        
        <FireParticles isRunning={isRunning} intensity={intensity} />
        <EmberCore isRunning={isRunning} />
        
        {isRunning && (
            <>
              <Sparkles count={20} scale={4} size={1} speed={0.5} color="#ffd166" />
              <Stars radius={50} depth={20} count={1000} factor={2} saturation={0} fade speed={0.5} />
            </>
        )}
      </Canvas>
    </div>
  );
};

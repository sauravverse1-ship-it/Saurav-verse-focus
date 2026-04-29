import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Torus, Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

const ClockMechanism: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const hourGroupRef = useRef<THREE.Group>(null);
  const minGroupRef = useRef<THREE.Group>(null);
  const secGroupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const now = new Date();
    const secs = now.getSeconds() + now.getMilliseconds() / 1000;
    const mins = now.getMinutes() + secs / 60;
    const hours = (now.getHours() % 12) + mins / 60;

    if (secGroupRef.current) secGroupRef.current.rotation.z = -secs * (Math.PI * 2 / 60);
    if (minGroupRef.current) minGroupRef.current.rotation.z = -mins * (Math.PI * 2 / 60);
    if (hourGroupRef.current) hourGroupRef.current.rotation.z = -hours * (Math.PI * 2 / 12);
    
    if (groupRef.current) {
        groupRef.current.rotation.y = Math.sin(Date.now() * 0.0002) * 0.15;
        groupRef.current.rotation.x = Math.cos(Date.now() * 0.0002) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer Ring */}
      <Torus args={[2.5, 0.1, 16, 100]}>
        <meshStandardMaterial color="#FFD166" metalness={0.9} roughness={0.1} emissive="#442200" emissiveIntensity={0.2} />
      </Torus>
      
      {/* Clock Face */}
      <Cylinder args={[2.5, 2.5, 0.1, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#0A0F1C" transparent opacity={0.6} metalness={0.8} roughness={0.3} />
      </Cylinder>

      {/* Markers */}
      {[...Array(12)].map((_, i) => (
        <mesh key={i} position={[Math.cos((i/12)*Math.PI*2)*2.1, Math.sin((i/12)*Math.PI*2)*2.1, 0.1]}>
          <boxGeometry args={[0.05, 0.2, 0.05]} />
          <meshStandardMaterial color="#FFD166" />
        </mesh>
      ))}

      {/* Hands */}
      <group ref={hourGroupRef} position={[0, 0, 0.15]}>
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[0.1, 1.2, 0.05]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </group>

      <group ref={minGroupRef} position={[0, 0, 0.15]}>
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[0.08, 1.8, 0.05]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </group>

      <group ref={secGroupRef} position={[0, 0, 0.2]}>
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[0.04, 2.0, 0.04]} />
          <meshStandardMaterial color="#FF4466" emissive="#FF4466" emissiveIntensity={0.5} />
        </mesh>
      </group>

      <mesh position={[0, 0, 0.25]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#FFD166" metalness={1} />
      </mesh>
    </group>
  );
};

export const Clock3D: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[300px] absolute inset-0 -z-10 opacity-30 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} color="#b388ff" intensity={0.5} />
        <ClockMechanism />
      </Canvas>
    </div>
  );
};

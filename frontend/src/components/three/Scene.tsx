'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Plane } from '@react-three/drei';
import { useRef, useState } from 'react';
import { Mesh } from 'three';

function RotatingBox() {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  return (
    <Box
      ref={meshRef}
      args={[1, 1, 1]}
      position={[-1.5, 0, 0]}
      scale={active ? 1.5 : 1}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </Box>
  );
}

function BouncingSphere() {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHover] = useState(false);

  return (
    <Sphere
      ref={meshRef}
      args={[0.7, 32, 32]}
      position={[1.5, 0, 0]}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <meshStandardMaterial
        color={hovered ? 'lightblue' : 'mediumpurple'}
        wireframe={hovered}
      />
    </Sphere>
  );
}

export default function Scene() {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        
        <RotatingBox />
        <BouncingSphere />
        
        <Plane args={[10, 10]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
          <meshStandardMaterial color="gray" />
        </Plane>
        
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
}
'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Text } from '@react-three/drei';
import * as THREE from 'three';

interface ClassroomProps {
  viewMode: 'current' | 'before';
  onItemClick: (item: string) => void;
}

export function Classroom({ viewMode, onItemClick }: ClassroomProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isCurrentView = viewMode === 'current';

  const walls = (
    <>
      <Box args={[10, 4, 0.2]} position={[0, 2, -5]} receiveShadow>
        <meshStandardMaterial color="#f3f4f6" />
      </Box>
      <Box args={[10, 4, 0.2]} position={[0, 2, 5]} receiveShadow>
        <meshStandardMaterial color="#f3f4f6" />
      </Box>
      <Box args={[0.2, 4, 10]} position={[-5, 2, 0]} receiveShadow>
        <meshStandardMaterial color="#f3f4f6" />
      </Box>
      <Box args={[0.2, 4, 10]} position={[5, 2, 0]} receiveShadow>
        <meshStandardMaterial color="#f3f4f6" />
      </Box>
    </>
  );

  const floor = (
    <Box args={[10, 0.1, 10]} position={[0, 0, 0]} receiveShadow>
      <meshStandardMaterial color="#d1d5db" />
    </Box>
  );

  const desks = () => {
    const deskPositions = [
      [-2, 0.4, -2], [0, 0.4, -2], [2, 0.4, -2],
      [-2, 0.4, 0], [0, 0.4, 0], [2, 0.4, 0],
      [-2, 0.4, 2], [0, 0.4, 2], [2, 0.4, 2],
    ];

    return deskPositions.map((pos, index) => (
      <group key={`desk-${index}`}>
        <Box
          args={[1.2, 0.05, 0.8]}
          position={pos as [number, number, number]}
          castShadow
          receiveShadow
          onClick={() => onItemClick(`Desk ${index + 1}: ${isCurrentView ? 'New desk with storage' : 'Old wooden desk'}`)}
          onPointerOver={() => setHoveredItem(`desk-${index}`)}
          onPointerOut={() => setHoveredItem(null)}
        >
          <meshStandardMaterial 
            color={isCurrentView ? "#8b5cf6" : "#a78bfa"}
            emissive={hoveredItem === `desk-${index}` ? "#8b5cf6" : "#000000"}
            emissiveIntensity={hoveredItem === `desk-${index}` ? 0.2 : 0}
          />
        </Box>
        <Box
          args={[0.05, 0.4, 0.05]}
          position={[pos[0] - 0.5, 0.2, pos[2] - 0.3]}
          castShadow
        >
          <meshStandardMaterial color="#6b7280" />
        </Box>
        <Box
          args={[0.05, 0.4, 0.05]}
          position={[pos[0] + 0.5, 0.2, pos[2] - 0.3]}
          castShadow
        >
          <meshStandardMaterial color="#6b7280" />
        </Box>
      </group>
    ));
  };

  const whiteboard = (
    <group
      onClick={() => onItemClick(isCurrentView ? 'Interactive Smart Board - Funded by donors' : 'Old chalkboard')}
      onPointerOver={() => setHoveredItem('whiteboard')}
      onPointerOut={() => setHoveredItem(null)}
    >
      <Box 
        args={[4, 2, 0.1]} 
        position={[0, 2, -4.9]} 
        castShadow
        receiveShadow
      >
        <meshStandardMaterial 
          color={isCurrentView ? "#ffffff" : "#1f2937"}
          emissive={hoveredItem === 'whiteboard' ? "#3b82f6" : "#000000"}
          emissiveIntensity={hoveredItem === 'whiteboard' ? 0.2 : 0}
        />
      </Box>
      {isCurrentView && (
        <Text
          position={[0, 2, -4.85]}
          fontSize={0.3}
          color="#1f2937"
          anchorX="center"
          anchorY="middle"
        >
          Smart Board
        </Text>
      )}
    </group>
  );

  const bookshelf = isCurrentView && (
    <group
      onClick={() => onItemClick('New Bookshelf - 200+ books donated')}
      onPointerOver={() => setHoveredItem('bookshelf')}
      onPointerOut={() => setHoveredItem(null)}
    >
      <Box 
        args={[2, 3, 0.3]} 
        position={[-4.5, 1.5, 0]} 
        castShadow
        receiveShadow
      >
        <meshStandardMaterial 
          color="#92400e"
          emissive={hoveredItem === 'bookshelf' ? "#ea580c" : "#000000"}
          emissiveIntensity={hoveredItem === 'bookshelf' ? 0.2 : 0}
        />
      </Box>
      {[0.5, 1.5, 2.5].map((y, i) => (
        <Box key={i} args={[1.8, 0.05, 0.25]} position={[-4.5, y, 0]} castShadow>
          <meshStandardMaterial color="#7c2d12" />
        </Box>
      ))}
    </group>
  );

  const supplies = isCurrentView && (
    <group>
      <Box
        args={[0.5, 0.3, 0.5]}
        position={[3.5, 1.5, -3.5]}
        castShadow
        onClick={() => onItemClick('Art Supplies - Funded last month')}
        onPointerOver={() => setHoveredItem('supplies')}
        onPointerOut={() => setHoveredItem(null)}
      >
        <meshStandardMaterial 
          color="#f59e0b"
          emissive={hoveredItem === 'supplies' ? "#fbbf24" : "#000000"}
          emissiveIntensity={hoveredItem === 'supplies' ? 0.3 : 0}
        />
      </Box>
    </group>
  );

  const computers = isCurrentView && (
    <>
      {[[-3, 0.9, 3.5], [3, 0.9, 3.5]].map((pos, i) => (
        <group 
          key={i}
          onClick={() => onItemClick(`Computer ${i + 1} - Donated by Tech Company`)}
          onPointerOver={() => setHoveredItem(`computer-${i}`)}
          onPointerOut={() => setHoveredItem(null)}
        >
          <Box
            args={[0.4, 0.3, 0.02]}
            position={pos as [number, number, number]}
            castShadow
          >
            <meshStandardMaterial 
              color="#1f2937"
              emissive={hoveredItem === `computer-${i}` ? "#3b82f6" : "#000000"}
              emissiveIntensity={hoveredItem === `computer-${i}` ? 0.3 : 0}
            />
          </Box>
          <Box
            args={[0.15, 0.15, 0.15]}
            position={[pos[0], 0.55, pos[2]]}
            castShadow
          >
            <meshStandardMaterial color="#4b5563" />
          </Box>
        </group>
      ))}
    </>
  );

  useFrame(() => {
    if (hoveredItem && groupRef.current) {
      groupRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      {walls}
      {floor}
      {desks()}
      {whiteboard}
      {bookshelf}
      {supplies}
      {computers}
    </group>
  );
}
'use client';

import { useState, useRef } from 'react';
import { Box, Html, Sphere } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface InteractableItemProps {
  position: [number, number, number];
  itemType: 'pencil' | 'notebook' | 'bookshelf' | 'fan' | 'board' | 'plant';
  isVisible: boolean;
  label: string;
  onClick?: () => void;
}

export function InteractableItem({ 
  position, 
  itemType, 
  isVisible, 
  label,
  onClick 
}: InteractableItemProps) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  // Animated appearance
  const { scale, opacity } = useSpring({
    scale: isVisible ? 1 : 0,
    opacity: isVisible ? 1 : 0,
    config: { tension: 100, friction: 20 }
  });
  
  // Floating animation for hoverable items
  useFrame((state) => {
    if (meshRef.current && isVisible) {
      meshRef.current.rotation.y += 0.01;
      if (hovered) {
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      }
    }
    
    // Glow effect
    if (glowRef.current && hovered) {
      glowRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      glowRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      glowRef.current.scale.z = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });
  
  const handleClick = () => {
    setClicked(true);
    onClick?.();
    setTimeout(() => setClicked(false), 500);
  };
  
  const getItemGeometry = () => {
    switch (itemType) {
      case 'pencil':
        return (
          <group>
            <mesh>
              <cylinderGeometry args={[0.02, 0.02, 0.3]} />
              <meshStandardMaterial color="#ffcc00" />
            </mesh>
            <mesh position={[0, 0.165, 0]}>
              <coneGeometry args={[0.02, 0.03]} />
              <meshStandardMaterial color="#2d2d2d" />
            </mesh>
          </group>
        );
      
      case 'notebook':
        return (
          <Box args={[0.25, 0.03, 0.35]}>
            <meshStandardMaterial color="#4a90e2" />
          </Box>
        );
      
      case 'bookshelf':
        return (
          <group>
            <Box args={[0.8, 1, 0.2]}>
              <meshStandardMaterial color="#8b6f47" />
            </Box>
            {/* Mini books */}
            {[0, 1, 2].map(i => (
              <Box key={i} position={[-0.2 + i * 0.2, 0, 0.12]} args={[0.1, 0.3, 0.15]}>
                <meshStandardMaterial color={['#e74c3c', '#3498db', '#2ecc71'][i]} />
              </Box>
            ))}
          </group>
        );
      
      case 'fan':
        return (
          <group>
            <Box args={[0.1, 0.15, 0.1]}>
              <meshStandardMaterial color="#4a4a4a" />
            </Box>
            {[0, 1, 2, 3].map(i => (
              <Box 
                key={i} 
                position={[
                  Math.cos(i * Math.PI / 2) * 0.3,
                  -0.05,
                  Math.sin(i * Math.PI / 2) * 0.3
                ]}
                args={[0.5, 0.01, 0.1]}
                rotation={[0, i * Math.PI / 2, 0]}
              >
                <meshStandardMaterial color="#ffffff" />
              </Box>
            ))}
          </group>
        );
      
      case 'board':
        return (
          <Box args={[1, 0.6, 0.05]}>
            <meshStandardMaterial color="#ffffff" />
          </Box>
        );
      
      case 'plant':
        return (
          <group>
            <Box args={[0.15, 0.15, 0.15]}>
              <meshStandardMaterial color="#8b4513" />
            </Box>
            <Sphere args={[0.2]} position={[0, 0.25, 0]}>
              <meshStandardMaterial color="#228b22" />
            </Sphere>
          </group>
        );
      
      default:
        return (
          <Sphere args={[0.2]}>
            <meshStandardMaterial color="#888888" />
          </Sphere>
        );
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <animated.group position={position} scale={scale}>
      {/* Glow effect when hovered */}
      {hovered && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial 
            color="#ffd700" 
            transparent 
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
      )}
      
      {/* Main item */}
      <animated.mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
        scale={clicked ? 1.2 : hovered ? 1.1 : 1}
      >
        {getItemGeometry()}
      </animated.mesh>
      
      {/* Floating label */}
      {hovered && (
        <Html
          position={[0, 0.5, 0]}
          center
          style={{
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          <div className="bg-black/80 backdrop-blur-md rounded-lg px-3 py-2 text-white text-xs whitespace-nowrap">
            <p className="font-semibold">{label}</p>
            <p className="opacity-70 text-[10px]">Click to learn more</p>
          </div>
        </Html>
      )}
      
      {/* Click effect particles */}
      {clicked && (
        <group>
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <animated.mesh
                key={i}
                position={[
                  Math.cos(angle) * 0.3,
                  0,
                  Math.sin(angle) * 0.3
                ]}
              >
                <sphereGeometry args={[0.02]} />
                <meshBasicMaterial color="#ffd700" />
              </animated.mesh>
            );
          })}
        </group>
      )}
    </animated.group>
  );
}
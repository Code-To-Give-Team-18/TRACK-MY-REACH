'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Plane, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring, animated } from '@react-spring/three';

interface ClassroomEnvironmentProps {
  donationAmount: number;
  tier: number;
}

export function ClassroomEnvironment({ donationAmount, tier }: ClassroomEnvironmentProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Calculate transformation values based on donation
  const transformationLevel = Math.min(donationAmount / 250, 1);
  
  // Animated transitions for smooth transformations
  const { wallColor, floorY, windowOpacity } = useSpring({
    wallColor: tier === 0 ? '#d4d4d4' : tier < 3 ? '#e5e5e5' : '#ffffff',
    floorY: tier < 2 ? -0.01 : 0,
    windowOpacity: tier < 3 ? 0.3 : 0.8,
    config: { tension: 20, friction: 10 }
  });

  // Student desk (first-person view)
  const StudentDesk = () => {
    const deskColor = tier === 0 ? '#8b6f47' : tier < 3 ? '#a0826d' : '#daa520';
    
    return (
      <group position={[0, 0.6, 1.8]}>
        {/* Desk top */}
        <Box args={[1.2, 0.05, 0.6]} castShadow receiveShadow>
          <meshStandardMaterial color={deskColor} roughness={0.8} />
        </Box>
        {/* Desk legs */}
        {[[-0.5, -0.3, -0.25], [0.5, -0.3, -0.25], [-0.5, -0.3, 0.25], [0.5, -0.3, 0.25]].map((pos, i) => (
          <Box key={i} position={pos as [number, number, number]} args={[0.05, 0.6, 0.05]} castShadow>
            <meshStandardMaterial color={deskColor} />
          </Box>
        ))}
        
        {/* Items on desk appear with donations */}
        {donationAmount >= 10 && (
          <group position={[0.3, 0.05, 0]}>
            {/* Pencil */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.005, 0.005, 0.15]} />
              <meshStandardMaterial color="#ffcc00" />
            </mesh>
          </group>
        )}
        
        {donationAmount >= 15 && (
          <group position={[-0.2, 0.03, 0]}>
            {/* Notebook */}
            <Box args={[0.2, 0.02, 0.25]}>
              <meshStandardMaterial color="#4a90e2" />
            </Box>
          </group>
        )}
      </group>
    );
  };

  // Classroom walls with cracks that repair
  const Walls = () => {
    return (
      <>
        {/* Back wall */}
        <animated.mesh position={[0, 2, -4]} receiveShadow>
          <planeGeometry args={[8, 4]} />
          <animated.meshStandardMaterial 
            color={wallColor}
            roughness={tier === 0 ? 1 : 0.7}
          />
        </animated.mesh>
        
        {/* Side walls */}
        <animated.mesh position={[-4, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[8, 4]} />
          <animated.meshStandardMaterial color={wallColor} />
        </animated.mesh>
        
        <animated.mesh position={[4, 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[8, 4]} />
          <animated.meshStandardMaterial color={wallColor} />
        </animated.mesh>
      </>
    );
  };

  // Floor that upgrades from worn to clean
  const Floor = () => {
    const floorColor = tier === 0 ? '#6b5d54' : tier < 3 ? '#8b7d72' : '#d2b48c';
    
    return (
      <animated.mesh 
        position-y={floorY} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial 
          color={floorColor}
          roughness={tier === 0 ? 1 : 0.6}
        />
      </animated.mesh>
    );
  };

  // Chalkboard/Whiteboard transformation
  const Board = () => {
    const isWhiteboard = tier >= 4;
    const boardColor = isWhiteboard ? '#ffffff' : '#2d3436';
    
    return (
      <group position={[0, 2, -3.9]}>
        <Box args={[3, 1.5, 0.1]} castShadow>
          <meshStandardMaterial 
            color={boardColor}
            roughness={isWhiteboard ? 0.2 : 0.9}
            metalness={isWhiteboard ? 0.1 : 0}
          />
        </Box>
        
        {/* Board content appears with donations */}
        {donationAmount >= 30 && (
          <group position={[0, 0, 0.06]}>
            <mesh>
              <planeGeometry args={[2.8, 1.3]} />
              <meshBasicMaterial 
                color={isWhiteboard ? '#0066cc' : '#ffffff'}
                opacity={0.8}
                transparent
              />
            </mesh>
          </group>
        )}
      </group>
    );
  };

  // Bookshelf that fills with books
  const Bookshelf = () => {
    const shelfColor = tier < 2 ? '#6b5d54' : '#8b6f47';
    const bookCount = Math.floor((donationAmount - 25) / 5);
    
    return (
      <group position={[-3, 1.5, -3.5]}>
        {/* Shelf frame */}
        <Box args={[1.5, 2, 0.3]} castShadow>
          <meshStandardMaterial color={shelfColor} />
        </Box>
        
        {/* Books appear progressively */}
        {donationAmount >= 25 && (
          <group>
            {Array.from({ length: Math.min(bookCount, 15) }).map((_, i) => {
              const row = Math.floor(i / 5);
              const col = i % 5;
              const bookColors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
              
              return (
                <Box
                  key={i}
                  position={[-0.6 + col * 0.25, -0.5 + row * 0.6, 0.2]}
                  args={[0.15, 0.4, 0.2]}
                  castShadow
                >
                  <meshStandardMaterial color={bookColors[i % 5]} />
                </Box>
              );
            })}
          </group>
        )}
      </group>
    );
  };

  // Windows that get repaired and cleaned
  const Windows = () => {
    return (
      <>
        <group position={[3.9, 2.5, -2]}>
          <Box args={[0.1, 1.5, 1]} castShadow>
            <meshStandardMaterial color="#8b6f47" />
          </Box>
          <Plane args={[0.9, 1.4]} position={[0.05, 0, 0]}>
            <animated.meshPhysicalMaterial
              color="#87ceeb"
              transparent
              opacity={windowOpacity}
              roughness={tier < 3 ? 0.8 : 0.1}
              metalness={0.1}
            />
          </Plane>
        </group>
        
        <group position={[3.9, 2.5, 2]}>
          <Box args={[0.1, 1.5, 1]} castShadow>
            <meshStandardMaterial color="#8b6f47" />
          </Box>
          <Plane args={[0.9, 1.4]} position={[0.05, 0, 0]}>
            <animated.meshPhysicalMaterial
              color="#87ceeb"
              transparent
              opacity={windowOpacity}
              roughness={tier < 3 ? 0.8 : 0.1}
              metalness={0.1}
            />
          </Plane>
        </group>
      </>
    );
  };

  // Ceiling fan that starts working
  const CeilingFan = () => {
    const fanRef = useRef<THREE.Mesh>(null);
    const isWorking = donationAmount >= 50;
    
    useFrame((state, delta) => {
      if (fanRef.current && isWorking) {
        fanRef.current.rotation.y += delta * 2;
      }
    });
    
    return (
      <group position={[0, 3.8, 0]}>
        <Box args={[0.2, 0.3, 0.2]} castShadow>
          <meshStandardMaterial color="#4a4a4a" />
        </Box>
        <mesh ref={fanRef}>
          {[0, Math.PI / 3, (Math.PI * 2) / 3, Math.PI, (Math.PI * 4) / 3, (Math.PI * 5) / 3].map((angle, i) => (
            <Box
              key={i}
              position={[Math.cos(angle) * 0.8, -0.1, Math.sin(angle) * 0.8]}
              args={[1.2, 0.02, 0.2]}
              castShadow
            >
              <meshStandardMaterial color={isWorking ? '#ffffff' : '#cccccc'} />
            </Box>
          ))}
        </mesh>
      </group>
    );
  };

  // Other student desks (ghost-like to solid)
  const OtherStudents = () => {
    const studentOpacity = Math.min(donationAmount / 150, 1);
    
    if (donationAmount < 50) return null;
    
    return (
      <>
        {[[-2, 0, 0], [2, 0, 0], [-2, 0, -2], [2, 0, -2]].map((pos, i) => (
          <group key={i} position={pos as [number, number, number]}>
            <Box args={[1, 0.05, 0.5]} position={[0, 0.6, 0]} castShadow>
              <meshStandardMaterial 
                color="#a0826d" 
                transparent 
                opacity={studentOpacity}
              />
            </Box>
          </group>
        ))}
      </>
    );
  };

  // Plants that appear and grow
  const Plants = () => {
    if (donationAmount < 100) return null;
    
    const plantScale = Math.min((donationAmount - 100) / 100, 1);
    
    return (
      <>
        <group position={[-3.5, 0, -3.5]} scale={[plantScale, plantScale, plantScale]}>
          <Box args={[0.3, 0.3, 0.3]} castShadow>
            <meshStandardMaterial color="#8b4513" />
          </Box>
          <Box args={[0.1, 0.8, 0.1]} position={[0, 0.5, 0]} castShadow>
            <meshStandardMaterial color="#228b22" />
          </Box>
        </group>
        
        <group position={[3.5, 0, -3.5]} scale={[plantScale, plantScale, plantScale]}>
          <Box args={[0.3, 0.3, 0.3]} castShadow>
            <meshStandardMaterial color="#8b4513" />
          </Box>
          <Box args={[0.1, 0.8, 0.1]} position={[0, 0.5, 0]} castShadow>
            <meshStandardMaterial color="#228b22" />
          </Box>
        </group>
      </>
    );
  };

  return (
    <group ref={groupRef}>
      <Floor />
      <Walls />
      <StudentDesk />
      <Board />
      <Bookshelf />
      <Windows />
      <CeilingFan />
      <OtherStudents />
      <Plants />
      
      {/* Ceiling */}
      <mesh position={[0, 4, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial 
          color={tier === 0 ? '#b0b0b0' : '#f0f0f0'}
          roughness={0.9}
        />
      </mesh>
    </group>
  );
}
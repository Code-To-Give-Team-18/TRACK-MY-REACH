'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

interface DeskSceneProps {
  donationAmount: number;
}

// Placeholder component for the child sitting at desk
function ChildPlaceholder() {
  return (
    <group position={[0, 0.6, -0.3]}>
      {/* Head */}
      <Sphere args={[0.15]} position={[0, 0.9, 0]}>
        <meshStandardMaterial color="#FFB6C1" />
      </Sphere>
      
      {/* Body */}
      <Box args={[0.3, 0.4, 0.2]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#4A90E2" />
      </Box>
      
      {/* Arms - simplified cylinders */}
      <Cylinder args={[0.04, 0.04, 0.3]} position={[-0.2, 0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
        <meshStandardMaterial color="#FFB6C1" />
      </Cylinder>
      <Cylinder args={[0.04, 0.04, 0.3]} position={[0.2, 0.5, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <meshStandardMaterial color="#FFB6C1" />
      </Cylinder>
    </group>
  );
}

// Placeholder for desk
function DeskPlaceholder() {
  return (
    <group>
      {/* Desk top */}
      <Box args={[1.5, 0.05, 0.8]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      
      {/* Desk legs */}
      <Box args={[0.05, 0.5, 0.05]} position={[-0.6, 0.25, -0.3]}>
        <meshStandardMaterial color="#654321" />
      </Box>
      <Box args={[0.05, 0.5, 0.05]} position={[0.6, 0.25, -0.3]}>
        <meshStandardMaterial color="#654321" />
      </Box>
      <Box args={[0.05, 0.5, 0.05]} position={[-0.6, 0.25, 0.3]}>
        <meshStandardMaterial color="#654321" />
      </Box>
      <Box args={[0.05, 0.5, 0.05]} position={[0.6, 0.25, 0.3]}>
        <meshStandardMaterial color="#654321" />
      </Box>
    </group>
  );
}

// Placeholder for stationery set (HKD 50-80)
function StationerySet({ visible }: { visible: boolean }) {
  if (!visible) return null;
  
  return (
    <group position={[-0.3, 0.55, 0.1]}>
      {/* Pencil case */}
      <Box args={[0.2, 0.05, 0.1]}>
        <meshStandardMaterial color="#FF69B4" />
      </Box>
      {/* Pencils (simplified) */}
      <Cylinder args={[0.01, 0.01, 0.15]} position={[0.05, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#FFFF00" />
      </Cylinder>
      <Cylinder args={[0.01, 0.01, 0.15]} position={[0.05, 0.08, 0.02]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#00FF00" />
      </Cylinder>
    </group>
  );
}

// Placeholder for books and worksheets (HKD 150-200)
function BooksAndWorksheets({ visible }: { visible: boolean }) {
  if (!visible) return null;
  
  return (
    <group position={[0.3, 0.55, 0.1]}>
      {/* Stack of books */}
      <Box args={[0.2, 0.03, 0.25]}>
        <meshStandardMaterial color="#4169E1" />
      </Box>
      <Box args={[0.2, 0.03, 0.25]} position={[0, 0.03, 0]}>
        <meshStandardMaterial color="#32CD32" />
      </Box>
      <Box args={[0.2, 0.03, 0.25]} position={[0, 0.06, 0]}>
        <meshStandardMaterial color="#FF6347" />
      </Box>
    </group>
  );
}

// Placeholder for lunch set (HKD 300-400)
function LunchSet({ visible }: { visible: boolean }) {
  if (!visible) return null;
  
  const lunchboxRef = useRef<THREE.Mesh>(null);
  
  // Small animation for the lunchbox
  useFrame((state) => {
    if (lunchboxRef.current) {
      lunchboxRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });
  
  return (
    <group position={[-0.3, 0.55, -0.2]}>
      {/* Lunchbox */}
      <Box ref={lunchboxRef} args={[0.15, 0.08, 0.12]}>
        <meshStandardMaterial color="#FFB6C1" />
      </Box>
      {/* Milk box */}
      <Box args={[0.05, 0.08, 0.04]} position={[0.1, 0.04, 0]}>
        <meshStandardMaterial color="#FFFFFF" />
      </Box>
      {/* Apple (simplified sphere) */}
      <Sphere args={[0.03]} position={[0.1, 0.04, 0.08]}>
        <meshStandardMaterial color="#FF0000" />
      </Sphere>
    </group>
  );
}

// Placeholder for educational learning kit (HKD 500-800)
function LearningKit({ visible }: { visible: boolean }) {
  if (!visible) return null;
  
  return (
    <group position={[0.3, 0.55, -0.2]}>
      {/* Counting blocks */}
      <Box args={[0.04, 0.04, 0.04]} position={[0, 0.02, 0]}>
        <meshStandardMaterial color="#FF0000" />
      </Box>
      <Box args={[0.04, 0.04, 0.04]} position={[0.05, 0.02, 0]}>
        <meshStandardMaterial color="#00FF00" />
      </Box>
      <Box args={[0.04, 0.04, 0.04]} position={[0.1, 0.02, 0]}>
        <meshStandardMaterial color="#0000FF" />
      </Box>
      
      {/* Alphabet cards (simplified) */}
      <Box args={[0.08, 0.001, 0.12]} position={[0, 0.06, 0.1]}>
        <meshStandardMaterial color="#FFFF00" />
      </Box>
      
      {/* Puzzle piece placeholder */}
      <Cylinder args={[0.05, 0.05, 0.01]} position={[-0.05, 0.04, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#9370DB" />
      </Cylinder>
    </group>
  );
}

// Simple classroom background
function ClassroomBackground() {
  return (
    <group>
      {/* Floor */}
      <Box args={[10, 0.1, 10]} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#D2B48C" />
      </Box>
      
      {/* Back wall */}
      <Box args={[10, 5, 0.1]} position={[0, 2.5, -3]}>
        <meshStandardMaterial color="#F0E68C" />
      </Box>
      
      {/* Blackboard placeholder */}
      <Box args={[3, 1.5, 0.05]} position={[0, 2, -2.95]}>
        <meshStandardMaterial color="#2F4F2F" />
      </Box>
    </group>
  );
}

export function DeskScene({ donationAmount }: DeskSceneProps) {
  return (
    <group>
      <ClassroomBackground />
      <DeskPlaceholder />
      <ChildPlaceholder />
      
      {/* Items appear based on donation amount (in HKD) */}
      <StationerySet visible={donationAmount >= 50} />
      <BooksAndWorksheets visible={donationAmount >= 150} />
      <LunchSet visible={donationAmount >= 300} />
      <LearningKit visible={donationAmount >= 500} />
    </group>
  );
}
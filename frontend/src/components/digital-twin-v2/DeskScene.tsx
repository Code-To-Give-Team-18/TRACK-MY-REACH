'use client';

import { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ErrorBoundary } from 'react-error-boundary';

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

// Fallback for stationery when model fails to load
function StationeryFallback() {
  return (
    <group position={[-0.1, 0.55, 0.2]}>
      {/* Pencil holder */}
      <Cylinder args={[0.05, 0.05, 0.1]} position={[0, 0.05, 0]}>
        <meshStandardMaterial color="#4169E1" />
      </Cylinder>
      {/* Pencils */}
      <Cylinder args={[0.01, 0.01, 0.15]} position={[0, 0.1, 0]} rotation={[0, 0, 0.1]}>
        <meshStandardMaterial color="#FFD700" />
      </Cylinder>
      <Cylinder args={[0.01, 0.01, 0.15]} position={[0.02, 0.1, 0]} rotation={[0, 0, -0.1]}>
        <meshStandardMaterial color="#FF69B4" />
      </Cylinder>
    </group>
  );
}

// Stationery set (HKD 50-80) - Using real model with fallback
function StationerySet({ visible }: { visible: boolean }) {
  if (!visible) return null;
  
  try {
    const { scene } = useGLTF('/models/stationary.glb');
    const clonedScene = scene.clone();
    
    return (
      <primitive 
        object={clonedScene} 
        position={[-0.1, 0.55, 0.2]}
        scale={[1, 1, 1]}
        rotation={[0, Math.PI / 4, 0]}
      />
    );
  } catch (error) {
    console.warn('Failed to load stationery model, using fallback');
    return <StationeryFallback />;
  }
}

// Fallback for books when model fails to load
function BooksFallback() {
  return (
    <group position={[0.2, 0.55, 0.15]}>
      {/* Stack of books */}
      <Box args={[0.15, 0.02, 0.2]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      <Box args={[0.15, 0.02, 0.2]} position={[0, 0.025, 0]} rotation={[0, 0.1, 0]}>
        <meshStandardMaterial color="#4169E1" />
      </Box>
      <Box args={[0.15, 0.02, 0.2]} position={[0, 0.05, 0]} rotation={[0, -0.1, 0]}>
        <meshStandardMaterial color="#228B22" />
      </Box>
    </group>
  );
}

// Books and worksheets (HKD 150-200) - Using real model with fallback
function BooksAndWorksheets({ visible }: { visible: boolean }) {
  if (!visible) return null;
  
  try {
    const { scene } = useGLTF('/models/Book Stack.glb');
    const clonedScene = scene.clone();
    
    return (
      <primitive 
        object={clonedScene} 
        position={[0.2, 0.55, 0.15]}
        scale={[0.3, 0.3, 0.3]}
        rotation={[0, -Math.PI / 6, 0]}
      />
    );
  } catch (error) {
    console.warn('Failed to load books model, using fallback');
    return <BooksFallback />;
  }
}

// Fallback for lunch when model fails to load
function LunchFallback() {
  const lunchRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (lunchRef.current) {
      lunchRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });
  
  return (
    <group ref={lunchRef} position={[-0.2, 0.55, -0.2]}>
      {/* Lunch box */}
      <Box args={[0.12, 0.05, 0.1]}>
        <meshStandardMaterial color="#FF6347" />
      </Box>
      {/* Apple */}
      <Sphere args={[0.03]} position={[0.08, 0.03, 0]}>
        <meshStandardMaterial color="#FF0000" />
      </Sphere>
    </group>
  );
}

// Lunch set (HKD 300-400) - Using real model with fallback
function LunchSet({ visible }: { visible: boolean }) {
  const lunchRef = useRef<THREE.Group>(null);
  
  // Animation hook must be called unconditionally
  useFrame((state) => {
    if (lunchRef.current && visible) {
      lunchRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });
  
  if (!visible) return null;
  
  try {
    const { scene } = useGLTF('/models/Ramen_lunch.glb');
    const clonedScene = scene.clone();
    
    return (
      <group ref={lunchRef}>
        <primitive 
          object={clonedScene} 
          position={[-0.2, 0.55, -0.2]}
          scale={[0.2, 0.2, 0.2]}
          rotation={[0, Math.PI / 3, 0]}
        />
      </group>
    );
  } catch (error) {
    console.warn('Failed to load lunch model, using fallback');
    return <LunchFallback />;
  }
}

// Fallback for laptop when model fails to load
function LaptopFallback() {
  return (
    <group position={[0.1, 0.55, -0.2]} rotation={[0, -Math.PI * 1.2, 0]}>
      {/* Laptop base */}
      <Box args={[0.2, 0.01, 0.15]}>
        <meshStandardMaterial color="#696969" />
      </Box>
      {/* Laptop screen */}
      <Box args={[0.2, 0.15, 0.01]} position={[0, 0.075, -0.07]} rotation={[-0.3, 0, 0]}>
        <meshStandardMaterial color="#1E90FF" />
      </Box>
    </group>
  );
}

// Educational learning kit (HKD 500-800) - Using laptop model with fallback
function LearningKit({ visible }: { visible: boolean }) {
  if (!visible) return null;
  
  try {
    const { scene } = useGLTF('/models/Laptop.glb');
    const clonedScene = scene.clone();
    
    return (
      <primitive 
        object={clonedScene} 
        position={[0.1, 0.55, -0.2]}
        scale={[1, 1, 1]}
        rotation={[0, -Math.PI * 1.2, 0]}
      />
    );
  } catch (error) {
    console.warn('Failed to load laptop model, using fallback');
    return <LaptopFallback />;
  }
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
      
      {/* Left wall */}
      <Box args={[0.1, 5, 10]} position={[-3, 2.5, 0]}>
        <meshStandardMaterial color="#F0E68C" />
      </Box>
      
      {/* Right wall */}
      <Box args={[0.1, 5, 10]} position={[3, 2.5, 0]}>
        <meshStandardMaterial color="#F0E68C" />
      </Box>
      
      {/* Blackboard placeholder */}
      <Box args={[3, 1.5, 0.05]} position={[0, 2, -2.95]}>
        <meshStandardMaterial color="#2F4F2F" />
      </Box>
    </group>
  );
}

// Component with safe model loading
function SafeModelLoader({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={<group />}
      onError={(error) => console.warn('3D model loading error:', error)}
    >
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

export function DeskScene({ donationAmount }: DeskSceneProps) {
  return (
    <group>
      <ClassroomBackground />
      <DeskPlaceholder />
      {/* <ChildPlaceholder /> */}
      
      {/* Items appear based on donation amount (in HKD) - wrapped in safe loaders */}
      <SafeModelLoader>
        <StationerySet visible={donationAmount >= 50} />
      </SafeModelLoader>
      <SafeModelLoader>
        <BooksAndWorksheets visible={donationAmount >= 150} />
      </SafeModelLoader>
      <SafeModelLoader>
        <LunchSet visible={donationAmount >= 300} />
      </SafeModelLoader>
      <SafeModelLoader>
        <LearningKit visible={donationAmount >= 500} />
      </SafeModelLoader>
    </group>
  );
}
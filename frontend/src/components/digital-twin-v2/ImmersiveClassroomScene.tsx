'use client';

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  PerspectiveCamera, 
  OrbitControls, 
  Environment,
  Float,
  Sparkles,
  useTexture,
  Text,
  Center
} from '@react-three/drei';
import * as THREE from 'three';
import { ClassroomEnvironment } from './ClassroomEnvironment';
import { InteractableItem } from './InteractableItem';
import { useDonationTiers } from '@/hooks/useDonationTiers';
import { useSpring, animated } from '@react-spring/three';

interface ImmersiveClassroomSceneProps {
  donationAmount: number;
  onLoadComplete?: () => void;
}

function CameraController() {
  const { camera } = useThree();
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const targetX = useRef(0);
  const targetY = useRef(0);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Check if mouse is over UI elements
      const target = event.target as HTMLElement;
      const isOverSlider = target.closest('[data-ui-overlay="donation-slider"]');
      const isOverHUD = target.closest('[data-ui-overlay="impact-hud"]');
      
      if (isOverSlider || isOverHUD) {
        // Center camera when over UI
        mouseX.current = 0;
        mouseY.current = 0;
      } else {
        // Follow mouse when over 3D scene
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = -(event.clientY / window.innerHeight) * 2 + 1;
        mouseX.current = x;
        mouseY.current = y;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // Set initial camera position (child's eye level at desk)
    camera.position.set(0, 1.2, 2);
    camera.lookAt(0, 1.5, -2);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [camera]);

  useFrame(() => {
    // Smooth camera movement
    targetX.current += (mouseX.current * 0.5 - targetX.current) * 0.05;
    targetY.current += (mouseY.current * 0.3 - targetY.current) * 0.05;
    
    camera.rotation.y = -targetX.current * 0.5;
    camera.rotation.x = targetY.current * 0.3;
  });

  return null;
}

function DynamicLighting({ donationAmount }: { donationAmount: number }) {
  const lightIntensity = Math.min(1 + donationAmount / 200, 2.5);
  const lightColor = new THREE.Color().lerpColors(
    new THREE.Color(0.5, 0.5, 0.6), // Dim, cold
    new THREE.Color(1, 0.95, 0.8),  // Bright, warm
    Math.min(donationAmount / 250, 1)
  );

  const { intensity } = useSpring({
    intensity: lightIntensity,
    config: { tension: 20, friction: 10 }
  });

  return (
    <>
      <animated.ambientLight intensity={intensity} color={lightColor} />
      <animated.directionalLight
        position={[5, 8, 5]}
        intensity={intensity}
        color={lightColor}
        castShadow={donationAmount > 25} // Only cast shadows when needed
        shadow-mapSize={[1024, 1024]} // Reduced shadow resolution
        shadow-camera-far={20}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      {donationAmount > 100 && (
        <animated.pointLight
          position={[0, 3, 0]}
          intensity={intensity}
          color="#fff5e6"
          castShadow={false} // No shadows from point light
        />
      )}
    </>
  );
}

function ParticleEffects({ donationAmount, tier }: { donationAmount: number; tier: number }) {
  if (donationAmount < 10) return null;

  return (
    <>
      {/* Minimal dust particles */}
      {donationAmount < 50 && (
        <Sparkles
          count={20} // Reduced from 100
          scale={8}
          size={1.5}
          speed={0.1}
          opacity={0.2}
          color="#8b7355"
        />
      )}
      
      {/* Golden sparkles for major transformations only */}
      {tier >= 3 && tier % 2 === 0 && ( // Only show on specific tiers
        <Sparkles
          count={15} // Reduced from 50
          scale={6}
          size={2}
          speed={0.3}
          opacity={0.6}
          color="#ffd700"
        />
      )}

      {/* Remove Float wrapper for performance */}
      {donationAmount > 200 && ( // Increased threshold
        <Sparkles
          count={10} // Reduced from 30
          scale={5}
          size={3}
          speed={0.5}
          opacity={0.8}
          color="#ff69b4"
        />
      )}
    </>
  );
}

export function ImmersiveClassroomScene({ 
  donationAmount, 
  onLoadComplete 
}: ImmersiveClassroomSceneProps) {
  const [loaded, setLoaded] = useState(false);
  const { currentTier, getTierConfig } = useDonationTiers(donationAmount);
  
  useEffect(() => {
    if (loaded && onLoadComplete) {
      onLoadComplete();
    }
  }, [loaded, onLoadComplete]);

  return (
    <Canvas
      shadows="soft"
      dpr={[1, 1.5]} // Limit pixel ratio for performance
      gl={{ 
        antialias: false, // Disable for better performance
        powerPreference: "high-performance",
        alpha: false,
        stencil: false,
        depth: true
      }}
      onCreated={() => setLoaded(true)}
      performance={{ min: 0.5 }} // Adaptive performance
    >
      <fog attach="fog" args={['#f0f0f0', 8, 25]} />
      
      <CameraController />
      <DynamicLighting donationAmount={donationAmount} />
      
      {/* Simplified environment for performance */}
      <Environment preset="sunset" intensity={0.2} resolution={64} />
      
      {/* Main classroom environment */}
      <ClassroomEnvironment 
        donationAmount={donationAmount}
        tier={currentTier}
      />
      
      {/* Particle effects */}
      <ParticleEffects 
        donationAmount={donationAmount} 
        tier={currentTier}
      />
      
      {/* Interactive items */}
      <InteractableItem
        position={[-1, 0.8, 1.5]}
        itemType="pencil"
        isVisible={donationAmount >= 10}
        label="Basic Supplies - $10"
      />
      
      <InteractableItem
        position={[1, 0.8, 1.5]}
        itemType="notebook"
        isVisible={donationAmount >= 15}
        label="Notebooks - $15"
      />
      
      <InteractableItem
        position={[-2, 2, -3]}
        itemType="bookshelf"
        isVisible={donationAmount >= 25}
        label="Learning Materials - $25"
      />
      
      <InteractableItem
        position={[2, 2.5, -2]}
        itemType="fan"
        isVisible={donationAmount >= 50}
        label="Ceiling Fan - $50"
      />
      
      {/* Handwritten note on desk that becomes clearer */}
      {donationAmount > 0 && (
        <group position={[0, 0.81, 1.3]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.3, 0.2]} />
            <meshBasicMaterial 
              color="#fff9e6" 
              opacity={Math.min(donationAmount / 100, 1)}
              transparent
            />
          </mesh>
          {donationAmount > 25 && (
            <Text
              position={[0, 0.01, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.02}
              color="#2563eb"
              anchorX="center"
              anchorY="middle"
              material-opacity={Math.min((donationAmount - 25) / 50, 1)}
              material-transparent={true}
            >
              Thank you! ❤️
            </Text>
          )}
        </group>
      )}
    </Canvas>
  );
}
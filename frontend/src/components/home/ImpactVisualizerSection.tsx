'use client';

import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { ClassroomEnvironment } from '@/components/digital-twin-v2/ClassroomEnvironment';
import { InteractableItem } from '@/components/digital-twin-v2/InteractableItem';
import { DonationSlider } from '@/components/digital-twin-v2/DonationSlider';
import { ImpactHUD } from '@/components/digital-twin-v2/ImpactHUD';
import { useDonationTiers } from '@/hooks/useDonationTiers';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

function DynamicLighting({ donationAmount }: { donationAmount: number }) {
  const lightIntensity = Math.min(1 + donationAmount / 200, 2.5);
  const lightColor = new THREE.Color().lerpColors(
    new THREE.Color(0.5, 0.5, 0.6),
    new THREE.Color(1, 0.95, 0.8),
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
        castShadow={donationAmount > 25}
        shadow-mapSize={[1024, 1024]}
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
          castShadow={false}
        />
      )}
    </>
  );
}

function ClassroomScene({ donationAmount }: { donationAmount: number }) {
  const { currentTier } = useDonationTiers(donationAmount);

  return (
    <Canvas
      shadows="soft"
      dpr={[1, 1.5]}
      gl={{
        antialias: false,
        powerPreference: "high-performance",
        alpha: false,
        stencil: false,
        depth: true
      }}
      camera={{ position: [3, 2.5, 5], fov: 50 }}
      performance={{ min: 0.5 }}
    >
      <fog attach="fog" args={['#f0f0f0', 8, 25]} />
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.5}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
        autoRotate
        autoRotateSpeed={0.5}
      />
      
      <DynamicLighting donationAmount={donationAmount} />
      <Environment preset="sunset" intensity={0.2} resolution={64} />
      
      <ClassroomEnvironment 
        donationAmount={donationAmount}
        tier={currentTier}
      />
      
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
    </Canvas>
  );
}

export function ImpactVisualizerSection() {
  const [donationAmount, setDonationAmount] = useState(0);

  return (
    <section className="relative w-full h-screen bg-gradient-to-b from-gray-900 to-black overflow-hidden">
      {/* Background 3D Scene */}
      <div className="absolute inset-0">
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center bg-black">
            <div className="text-white text-lg">Loading visualization...</div>
          </div>
        }>
          <ClassroomScene donationAmount={donationAmount} />
        </Suspense>
      </div>

      {/* Section Header */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
          See Your Impact in Real-Time
        </h2>
        <p className="text-lg text-white/80">
          Transform Ming&apos;s classroom with your donation
        </p>
        <div className="mt-4 bg-black/50 backdrop-blur-md rounded-lg px-6 py-3 inline-block">
          <p className="text-sm text-white/90">A 5-year-old who dreams of becoming an artist</p>
        </div>
      </div>

      {/* Impact HUD */}
      <ImpactHUD donationAmount={donationAmount} />

      {/* Donation Controls */}
      <DonationSlider 
        value={donationAmount}
        onChange={setDonationAmount}
      />

      {/* Optional CTA at bottom */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg px-6 py-3 text-white text-center">
          <p className="text-sm opacity-90">Adjust the donation amount to see the transformation</p>
        </div>
      </div>
    </section>
  );
}
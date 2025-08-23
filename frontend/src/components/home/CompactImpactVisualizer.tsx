'use client';

import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { ClassroomEnvironment } from '@/components/digital-twin-v2/ClassroomEnvironment';
import { InteractableItem } from '@/components/digital-twin-v2/InteractableItem';
import { useDonationTiers } from '@/hooks/useDonationTiers';
import { useSpring, animated } from '@react-spring/three';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
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
      />
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

export function CompactImpactVisualizer() {
  const [donationAmount, setDonationAmount] = useState(0);
  const [isMonthly, setIsMonthly] = useState(false);
  
  const quickAmounts = [10, 25, 50, 100, 250];
  
  const getTierName = (amount: number) => {
    if (amount === 0) return 'Base State';
    if (amount < 10) return 'Getting Started';
    if (amount < 25) return 'Basic Supplies';
    if (amount < 50) return 'Learning Materials';
    if (amount < 100) return 'Comfort Improvements';
    if (amount < 250) return 'Enhanced Learning';
    return 'Complete Transformation';
  };
  
  const getTierColor = (amount: number) => {
    if (amount === 0) return 'from-gray-500 to-gray-600';
    if (amount < 25) return 'from-blue-500 to-blue-600';
    if (amount < 50) return 'from-green-500 to-green-600';
    if (amount < 100) return 'from-purple-500 to-purple-600';
    if (amount < 250) return 'from-pink-500 to-pink-600';
    return 'from-yellow-400 to-orange-500';
  };
  
  const getImpactItems = (amount: number) => {
    const items = [];
    if (amount >= 10) items.push('✏️ Pencils & Erasers');
    if (amount >= 15) items.push('📓 Notebooks');
    if (amount >= 25) items.push('📚 15 Picture Books');
    if (amount >= 50) items.push('🌀 Working Ceiling Fan');
    if (amount >= 100) items.push('🖊️ Modern Whiteboard');
    if (amount >= 250) items.push('🌟 Complete Renovation');
    return items;
  };

  const effectiveAmount = isMonthly ? donationAmount * 1.2 : donationAmount;

  return (
    <section className="relative w-full py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            See Your Impact in Real-Time
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Watch how your donation transforms a classroom for underprivileged K3 students in Hong Kong
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* 3D Visualization */}
          <div className="relative h-[500px] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <div className="text-white text-lg">Loading visualization...</div>
              </div>
            }>
              <ClassroomScene donationAmount={donationAmount} />
            </Suspense>
            
            {/* Overlay Badge */}
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md rounded-lg px-4 py-2">
              <p className="text-white text-sm font-medium">{getTierName(donationAmount)}</p>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Amount Display */}
            <div className="text-center mb-6">
              <motion.div
                key={donationAmount}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`inline-block px-6 py-3 rounded-lg bg-gradient-to-r ${getTierColor(donationAmount)}`}
              >
                <span className="text-white text-4xl font-bold">
                  ${effectiveAmount.toFixed(0)}
                </span>
                {isMonthly && (
                  <span className="text-white/80 text-sm ml-2">/month</span>
                )}
              </motion.div>
            </div>

            {/* Slider */}
            <div className="mb-6">
              <input
                type="range"
                min="0"
                max="500"
                value={donationAmount}
                onChange={(e) => setDonationAmount(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(59 130 246) ${(donationAmount / 500) * 100}%, rgb(229 231 235) ${(donationAmount / 500) * 100}%, rgb(229 231 235) 100%)`
                }}
              />
              <div className="flex justify-between mt-2">
                <span className="text-gray-500 text-xs">$0</span>
                <span className="text-gray-500 text-xs">$500</span>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-5 gap-2 mb-6">
              {quickAmounts.map((amount) => (
                <motion.button
                  key={amount}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDonationAmount(amount)}
                  className={`py-2 rounded-lg text-sm font-medium transition-all ${
                    donationAmount === amount
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ${amount}
                </motion.button>
              ))}
            </div>

            {/* Monthly Toggle */}
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors mb-6">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" />
                <span className="text-gray-700 text-sm font-medium">Donate Monthly</span>
                <span className="text-green-600 text-xs bg-green-100 px-2 py-0.5 rounded">
                  +20% Impact
                </span>
              </div>
              <input
                type="checkbox"
                checked={isMonthly}
                onChange={(e) => setIsMonthly(e.target.checked)}
                className="sr-only"
              />
              <div className={`relative w-10 h-5 rounded-full transition-colors ${
                isMonthly ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                <motion.div
                  animate={{ x: isMonthly ? 20 : 0 }}
                  className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow"
                />
              </div>
            </label>

            {/* Impact Preview */}
            {donationAmount > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-gray-700 text-sm font-medium mb-2">You&apos;re providing:</p>
                <div className="space-y-1">
                  <AnimatePresence mode="popLayout">
                    {getImpactItems(effectiveAmount).map((item, i) => (
                      <motion.div
                        key={item}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="text-gray-700 text-sm"
                      >
                        {item}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 rounded-lg font-medium text-white transition-all bg-gradient-to-r ${getTierColor(donationAmount)} shadow-lg`}
              disabled={donationAmount === 0}
            >
              {donationAmount === 0 ? 'Adjust Amount to Start' : 'Make This Reality'}
            </motion.button>

            {/* Social Proof */}
            <div className="mt-4 flex items-center justify-center gap-2 text-gray-500 text-xs">
              <Sparkles className="w-3 h-3" />
              <span>Join 1,234 donors making a difference</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
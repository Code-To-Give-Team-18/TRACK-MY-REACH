'use client';

import React, { Suspense, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { DeskScene } from '@/components/digital-twin-v2/DeskScene';
import { useDonationTiers } from '@/hooks/useDonationTiers';
import { useSpring, animated } from '@react-spring/three';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';
import { ErrorBoundary } from 'react-error-boundary';
import { preloadModels } from '@/components/digital-twin-v2/preloadModels';

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

const ClassroomScene = React.memo(({ donationAmount }: { donationAmount: number }) => {
  // Memoize Canvas props to prevent unnecessary re-renders
  const canvasProps = useMemo(() => ({
    shadows: "soft" as const,
    dpr: [1, 1.5] as [number, number],
    gl: {
      antialias: false,
      powerPreference: "high-performance" as const,
      alpha: false,
      stencil: false,
      depth: true,
      failIfMajorPerformanceCaveat: false,
      preserveDrawingBuffer: false
    },
    camera: { position: [0, 1.2, 2] as [number, number, number], fov: 45 },
    performance: { min: 0.5 },
    frameloop: "demand" as const,
    onCreated: ({ gl }) => {
      gl.toneMapping = THREE.ACESFilmicToneMapping;
      gl.outputColorSpace = THREE.SRGBColorSpace;
    }
  }), []);

  return (
    <Canvas {...canvasProps}>
      <fog attach="fog" args={['#f0f0f0', 5, 15]} />
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2.2}
        minAzimuthAngle={-Math.PI / 6}
        maxAzimuthAngle={Math.PI / 6}
        autoRotate
        autoRotateSpeed={0.3}
        target={[0, 0.4, 0]}
        makeDefault
      />
      
      <DynamicLighting donationAmount={donationAmount} />
      <Environment preset="apartment" intensity={0.3} resolution={64} />
      
      <DeskScene donationAmount={donationAmount} />
    </Canvas>
  );
});

// Error fallback component
function Scene3DErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <p className="text-lg mb-2">3D visualization temporarily unavailable</p>
      <p className="text-sm text-gray-400 mb-4">Your device may not support WebGL</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 transition"
      >
        Try Again
      </button>
    </div>
  );
}

export function CompactImpactVisualizer() {
  const [donationAmount, setDonationAmount] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);
  const [debouncedAmount, setDebouncedAmount] = useState(0);
  const animationRef = useRef<number | undefined>();
  const debounceRef = useRef<NodeJS.Timeout>();
  const router = useRouter();
  
  // Preload models on component mount
  useEffect(() => {
    preloadModels();
  }, []);
  
  const quickAmounts = [50, 150, 300, 500, 800];
  
  // Auto-animate slider until user interaction
  useEffect(() => {
    if (!userInteracted) {
      const animationSequence = [0, 50, 150, 300, 500, 1000, 500, 300, 150, 50];
      let sequenceIndex = 0;
      let targetValue = animationSequence[0];
      let currentAnimValue = 0;
      let lastTimestamp = 0;
      
      const animate = (timestamp: number) => {
        if (!lastTimestamp) lastTimestamp = timestamp;
        const deltaTime = timestamp - lastTimestamp;
        lastTimestamp = timestamp;
        
        // Smooth interpolation towards target
        const speed = 2; // Adjust for animation speed
        const diff = targetValue - currentAnimValue;
        currentAnimValue += diff * Math.min(deltaTime * 0.001 * speed, 1);
        
        // Check if we're close enough to target to move to next
        if (Math.abs(diff) < 1) {
          // Hold at each tier for a moment
          const holdDuration = 1500; // ms to pause at each tier
          
          if (!animationRef.current) {
            animationRef.current = timestamp;
          }
          
          if (timestamp - animationRef.current > holdDuration) {
            sequenceIndex = (sequenceIndex + 1) % animationSequence.length;
            targetValue = animationSequence[sequenceIndex];
            animationRef.current = timestamp;
          }
        }
        
        setDonationAmount(Math.round(currentAnimValue));
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [userInteracted]);
  
  // Debounce the 3D scene updates to prevent rapid re-renders
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      setDebouncedAmount(donationAmount);
    }, 100); // Delay 3D updates by 100ms
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [donationAmount]);
  
  const handleUserInteraction = useCallback((value: number) => {
    setUserInteracted(true);
    setDonationAmount(value);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
  }, []);
  
  const getTierName = (amount: number) => {
    if (amount === 0) return 'Empty Desk';
    if (amount < 50) return 'Getting Started';
    if (amount < 150) return 'Basic Stationery';
    if (amount < 300) return 'Books & Learning';
    if (amount < 500) return 'Nutritious Support';
    if (amount < 800) return 'Full Learning Kit';
    return 'Complete Setup';
  };
  
  const getTierColor = (amount: number) => {
    if (amount === 0) return 'from-gray-500 to-gray-600';
    if (amount < 150) return 'from-blue-500 to-blue-600';
    if (amount < 300) return 'from-green-500 to-green-600';
    if (amount < 500) return 'from-purple-500 to-purple-600';
    if (amount < 800) return 'from-pink-500 to-pink-600';
    return 'from-yellow-400 to-orange-500';
  };
  
  const getImpactItems = (amount: number) => {
    const items = [];
    if (amount >= 50) items.push('✏️ Stationery Set (Pencils, Crayons, Eraser)');
    if (amount >= 150) items.push('📚 Picture Books & Worksheets');
    if (amount >= 300) items.push('🍱 Nutritious Lunch & Snacks');
    if (amount >= 500) items.push('🧩 Educational Learning Kit');
    if (amount >= 800) items.push('🌟 Complete Learning Setup');
    return items;
  };

  const handleDonateClick = () => {
    if (donationAmount > 0) {
      // Navigate to checkout with amount as quick donation
      router.push(`/checkout?amount=${donationAmount}&mode=quick`);
    }
  };


  return (
    <section className="relative w-full py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            See Your Impact in Real-Time
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Watch how your donation fills a K3 student's desk with essential learning materials in Hong Kong
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* 3D Visualization */}
          <div className="relative h-[500px] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <ErrorBoundary
              FallbackComponent={Scene3DErrorFallback}
              onReset={() => window.location.reload()}
            >
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                  <div className="text-white text-lg">Loading visualization...</div>
                </div>
              }>
                <ClassroomScene donationAmount={debouncedAmount} />
              </Suspense>
            </ErrorBoundary>
            
            {/* Overlay Badge */}
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md rounded-lg px-4 py-2">
              <p className="text-white text-sm font-medium">{getTierName(donationAmount)}</p>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="bg-white rounded-2xl shadow-xl p-8 h-[500px] flex flex-col justify-between overflow-hidden">
            <div className="flex-1 flex flex-col">
              {/* Amount Display */}
              <div className="text-center mb-4">
              <motion.div
                key={donationAmount}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`inline-block px-6 py-3 rounded-lg bg-gradient-to-r ${getTierColor(donationAmount)}`}
              >
                <span className="text-white text-4xl font-bold">
                  HK${donationAmount.toFixed(0)}
                </span>
              </motion.div>
            </div>

              {/* Slider */}
              <div className="mb-4">
              <input
                type="range"
                min="0"
                max="1000"
                value={donationAmount}
                onChange={(e) => handleUserInteraction(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(59 130 246) ${(donationAmount / 1000) * 100}%, rgb(229 231 235) ${(donationAmount / 1000) * 100}%, rgb(229 231 235) 100%)`
                }}
              />
              <div className="flex justify-between mt-2">
                <span className="text-gray-500 text-xs">HK$0</span>
                <span className="text-gray-500 text-xs">HK$1000</span>
              </div>
            </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-5 gap-2 mb-4">
              {quickAmounts.map((amount) => (
                <motion.button
                  key={amount}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleUserInteraction(amount)}
                  className={`py-2 rounded-lg text-sm font-medium transition-all ${
                    donationAmount === amount
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  HK${amount}
                </motion.button>
              ))}
            </div>

              {/* Impact Preview */}
              <div className="flex-1 min-h-0">
                {donationAmount > 0 ? (
                  <div className="bg-blue-50 rounded-lg p-4 h-full overflow-y-auto">
                <p className="text-gray-700 text-sm font-medium mb-2">You&apos;re providing:</p>
                <div className="space-y-1">
                  <AnimatePresence mode="popLayout">
                    {getImpactItems(donationAmount).map((item, i) => (
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
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 h-full flex items-center justify-center">
                    <p className="text-gray-500 text-sm text-center">Adjust the slider to see how your donation helps</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4">
              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDonateClick}
                className={`w-full py-3 rounded-lg font-medium text-white transition-all bg-gradient-to-r ${getTierColor(donationAmount)} shadow-lg`}
                disabled={donationAmount === 0}
              >
                {donationAmount === 0 ? 'Adjust Amount to Start' : 'Make This Reality'}
              </motion.button>

              {/* Social Proof */}
              <div className="mt-3 flex items-center justify-center gap-2 text-gray-500 text-xs">
                <Sparkles className="w-3 h-3" />
                <span>Join 1,234 donors making a difference</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
'use client';

import { Suspense, useState } from 'react';
import { ImmersiveClassroomScene } from '@/components/digital-twin-v2/ImmersiveClassroomScene';
import { DonationSlider } from '@/components/digital-twin-v2/DonationSlider';
import { ImpactHUD } from '@/components/digital-twin-v2/ImpactHUD';
import { LoadingScreen } from '@/components/digital-twin-v2/LoadingScreen';

export default function DigitalTwinV2Page() {
  const [donationAmount, setDonationAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Immersive 3D Scene */}
      <Suspense fallback={<LoadingScreen />}>
        <ImmersiveClassroomScene 
          donationAmount={donationAmount}
          onLoadComplete={() => setIsLoading(false)}
        />
      </Suspense>

      {/* Overlay UI Elements */}
      {!isLoading && (
        <>
          {/* Top center - Emotional message */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-black/50 backdrop-blur-md rounded-lg px-6 py-3 text-white text-center">
              <p className="text-sm opacity-90">You&apos;re seeing through Ming&apos;s eyes</p>
              <p className="text-xs opacity-70">A 5-year-old who dreams of becoming an artist</p>
            </div>
          </div>

          {/* Bottom left - Impact display */}
          <ImpactHUD donationAmount={donationAmount} />

          {/* Right side - Donation panel */}
          <DonationSlider 
            value={donationAmount}
            onChange={setDonationAmount}
          />

          {/* Instructions */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-xs">
              <span className="opacity-70">Move mouse to look around • Click items to learn more • Scroll to adjust donation</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
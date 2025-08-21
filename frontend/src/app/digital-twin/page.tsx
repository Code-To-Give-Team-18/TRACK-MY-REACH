'use client';

import { Suspense } from 'react';
import { DigitalTwinViewer } from '@/components/digital-twin/DigitalTwinViewer';
import { ImpactDashboard } from '@/components/digital-twin/ImpactDashboard';
import { ClassroomSelector } from '@/components/digital-twin/ClassroomSelector';
import { DonationTimeline } from '@/components/digital-twin/DonationTimeline';

export default function DigitalTwinPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Digital Twin Classrooms
          </h1>
          <p className="text-lg text-gray-600">
            See your real-time impact on classrooms across Hong Kong
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Virtual Classroom</h2>
              <Suspense fallback={
                <div className="h-[500px] flex items-center justify-center bg-gray-100 rounded-lg">
                  <p className="text-gray-500">Loading 3D classroom...</p>
                </div>
              }>
                <DigitalTwinViewer />
              </Suspense>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Your Donation Timeline</h2>
              <DonationTimeline />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Select Classroom</h2>
              <ClassroomSelector />
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Impact Metrics</h2>
              <ImpactDashboard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
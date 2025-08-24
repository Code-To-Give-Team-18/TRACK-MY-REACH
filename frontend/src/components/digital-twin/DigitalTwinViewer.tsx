'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid } from '@react-three/drei';
import { Classroom } from './Classroom';
import { useState, useEffect } from 'react';
import { useClassroomUpdates } from '@/hooks/useClassroomUpdates';
import { useVisitTracking } from '@/hooks/useVisitTracking';

export function DigitalTwinViewer({ classroomId = 'cls-1' }: { classroomId?: string }) {
  const [viewMode, setViewMode] = useState<'current' | 'before'>('current');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const { updates, isConnected } = useClassroomUpdates(classroomId);
  const { trackInteraction, getVisitDuration } = useVisitTracking(classroomId);

  useEffect(() => {
    if (updates.length > 0) {
      const latestUpdate = updates[updates.length - 1];
    }
  }, [updates]);

  return (
    <div className="relative w-full h-[500px]">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={() => setViewMode('before')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'before' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 shadow-md hover:bg-gray-50'
          }`}
        >
          Before Donations
        </button>
        <button
          onClick={() => setViewMode('current')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'current' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 shadow-md hover:bg-gray-50'
          }`}
        >
          Current State
        </button>
      </div>

      {selectedItem && (
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <h3 className="font-semibold text-gray-900 mb-2">Item Details</h3>
          <p className="text-sm text-gray-600">{selectedItem}</p>
          <button
            onClick={() => setSelectedItem(null)}
            className="mt-2 text-xs text-blue-600 hover:text-blue-700"
          >
            Close
          </button>
        </div>
      )}

      {isConnected && (
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Live Updates Active
        </div>
      )}

      <div className="absolute bottom-4 right-4 z-10 bg-white rounded-lg shadow-lg px-3 py-2 text-xs">
        Visit Duration: {Math.floor(getVisitDuration() / 60)}m {getVisitDuration() % 60}s
      </div>

      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[8, 6, 8]} fov={50} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={20}
        />
        
        <ambientLight intensity={0.5} />
        <directionalLight
          castShadow
          position={[10, 10, 5]}
          intensity={1}
          shadow-mapSize={[2048, 2048]}
        />
        
        <Classroom 
          viewMode={viewMode} 
          onItemClick={(item) => {
            setSelectedItem(item);
            trackInteraction(`clicked-${item}`);
          }}
        />
        
        <Grid 
          args={[20, 20]} 
          cellSize={1} 
          cellThickness={0.5} 
          cellColor="#6b7280" 
          sectionSize={5} 
          sectionThickness={1}
          sectionColor="#374151"
          fadeDistance={30}
          fadeStrength={1}
          position={[0, 0, 0]}
        />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
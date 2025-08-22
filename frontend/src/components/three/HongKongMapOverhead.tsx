'use client';

import { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Text, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import { hongKongGeoData } from './hongKongGeoData';

interface Region {
  id: string;
  name: string;
  coordinates: [number, number];
}

interface HongKongMapOverheadProps {
  selectedRegion: string;
  onRegionSelect: (regionId: string) => void;
  regions: Region[];
}

// Unified color for unselected districts
const DEFAULT_DISTRICT_COLOR = '#d4d4d8'; // Light neutral gray
const SELECTED_COLOR = '#dc2626'; // Red when selected
const HOVER_COLOR = '#fca5a5'; // Light red when hovered

function DistrictShape({ 
  feature, 
  isSelected,
  regionId,
  onSelect 
}: { 
  feature: any;
  isSelected: boolean;
  regionId: string;
  onSelect: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Convert GeoJSON coordinates to Three.js shape
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const coordinates = feature.geometry.coordinates[0];
    
    // Center and scale the coordinates
    const centerLon = 114.1095;
    const centerLat = 22.3964;
    const scale = 100; // Reduced from 150 to make map smaller
    
    coordinates.forEach((coord: number[], i: number) => {
      const x = (coord[0] - centerLon) * scale;
      const z = -(coord[1] - centerLat) * scale;
      
      if (i === 0) {
        s.moveTo(x, z);
      } else {
        s.lineTo(x, z);
      }
    });
    
    s.closePath();
    return s;
  }, [feature]);

  // Calculate centroid for label
  const centroid = useMemo(() => {
    const coordinates = feature.geometry.coordinates[0];
    const centerLon = 114.1095;
    const centerLat = 22.3964;
    const scale = 100; // Match the reduced scale
    
    let sumX = 0, sumZ = 0;
    coordinates.forEach((coord: number[]) => {
      sumX += (coord[0] - centerLon) * scale;
      sumZ += -(coord[1] - centerLat) * scale;
    });
    
    return [sumX / coordinates.length, sumZ / coordinates.length];
  }, [feature]);

  return (
    <group>
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, isSelected ? 0.08 : hovered ? 0.04 : 0, 0]}
        onClick={onSelect}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <extrudeGeometry 
          args={[shape, { 
            depth: 0.2, 
            bevelEnabled: true, 
            bevelThickness: 0.01,
            bevelSize: 0.01,
            bevelSegments: 1
          }]} 
        />
        <meshStandardMaterial 
          color={
            isSelected ? SELECTED_COLOR : 
            hovered ? HOVER_COLOR : 
            DEFAULT_DISTRICT_COLOR
          }
          emissive={isSelected ? SELECTED_COLOR : hovered ? HOVER_COLOR : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : hovered ? 0.15 : 0}
        />
      </mesh>
      
      {/* District border */}
      <lineSegments
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
      >
        <edgesGeometry args={[new THREE.ShapeGeometry(shape)]} />
        <lineBasicMaterial color="#475569" linewidth={2} />
      </lineSegments>
      
      {/* Label */}
      {(isSelected || hovered) && (
        <Text
          position={[centroid[0], 0.5, centroid[1]]}
          fontSize={0.4}
          color={isSelected ? '#1e40af' : '#475569'}
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, 0]}
        >
          {feature.properties.name}
        </Text>
      )}
    </group>
  );
}

function MapScene({ selectedRegion, onRegionSelect, regions }: HongKongMapOverheadProps) {
  const { camera } = useThree();
  
  useEffect(() => {
    // Fixed overhead view - straight down, zoomed out more
    camera.position.set(0, 35, 0.01); // Increased height from 20 to 35, small z offset to avoid gimbal lock
    camera.lookAt(0, 0, 0);
    
    // Adjust camera settings for better overhead view
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 50; // Slightly wider field of view
      camera.updateProjectionMatrix();
    }
  }, [camera]);

  // Map region IDs to match with GeoJSON data
  const regionMapping: Record<string, string> = {
    'central': 'Central and Western',
    'eastern': 'Eastern',
    'southern': 'Southern',
    'wan-chai': 'Wan Chai',
    'kowloon-city': 'Kowloon City',
    'kwun-tong': 'Kwun Tong',
    'sham-shui-po': 'Sham Shui Po',
    'wong-tai-sin': 'Wong Tai Sin',
    'yau-tsim-mong': 'Yau Tsim Mong',
    'islands': 'Islands',
    'kwai-tsing': 'Kwai Tsing',
    'north': 'North',
    'sai-kung': 'Sai Kung',
    'sha-tin': 'Sha Tin',
    'tai-po': 'Tai Po',
    'tsuen-wan': 'Tsuen Wan',
    'tuen-mun': 'Tuen Mun',
    'yuen-long': 'Yuen Long',
  };

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-10, 15, -10]} intensity={0.4} />
      <pointLight position={[0, 10, 0]} intensity={0.3} />
      
      {/* Background water/sea */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.1, 0]}
        receiveShadow
      >
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#e0f2fe" />
      </mesh>
      
      {/* Render districts from GeoJSON data */}
      {hongKongGeoData.features.map((feature) => {
        const regionId = Object.keys(regionMapping).find(
          key => regionMapping[key] === feature.properties.name
        );
        
        if (!regionId) return null;
        
        return (
          <DistrictShape
            key={feature.properties.id}
            feature={feature}
            isSelected={selectedRegion === regionId}
            regionId={regionId}
            onSelect={() => onRegionSelect(regionId)}
          />
        );
      })}
    </>
  );
}

export function HongKongMapOverhead({ selectedRegion, onRegionSelect, regions }: HongKongMapOverheadProps) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas 
        camera={{ position: [0, 35, 0.01], fov: 50 }}
        style={{ cursor: 'pointer' }}
        shadows
        gl={{ preserveDrawingBuffer: true, antialias: true }}
      >
        <Suspense fallback={null}>
          <MapScene 
            selectedRegion={selectedRegion} 
            onRegionSelect={onRegionSelect}
            regions={regions}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
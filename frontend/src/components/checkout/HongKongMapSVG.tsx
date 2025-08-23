'use client';

import { useState } from 'react';

interface Region {
  id: string;
  name: string;
  coordinates: [number, number];
}

interface HongKongMapSVGProps {
  selectedRegion: string;
  onRegionSelect: (regionId: string) => void;
  regions: Region[];
}

// Simplified district layout for SVG overhead view
const districtLayouts: Record<string, { x: number; y: number; width: number; height: number }> = {
  // New Territories - North
  'yuen-long': { x: 10, y: 10, width: 80, height: 60 },
  'tuen-mun': { x: 95, y: 15, width: 70, height: 55 },
  'north': { x: 170, y: 10, width: 90, height: 40 },
  'tai-po': { x: 265, y: 10, width: 70, height: 60 },
  
  // New Territories - Central
  'tsuen-wan': { x: 20, y: 75, width: 60, height: 45 },
  'kwai-tsing': { x: 85, y: 75, width: 50, height: 45 },
  'sha-tin': { x: 140, y: 55, width: 70, height: 50 },
  'sai-kung': { x: 215, y: 75, width: 100, height: 80 },
  
  // Kowloon
  'sham-shui-po': { x: 40, y: 125, width: 50, height: 35 },
  'yau-tsim-mong': { x: 95, y: 125, width: 45, height: 35 },
  'kowloon-city': { x: 145, y: 110, width: 55, height: 40 },
  'wong-tai-sin': { x: 145, y: 155, width: 55, height: 35 },
  'kwun-tong': { x: 205, y: 130, width: 60, height: 45 },
  
  // Hong Kong Island
  'central': { x: 70, y: 195, width: 50, height: 35 },
  'wan-chai': { x: 125, y: 195, width: 40, height: 35 },
  'eastern': { x: 170, y: 195, width: 70, height: 35 },
  'southern': { x: 100, y: 235, width: 110, height: 40 },
  
  // Islands
  'islands': { x: 250, y: 180, width: 120, height: 90 },
};

export function HongKongMapSVG({ selectedRegion, onRegionSelect, regions }: HongKongMapSVGProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <svg
        viewBox="0 0 380 280"
        className="w-full h-full"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      >
        {/* Background */}
        <rect width="380" height="280" fill="#e0f2fe" opacity="0.3" />
        
        {/* Grid lines for reference */}
        {[0, 1, 2, 3, 4].map(i => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={i * 70}
            x2="380"
            y2={i * 70}
            stroke="#cbd5e1"
            strokeWidth="0.5"
            opacity="0.3"
          />
        ))}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <line
            key={`v-${i}`}
            x1={i * 76}
            y1="0"
            x2={i * 76}
            y2="280"
            stroke="#cbd5e1"
            strokeWidth="0.5"
            opacity="0.3"
          />
        ))}
        
        {/* Districts */}
        {regions.map((region) => {
          const layout = districtLayouts[region.id];
          if (!layout) return null;
          
          const isSelected = selectedRegion === region.id;
          const isHovered = hoveredRegion === region.id;
          
          return (
            <g key={region.id}>
              <rect
                x={layout.x}
                y={layout.y}
                width={layout.width}
                height={layout.height}
                rx="4"
                ry="4"
                fill={isSelected ? '#3b82f6' : isHovered ? '#60a5fa' : '#e2e8f0'}
                stroke={isSelected ? '#2563eb' : isHovered ? '#3b82f6' : '#94a3b8'}
                strokeWidth={isSelected ? '2' : '1'}
                opacity={isSelected ? '1' : isHovered ? '0.9' : '0.8'}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  filter: isSelected ? 'drop-shadow(0 4px 6px rgba(59, 130, 246, 0.3))' : 'none'
                }}
                onClick={() => onRegionSelect(region.id)}
                onMouseEnter={() => setHoveredRegion(region.id)}
                onMouseLeave={() => setHoveredRegion(null)}
              />
              
              {/* District name */}
              {(isSelected || isHovered) && (
                <text
                  x={layout.x + layout.width / 2}
                  y={layout.y + layout.height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isSelected ? 'white' : '#1e293b'}
                  fontSize="11"
                  fontWeight="600"
                  pointerEvents="none"
                  style={{
                    textShadow: isSelected ? '0 1px 2px rgba(0,0,0,0.2)' : 'none'
                  }}
                >
                  {region.name}
                </text>
              )}
            </g>
          );
        })}
        
        {/* Labels for major areas */}
        <text x="340" y="50" fontSize="9" fill="#64748b" fontWeight="500">New Territories</text>
        <text x="340" y="120" fontSize="9" fill="#64748b" fontWeight="500">Kowloon</text>
        <text x="340" y="210" fontSize="9" fill="#64748b" fontWeight="500">HK Island</text>
        <text x="340" y="250" fontSize="9" fill="#64748b" fontWeight="500">Islands</text>
      </svg>
    </div>
  );
}
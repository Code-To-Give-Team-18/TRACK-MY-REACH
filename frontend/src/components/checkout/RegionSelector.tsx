'use client';

import { MapPin, Compass } from 'lucide-react';

interface Region {
  id: string;
  name: string;
  coordinates: [number, number];
}

interface RegionSelectorProps {
  regions: Region[];
  selectedRegion: string;
  onRegionSelect: (regionId: string) => void;
}

export function RegionSelector({ regions, selectedRegion, onRegionSelect }: RegionSelectorProps) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg">
            <Compass className="h-3 w-3 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800">Quick Navigation</h3>
        </div>
        {selectedRegion && (
          <button
            onClick={() => onRegionSelect('')}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
        {regions.map((region) => (
          <button
            key={region.id}
            onClick={() => onRegionSelect(region.id)}
            className={`relative px-3 py-2.5 text-xs rounded-xl transition-all transform hover:scale-[1.02] text-left ${
              selectedRegion === region.id
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                : 'bg-white/60 text-gray-700 hover:bg-white/80 border border-gray-200/50'
            }`}
          >
            {selectedRegion === region.id && (
              <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse"></div>
            )}
            <span className="relative flex items-center gap-1">
              {selectedRegion === region.id && (
                <MapPin className="h-3 w-3" />
              )}
              {region.name}
            </span>
          </button>
        ))}
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #10b981, #14b8a6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #059669, #0d9488);
        }
      `}</style>
    </div>
  );
}
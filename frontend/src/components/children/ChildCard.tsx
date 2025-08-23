'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { type Region } from '@/services/regions.service';
import { getBackendUrl } from '@/utils/url.utils';

export type Child = {
  id: string;
  name: string;
  age?: number;
  school?: string;
  picture_link?: string;
  region_id: string;
  description?: string;
  bio?: string;
  video_link?: string;
  follower_count?: number;
};

interface ChildCardProps {
  child: Child;
  region?: Region;
}

export default function ChildCard({ child, region }: ChildCardProps) {
  const pictureUrl = child.picture_link ? getBackendUrl(child.picture_link) : null;
  const videoUrl = child.video_link ? getBackendUrl(child.video_link) : null;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
    >
      <img src={pictureUrl} alt={child.name} className="w-full h-40 object-cover rounded-lg" />

      <h3 className="font-semibold text-lg">{child.name}</h3>
      {child.age && <p className="text-gray-600">Age: {child.age}</p>}
      {child.school && <p className="text-gray-600">School: {child.school}</p>}
      <p className="text-gray-600">Region: {region?.name || 'Unknown'}</p>
      {child.description && (
        <p className="text-gray-500 text-sm mt-2">{child.description}</p>
      )}
      
      {videoUrl && (
        <WatchVideoButton videoUrl={videoUrl} />
      )}
    </motion.div>
  );
}

function WatchVideoButton({ videoUrl }: { videoUrl: string }) {
  const handleClick = () => {
    // Open video in modal or new component
    // For now, using window.open as a simple solution
    window.open(videoUrl, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
    >
      <Play className="w-4 h-4" />
      <span className="text-sm font-medium">Watch Full Video</span>
    </button>
  );
}
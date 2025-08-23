'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Edit, Trash2 } from 'lucide-react';
import { type Region } from '@/services/regions.service';
import { getBackendUrl } from '@/utils/url.utils';
import { childrenService } from '@/services/children.service';

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
  onEdit?: (child: Child) => void;
  onDelete?: (childId: string) => void;
}

export default function ChildCard({ child, region, onEdit, onDelete }: ChildCardProps) {
  const [deleting, setDeleting] = useState(false);
  const pictureUrl = child.picture_link ? getBackendUrl(child.picture_link) : null;
  const videoUrl = child.video_link ? getBackendUrl(child.video_link) : null;

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${child.name}?`)) {
      return;
    }

    setDeleting(true);
    try {
      await childrenService.deleteChild(child.id);
      if (onDelete) {
        onDelete(child.id);
      }
    } catch (error) {
      console.error('Failed to delete child:', error);
      alert('Failed to delete child. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow relative"
    >
      <div className="absolute top-2 right-2 flex gap-2">
        {onEdit && (
          <button
            onClick={() => onEdit(child)}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {pictureUrl && (
        <img src={pictureUrl} alt={child.name} className="w-full h-40 object-cover rounded-lg mb-3" />
      )}

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
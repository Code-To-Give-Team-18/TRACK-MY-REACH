'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Edit, Trash2, Heart, MessageSquare, Calendar, Eye } from 'lucide-react';
import { type PostResponse } from '@/services/post.service';
import { getBackendUrl } from '@/utils/url.utils';
import { postService } from '@/services/post.service';
import Image from 'next/image';
import Link from 'next/link';

interface PostCardProps {
  post: PostResponse;
  onEdit?: (post: PostResponse) => void;
  onDelete?: (postId: string) => void;
}

export default function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  const [deleting, setDeleting] = useState(false);
  
  // Get first media URL if available
  const pictureUrl = post.media_urls && post.media_urls.length > 0 
    ? getBackendUrl(post.media_urls[0]) 
    : null;
  
  const videoUrl = post.video_link ? getBackendUrl(post.video_link) : null;

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete this post?`)) {
      return;
    }

    setDeleting(true);
    try {
      await postService.deletePost(post.id);
      if (onDelete) {
        onDelete(post.id);
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow relative bg-white"
    >
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        <Link
          href={`/post-management/${post.id}`}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </Link>
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

      {/* Media Preview */}
      {pictureUrl && (
        <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={pictureUrl}
            alt="Post media"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      {/* Post Info */}
      <div className="space-y-2">
        <div className="flex items-start justify-between pr-20">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              {post.child_name || 'Unknown Child'}
            </h3>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(post.created_at)}
            </p>
          </div>
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="text-gray-700 mt-2 line-clamp-3">{post.caption}</p>
        )}

        {/* Post Type Badge */}
        {post.post_type && (
          <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            {post.post_type}
          </span>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 pt-2 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{post.likes || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            <span>{post.comments_count || 0}</span>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex gap-2 mt-2">
          {post.is_published ? (
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
              Published
            </span>
          ) : (
            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
              Draft
            </span>
          )}
          {post.is_featured && (
            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
              Featured
            </span>
          )}
        </div>

        {/* Video Button */}
        {videoUrl && (
          <WatchVideoButton videoUrl={videoUrl} />
        )}
      </div>
    </motion.div>
  );
}

function WatchVideoButton({ videoUrl }: { videoUrl: string }) {
  const handleClick = () => {
    window.open(videoUrl, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
    >
      <Play className="w-4 h-4" />
      <span className="text-sm font-medium">Watch Video</span>
    </button>
  );
}
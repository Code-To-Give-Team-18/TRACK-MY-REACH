'use client';

import Link from 'next/link';
import { Heart, MessageCircle, Star, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PostResponse } from '@/services/post.service';

interface PostCardProps {
  post: PostResponse;
  index: number;
}

export default function PostCard({ post, index }: PostCardProps) {
  // Select media: video first, then photo
  let mediaSrc = '';
  let isVideo = false;
  if (post.video_link) {
    mediaSrc = post.video_link;
    isVideo = true;
  } else if (post.media_urls && post.media_urls.length > 0) {
    mediaSrc = post.media_urls[0];
    isVideo = false;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
    >
      {/* Media Section */}
      <div className="relative h-40 bg-gradient-to-br from-orange-200 to-pink-200 flex items-center justify-center">
        {mediaSrc ? (
          isVideo ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Video className="w-12 h-12 text-pink-500 mb-2" />
              <span className="text-xs text-gray-700">Video Attached</span>
            </div>
          ) : (
            <img
              src={mediaSrc}
              alt="Post media"
              className="object-cover w-full h-full"
            />
          )
        ) : (
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
            <Star className="w-8 h-8 text-orange-400" />
          </div>
        )}

        {/* Featured Badge */}
        {post.is_featured && (
          <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            Featured
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{post.title}</h3>
        <div className="text-sm text-gray-600 mb-2">
          {post.child_name ? post.child_name : post.child_id}
        </div>
        <p className="text-gray-700 mb-3">
          {post.caption ? post.caption.slice(0, 50) + (post.caption.length > 50 ? '...' : '') : ''}
        </p>
        <div className="flex gap-6 mb-2">
          <span className="flex items-center gap-1 text-pink-600 font-semibold">
            <Heart className="w-4 h-4" /> {post.likes}
          </span>
          <span className="flex items-center gap-1 text-blue-600 font-semibold">
            <MessageCircle className="w-4 h-4" /> {post.comments_count ?? 0}
          </span>
        </div>
        <Link href={`/posts/${post.id}`}>
          <button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-2 rounded-lg transition-all transform hover:scale-105">
            View Details
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
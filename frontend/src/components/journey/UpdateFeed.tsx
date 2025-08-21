'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Camera, Trophy, BookOpen, Palette } from 'lucide-react';
import { Update } from '@/types/reach';
import { motion } from 'framer-motion';

interface UpdateFeedProps {
  updates: Update[];
}

function getUpdateIcon(type: Update['type']) {
  switch (type) {
    case 'milestone':
      return <Trophy className="w-5 h-5 text-yellow-500" />;
    case 'photo':
      return <Camera className="w-5 h-5 text-blue-500" />;
    case 'artwork':
      return <Palette className="w-5 h-5 text-purple-500" />;
    case 'testimony':
      return <BookOpen className="w-5 h-5 text-green-500" />;
    default:
      return <Heart className="w-5 h-5 text-pink-500" />;
  }
}

function UpdateCard({ update, index }: { update: Update; index: number }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [reactions, setReactions] = useState(update.reactions);

  const handleLike = () => {
    setLiked(!liked);
    setReactions(prev => liked ? prev - 1 : prev + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {update.childId ? update.childId[0].toUpperCase() : 'R'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">REACH Foundation</span>
                {getUpdateIcon(update.type)}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(update.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
          <button
            onClick={() => setSaved(!saved)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Bookmark className={`w-5 h-5 ${saved ? 'fill-current text-blue-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2">{update.title}</h3>
        <p className="text-gray-700 mb-4">{update.content}</p>
        
        {/* Media */}
        {update.mediaUrl && (
          <div className="mb-4 rounded-xl overflow-hidden bg-gray-100">
            {update.type === 'video' ? (
              <div className="aspect-video flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Video content</p>
                </div>
              </div>
            ) : (
              <div className="aspect-[4/3] flex items-center justify-center">
                <div className="text-center">
                  {update.type === 'artwork' ? (
                    <>
                      <Palette className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Student artwork</p>
                    </>
                  ) : (
                    <>
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Photo update</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* School Tag */}
        {update.school && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              {update.school}
            </span>
          </div>
        )}
      </div>

      {/* Engagement Stats */}
      <div className="px-4 py-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{reactions} reactions</span>
          <span>{update.comments.length} comments</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-2 border-t border-gray-100">
        <div className="flex items-center justify-around">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              liked
                ? 'text-pink-500 bg-pink-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">Love</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Comment</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="mt-4 space-y-3">
            {update.comments.length > 0 ? (
              update.comments.slice(0, 3).map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-gray-600">
                      {comment.donorName[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="font-semibold text-sm text-gray-900">
                        {comment.donorName}
                      </span>
                      <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(comment.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">
                Be the first to leave an encouraging message!
              </p>
            )}
            
            {/* Add Comment Input */}
            <div className="flex gap-3 mt-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex-shrink-0"></div>
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function UpdateFeed({ updates }: UpdateFeedProps) {
  return (
    <div className="space-y-6">
      {updates.map((update, index) => (
        <UpdateCard key={update.id} update={update} index={index} />
      ))}
    </div>
  );
}
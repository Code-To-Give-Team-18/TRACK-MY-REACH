'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Volume2, VolumeX, Heart, MessageCircle } from 'lucide-react';
import { PostResponse } from '@/services/post.service';
import Image from 'next/image';

interface HeroMediaPlayerProps {
  posts: PostResponse[];
}

export default function HeroMediaPlayer({ posts }: HeroMediaPlayerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [imageTimer, setImageTimer] = useState<NodeJS.Timeout | null>(null);

  const currentPost = posts[currentIndex];
  const hasVideo = currentPost?.video_link || currentPost?.youtube_url;
  const hasImage = currentPost?.media_urls && currentPost.media_urls.length > 0;
  const mediaUrl = hasVideo ? (currentPost.video_link || currentPost.youtube_url) : 
                   hasImage ? currentPost.media_urls![0] : null;

  // Auto-rotate posts every 8 seconds for images, videos play to completion
  useEffect(() => {
    if (!hasVideo && posts.length > 1) {
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % posts.length);
      }, 8000);
      setImageTimer(timer);
      return () => clearTimeout(timer);
    }
    return () => {
      if (imageTimer) clearTimeout(imageTimer);
    };
  }, [currentIndex, posts.length, hasVideo, imageTimer]);

  // Handle video end
  const handleVideoEnd = () => {
    if (posts.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % posts.length);
    }
  };

  // Handle click to navigate
  const handleClick = () => {
    router.push('/posts'); // Navigate to infinite scroll page
  };

  // Toggle mute
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  // Auto-play video when it changes
  useEffect(() => {
    if (videoRef.current && hasVideo) {
      videoRef.current.play().catch(() => {
        // Handle autoplay failure
        setIsPlaying(false);
      });
    }
  }, [currentIndex, hasVideo]);

  if (!posts.length || !currentPost) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
        <p className="text-gray-500">No posts available</p>
      </div>
    );
  }

  const isYouTube = currentPost.youtube_url && currentPost.youtube_url.includes('youtube.com');

  return (
    <div 
      className="relative w-full h-full bg-black rounded-2xl overflow-hidden cursor-pointer group shadow-2xl"
      onClick={handleClick}
    >
      {/* Media Display */}
      <div className="absolute inset-0">
        {hasVideo && !isYouTube ? (
          <video
            ref={videoRef}
            src={mediaUrl!}
            className="w-full h-full object-cover"
            muted={isMuted}
            autoPlay
            playsInline
            onEnded={handleVideoEnd}
          />
        ) : hasVideo && isYouTube ? (
          <div className="w-full h-full flex items-center justify-center bg-black">
            <div className="relative w-full h-full">
              <iframe
                src={`https://www.youtube.com/embed/${currentPost.youtube_url?.split('v=')[1]?.split('&')[0]}?autoplay=1&mute=1&controls=0&loop=1&playlist=${currentPost.youtube_url?.split('v=')[1]?.split('&')[0]}`}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          </div>
        ) : hasImage ? (
          <div className="relative w-full h-full">
            <Image
              src={mediaUrl!}
              alt={currentPost.caption || 'Student post'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <p className="text-white text-xl">No media available</p>
          </div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        {/* Child Name */}
        {currentPost.child_name && (
          <h3 className="text-lg font-semibold mb-2">
            {currentPost.child_name}
          </h3>
        )}

        {/* Caption */}
        {currentPost.caption && (
          <p className="text-sm mb-4 line-clamp-2 opacity-90">
            {currentPost.caption}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4" fill="white" />
            {currentPost.likes || 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" fill="white" />
            {currentPost.comments_count || 0}
          </span>
        </div>
      </div>

      {/* Video Controls */}
      {hasVideo && !isYouTube && (
        <button
          onClick={toggleMute}
          className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      )}

      {/* Progress Indicators */}
      {posts.length > 1 && (
        <div className="absolute top-4 left-4 right-12 flex gap-1">
          {posts.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white'
                  : index < currentIndex
                  ? 'bg-white/50'
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
      
      {/* Play Icon on Hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-6">
          <Play className="w-12 h-12 text-white" fill="white" />
        </div>
      </div>

      {/* Click to View More */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <p className="text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-full">
          Click to explore more
        </p>
      </div>
    </div>
  );
}
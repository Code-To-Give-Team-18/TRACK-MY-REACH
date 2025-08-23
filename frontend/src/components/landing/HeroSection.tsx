'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { School, BookOpen, ChevronDown, Heart, Users, TrendingUp } from 'lucide-react';
import HeroMediaPlayer from './HeroMediaPlayer';
import { postService, PostResponse } from '@/services/post.service';

export default function HeroSection() {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Fetch featured or recent posts with media
        const response = await postService.getPosts({ 
          sort: 'recent', 
          limit: 5 
        });
        
        // Filter posts that have media (video or image)
        const postsWithMedia = response.items.filter(
          post => post.video_link || post.youtube_url || (post.media_urls && post.media_urls.length > 0)
        );
        
        setPosts(postsWithMedia);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 -mt-20">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(99, 102, 241) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 min-h-screen">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-12rem)]">
          
          {/* Left Side - Text Content */}
          <div className="flex flex-col justify-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6 w-fit">
              <Heart className="w-4 h-4" fill="currentColor" />
              <span>Building Brighter Futures Together</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-gray-900">See the </span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Real Impact
              </span>
              <br />
              <span className="text-gray-900">of Your Kindness</span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
              Every donation transforms a child's life. Watch their journey unfold through real stories, updates, and moments of joy from the children you support.
            </p>

            {/* Feature Points */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-gray-700">Direct updates from the children you help</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-gray-700">Track your impact with transparent reporting</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-gray-700">Join a community of caring donors</span>
              </div>
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/children">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Start Supporting Today
                </Button>
              </Link>

              <Link href="/posts">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300 px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  See Their Stories
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">500+</span>
                </div>
                <span className="text-sm text-gray-600">Children Supported</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <School className="w-4 h-4 text-purple-600" />
                  <span className="text-2xl font-bold text-gray-900">50+</span>
                </div>
                <span className="text-sm text-gray-600">Partner Schools</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-2xl font-bold text-gray-900">98%</span>
                </div>
                <span className="text-sm text-gray-600">Graduation Rate</span>
              </div>
            </div>
          </div>

          {/* Right Side - TikTok-style Media Player */}
          <div className="relative lg:h-[700px] h-[550px] flex items-center justify-center">
            {/* Phone Frame */}
            <div className="relative w-full max-w-[420px] h-full">
              {/* Phone Border */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-[3rem] shadow-2xl"></div>
              
              {/* Phone Screen */}
              <div className="absolute inset-[3px] bg-black rounded-[2.8rem] overflow-hidden">
                {/* Status Bar */}
                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/50 to-transparent z-20 flex items-center justify-center">
                  <div className="w-20 h-1 bg-white/30 rounded-full"></div>
                </div>
                
                {/* Media Player */}
                <div className="w-full h-full">
                  {!isLoading && posts.length > 0 ? (
                    <HeroMediaPlayer posts={posts} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                      {isLoading ? (
                        <div className="animate-pulse">
                          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <p className="text-white/60 text-center px-8">
                          No stories available yet.
                          <br />
                          <span className="text-sm">Check back soon!</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom App UI Hint */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-purple-500 rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-blue-500 rounded-full opacity-20 blur-2xl"></div>
            </div>

            {/* Click Hint */}
            {posts.length > 0 && (
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center">
                <p className="text-sm text-gray-600 font-medium">
                  Click to explore all stories →
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce lg:hidden">
        <div className="flex flex-col items-center gap-2">
          <ChevronDown className="w-6 h-6 text-gray-600 animate-pulse" />
        </div>
      </div>
    </section>
  );
}

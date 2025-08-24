'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getBackendUrl } from '@/utils/url.utils';

interface Story {
  id: string;
  child_id: string;
  child_name: string;
  title: string;
  caption: string;
  video_link: string;
  media_urls: string[];
}

export default function StoriesHighlight() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedStories = async () => {
      try {
        const response = await fetch(`${getBackendUrl()}/api/v1/posts?limit=3&is_featured=true`);
        const data = await response.json();
        setStories(data.items || []);
      } catch (error) {
        console.error('Error fetching stories:', error);
        // Fallback mock data for demo
        setStories([
          {
            id: '1',
            child_id: '11',
            child_name: 'Jenny',
            title: 'First Words at Project REACH',
            caption: 'Thanks to your support, Jenny has spoken her first word!',
            video_link: '',
            media_urls: []
          },
          {
            id: '2',
            child_id: '12',
            child_name: 'Benny',
            title: 'Learning to Read',
            caption: 'Thanks to your donations, Benny is discovering the joy of books!',
            video_link: '',
            media_urls: []
          },
          {
            id: '3',
            child_id: '13',
            child_name: 'Kelly',
            title: 'Growing Confident',
            caption: 'Thanks to you, Kelly is thriving in her education journey!',
            video_link: '',
            media_urls: []
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedStories();
  }, []);

  return (
    <section className="py-24 bg-gradient-to-b from-white to-orange-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 right-20 w-24 h-24 bg-pink-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-10 left-20 w-32 h-32 bg-yellow-200 rounded-full opacity-20 animate-pulse animation-delay-2000"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              Stories
            </span>
            <span className="text-gray-800"> of Impact</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Every donation creates a ripple of change. See how your kindness transforms lives,
            one child at a time.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto px-6 mb-12">
          <div className="flex flex-col gap-20 md:gap-24">
            {stories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`group flex flex-col md:flex-row ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 md:gap-20 lg:gap-24`}
              >
                {/* Video Container - Diamond Shape */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div 
                      className="w-56 h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 transform rotate-45 overflow-hidden rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-br from-orange-50 via-white to-pink-50 border-2 border-white/50"
                    >
                      {story.video_link ? (
                        <video
                          className="absolute inset-0 w-full h-full object-cover transform -rotate-45 scale-150"
                          src={getBackendUrl(story.video_link)}
                          muted
                          loop
                          autoPlay
                          playsInline
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center transform -rotate-45 bg-gradient-to-br from-orange-100/50 to-pink-100/50">
                          <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-white/80 flex items-center justify-center shadow-lg">
                              <svg className="w-10 h-10 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                              </svg>
                            </div>
                            <p className="text-gray-700 font-semibold text-lg">Video Story</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                </div>

                {/* Text Content */}
                <div className={`flex-1 ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                  <div className={`space-y-4 ${index % 2 === 1 ? 'md:ml-auto' : ''}`}>
                    <div>
                      <p className="text-sm font-semibold text-orange-500 uppercase tracking-wider mb-2">Impact Story</p>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                        {story.child_name}'s First Words
                      </h3>
                    </div>
                    
                    <p className="text-lg text-gray-700 leading-relaxed">
                      Thanks to <span className="text-orange-600 font-semibold">your generosity</span>, 
                      {' '}{story.child_name} has reached a beautiful milestone.
                    </p>
                    
                    <div className={`inline-flex items-center gap-3 ${index % 2 === 1 ? 'md:ml-auto' : ''}`}>
                      <Link href={`/child?id=${story.child_id}`}>
                        <button className="group/btn bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                          </svg>
                          <span>Watch Story</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, BookOpen, Utensils, School, ChevronRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const featuredChildren = [
  {
    id: '1',
    name: 'Jenny',
    age: 5,
    school: 'Sham Shui Po Primary',
    story: 'Jenny loves drawing and dreams of becoming an artist. With your support, she now has art supplies and can attend weekend art classes.',
    needs: ['Art supplies', 'Nutritious meals', 'School uniform'],
    fundingProgress: 75,
    supportersCount: 12,
    recentUpdate: 'Jenny won first place in her school\'s drawing competition!',
    image: '/images/child-placeholder-1.jpg'
  },
  {
    id: '2',
    name: 'Tommy',
    age: 6,
    school: 'Kwun Tong District School',
    story: 'Tommy is passionate about reading but his family cannot afford books. Your donation helps build his personal library.',
    needs: ['Story books', 'School bag', 'Lunch program'],
    fundingProgress: 60,
    supportersCount: 8,
    recentUpdate: 'Tommy just finished reading his 10th book this month!',
    image: '/images/child-placeholder-2.jpg'
  }
];

export default function FeaturedChild() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentChild = featuredChildren[currentIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredChildren.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-orange-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 px-6 py-3 rounded-full mb-6 shadow-md">
            <Star className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wide">This Week's Story of Hope</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gray-800">Meet </span>
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">{currentChild.name}</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Every child has dreams, talents, and unlimited potential. <br/>
            <span className="font-medium text-orange-600">Your kindness helps them flourish.</span>
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white">
              <div className="aspect-[4/5] bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100">
                {/* Placeholder for child image - in production, use actual images with proper consent */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="relative">
                      <div className="w-40 h-40 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <div className="w-32 h-32 bg-gradient-to-br from-orange-200 to-pink-200 rounded-full flex items-center justify-center">
                          <Heart className="w-16 h-16 text-white animate-pulse" />
                        </div>
                      </div>
                      <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <p className="text-gray-600 font-medium">Protected for privacy</p>
                    <p className="text-sm text-gray-500 mt-1">Real stories, real impact</p>
                  </div>
                </div>
              </div>
              
              {/* Funding Progress Card */}
              <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-6 border-t-4 border-orange-400">
                <div className="text-gray-800">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-600">Journey to Goal</span>
                    <span className="text-2xl font-bold text-orange-600">{currentChild.fundingProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${currentChild.fundingProgress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 h-4 rounded-full shadow-sm"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[...Array(Math.min(5, currentChild.supportersCount))].map((_, i) => (
                        <div key={i} className="w-8 h-8 bg-gradient-to-br from-orange-300 to-pink-300 rounded-full border-2 border-white" />
                      ))}
                      {currentChild.supportersCount > 5 && (
                        <div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-600">+{currentChild.supportersCount - 5}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">
                      <span className="font-bold text-orange-600">{currentChild.supportersCount}</span> caring hearts
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Update Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, type: "spring" }}
              className="absolute -top-4 -right-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-5 py-3 rounded-full shadow-xl"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-bold">New milestone! 🎉</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Child Info */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                  Age {currentChild.age}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <School className="w-4 h-4" />
                  <span>{currentChild.school}</span>
                </div>
              </div>
              
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                {currentChild.story}
              </p>

              {/* Recent Update - Warmer Style */}
              <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 rounded-2xl p-5 mb-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-green-700 font-bold mb-2 uppercase tracking-wide">Wonderful News!</div>
                    <p className="text-gray-700 leading-relaxed">{currentChild.recentUpdate}</p>
                    <p className="text-xs text-gray-500 mt-2">This wouldn't be possible without you 💚</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Needs - More Emotional */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">How You Can Help {currentChild.name} Today</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentChild.needs.map((need, index) => (
                  <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        {need.includes('meal') || need.includes('Meal') ? (
                          <Utensils className="w-5 h-5 text-orange-500" />
                        ) : need.includes('book') || need.includes('Book') ? (
                          <BookOpen className="w-5 h-5 text-blue-500" />
                        ) : (
                          <Heart className="w-5 h-5 text-pink-500" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{need}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons - More Inviting */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link href={`/stories/${currentChild.id}`} className="flex-1">
                <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-6 rounded-full text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                  <Heart className="mr-2 h-5 w-5 animate-pulse" />
                  Help {currentChild.name} Thrive
                </Button>
              </Link>
              <Link href="/stories" className="flex-1">
                <Button className="w-full bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300 py-6 rounded-full text-lg font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all">
                  View More Stories
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Weekly Rotation Note - More Personal */}
            <div className="text-center mt-6 p-4 bg-orange-50 rounded-xl">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-orange-600">New story every Monday</span><br/>
                Come back to discover another child's journey of hope
              </p>
            </div>
          </motion.div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {featuredChildren.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-orange-500'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`View child ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
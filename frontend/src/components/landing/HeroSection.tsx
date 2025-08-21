'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, Users, BookOpen, School, HandHeart, Sparkles } from 'lucide-react';

const images = [
  {
    url: '/images/children-learning.jpg',
    alt: 'Children learning in classroom',
    caption: 'Every child deserves quality education'
  },
  {
    url: '/images/happy-students.jpg',
    alt: 'Happy students with books',
    caption: 'Your support brings smiles to faces'
  },
  {
    url: '/images/classroom-activity.jpg',
    alt: 'Students engaged in activities',
    caption: 'Building futures, one child at a time'
  }
];

export default function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [stats, setStats] = useState({
    mealsProvided: 2847,
    childrenSupported: 342,
    booksDelivered: 1205,
    schoolsPartnered: 18
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const animateCounters = () => {
      setStats(prev => ({
        mealsProvided: prev.mealsProvided + Math.floor(Math.random() * 3),
        childrenSupported: prev.childrenSupported,
        booksDelivered: prev.booksDelivered + (Math.random() > 0.7 ? 1 : 0),
        schoolsPartnered: prev.schoolsPartnered
      }));
    };

    const interval = setInterval(animateCounters, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-amber-50 via-orange-50 to-white -mt-20">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="text-center max-w-5xl mx-auto">
          {/* Warm Welcome Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg mb-8">
            <HandHeart className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-700">Join 500+ caring hearts making a difference</span>
          </div>
          
          {/* Logo/Title */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in">
              <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">Every Child</span>
              <br />
              <span className="text-gray-800">Deserves to Dream</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 font-light mt-6 max-w-3xl mx-auto leading-relaxed">
              Help us provide education, meals, and hope to underprivileged K3 students across Hong Kong
            </p>
          </div>

          {/* Emotional Connection Message */}
          <div className="mb-12 bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-2xl md:text-3xl text-gray-800 font-semibold mb-4">
              "A small act of kindness can change a child's entire future"
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your donation doesn't just provide supplies—it gives hope, opportunity, and the chance for a brighter tomorrow
            </p>
          </div>

          {/* Live Impact Counters - Warmer Design */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                <Heart className="w-6 h-6 text-red-500" />
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {stats.mealsProvided.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Nutritious Meals</div>
              <div className="text-xs text-green-600 mt-1 font-medium">Growing daily 🌱</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {stats.childrenSupported}
              </div>
              <div className="text-sm text-gray-600">Happy Children</div>
              <div className="text-xs text-green-600 mt-1 font-medium">Lives changed ✨</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                <BookOpen className="w-6 h-6 text-purple-500" />
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {stats.booksDelivered.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Books Shared</div>
              <div className="text-xs text-green-600 mt-1 font-medium">Knowledge spreading 📚</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                <School className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {stats.schoolsPartnered}
              </div>
              <div className="text-sm text-gray-600">Partner Schools</div>
              <div className="text-xs text-green-600 mt-1 font-medium">Community united 🤝</div>
            </div>
          </div>

          {/* Call to Action Buttons - Warmer Style */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/children">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-10 py-7 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                <Heart className="mr-2 h-6 w-6 animate-pulse" />
                Change a Life Today
              </Button>
            </Link>
            
            <Link href="/schools">
              <Button 
                size="lg" 
                className="bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 px-10 py-7 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <School className="mr-2 h-6 w-6" />
                See How You Can Help
              </Button>
            </Link>
          </div>

          {/* Trust Indicators - Softer Style */}
          <div className="bg-white/80 backdrop-blur-sm rounded-full px-8 py-4 inline-flex items-center justify-center gap-6 shadow-lg">
            <span className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-green-500 text-lg">✓</span>
              <span className="font-medium">100% Transparent</span>
            </span>
            <span className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-green-500 text-lg">✓</span>
              <span className="font-medium">Registered Charity</span>
            </span>
            <span className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-green-500 text-lg">✓</span>
              <span className="font-medium">Tax Deductible</span>
            </span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Softer */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
          <span className="text-sm text-gray-600 font-medium">Scroll to learn more ↓</span>
        </div>
      </div>
    </section>
  );
}
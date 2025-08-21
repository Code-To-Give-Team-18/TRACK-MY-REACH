'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { School, BookOpen, ChevronDown } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-blue-50 via-indigo-50 to-white -mt-20">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-32 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-32 left-1/3 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Scattered Images - Full Color and Prominent */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Top left image - Mobile: medium, Desktop: extra large */}
        <div
          className="absolute top-24 left-2 sm:top-28 sm:left-4 md:top-36 md:left-8 lg:left-12 
                        w-32 h-32 sm:w-44 sm:h-44 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72
                        transform rotate-3 hover:rotate-0 transition-transform duration-300
                        shadow-xl rounded-2xl overflow-hidden"
        >
          <img
            src="https://www.cityu.edu.hk/class/media_events/magazine/img/issue9/photo/feature/1_2.jpg"
            alt="Happy student"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Top right image - Mobile: medium, Desktop: large */}
        <div
          className="absolute top-40 right-2 sm:top-44 sm:right-4 md:top-52 md:right-8 lg:right-16 
                        w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64
                        transform -rotate-6 hover:rotate-0 transition-transform duration-300
                        shadow-xl rounded-xl overflow-hidden"
        >
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-100 to-purple-200">
            <img
              src="https://www.hkspc.org/cache/img/2fef3b426160de7e3d75dabee6fcdd40.jpg"
              alt="Happy student"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Bottom left image - Hidden on mobile, visible on tablet+ */}
        <div
          className="hidden sm:block absolute bottom-32 left-4 md:bottom-40 md:left-8 lg:bottom-48 lg:left-16 
                        w-36 h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 xl:w-60 xl:h-60
                        transform rotate-12 hover:rotate-0 transition-transform duration-300
                        shadow-xl rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-pink-100 to-pink-200">
            <img
              src="https://www.news.gov.hk/eng/2023/08/20230804/20230804_143226_831/images/20230804161803128.JPG"
              alt="Happy student"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Bottom right image - Mobile: medium, Desktop: extra large */}
        <div
          className="absolute bottom-32 right-2 sm:bottom-36 sm:right-8 md:bottom-44 md:right-12 lg:right-20 
                        w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 lg:w-64 lg:h-64 xl:w-72 xl:h-72
                        transform -rotate-3 hover:rotate-0 transition-transform duration-300
                        shadow-xl rounded-xl overflow-hidden"
        >
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-indigo-100 to-indigo-200">
            <img
              src="https://media.cnn.com/api/v1/images/stellar/prod/131030204906-hk-kids.jpg?q=x_0,y_221,h_2394,w_4256,c_crop/h_833,w_1480"
              alt="Happy student"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Additional decorative image - Desktop only */}
        <div
          className="hidden lg:block absolute top-48 right-1/3 
                        w-44 h-44 xl:w-52 xl:h-52
                        transform rotate-[-8deg] hover:rotate-0 transition-transform duration-300
                        shadow-lg rounded-full overflow-hidden"
        >
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-yellow-100 to-orange-100">
            <img
              src="https://www.heiferhk.org/wp-content/uploads/2019/02/readtofeed_individual_member-600x400-optimized.jpg"
              alt="Happy student"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Title */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Empowering
              </span>
              <br />
              <span className="text-gray-800">K-3 Education</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
              Transforming early education for Hong Kong's youngest learners
              through innovative learning experiences
            </p>
          </div>

          {/* Simple Mission Statement */}
          <div className="mb-12 max-w-2xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed">
              We believe every child deserves access to quality early education.
              Join us in creating brighter futures for K-3 students across Hong
              Kong.
            </p>
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/children">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-10 py-6 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Support a Student
              </Button>
            </Link>

            <Link href="/schools">
              <Button
                size="lg"
                variant="outline"
                className="bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 px-10 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <School className="mr-2 h-5 w-5" />
                Learn More
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
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

      {/* Scroll Indicator - Encouraging to see Featured Child */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
            <span className="text-sm text-gray-700 font-medium">
              Meet the children you can help
            </span>
          </div>
          <ChevronDown className="w-6 h-6 text-gray-600 animate-pulse" />
        </div>
      </div>
    </section>
  );
}

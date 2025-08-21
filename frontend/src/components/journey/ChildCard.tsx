'use client';

import Link from 'next/link';
import { Heart, BookOpen, Users, TrendingUp } from 'lucide-react';
import { Child } from '@/types/reach';
import { motion } from 'framer-motion';

interface ChildCardProps {
  child: Child;
  index: number;
}

export default function ChildCard({ child, index }: ChildCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
    >
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-orange-200 to-pink-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-orange-400" />
          </div>
        </div>
        
        {/* Urgent Need Badge */}
        {child.currentNeeds.some(need => need.priority === 'urgent') && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Urgent Need
          </div>
        )}
        
        {/* Supporters Badge */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-full px-3 py-1 flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-semibold text-gray-800">
            {child.supporters} supporters
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Child Info */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{child.firstName}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Age {child.age}</span>
            <span>•</span>
            <span>{child.school.name}</span>
          </div>
        </div>

        {/* Story Preview */}
        <p className="text-gray-700 mb-4 line-clamp-2">
          {child.story || 'Help write a brighter future for this amazing child.'}
        </p>

        {/* Current Needs */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {child.currentNeeds.slice(0, 3).map((need) => (
              <span
                key={need.id}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  need.priority === 'urgent'
                    ? 'bg-red-100 text-red-700'
                    : need.priority === 'high'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {need.type}
              </span>
            ))}
          </div>
        </div>

        {/* Funding Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Funding Progress</span>
            <span className="text-sm font-bold text-gray-900">
              {child.fundingProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${child.fundingProgress}%` }}
              transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
              className="bg-gradient-to-r from-orange-400 to-pink-400 h-2 rounded-full"
            />
          </div>
        </div>

        {/* Recent Update */}
        {child.updates.length > 0 && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-green-600">Latest Update</span>
            </div>
            <p className="text-sm text-gray-700 line-clamp-2">
              {child.updates[0].title}
            </p>
          </div>
        )}

        {/* Action Button */}
        <Link href={`/children/${child.id}`}>
          <button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105">
            Support {child.firstName}
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
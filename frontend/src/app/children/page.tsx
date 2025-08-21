'use client';

import { useState } from 'react';
import ChildCard from '@/components/journey/ChildCard';
import UpdateFeed from '@/components/journey/UpdateFeed';
import { Child, Update } from '@/types/reach';
import { Search, Filter, TrendingUp, Users, Heart, Grid, List } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data - in production, this would come from an API
const mockChildren: Child[] = [
  {
    id: '1',
    firstName: 'Jenny',
    age: 5,
    school: {
      id: 's1',
      name: 'Sham Shui Po Primary',
      district: 'Sham Shui Po',
      location: { lat: 22.3302, lng: 114.1628 },
      studentsCount: 450,
      fundingGap: 50000,
      currentFunding: 35000,
      targetFunding: 85000
    },
    currentNeeds: [
      { id: 'n1', type: 'meals', description: 'Daily lunch program', cost: 50, priority: 'urgent', quantity: 30 },
      { id: 'n2', type: 'books', description: 'Reading materials', cost: 20, priority: 'high', quantity: 10 }
    ],
    updates: [
      {
        id: 'u1',
        childId: '1',
        type: 'milestone',
        title: 'Jenny won the school art competition!',
        content: 'We are so proud of Jenny for winning first place in her school\'s annual art competition.',
        reactions: 45,
        comments: [],
        timestamp: new Date('2024-01-15'),
        school: 'Sham Shui Po Primary'
      }
    ],
    supporters: 12,
    fundingProgress: 75,
    story: 'Jenny loves drawing and dreams of becoming an artist. With your support, she now has art supplies.'
  },
  {
    id: '2',
    firstName: 'Tommy',
    age: 6,
    school: {
      id: 's2',
      name: 'Kwun Tong District School',
      district: 'Kwun Tong',
      location: { lat: 22.3105, lng: 114.2262 },
      studentsCount: 380,
      fundingGap: 45000,
      currentFunding: 28000,
      targetFunding: 73000
    },
    currentNeeds: [
      { id: 'n3', type: 'books', description: 'Story books', cost: 15, priority: 'high', quantity: 20 },
      { id: 'n4', type: 'uniforms', description: 'School uniform', cost: 60, priority: 'medium', quantity: 2 }
    ],
    updates: [],
    supporters: 8,
    fundingProgress: 60,
    story: 'Tommy is passionate about reading but his family cannot afford books.'
  },
  {
    id: '3',
    firstName: 'Amy',
    age: 5,
    school: {
      id: 's3',
      name: 'Tin Shui Wai School',
      district: 'Yuen Long',
      location: { lat: 22.4635, lng: 113.9975 },
      studentsCount: 520,
      fundingGap: 60000,
      currentFunding: 42000,
      targetFunding: 102000
    },
    currentNeeds: [
      { id: 'n5', type: 'supplies', description: 'School supplies', cost: 25, priority: 'urgent', quantity: 15 }
    ],
    updates: [],
    supporters: 15,
    fundingProgress: 41
  }
];

const mockUpdates: Update[] = [
  {
    id: 'u1',
    childId: '1',
    type: 'milestone',
    title: 'Jenny won the school art competition!',
    content: 'We are so proud of Jenny for winning first place in her school\'s annual art competition. Her creativity and dedication have truly shined through. Thank you to all supporters who made this possible!',
    reactions: 45,
    comments: [
      {
        id: 'c1',
        donorId: 'd1',
        donorName: 'Sarah Chen',
        content: 'So proud of Jenny! Keep up the amazing work!',
        timestamp: new Date('2024-01-16')
      }
    ],
    timestamp: new Date('2024-01-15'),
    school: 'Sham Shui Po Primary'
  },
  {
    id: 'u2',
    childId: '2',
    type: 'photo',
    title: 'Tommy\'s reading corner is complete!',
    content: 'Thanks to your generous donations, we\'ve created a special reading corner for Tommy and his classmates. They now have access to over 50 new books!',
    mediaUrl: '/images/reading-corner.jpg',
    reactions: 67,
    comments: [],
    timestamp: new Date('2024-01-14'),
    school: 'Kwun Tong District School'
  },
  {
    id: 'u3',
    childId: '3',
    type: 'testimony',
    title: 'A message from Amy\'s teacher',
    content: 'Amy has shown remarkable improvement in her studies since receiving proper school supplies. She\'s more engaged and enthusiastic about learning. Your support is truly making a difference!',
    reactions: 38,
    comments: [],
    timestamp: new Date('2024-01-13'),
    school: 'Tin Shui Wai School'
  }
];

export default function ChildrenPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'feed'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [sortBy, setSortBy] = useState('urgent');

  const districts = ['all', 'Sham Shui Po', 'Kwun Tong', 'Yuen Long', 'Central', 'Wan Chai'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Children Need Your Support
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Every child has a unique story and dreams. Choose a child to support and follow their journey.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-gray-700">
                <span className="font-bold">{mockChildren.length}</span> children need support
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              <span className="text-gray-700">
                <span className="font-bold">523</span> active donors
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">
                <span className="font-bold">89%</span> funding success rate
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or school..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* District Filter */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {districts.map(district => (
                <option key={district} value={district}>
                  {district === 'all' ? 'All Districts' : district}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="urgent">Most Urgent</option>
              <option value="progress">Funding Progress</option>
              <option value="supporters">Most Supporters</option>
              <option value="newest">Newest</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
              >
                <Grid className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setViewMode('feed')}
                className={`p-2 rounded ${viewMode === 'feed' ? 'bg-white shadow' : ''}`}
              >
                <List className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockChildren.map((child, index) => (
              <ChildCard key={child.id} child={child} index={index} />
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Updates</h2>
            <UpdateFeed updates={mockUpdates} />
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { User, Heart, BookOpen, Star, Sparkles, GraduationCap, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface StudentSelectorProps {
  selectedRegion: string;
  selectedStudent: string;
  onStudentSelect: (studentId: string) => void;
  initialChildId?: string;
}

interface Child {
  id: string;
  name: string;
  age: number | null;
  school: string | null;
  grade: string | null;
  description: string | null;
  bio: string | null;
  region_id: string;
  region_name: string | null;
  follower_count: number;
  total_received: number;
}

// Mock data for fallback - in production, this would come from an API
const mockStudents: Record<string, Child[]> = {
  'central': [
    {
      id: 'student-1',
      name: 'Amy Chan',
      age: 5,
      school: 'Central District Primary',
      story: 'Amy loves drawing and dreams of becoming an artist. She needs art supplies to pursue her passion.',
      needs: ['Art supplies', 'School uniform', 'Lunch support'],
    },
    {
      id: 'student-2',
      name: 'Ben Wong',
      age: 6,
      school: 'Western District School',
      story: 'Ben is passionate about reading but lacks access to books. He wants to become a teacher.',
      needs: ['Books', 'Stationery', 'Tutoring support'],
    },
  ],
  'kowloon-city': [
    {
      id: 'student-3',
      name: 'Lily Tam',
      age: 5,
      school: 'Kowloon City Primary',
      story: 'Lily excels in mathematics and needs educational materials to continue learning.',
      needs: ['Math workbooks', 'Calculator', 'School bag'],
    },
    {
      id: 'student-4',
      name: 'Tom Lee',
      age: 6,
      school: 'City District School',
      story: 'Tom loves sports but cannot afford proper sports equipment for PE classes.',
      needs: ['Sports shoes', 'PE uniform', 'Sports equipment'],
    },
  ],
};

export function StudentSelector({ selectedRegion, selectedStudent, onStudentSelect, initialChildId }: StudentSelectorProps) {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  // Fetch specific child if childId is provided
  useEffect(() => {
    const fetchChild = async () => {
      if (initialChildId && initialChildId !== 'let-us-choose') {
        setLoading(true);
        try {
          const response = await axios.get(`${API_URL}/api/v1/children/${initialChildId}`);
          if (response.data) {
            setSelectedChild(response.data);
            onStudentSelect(initialChildId);
            // Also fetch other children from the same region
            if (response.data.region_id) {
              const regionResponse = await axios.get(`${API_URL}/api/v1/children`);
              const regionChildren = regionResponse.data.filter(
                (child: Child) => child.region_id === response.data.region_id && child.id !== initialChildId
              );
              setChildren([response.data, ...regionChildren]);
            }
          }
        } catch (error) {
          console.error('Failed to fetch child:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchChild();
  }, [initialChildId, onStudentSelect]);

  // Fetch children by region
  useEffect(() => {
    const fetchChildrenByRegion = async () => {
      if (selectedRegion && !initialChildId) {
        setLoading(true);
        try {
          const response = await axios.get(`${API_URL}/api/v1/children/region/${selectedRegion}`);
          setChildren(response.data);
        } catch (error) {
          console.error('Failed to fetch children:', error);
          // Fallback to fetching all and filtering
          try {
            const allResponse = await axios.get(`${API_URL}/api/v1/children`);
            const regionChildren = allResponse.data.filter(
              (child: Child) => child.region_id === selectedRegion
            );
            setChildren(regionChildren);
          } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            // Use mock data as last resort
            if (mockStudents[selectedRegion]) {
              setChildren(mockStudents[selectedRegion]);
            }
          }
        } finally {
          setLoading(false);
        }
      }
    };
    fetchChildrenByRegion();
  }, [selectedRegion, initialChildId]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 text-gray-400 animate-spin mx-auto" />
        <p className="text-gray-600 mt-4">Loading children...</p>
      </div>
    );
  }

  if (!selectedRegion && !initialChildId) {
    return (
      <div className="text-center py-12">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-200 to-pink-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-rose-100 to-pink-100 p-4 rounded-full">
            <GraduationCap className="h-12 w-12 text-rose-400" />
          </div>
        </div>
        <p className="text-gray-600 mt-4 font-medium">Select a region to see students</p>
        <p className="text-gray-400 text-sm mt-1">Choose an area on the map above</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Let Us Choose Option */}
      <div
        onClick={() => onStudentSelect('let-us-choose')}
        className={`relative p-5 rounded-xl cursor-pointer transition-all transform hover:scale-[1.01] ${
          selectedStudent === 'let-us-choose'
            ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xl'
            : 'bg-white/60 hover:bg-white/80 border border-gray-200/50'
        }`}
      >
        {selectedStudent === 'let-us-choose' && (
          <div className="absolute -top-2 -right-2">
            <div className="bg-white rounded-full p-1 shadow-lg">
              <Star className="h-4 w-4 text-rose-500" />
            </div>
          </div>
        )}
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${
              selectedStudent === 'let-us-choose'
                ? 'bg-white/20'
                : 'bg-gradient-to-br from-rose-400 to-pink-500'
            }`}>
              <Heart className={`h-7 w-7 ${
                selectedStudent === 'let-us-choose' ? 'text-white' : 'text-white'
              }`} />
            </div>
          </div>
          <div className="flex-1">
            <h4 className={`font-bold text-lg ${
              selectedStudent === 'let-us-choose' ? 'text-white' : 'text-gray-900'
            }`}>
              Let Us Choose
            </h4>
            <p className={`text-sm mt-0.5 ${
              selectedStudent === 'let-us-choose' ? 'text-white/90' : 'text-gray-600'
            }`}>
              Maximum impact where it's needed most
            </p>
          </div>
          <Sparkles className={`h-5 w-5 flex-shrink-0 ${
            selectedStudent === 'let-us-choose' ? 'text-white' : 'text-amber-500'
          }`} />
        </div>
      </div>

      {/* Student Cards Header */}
      <div className="flex items-center gap-2 mt-6">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
        <span className="text-xs font-medium text-gray-500 px-3">OR CHOOSE A STUDENT</span>
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
      </div>

      {/* Student Cards */}
      <div className="space-y-3">
        {children.map((child) => (
          <div
            key={child.id}
            onClick={() => onStudentSelect(child.id)}
            className={`relative p-4 rounded-xl cursor-pointer transition-all transform hover:scale-[1.01] ${
              selectedStudent === child.id
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400 shadow-lg'
                : 'bg-white/60 hover:bg-white/80 border border-gray-200/50'
            }`}
          >
            {selectedStudent === child.id && (
              <div className="absolute -top-2 -right-2">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-1 shadow-lg">
                  <Star className="h-3 w-3 text-white" />
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${
                  selectedStudent === child.id
                    ? 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white'
                    : 'bg-gradient-to-br from-purple-400 to-pink-400 text-white'
                }`}>
                  {child.name.charAt(0)}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className={`font-semibold ${
                      selectedStudent === child.id ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {child.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {child.age ? `Age ${child.age}` : ''} {child.age && child.school ? '•' : ''} {child.school || child.grade || ''}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                  {child.description || child.bio || 'A bright student who needs support to continue their education.'}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    selectedStudent === child.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Heart className="h-2.5 w-2.5 mr-1" />
                    {child.follower_count} supporters
                  </span>
                  {child.total_received > 0 && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      selectedStudent === child.id
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      HK${child.total_received.toFixed(0)} raised
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Privacy Note */}
      <div className="mt-6 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50">
        <div className="flex items-start gap-2">
          <div className="p-1 bg-amber-100 rounded-lg mt-0.5">
            <User className="h-3 w-3 text-amber-600" />
          </div>
          <p className="text-xs text-amber-800">
            <span className="font-semibold">Privacy Protected:</span> Names and details are anonymized. 
            Your donation supports real students with verified needs.
          </p>
        </div>
      </div>
    </div>
  );
}
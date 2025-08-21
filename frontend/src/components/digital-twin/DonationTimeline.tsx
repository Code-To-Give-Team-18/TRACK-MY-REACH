'use client';

import { useState } from 'react';
import { Calendar, Package, Users, BookOpen, Heart, ChevronRight } from 'lucide-react';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  impact: string;
  amount: number;
  icon: React.ReactNode;
  images?: string[];
}

const mockEvents: TimelineEvent[] = [
  {
    id: '1',
    date: '2024-08-15',
    title: 'Smart Board Installation',
    description: 'Your donation helped install an interactive smart board',
    impact: '25 students now have access to digital learning tools',
    amount: 3500,
    icon: <Package className="w-4 h-4" />,
    images: []
  },
  {
    id: '2',
    date: '2024-07-28',
    title: 'Book Drive Success',
    description: 'Contributed to purchasing 50 new storybooks',
    impact: 'Reading comprehension improved by 30% in 2 months',
    amount: 1200,
    icon: <BookOpen className="w-4 h-4" />,
    images: []
  },
  {
    id: '3',
    date: '2024-07-10',
    title: 'Art Supplies Delivered',
    description: 'Funded art and craft materials for creative learning',
    impact: 'Students created 100+ artworks displayed at school exhibition',
    amount: 800,
    icon: <Heart className="w-4 h-4" />,
    images: []
  },
  {
    id: '4',
    date: '2024-06-20',
    title: 'Classroom Renovation',
    description: 'Helped renovate and furnish the classroom',
    impact: 'Created a safer, more comfortable learning environment',
    amount: 5000,
    icon: <Users className="w-4 h-4" />,
    images: []
  }
];

export function DonationTimeline() {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="relative">
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
      
      <div className="space-y-6">
        {mockEvents.map((event, index) => (
          <div key={event.id} className="relative flex items-start">
            <div className="absolute left-8 w-4 h-4 bg-white border-4 border-blue-500 rounded-full -translate-x-1/2 z-10"></div>
            
            <div className="ml-16 flex-1">
              <button
                onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                className="w-full text-left group"
              >
                <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        {event.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(event.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-blue-600">HK${event.amount}</p>
                      <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                        expandedEvent === event.id ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600">{event.description}</p>
                  
                  {expandedEvent === event.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-green-800 mb-1">Impact Achieved:</p>
                        <p className="text-sm text-green-600">{event.impact}</p>
                      </div>
                      
                      <div className="mt-3 flex gap-2">
                        <button className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          View Photos
                        </button>
                        <button className="text-xs px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                          Share Story
                        </button>
                        <button className="text-xs px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                          Get Certificate
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Load More History →
        </button>
      </div>
    </div>
  );
}
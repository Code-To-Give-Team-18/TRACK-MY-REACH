'use client';

import { BookOpen, Users, TrendingUp, Heart, Award, Target } from 'lucide-react';

interface MetricCard {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: string;
  color: string;
}

export function ImpactDashboard() {
  const metrics: MetricCard[] = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: 'Books Donated',
      value: '247',
      change: '+23 this month',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Students Impacted',
      value: '125',
      change: '+15 new',
      color: 'text-purple-600 bg-purple-50'
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Learning Hours',
      value: '1,840',
      change: '+180 this week',
      color: 'text-green-600 bg-green-50'
    },
    {
      icon: <Heart className="w-5 h-5" />,
      label: 'Donor Rank',
      value: '#42',
      change: '↑ 5 positions',
      color: 'text-red-600 bg-red-50'
    },
    {
      icon: <Award className="w-5 h-5" />,
      label: 'Impact Score',
      value: '8.7',
      change: 'Excellent',
      color: 'text-yellow-600 bg-yellow-50'
    },
    {
      icon: <Target className="w-5 h-5" />,
      label: 'Goals Met',
      value: '3/5',
      change: '60% complete',
      color: 'text-indigo-600 bg-indigo-50'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-lg p-3 hover:shadow-md transition-shadow"
          >
            <div className={`inline-flex p-2 rounded-lg mb-2 ${metric.color}`}>
              {metric.icon}
            </div>
            <p className="text-xs text-gray-600 mb-1">{metric.label}</p>
            <p className="text-xl font-bold text-gray-900">{metric.value}</p>
            {metric.change && (
              <p className="text-xs text-gray-500 mt-1">{metric.change}</p>
            )}
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Impact Journey</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Total Donated</span>
            <span className="text-sm font-semibold text-gray-900">HK$12,500</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Member Since</span>
            <span className="text-sm font-semibold text-gray-900">6 months</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Classrooms Supported</span>
            <span className="text-sm font-semibold text-gray-900">3</span>
          </div>
        </div>
      </div>

      <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow">
        View Full Impact Report
      </button>
    </div>
  );
}
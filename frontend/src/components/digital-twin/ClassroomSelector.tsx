'use client';

import { useState } from 'react';
import { MapPin, Users, BookOpen } from 'lucide-react';

interface Classroom {
  id: string;
  name: string;
  school: string;
  district: string;
  studentsCount: number;
  fundingProgress: number;
  needsLevel: 'critical' | 'high' | 'medium' | 'low';
}

const mockClassrooms: Classroom[] = [
  {
    id: '1',
    name: 'Sunshine K3-A',
    school: 'Wan Chai Primary',
    district: 'Wan Chai',
    studentsCount: 25,
    fundingProgress: 65,
    needsLevel: 'high'
  },
  {
    id: '2',
    name: 'Rainbow K3-B',
    school: 'Central Kids Academy',
    district: 'Central',
    studentsCount: 20,
    fundingProgress: 85,
    needsLevel: 'medium'
  },
  {
    id: '3',
    name: 'Star Class K3',
    school: 'Sham Shui Po Elementary',
    district: 'Sham Shui Po',
    studentsCount: 30,
    fundingProgress: 35,
    needsLevel: 'critical'
  }
];

export function ClassroomSelector() {
  const [selectedClassroom, setSelectedClassroom] = useState<string>('1');

  const getNeedsColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-3">
      {mockClassrooms.map((classroom) => (
        <button
          key={classroom.id}
          onClick={() => setSelectedClassroom(classroom.id)}
          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
            selectedClassroom === classroom.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900">{classroom.name}</h3>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getNeedsColor(classroom.needsLevel)}`}>
              {classroom.needsLevel} needs
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{classroom.school}</p>
          
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {classroom.district}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {classroom.studentsCount} students
            </span>
          </div>
          
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Funding Progress</span>
              <span className="font-medium">{classroom.fundingProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${classroom.fundingProgress}%` }}
              />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
'use client';

import React from 'react';
import { type Region } from '@/services/regions.service';
import ChildCard, { type Child } from './ChildCard';

interface ChildrenListProps {
  children: Child[];
  regions: Region[];
}

export default function ChildrenList({ children, regions }: ChildrenListProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Registered Children ({children.length})
      </h2>
      
      {children.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No children registered yet.</p>
          <p className="mt-2">Click "Add New Child" to get started.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => {
            const region = regions.find(r => r.id === child.region_id);
            return (
              <ChildCard 
                key={child.id} 
                child={child} 
                region={region} 
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
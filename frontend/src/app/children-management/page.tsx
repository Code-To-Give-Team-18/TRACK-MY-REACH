'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { childrenService } from '@/services/children.service';
import { regionsService, type Region } from '@/services/regions.service';
import ChildForm from '@/components/children/ChildForm';
import ChildrenList from '@/components/children/ChildrenList';
import { type Child } from '@/components/children/ChildCard';

export default function ChildrenManagementPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [regionsData, childrenData] = await Promise.all([
        regionsService.getRegions(),
        childrenService.getAllChildren()
      ]);
      
      setRegions(regionsData);
      setChildren(childrenData || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleFormSuccess = async () => {
    setShowForm(false);
    await fetchData();
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Children Management</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200"
            >
              {showForm ? (
                <>
                  <X className="w-5 h-5" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add New Child
                </>
              )}
            </button>
          </div>

          {showForm && (
            <ChildForm 
              regions={regions}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          )}

          <ChildrenList 
            children={children} 
            regions={regions} 
          />
        </motion.div>
      </div>
    </div>
  );
}
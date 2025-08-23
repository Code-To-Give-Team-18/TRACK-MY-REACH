'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Plus, Pencil, MapPin, School } from 'lucide-react';
import { childrenService } from '@/services/children.service';

type Child = {
  id: string;
  name: string;
  age: number;
  school: string;
  picture_link?: string;
  region_id: string;
  description?: string;
  bio?: string;
  video_link?: string;
};

type SchoolType = {
  id: string;
  name: string;
  regionId: string;
  children: Child[];
};

type Region = {
  id: string;
  name: string;
  schools: SchoolType[];
};

export default function ChildrenDatabasePage({ user }: { user: any }) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());
  const [expandedSchools, setExpandedSchools] = useState<Set<string>>(new Set());

  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [showFormForSchool, setShowFormForSchool] = useState<string | null>(null);
  const [currentRegionId, setCurrentRegionId] = useState<string | null>(null);

  // Add extra fields to formData
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    picture_link: '',
    description: '',
    bio: '',
    video_link: '',
  });

  // Fetch children
  useEffect(() => {
    async function fetchChildren() {
      try {
        const response = await childrenService.getChildren({ page: 1, limit: 1000 });
        const items = response?.items || [];
        const regionMap: Record<string, Region> = {};

        items.forEach(child => {
          const regionId = child.region_id || '1';
          if (!regionMap[regionId]) {
            regionMap[regionId] = { id: regionId, name: `Region ${regionId}`, schools: [] };
          }

          let school = regionMap[regionId].schools.find(s => s.name === child.school);
          if (!school) {
            school = {
              id: `${regionId}-${child.school || 'School 1'}`,
              name: child.school || 'School 1',
              regionId,
              children: [],
            };
            regionMap[regionId].schools.push(school);
          }

          school.children.push({
            id: child.id,
            name: child.name,
            age: child.age || 0,
            school: child.school || 'School 1',
            picture_link: child.picture_link,
            region_id: regionId,
            description: child.description,
            bio: child.bio,
            video_link: child.video_link,
          });
        });

        if (Object.keys(regionMap).length === 0) {
          regionMap['1'] = {
            id: '1',
            name: 'Region 1',
            schools: [{ id: '1-1', name: 'School 1', regionId: '1', children: [] }],
          };
        }

        setRegions(Object.values(regionMap));
      } catch (err) {
        console.error('Failed to fetch children', err);
      } finally {
        setLoading(false);
      }
    }

    fetchChildren();
  }, []);

  const handleFormSubmit = async (schoolId: string, regionId: string) => {
    try {
      const schoolName = regions.flatMap(r => r.schools).find(s => s.id === schoolId)?.name || 'School 1';

      await childrenService.createChild({
        name: formData.name,
        age: Number(formData.age),
        school: editingChild?.school || schoolName,
        region_id: regionId,
        picture_link: formData.picture_link,
        grade: '',
        description: formData.description,
        bio: formData.bio,
        video_link: formData.video_link,
      });

      // Refresh
      const response = await childrenService.getChildren({ page: 1, limit: 1000 });
      const items = response?.items || [];
      const regionMap: Record<string, Region> = {};

      items.forEach(child => {
        const regionId = child.region_id || '1';
        if (!regionMap[regionId]) {
          regionMap[regionId] = { id: regionId, name: `Region ${regionId}`, schools: [] };
        }

        let school = regionMap[regionId].schools.find(s => s.name === child.school);
        if (!school) {
          school = {
            id: `${regionId}-${child.school || 'School 1'}`,
            name: child.school || 'School 1',
            regionId,
            children: [],
          };
          regionMap[regionId].schools.push(school);
        }

        school.children.push({
          id: child.id,
          name: child.name,
          age: child.age || 0,
          school: child.school || 'School 1',
          picture_link: child.picture_link,
          region_id: regionId,
          description: child.description,
          bio: child.bio,
          video_link: child.video_link,
        });
      });

      setRegions(Object.values(regionMap));
      setFormData({ name: '', age: '', picture_link: '', description: '', bio: '', video_link: '' });
      setEditingChild(null);
      setShowFormForSchool(null);
    } catch (err) {
      console.error('Failed to save child', err);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading children...</div>;

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 min-h-screen">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Children Details</h2>

          {regions.map(region => (
            <div key={region.id} className="mb-6">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="p-6 bg-white shadow-xl rounded-2xl cursor-pointer flex items-center gap-3"
                onClick={() => {
                  const newSet = new Set(expandedRegions);
                  newSet.has(region.id) ? newSet.delete(region.id) : newSet.add(region.id);
                  setExpandedRegions(newSet);
                }}
              >
                <MapPin className="w-8 h-8 text-orange-500" />
                <h3 className="text-xl font-semibold">{region.name}</h3>
              </motion.div>

              {expandedRegions.has(region.id) && (
                <div className="mt-4 ml-6 grid md:grid-cols-2 gap-4">
                  {region.schools.map(school => (
                    <div key={school.id}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-4 bg-white rounded-xl shadow cursor-pointer flex items-center gap-2"
                        onClick={() => {
                          const newSet = new Set(expandedSchools);
                          newSet.has(school.id) ? newSet.delete(school.id) : newSet.add(school.id);
                          setExpandedSchools(newSet);
                        }}
                      >
                        <School className="w-6 h-6 text-pink-500" />
                        <h4 className="font-semibold">{school.name}</h4>
                      </motion.div>

                      <button
                        onClick={() => {
                          setEditingChild(null);
                          setFormData({ name: '', age: '', picture_link: '', description: '', bio: '', video_link: '' });
                          setShowFormForSchool(school.id);
                          setCurrentRegionId(region.id);
                        }}
                        className="mt-2 text-sm text-white bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
                      >
                        <Plus className="w-4 h-4 inline" /> Add Child
                      </button>

                      {showFormForSchool === school.id && (
                        <div className="mt-3 p-4 bg-gray-50 rounded-xl space-y-3">
                          <input
                            type="text"
                            placeholder="Name"
                            className="w-full border px-3 py-2 rounded"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                          />
                          <input
                            type="number"
                            placeholder="Age"
                            className="w-full border px-3 py-2 rounded"
                            value={formData.age}
                            onChange={e => setFormData({ ...formData, age: e.target.value })}
                          />
                          <input
                            type="text"
                            placeholder="Description"
                            className="w-full border px-3 py-2 rounded"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                          />
                          <input
                            type="text"
                            placeholder="Bio"
                            className="w-full border px-3 py-2 rounded"
                            value={formData.bio}
                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                          />
                          <input
                            type="text"
                            placeholder="Video Link"
                            className="w-full border px-3 py-2 rounded"
                            value={formData.video_link}
                            onChange={e => setFormData({ ...formData, video_link: e.target.value })}
                          />
                          <div>
                            <label className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded cursor-pointer inline-block">
                              Choose Image
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setFormData({ ...formData, picture_link: URL.createObjectURL(file) });
                                  }
                                }}
                              />
                            </label>
                            {formData.picture_link && (
                              <div className="mt-2 w-32 h-32 relative">
                                <Image src={formData.picture_link} alt="Child" fill className="object-cover rounded" />
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleFormSubmit(school.id, currentRegionId!)}
                              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                              {editingChild ? 'Save' : 'Add'}
                            </button>
                            <button
                              onClick={() => setShowFormForSchool(null)}
                              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Children List omitted for brevity; keep as in previous version */}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

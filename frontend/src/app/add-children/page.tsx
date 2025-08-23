'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Plus, Pencil, MapPin, School } from 'lucide-react';

type Child = {
  id: string;
  name: string;
  age: number;
  school: string;
  picture_link?: string;
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
  // Dummy data: 4 regions, 3–4 schools each, 6–8 children per school
  const [regions, setRegions] = useState<Region[]>([
    {
      id: 'r1',
      name: 'North Region',
      schools: [
        {
          id: 'n1',
          name: 'North High School',
          regionId: 'r1',
          children: Array.from({ length: 6 }, (_, i) => ({
            id: `n1c${i + 1}`,
            name: `NorthChild${i + 1}`,
            age: 8 + i,
            school: 'North High School',
          })),
        },
        {
          id: 'n2',
          name: 'Northern Academy',
          regionId: 'r1',
          children: Array.from({ length: 7 }, (_, i) => ({
            id: `n2c${i + 1}`,
            name: `NorthernChild${i + 1}`,
            age: 7 + i,
            school: 'Northern Academy',
          })),
        },
        {
          id: 'n3',
          name: 'Northside School',
          regionId: 'r1',
          children: Array.from({ length: 6 }, (_, i) => ({
            id: `n3c${i + 1}`,
            name: `NorthsideChild${i + 1}`,
            age: 9 + i,
            school: 'Northside School',
          })),
        },
      ],
    },
    {
      id: 'r2',
      name: 'South Region',
      schools: [
        {
          id: 's1',
          name: 'South High School',
          regionId: 'r2',
          children: Array.from({ length: 6 }, (_, i) => ({
            id: `s1c${i + 1}`,
            name: `SouthChild${i + 1}`,
            age: 8 + i,
            school: 'South High School',
          })),
        },
        {
          id: 's2',
          name: 'Southern Academy',
          regionId: 'r2',
          children: Array.from({ length: 7 }, (_, i) => ({
            id: `s2c${i + 1}`,
            name: `SouthernChild${i + 1}`,
            age: 7 + i,
            school: 'Southern Academy',
          })),
        },
      ],
    },
    {
      id: 'r3',
      name: 'East Region',
      schools: [
        {
          id: 'e1',
          name: 'East High School',
          regionId: 'r3',
          children: Array.from({ length: 6 }, (_, i) => ({
            id: `e1c${i + 1}`,
            name: `EastChild${i + 1}`,
            age: 8 + i,
            school: 'East High School',
          })),
        },
        {
          id: 'e2',
          name: 'Eastern Academy',
          regionId: 'r3',
          children: Array.from({ length: 8 }, (_, i) => ({
            id: `e2c${i + 1}`,
            name: `EasternChild${i + 1}`,
            age: 7 + i,
            school: 'Eastern Academy',
          })),
        },
      ],
    },
    {
      id: 'r4',
      name: 'West Region',
      schools: [
        {
          id: 'w1',
          name: 'West High School',
          regionId: 'r4',
          children: Array.from({ length: 6 }, (_, i) => ({
            id: `w1c${i + 1}`,
            name: `WestChild${i + 1}`,
            age: 8 + i,
            school: 'West High School',
          })),
        },
        {
          id: 'w2',
          name: 'Western Academy',
          regionId: 'r4',
          children: Array.from({ length: 7 }, (_, i) => ({
            id: `w2c${i + 1}`,
            name: `WesternChild${i + 1}`,
            age: 7 + i,
            school: 'Western Academy',
          })),
        },
      ],
    },
  ]);

  // Track expanded regions/schools
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());
  const [expandedSchools, setExpandedSchools] = useState<Set<string>>(new Set());

  // Admin add/edit state
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [showFormForSchool, setShowFormForSchool] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', age: '', picture_link: '' });

  const handleFormSubmit = (schoolId: string) => {
    const school = regions
      .flatMap(r => r.schools)
      .find(s => s.id === schoolId);
    if (!school) return;

    if (editingChild) {
      school.children = school.children.map(c =>
        c.id === editingChild.id ? { ...c, ...formData, age: Number(formData.age) } : c
      );
      setEditingChild(null);
    } else {
      school.children.push({
        id: `c${Date.now()}`,
        name: formData.name,
        age: Number(formData.age),
        school: school.name,
        picture_link: formData.picture_link,
      });
    }

    setFormData({ name: '', age: '', picture_link: '' });
    setShowFormForSchool(null);
    setRegions([...regions]);
  };


  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 min-h-screen">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            Children Details
          </h2>

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
                          newSet.has(school.id)
                            ? newSet.delete(school.id)
                            : newSet.add(school.id);
                          setExpandedSchools(newSet);
                        }}
                      >
                        <School className="w-6 h-6 text-pink-500" />
                        <h4 className="font-semibold">{school.name}</h4>
                      </motion.div>

                      {expandedSchools.has(school.id) && (
                        <>
                          {/* Add Child Form */}
                          {showFormForSchool === school.id && (
                            <div className="mt-3 p-4 bg-gray-50 rounded-xl space-y-3">
                              <input
                                type="text"
                                placeholder="Name"
                                className="w-full border px-3 py-2 rounded"
                                value={formData.name}
                                onChange={e =>
                                  setFormData({ ...formData, name: e.target.value })
                                }
                              />
                              <input
                                type="number"
                                placeholder="Age"
                                className="w-full border px-3 py-2 rounded"
                                value={formData.age}
                                onChange={e =>
                                  setFormData({ ...formData, age: e.target.value })
                                }
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
                                        setFormData({
                                          ...formData,
                                          picture_link: URL.createObjectURL(file),
                                        });
                                      }
                                    }}
                                  />
                                </label>
                                {formData.picture_link && (
                                  <div className="mt-2 w-32 h-32 relative">
                                    <Image
                                      src={formData.picture_link}
                                      alt="Child"
                                      fill
                                      className="object-cover rounded"
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleFormSubmit(school.id)}
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

                          {/* Add Child Button */}
                          <button
                            onClick={() => {
                              setEditingChild(null);
                              setFormData({ name: '', age: '', picture_link: '' });
                              setShowFormForSchool(school.id);
                            }}
                            className="mt-2 text-sm text-white bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
                          >
                            <Plus className="w-4 h-4 inline" /> Add Child
                          </button>

                          {/* Children List */}
                          <div className="mt-2 grid md:grid-cols-3 gap-4">
                            {school.children.map(child => (
                              <div key={child.id} className="p-3 bg-white shadow rounded-xl relative">
                                {editingChild?.id === child.id ? (
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      value={formData.name}
                                      onChange={e =>
                                        setFormData({ ...formData, name: e.target.value })
                                      }
                                      className="w-full border px-2 py-1 rounded"
                                      placeholder="Name"
                                    />
                                    <input
                                      type="number"
                                      value={formData.age}
                                      onChange={e =>
                                        setFormData({ ...formData, age: e.target.value })
                                      }
                                      className="w-full border px-2 py-1 rounded"
                                      placeholder="Age"
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
                                              setFormData({
                                                ...formData,
                                                picture_link: URL.createObjectURL(file),
                                              });
                                            }
                                          }}
                                        />
                                      </label>
                                      {formData.picture_link && (
                                        <div className="mt-2 w-32 h-32 relative">
                                          <Image
                                            src={formData.picture_link}
                                            alt="Child"
                                            fill
                                            className="object-cover rounded"
                                          />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleFormSubmit(school.id)}
                                        className="bg-green-500 text-white px-3 py-1 rounded"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingChild(null)}
                                        className="bg-gray-300 px-3 py-1 rounded"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="relative h-32 w-full mb-2 bg-gray-100 rounded overflow-hidden">
                                      {child.picture_link ? (
                                        <Image
                                          src={child.picture_link}
                                          alt={child.name}
                                          fill
                                          className="object-cover"
                                        />
                                      ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                          No Image
                                        </div>
                                      )}
                                    </div>
                                    <h5 className="font-semibold">{child.name}</h5>
                                    <p className="text-gray-600 text-sm">Age: {child.age}</p>
                                    <button
                                      onClick={() => {
                                        setEditingChild(child);
                                        setFormData({
                                          name: child.name,
                                          age: String(child.age),
                                          picture_link: child.picture_link || '',
                                        });
                                      }}
                                      className="mt-1 text-blue-600 text-sm hover:underline flex items-center gap-1"
                                    >
                                      <Pencil className="w-4 h-4" /> Edit
                                    </button>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
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
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Plus, User, Calendar, School as SchoolIcon, MapPin, FileText, Video, Upload, X } from 'lucide-react';
import { childrenService } from '@/services/children.service';
import { regionsService, type Region } from '@/services/regions.service';

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

export default function AddChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    school: '',
    region_id: '',
    description: '',
    bio: '',
    video_link: '',
    picture_link: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [regionsData, childrenResponse] = await Promise.all([
        regionsService.getRegions(),
        childrenService.getChildren({ page: 1, limit: 100 })
      ]);
      
      setRegions(regionsData);
      setChildren(childrenResponse?.items || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.age || parseInt(formData.age) <= 0) newErrors.age = 'Valid age is required';
    if (!formData.school.trim()) newErrors.school = 'School is required';
    if (!formData.region_id) newErrors.region_id = 'Region is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      await childrenService.createChild({
        name: formData.name,
        age: parseInt(formData.age),
        school: formData.school,
        region_id: formData.region_id,
        picture_link: formData.picture_link || '',
        grade: '',
        description: formData.description || '',
        bio: formData.bio || '',
        video_link: formData.video_link || '',
      });

      // Reset form
      setFormData({
        name: '',
        age: '',
        school: '',
        region_id: '',
        description: '',
        bio: '',
        video_link: '',
        picture_link: '',
      });
      setImagePreview('');
      setShowForm(false);
      setErrors({});
      
      // Refresh children list
      await fetchData();
    } catch (error) {
      console.error('Failed to create child:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, picture_link: result });
      };
      reader.readAsDataURL(file);
    }
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
            <h1 className="text-4xl font-bold text-gray-800">Manage Children</h1>
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
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-8 mb-8"
            >
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add New Child</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Name Field */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4" />
                        Child's Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter child's full name"
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Age Field */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4" />
                        Age *
                      </label>
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.age ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter age"
                        min="1"
                        max="18"
                      />
                      {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                    </div>

                    {/* School Field */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <SchoolIcon className="w-4 h-4" />
                        School *
                      </label>
                      <input
                        type="text"
                        value={formData.school}
                        onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.school ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter school name"
                      />
                      {errors.school && <p className="text-red-500 text-sm mt-1">{errors.school}</p>}
                    </div>

                    {/* Region Selector */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4" />
                        Region *
                      </label>
                      <select
                        value={formData.region_id}
                        onChange={(e) => setFormData({ ...formData, region_id: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.region_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select a region</option>
                        {regions.map((region) => (
                          <option key={region.id} value={region.id}>
                            {region.name}
                          </option>
                        ))}
                      </select>
                      {errors.region_id && <p className="text-red-500 text-sm mt-1">{errors.region_id}</p>}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Description Field */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FileText className="w-4 h-4" />
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief description about the child"
                        rows={3}
                      />
                    </div>

                    {/* Bio Field */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FileText className="w-4 h-4" />
                        Bio
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Detailed biography"
                        rows={3}
                      />
                    </div>

                    {/* Video Link Field */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Video className="w-4 h-4" />
                        Video Link
                      </label>
                      <input
                        type="url"
                        value={formData.video_link}
                        onChange={(e) => setFormData({ ...formData, video_link: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/video"
                      />
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Upload className="w-4 h-4" />
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <span className="text-gray-700">Choose Image</span>
                    </label>
                    {imagePreview && (
                      <div className="relative w-20 h-20">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setFormData({ ...formData, picture_link: '' });
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({
                        name: '',
                        age: '',
                        school: '',
                        region_id: '',
                        description: '',
                        bio: '',
                        video_link: '',
                        picture_link: '',
                      });
                      setImagePreview('');
                      setErrors({});
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                  >
                    {submitting ? 'Adding...' : 'Add Child'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Children List */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Registered Children ({children.length})</h2>
            
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
                    <motion.div
                      key={child.id}
                      whileHover={{ scale: 1.02 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                    >
                      {child.picture_link && (
                        <div className="relative w-full h-40 mb-4">
                          <Image
                            src={child.picture_link}
                            alt={child.name}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <h3 className="font-semibold text-lg">{child.name}</h3>
                      <p className="text-gray-600">Age: {child.age}</p>
                      <p className="text-gray-600">School: {child.school}</p>
                      <p className="text-gray-600">Region: {region?.name || 'Unknown'}</p>
                      {child.description && (
                        <p className="text-gray-500 text-sm mt-2">{child.description}</p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
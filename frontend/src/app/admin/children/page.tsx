'use client';

import { useState, useEffect } from 'react';
import { childrenService } from '@/services/children.service';
import { regionService } from '@/services/region.service';
import { toast } from 'sonner';
import type { Child } from '@/types';

export default function ChildrenManagementPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'sponsored' | 'pending'>('all');
  const [regions, setRegions] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    grade: '',
    school: '',
    region_id: '',
    bio: '',
    story: '',
    interests: '',
    image_url: '',
    status: 'pending' as 'pending' | 'active' | 'sponsored',
  });

  useEffect(() => {
    loadChildren();
    loadRegions();
  }, []);

  const loadChildren = async () => {
    try {
      setLoading(true);
      const data = await childrenService.getAllChildren();
      setChildren(data);
    } catch (error) {
      console.error('Failed to load children:', error);
      toast.error('Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  const loadRegions = async () => {
    try {
      const data = await regionService.getAllRegions();
      setRegions(data);
    } catch (error) {
      console.error('Failed to load regions:', error);
    }
  };

  const handleAddChild = async () => {
    try {
      const childData = {
        ...formData,
        age: parseInt(formData.age),
        grade: formData.grade || 'K3',
      };
      await childrenService.createChild(childData);
      toast.success('Child added successfully');
      setShowAddModal(false);
      resetForm();
      await loadChildren();
    } catch (error) {
      console.error('Failed to add child:', error);
      toast.error('Failed to add child');
    }
  };

  const handleEditChild = async () => {
    if (!selectedChild) return;
    
    try {
      const childData = {
        ...formData,
        age: parseInt(formData.age),
      };
      await childrenService.updateChild(selectedChild.id, childData);
      toast.success('Child updated successfully');
      setShowEditModal(false);
      resetForm();
      await loadChildren();
    } catch (error) {
      console.error('Failed to update child:', error);
      toast.error('Failed to update child');
    }
  };

  const handleDeleteChild = async () => {
    if (!selectedChild) return;
    
    try {
      await childrenService.deleteChild(selectedChild.id);
      toast.success('Child deleted successfully');
      setShowDeleteModal(false);
      setSelectedChild(null);
      await loadChildren();
    } catch (error) {
      console.error('Failed to delete child:', error);
      toast.error('Failed to delete child');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      grade: '',
      school: '',
      region_id: '',
      bio: '',
      story: '',
      interests: '',
      image_url: '',
      status: 'pending',
    });
    setSelectedChild(null);
  };

  const openEditModal = (child: Child) => {
    setSelectedChild(child);
    setFormData({
      name: child.name,
      age: child.age.toString(),
      grade: child.grade || '',
      school: child.school || '',
      region_id: child.region_id || '',
      bio: child.bio || '',
      story: child.story || '',
      interests: child.interests || '',
      image_url: child.image_url || '',
      status: child.status || 'pending',
    });
    setShowEditModal(true);
  };

  const filteredChildren = children.filter(child => {
    const matchesSearch = 
      child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.school?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = filterRegion === 'all' || child.region_id === filterRegion;
    const matchesStatus = filterStatus === 'all' || child.status === filterStatus;
    
    return matchesSearch && matchesRegion && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      sponsored: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Children Management
          </h1>
          <p className="text-gray-600">
            Manage children profiles and sponsorship status
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Child
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">{children.length}</div>
          <div className="text-sm text-gray-600 mt-1">Total Children</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {children.filter(c => c.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Active</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">
            {children.filter(c => c.status === 'sponsored').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Sponsored</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {children.filter(c => c.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Pending</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search by name or school..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[300px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Regions</option>
          {regions.map(region => (
            <option key={region.id} value={region.id}>{region.name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="sponsored">Sponsored</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Children Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredChildren.map((child) => (
          <div key={child.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="aspect-w-4 aspect-h-3 bg-gray-200">
              {child.image_url ? (
                <img
                  src={child.image_url}
                  alt={child.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{child.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(child.status || 'pending')}`}>
                  {child.status || 'pending'}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Age: {child.age} years</p>
                <p>Grade: {child.grade || 'K3'}</p>
                {child.school && <p>School: {child.school}</p>}
                {child.region_name && <p>Region: {child.region_name}</p>}
              </div>
              {child.bio && (
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                  {child.bio}
                </p>
              )}
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => openEditModal(child)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setSelectedChild(child);
                    setShowDeleteModal(true);
                  }}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredChildren.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-2 text-gray-500">No children found matching your filters</p>
        </div>
      )}

      {/* Add/Edit Child Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              {showAddModal ? 'Add New Child' : 'Edit Child'}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade
                  </label>
                  <input
                    type="text"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="K3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School
                  </label>
                  <input
                    type="text"
                    value={formData.school}
                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Region
                  </label>
                  <select
                    value={formData.region_id}
                    onChange={(e) => setFormData({ ...formData, region_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Region</option>
                    {regions.map(region => (
                      <option key={region.id} value={region.id}>{region.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="sponsored">Sponsored</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Story
                </label>
                <textarea
                  value={formData.story}
                  onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interests
                </label>
                <input
                  type="text"
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Reading, Drawing, Sports..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={showAddModal ? handleAddChild : handleEditChild}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {showAddModal ? 'Add Child' : 'Update Child'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedChild && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Delete Child Profile
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{selectedChild.name}'s</strong> profile? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedChild(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteChild}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Child
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
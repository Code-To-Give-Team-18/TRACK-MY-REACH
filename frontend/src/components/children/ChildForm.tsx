'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, School as SchoolIcon, MapPin, FileText } from 'lucide-react';
import { type Region } from '@/services/regions.service';
import { childrenService } from '@/services/children.service';
import { fileService } from '@/services/file.service';
import ImageUpload from './ImageUpload';
import VideoUpload from './VideoUpload';

interface ChildFormProps {
  regions: Region[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ChildForm({ regions, onSuccess, onCancel }: ChildFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [useVideoFile, setUseVideoFile] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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
      
      let pictureLink = formData.picture_link || '';
      let videoLinkFinal = '';
      
      if (selectedImage) {
        setUploadingImage(true);
        try {
          const uploadResponse = await fileService.uploadFile(selectedImage);
          pictureLink = `/api/v1/files/${uploadResponse.id}/content`;
        } catch (error) {
          console.error('Error uploading image:', error);
        } finally {
          setUploadingImage(false);
        }
      }
      
      if (useVideoFile && selectedVideo) {
        setUploadingVideo(true);
        try {
          const uploadResponse = await fileService.uploadVideo(selectedVideo);
          videoLinkFinal = `/api/v1/files/video/${uploadResponse.id}/stream`;
        } catch (error) {
          console.error('Error uploading video:', error);
        } finally {
          setUploadingVideo(false);
        }
      } else if (!useVideoFile && formData.video_link) {
        videoLinkFinal = formData.video_link;
      }
      
      await childrenService.createChild({
        name: formData.name,
        age: parseInt(formData.age),
        school: formData.school,
        region_id: formData.region_id,
        picture_link: pictureLink,
        grade: '',
        description: formData.description || '',
        bio: formData.bio || '',
        video_link: videoLinkFinal,
      });

      onSuccess();
    } catch (error) {
      console.error('Failed to create child:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, picture_link: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setImagePreview('');
    setSelectedImage(null);
    setFormData({ ...formData, picture_link: '' });
  };
  
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        alert('Please select a valid video file');
        return;
      }
      
      if (file.size > 100 * 1024 * 1024) {
        alert('Video size should be less than 100MB');
        return;
      }

      setSelectedVideo(file);
      const videoUrl = URL.createObjectURL(file);
      setVideoPreview(videoUrl);
    }
  };

  const removeVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setSelectedVideo(null);
    setVideoPreview(null);
  };

  const handleToggleVideoMode = (useFile: boolean) => {
    setUseVideoFile(useFile);
    if (useFile) {
      setFormData({ ...formData, video_link: '' });
    } else {
      removeVideo();
    }
  };

  const handleCancel = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    onCancel();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-xl p-8 mb-8"
    >
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add New Child</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
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

          <div className="space-y-4">
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

            <VideoUpload
              useVideoFile={useVideoFile}
              videoPreview={videoPreview}
              selectedVideo={selectedVideo}
              videoLink={formData.video_link}
              onToggleMode={handleToggleVideoMode}
              onVideoSelect={handleVideoSelect}
              onVideoRemove={removeVideo}
              onVideoLinkChange={(link) => setFormData({ ...formData, video_link: link })}
            />
          </div>
        </div>

        <ImageUpload
          imagePreview={imagePreview}
          onImageChange={handleImageChange}
          onImageRemove={handleImageRemove}
        />

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            {uploadingImage ? 'Uploading Image...' : uploadingVideo ? 'Uploading Video...' : submitting ? 'Adding...' : 'Add Child'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
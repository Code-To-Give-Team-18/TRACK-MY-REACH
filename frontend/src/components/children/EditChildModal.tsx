'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { childrenService, type UpdateChildData } from '@/services/children.service';
import { fileService } from '@/services/file.service';
import { type Region } from '@/services/regions.service';
import { type Child } from './ChildCard';
import { getBackendUrl } from '@/utils/url.utils';
import ImageUpload from './ImageUpload';
import VideoUpload from './VideoUpload';

interface EditChildModalProps {
  child: Child;
  regions: Region[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditChildModal({ 
  child, 
  regions, 
  isOpen, 
  onClose, 
  onSuccess 
}: EditChildModalProps) {
  const [formData, setFormData] = useState<UpdateChildData>({
    name: child.name,
    age: child.age,
    school: child.school,
    region_id: child.region_id,
    description: child.description,
    bio: child.bio,
    video_link: child.video_link,
    picture_link: child.picture_link,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Image states
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [keepExistingImage, setKeepExistingImage] = useState(true);
  
  // Video states
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [useVideoFile, setUseVideoFile] = useState(false);
  const [keepExistingVideo, setKeepExistingVideo] = useState(true);

  useEffect(() => {
    setFormData({
      name: child.name,
      age: child.age,
      school: child.school,
      region_id: child.region_id,
      description: child.description,
      bio: child.bio,
      video_link: child.video_link,
      picture_link: child.picture_link,
    });
    
    // Reset states when child changes
    setImagePreview('');
    setSelectedImage(null);
    setKeepExistingImage(true);
    setSelectedVideo(null);
    setVideoPreview(null);
    setKeepExistingVideo(true);
    setUseVideoFile(false);
  }, [child]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let updateData = { ...formData };
      
      // Handle image upload if new image selected
      if (!keepExistingImage && selectedImage) {
        setUploadingImage(true);
        try {
          const uploadResponse = await fileService.uploadFile(selectedImage);
          updateData.picture_link = `/api/v1/files/${uploadResponse.id}/content`;
        } catch (error) {
          console.error('Error uploading image:', error);
        } finally {
          setUploadingImage(false);
        }
      } else if (!keepExistingImage && !selectedImage) {
        // User removed image without adding new one
        updateData.picture_link = '';
      }
      
      // Handle video upload if new video selected
      if (!keepExistingVideo) {
        if (useVideoFile && selectedVideo) {
          setUploadingVideo(true);
          try {
            const uploadResponse = await fileService.uploadVideo(selectedVideo);
            updateData.video_link = `/api/v1/files/video/${uploadResponse.id}/stream`;
          } catch (error) {
            console.error('Error uploading video:', error);
          } finally {
            setUploadingVideo(false);
          }
        } else if (!useVideoFile) {
          // Use the URL from form
          updateData.video_link = formData.video_link || '';
        } else {
          // User removed video without adding new one
          updateData.video_link = '';
        }
      }
      
      await childrenService.updateChild(child.id, updateData);
      onSuccess();
    } catch (err) {
      setError('Failed to update child information');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || undefined : value
    }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
      setKeepExistingImage(false);
    }
  };

  const handleImageRemove = () => {
    setImagePreview('');
    setSelectedImage(null);
    setKeepExistingImage(false);
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
      setKeepExistingVideo(false);
    }
  };

  const removeVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setSelectedVideo(null);
    setVideoPreview(null);
    setKeepExistingVideo(false);
  };

  const handleToggleVideoMode = (useFile: boolean) => {
    setUseVideoFile(useFile);
    if (useFile) {
      setFormData({ ...formData, video_link: '' });
    } else {
      removeVideo();
    }
    setKeepExistingVideo(false);
  };
  
  const existingPictureUrl = child.picture_link ? getBackendUrl(child.picture_link) : null;
  const existingVideoUrl = child.video_link ? getBackendUrl(child.video_link) : null;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Edit Child Information</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age || ''}
                  onChange={handleChange}
                  min="1"
                  max="18"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Region *
                </label>
                <select
                  name="region_id"
                  value={formData.region_id || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a region</option>
                  {regions.map(region => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School
              </label>
              <input
                type="text"
                name="school"
                value={formData.school || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio || ''}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                
                {keepExistingImage && existingPictureUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <img 
                        src={existingPictureUrl} 
                        alt="Current picture" 
                        className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Current picture</p>
                        <button
                          type="button"
                          onClick={() => setKeepExistingImage(false)}
                          className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Change Picture
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <ImageUpload
                    imagePreview={imagePreview}
                    onImageChange={handleImageChange}
                    onImageRemove={handleImageRemove}
                  />
                )}
                
                {!keepExistingImage && existingPictureUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setKeepExistingImage(true);
                      handleImageRemove();
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 mt-2"
                  >
                    Keep existing picture
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video
                </label>
                
                {keepExistingVideo && existingVideoUrl ? (
                  <div className="space-y-3">
                    <video
                      src={existingVideoUrl}
                      controls
                      className="w-full h-32 bg-black rounded-lg"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setKeepExistingVideo(false)}
                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Change Video
                      </button>
                      <p className="text-sm text-gray-600 py-2">Current video</p>
                    </div>
                  </div>
                ) : (
                  <VideoUpload
                    useVideoFile={useVideoFile}
                    videoPreview={videoPreview}
                    selectedVideo={selectedVideo}
                    videoLink={formData.video_link || ''}
                    onToggleMode={handleToggleVideoMode}
                    onVideoSelect={handleVideoSelect}
                    onVideoRemove={removeVideo}
                    onVideoLinkChange={(link) => setFormData({ ...formData, video_link: link })}
                  />
                )}
                
                {!keepExistingVideo && existingVideoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setKeepExistingVideo(true);
                      removeVideo();
                      setFormData({ ...formData, video_link: child.video_link });
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 mt-2"
                  >
                    Keep existing video
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {uploadingImage ? 'Uploading Image...' : uploadingVideo ? 'Uploading Video...' : loading ? 'Updating...' : 'Update Child'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
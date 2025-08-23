'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Upload, X, Image as ImageIcon, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { postService } from '@/services/post.service';
import { childrenService, type Child } from '@/services/children.service';
import { fileService } from '@/services/file.service';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const postTypes = [
  { value: 'update', label: 'Update' },
  { value: 'story', label: 'Story' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'thank_you', label: 'Thank You' },
];

export default function CreatePostPage() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [caption, setCaption] = useState('');
  const [postType, setPostType] = useState('update');
  const [videoLink, setVideoLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  
  // Image upload states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch children on component mount
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const data = await childrenService.getAllChildren();
        setChildren(data);
        if (data.length > 0) {
          setSelectedChildId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching children:', error);
        setMessage('Failed to load children. Please refresh the page.');
        setMessageType('error');
      } finally {
        setLoadingChildren(false);
      }
    };
    fetchChildren();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage('Please select a valid image file');
        setMessageType('error');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setMessage('Image size should be less than 10MB');
        setMessageType('error');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChildId) {
      setMessage('Please select a child');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      let pictureLink: string | undefined;
      
      // Upload image if selected
      if (selectedImage) {
        setMessage('Uploading image...');
        setUploadingImage(true);
        try {
          const uploadResponse = await fileService.uploadFile(selectedImage);
          // Construct the URL to access the uploaded image
          pictureLink = `/api/v1/files/${uploadResponse.id}/content`;
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          setMessage('Failed to upload image, but continuing with post creation...');
          setMessageType('error');
        } finally {
          setUploadingImage(false);
        }
      }

      // Create the post
      setMessage('Creating post...');
      const postData = {
        child_id: selectedChildId,
        caption,
        picture_link: pictureLink,
        video_link: videoLink || undefined,
      };

      await postService.createPost(postData);
      
      setMessage('Post created successfully!');
      setMessageType('success');
      
      // Reset form
      setCaption('');
      setVideoLink('');
      setSelectedImage(null);
      setImagePreview(null);
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      
    } catch (err) {
      console.error('Error creating post:', err);
      setMessage('Error creating post. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  const selectedChild = children.find(c => c.id === selectedChildId);

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 min-h-screen">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-full mb-6"
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Create a New Post</span>
            </motion.div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Share Updates & Stories</h2>
            <p className="text-lg text-gray-600">Create a post to share a child's progress with donors</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
            {/* Child Selector */}
            <div>
              <label className="block font-medium mb-2 text-gray-700">Select Child</label>
              {loadingChildren ? (
                <div className="w-full border px-4 py-3 rounded-xl bg-gray-50 animate-pulse">
                  Loading children...
                </div>
              ) : children.length === 0 ? (
                <div className="w-full border px-4 py-3 rounded-xl bg-yellow-50 text-yellow-800">
                  No children found. Please add children first.
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={selectedChildId}
                    onChange={e => setSelectedChildId(e.target.value)}
                    required
                  >
                    {children.map(child => (
                      <option key={child.id} value={child.id}>
                        {child.name} {child.age && `(Age: ${child.age})`} {child.school && `- ${child.school}`}
                      </option>
                    ))}
                  </select>
                  
                  {/* Display selected child info */}
                  {selectedChild && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>{selectedChild.name}</strong>
                        {selectedChild.grade && ` • Grade: ${selectedChild.grade}`}
                        {selectedChild.school && ` • School: ${selectedChild.school}`}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Caption */}
            <div>
              <label className="block font-medium mb-2 text-gray-700">Caption / Story</label>
              <textarea
                className="w-full border px-4 py-3 rounded-xl min-h-[150px] focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                required
                placeholder="Share what's happening with this child... Their progress, achievements, or daily activities..."
              />
              <p className="text-sm text-gray-500 mt-1">
                This will be visible to donors following this child
              </p>
            </div>

            {/* Post Type */}
            <div>
              <label className="block font-medium mb-2 text-gray-700">Post Type</label>
              <select
                className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={postType}
                onChange={e => setPostType(e.target.value)}
              >
                {postTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block font-medium mb-2 text-gray-700">
                <ImageIcon className="w-4 h-4 inline mr-1" />
                Upload Image
              </label>
              
              {!imagePreview ? (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 cursor-pointer transition-colors bg-gray-50 hover:bg-orange-50"
                  >
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Click to upload an image</p>
                      <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border">
                  <div className="relative h-64 bg-gray-100">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Video Link (Optional) */}
            <div>
              <label className="block font-medium mb-2 text-gray-700">
                <Video className="w-4 h-4 inline mr-1" />
                Video Link (Optional)
              </label>
              <input
                type="url"
                className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={videoLink}
                onChange={e => setVideoLink(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or other video URL"
              />
              <p className="text-sm text-gray-500 mt-1">
                Add a YouTube or other video link to include with the post
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-4 text-lg font-semibold rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={loading || loadingChildren || children.length === 0}
            >
              {uploadingImage ? 'Uploading Image...' : loading ? 'Creating Post...' : 'Create Post'}
            </button>

            {/* Message Display */}
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-3 text-center rounded-lg ${
                  messageType === 'success' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {message}
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}
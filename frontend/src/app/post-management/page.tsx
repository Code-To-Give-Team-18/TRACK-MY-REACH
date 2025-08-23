'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Upload, X, Image as ImageIcon, Video, 
  Plus, Grid, Search, Filter 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { postService, type PostResponse, type CreatePostData } from '@/services/post.service';
import { childrenService, type Child } from '@/services/children.service';
import { fileService } from '@/services/file.service';
import Image from 'next/image';
import PostCard from '@/components/posts/PostCard';

const POST_TYPES = [
  { value: 'update', label: 'Update' },
  { value: 'story', label: 'Story' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'thank_you', label: 'Thank You' },
];

type ViewMode = 'list' | 'create';

export default function PostManagementPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPostType, setSelectedPostType] = useState('all');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  
  // Form states
  const [selectedChildId, setSelectedChildId] = useState('');
  const [caption, setCaption] = useState('');
  const [postType, setPostType] = useState('update');
  const [videoLink, setVideoLink] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [useVideoFile, setUseVideoFile] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      const data = await postService.getAllPosts({ sort: 'recent', page, limit: 12 });
      setPosts(prev => page === 1 ? data.items : [...prev, ...data.items]);
      setHasMore(data.has_next);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setMessage('Failed to load posts. Please refresh the page.');
      setMessageType('error');
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchChildren = async () => {
    try {
      const data = await childrenService.getAllChildren();
      setChildren(data);
      if (data.length > 0 && !selectedChildId) {
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

  const handleDelete = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    setMessage('Post deleted successfully!');
    setMessageType('success');
  };

  const resetForm = () => {
    setCaption('');
    setVideoLink('');
    setSelectedImage(null);
    setImagePreview(null);
    setSelectedVideo(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null);
    setPostType('update');
    if (children.length > 0) setSelectedChildId(children[0].id);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = type === 'image';
    const validType = isImage ? file.type.startsWith('image/') : file.type.startsWith('video/');
    const maxSize = isImage ? 10 : 100;
    
    if (!validType) {
      setMessage(`Please select a valid ${type} file`);
      setMessageType('error');
      return;
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      setMessage(`${isImage ? 'Image' : 'Video'} size should be less than ${maxSize}MB`);
      setMessageType('error');
      return;
    }

    if (isImage) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setSelectedVideo(file);
      setVideoPreview(URL.createObjectURL(file));
    }
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
      let videoLinkFinal: string | undefined;
      
      if (selectedImage) {
        setMessage('Uploading image...');
        const uploadResponse = await fileService.uploadFile(selectedImage);
        pictureLink = `/api/v1/files/${uploadResponse.id}/content`;
      }
      
      if (useVideoFile && selectedVideo) {
        setMessage('Uploading video...');
        const uploadResponse = await fileService.uploadVideo(selectedVideo);
        videoLinkFinal = `/api/v1/files/video/${uploadResponse.id}/stream`;
      } else if (!useVideoFile && videoLink) {
        videoLinkFinal = videoLink;
      }

      const postData: CreatePostData = {
        child_id: selectedChildId,
        caption,
        picture_link: pictureLink,
        video_link: videoLinkFinal,
      };

      setMessage('Creating post...');
      const newPost = await postService.createPost(postData);
      setPosts(prev => [newPost, ...prev]);
      setMessage('Post created successfully!');
      setMessageType('success');
      resetForm();
      setViewMode('list');
    } catch (err) {
      console.error('Error creating post:', err);
      setMessage('Error creating post. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.child_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedPostType === 'all' || post.post_type === selectedPostType;
    return matchesSearch && matchesType;
  });

  const selectedChild = children.find(c => c.id === selectedChildId);

  const MediaUpload = ({ type }: { type: 'image' | 'video' }) => {
    const isImage = type === 'image';
    const hasPreview = isImage ? imagePreview : videoPreview;
    const file = isImage ? selectedImage : selectedVideo;
    
    return (
      <div>
        <label className="block font-medium mb-2 text-gray-700">
          {isImage ? <ImageIcon className="w-4 h-4 inline mr-1" /> : <Video className="w-4 h-4 inline mr-1" />}
          Upload {isImage ? 'Image' : 'Video'} {!isImage && '(Optional)'}
        </label>
        
        {!isImage && (
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => { setUseVideoFile(true); setVideoLink(''); }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                useVideoFile ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Upload Video File
            </button>
            <button
              type="button"
              onClick={() => { setUseVideoFile(false); if (videoPreview) { URL.revokeObjectURL(videoPreview); setVideoPreview(null); setSelectedVideo(null); } }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !useVideoFile ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Use Video URL
            </button>
          </div>
        )}
        
        {(!isImage && !useVideoFile) ? (
          <>
            <input
              type="url"
              className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={videoLink}
              onChange={e => setVideoLink(e.target.value)}
              placeholder="https://youtube.com/watch?v=... or other video URL"
            />
            <p className="text-sm text-gray-500 mt-1">Add a YouTube or other video link</p>
          </>
        ) : !hasPreview ? (
          <div className="relative">
            <input
              type="file"
              accept={`${type}/*`}
              onChange={e => handleFileSelect(e, type)}
              className="hidden"
              id={`${type}-upload`}
            />
            <label
              htmlFor={`${type}-upload`}
              className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 cursor-pointer transition-colors bg-gray-50 hover:bg-orange-50"
            >
              <div className="text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Click to upload {isImage ? 'an image' : 'a video'}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {isImage ? 'PNG, JPG up to 10MB' : 'MP4, WebM, MOV up to 100MB'}
                </p>
              </div>
            </label>
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden border">
            {isImage ? (
              imagePreview && (
                <div className="relative h-64 bg-gray-100">
                  <Image src={imagePreview} alt="Preview" fill className="object-contain" />
                </div>
              )
            ) : (
              <>
                {videoPreview && <video src={videoPreview} controls className="w-full h-64 bg-black" />}
                {file && (
                  <div className="p-2 bg-gray-100 text-sm text-gray-600">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </>
            )}
            <button
              type="button"
              onClick={() => {
                if (isImage) {
                  setSelectedImage(null);
                  setImagePreview(null);
                } else {
                  if (videoPreview) URL.revokeObjectURL(videoPreview);
                  setSelectedVideo(null);
                  setVideoPreview(null);
                }
              }}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 min-h-screen">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-full mb-6"
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Post Management</span>
            </motion.div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Manage Your Posts</h2>
            <p className="text-lg text-gray-600">Create, edit, and manage posts for children</p>
          </div>

          {/* View Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 rounded-full p-1 inline-flex">
              {[
                { mode: 'list' as ViewMode, icon: Grid, label: 'View Posts' },
                { mode: 'create' as ViewMode, icon: Plus, label: 'Create Post' }
              ].map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => { setViewMode(mode); if (mode === 'list') resetForm(); }}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    viewMode === mode 
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md transform scale-105' 
                      : 'text-gray-600 hover:text-gray-900 bg-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 inline mr-2" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Message Display */}
          <AnimatePresence>
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-6 p-4 text-center rounded-lg ${
                  messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          <AnimatePresence mode="wait">
            {viewMode === 'list' ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                {/* Search and Filter */}
                <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="text-gray-400 w-5 h-5" />
                      <select
                        value={selectedPostType}
                        onChange={(e) => setSelectedPostType(e.target.value)}
                        className="border px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="all">All Types</option>
                        {POST_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Posts Grid */}
                {loadingPosts && page === 1 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                        <div className="h-48 bg-gray-200 rounded-lg mb-4" />
                        <div className="h-4 bg-gray-200 rounded mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                    <p className="text-gray-500 text-lg mb-4">
                      {searchQuery || selectedPostType !== 'all' 
                        ? 'No posts found matching your criteria.' 
                        : 'No posts yet. Create your first post!'}
                    </p>
                    <button
                      onClick={() => setViewMode('create')}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-full hover:shadow-lg transition-shadow"
                    >
                      <Plus className="w-5 h-5" />
                      Create First Post
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredPosts.map(post => (
                        <PostCard key={post.id} post={post} onDelete={handleDelete} />
                      ))}
                    </div>
                    {hasMore && !loadingPosts && (
                      <div className="text-center mt-8">
                        <button
                          onClick={() => setPage(prev => prev + 1)}
                          className="bg-white text-gray-700 px-6 py-3 rounded-full border hover:shadow-lg transition-shadow"
                        >
                          Load More Posts
                        </button>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="max-w-2xl mx-auto"
              >
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Create New Post</h3>

                  {/* Child Selector */}
                  <div>
                    <label className="block font-medium mb-2 text-gray-700">Select Child</label>
                    {loadingChildren ? (
                      <div className="w-full border px-4 py-3 rounded-xl bg-gray-50 animate-pulse">Loading children...</div>
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
                    <p className="text-sm text-gray-500 mt-1">This will be visible to donors following this child</p>
                  </div>

                  {/* Post Type */}
                  <div>
                    <label className="block font-medium mb-2 text-gray-700">Post Type</label>
                    <select
                      className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      value={postType}
                      onChange={e => setPostType(e.target.value)}
                    >
                      {POST_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <MediaUpload type="image" />
                  <MediaUpload type="video" />

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => { setViewMode('list'); resetForm(); }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-4 text-lg font-semibold rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-4 text-lg font-semibold rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      disabled={loading || loadingChildren || children.length === 0}
                    >
                      {loading ? 'Saving...' : 'Create Post'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
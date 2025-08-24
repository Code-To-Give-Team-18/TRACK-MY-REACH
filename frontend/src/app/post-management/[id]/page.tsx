'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Save, Trash2, Image as ImageIcon, Video, 
  Upload, X, Calendar, User, Eye, Edit3, AlertCircle, Expand, ChevronLeft, ChevronRight, Youtube
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { postService, type PostResponse, type CreatePostData } from '@/services/post.service';
import { childrenService, type Child } from '@/services/children.service';
import { fileService } from '@/services/file.service';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import YouTubeUploadButton from '@/components/posts/YouTubeUploadButton';
import { getBackendUrl } from '@/utils/url.utils';

const postTypes = [
  { value: 'update', label: 'Update' },
  { value: 'story', label: 'Story' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'thank_you', label: 'Thank You' },
];

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  
  const [isEditing, setIsEditing] = useState(false);
  const [post, setPost] = useState<PostResponse | null>(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  
  // Form states
  const [selectedChildId, setSelectedChildId] = useState('');
  const [caption, setCaption] = useState('');
  const [postType, setPostType] = useState('update');
  const [videoLink, setVideoLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  
  // Image upload states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Video upload states
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [useVideoFile, setUseVideoFile] = useState(true);
  
  // Fullscreen image viewer states
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch post details
  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  // Fetch children for editing
  useEffect(() => {
    if (isEditing) {
      fetchChildren();
    }
  }, [isEditing]);

  const fetchPost = async () => {
    try {
      setLoadingPost(true);
      const data = await postService.getPost(postId);
      setPost(data);
      
      // Pre-fill form data
      setSelectedChildId(data.child_id);
      setCaption(data.caption || '');
      setPostType(data.post_type || 'update');
      setVideoLink(data.video_link || '');
    } catch (error) {
      console.error('Error fetching post:', error);
      setMessage('Failed to load post. Please try again.');
      setMessageType('error');
    } finally {
      setLoadingPost(false);
    }
  };

  const fetchChildren = async () => {
    try {
      const data = await childrenService.getAllChildren();
      setChildren(data);
    } catch (error) {
      console.error('Error fetching children:', error);
      setMessage('Failed to load children data.');
      setMessageType('error');
    } finally {
      setLoadingChildren(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage('Please select a valid image file');
        setMessageType('error');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setMessage('Image size should be less than 10MB');
        setMessageType('error');
        return;
      }

      setSelectedImage(file);
      
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

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setMessage('Please select a valid video file');
        setMessageType('error');
        return;
      }
      
      if (file.size > 100 * 1024 * 1024) {
        setMessage('Video size should be less than 100MB');
        setMessageType('error');
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!post) return;

    setLoading(true);
    setMessage('');
    
    try {
      let pictureLink: string | undefined = post.media_urls?.[0];
      let videoLinkFinal: string | undefined = post.video_link;
      
      // Upload new image if selected
      if (selectedImage) {
        setMessage('Uploading image...');
        setUploadingImage(true);
        try {
          const uploadResponse = await fileService.uploadFile(selectedImage);
          pictureLink = `/api/v1/files/${uploadResponse.id}/content`;
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          setMessage('Failed to upload image');
          setMessageType('error');
          return;
        } finally {
          setUploadingImage(false);
        }
      }
      
      // Upload new video if selected
      if (useVideoFile && selectedVideo) {
        setMessage('Uploading video...');
        setUploadingVideo(true);
        try {
          const uploadResponse = await fileService.uploadVideo(selectedVideo);
          videoLinkFinal = `/api/v1/files/video/${uploadResponse.id}/stream`;
        } catch (uploadError) {
          console.error('Error uploading video:', uploadError);
          setMessage('Failed to upload video');
          setMessageType('error');
          return;
        } finally {
          setUploadingVideo(false);
        }
      } else if (!useVideoFile && videoLink) {
        videoLinkFinal = videoLink;
      }

      // Update the post
      const postData: CreatePostData = {
        child_id: selectedChildId,
        caption,
        picture_link: pictureLink,
        video_link: videoLinkFinal,
      };

      setMessage('Updating post...');
      const updated = await postService.updatePost(post.id, postData);
      setPost(updated);
      setMessage('Post updated successfully!');
      setMessageType('success');
      setIsEditing(false);
      
      // Clear uploaded files
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedVideo(null);
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
      setVideoPreview(null);
      
    } catch (err) {
      console.error('Error updating post:', err);
      setMessage('Error updating post. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
      setUploadingImage(false);
      setUploadingVideo(false);
    }
  };

  const handleDelete = async () => {
    if (!post || !confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await postService.deletePost(post.id);
      setMessage('Post deleted successfully!');
      setMessageType('success');
      setTimeout(() => {
        router.push('/post-management');
      }, 1500);
    } catch (error) {
      console.error('Error deleting post:', error);
      setMessage('Failed to delete post. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const selectedChild = children.find(c => c.id === selectedChildId);

  // Fullscreen image viewer functions
  const openFullscreen = (imageUrl: string, index: number = 0) => {
    setFullscreenImage(imageUrl);
    setCurrentImageIndex(index);
  };

  const closeFullscreen = () => {
    setFullscreenImage(null);
  };

  const navigateImage = (direction: 'next' | 'prev') => {
    if (!post?.media_urls) return;
    
    let newIndex = currentImageIndex;
    if (direction === 'next') {
      newIndex = (currentImageIndex + 1) % post.media_urls.length;
    } else {
      newIndex = currentImageIndex === 0 ? post.media_urls.length - 1 : currentImageIndex - 1;
    }
    
    setCurrentImageIndex(newIndex);
    setFullscreenImage(`${process.env.NEXT_PUBLIC_API_URL}${post.media_urls[newIndex]}`);
  };

  if (loadingPost) {
    return (
      <section className="py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h2>
              <p className="text-gray-600 mb-6">The post you're looking for doesn't exist or has been removed.</p>
              <Link 
                href="/post-management"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full hover:shadow-lg transition-shadow"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Posts
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 min-h-screen">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <Link 
              href="/post-management"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Posts
            </Link>
            
            {!isEditing && (
              <div className="flex gap-3">
                <YouTubeUploadButton 
                  postId={post.id}
                  hasVideo={!!post.video_link}
                  youtubeUrl={post.youtube_url}
                />
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Post
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Message Display */}
          <AnimatePresence>
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-6 p-4 rounded-lg ${
                  messageType === 'success' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {isEditing ? (
              // Edit Form
              <form onSubmit={handleUpdate} className="p-8 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Post</h2>

                {/* Child Selector */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">Child</label>
                  <select
                    className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={selectedChildId}
                    onChange={e => setSelectedChildId(e.target.value)}
                    required
                    disabled={loadingChildren}
                  >
                    {children.map(child => (
                      <option key={child.id} value={child.id}>
                        {child.name} {child.age && `(Age: ${child.age})`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Caption */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">Caption / Story</label>
                  <textarea
                    className="w-full border px-4 py-3 rounded-xl min-h-[150px] focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    required
                    placeholder="Share what's happening with this child..."
                  />
                </div>

                {/* Post Type */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">Post Type</label>
                  <select
                    className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    Update Image (Optional)
                  </label>
                  
                  {post.media_urls && post.media_urls.length > 0 && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Current images (click to view fullscreen):</p>
                      <div className="flex gap-2 flex-wrap">
                        {post.media_urls.map((url, index) => (
                          <div 
                            key={index} 
                            className="relative h-32 w-32 rounded overflow-hidden border border-gray-200 cursor-pointer group"
                            onClick={() => openFullscreen(url ? getBackendUrl(url) : '', index)}
                          >
                            <Image
                              src={url ? getBackendUrl(url) : ''}
                              alt={`Current image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                              <Expand className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
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
                        className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 cursor-pointer transition-colors bg-gray-50 hover:bg-green-50"
                      >
                        <div className="text-center">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">Click to upload a new image</p>
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

                {/* Video Upload or Link */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    <Video className="w-4 h-4 inline mr-1" />
                    Update Video (Optional)
                  </label>
                  
                  {post.video_link && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Current video:</p>
                      {post.video_link.includes('youtube.com') || post.video_link.includes('youtu.be') ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-black max-w-md">
                          <iframe
                            src={post.video_link.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                            className="absolute inset-0 w-full h-full"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <video
                          src={`${process.env.NEXT_PUBLIC_API_URL}${post.video_link}`}
                          controls
                          className="w-full max-w-md rounded-lg"
                        />
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        setUseVideoFile(true);
                        setVideoLink('');
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        useVideoFile 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Upload Video File
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUseVideoFile(false);
                        removeVideo();
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        !useVideoFile 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Use Video URL
                    </button>
                  </div>
                  
                  {useVideoFile ? (
                    !videoPreview ? (
                      <div className="relative">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoSelect}
                          className="hidden"
                          id="video-upload"
                        />
                        <label
                          htmlFor="video-upload"
                          className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 cursor-pointer transition-colors bg-gray-50 hover:bg-green-50"
                        >
                          <div className="text-center">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">Click to upload a video</p>
                            <p className="text-sm text-gray-500 mt-1">MP4, WebM, MOV up to 100MB</p>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden border">
                        <video
                          src={videoPreview}
                          controls
                          className="w-full h-64 bg-black"
                        />
                        <button
                          type="button"
                          onClick={removeVideo}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  ) : (
                    <>
                      <input
                        type="url"
                        className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={videoLink}
                        onChange={e => setVideoLink(e.target.value)}
                        placeholder="https://youtube.com/watch?v=... or other video URL"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Add a YouTube or other video link
                      </p>
                      
                      {/* Preview YouTube/Video URL */}
                      {videoLink && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700 mb-2">Preview:</p>
                          {videoLink.includes('youtube.com') || videoLink.includes('youtu.be') ? (
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-black max-w-md">
                              <iframe
                                src={videoLink.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                                className="absolute inset-0 w-full h-full"
                                allowFullScreen
                              />
                            </div>
                          ) : (
                            <p className="text-sm text-gray-600">Preview not available for this URL type</p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setMessage('');
                      // Reset form
                      setCaption(post.caption || '');
                      setPostType(post.post_type || 'update');
                      setVideoLink(post.video_link || '');
                      removeImage();
                      removeVideo();
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 font-semibold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 font-semibold rounded-xl transition-all disabled:opacity-50"
                    disabled={loading || uploadingImage || uploadingVideo}
                  >
                    {uploadingImage ? 'Uploading Image...' : uploadingVideo ? 'Uploading Video...' : loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              // View Mode
              <>
                {/* Post Image(s) */}
                {(post.media_urls && post.media_urls.length > 0) && (
                  <div className={`${post.media_urls.length === 1 ? 'relative h-96' : 'grid grid-cols-2 gap-2 p-2'} bg-gray-100`}>
                    {post.media_urls.length === 1 ? (
                      <div 
                        className="relative h-full cursor-pointer group"
                        onClick={() => openFullscreen(post.media_urls[0] ? getBackendUrl(post.media_urls[0]) : '', 0)}
                      >
                        <Image
                          src={post.media_urls[0] ? getBackendUrl(post.media_urls[0]) : ''}
                          alt={post.caption || 'Post image'}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Expand className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8" />
                        </div>
                      </div>
                    ) : (
                      post.media_urls.map((url, index) => (
                        <div 
                          key={index} 
                          className="relative h-64 bg-gray-200 rounded overflow-hidden cursor-pointer group"
                          onClick={() => openFullscreen(url ? getBackendUrl(url) : '', index)}
                        >
                          <Image
                            src={url ? getBackendUrl(url) : ''}
                            alt={`Post image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Expand className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Post Details */}
                <div className="p-8">
                  {/* Meta Information */}
                  <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{post.child_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{post.created_at ? new Date(post.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {postTypes.find(t => t.value === post.post_type)?.label || 'Update'}
                    </div>
                  </div>

                  {/* Caption */}
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{post.caption}</p>
                  </div>

                  {/* Video */}
                  {post.video_link && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Video className="w-5 h-5" />
                        Video
                      </h3>
                      {post.video_link.includes('youtube.com') || post.video_link.includes('youtu.be') ? (
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                          <iframe
                            src={post.video_link.replace('watch?v=', 'embed/')}
                            className="absolute inset-0 w-full h-full"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <video
                          src={`${process.env.NEXT_PUBLIC_API_URL}${post.video_link}`}
                          controls
                          className="w-full rounded-xl"
                        />
                      )}
                    </div>
                  )}

                  {/* YouTube Link */}
                  {post.youtube_url && (
                    <div className="mt-6 p-4 bg-red-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Youtube className="w-6 h-6 text-red-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">This post is on YouTube!</p>
                            <p className="text-xs text-gray-600">Shared for maximum donor reach</p>
                          </div>
                        </div>
                        <a 
                          href={post.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:text-red-700 text-sm font-medium underline"
                        >
                          Watch on YouTube →
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Author Info */}
                  {post.author_name && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Posted by <span className="font-medium">{post.author_name}</span>
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Fullscreen Image Viewer */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeFullscreen}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeFullscreen();
              }}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {post?.media_urls && post.media_urls.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('prev');
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('next');
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <Image
                src={fullscreenImage}
                alt="Fullscreen view"
                width={1920}
                height={1080}
                className="object-contain max-w-full max-h-[90vh]"
              />
              {post?.media_urls && post.media_urls.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {post.media_urls.length}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
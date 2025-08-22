'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { postService } from '@/services/post.service';

const postTypes = [
  { value: 'update', label: 'Update' },
  { value: 'story', label: 'Story' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'thank_you', label: 'Thank You' },
];

export default function CreatePostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('update');
  const [mediaUrls, setMediaUrls] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [childId, setChildId] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // TODO: Fetch children and authors for dropdowns if needed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await postService.createPost({
        child_id: childId,
        author_id: authorId,
        title,
        content,
        post_type: postType,
        media_urls: mediaUrls,
        video_link: videoLink,
        is_published: isPublished,
        is_featured: isFeatured,
      });
      setMessage('Post created successfully!');
      // ...reset form...
    } catch (err) {
      setMessage('Error creating post.');
    }
    setLoading(false);
  };

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
            <p className="text-lg text-gray-600">Fill out the form below to publish a new post for a child.</p>
          </div>
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
            <div>
              <label className="block font-medium mb-1">Child ID</label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded"
                value={childId}
                onChange={e => setChildId(e.target.value)}
                required
                placeholder="Enter Child ID"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Author ID</label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded"
                value={authorId}
                onChange={e => setAuthorId(e.target.value)}
                required
                placeholder="Enter Author ID"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Title</label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                placeholder="Post Title"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Content</label>
              <textarea
                className="w-full border px-3 py-2 rounded"
                value={content}
                onChange={e => setContent(e.target.value)}
                required
                placeholder="Write your post content here..."
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Post Type</label>
              <select
                className="w-full border px-3 py-2 rounded"
                value={postType}
                onChange={e => setPostType(e.target.value)}
              >
                {postTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Media URLs (comma separated)</label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded"
                value={mediaUrls}
                onChange={e => setMediaUrls(e.target.value)}
                placeholder="https://img1.jpg, https://img2.jpg"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Video Link</label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded"
                value={videoLink}
                onChange={e => setVideoLink(e.target.value)}
                placeholder="https://video-link.com"
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={e => setIsPublished(e.target.checked)}
                />
                <span>Published</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={e => setIsFeatured(e.target.checked)}
                />
                <span>Featured</span>
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-4 text-lg font-semibold rounded-xl"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Post'}
            </button>
            {message && <div className="mt-2 text-center text-green-600">{message}</div>}
          </form>
        </motion.div>
      </div>
    </section>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  author_id: string;
  category: 'story' | 'update' | 'event' | 'news';
  status: 'draft' | 'published' | 'archived';
  image_url?: string;
  tags?: string[];
  views: number;
  likes: number;
  created_at: Date;
  updated_at: Date;
  child_id?: string;
  child_name?: string;
  region_id?: string;
  region_name?: string;
}

export default function PostsManagementPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'story' as 'story' | 'update' | 'event' | 'news',
    status: 'draft' as 'draft' | 'published' | 'archived',
    image_url: '',
    tags: '',
    child_id: '',
    region_id: '',
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockPosts: Post[] = [
        {
          id: '1',
          title: 'Little Amy\'s Journey to Success',
          content: 'Amy, a K3 student from Sham Shui Po, has shown remarkable progress in her studies thanks to the support from our donors...',
          author: 'Sarah Chen',
          author_id: 'user1',
          category: 'story',
          status: 'published',
          image_url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400',
          tags: ['success', 'education', 'K3'],
          views: 1250,
          likes: 89,
          created_at: new Date('2024-01-15'),
          updated_at: new Date('2024-01-15'),
          child_name: 'Amy Wong',
          region_name: 'Sham Shui Po',
        },
        {
          id: '2',
          title: 'New School Partnership Announcement',
          content: 'We are excited to announce our partnership with three new schools in Kwun Tong district...',
          author: 'Project REACH Team',
          author_id: 'admin',
          category: 'news',
          status: 'published',
          views: 856,
          likes: 45,
          created_at: new Date('2024-01-10'),
          updated_at: new Date('2024-01-10'),
          region_name: 'Kwun Tong',
        },
        {
          id: '3',
          title: 'Annual Charity Gala 2024',
          content: 'Join us for our annual charity gala to support underprivileged children...',
          author: 'Events Team',
          author_id: 'admin2',
          category: 'event',
          status: 'draft',
          views: 0,
          likes: 0,
          created_at: new Date('2024-01-08'),
          updated_at: new Date('2024-01-08'),
        },
      ];
      setPosts(mockPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPost = async () => {
    try {
      // API call would go here
      toast.success('Post created successfully');
      setShowAddModal(false);
      resetForm();
      await loadPosts();
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error('Failed to create post');
    }
  };

  const handleEditPost = async () => {
    if (!selectedPost) return;
    
    try {
      // API call would go here
      toast.success('Post updated successfully');
      setShowEditModal(false);
      resetForm();
      await loadPosts();
    } catch (error) {
      console.error('Failed to update post:', error);
      toast.error('Failed to update post');
    }
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;
    
    try {
      // API call would go here
      toast.success('Post deleted successfully');
      setShowDeleteModal(false);
      setSelectedPost(null);
      await loadPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleStatusChange = async (postId: string, newStatus: string) => {
    try {
      // API call would go here
      toast.success(`Post ${newStatus === 'published' ? 'published' : 'updated'} successfully`);
      await loadPosts();
    } catch (error) {
      console.error('Failed to update post status:', error);
      toast.error('Failed to update post status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'story',
      status: 'draft',
      image_url: '',
      tags: '',
      child_id: '',
      region_id: '',
    });
    setSelectedPost(null);
  };

  const openEditModal = (post: Post) => {
    setSelectedPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      category: post.category,
      status: post.status,
      image_url: post.image_url || '',
      tags: post.tags?.join(', ') || '',
      child_id: post.child_id || '',
      region_id: post.region_id || '',
    });
    setShowEditModal(true);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryBadge = (category: string) => {
    const badges = {
      story: 'bg-purple-100 text-purple-800',
      update: 'bg-blue-100 text-blue-800',
      event: 'bg-green-100 text-green-800',
      news: 'bg-yellow-100 text-yellow-800',
    };
    return badges[category as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      archived: 'bg-red-100 text-red-800',
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
            Posts & Stories Management
          </h1>
          <p className="text-gray-600">
            Manage success stories, updates, and donor engagement content
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Post
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
          <div className="text-sm text-gray-600 mt-1">Total Posts</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {posts.filter(p => p.status === 'published').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Published</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-600">
            {posts.filter(p => p.status === 'draft').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Drafts</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">
            {posts.reduce((sum, p) => sum + p.views, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 mt-1">Total Views</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">
            {posts.reduce((sum, p) => sum + p.likes, 0)}
          </div>
          <div className="text-sm text-gray-600 mt-1">Total Likes</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search posts by title, content, or author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[300px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          <option value="story">Success Stories</option>
          <option value="update">Updates</option>
          <option value="event">Events</option>
          <option value="news">News</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Posts Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Post
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {post.image_url && (
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="h-10 w-10 rounded-lg object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">
                          {post.title}
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-1">
                          {post.content.substring(0, 60)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{post.author}</div>
                    {(post.child_name || post.region_name) && (
                      <div className="text-xs text-gray-500">
                        {post.child_name && `Child: ${post.child_name}`}
                        {post.child_name && post.region_name && ' • '}
                        {post.region_name && `${post.region_name}`}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getCategoryBadge(post.category)}`}>
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={post.status}
                      onChange={(e) => handleStatusChange(post.id, e.target.value)}
                      className={`text-xs rounded px-2 py-1 border-0 ${getStatusBadge(post.status)}`}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3 text-sm">
                      <span className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {post.views.toLocaleString()}
                      </span>
                      <span className="flex items-center text-red-500">
                        <svg className="w-4 h-4 mr-1 fill-current" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        {post.likes}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{new Date(post.created_at).toLocaleDateString()}</div>
                    <div className="text-xs">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(post)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPosts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No posts found matching your filters
          </div>
        )}
      </div>

      {/* Add/Edit Post Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              {showAddModal ? 'Create New Post' : 'Edit Post'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="story">Success Story</option>
                    <option value="update">Update</option>
                    <option value="event">Event</option>
                    <option value="news">News</option>
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
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Featured Image URL
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
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={8}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="education, success, K3..."
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
                onClick={showAddModal ? handleAddPost : handleEditPost}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {showAddModal ? 'Create Post' : 'Update Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Delete Post
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<strong>{selectedPost.title}</strong>"? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPost(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
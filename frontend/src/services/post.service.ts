import { apiClient } from '@/lib/axios';

export interface CreatePostData {
  child_id: string;
  caption: string;
  picture_link?: string;
  video_link?: string;
}

export interface PostResponse {
  id: string;
  child_id: string;
  child_name?: string;
  author_id?: string;
  author_name?: string;
  title: string;
  caption?: string;
  comments: string;
  post_type: string;
  media_urls?: string[];
  video_link?: string;
  likes: number;
  comments_count: number;
  is_published: boolean;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedPosts {
  items: PostResponse[];
  page: number;
  limit: number;
  has_next: boolean;
}

export const postService = {
  async createPost(data: CreatePostData): Promise<PostResponse> {
    const response = await apiClient.post('/posts', data);
    return response.data;
  },

  async getPosts(params?: { 
    sort?: 'recent' | 'likes'; 
    page?: number; 
    limit?: number 
  }): Promise<PaginatedPosts> {
    const response = await apiClient.get('/posts', { params });
    return response.data;
  },

  async getPostsByChild(childId: string, params?: { 
    page?: number; 
    limit?: number 
  }): Promise<PaginatedPosts> {
    const response = await apiClient.get(`/posts/child/${childId}`, { params });
    return response.data;
  },

  async getPostsByRegion(regionId: string, params?: {
    page?: number;
    limit?: number
  }): Promise<PaginatedPosts> {
    const response = await apiClient.get(`/posts/region/${regionId}`, { params });
    return response.data;
  },

  async getMostRecentPostByChild(childId: string): Promise<PostResponse> {
    const response = await apiClient.get(`/posts/child/${childId}/recent`);
    return response.data;
  },

  async deletePost(postId: string): Promise<boolean> {
    const response = await apiClient.delete(`/posts/${postId}`);
    return response.data;
  },
};

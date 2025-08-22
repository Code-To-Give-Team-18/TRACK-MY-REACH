import { apiClient } from '@/lib/axios';

export const postService = {
  async createPost(data) {
    const response = await apiClient.post('/posts', data);
    return response.data;
  },
};

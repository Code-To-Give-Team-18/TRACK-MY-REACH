import { apiClient } from '@/lib/axios';

export interface Child {
  id: string;
  name: string;
  age?: number;
  school?: string;
  grade?: string;
  description?: string;
  bio?: string;
  picture_link?: string;
  video_link?: string;
  region_id: string;
  follower_count: number;
}

export const childrenService = {
  async getAllChildren(): Promise<Child[]> {
    const response = await apiClient.get('/children');
    return response.data;
  },

  async getChildById(id: string): Promise<Child> {
    const response = await apiClient.get(`/children/${id}`);
    return response.data;
  },

  async getPopularChildren(limit = 3): Promise<Child[]> {
    const response = await apiClient.get(`/children/popular`, {
      params: { limit }
    });
    return response.data;
  },
};
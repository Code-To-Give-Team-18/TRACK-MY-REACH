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

export interface CreateChildData {
  region_id: string;
  name: string;
  age: number;
  school: string;
  grade: string;
  description?: string;
  bio?: string;
  video_link?: string;
  picture_link?: string;
}

export interface UpdateChildData {
  region_id?: string;
  name?: string;
  age?: number;
  school?: string;
  grade?: string;
  description?: string;
  bio?: string;
  video_link?: string;
  picture_link?: string;
}


export interface ChildResponse {
  id: string;
  region_id: string;
  name: string;
  age: number;
  school: string;
  grade: string;
  description?: string;
  bio?: string;
  video_link?: string;
  picture_link?: string;
}

export interface PaginatedChildren {
  items: ChildResponse[];
  page: number;
  limit: number;
  has_next: boolean;
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

  async createChild(data: CreateChildData): Promise<ChildResponse> {
    const response = await apiClient.post('/children/create', data);
    return response.data;
  },

  async getChildren(params?: { page?: number; limit?: number }): Promise<PaginatedChildren> {
    const response = await apiClient.get('/children', { params });
    return response.data;
  },

  async getChild(childId: string): Promise<ChildResponse> {
    const response = await apiClient.get(`/children/${childId}`);
    return response.data;
  },

  async updateChild(childId: string, data: UpdateChildData): Promise<Child> {
    const response = await apiClient.put(`/children/${childId}`, data);
    return response.data;
  },

  async deleteChild(childId: string): Promise<boolean> {
    const response = await apiClient.delete(`/children/${childId}`);
    return response.data;
  },
};

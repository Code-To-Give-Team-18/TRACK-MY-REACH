import { apiClient } from '@/lib/axios';
import { get } from 'http';

export interface Region {
  id: string;
  name: string;
}

export const regionService = {
  async getRegions(): Promise<Region[]> {
    const response = await apiClient.get('/regions');
    return response.data;
  },
};

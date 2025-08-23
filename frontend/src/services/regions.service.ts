import axios from '@/lib/axios';

export interface Region {
  id: string;
  name: string;
}

export interface RegionsResponse {
  regions: Region[];
}

class RegionsService {
  async getRegions(): Promise<Region[]> {
    try {
      const response = await axios.get<Region[]>('/regions/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch regions:', error);
      return [];
    }
  }

  async getRegionById(id: string): Promise<Region | null> {
    try {
      const response = await axios.get<Region>(`/regions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch region:', error);
      return null;
    }
  }
}

export const regionsService = new RegionsService();
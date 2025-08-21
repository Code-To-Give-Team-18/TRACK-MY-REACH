import { apiClient } from '@/lib/axios';

export interface ClassroomItem {
  id: string;
  name: string;
  type: string;
  state: 'needed' | 'funded';
  funded_by?: string;
  funded_date?: string;
  cost?: number;
}

export interface Classroom {
  id: string;
  name: string;
  school: string;
  district: string;
  students_count: number;
  funding_progress: number;
  needs_level: 'critical' | 'high' | 'medium' | 'low';
  total_donations: number;
  items: ClassroomItem[];
  created_at: string;
  updated_at: string;
}

export interface DonationImpact {
  id: string;
  user_id: string;
  classroom_id: string;
  amount: number;
  date: string;
  title: string;
  description: string;
  impact: string;
  items_funded: string[];
}

export interface ImpactSummary {
  total_donated: number;
  classrooms_supported: number;
  students_impacted: number;
  items_funded: number;
  total_visits: number;
  total_visit_time: number;
  recent_donations: DonationImpact[];
  impact_score: number;
}

export const classroomsApi = {
  getClassrooms: async (): Promise<Classroom[]> => {
    const { data } = await apiClient.get('/classrooms');
    return data;
  },

  getClassroom: async (classroomId: string): Promise<Classroom> => {
    const { data } = await apiClient.get(`/classrooms/${classroomId}`);
    return data;
  },

  getClassroomItems: async (classroomId: string, state?: string): Promise<ClassroomItem[]> => {
    const params = state ? { state } : {};
    const { data } = await apiClient.get(`/classrooms/${classroomId}/items`, { params });
    return data;
  },

  donateToClassroom: async (
    classroomId: string,
    amount: number,
    itemIds: string[],
    message?: string
  ) => {
    const { data } = await apiClient.post(`/classrooms/${classroomId}/donate`, {
      amount,
      item_ids: itemIds,
      message,
    });
    return data;
  },

  getUserDonations: async (userId: string): Promise<DonationImpact[]> => {
    const { data } = await apiClient.get(`/donations/user/${userId}`);
    return data;
  },

  trackClassroomVisit: async (
    classroomId: string,
    durationSeconds: number,
    interactions: string[]
  ) => {
    const { data } = await apiClient.post(`/classrooms/${classroomId}/visit`, {
      duration_seconds: durationSeconds,
      interactions,
    });
    return data;
  },

  getImpactSummary: async (userId: string): Promise<ImpactSummary> => {
    const { data } = await apiClient.get(`/impact/summary/${userId}`);
    return data;
  },
};
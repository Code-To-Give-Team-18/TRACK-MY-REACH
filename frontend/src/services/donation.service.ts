import { apiClient } from '@/lib/axios';

export interface QuickDonationData {
  amount: number;
  currency?: string;
  payment_method?: string;
  transaction_id?: string;
}
export interface LeaderboardDonor {
  id: string;
  name: string;
  amount: number;
  region?: string;
  child_id?: string;
}
export interface GuestDonationData {
  child_id: string;
  amount: number;
  currency?: string;
  payment_method?: string;
  transaction_id?: string;
}

export interface StandardDonationData {
  user_id: string;
  child_id: string;
  amount: number;
  currency?: string;
  payment_method?: string;
  transaction_id?: string;
  referral_code?: string;
}

export interface DonationResponse {
  id: string;
  user_id?: string;
  user_name?: string;
  child_id?: string;
  child_name?: string;
  region_id?: string;
  region_name?: string;
  amount: number;
  currency: string;
  donation_type: 'Quick' | 'Guest' | 'Standard';
  is_anonymous: boolean;
  referral_code?: string;
  transaction_id?: string;
  payment_method?: string;
  status: string;
  created_at?: string;
}

class DonationService {
  async createQuickDonation(data: QuickDonationData): Promise<DonationResponse> {
    const response = await apiClient.post('/donations/quick', data);
    return response.data;
  }

  async createGuestDonation(data: GuestDonationData): Promise<DonationResponse> {
    const response = await apiClient.post('/donations/anonymous', data);
    return response.data;
  }

  async createStandardDonation(data: StandardDonationData): Promise<DonationResponse> {
    const response = await apiClient.post('/donations/standard', data);
    return response.data;
  }

  async getDonationsByUser(userId: string): Promise<DonationResponse[]> {
    const response = await apiClient.get(`/donations/user/${userId}`);
    return response.data;
  }

  async getDonationsByChild(childId: string): Promise<DonationResponse[]> {
    const response = await apiClient.get(`/donations/child/${childId}`);
    return response.data;
  }

async getTopDonors(limit: number = 10): Promise<LeaderboardDonor[]> {
  const response = await apiClient.get(`/donations/top/total?k=${limit}`);
  const donors: LeaderboardDonor[] = response.data.map((d: any) => {
    const id: string = d.user_id ?? d.id ?? '';
    const name: string = d.user_name ?? 'Anonymous';
    const amount: number = d.total_amount ?? d.amount ?? 0;
    const child_id: string | undefined = d.child_id ?? undefined;
    return { id, name, amount, child_id, region: undefined };
  });

  const childIds = Array.from(new Set(donors.map(d => d.child_id).filter((id): id is string => !!id)));
  const regionMap: Record<string, string> = {};
  for (const childId of childIds) {
    const childResp = await apiClient.get(`/children/${childId}`);
    regionMap[childId] = childResp.data.region_name ?? "Unknown";
  }

  donors.forEach(d => {
    d.region = d.child_id ? regionMap[d.child_id] ?? "Unknown" : "Unknown";
  });

  return donors;
}


  async getRecentDonors(childId: string, limit: number = 10): Promise<LeaderboardDonor[]> {
    const response = await apiClient.get(`/donations/recent-donors/${childId}?k=${limit}`);
    return response.data.map((d: any) => ({
      id: d.user_id ?? d.id,
      name: d.user_name ?? 'Anonymous',
      amount: d.amount,
      region: d.region_name ?? undefined,
    }));
  }
}

export const donationService = new DonationService();
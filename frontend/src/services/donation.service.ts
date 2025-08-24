import { apiClient } from '@/lib/axios';

export interface QuickDonationData {
  amount: number;
  currency?: string;
  payment_method?: string;
  transaction_id?: string;
  referral_code?: string;
}

export interface GuestDonationData {
  child_id: string;
  amount: number;
  currency?: string;
  payment_method?: string;
  transaction_id?: string;
  referral_code?: string;
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

  async getTopDonors(limit: number = 10): Promise<any[]> {
    const response = await apiClient.get(`/donations/top/total?k=${limit}`);
    return response.data;
  }

  async getRecentDonors(childId: string, limit: number = 10): Promise<any[]> {
    const response = await apiClient.get(`/donations/recent-donors/${childId}?k=${limit}`);
    return response.data;
  }

  async validateReferralCode(referralCode: string): Promise<{
    valid: boolean;
    referrer_name?: string;
    message: string;
  }> {
    const response = await apiClient.get(`/donations/validate-referral/${referralCode}`);
    return response.data;
  }

  // Admin methods
  async getAllDonations(limit: number = 100): Promise<DonationResponse[]> {
    const response = await apiClient.get(`/donations/all?limit=${limit}`);
    return response.data;
  }

  async getDonationsByRegion(regionId: string): Promise<DonationResponse[]> {
    const response = await apiClient.get(`/donations/region/${regionId}`);
    return response.data;
  }

  async getDonationStats(regionId?: string, childId?: string): Promise<{
    total_amount: number;
    total_donations: number;
    unique_donors: number;
  }> {
    const params = new URLSearchParams();
    if (regionId) params.append('region_id', regionId);
    if (childId) params.append('child_id', childId);
    
    const response = await apiClient.get(`/donations/stats?${params.toString()}`);
    return response.data;
  }

  async getRecentDonations(limit: number = 50): Promise<DonationResponse[]> {
    const response = await apiClient.get(`/donations/recent?limit=${limit}`);
    return response.data;
  }

  async deleteDonation(donationId: string): Promise<void> {
    await apiClient.delete(`/donations/${donationId}`);
  }

  async updateDonationStatus(donationId: string, status: string): Promise<DonationResponse> {
    const response = await apiClient.patch(`/donations/${donationId}/status`, { status });
    return response.data;
  }
}

export const donationService = new DonationService();
import { apiClient } from '@/lib/axios';

export interface ReferralTier {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  name: string;
  min_amount: number;
  min_referrals: number;
  badge_color: string;
  perks: string[];
}

export interface ReferralStats {
  user_id: string;
  user_name: string;
  profile_image_url?: string;
  referral_code: string;
  total_referrals: number;
  active_referrals: number;
  total_donations_amount: number;
  tier: ReferralTier;
  rank?: number;
  badges: string[];
  rewards: any[];
  joined_date?: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  user_name: string;
  profile_image_url?: string;
  referral_code: string;
  total_referrals: number;
  total_donations: number;
  tier: string;
  tier_color: string;
  badges: string[];
  monthly_referrals: number;
  is_rising: boolean;
}

export interface WallOfFameEntry {
  user_id: string;
  user_name: string;
  profile_image_url?: string;
  achievement: string;
  achievement_date: string;
  tier: string;
  impact_message: string;
}

export interface ShareLinks {
  referral_code: string;
  share_links: {
    direct: string;
    facebook: string;
    twitter: string;
    whatsapp: string;
    email: string;
  };
  message_templates: {
    short: string;
    medium: string;
    long: string;
  };
}

export type LeaderboardPeriod = 'all_time' | 'monthly' | 'weekly' | 'daily';

export interface ReferralSummaryStats {
  total_referrers: number;
  monthly_referrals: number;
  total_impact: number;
  top_tier: string;
}

class ReferralService {
  async getSummaryStats(): Promise<ReferralSummaryStats> {
    const response = await apiClient.get('/referrals/summary-stats');
    return response.data;
  }
  async getLeaderboard(period: LeaderboardPeriod = 'all_time', limit: number = 20): Promise<LeaderboardEntry[]> {
    const response = await apiClient.get(`/referrals/leaderboard?period=${period}&limit=${limit}`);
    return response.data;
  }

  async getWallOfFame(limit: number = 10): Promise<WallOfFameEntry[]> {
    const response = await apiClient.get(`/referrals/wall-of-fame?limit=${limit}`);
    return response.data;
  }

  async getUserStats(userId: string): Promise<ReferralStats> {
    const response = await apiClient.get(`/referrals/stats/${userId}`);
    return response.data;
  }

  async getAvailableRewards(userId: string): Promise<{
    current_tier: ReferralTier;
    available_perks: string[];
    earned_rewards: any[];
    next_tier?: {
      next_tier: string;
      amount_needed: number;
      referrals_needed: number;
      perks_to_unlock: string[];
    };
  }> {
    const response = await apiClient.get(`/referrals/rewards/available/${userId}`);
    return response.data;
  }

  async claimReward(rewardId: string, claimType: 'redeem' | 'activate'): Promise<{
    success: boolean;
    message: string;
    reward_id: string;
  }> {
    const response = await apiClient.post('/referrals/rewards/claim', {
      reward_id: rewardId,
      claim_type: claimType
    });
    return response.data;
  }

  async getShareLinks(userId: string): Promise<ShareLinks> {
    const response = await apiClient.get(`/referrals/share-link/${userId}`);
    return response.data;
  }
}

export const referralService = new ReferralService();
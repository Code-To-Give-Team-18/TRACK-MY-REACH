'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { User, Mail, Shield, Settings, Share2, Copy, Gift, Heart, Calendar, DollarSign, Trophy, Star, TrendingUp, ChevronRight, Users } from 'lucide-react';
import { donationService, DonationResponse } from '@/services/donation.service';
import { referralService, ReferralStats } from '@/services/referral.service';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [donations, setDonations] = useState<DonationResponse[]>([]);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [referralStatsLoading, setReferralStatsLoading] = useState(false);

  useEffect(() => {
    // Always check auth on mount to ensure we have fresh user data
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    // Reset image error state when user changes
    setImageError(false);
  }, [user?.profile_image_url]);

  useEffect(() => {
    // Fetch user's donations when user is loaded
    if (user?.id) {
      setDonationsLoading(true);
      donationService.getDonationsByUser(user.id)
        .then(data => {
          setDonations(data);
        })
        .catch(error => {
          console.error('Error fetching donations:', error);
        })
        .finally(() => {
          setDonationsLoading(false);
        });
    }
  }, [user?.id]);

  useEffect(() => {
    // Fetch user's referral stats when user is loaded
    if (user?.id) {
      setReferralStatsLoading(true);
      referralService.getUserStats(user.id)
        .then(data => {
          setReferralStats(data);
        })
        .catch(error => {
          console.error('Error fetching referral stats:', error);
        })
        .finally(() => {
          setReferralStatsLoading(false);
        });
    }
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTierInfo = (tierName: string) => {
    const tiers: Record<string, { color: string; gradient: string; icon: string; bgColor: string }> = {
      'bronze': { 
        color: 'text-orange-600', 
        gradient: 'from-orange-400 to-orange-600',
        icon: '🥉',
        bgColor: 'bg-orange-50'
      },
      'silver': { 
        color: 'text-gray-500', 
        gradient: 'from-gray-300 to-gray-400',
        icon: '🥈',
        bgColor: 'bg-gray-50'
      },
      'gold': { 
        color: 'text-yellow-600', 
        gradient: 'from-yellow-400 to-amber-500',
        icon: '🥇',
        bgColor: 'bg-yellow-50'
      },
      'platinum': { 
        color: 'text-purple-600', 
        gradient: 'from-purple-400 to-purple-600',
        icon: '💎',
        bgColor: 'bg-purple-50'
      },
      'diamond': { 
        color: 'text-cyan-600', 
        gradient: 'from-cyan-400 to-blue-500',
        icon: '💠',
        bgColor: 'bg-cyan-50'
      }
    };
    
    const tierKey = tierName?.toLowerCase() || 'bronze';
    return tiers[tierKey] || tiers['bronze'];
  };

  const handleCopyReferralCode = () => {
    const code = user?.referral_code || 'GENERATING';
    if (code !== 'GENERATING') {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareReferralCode = () => {
    if (user?.referral_code && navigator.share) {
      navigator.share({
        title: 'Join me in supporting children!',
        text: `Use my referral code ${user.referral_code} to join REACH and make a difference in children's lives.`,
        url: window.location.origin + '/signup?ref=' + user.referral_code,
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <button
            onClick={() => router.push('/settings')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Settings"
          >
            <Settings className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Personal Information Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 relative">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <p className="text-sm text-gray-500 mt-1">Your account details</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                {!imageError &&
                user.profile_image_url &&
                user.profile_image_url !== '/user.png' ? (
                  <img
                    src={user.profile_image_url}
                    alt={user.name}
                    className="h-full w-full rounded-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span className="text-2xl font-semibold text-indigo-600">
                    {getInitials(user.name)}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">User ID</p>
                  <p className="text-sm font-mono">{user.id}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Account Type
                  </p>
                  <p className="text-sm capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Code Card */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-md border border-indigo-200 mt-6">
          <div className="p-6 border-b border-indigo-200">
            <div className="flex items-center gap-2">
              <Gift className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-indigo-900">
                Share & help out the children
              </h2>
            </div>
            <p className="text-sm text-indigo-700 mt-1">
              Invite friends and make a bigger impact together!
            </p>
          </div>
          <div className="p-6">
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <p className="text-sm text-gray-600 mb-2">Your Referral Code</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  <span className="text-lg font-bold text-indigo-600 tracking-wider">
                    {user.referral_code || 'GENERATING...'}
                  </span>
                </div>
                <button
                  onClick={handleCopyReferralCode}
                  className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Copy code"
                  disabled={!user.referral_code}
                >
                  {copied ? (
                    <span className="text-sm">Copied!</span>
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Tier Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mt-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-amber-600" />
              <h2 className="text-xl font-semibold">Your Referral Tier</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Your current tier and progress to the next level
            </p>
          </div>
          <div className="p-6">
            {referralStatsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : referralStats ? (
                <div className="space-y-6">
                  {/* Current Tier Display */}
                  <div className={`${getTierInfo(referralStats.tier?.tier || '').bgColor} rounded-xl p-6 border-2 border-dashed ${getTierInfo(referralStats.tier?.tier || '').color.replace('text', 'border')}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-5xl">{getTierInfo(referralStats.tier?.tier || '').icon}</div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Current Tier</p>
                          <h3 className={`text-2xl font-bold ${getTierInfo(referralStats.tier?.tier || '').color}`}>
                            {referralStats.tier?.name || 'Bronze Advocate'}
                          </h3>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-gray-700">
                                {referralStats.total_referrals} referrals
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-gray-700">
                                HK${referralStats.total_donations_amount.toFixed(0)} raised
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {referralStats.rank && (
                        <div className="text-center px-4 py-2 bg-white rounded-lg">
                          <p className="text-xs text-gray-600">Your Rank</p>
                          <p className="text-2xl font-bold text-indigo-600">#{referralStats.rank}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress to Next Tier */}
                  {referralStats.tier?.tier !== 'diamond' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Progress to Next Tier</span>
                        <button 
                          onClick={() => router.push('/referrals')}
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                        >
                          View All Tiers <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                      
                      {(() => {
                        const nextTierMap: Record<string, { name: string; minAmount: number; minReferrals: number }> = {
                          'bronze': { name: 'Silver Champion', minAmount: 5000, minReferrals: 3 },
                          'silver': { name: 'Gold Ambassador', minAmount: 10000, minReferrals: 5 },
                          'gold': { name: 'Platinum Leader', minAmount: 25000, minReferrals: 10 },
                          'platinum': { name: 'Diamond Visionary', minAmount: 50000, minReferrals: 20 },
                        };
                        const currentTier = referralStats.tier?.tier || 'bronze';
                        const nextTier = nextTierMap[currentTier];
                        
                        if (nextTier) {
                          const amountProgress = Math.min(100, (referralStats.total_donations_amount / nextTier.minAmount) * 100);
                          const referralProgress = Math.min(100, (referralStats.total_referrals / nextTier.minReferrals) * 100);
                          const overallProgress = Math.min(amountProgress, referralProgress);
                          
                          return (
                            <>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">Overall Progress</span>
                                  <span className="font-medium">{Math.round(overallProgress)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`bg-gradient-to-r ${getTierInfo(currentTier).gradient} h-2 rounded-full transition-all duration-500`}
                                    style={{ width: `${overallProgress}%` }}
                                  />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="h-4 w-4 text-indigo-500" />
                                    <span className="text-xs font-medium text-gray-700">Referrals Needed</span>
                                  </div>
                                  <div className="text-sm">
                                    <span className="font-bold text-gray-900">{referralStats.total_referrals}</span>
                                    <span className="text-gray-500"> / {nextTier.minReferrals}</span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {Math.max(0, nextTier.minReferrals - referralStats.total_referrals)} more needed
                                  </div>
                                </div>
                                
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Gift className="h-4 w-4 text-green-500" />
                                    <span className="text-xs font-medium text-gray-700">Amount Needed</span>
                                  </div>
                                  <div className="text-sm">
                                    <span className="font-bold text-gray-900">HK${referralStats.total_donations_amount.toFixed(0)}</span>
                                    <span className="text-gray-500"> / {nextTier.minAmount}</span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    HK${Math.max(0, nextTier.minAmount - referralStats.total_donations_amount).toFixed(0)} more needed
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                                <p className="text-xs font-medium text-indigo-900 mb-1">Next Tier: {nextTier.name}</p>
                                <p className="text-xs text-indigo-700">
                                  Unlock exclusive perks and recognition as you advance!
                                </p>
                              </div>
                            </>
                          );
                        }
                        return <p className="text-sm text-gray-500">You've reached the highest tier! 🎉</p>;
                      })()}
                    </div>
                  )}

                  {/* Active Referrals Summary */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-indigo-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Active Referrals</p>
                        <p className="text-xs text-gray-600">Currently supporting the cause</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-indigo-600">
                      {referralStats.active_referrals}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Default/Fallback Tier Display */}
                  <div className={`${getTierInfo('bronze').bgColor} rounded-xl p-6 border-2 border-dashed ${getTierInfo('bronze').color.replace('text', 'border')}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-5xl">{getTierInfo('bronze').icon}</div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Current Tier</p>
                          <h3 className={`text-2xl font-bold ${getTierInfo('bronze').color}`}>
                            Bronze Advocate
                          </h3>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-gray-700">
                                0 referrals
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-gray-700">
                                HK$0 raised
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress to Next Tier */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Progress to Next Tier</span>
                      <button 
                        onClick={() => router.push('/referrals')}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                      >
                        View All Tiers <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Overall Progress</span>
                        <span className="font-medium">0%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`bg-gradient-to-r ${getTierInfo('bronze').gradient} h-2 rounded-full transition-all duration-500`}
                          style={{ width: '0%' }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-indigo-500" />
                          <span className="text-xs font-medium text-gray-700">Referrals Needed</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-bold text-gray-900">0</span>
                          <span className="text-gray-500"> / 3</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          3 more needed
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Gift className="h-4 w-4 text-green-500" />
                          <span className="text-xs font-medium text-gray-700">Amount Needed</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-bold text-gray-900">HK$0</span>
                          <span className="text-gray-500"> / 5000</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          HK$5000 more needed
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                      <p className="text-xs font-medium text-indigo-900 mb-1">Next Tier: Silver Champion</p>
                      <p className="text-xs text-indigo-700">
                        Start referring friends to unlock exclusive perks!
                      </p>
                    </div>
                  </div>

                  {/* Active Referrals Summary */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-indigo-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Active Referrals</p>
                        <p className="text-xs text-gray-600">Currently supporting the cause</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-indigo-600">
                      0
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        {/* Past Donations Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mt-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <h2 className="text-xl font-semibold">Your Donations</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Your contribution history and impact
            </p>
          </div>
          <div className="p-6">
            {donationsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : donations.length > 0 ? (
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Donated</p>
                        <p className="text-2xl font-bold text-indigo-600">
                          HK${donations.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-indigo-400" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Donations</p>
                        <p className="text-2xl font-bold text-green-600">{donations.length}</p>
                      </div>
                      <Heart className="h-8 w-8 text-green-400" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Children Helped</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {new Set(donations.filter(d => d.child_id).map(d => d.child_id)).size}
                        </p>
                      </div>
                      <Gift className="h-8 w-8 text-purple-400" />
                    </div>
                  </div>
                </div>

                {/* Donations List */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Donations</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {donations.slice(0, 10).map((donation) => (
                      <div
                        key={donation.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <Heart className="h-5 w-5 text-indigo-600" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {donation.child_name ? (
                                <>Donated to {donation.child_name}</>
                              ) : donation.donation_type === 'Quick' ? (
                                'Quick Donation'
                              ) : (
                                'General Donation'
                              )}
                            </p>
                            {donation.region_name && (
                              <p className="text-xs text-gray-500">{donation.region_name}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <p className="text-xs text-gray-500">
                                {donation.created_at ? new Date(donation.created_at).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {donation.currency} ${donation.amount.toFixed(2)}
                          </p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            donation.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : donation.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {donation.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No donations yet.</p>
                <p className="text-xs text-gray-400 mt-1">Your donation history will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

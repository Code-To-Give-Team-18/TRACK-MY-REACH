'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { referralService, LeaderboardEntry, LeaderboardPeriod } from '@/services/referral.service';
import { Trophy, Medal, Award, TrendingUp, Users, DollarSign, Crown, Star, Flame } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface LeaderboardProps {
  period?: LeaderboardPeriod;
  limit?: number;
}

export function ReferralLeaderboard({ period: initialPeriod = 'all_time', limit = 20 }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<LeaderboardPeriod>(initialPeriod);

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await referralService.getLeaderboard(period, limit);
      setEntries(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-600" />;
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getTierBadge = (tierColor: string, tierName: string) => {
    const getIcon = () => {
      if (tierName.includes('Diamond')) return <Crown className="h-4 w-4" />;
      if (tierName.includes('Platinum')) return <Star className="h-4 w-4" />;
      if (tierName.includes('Gold')) return <Trophy className="h-4 w-4" />;
      if (tierName.includes('Silver')) return <Medal className="h-4 w-4" />;
      return <Award className="h-4 w-4" />;
    };

    return (
      <div 
        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
        style={{ backgroundColor: tierColor }}
      >
        {getIcon()}
        <span>{tierName.split(' ')[0]}</span>
      </div>
    );
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toFixed(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header with Period Selector */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Referral Champions</h2>
          </div>
          
          {/* Period Selector */}
          <div className="flex gap-2">
            {(['daily', 'weekly', 'monthly', 'all_time'] as LeaderboardPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${period === p 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                {p === 'all_time' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center py-16 px-4">
          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Be the First Champion!</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start referring friends and become the first on our leaderboard. 
            Every referral makes a real difference in children's lives.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Share your unique referral code with friends</p>
            <p className="text-sm text-gray-500">They use it when making a donation</p>
            <p className="text-sm text-gray-500">You climb the leaderboard and unlock rewards!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Referral Champions</h2>
        </div>
        
        {/* Period Selector */}
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly', 'all_time'] as LeaderboardPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${period === p 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              `}
            >
              {p === 'all_time' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Showcase */}
      {entries.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* 2nd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:order-1 order-2"
          >
            <div className="relative bg-gradient-to-br from-gray-100 to-slate-200 rounded-xl p-6 text-center hover:shadow-xl transition-all">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="bg-gray-400 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden bg-gradient-to-br from-gray-300 to-slate-400">
                {entries[1].profile_image_url ? (
                  <Image
                    src={entries[1].profile_image_url}
                    alt={entries[1].user_name}
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                    {entries[1].user_name[0]}
                  </div>
                )}
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{entries[1].user_name}</h3>
              <div className="flex justify-center mb-2">
                {getTierBadge(entries[1].tier_color, entries[1].tier)}
              </div>
              <div className="text-sm text-gray-600">
                <div>HK${formatAmount(entries[1].total_donations)}</div>
                <div>{entries[1].total_referrals} referrals</div>
              </div>
            </div>
          </motion.div>

          {/* 1st Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:order-2 order-1"
          >
            <div className="relative bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100 rounded-xl p-6 text-center hover:shadow-2xl transition-all transform md:-mt-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-gradient-to-br from-yellow-400 to-amber-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl shadow-lg">
                  <Trophy className="h-6 w-6" />
                </div>
              </div>
              <div className="w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-amber-500 ring-4 ring-yellow-300">
                {entries[0].profile_image_url ? (
                  <Image
                    src={entries[0].profile_image_url}
                    alt={entries[0].user_name}
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                    {entries[0].user_name[0]}
                  </div>
                )}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{entries[0].user_name}</h3>
              <div className="flex justify-center mb-2">
                {getTierBadge(entries[0].tier_color, entries[0].tier)}
              </div>
              <div className="text-sm text-gray-700 font-medium">
                <div className="text-lg">HK${formatAmount(entries[0].total_donations)}</div>
                <div>{entries[0].total_referrals} referrals</div>
              </div>
              {entries[0].badges.includes('🏆 #1') && (
                <div className="mt-2 inline-flex items-center gap-1 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                  <Flame className="h-3 w-3" />
                  Champion
                </div>
              )}
            </div>
          </motion.div>

          {/* 3rd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:order-3 order-3"
          >
            <div className="relative bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl p-6 text-center hover:shadow-xl transition-all">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-amber-500">
                {entries[2].profile_image_url ? (
                  <Image
                    src={entries[2].profile_image_url}
                    alt={entries[2].user_name}
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                    {entries[2].user_name[0]}
                  </div>
                )}
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{entries[2].user_name}</h3>
              <div className="flex justify-center mb-2">
                {getTierBadge(entries[2].tier_color, entries[2].tier)}
              </div>
              <div className="text-sm text-gray-600">
                <div>HK${formatAmount(entries[2].total_donations)}</div>
                <div>{entries[2].total_referrals} referrals</div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referrer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Referrals
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Total Impact
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AnimatePresence>
                {entries.map((entry, index) => (
                  <motion.tr
                    key={entry.user_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRankIcon(entry.rank)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400">
                          {entry.profile_image_url ? (
                            <Image
                              src={entry.profile_image_url}
                              alt={entry.user_name}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold">
                              {entry.user_name[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{entry.user_name}</div>
                          <div className="text-xs text-gray-500">@{entry.referral_code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getTierBadge(entry.tier_color, entry.tier)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{entry.total_referrals}</div>
                      {entry.monthly_referrals > 0 && (
                        <div className="text-xs text-gray-500">+{entry.monthly_referrals} this month</div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        HK${formatAmount(entry.total_donations)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {entry.is_rising && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <TrendingUp className="h-3 w-3" />
                            Rising
                          </span>
                        )}
                        {entry.badges.map((badge, idx) => (
                          <span key={idx} className="text-xs">
                            {badge}
                          </span>
                        ))}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
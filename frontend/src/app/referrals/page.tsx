'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ReferralLeaderboard } from '@/components/referrals/ReferralLeaderboard';
import { WallOfFame } from '@/components/referrals/WallOfFame';
import { Trophy, Users, Gift, Sparkles, TrendingUp, Award } from 'lucide-react';
import { referralService, ReferralSummaryStats } from '@/services/referral.service';

type TabType = 'leaderboard' | 'wall-of-fame' | 'my-stats' | 'rewards';

export default function ReferralsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('leaderboard');
  const [summaryStats, setSummaryStats] = useState<ReferralSummaryStats>({
    total_referrers: 0,
    monthly_referrals: 0,
    total_impact: 0,
    top_tier: 'Ready!'
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    loadSummaryStats();
  }, []);

  const loadSummaryStats = async () => {
    try {
      const stats = await referralService.getSummaryStats();
      setSummaryStats(stats);
    } catch (error) {
      console.error('Failed to load summary stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toFixed(0);
  };

  const tabs = [
    { id: 'leaderboard' as TabType, label: 'Leaderboard', icon: Trophy },
    { id: 'wall-of-fame' as TabType, label: 'Wall of Fame', icon: Award },
    { id: 'my-stats' as TabType, label: 'My Stats', icon: TrendingUp },
    { id: 'rewards' as TabType, label: 'Rewards', icon: Gift },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Referral Hub
            </h1>
            <Sparkles className="h-8 w-8 text-pink-600" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Spread the word, make an impact, and earn exclusive rewards by referring friends to support our cause
          </p>
        </motion.div>

        {/* Stats Overview - Will be populated when data is available */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Referrers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingStats ? '...' : summaryStats.total_referrers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pink-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingStats ? '...' : summaryStats.monthly_referrals}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Gift className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Impact</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingStats ? '...' : `HK$${formatAmount(summaryStats.total_impact)}`}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-amber-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Trophy className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Top Tier</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingStats ? '...' : summaryStats.top_tier}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'bg-white/50 text-gray-600 hover:bg-white/80'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
        >
          {activeTab === 'leaderboard' && <ReferralLeaderboard />}
          {activeTab === 'wall-of-fame' && <WallOfFame />}
          {activeTab === 'my-stats' && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Referral Stats</h3>
              <p className="text-gray-600 mb-6">Sign in to view your personal referral statistics and progress</p>
              <button className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all">
                Sign In
              </button>
            </div>
          )}
          {activeTab === 'rewards' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Referral Rewards & Tiers</h3>
              
              {/* Tier System */}
              <div className="grid gap-4">
                {[
                  {
                    tier: 'Diamond Visionary',
                    requirement: '20+ referrals & HK$50,000+',
                    color: 'from-cyan-400 to-blue-500',
                    perks: ['Annual ceremony invitation', 'Program naming rights', 'Direct strategy input', 'Legacy status']
                  },
                  {
                    tier: 'Platinum Leader',
                    requirement: '10+ referrals & HK$25,000+',
                    color: 'from-gray-300 to-gray-400',
                    perks: ['1-on-1 student meetings', 'Co-create initiatives', 'VIP event access', 'Personal coordinator']
                  },
                  {
                    tier: 'Gold Ambassador',
                    requirement: '5+ referrals & HK$10,000+',
                    color: 'from-yellow-400 to-amber-500',
                    perks: ['Monthly coordinator calls', 'Behind-the-scenes content', 'Annual report mention', 'Virtual events']
                  },
                  {
                    tier: 'Silver Champion',
                    requirement: '3+ referrals & HK$5,000+',
                    color: 'from-gray-200 to-gray-300',
                    perks: ['Quarterly video updates', 'Early impact stories', 'Silver badge', 'All Bronze perks']
                  },
                  {
                    tier: 'Bronze Advocate',
                    requirement: '1+ referral & HK$1,000+',
                    color: 'from-orange-400 to-orange-600',
                    perks: ['Monthly impact report', 'Thank you badge', 'Supporter wall mention']
                  }
                ].map((tier, index) => (
                  <motion.div
                    key={tier.tier}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className={`text-lg font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                          {tier.tier}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{tier.requirement}</p>
                      </div>
                      <div className={`p-2 bg-gradient-to-br ${tier.color} rounded-lg`}>
                        <Trophy className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      {tier.perks.map((perk, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                          {perk}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add animation keyframes */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
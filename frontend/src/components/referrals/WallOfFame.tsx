'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { referralService, WallOfFameEntry } from '@/services/referral.service';
import { Trophy, Star, Heart, Sparkles, Crown, Medal, Award, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

export function WallOfFame() {
  const [entries, setEntries] = useState<WallOfFameEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWallOfFame();
  }, []);

  const loadWallOfFame = async () => {
    try {
      const data = await referralService.getWallOfFame(10);
      setEntries(data);
    } catch (error) {
      console.error('Failed to load wall of fame:', error);
      toast.error('Failed to load wall of fame');
    } finally {
      setLoading(false);
    }
  };

  const getTierIcon = (tier: string) => {
    if (tier.includes('Diamond')) return <Crown className="h-5 w-5 text-cyan-400" />;
    if (tier.includes('Platinum')) return <Medal className="h-5 w-5 text-gray-300" />;
    if (tier.includes('Gold')) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (tier.includes('Silver')) return <Award className="h-5 w-5 text-gray-400" />;
    return <Star className="h-5 w-5 text-orange-600" />;
  };

  const getAchievementIcon = (achievement: string) => {
    if (achievement.includes('🏆')) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (achievement.includes('🥈')) return <Medal className="h-6 w-6 text-gray-400" />;
    if (achievement.includes('🥉')) return <Award className="h-6 w-6 text-orange-600" />;
    if (achievement.includes('⭐')) return <Star className="h-6 w-6 text-yellow-400" />;
    if (achievement.includes('💎')) return <Crown className="h-6 w-6 text-cyan-400" />;
    if (achievement.includes('🚀')) return <TrendingUp className="h-6 w-6 text-purple-500" />;
    return <Heart className="h-6 w-6 text-red-500" />;
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
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Wall of Fame
            </h2>
            <Trophy className="h-8 w-8 text-yellow-500" />
          </motion.div>
          <p className="text-gray-600">Celebrating our most impactful supporters</p>
        </div>

        {/* Empty State */}
        <div className="text-center py-16 px-4">
          <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Name Could Be Here!</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Be among the first to join our Wall of Fame by referring friends and supporting our cause.
            Your impact will be celebrated and remembered.
          </p>
          <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all">
            Get Your Referral Code
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 mb-4"
        >
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Wall of Fame
          </h2>
          <Trophy className="h-8 w-8 text-yellow-500" />
        </motion.div>
        <p className="text-gray-600">Celebrating our most impactful supporters</p>
      </div>

      {/* Fame Entries */}
      <div className="grid gap-4">
        <AnimatePresence>
          {entries.map((entry, index) => (
            <motion.div
              key={entry.user_id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                relative overflow-hidden rounded-xl p-6 
                ${index === 0 ? 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-2 border-yellow-300' : 
                  index === 1 ? 'bg-gradient-to-br from-gray-50 to-slate-100 border border-gray-300' :
                  index === 2 ? 'bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-300' :
                  'bg-white border border-gray-200'}
                hover:shadow-xl transition-all duration-300
              `}
            >
              {/* Rank Badge for Top 3 */}
              {index < 3 && (
                <div className="absolute -top-2 -right-2">
                  <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center
                    ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-slate-400' :
                      'bg-gradient-to-br from-orange-400 to-amber-600'}
                    shadow-lg
                  `}>
                    <span className="text-white font-bold text-xl">#{index + 1}</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                {/* Profile Image */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400">
                    {entry.profile_image_url ? (
                      <Image
                        src={entry.profile_image_url}
                        alt={entry.user_name}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                        {entry.user_name[0]}
                      </div>
                    )}
                  </div>
                  {/* Tier Badge */}
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                    {getTierIcon(entry.tier)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-900">{entry.user_name}</h3>
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                      {entry.tier}
                    </span>
                  </div>

                  {/* Achievement */}
                  <div className="flex items-center gap-2 mb-2">
                    {getAchievementIcon(entry.achievement)}
                    <span className="text-sm font-medium text-gray-700">
                      {entry.achievement}
                    </span>
                  </div>

                  {/* Impact Message */}
                  <p className="text-sm text-gray-600 mb-2">
                    {entry.impact_message}
                  </p>

                  {/* Achievement Date */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Sparkles className="h-3 w-3" />
                    <span>Achieved {new Date(entry.achievement_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Decorative Elements for Top 3 */}
              {index === 0 && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200 rounded-full filter blur-3xl opacity-20"></div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl"
      >
        <p className="text-gray-700 mb-3">
          Join our Wall of Fame by referring friends and making an impact!
        </p>
        <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all">
          Start Referring
        </button>
      </motion.div>
    </div>
  );
}
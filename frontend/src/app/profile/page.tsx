'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { User, Mail, Shield, Settings, Share2, Copy, Gift } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);

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

        {/* Recent Activity Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mt-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <p className="text-sm text-gray-500 mt-1">
              Your recent actions and contributions
            </p>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-500">
              No recent activity to display.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

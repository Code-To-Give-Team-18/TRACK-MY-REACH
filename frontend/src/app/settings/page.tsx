'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Settings, User, Lock, Bell, Shield, LogOut, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, checkAuth, signOut } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

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

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Edit Profile',
          description: 'Update your name and profile picture',
          onClick: () => router.push('/settings/profile'),
        },
        {
          icon: Lock,
          label: 'Change Password',
          description: 'Update your account password',
          onClick: () => router.push('/settings/password'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          label: 'Notification Settings',
          description: 'Manage your notification preferences',
          onClick: () => router.push('/settings/notifications'),
        },
      ],
    },
    {
      title: 'Administration',
      items: user.role === 'admin' ? [
        {
          icon: Shield,
          label: 'Admin Dashboard',
          description: 'Access administrative controls',
          onClick: () => router.push('/dashboard'),
          className: 'text-indigo-600',
        },
      ] : [],
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        <div className="space-y-6">
          {settingsGroups.map((group) => (
            group.items.length > 0 && (
              <div key={group.title} className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">{group.title}</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {group.items.map((item, index) => (
                    <button
                      key={index}
                      onClick={item.onClick}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg bg-gray-100 ${item.className || ''}`}>
                          <item.icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className={`font-medium ${item.className || 'text-gray-900'}`}>
                            {item.label}
                          </p>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            )
          ))}

          {/* Danger Zone */}
          <div className="bg-white rounded-lg shadow-md border border-red-200">
            <div className="px-6 py-4 border-b border-red-200">
              <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
            </div>
            <div className="p-6">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
              <p className="text-sm text-gray-500 mt-2">
                You will be redirected to the login page
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
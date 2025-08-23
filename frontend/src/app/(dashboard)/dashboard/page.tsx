'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth, signOut, isLoading } = useAuthStore();

  useEffect(() => {
    // Always check auth on mount to verify token is still valid
    checkAuth();
  }, []);

  useEffect(() => {
    // Only redirect if we've finished checking and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen w-full">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {user.email}
              </span>
              <Button
                onClick={() => signOut()}
                className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Welcome, {user.name}!
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Email:
                  </span>
                  <span className="ml-2 text-sm text-gray-900 dark:text-white">
                    {user.email}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Role:
                  </span>
                  <span className="ml-2 text-sm text-gray-900 dark:text-white capitalize">
                    {user.role}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    User ID:
                  </span>
                  <span className="ml-2 text-sm text-gray-900 dark:text-white">
                    {user.id}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Account Created:
                  </span>
                  <span className="ml-2 text-sm text-gray-900 dark:text-white">
                    {new Date(user.created_at * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {user.role === 'admin' && (
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border-2 border-indigo-500">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Admin Panel
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                    👥
                  </dd>
                  <Button
                    onClick={() => router.push('/admin/users')}
                    className="mt-3 w-full text-sm bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Manage Users
                  </Button>
                </div>
              </div>
            )}
            
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Profile
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                  ✓
                </dd>
                <Button
                  onClick={() => router.push('/profile')}
                  className="mt-3 w-full text-sm bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  View Profile
                </Button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Settings
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                  ⚙️
                </dd>
                <Button
                  onClick={() => router.push('/settings')}
                  className="mt-3 w-full text-sm bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Manage Settings
                </Button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Files
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                  📁
                </dd>
                <Button
                  className="mt-3 w-full text-sm bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Manage Files
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
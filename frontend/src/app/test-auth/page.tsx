'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';

export default function TestAuthPage() {
  const { user, token, isAuthenticated, signIn, signOut, checkAuth, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('TestPassword123');

  const handleSignIn = async () => {
    try {
      await signIn({ email, password });
      console.log('Sign in successful');
    } catch (err) {
      console.error('Sign in failed:', err);
    }
  };

  const handleCheckAuth = async () => {
    await checkAuth();
    console.log('Auth check complete');
  };

  const handleSignOut = async () => {
    await signOut();
    console.log('Sign out complete');
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Authentication Test Page</h1>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Current State</h2>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <div><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</div>
            <div><strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}</div>
            <div><strong>Error:</strong> {error || 'None'}</div>
            <div><strong>Token (first 20 chars):</strong> {token ? `${token.substring(0, 20)}...` : 'None'}</div>
            <div><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'None'}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Test Credentials</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Actions</h2>
          <div className="space-x-4">
            <Button
              onClick={handleSignIn}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              Sign In
            </Button>
            <Button
              onClick={handleCheckAuth}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Check Auth
            </Button>
            <Button
              onClick={handleSignOut}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              Sign Out
            </Button>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          <p>Open the browser console to see detailed logs.</p>
          <p>Test flow: Sign In → Check Auth → Navigate to /dashboard → Sign Out</p>
        </div>
      </div>
    </div>
  );
}
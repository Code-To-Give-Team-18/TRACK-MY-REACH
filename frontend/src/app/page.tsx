'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">
          Welcome to OpenBook
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Full-stack application with Python backend and Next.js frontend
        </p>

        {isAuthenticated && user ? (
          <div className="space-y-4">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Welcome back, {user.name}!
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline">
                  View Profile
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              Get started by creating an account or signing in
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/login">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Authentication</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                JWT-based authentication with secure session management
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">File Management</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload and manage files with various format support
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Real-time Updates</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                WebSocket support for real-time communication
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500 dark:text-gray-500">
          <Link href="/test-auth" className="underline hover:text-gray-700 dark:hover:text-gray-300">
            Test Authentication
          </Link>
        </div>
      </div>
    </div>
  );
}
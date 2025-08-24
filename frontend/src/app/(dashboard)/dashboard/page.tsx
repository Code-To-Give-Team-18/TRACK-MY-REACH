'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
 const router = useRouter();
 const { user, isAuthenticated, checkAuth, signOut, isLoading } = useAuthStore();

 useEffect(() => {
 checkAuth();
 }, []);

 useEffect(() => {
 if (!isLoading) {
 if (!isAuthenticated) {
 router.push('/login');
 } else if (user && user.role !== 'admin') {
 // Redirect non-admin users to profile page
 router.push('/profile');
 }
 }
 }, [isLoading, isAuthenticated, user, router]);

 if (isLoading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
 <div className="text-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto"></div>
 <p className="mt-4 text-gray-600 ">Loading...</p>
 </div>
 </div>
 );
 }

 if (!user) {
 return null;
 }

 return (
 <section className="min-h-screen py-20 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
 <div className="container mx-auto px-4">
 <div className="max-w-3xl mx-auto mb-10">
 <div className="bg-white/90 rounded-2xl shadow-lg p-8 flex flex-col items-center">
 <h2 className="text-3xl font-bold text-orange-600 mb-2">Welcome, {user.name}!</h2>
 <p className="text-lg text-gray-700 mb-6">
 Your dashboard overview
 </p>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
 <div className="bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 rounded-xl shadow p-6">
 <span className="block text-sm font-medium text-gray-500 mb-1">Email</span>
 <span className="block text-lg text-gray-900 ">{user.email}</span>
 </div>
 <div className="bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 rounded-xl shadow p-6">
 <span className="block text-sm font-medium text-gray-500 mb-1">Role</span>
 <span className="block text-lg text-gray-900 capitalize">{user.role}</span>
 </div>
 <div className="bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 rounded-xl shadow p-6">
 <span className="block text-sm font-medium text-gray-500 mb-1">User ID</span>
 <span className="block text-lg text-gray-900 ">{user.id}</span>
 </div>
 <div className="bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 rounded-xl shadow p-6">
 <span className="block text-sm font-medium text-gray-500 mb-1">Account Created</span>
 <span className="block text-lg text-gray-900 ">
 {new Date(user.created_at * 1000).toLocaleDateString()}
 </span>
 </div>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
 {user.role === 'admin' && (
 <>
 <div className="bg-white/90 rounded-2xl shadow-lg border-2 border-orange-400 flex flex-col items-center p-8">
 <span className="text-xl font-semibold text-orange-600 mb-2">Admin Panel</span>
 <span className="text-4xl mb-4">👥</span>
 <Button
 onClick={() => router.push('/admin/users')}
 className="w-full text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-full"
 >
 Manage Users
 </Button>
 </div>
 <div className="bg-white/90 rounded-2xl shadow-lg border-2 border-pink-400 flex flex-col items-center p-8">
 <span className="text-xl font-semibold text-pink-600 mb-2">Children Management</span>
 <span className="text-4xl mb-4">🧒</span>
 <Button
 onClick={() => router.push('/children-management')}
 className="w-full text-sm bg-pink-500 hover:bg-pink-600 text-white rounded-full"
 >
 Manage Children
 </Button>
 </div>
 <div className="bg-white/90 rounded-2xl shadow-lg border-2 border-purple-400 flex flex-col items-center p-8">
 <span className="text-xl font-semibold text-purple-600 mb-2">Post Management</span>
 <span className="text-4xl mb-4">📝</span>
 <Button
 onClick={() => router.push('/post-management')}
 className="w-full text-sm bg-purple-500 hover:bg-purple-600 text-white rounded-full"
 >
 Manage Posts
 </Button>
 </div>
 </>
 )}
 </div>
 </div>
 </section>
 );
}
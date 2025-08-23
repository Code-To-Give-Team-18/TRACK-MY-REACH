'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import type { User } from '@/types';

export default function AdminLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 const router = useRouter();
 const [loading, setLoading] = useState(true);
 const [user, setUser] = useState<User | null>(null);

 useEffect(() => {
 checkAdminAccess();
 }, []);

 const checkAdminAccess = async () => {
 try {
 const userData = await authService.getSession();
 
 if (userData.role !== 'admin') {
 router.push('/dashboard');
 return;
 }
 
 setUser(userData);
 localStorage.setItem('user', JSON.stringify(userData));
 } catch (error) {
 console.error('Failed to verify admin access:', error);
 router.push('/login');
 } finally {
 setLoading(false);
 }
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center min-h-screen">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
 </div>
 );
 }

 if (!user || user.role !== 'admin') {
 return null;
 }

 return (
 <div className="min-h-screen bg-gray-50 ">
 <nav className="bg-white shadow-sm border-b border-gray-200 ">
 <div className="container mx-auto px-4">
 <div className="flex justify-between items-center h-16">
 <div className="flex items-center space-x-8">
 <h1 className="text-xl font-semibold text-gray-900 ">
 Admin Panel
 </h1>
 <div className="flex space-x-4">
 <a
 href="/admin/users"
 className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
 >
 Users
 </a>
 <a
 href="/dashboard"
 className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
 >
 Back to Dashboard
 </a>
 </div>
 </div>
 <div className="flex items-center space-x-4">
 <span className="text-sm text-gray-600 ">
 {user.name} (Admin)
 </span>
 <button
 onClick={() => authService.signOut()}
 className="text-gray-600 hover:text-gray-900 text-sm"
 >
 Sign Out
 </button>
 </div>
 </div>
 </div>
 </nav>
 <main>{children}</main>
 </div>
 );
}
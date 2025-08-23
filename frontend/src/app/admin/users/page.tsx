'use client';

import { useState, useEffect } from 'react';
import { userService, type UserRoleUpdateForm } from '@/services/user.service';
import type { User } from '@/types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function UserManagementPage() {
 const router = useRouter();
 const [users, setUsers] = useState<User[]>([]);
 const [loading, setLoading] = useState(true);
 const [selectedUser, setSelectedUser] = useState<User | null>(null);
 const [showPasswordModal, setShowPasswordModal] = useState(false);
 const [showDeleteModal, setShowDeleteModal] = useState(false);
 const [newPassword, setNewPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [searchTerm, setSearchTerm] = useState('');
 const [currentUser, setCurrentUser] = useState<User | null>(null);

 useEffect(() => {
 loadUsers();
 loadCurrentUser();
 }, []);

 const loadCurrentUser = async () => {
 try {
 const userData = localStorage.getItem('user');
 if (userData) {
 setCurrentUser(JSON.parse(userData));
 }
 } catch (error) {
 console.error('Failed to load current user:', error);
 }
 };

 const loadUsers = async () => {
 try {
 setLoading(true);
 const data = await userService.getAllUsers();
 setUsers(data);
 } catch (error) {
 console.error('Failed to load users:', error);
 toast.error('Failed to load users');
 } finally {
 setLoading(false);
 }
 };

 const handleRoleUpdate = async (userId: string, newRole: 'admin' | 'user' | 'pending' | 'serve_user') => {
 try {
 const roleUpdate: UserRoleUpdateForm = {
 id: userId,
 role: newRole
 };
 
 await userService.updateUserRole(roleUpdate);
 toast.success('User role updated successfully');
 await loadUsers();
 } catch (error) {
 console.error('Failed to update user role:', error);
 toast.error('Failed to update user role');
 }
 };

 const handlePasswordReset = async () => {
 if (!selectedUser) return;
 
 if (newPassword !== confirmPassword) {
 toast.error('Passwords do not match');
 return;
 }
 
 if (newPassword.length < 6) {
 toast.error('Password must be at least 6 characters');
 return;
 }
 
 try {
 await userService.resetUserPassword(selectedUser.id, newPassword);
 toast.success('Password reset successfully');
 setShowPasswordModal(false);
 setNewPassword('');
 setConfirmPassword('');
 setSelectedUser(null);
 } catch (error) {
 console.error('Failed to reset password:', error);
 toast.error('Failed to reset password');
 }
 };

 const handleDeleteUser = async () => {
 if (!selectedUser) return;
 
 try {
 await userService.deleteUser(selectedUser.id);
 toast.success('User deleted successfully');
 setShowDeleteModal(false);
 setSelectedUser(null);
 await loadUsers();
 } catch (error) {
 console.error('Failed to delete user:', error);
 toast.error('Failed to delete user');
 }
 };

 const filteredUsers = users.filter(user => 
 user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
 user.email.toLowerCase().includes(searchTerm.toLowerCase())
 );

 if (loading) {
 return (
 <div className="flex items-center justify-center min-h-screen">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
 </div>
 );
 }

 return (
 <div className="container mx-auto px-4 py-8">
 <div className="mb-8">
 <h1 className="text-3xl font-bold text-gray-900 mb-2">
 User Management
 </h1>
 <p className="text-gray-600 ">
 Manage user accounts, roles, and passwords
 </p>
 </div>

 {/* Search Bar */}
 <div className="mb-6">
 <input
 type="text"
 placeholder="Search users by name or email..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent "
 />
 </div>

 {/* Users Table */}
 <div className="bg-white shadow-lg rounded-lg overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead className="bg-gray-50 ">
 <tr>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 User
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Email
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Role
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Created
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Actions
 </th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200 ">
 {filteredUsers.map((user) => (
 <tr key={user.id} className="hover:bg-gray-50 ">
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="flex items-center">
 <div className="flex-shrink-0 h-10 w-10">
 <img
 className="h-10 w-10 rounded-full"
 src={user.profile_image_url || '/user.png'}
 alt={user.name}
 />
 </div>
 <div className="ml-4">
 <div className="text-sm font-medium text-gray-900 ">
 {user.name}
 </div>
 <div className="text-sm text-gray-500 ">
 ID: {user.id.slice(0, 8)}...
 </div>
 </div>
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="text-sm text-gray-900 ">{user.email}</div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <select
 value={user.role}
 onChange={(e) => handleRoleUpdate(user.id, e.target.value as any)}
 disabled={currentUser?.id === user.id}
 className="text-sm rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 <option value="admin">Admin</option>
 <option value="user">User</option>
 <option value="serve_user">Serve User</option>
 <option value="pending">Pending</option>
 </select>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 ">
 {new Date(user.created_at * 1000).toLocaleDateString()}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
 <button
 onClick={() => {
 setSelectedUser(user);
 setShowPasswordModal(true);
 }}
 className="text-indigo-600 hover:text-indigo-900 mr-4"
 >
 Reset Password
 </button>
 {currentUser?.id !== user.id && (
 <button
 onClick={() => {
 setSelectedUser(user);
 setShowDeleteModal(true);
 }}
 className="text-red-600 hover:text-red-900 "
 >
 Delete
 </button>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* Password Reset Modal */}
 {showPasswordModal && selectedUser && (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
 <div className="bg-white rounded-lg p-6 max-w-md w-full">
 <h2 className="text-xl font-bold mb-4 text-gray-900 ">
 Reset Password for {selectedUser.name}
 </h2>
 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 New Password
 </label>
 <input
 type="password"
 value={newPassword}
 onChange={(e) => setNewPassword(e.target.value)}
 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 "
 placeholder="Enter new password"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Confirm Password
 </label>
 <input
 type="password"
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 "
 placeholder="Confirm new password"
 />
 </div>
 </div>
 <div className="mt-6 flex justify-end space-x-3">
 <button
 onClick={() => {
 setShowPasswordModal(false);
 setNewPassword('');
 setConfirmPassword('');
 setSelectedUser(null);
 }}
 className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 "
 >
 Cancel
 </button>
 <button
 onClick={handlePasswordReset}
 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
 >
 Reset Password
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Delete Confirmation Modal */}
 {showDeleteModal && selectedUser && (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
 <div className="bg-white rounded-lg p-6 max-w-md w-full">
 <h2 className="text-xl font-bold mb-4 text-gray-900 ">
 Delete User
 </h2>
 <p className="text-gray-600 mb-6">
 Are you sure you want to delete <strong>{selectedUser.name}</strong>? 
 This action cannot be undone.
 </p>
 <div className="flex justify-end space-x-3">
 <button
 onClick={() => {
 setShowDeleteModal(false);
 setSelectedUser(null);
 }}
 className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 "
 >
 Cancel
 </button>
 <button
 onClick={handleDeleteUser}
 className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
 >
 Delete User
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
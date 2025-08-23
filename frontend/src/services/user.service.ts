import { apiClient } from '@/lib/axios';
import type { User } from '@/types';

export interface UserUpdateForm {
  name: string;
  email: string;
  profile_image_url?: string;
  password?: string;
}

export interface UserRoleUpdateForm {
  id: string;
  role: 'admin' | 'user' | 'pending' | 'serve_user';
}

export interface PasswordResetForm {
  user_id: string;
  new_password: string;
}

export const userService = {
  async getAllUsers(skip: number = 0, limit: number = 50): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users/', {
      params: { skip, limit }
    });
    return response.data;
  },

  async getUserById(userId: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${userId}`);
    return response.data;
  },

  async updateUserById(userId: string, data: UserUpdateForm): Promise<User> {
    const response = await apiClient.post<User>(`/users/${userId}/update`, data);
    return response.data;
  },

  async updateUserRole(data: UserRoleUpdateForm): Promise<User> {
    const response = await apiClient.post<User>('/users/update/role', data);
    return response.data;
  },

  async deleteUser(userId: string): Promise<boolean> {
    const response = await apiClient.delete<boolean>(`/users/${userId}`);
    return response.data;
  },

  async resetUserPassword(userId: string, newPassword: string): Promise<User> {
    const data: UserUpdateForm = {
      name: '', // Will be filled from existing user data
      email: '', // Will be filled from existing user data
      password: newPassword
    };
    
    // First get the user to preserve their current data
    const user = await this.getUserById(userId);
    data.name = user.name;
    data.email = user.email;
    
    return await this.updateUserById(userId, data);
  },

  async getUserByEmail(email: string): Promise<string> {
    const response = await apiClient.get<string>(`/users/email/${email}`);
    return response.data;
  }
};
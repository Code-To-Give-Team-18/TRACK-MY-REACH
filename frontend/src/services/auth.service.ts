import { apiClient } from '@/lib/axios';
import type { 
  User, 
  SignInForm, 
  SignUpForm, 
  AuthResponse 
} from '@/types';

export const authService = {
  async signIn(data: SignInForm): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auths/signin', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      // Also set cookie for middleware
      document.cookie = `token=${response.data.token}; path=/; max-age=86400; SameSite=Lax`;
    }
    return response.data;
  },

  async signUp(data: SignUpForm): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auths/signup', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      // Also set cookie for middleware
      document.cookie = `token=${response.data.token}; path=/; max-age=86400; SameSite=Lax`;
    }
    return response.data;
  },

  async getSession(): Promise<User> {
    const response = await apiClient.get<User>('/auths/');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    // Backend requires profile_image_url to be present
    const profileData = {
      name: data.name,
      profile_image_url: data.profile_image_url || '/user.png',
    };
    const response = await apiClient.post<User>('/auths/update/profile', profileData);
    return response.data;
  },

  async updatePassword(data: { 
    password: string; 
    new_password: string 
  }): Promise<{ message: string }> {
    const response = await apiClient.post('/auths/update/password', data);
    return response.data;
  },

  async signOut(): Promise<void> {
    localStorage.removeItem('token');
    // Remove cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/login';
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auths/forgot-password', { email });
    return response.data;
  },

  async resetPassword(data: {
    token: string;
    password: string;
  }): Promise<{ message: string }> {
    const response = await apiClient.post('/auths/reset-password', data);
    return response.data;
  },
};
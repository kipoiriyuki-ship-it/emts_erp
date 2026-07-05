import apiClient from './client';
import { normalizeAuthPayload, AuthPayload } from './auth-utils';
import type { User } from '@/lib/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse extends AuthPayload {
  user: User
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return normalizeAuthPayload(response.data);
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/refresh', { refresh_token: refreshToken });
    return normalizeAuthPayload(response.data);
  },

  me: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data?.data ?? response.data;
  },

  changePassword: async (data: { current_password: string; new_password: string; new_password_confirmation: string }) => {
    const response = await apiClient.post('/auth/change-password', data);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (data: { email: string; token: string; password: string; password_confirmation: string }) => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },
};

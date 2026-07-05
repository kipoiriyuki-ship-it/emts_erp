import apiClient from "./client";
import { normalizeAuthPayload, AuthPayload } from "./auth-utils";
import type { LoginResponse } from "./auth";

export interface License {
  id: number;
  code: string;
  type: 'TRIAL' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';
  max_users: number;
  max_projects: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  is_used: boolean;
  used_by_user_id: number | null;
  used_at: string | null;
  company_id?: number | null;
  modules_enabled?: string[] | null;
  device_limit?: number | null;
  status?: 'active' | 'inactive' | 'expired' | 'suspended';
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  company?: {
    id: number;
    name: string;
  };
}

export interface MyLicenseResponse {
  has_license: boolean;
  license: {
    code: string;
    type: string;
    max_users: number;
    max_projects: number;
    valid_from: string;
    valid_until: string | null;
  } | null;
}

export const licenseApi = {
  activateAccount: async (data: {
    activation_code: string;
  }): Promise<LoginResponse> => {
    const response = await apiClient.post('/license/activate', data);
    return normalizeAuthPayload(response.data) as LoginResponse;
  },

  activate: async (code: string) => {
    const response = await apiClient.post('/license/activate', { code });
    return response.data;
  },

  myLicense: async (): Promise<MyLicenseResponse> => {
    const response = await apiClient.get('/license/my');
    return response.data.data;
  },

  getAll: async (): Promise<{ licenses: License[] }> => {
    const response = await apiClient.get('/license');
    return response.data.data;
  },

  generate: async (data: {
    type: 'TRIAL' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';
    max_users: number;
    max_projects: number;
    valid_from: string;
    valid_until?: string;
  }) => {
    const response = await apiClient.post('/license/generate', data);
    return response.data;
  },

  deactivate: async (id: number) => {
    const response = await apiClient.post(`/license/${id}/deactivate`);
    return response.data;
  },
};

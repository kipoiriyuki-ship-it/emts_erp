import apiClient from './client';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  username?: string | null;
  company_id?: number | null;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  role_id: number | null;
  last_login_at: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  role?: {
    id: number;
    name: string;
    code: string;
    level: number;
    description: string | null;
    is_active: boolean;
  };
  license?: {
    id: number;
    code: string;
    type: string;
  };
}

export interface Role {
  id: number;
  name: string;
  code: string;
  level: number;
  description: string | null;
  is_active: boolean;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  code: string;
  module: string;
  description: string | null;
}

export const usersApi = {
  getUsers: async (params?: { role_id?: number; status?: string; search?: string; per_page?: number }) => {
    const response = await apiClient.get('/users', { params });
    return response.data.data;
  },

  getUser: async (id: number): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data.data;
  },

  createUser: async (data: {
    role_id: number | string;
    name: string;
    email: string;
    password: string;
    password_confirmation?: string;
    phone?: string;
    status: 'active' | 'inactive' | 'suspended' | 'pending';
    username?: string;
    nik?: string;
    gender?: string;
    address?: string;
    join_date?: string;
    position?: string;
    division?: string;
    first_name?: string;
    last_name?: string;
    employee_id?: string;
    hire_date?: string;
    employment_type?: string;
    employment_status?: string;
  }) => {
    const response = await apiClient.post('/users', {
      ...data,
      role_id: Number(data.role_id),
    });
    return response.data.data;
  },

  updateUser: async (id: number, data: {
    role_id?: number;
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    status?: 'active' | 'inactive' | 'suspended' | 'pending';
  }) => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data.data;
  },

  deleteUser: async (id: number) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  getRoles: async (): Promise<Role[]> => {
    const response = await apiClient.get('/users/roles');
    const payload = response.data.data;

    if (Array.isArray(payload)) {
      return payload;
    }

    if (payload?.roles && Array.isArray(payload.roles)) {
      return payload.roles;
    }

    if (payload?.data && Array.isArray(payload.data)) {
      return payload.data;
    }

    return [];
  },
};

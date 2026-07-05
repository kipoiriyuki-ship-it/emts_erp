import apiClient from "./client";
import { Permission } from "./users";

export type { Permission };

export interface Role {
  id: number;
  name: string;
  code: string;
  level: number;
  description: string | null;
  is_active: boolean;
  permissions?: Permission[];
}

export const rolesApi = {
  getRoles: async (params?: { is_active?: boolean; search?: string }): Promise<{ roles: Role[] }> => {
    const response = await apiClient.get('/roles', { params });
    return response.data.data;
  },

  getRole: async (id: number): Promise<Role> => {
    const response = await apiClient.get(`/roles/${id}`);
    return response.data.data;
  },

  createRole: async (data: {
    name: string;
    code: string;
    level: number;
    description?: string;
    is_active?: boolean;
    permissions?: number[];
  }) => {
    const response = await apiClient.post('/roles', data);
    return response.data.data;
  },

  updateRole: async (id: number, data: {
    name?: string;
    code?: string;
    level?: number;
    description?: string;
    is_active?: boolean;
    permissions?: number[];
  }) => {
    const response = await apiClient.put(`/roles/${id}`, data);
    return response.data.data;
  },

  deleteRole: async (id: number) => {
    const response = await apiClient.delete(`/roles/${id}`);
    return response.data;
  },

  getPermissions: async (): Promise<{ permissions: Permission[] }> => {
    const response = await apiClient.get('/roles/permissions');
    return response.data.data;
  },
};

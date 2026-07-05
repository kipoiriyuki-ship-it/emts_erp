import apiClient from "./client";

export interface Permission {
  id: number;
  name: string;
  code: string;
  module: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const permissionsApi = {
  getPermissions: async (params?: { module?: string; search?: string }): Promise<{ permissions: Permission[] }> => {
    const response = await apiClient.get('/permissions', { params });
    return response.data.data;
  },

  getPermission: async (id: number): Promise<Permission> => {
    const response = await apiClient.get(`/permissions/${id}`);
    return response.data.data;
  },

  createPermission: async (data: {
    name: string;
    code: string;
    module: string;
    description?: string;
  }) => {
    const response = await apiClient.post('/permissions', data);
    return response.data.data;
  },

  updatePermission: async (id: number, data: {
    name?: string;
    code?: string;
    module?: string;
    description?: string;
  }) => {
    const response = await apiClient.put(`/permissions/${id}`, data);
    return response.data.data;
  },

  deletePermission: async (id: number) => {
    const response = await apiClient.delete(`/permissions/${id}`);
    return response.data;
  },
};

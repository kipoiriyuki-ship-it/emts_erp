import apiClient from "./client";

export interface PendingUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
  code: string;
  level: number;
  is_active: boolean;
}

export const registrationApi = {
  getPending: async (): Promise<{ pending_users: PendingUser[] }> => {
    const response = await apiClient.get('/registrations/pending');
    return response.data.data;
  },

  approve: async (id: number, roleId: number) => {
    const response = await apiClient.post(`/registrations/${id}/approve`, { role_id: roleId });
    return response.data;
  },

  reject: async (id: number, reason: string) => {
    const response = await apiClient.post(`/registrations/${id}/reject`, { reason });
    return response.data;
  },

  getRoles: async (): Promise<{ roles: Role[] }> => {
    const response = await apiClient.get('/registrations/roles');
    return response.data.data;
  },
};

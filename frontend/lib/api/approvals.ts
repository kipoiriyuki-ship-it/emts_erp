import apiClient from './client';

export interface Approval {
  id: number;
  approvable_type: string;
  approvable_id: number;
  approver_id: number;
  status: 'pending' | 'approved' | 'rejected';
  current_level: number;
  required_level: number;
  action_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  approver?: {
    id: number;
    name: string;
  };
  approvable?: any;
}

export const approvalApi = {
  getPending: async (params?: { per_page?: number }) => {
    const response = await apiClient.get('/approvals/pending', { params });
    return response.data.data;
  },

  getApproved: async (params?: { per_page?: number }) => {
    const response = await apiClient.get('/approvals/approved', { params });
    return response.data.data;
  },

  getRejected: async (params?: { per_page?: number }) => {
    const response = await apiClient.get('/approvals/rejected', { params });
    return response.data.data;
  },

  approve: async (id: number, notes?: string) => {
    const response = await apiClient.post(`/approvals/${id}/approve`, { notes });
    return response.data;
  },

  reject: async (id: number, reason: string) => {
    const response = await apiClient.post(`/approvals/${id}/reject`, { reason });
    return response.data;
  },
};

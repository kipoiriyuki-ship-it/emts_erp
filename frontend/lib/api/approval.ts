import apiClient from './client';

export interface Approval {
  id: number;
  approvable_type: string;
  approvable_id: number;
  approver_id: number;
  status: 'pending' | 'approved' | 'rejected';
  action_at?: string;
  notes?: string;
  created_at: string;
  approvable?: any;
  approver?: any;
}

export const approvalApi = {
  pending: async (params?: { per_page?: number }) => {
    const response = await apiClient.get('/approvals/pending', { params });
    return response.data.data;
  },

  approved: async (params?: { per_page?: number }) => {
    const response = await apiClient.get('/approvals/approved', { params });
    return response.data.data;
  },

  rejected: async (params?: { per_page?: number }) => {
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

  returnRevision: async (id: number, reason: string) => {
    const response = await apiClient.post(`/approvals/${id}/return-revision`, { reason });
    return response.data;
  },
};

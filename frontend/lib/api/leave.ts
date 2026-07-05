import apiClient from "./client";

export type LeaveRequestInput = {
  type: 'annual' | 'sick' | 'personal' | 'unpaid' | 'maternity' | 'paternity';
  start_date: string;
  end_date: string;
  reason: string;
};

export interface LeaveRequest {
  id: number;
  user_id: number;
  type: 'annual' | 'sick' | 'personal' | 'unpaid' | 'maternity' | 'paternity';
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: number | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  approver?: {
    id: number;
    name: string;
    email: string;
  };
}

export const leaveApi = {
  getLeaveRequests: async (params?: {
    status?: string;
    type?: string;
    user_id?: number;
    start_date?: string;
    end_date?: string;
    per_page?: number;
  }) => {
    const response = await apiClient.get('/leave-requests', { params });
    return response.data.data;
  },

  getLeaveRequest: async (id: number): Promise<LeaveRequest> => {
    const response = await apiClient.get(`/leave-requests/${id}`);
    return response.data.data;
  },

  createLeaveRequest: async (data: LeaveRequestInput) => {
    const response = await apiClient.post('/leave-requests', data);
    return response.data.data;
  },

  updateLeaveRequest: async (id: number, data: Partial<LeaveRequestInput>) => {
    const response = await apiClient.put(`/leave-requests/${id}`, data);
    return response.data.data;
  },

  deleteLeaveRequest: async (id: number) => {
    const response = await apiClient.delete(`/leave-requests/${id}`);
    return response.data;
  },

  getMyRequests: async (params?: {
    status?: string;
    type?: string;
    per_page?: number;
  }) => {
    const response = await apiClient.get('/leave-requests/my', { params });
    return response.data.data;
  },

  getPendingRequests: async (params?: { per_page?: number }) => {
    const response = await apiClient.get('/leave-requests/pending', { params });
    return response.data.data;
  },

  approveRequest: async (id: number) => {
    const response = await apiClient.post(`/leave-requests/${id}/approve`);
    return response.data.data;
  },

  rejectRequest: async (id: number, reason: string) => {
    const response = await apiClient.post(`/leave-requests/${id}/reject`, { reason });
    return response.data.data;
  },
};

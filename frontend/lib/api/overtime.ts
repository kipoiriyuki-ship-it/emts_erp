import apiClient from "./client";

export interface OvertimeRecord {
  id: number;
  user_id: number;
  date: string;
  start_time: string;
  end_time: string;
  hours: number;
  type: 'regular' | 'weekend' | 'holiday';
  rate: number;
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

export const overtimeApi = {
  getOvertimeRecords: async (params?: {
    status?: string;
    type?: string;
    user_id?: number;
    start_date?: string;
    end_date?: string;
    per_page?: number;
  }) => {
    const response = await apiClient.get('/overtime', { params });
    return response.data.data;
  },

  getOvertimeRecord: async (id: number): Promise<OvertimeRecord> => {
    const response = await apiClient.get(`/overtime/${id}`);
    return response.data.data;
  },

  createOvertimeRecord: async (data: {
    date: string;
    start_time: string;
    end_time: string;
    type: string;
    reason: string;
  }) => {
    const response = await apiClient.post('/overtime', data);
    return response.data.data;
  },

  updateOvertimeRecord: async (id: number, data: Partial<OvertimeRecord>) => {
    const response = await apiClient.put(`/overtime/${id}`, data);
    return response.data.data;
  },

  deleteOvertimeRecord: async (id: number) => {
    const response = await apiClient.delete(`/overtime/${id}`);
    return response.data;
  },

  getMyRecords: async (params?: {
    status?: string;
    type?: string;
    per_page?: number;
  }) => {
    const response = await apiClient.get('/overtime/my', { params });
    return response.data.data;
  },

  getPendingRecords: async (params?: { per_page?: number }) => {
    const response = await apiClient.get('/overtime/pending', { params });
    return response.data.data;
  },

  approveRecord: async (id: number) => {
    const response = await apiClient.post(`/overtime/${id}/approve`);
    return response.data.data;
  },

  rejectRecord: async (id: number, reason: string) => {
    const response = await apiClient.post(`/overtime/${id}/reject`, { reason });
    return response.data.data;
  },
};

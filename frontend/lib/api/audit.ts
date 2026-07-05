import apiClient from './client';

export const auditApi = {
  getLogs: async (params?: { 
    user_id?: number;
    action?: string;
    start_date?: string;
    end_date?: string;
    per_page?: number;
  }) => {
    const response = await apiClient.get('/audit-logs', { params });
    return response.data;
  },
};

import apiClient from './client';

export interface OperationalExpense {
  id: number;
  category_id: number;
  amount: number;
  description: string;
  receipt_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  created_by: number;
  created_at: string;
  category?: {
    id: number;
    name: string;
  };
  creator?: any;
}

export interface LargeCashRequest {
  id: number;
  project_id?: number;
  purpose: string;
  amount: number;
  urgency: 'low' | 'medium' | 'high';
  description: string;
  documents_url?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submitted_at?: string;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  created_by: number;
  created_at: string;
  project?: {
    id: number;
    name: string;
  };
  creator?: any;
}

export const financeApi = {
  // Operational Expenses
  getOperationalExpenses: async (params?: { status?: string; category_id?: number; per_page?: number }) => {
    const response = await apiClient.get('/operational-expenses', { params });
    return response.data.data;
  },

  createOperationalExpense: async (data: {
    category_id: number;
    amount: number;
    description: string;
    receipt_url?: string;
  }) => {
    const response = await apiClient.post('/operational-expenses', data);
    return response.data.data;
  },

  approveExpense: async (id: number) => {
    const response = await apiClient.post(`/operational-expenses/${id}/approve`);
    return response.data;
  },

  rejectExpense: async (id: number, reason: string) => {
    const response = await apiClient.post(`/operational-expenses/${id}/reject`, { reason });
    return response.data;
  },

  // Large Cash Requests
  getLargeCashRequests: async (params?: { status?: string; project_id?: number; per_page?: number }) => {
    const response = await apiClient.get('/large-cash-requests', { params });
    return response.data.data;
  },

  createLargeCashRequest: async (data: {
    project_id?: number;
    purpose: string;
    amount: number;
    urgency: 'low' | 'medium' | 'high';
    description: string;
    documents_url?: string;
  }) => {
    const response = await apiClient.post('/large-cash-requests', data);
    return response.data.data;
  },

  submitRequest: async (id: number) => {
    const response = await apiClient.post(`/large-cash-requests/${id}/submit`);
    return response.data;
  },

  approveRequest: async (id: number) => {
    const response = await apiClient.post(`/large-cash-requests/${id}/approve`);
    return response.data;
  },

  rejectRequest: async (id: number, reason: string) => {
    const response = await apiClient.post(`/large-cash-requests/${id}/reject`, { reason });
    return response.data;
  },
};

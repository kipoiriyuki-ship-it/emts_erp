import apiClient from "./client";

export type PettyCashTransactionInput = {
  transaction_type: 'in' | 'out';
  amount: number;
  transaction_date: string;
  category_id?: number | null;
  description: string;
  notes?: string;
  receipt_number?: string;
  receipt_image?: string;
};

export interface PettyCashTransaction {
  id: number;
  transaction_number: string;
  transaction_type: 'in' | 'out';
  amount: number;
  transaction_date: string;
  category_id: number | null;
  description: string;
  notes: string | null;
  receipt_number: string | null;
  receipt_image: string | null;
  requester_id: number;
  approved_by: number | null;
  approved_at: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_by: number;
  created_at: string;
  updated_at: string;
  category?: {
    id: number;
    name: string;
  };
  requester?: {
    id: number;
    name: string;
  };
  approvedBy?: {
    id: number;
    name: string;
  };
  createdBy?: {
    id: number;
    name: string;
  };
}

export interface PettyCashSummary {
  total_in: number;
  total_out: number;
  balance: number;
}

export const pettyCashApi = {
  getTransactions: async (params?: {
    transaction_type?: string;
    status?: string;
    category_id?: number;
    start_date?: string;
    end_date?: string;
    search?: string;
    per_page?: number;
  }) => {
    const response = await apiClient.get('/petty-cash', { params });
    return response.data.data;
  },

  getTransaction: async (id: number): Promise<PettyCashTransaction> => {
    const response = await apiClient.get(`/petty-cash/${id}`);
    return response.data.data;
  },

  createTransaction: async (data: PettyCashTransactionInput) => {
    const response = await apiClient.post('/petty-cash', data);
    return response.data.data;
  },

  updateTransaction: async (id: number, data: Partial<PettyCashTransactionInput>) => {
    const response = await apiClient.put(`/petty-cash/${id}`, data);
    return response.data.data;
  },

  deleteTransaction: async (id: number) => {
    const response = await apiClient.delete(`/petty-cash/${id}`);
    return response.data;
  },

  approveTransaction: async (id: number) => {
    const response = await apiClient.post(`/petty-cash/${id}/approve`);
    return response.data.data;
  },

  rejectTransaction: async (id: number) => {
    const response = await apiClient.post(`/petty-cash/${id}/reject`);
    return response.data.data;
  },

  getSummary: async (params?: { start_date?: string; end_date?: string }): Promise<PettyCashSummary> => {
    const response = await apiClient.get('/petty-cash/summary', { params });
    return response.data.data;
  },
};

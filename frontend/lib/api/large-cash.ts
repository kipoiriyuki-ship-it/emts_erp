import apiClient from "./client";

export interface LargeCashItem {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export type LargeCashRequestInput = {
  project_id?: number | null;
  type: 'material' | 'vendor' | 'subcontractor' | 'asset' | 'project_payment';
  description?: string;
  evidence_image?: string;
  items: {
    description: string;
    quantity: number;
    unit_price: number;
  }[];
};

export interface LargeCashRequest {
  id: number;
  request_number: string;
  project_id: number | null;
  user_id: number;
  type: 'material' | 'vendor' | 'subcontractor' | 'asset' | 'project_payment';
  total_amount: number;
  description: string | null;
  evidence_image: string | null;
  status: 'draft' | 'submitted' | 'pending' | 'approved' | 'rejected';
  submitted_at: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  approved_by: number | null;
  approved_at: string | null;
  rejected_by: number | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  project?: {
    id: number;
    name: string;
  };
  user?: {
    id: number;
    name: string;
  };
  reviewer?: {
    id: number;
    name: string;
  };
  approver?: {
    id: number;
    name: string;
  };
  items?: LargeCashItem[];
}

export const largeCashApi = {
  getRequests: async (params?: {
    status?: string;
    type?: string;
    project_id?: number;
    start_date?: string;
    end_date?: string;
    search?: string;
    per_page?: number;
  }) => {
    const response = await apiClient.get('/large-cash', { params });
    return response.data.data;
  },

  getRequest: async (id: number): Promise<LargeCashRequest> => {
    const response = await apiClient.get(`/large-cash/${id}`);
    return response.data.data;
  },

  createRequest: async (data: LargeCashRequestInput) => {
    const response = await apiClient.post('/large-cash', data);
    return response.data.data;
  },

  updateRequest: async (id: number, data: Partial<LargeCashRequestInput>) => {
    const response = await apiClient.put(`/large-cash/${id}`, data);
    return response.data.data;
  },

  deleteRequest: async (id: number) => {
    const response = await apiClient.delete(`/large-cash/${id}`);
    return response.data;
  },

  submitRequest: async (id: number) => {
    const response = await apiClient.post(`/large-cash/${id}/submit`);
    return response.data.data;
  },

  approveRequest: async (id: number) => {
    const response = await apiClient.post(`/large-cash/${id}/approve`);
    return response.data.data;
  },

  rejectRequest: async (id: number, reason: string) => {
    const response = await apiClient.post(`/large-cash/${id}/reject`, { reason });
    return response.data.data;
  },
};

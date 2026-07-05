import apiClient from './client';

export interface Budget {
  id: number;
  budget_number: string;
  name: string;
  description: string | null;
  project_id: number | null;
  department_id: number | null;
  account_id: number | null;
  start_date: string;
  end_date: string;
  total_budget: number;
  actual_amount: number;
  remaining_amount: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  approved_by: number | null;
  approved_at: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  project?: any;
  department?: any;
  account?: any;
  details?: BudgetDetail[];
}

export interface BudgetDetail {
  id: number;
  budget_id: number;
  account_id: number;
  description: string;
  planned_amount: number;
  actual_amount: number;
  variance: number;
  variance_type: 'favorable' | 'unfavorable';
  account?: any;
}

export const budgetApi = {
  getBudgets: async (params?: { project_id?: number; department_id?: number; status?: string; per_page?: number }) => {
    const response = await apiClient.get('/budgets', { params });
    return response.data.data;
  },

  getBudget: async (id: number): Promise<Budget> => {
    const response = await apiClient.get(`/budgets/${id}`);
    return response.data.data;
  },

  createBudget: async (data: {
    name: string;
    description?: string;
    project_id?: number;
    department_id?: number;
    account_id?: number;
    start_date: string;
    end_date: string;
    total_budget: number;
  }) => {
    const response = await apiClient.post('/budgets', data);
    return response.data.data;
  },

  updateBudget: async (id: number, data: Partial<Budget>) => {
    const response = await apiClient.put(`/budgets/${id}`, data);
    return response.data.data;
  },

  deleteBudget: async (id: number) => {
    const response = await apiClient.delete(`/budgets/${id}`);
    return response.data;
  },

  approveBudget: async (id: number) => {
    const response = await apiClient.post(`/budgets/${id}/approve`);
    return response.data.data;
  },

  addDetail: async (id: number, data: {
    account_id: number;
    description: string;
    planned_amount: number;
  }) => {
    const response = await apiClient.post(`/budgets/${id}/details`, data);
    return response.data.data;
  },

  updateDetail: async (id: number, detailId: number, data: Partial<BudgetDetail>) => {
    const response = await apiClient.put(`/budgets/${id}/details/${detailId}`, data);
    return response.data.data;
  },

  getBudgetVsActual: async (id: number) => {
    const response = await apiClient.get(`/budgets/${id}/vs-actual`);
    return response.data.data;
  },
};

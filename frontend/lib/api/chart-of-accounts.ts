import apiClient from "./client";

export interface ChartOfAccount {
  id: number;
  account_number: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parent_id: number | null;
  level: number;
  balance_type: 'debit' | 'credit';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parent?: {
    id: number;
    account_number: string;
    account_name: string;
  };
  children?: ChartOfAccount[];
}

export type ChartOfAccountInput = {
  account_number: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parent_id?: number | null;
  balance_type: 'debit' | 'credit';
  is_active?: boolean;
};

export const chartOfAccountsApi = {
  getAccounts: async (params?: {
    account_type?: string;
    balance_type?: string;
    is_active?: boolean;
    parent_id?: number;
    search?: string;
    per_page?: number;
  }) => {
    const response = await apiClient.get('/chart-of-accounts', { params });
    return response.data.data;
  },

  getAccount: async (id: number): Promise<ChartOfAccount> => {
    const response = await apiClient.get(`/chart-of-accounts/${id}`);
    return response.data.data;
  },

  createAccount: async (data: ChartOfAccountInput) => {
    const response = await apiClient.post('/chart-of-accounts', data);
    return response.data.data;
  },

  updateAccount: async (id: number, data: Partial<ChartOfAccountInput>) => {
    const response = await apiClient.put(`/chart-of-accounts/${id}`, data);
    return response.data.data;
  },

  deleteAccount: async (id: number) => {
    const response = await apiClient.delete(`/chart-of-accounts/${id}`);
    return response.data;
  },

  getTree: async (): Promise<ChartOfAccount[]> => {
    const response = await apiClient.get('/chart-of-accounts/tree');
    return response.data.data;
  },
};

import apiClient from './client';

export interface ChartOfAccount {
  id: number;
  account_number: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parent_id?: number;
  level: number;
  balance_type: 'debit' | 'credit';
  is_active: boolean;
  children?: ChartOfAccount[];
  parent?: ChartOfAccount;
}

export interface JournalItem {
  id: number;
  journal_id: number;
  account_id: number;
  debit: number;
  credit: number;
  description?: string;
  account?: ChartOfAccount;
}

export interface JournalEntry {
  id: number;
  journal_number: string;
  date: string;
  description?: string;
  period: string;
  status: 'draft' | 'posted';
  created_by: number;
  approved_by?: number;
  created_at: string;
  items?: JournalItem[];
  creator?: any;
  approver?: any;
}

export interface LedgerEntry {
  id: number;
  account_id: number;
  journal_item_id: number;
  date: string;
  debit: number;
  credit: number;
  running_balance: number;
  journal_item?: JournalItem;
}

export const accountingApi = {
  // Chart of Accounts
  getCOA: async (params?: { type?: string; is_active?: boolean }) => {
    const response = await apiClient.get('/chart-of-accounts', { params });
    return response.data.data;
  },

  createCOA: async (data: {
    account_number: string;
    account_name: string;
    account_type: string;
    parent_id?: number;
    balance_type: string;
  }) => {
    const response = await apiClient.post('/chart-of-accounts', data);
    return response.data.data;
  },

  getCOADetail: async (id: number): Promise<ChartOfAccount> => {
    const response = await apiClient.get(`/chart-of-accounts/${id}`);
    return response.data.data;
  },

  updateCOA: async (id: number, data: { account_name?: string; is_active?: boolean }) => {
    const response = await apiClient.put(`/chart-of-accounts/${id}`, data);
    return response.data.data;
  },

  deleteCOA: async (id: number) => {
    const response = await apiClient.delete(`/chart-of-accounts/${id}`);
    return response.data;
  },

  // Journal Entries
  getJournals: async (params?: { status?: string; period?: string; start_date?: string; end_date?: string; per_page?: number }) => {
    const response = await apiClient.get('/journal-entries', { params });
    return response.data.data;
  },

  createJournal: async (data: {
    date: string;
    description?: string;
    items: Array<{
      account_id: number;
      debit: number;
      credit: number;
      description?: string;
    }>;
  }) => {
    const response = await apiClient.post('/journal-entries', data);
    return response.data.data;
  },

  getJournalDetail: async (id: number): Promise<JournalEntry> => {
    const response = await apiClient.get(`/journal-entries/${id}`);
    return response.data.data;
  },

  updateJournal: async (id: number, data: { date?: string; description?: string }) => {
    const response = await apiClient.put(`/journal-entries/${id}`, data);
    return response.data.data;
  },

  postJournal: async (id: number) => {
    const response = await apiClient.post(`/journal-entries/${id}/post`);
    return response.data;
  },

  deleteJournal: async (id: number) => {
    const response = await apiClient.delete(`/journal-entries/${id}`);
    return response.data;
  },

  // Ledger
  getLedger: async (params: { account_id: number; start_date?: string; end_date?: string }) => {
    const response = await apiClient.get('/ledger', { params });
    return response.data.data;
  },
};

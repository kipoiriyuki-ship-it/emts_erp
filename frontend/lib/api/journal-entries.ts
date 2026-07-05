import apiClient from "./client";

export interface JournalItem {
  id: number;
  journal_id: number;
  account_id: number;
  debit: number;
  credit: number;
  description: string | null;
  account?: {
    id: number;
    account_number: string;
    account_name: string;
  };
}

export type JournalEntryInput = {
  date: string;
  description?: string;
  period: string;
  items: {
    account_id: number;
    debit: number;
    credit: number;
    description?: string;
  }[];
};

export interface JournalEntry {
  id: number;
  journal_number: string;
  date: string;
  description: string | null;
  period: string;
  status: 'draft' | 'posted' | 'cancelled';
  created_by: number;
  approved_by: number | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  creator?: {
    id: number;
    name: string;
  };
  approver?: {
    id: number;
    name: string;
  };
  items?: JournalItem[];
}

export const journalEntriesApi = {
  getEntries: async (params?: {
    status?: string;
    period?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    per_page?: number;
  }) => {
    const response = await apiClient.get('/journal-entries', { params });
    return response.data.data;
  },

  getEntry: async (id: number): Promise<JournalEntry> => {
    const response = await apiClient.get(`/journal-entries/${id}`);
    return response.data.data;
  },

  createEntry: async (data: JournalEntryInput) => {
    const response = await apiClient.post('/journal-entries', data);
    return response.data.data;
  },

  updateEntry: async (id: number, data: Partial<JournalEntryInput>) => {
    const response = await apiClient.put(`/journal-entries/${id}`, data);
    return response.data.data;
  },

  deleteEntry: async (id: number) => {
    const response = await apiClient.delete(`/journal-entries/${id}`);
    return response.data;
  },

  postEntry: async (id: number) => {
    const response = await apiClient.post(`/journal-entries/${id}/post`);
    return response.data.data;
  },

  cancelEntry: async (id: number) => {
    const response = await apiClient.post(`/journal-entries/${id}/cancel`);
    return response.data.data;
  },

  getAccounts: async () => {
    const response = await apiClient.get('/journal-entries/accounts');
    return response.data.data;
  },
};

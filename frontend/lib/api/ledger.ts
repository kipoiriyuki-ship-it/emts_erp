import apiClient from "./client";

export interface LedgerEntry {
  id: number;
  account_id: number;
  journal_item_id: number;
  date: string;
  debit: number;
  credit: number;
  description: string | null;
  reference_type: string | null;
  reference_id: number | null;
  balance?: number;
  account?: {
    id: number;
    account_number: string;
    account_name: string;
    balance_type: string;
  };
  journalItem?: {
    id: number;
    journal?: {
      id: number;
      journal_number: string;
      description: string | null;
    };
  };
}

export interface AccountLedger {
  account: {
    id: number;
    account_number: string;
    account_name: string;
    account_type: string;
    balance_type: string;
  };
  opening_balance: number;
  entries: LedgerEntry[];
  closing_balance: number;
}

export const ledgerApi = {
  getEntries: async (params?: {
    account_id?: number;
    start_date?: string;
    end_date?: string;
    per_page?: number;
  }) => {
    const response = await apiClient.get('/ledger', { params });
    return response.data.data;
  },

  getEntry: async (id: number): Promise<LedgerEntry> => {
    const response = await apiClient.get(`/ledger/${id}`);
    return response.data.data;
  },

  getAccountLedger: async (accountId: number, params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<AccountLedger> => {
    const response = await apiClient.get(`/ledger/account/${accountId}`, { params });
    return response.data.data;
  },

  getAccounts: async () => {
    const response = await apiClient.get('/ledger/accounts');
    return response.data.data;
  },
};

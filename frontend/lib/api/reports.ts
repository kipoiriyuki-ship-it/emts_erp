import apiClient from './client';

export interface TrialBalanceAccount {
  account_number: string;
  account_name: string;
  account_type: string;
  debit: number;
  credit: number;
}

export interface TrialBalanceReport {
  as_of_date: string;
  accounts: TrialBalanceAccount[];
  total_debits: number;
  total_credits: number;
  is_balanced: boolean;
}

export interface ProfitLossReport {
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_revenue: number;
    total_expenses: number;
    net_profit: number;
    profit_margin: number;
  };
  revenue: any[];
  expenses: any[];
}

export interface BalanceSheetAccount {
  id: number;
  account_number: string;
  account_name: string;
  balance: number;
}

export interface BalanceSheetReport {
  as_of_date: string;
  summary: {
    total_assets: number;
    total_liabilities: number;
    total_equity: number;
    total_liabilities_equity: number;
  };
  assets: BalanceSheetAccount[];
  liabilities: BalanceSheetAccount[];
  equity: BalanceSheetAccount[];
}

export interface CashFlowReport {
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_inflow: number;
    total_outflow: number;
    net_cash_flow: number;
  };
  inflows: any[];
  outflows: any[];
}

export const reportsApi = {
  trialBalance: async (as_of_date: string): Promise<TrialBalanceReport> => {
    const response = await apiClient.get('/reports/trial-balance', { params: { as_of_date } });
    return response.data.data;
  },

  profitLoss: async (params: { start_date: string; end_date: string }): Promise<ProfitLossReport> => {
    const response = await apiClient.get('/reports/profit-loss', { params });
    return response.data.data;
  },

  balanceSheet: async (as_of_date: string): Promise<BalanceSheetReport> => {
    const response = await apiClient.get('/reports/balance-sheet', { params: { as_of_date } });
    return response.data.data;
  },

  cashFlow: async (params: { start_date: string; end_date: string }): Promise<CashFlowReport> => {
    const response = await apiClient.get('/reports/cash-flow', { params });
    return response.data.data;
  },
};

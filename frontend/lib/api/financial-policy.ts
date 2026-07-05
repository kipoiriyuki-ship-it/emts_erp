import apiClient from './client';

export interface FinancialPolicy {
  id: number;
  petty_cash_approval_limit: number;
  large_cash_always_require_approval: boolean;
  maximum_petty_cash_per_day: number;
  maximum_petty_cash_per_employee: number;
  maximum_cash_request_per_project: number;
  created_at: string;
  updated_at: string;
}

export const financialPolicyApi = {
  getPolicy: async (): Promise<FinancialPolicy> => {
    const response = await apiClient.get('/financial-policy');
    return response.data.data;
  },

  updatePolicy: async (data: {
    petty_cash_approval_limit: number;
    large_cash_always_require_approval: boolean;
    maximum_petty_cash_per_day: number;
    maximum_petty_cash_per_employee: number;
    maximum_cash_request_per_project: number;
  }): Promise<FinancialPolicy> => {
    const response = await apiClient.put('/financial-policy', data);
    return response.data.data;
  },
};

import apiClient from "./client";

export interface Payroll {
  id: number;
  employee_id: number;
  period: string;
  start_date: string;
  end_date: string;
  basic_salary: number;
  overtime_hours: number;
  overtime_pay: number;
  allowances: number;
  deductions: number;
  tax: number;
  insurance: number;
  net_salary: number;
  status: 'draft' | 'processed' | 'paid';
  processed_by: number | null;
  processed_at: string | null;
  paid_by: number | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  employee?: {
    id: number;
    first_name: string;
    last_name: string;
    user?: {
      id: number;
      name: string;
      email: string;
    };
  };
  processor?: {
    id: number;
    name: string;
  };
  payer?: {
    id: number;
    name: string;
  };
}

export const payrollApi = {
  getPayrolls: async (params?: {
    period?: string;
    status?: string;
    employee_id?: number;
    start_date?: string;
    end_date?: string;
    per_page?: number;
  }) => {
    const response = await apiClient.get('/payroll', { params });
    return response.data.data;
  },

  getPayroll: async (id: number): Promise<Payroll> => {
    const response = await apiClient.get(`/payroll/${id}`);
    return response.data.data;
  },

  createPayroll: async (data: {
    employee_id: number;
    period: string;
    start_date: string;
    end_date: string;
    basic_salary: number;
    allowances?: number;
    deductions?: number;
    tax?: number;
    insurance?: number;
    notes?: string;
  }) => {
    const response = await apiClient.post('/payroll', data);
    return response.data.data;
  },

  updatePayroll: async (id: number, data: Partial<Payroll>) => {
    const response = await apiClient.put(`/payroll/${id}`, data);
    return response.data.data;
  },

  deletePayroll: async (id: number) => {
    const response = await apiClient.delete(`/payroll/${id}`);
    return response.data;
  },

  processPayroll: async (id: number) => {
    const response = await apiClient.post(`/payroll/${id}/process`);
    return response.data.data;
  },

  markAsPaid: async (id: number) => {
    const response = await apiClient.post(`/payroll/${id}/pay`);
    return response.data.data;
  },

  generatePeriod: async (data: {
    period: string;
    start_date: string;
    end_date: string;
  }) => {
    const response = await apiClient.post('/payroll/generate', data);
    return response.data.data;
  },
};

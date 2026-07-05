import apiClient from './client';
import { User, Attendance, OperationalExpense } from '@/lib/types';

export interface DashboardStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  avg_progress: number;
  cash_flow_this_month: number;
  revenue: number;
  expenses: number;
  cash_balance: number;
  bank_balance: number;
  pending_approvals: number;
  attendance_today: number;
  total_employees: number;
}

export interface AdminDashboardData {
  attendance: {
    today_present: number;
    today_late: number;
    today_absent: number;
  };
  expenses: {
    today_expenses: number;
    pending_expenses: number;
  };
  recent_attendance: Attendance[];
}

export interface FieldMonitoringStats {
  total_records: number;
  today_records: number;
  this_month_records: number;
}

export interface DirectorDashboardData {
  stats: {
    total_projects: number;
    active_projects: number;
    completed_projects: number;
    total_progress: number;
    total_contract_value: number;
  };
  financial: {
    cash_balance: number;
    bank_balance: number;
    monthly_income: number;
    monthly_expense: number;
    monthly_profit: number;
  };
  approvals: {
    pending_cash_requests: number;
    pending_expenses: number;
  };
  field_monitoring: FieldMonitoringStats;
  recent_projects: any[];
}

export interface AccountingDashboardData {
  financial: {
    cash_balance: number;
    bank_balance: number;
    monthly_revenue: number;
    monthly_expense: number;
  };
  journal: {
    today_entries: number;
    pending_journals: number;
  };
  recent_journals: any[];
}

export interface ManagerDashboardData {
  projects: {
    total: number;
    active: number;
    completed: number;
    avg_progress: number;
  };
  my_projects: any[];
  today_tasks: any[];
  recent_progress: any[];
}

export interface EmployeeDashboardData {
  attendance: {
    today_status: string;
    this_month_present: number;
  };
  projects: any[];
  today_schedule: any[];
  reminders: any[];
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/dashboard');
    return response.data.data;
  },

  getCharts: async (): Promise<any> => {
    const response = await apiClient.get('/dashboard/charts');
    return response.data.data;
  },

  getAdminDashboard: async (): Promise<AdminDashboardData> => {
    const response = await apiClient.get('/dashboard');
    return response.data.data;
  },

  getDirectorDashboard: async (): Promise<DirectorDashboardData> => {
    const response = await apiClient.get('/dashboard');
    return response.data.data;
  },

  getAccountingDashboard: async (): Promise<AccountingDashboardData> => {
    const response = await apiClient.get('/dashboard');
    return response.data.data;
  },

  getManagerDashboard: async (): Promise<ManagerDashboardData> => {
    const response = await apiClient.get('/dashboard');
    return response.data.data;
  },

  getEmployeeDashboard: async (): Promise<EmployeeDashboardData> => {
    const response = await apiClient.get('/dashboard');
    return response.data.data;
  },
};

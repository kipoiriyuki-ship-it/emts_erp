export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: Role;
  permissions: string[];
  last_login_at?: string;
}

export interface Role {
  id: number;
  name: string;
  code: string;
  level: number;
}

export interface Project {
  id: number;
  project_number: string;
  name: string;
  client_name: string;
  location?: string;
  contract_value: number;
  start_date: string;
  end_date?: string;
  manager_id: number;
  status: "planning" | "running" | "hold" | "completed" | "cancelled";
  progress: number;
  description?: string;
  manager?: User;
  members?: ProjectMember[];
}

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  role: string;
  joined_at: string;
  user?: User;
}

export interface Attendance {
  id: number;
  user_id: number;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  check_in_lat?: number;
  check_in_lng?: number;
  check_out_lat?: number;
  check_out_lng?: number;
  work_hours: number;
  status: "present" | "absent" | "late" | "half_day" | "leave";
  notes?: string;
  user?: User;
}

export interface OperationalExpense {
  id: number;
  category_id: number;
  user_id: number;
  date: string;
  amount: number;
  description?: string;
  receipt_url?: string;
  approved_by?: number;
  approved_at?: string;
  status: "pending" | "approved" | "rejected";
  category?: ExpenseCategory;
  user?: User;
  approver?: User;
}

export interface ExpenseCategory {
  id: number;
  name: string;
  code: string;
  type: "operational" | "large" | "all";
  description?: string;
}

export interface LargeCashRequest {
  id: number;
  request_number: string;
  project_id?: number;
  user_id: number;
  type: "material" | "vendor" | "subcontractor" | "asset" | "project_payment";
  total_amount: number;
  description?: string;
  status: "draft" | "submitted" | "pending" | "approved" | "rejected";
  submitted_at?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  approved_by?: number;
  approved_at?: string;
  rejected_by?: number;
  rejected_at?: string;
  rejection_reason?: string;
  project?: Project;
  user?: User;
  approver?: User;
}

export interface ChartOfAccount {
  id: number;
  account_number: string;
  account_name: string;
  account_type: "asset" | "liability" | "equity" | "revenue" | "expense";
  parent_id?: number;
  level: number;
  balance_type: "debit" | "credit";
  is_active: boolean;
}

export interface JournalEntry {
  id: number;
  journal_number: string;
  date: string;
  description?: string;
  period: string;
  status: "draft" | "posted" | "cancelled";
  created_by: number;
  approved_by?: number;
  approved_at?: string;
  creator?: User;
  approver?: User;
  items?: JournalItem[];
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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

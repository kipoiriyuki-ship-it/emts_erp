import apiClient from "./client";

export interface Employee {
  id: number;
  company_id?: number | null;
  role_id?: number;
  user_id?: number;
  employee_id?: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string | null;
  gender?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  department_id?: number | null;
  position_id?: number | null;
  hire_date?: string | null;
  employment_type?: string;
  employment_status?: string;
  salary?: number | string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relationship?: string | null;
  education_level?: string | null;
  institution?: string | null;
  degree?: string | null;
  skills?: string | null;
  notes?: string | null;
  name?: string;
  email?: string;
  username?: string | null;
  password?: string;
  nik?: string | null;
  join_date?: string | null;
  position?: string | Position | null;
  division?: string | null;
  avatar?: string | null;
  status?: string;
  last_login_at?: string | null;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
  role?: {
    id: number;
    name: string;
    code: string;
    description: string | null;
    level: number;
  };
  user?: {
    id: number;
    name: string;
    email: string;
    username?: string | null;
  };
  department?: Department;
  company?: {
    id: number;
    name: string;
    code: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    tax_id: string | null;
    status: string;
  };
}

export interface Department {
  id: number;
  name: string;
  code?: string | null;
  description?: string | null;
  status?: string;
  manager_id?: number | null;
}

export interface Position {
  id: number;
  name: string;
  code?: string | null;
  description?: string | null;
  status?: string;
  department_id?: number | null;
}

export const employeesApi = {
  getEmployees: async (params?: {
    division?: string;
    position?: string;
    status?: string;
    search?: string;
    per_page?: number;
  }) => {
    const response = await apiClient.get('/employees', { params });
    return response.data.data;
  },

  getEmployee: async (id: number): Promise<Employee> => {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data.data;
  },

  getEmployeeAttendance: async (id: number, params?: {
    start_date?: string;
    end_date?: string;
    status?: string;
    per_page?: number;
  }) => {
    const response = await apiClient.get(`/employees/${id}/attendance`, { params });
    return response.data.data;
  },

  getEmployeeProjects: async (id: number, params?: {
    per_page?: number;
  }) => {
    const response = await apiClient.get(`/employees/${id}/projects`, { params });
    return response.data.data;
  },

  getEmployeeApprovals: async (id: number, params?: {
    per_page?: number;
  }) => {
    const response = await apiClient.get(`/employees/${id}/approvals`, { params });
    return response.data.data;
  },

  getEmployeeLoginHistory: async (id: number, params?: {
    per_page?: number;
  }) => {
    const response = await apiClient.get(`/employees/${id}/login-history`, { params });
    return response.data.data;
  },

  getEmployeeActivityHistory: async (id: number, params?: {
    per_page?: number;
  }) => {
    const response = await apiClient.get(`/employees/${id}/activity-history`, { params });
    return response.data.data;
  },

  getDepartments: async () => {
    const response = await apiClient.get('/employees/departments');
    return response.data.data;
  },

  getPositions: async () => {
    const response = await apiClient.get('/employees/positions');
    return response.data.data;
  },

  createEmployee: async (data: {
    user_id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    date_of_birth?: string;
    gender?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    department_id?: number;
    position_id?: number;
    hire_date?: string;
    employment_type?: string;
    employment_status?: string;
    salary?: number;
    bank_name?: string;
    bank_account_number?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
    education_level?: string;
    institution?: string;
    degree?: string;
    skills?: string;
    notes?: string;
  }) => {
    const response = await apiClient.post('/employees', data);
    return response.data.data;
  },

  updateEmployee: async (id: number, data: {
    user_id?: number;
    employee_id?: string;
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    gender?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    department_id?: number;
    position_id?: number;
    hire_date?: string;
    employment_type?: string;
    employment_status?: string;
    salary?: number;
    bank_name?: string;
    bank_account_number?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
    education_level?: string;
    institution?: string;
    degree?: string;
    skills?: string;
    notes?: string;
  }) => {
    const response = await apiClient.put(`/employees/${id}`, data);
    return response.data.data;
  },

  deleteEmployee: async (id: number) => {
    const response = await apiClient.delete(`/employees/${id}`);
    return response.data;
  },

  deactivateEmployee: async (id: number) => {
    const response = await apiClient.post(`/employees/${id}/deactivate`);
    return response.data;
  },

  activateEmployee: async (id: number) => {
    const response = await apiClient.post(`/employees/${id}/activate`);
    return response.data;
  },
};

import apiClient from './client';
import { getApiBaseUrl } from './config';

export interface Project {
  id: number;
  project_number: string;
  name: string;
  client_name: string;
  location: string | null;
  contract_value: number;
  start_date: string;
  end_date: string | null;
  manager_id: number;
  status: 'planning' | 'running' | 'hold' | 'completed' | 'cancelled';
  progress: number;
  description: string | null;
  created_at: string;
  updated_at: string;
  manager?: {
    id: number;
    name: string;
  };
  members?: any[];
  progressRecords?: any[];
  milestones?: any[];
  documents?: ProjectDoc[];
}

export interface ProjectDoc {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_by: number | null;
  created_at: string;
  updated_at: string;
  uploader?: {
    id: number;
    name: string;
  };
}

export interface ProjectProgress {
  id: number;
  project_id: number;
  date: string;
  percentage: number;
  description: string | null;
  challenges: string | null;
  solutions: string | null;
  created_by: number;
  created_at: string;
}

export interface ProjectMilestone {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  progress: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const projectsApi = {
  getProjects: async (params?: { status?: string; per_page?: number }) => {
    const response = await apiClient.get('/projects', { params });
    return response.data.data;
  },

  getProject: async (id: number): Promise<Project> => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data.data;
  },

  createProject: async (data: {
    name: string;
    client_name: string;
    location?: string;
    contract_value: number;
    start_date: string;
    end_date?: string;
    description?: string;
  }) => {
    const response = await apiClient.post('/projects', data);
    return response.data.data;
  },

  updateProject: async (id: number, data: Partial<Project>) => {
    const response = await apiClient.put(`/projects/${id}`, data);
    return response.data.data;
  },

  deleteProject: async (id: number) => {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
  },

  addProgress: async (id: number, data: {
    date: string;
    percentage: number;
    description?: string;
    challenges?: string;
    solutions?: string;
  }) => {
    const response = await apiClient.post(`/projects/${id}/progress`, data);
    return response.data.data;
  },

  getMembers: async (id: number) => {
    const response = await apiClient.get(`/projects/${id}/members`);
    return response.data.data;
  },

  addMember: async (id: number, data: { user_id: number; role: string }) => {
    const response = await apiClient.post(`/projects/${id}/members`, data);
    return response.data.data;
  },

  removeMember: async (id: number, userId: number) => {
    const response = await apiClient.delete(`/projects/${id}/members/${userId}`);
    return response.data;
  },

  getMilestones: async (id: number): Promise<ProjectMilestone[]> => {
    const response = await apiClient.get(`/projects/${id}/milestones`);
    return response.data.data;
  },

  addMilestone: async (id: number, data: {
    title: string;
    description?: string;
    due_date: string;
  }) => {
    const response = await apiClient.post(`/projects/${id}/milestones`, data);
    return response.data.data;
  },

  updateMilestone: async (id: number, milestoneId: number, data: Partial<ProjectMilestone>) => {
    const response = await apiClient.put(`/projects/${id}/milestones/${milestoneId}`, data);
    return response.data.data;
  },

  getBudgetSummary: async (id: number) => {
    const response = await apiClient.get(`/projects/${id}/budget-summary`);
    return response.data.data;
  },

  getTimeline: async (id: number) => {
    const response = await apiClient.get(`/projects/${id}/timeline`);
    return response.data.data;
  },

  getActivityLogs: async (id: number) => {
    const response = await apiClient.get(`/projects/${id}/activity-logs`);
    return response.data.data;
  },

  getDocuments: async (id: number) => {
    const response = await apiClient.get(`/projects/${id}/documents`);
    return response.data.data;
  },

  uploadDocument: async (id: number, data: {
    title: string;
    description?: string;
    file_base64: string;
    file_name: string;
    file_type: string;
    file_size: number;
  }) => {
    const response = await apiClient.post(`/projects/${id}/documents`, data);
    return response.data.data;
  },

  downloadDocument: async (projectId: number, documentId: number) => {
    window.open(`${getApiBaseUrl()}/projects/${projectId}/documents/${documentId}`, '_blank', 'noopener,noreferrer');
  },

  deleteDocument: async (projectId: number, documentId: number) => {
    const response = await apiClient.delete(`/projects/${projectId}/documents/${documentId}`);
    return response.data;
  },
};

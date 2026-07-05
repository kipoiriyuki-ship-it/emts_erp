import apiClient from './client';

export interface FieldMonitoringMedia {
  id: number;
  field_monitoring_id: number;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface FieldMonitoringRecord {
  id: number;
  project_id: number;
  area: string;
  location: string;
  workers: string[] | null;
  supervisors: string[] | null;
  monitoring_date: string;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  project?: {
    id: number;
    name: string;
    client_name: string;
  };
  createdBy?: {
    id: number;
    name: string;
  };
  media?: FieldMonitoringMedia[];
}

export const fieldMonitoringApi = {
  getRecords: async (params?: Record<string, any>) => {
    const response = await apiClient.get('/field-monitoring', { params });
    return response.data.data;
  },

  getRecord: async (id: number) => {
    const response = await apiClient.get(`/field-monitoring/${id}`);
    return response.data.data;
  },

  createRecord: async (data: {
    project_id: number;
    area: string;
    location: string;
    workers?: string[];
    supervisors?: string[];
    monitoring_date: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
    media?: Array<{
      file_base64: string;
      file_name: string;
      file_type: string;
      file_size: number;
    }>;
  }) => {
    const response = await apiClient.post('/field-monitoring', data);
    return response.data.data;
  },
};

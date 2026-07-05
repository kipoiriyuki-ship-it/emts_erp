import apiClient from './client';

export interface CheckInRequest {
  lat: number;
  lng: number;
  photo_url?: string;
}

export interface CheckOutRequest {
  lat?: number;
  lng?: number;
  photo_url?: string;
  notes?: string;
}

export interface Attendance {
  id: number;
  user_id: number;
  date: string;
  check_in_time: string;
  check_out_time?: string;
  check_in_lat: number;
  check_in_lng: number;
  check_out_lat?: number;
  check_out_lng?: number;
  status: 'present' | 'late' | 'absent';
  work_hours?: number;
  notes?: string;
}

export const attendanceApi = {
  checkIn: async (data: CheckInRequest): Promise<Attendance> => {
    const response = await apiClient.post('/attendance/check-in', data);
    return response.data.data;
  },

  checkOut: async (data: CheckOutRequest): Promise<Attendance> => {
    const response = await apiClient.post('/attendance/check-out', data);
    return response.data.data;
  },

  myAttendance: async (params?: { start_date?: string; end_date?: string; per_page?: number }) => {
    const response = await apiClient.get('/attendance/my', { params });
    return response.data.data;
  },

  allAttendance: async (params?: { start_date?: string; end_date?: string; status?: string; user_id?: number; per_page?: number }) => {
    const response = await apiClient.get('/attendance/all', { params });
    return response.data.data;
  },

  requestLeave: async (data: { type: string; start_date: string; end_date: string; reason: string }) => {
    const response = await apiClient.post('/attendance/leave', data);
    return response.data.data;
  },
};

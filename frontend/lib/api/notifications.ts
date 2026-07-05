import apiClient from "./client";

export interface AppNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  read_at: string | null;
  link: string | null;
  data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export const notificationsApi = {
  getAll: async (params?: { per_page?: number; unread_only?: boolean }) => {
    const response = await apiClient.get("/notifications", { params });
    return response.data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get("/notifications/unread-count");
    return response.data.data?.count ?? 0;
  },

  markAsRead: async (id: number) => {
    const response = await apiClient.post(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.post("/notifications/read-all");
    return response.data;
  },
};

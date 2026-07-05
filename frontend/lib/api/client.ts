import axios from "axios";
import { useAuthStore } from "@/lib/store/auth-store";
import { normalizeAuthPayload } from "./auth-utils";
import { getApiBaseUrl } from "./config";

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

const clearAuthSession = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("remember_login");
    useAuthStore.getState().logout();
    window.location.href = "/login";
  }
};

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url ?? "";

    const isAuthRoute = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/refresh");

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          clearAuthSession();
          return Promise.reject(error);
        }

        const baseURL = getApiBaseUrl();
        const response = await axios.post(`${baseURL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const payload = normalizeAuthPayload(response.data);
        const accessToken = payload.access_token ?? payload.token;

        if (!accessToken) {
          clearAuthSession();
          return Promise.reject(error);
        }

        localStorage.setItem("access_token", accessToken);
        if (payload.refresh_token) {
          localStorage.setItem("refresh_token", payload.refresh_token);
        }

        if (payload.user) {
          useAuthStore.getState().setAuth(payload.user, accessToken, payload.license_status);
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        useAuthStore.getState().logout();
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

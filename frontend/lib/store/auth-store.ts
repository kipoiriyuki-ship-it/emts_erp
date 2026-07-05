import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  token: string | null;
  licenseStatus: 'waiting' | 'active' | string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string, licenseStatus?: 'waiting' | 'active' | string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      licenseStatus: null,
      isAuthenticated: false,
      setAuth: (user, token, licenseStatus) =>
        set((current) => ({
          user,
          token,
          licenseStatus: licenseStatus === undefined ? current.licenseStatus : licenseStatus,
          isAuthenticated: true,
        })),
      logout: () =>
        set({
          user: null,
          token: null,
          licenseStatus: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);

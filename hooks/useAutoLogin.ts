import { useEffect } from "react";
import { create } from "zustand";
import { autoLoginAPI } from "@/lib/_api/auto_login";

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  status: boolean;
  avatar_url?: string;
  address?: string;
  verified: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  performAutoLogin: () => Promise<void>;
  logout: () => void;
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

// 1. Khởi tạo Zustand Store lưu trữ trạng thái đăng nhập toàn cục (Global State)
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false, // Kiểm tra xem đã thực hiện auto login lần đầu chưa
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  performAutoLogin: async () => {
    // Nếu đã initialized rồi thì không gọi lại API nữa để tránh loop/nhiều request thừa
    if (get().initialized) return;

    try {
      set({ loading: true });
      const token = getCookie("access_token");
      
      // Fallback: Read Google user profile from localStorage first
      let localUser: any = null;
      if (typeof window !== "undefined") {
        const rawLocal = localStorage.getItem("user");
        if (rawLocal) {
          try {
            localUser = JSON.parse(rawLocal);
          } catch (_) {}
        }
      }

      if (!token) {
        set({ user: null, initialized: true });
        localStorage.removeItem("user");
        return;
      }

      // If we have local user profile details, temporarily populate state to prevent UI flicker
      if (localUser) {
        set({ user: localUser });
      }

      const response = await autoLoginAPI(token);

      if (response.data && response.data.valid && response.data.data) {
        const userData = response.data.data;
        // Merge local data details (like Google image URL) if backend returns empty avatar_url
        if (!userData.avatar_url && localUser?.image) {
          userData.avatar_url = localUser.image;
        }
        if (!userData.avatar_url && localUser?.avatar_url) {
          userData.avatar_url = localUser.avatar_url;
        }
        set({ user: userData, initialized: true });
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        set({ user: null, initialized: true });
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.warn("Lỗi tự động đăng nhập:", error);
      set({ user: null, initialized: true });
      localStorage.removeItem("user");
    } finally {
      set({ loading: false });
    }
  },
  logout: () => {
    set({ user: null, initialized: false });
    localStorage.removeItem("user");
    // Xóa access_token trong Cookie
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.reload();
  },
}));

// 2. Custom Hook useAutoLogin xuất bản cho Header và các trang sử dụng
export function useAutoLogin() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const logout = useAuthStore((state) => state.logout);
  const performAutoLogin = useAuthStore((state) => state.performAutoLogin);

  useEffect(() => {
    performAutoLogin();
  }, [performAutoLogin]);

  return { user, loading, logout };
}

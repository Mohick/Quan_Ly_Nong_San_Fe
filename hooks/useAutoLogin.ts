import { useEffect } from "react";
import { create } from "zustand";
import axios from "axios";
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

type CachedUser = User & {
  image?: string;
};

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

    // Mark the request as started before awaiting so React Strict Mode cannot start it twice.
    set({ loading: true, initialized: true });

    let localUser: CachedUser | null = null;

    try {
      const token = getCookie("access_token");
      
      // Fallback: Read Google user profile from localStorage first
      if (typeof window !== "undefined") {
        const rawLocal = localStorage.getItem("user");
        if (rawLocal) {
          try {
            localUser = JSON.parse(rawLocal) as CachedUser;
          } catch {}
        }
      }

      if (!token) {
        set({ user: null });
        localStorage.removeItem("user");
        return;
      }

      // Render cached account details immediately while the backend validates the token.
      if (localUser) {
        set({ user: localUser, loading: false });
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
        set({ user: userData });
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        set({ user: null });
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.warn("Lỗi tự động đăng nhập:", error);

      const isUnauthorized =
        axios.isAxiosError(error) && error.response?.status === 401;

      if (isUnauthorized) {
        set({ user: null });
        localStorage.removeItem("user");
      } else {
        // A slow/offline API must not make the header unusable.
        set({ user: localUser });
      }
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

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Định nghĩa "hình dáng" của dữ liệu người dùng
interface User {
  id: number;
  username: string;
  email: string;
}

// Định nghĩa "hình dáng" của toàn bộ bộ nhớ
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  // Các "hành động" có thể thực hiện trên bộ nhớ
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

// Tạo ra "cuốn sổ" bằng Zustand
// persist() là một "middleware" giúp tự động lưu state vào localStorage
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
      setUser: (user) => set({ user }),
      logout: () => {
        // Khi đăng xuất, xóa hết mọi thứ
        set({ accessToken: null, refreshToken: null, user: null });
      },
    }),
    {
      name: "auth-storage", // Tên của item trong localStorage
      storage: createJSONStorage(() => localStorage), // Chỉ định dùng localStorage
    }
  )
);
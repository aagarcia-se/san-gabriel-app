import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, Permiso } from '../types/auth.types';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  permisos: Permiso[];
  isAuthenticated: boolean;
  setSession: (token: string, user: AuthUser, permisos?: Permiso[]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      permisos: [],
      isAuthenticated: false,
      setSession: (token, user, permisos = []) => {
        // El interceptor de axios lee el token desde esta misma key.
        localStorage.setItem('auth_token', token);
        set({ token, user, permisos, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('auth_token');
        set({ token: null, user: null, permisos: [], isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        permisos: state.permisos,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

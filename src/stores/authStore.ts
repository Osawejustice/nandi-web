import { create } from 'zustand';
import { api } from '@/lib/api';
import { setTokens, clearTokens, getUserFromToken } from '@/lib/auth';
import { wsClient } from '@/lib/ws';
import type { User, AuthTokens, LoginRequest, RegisterRequest } from '@/lib/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  clearError: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const tokens = await api.post<AuthTokens>('/auth/login', data);
      setTokens(tokens);
      const user = getUserFromToken();
      set({ user, isLoading: false });

      // Open WebSocket connection
      wsClient.connect(tokens.access_token);
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Login failed',
        isLoading: false,
      });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const tokens = await api.post<AuthTokens>('/auth/register', data);
      setTokens(tokens);
      const user = getUserFromToken();
      set({ user, isLoading: false });

      wsClient.connect(tokens.access_token);
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Registration failed',
        isLoading: false,
      });
      throw err;
    }
  },

  logout: () => {
    clearTokens();
    wsClient.disconnect();
    set({ user: null });
  },

  setUser: (user) => set({ user }),

  clearError: () => set({ error: null }),

  hydrate: () => {
    const user = getUserFromToken();
    if (user) set({ user });
  },
}));

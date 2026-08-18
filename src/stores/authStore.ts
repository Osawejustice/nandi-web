import { create } from 'zustand';
import { ApiError } from '@/lib/api';
import { nandi } from '@/lib/nandi';
import {
  setTokens,
  clearTokens,
  getToken,
  getRefreshToken,
  hydrateTokensFromCookies,
} from '@/lib/auth';
import { wsClient } from '@/lib/ws';
import type {
  User,
  Tenant,
  LoginRequest,
  RegisterRequest,
  TenantChoice,
} from '@/lib/types';

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  role: string | null;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  tenantChoices: TenantChoice[] | null;

  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  setAgentStatus: (status: string) => Promise<void>;
  hydrate: () => Promise<void>;
  clearError: () => void;
}

function applySession(set: (partial: Partial<AuthState>) => void, user: User, tenant: Tenant) {
  set({
    user,
    tenant,
    role: user.role,
    isLoading: false,
    error: null,
    tenantChoices: null,
  });
  const token = getToken();
  if (token) wsClient.connect(token);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  tenant: null,
  role: null,
  isLoading: false,
  isHydrated: false,
  error: null,
  tenantChoices: null,

  login: async (data) => {
    set({ isLoading: true, error: null, tenantChoices: null });
    try {
      const session = await nandi.auth.login(data);
      setTokens(session);
      applySession(set, session.user, session.tenant);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'tenant_required' && err.tenants?.length) {
        set({
          isLoading: false,
          error: err.message,
          tenantChoices: err.tenants,
        });
        throw err;
      }
      set({
        error: err instanceof Error ? err.message : 'Login failed',
        isLoading: false,
      });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null, tenantChoices: null });
    try {
      const session = await nandi.auth.register(data);
      setTokens(session);
      applySession(set, session.user, session.tenant);
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Registration failed',
        isLoading: false,
      });
      throw err;
    }
  },

  logout: async () => {
    const refresh = getRefreshToken();
    try {
      await nandi.auth.logout(refresh || undefined);
    } catch {
      // still clear local session
    }
    clearTokens();
    wsClient.disconnect();
    set({
      user: null,
      tenant: null,
      role: null,
      error: null,
      tenantChoices: null,
    });
  },

  setAgentStatus: async (status) => {
    await nandi.agents.setMyStatus(status);
    const current = get().user;
    if (current) {
      set({ user: { ...current, agent_status: status } });
    }
  },

  hydrate: async () => {
    if (get().isHydrated && get().user) return;
    hydrateTokensFromCookies();
    if (!getToken() && !getRefreshToken()) {
      set({ isHydrated: true, isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const me = await nandi.auth.me();
      set({
        user: me.user,
        tenant: me.tenant,
        role: me.role,
        isLoading: false,
        isHydrated: true,
        error: null,
      });
      const token = getToken();
      if (token) wsClient.connect(token);
    } catch {
      clearTokens();
      wsClient.disconnect();
      set({
        user: null,
        tenant: null,
        role: null,
        isLoading: false,
        isHydrated: true,
      });
    }
  },

  clearError: () => set({ error: null, tenantChoices: null }),
}));

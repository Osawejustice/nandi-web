import { api } from './api';
import type {
  AgentMetric,
  AnalyticsOverview,
  APIKey,
  APIKeyCreated,
  AuthData,
  Campaign,
  Contact,
  ContactInput,
  Conversation,
  ConversationDetail,
  CreateCampaignRequest,
  CreateUserRequest,
  LoginRequest,
  MeData,
  Message,
  Page,
  RegisterRequest,
  TenantSettings,
  User,
} from './types';

function qs(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.set(key, String(value));
  });
  const encoded = search.toString();
  return encoded ? `?${encoded}` : '';
}

export const nandi = {
  auth: {
    login: (body: LoginRequest) =>
      api.post<AuthData>('/auth/login', body, { skipAuth: true }),
    register: (body: RegisterRequest) =>
      api.post<AuthData>('/auth/register', body, { skipAuth: true }),
    refresh: (refresh_token: string) =>
      api.post<AuthData>('/auth/refresh', { refresh_token }, { skipAuth: true }),
    logout: (refresh_token?: string) =>
      api.post<void>('/auth/logout', { refresh_token }, { skipAuth: true }),
    me: () => api.get<MeData>('/me'),
    createUser: (body: CreateUserRequest) => api.post<User>('/users', body),
  },

  contacts: {
    list: (params: { q?: string; tag?: string; page?: number; per_page?: number } = {}) =>
      api.getPage<Contact>(`/contacts${qs(params)}`),
    get: (id: string) => api.get<Contact>(`/contacts/${id}`),
    create: (body: ContactInput) => api.post<Contact>('/contacts', body),
    update: (id: string, body: Partial<ContactInput>) =>
      api.patch<Contact>(`/contacts/${id}`, body),
    remove: (id: string) => api.delete<void>(`/contacts/${id}`),
  },

  conversations: {
    list: (
      params: {
        status?: string;
        channel?: string;
        assignee_id?: string;
        q?: string;
        page?: number;
        per_page?: number;
      } = {}
    ) => api.getPage<Conversation>(`/conversations${qs(params)}`),
    get: (id: string) => api.get<ConversationDetail>(`/conversations/${id}`),
    update: (id: string, body: { status?: string; assignee_id?: string }) =>
      api.patch<Conversation>(`/conversations/${id}`, body),
    reply: (id: string, body: string) =>
      api.post<Message>(`/conversations/${id}/messages`, { body }),
    summarize: (id: string) =>
      api.post<{ summary: string }>(`/conversations/${id}/summary`),
    simulateInbound: (body: { phone: string; name?: string; body: string; channel?: string }) =>
      api.post<{ conversation: Conversation; message: Message }>('/dev/inbound', body),
  },

  campaigns: {
    list: (params: { page?: number; per_page?: number } = {}) =>
      api.getPage<Campaign>(`/campaigns${qs(params)}`),
    get: (id: string) => api.get<Campaign>(`/campaigns/${id}`),
    create: (body: CreateCampaignRequest) => api.post<Campaign>('/campaigns', body),
    start: (id: string) => api.post<Campaign>(`/campaigns/${id}/start`),
  },

  analytics: {
    overview: () => api.get<AnalyticsOverview>('/analytics/overview'),
  },

  settings: {
    get: () => api.get<TenantSettings>('/settings'),
    update: (body: { feature_flags?: Record<string, unknown>; preferences?: Record<string, unknown> }) =>
      api.put<TenantSettings>('/settings', body),
  },

  agents: {
    list: () => api.get<User[]>('/agents'),
    setMyStatus: (status: string) =>
      api.post<{ status: string }>('/agents/me/status', { status }),
  },

  apiKeys: {
    list: () => api.get<APIKey[]>('/api-keys'),
    create: (body: { name: string; role?: string }) =>
      api.post<APIKeyCreated>('/api-keys', body),
    revoke: (id: string) => api.delete<void>(`/api-keys/${id}`),
  },
};

export type { Page, AgentMetric };

import { getToken, getRefreshToken, setTokens, clearTokens } from './auth';
import type { ApiErrorBody, AuthData, Page, TenantChoice } from './types';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export class ApiError extends Error {
  status: number;
  code: string;
  details?: Record<string, string>;
  tenants?: TenantChoice[];
  data: unknown;

  constructor(
    message: string,
    status: number,
    options?: {
      code?: string;
      details?: Record<string, string>;
      tenants?: TenantChoice[];
      data?: unknown;
    }
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = options?.code || 'request_failed';
    this.details = options?.details;
    this.tenants = options?.tenants;
    this.data = options?.data;
  }
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  skipRefresh?: boolean;
  raw?: boolean;
}

type Envelope<T> = { data: T; meta?: Page<T>['meta'] };

function parseError(status: number, payload: unknown): ApiError {
  const body = payload as ApiErrorBody | { message?: string } | null;
  if (body && typeof body === 'object' && 'error' in body && body.error) {
    return new ApiError(body.error.message || 'Request failed', status, {
      code: body.error.code,
      details: body.error.details,
      tenants: body.error.tenants,
      data: body,
    });
  }
  const message =
    body && typeof body === 'object' && 'message' in body && body.message
      ? String(body.message)
      : 'Request failed';
  return new ApiError(message, status, { data: payload });
}

class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private headers(skipAuth?: boolean): HeadersInit {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    const token = skipAuth ? null : getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      const refresh = getRefreshToken();
      if (!refresh) return false;
      try {
        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ refresh_token: refresh }),
        });
        if (!response.ok) return false;
        const envelope = (await response.json()) as Envelope<AuthData>;
        if (!envelope?.data?.access_token) return false;
        setTokens(envelope.data);
        return true;
      } catch {
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { skipAuth, skipRefresh, raw, headers: extraHeaders, body, ...rest } = options;
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers: Record<string, string> = {
      ...(this.headers(skipAuth) as Record<string, string>),
      ...(extraHeaders as Record<string, string> | undefined),
    };

    if (body !== undefined && !(body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, { ...rest, headers, body });

    if (response.status === 401 && !skipAuth && !skipRefresh) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        return this.request<T>(endpoint, { ...options, skipRefresh: true });
      }
      clearTokens();
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    const payload = text ? safeJson(text) : null;

    if (!response.ok) {
      throw parseError(response.status, payload);
    }

    if (raw) {
      return payload as T;
    }

    if (payload && typeof payload === 'object' && 'data' in payload) {
      return (payload as Envelope<T>).data;
    }

    return payload as T;
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  getPage<T>(endpoint: string): Promise<Page<T>> {
    return this.request<Page<T>>(endpoint, { method: 'GET', raw: true }).then((raw) => {
      const envelope = raw as unknown as { data?: T[]; meta?: Page<T>['meta'] };
      return {
        data: Array.isArray(envelope?.data) ? envelope.data : [],
        meta: envelope?.meta || { page: 1, per_page: 20, total: 0 },
      };
    });
  }

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export const api = new ApiClient(API_URL);
export { setTokens, clearTokens, getToken };

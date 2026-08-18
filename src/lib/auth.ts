import type { User, AuthTokens } from './types';

const ACCESS_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refresh_token';

let accessToken: string | null = null;
let refreshToken: string | null = null;

/**
 * Persist tokens in memory + httpOnly-ish cookies.
 * In a production setup the backend would set httpOnly cookies directly.
 */
export function setTokens(tokens: AuthTokens): void {
  if (typeof document === 'undefined') return;
  accessToken = tokens.access_token;
  refreshToken = tokens.refresh_token;

  document.cookie = `${ACCESS_TOKEN_KEY}=${tokens.access_token}; path=/; max-age=${tokens.expires_in}`;
  document.cookie = `${REFRESH_TOKEN_KEY}=${tokens.refresh_token}; path=/; max-age=${tokens.expires_in * 2}`;
}

/** Read the access token from memory (preferred) or cookie fallback. */
export function getToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(
    new RegExp(`(?:^|;\s*)${ACCESS_TOKEN_KEY}=([^;]*)`)
  );
  return match ? match[1] : null;
}

/** Read the refresh token from memory or cookie. */
export function getRefreshToken(): string | null {
  if (refreshToken) return refreshToken;
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(
    new RegExp(`(?:^|;\s*)${REFRESH_TOKEN_KEY}=([^;]*)`)
  );
  return match ? match[1] : null;
}

/** Clear all tokens from memory and cookies. */
export function clearTokens(): void {
  accessToken = null;
  refreshToken = null;
  if (typeof document === 'undefined') return;
  document.cookie = `${ACCESS_TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  document.cookie = `${REFRESH_TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

/** Decode the JWT payload to extract user info (no verification — backend enforces). */
export function getUserFromToken(): User | null {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.sub || payload.user_id || '',
      email: payload.email || '',
      first_name: payload.first_name || '',
      last_name: payload.last_name || '',
      full_name: payload.full_name || `${payload.first_name} ${payload.last_name}`,
    };
  } catch {
    return null;
  }
}

/** Quick check whether a token exists (does NOT validate expiry). */
export function isAuthenticated(): boolean {
  return !!getToken();
}

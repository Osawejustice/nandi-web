import type { AuthData } from './types';

const ACCESS_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refresh_token';

const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

let accessToken: string | null = null;
let refreshToken: string | null = null;

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function setTokens(tokens: Pick<AuthData, 'access_token' | 'refresh_token' | 'expires_in'>): void {
  accessToken = tokens.access_token;
  refreshToken = tokens.refresh_token;
  const accessMax = Math.max(tokens.expires_in || 900, 60);
  writeCookie(ACCESS_TOKEN_KEY, tokens.access_token, accessMax);
  writeCookie(REFRESH_TOKEN_KEY, tokens.refresh_token, REFRESH_MAX_AGE);
}

export function getToken(): string | null {
  if (accessToken) return accessToken;
  accessToken = readCookie(ACCESS_TOKEN_KEY);
  return accessToken;
}

export function getRefreshToken(): string | null {
  if (refreshToken) return refreshToken;
  refreshToken = readCookie(REFRESH_TOKEN_KEY);
  return refreshToken;
}

export function clearTokens(): void {
  accessToken = null;
  refreshToken = null;
  clearCookie(ACCESS_TOKEN_KEY);
  clearCookie(REFRESH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!(getToken() || getRefreshToken());
}

export function hydrateTokensFromCookies(): void {
  accessToken = readCookie(ACCESS_TOKEN_KEY);
  refreshToken = readCookie(REFRESH_TOKEN_KEY);
}

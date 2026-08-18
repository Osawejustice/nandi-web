'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { isAuthenticated } from '@/lib/auth';

/**
 * Auth hook — provides user state and auth actions.
 * Optionally guards the page by redirecting to /login if unauthenticated.
 */
export function useAuth(options?: { redirectOnUnauth?: boolean }) {
  const { user, isLoading, error, login, register, logout, hydrate, clearError } =
    useAuthStore();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (options?.redirectOnUnauth && !isLoading && !isAuthenticated()) {
      router.push('/login');
    }
  }, [options?.redirectOnUnauth, isLoading, router]);

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: isAuthenticated(),
  };
}

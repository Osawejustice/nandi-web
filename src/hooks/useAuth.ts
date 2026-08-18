'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { isAuthenticated } from '@/lib/auth';

export function useAuth(options?: { redirectOnUnauth?: boolean }) {
  const {
    user,
    tenant,
    role,
    isLoading,
    isHydrated,
    error,
    tenantChoices,
    login,
    register,
    logout,
    setAgentStatus,
    hydrate,
    clearError,
  } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (options?.redirectOnUnauth && isHydrated && !isAuthenticated()) {
      router.replace('/login');
    }
  }, [options?.redirectOnUnauth, isHydrated, router]);

  return {
    user,
    tenant,
    role,
    isLoading,
    isHydrated,
    error,
    tenantChoices,
    login,
    register,
    logout,
    setAgentStatus,
    clearError,
    isAuthenticated: isAuthenticated(),
  };
}

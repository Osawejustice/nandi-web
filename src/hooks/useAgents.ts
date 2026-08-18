'use client';

import { useCallback, useEffect, useState } from 'react';
import { nandi } from '@/lib/nandi';
import { wsClient } from '@/lib/ws';
import { errorMessage } from '@/lib/utils';
import type { User } from '@/lib/types';

export function useAgents() {
  const [agents, setAgents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await nandi.agents.list();
      setAgents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(errorMessage(err, 'Failed to load agents'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    return wsClient.on('agent_presence', () => {
      void fetchAgents();
    });
  }, [fetchAgents]);

  return { agents, isLoading, error, refetch: fetchAgents };
}

'use client';

import { useEffect, useState } from 'react';
import { wsClient, type WSConnectionState } from '@/lib/ws';
import { getToken } from '@/lib/auth';

export function useRealtime(enabled: boolean) {
  const [state, setState] = useState<WSConnectionState>(wsClient.connectionState);

  useEffect(() => {
    return wsClient.onState(setState);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const token = getToken();
    if (token) wsClient.connect(token);
  }, [enabled]);

  return state;
}

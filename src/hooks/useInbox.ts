'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { wsClient } from '@/lib/ws';
import type {
  Conversation,
  ConversationStatus,
  PaginatedResponse,
} from '@/lib/types';
import type { WSEvent } from '@/lib/ws';

interface InboxFilters {
  status?: ConversationStatus;
  search?: string;
  page: number;
  per_page: number;
}

export function useInbox(initialFilters?: Partial<InboxFilters>) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InboxFilters>({
    page: 1,
    per_page: 25,
    ...initialFilters,
  });
  const [total, setTotal] = useState(0);

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);
      params.set('page', String(filters.page));
      params.set('per_page', String(filters.per_page));

      const res = await api.get<PaginatedResponse<Conversation>>(
        `/conversations?${params.toString()}`
      );
      setConversations(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // WebSocket: update list on conversation_updated or new_message
  useEffect(() => {
    const unsubUpdated = wsClient.on('conversation_updated', (event: WSEvent) => {
      const updated = event.data as Conversation;
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === updated.id);
        if (idx === -1) return [updated, ...prev];
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      });
    });

    const unsubNew = wsClient.on('new_message', (event: WSEvent) => {
      // Refresh to get the latest preview
      fetchConversations();
    });

    return () => {
      unsubUpdated();
      unsubNew();
    };
  }, [fetchConversations]);

  const refetch = () => fetchConversations();

  const setStatusFilter = (status?: ConversationStatus) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  };

  const setSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const setPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return {
    conversations,
    isLoading,
    error,
    filters,
    total,
    refetch,
    setStatusFilter,
    setSearch,
    setPage,
  };
}

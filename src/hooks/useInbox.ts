'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { nandi } from '@/lib/nandi';
import { wsClient, type WSEvent } from '@/lib/ws';
import { errorMessage } from '@/lib/utils';
import type { Conversation, ConversationStatus } from '@/lib/types';

export interface InboxFilters {
  status?: ConversationStatus | string;
  channel?: string;
  assignee_id?: string;
  q?: string;
  page: number;
  per_page: number;
}

export function useInbox(initialFilters?: Partial<InboxFilters>) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InboxFilters>({
    page: 1,
    per_page: 30,
    ...initialFilters,
  });
  const [total, setTotal] = useState(0);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchInput, setSearchInput] = useState(initialFilters?.q || '');

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await nandi.conversations.list({
        status: filters.status,
        channel: filters.channel,
        assignee_id: filters.assignee_id,
        q: filters.q,
        page: filters.page,
        per_page: filters.per_page,
      });
      setConversations(res.data);
      setTotal(res.meta.total);
    } catch (err) {
      setError(errorMessage(err, 'Failed to fetch conversations'));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    const upsert = (incoming: Conversation) => {
      setConversations((prev) => {
        const idx = prev.findIndex((item) => item.id === incoming.id);
        if (idx === -1) return [incoming, ...prev];
        const next = [...prev];
        next[idx] = { ...next[idx], ...incoming };
        next.sort((a, b) => {
          const aTime = a.last_message_at || a.created_at;
          const bTime = b.last_message_at || b.created_at;
          return new Date(bTime).getTime() - new Date(aTime).getTime();
        });
        return next;
      });
    };

    const unsubCreated = wsClient.on('conversation_created', () => {
      void fetchConversations();
    });

    const unsubUpdated = wsClient.on('conversation_updated', (event: WSEvent) => {
      const payload = event.payload as Conversation | undefined;
      if (payload && payload.id) {
        upsert(payload);
        return;
      }
      void fetchConversations();
    });

    const unsubMessage = wsClient.on('new_message', () => {
      void fetchConversations();
    });

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubMessage();
    };
  }, [fetchConversations]);

  const setStatusFilter = (status?: ConversationStatus | string) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  };

  const setChannelFilter = (channel?: string) => {
    setFilters((prev) => ({ ...prev, channel, page: 1 }));
  };

  const setAssigneeFilter = (assignee_id?: string) => {
    setFilters((prev) => ({ ...prev, assignee_id, page: 1 }));
  };

  const setSearch = (value: string) => {
    setSearchInput(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, q: value, page: 1 }));
    }, 300);
  };

  const setPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const patchLocal = (id: string, patch: Partial<Conversation>) => {
    setConversations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  return {
    conversations,
    isLoading,
    error,
    filters,
    searchInput,
    total,
    refetch: fetchConversations,
    setStatusFilter,
    setChannelFilter,
    setAssigneeFilter,
    setSearch,
    setPage,
    patchLocal,
  };
}

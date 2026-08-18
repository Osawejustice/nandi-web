'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { wsClient } from '@/lib/ws';
import type { Message } from '@/lib/types';
import type { WSEvent } from '@/lib/ws';

export function useConversation(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<{ data: Message[] }>(
        `/conversations/${conversationId}/messages`
      );
      setMessages(res.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch messages'
      );
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (conversationId) fetchMessages();
  }, [conversationId, fetchMessages]);

  // WebSocket: add new messages to the current thread
  useEffect(() => {
    if (!conversationId) return;

    const unsub = wsClient.on('new_message', (event: WSEvent) => {
      const msg = event.data as Message;
      if (msg.conversation_id === conversationId) {
        setMessages((prev) => {
          // Avoid duplicates (optimistic message may already be there)
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    });

    return unsub;
  }, [conversationId]);

  const sendReply = async (content: string) => {
    if (!conversationId || !content.trim()) return;

    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      content: content.trim(),
      direction: 'outbound',
      channel: 'whatsapp',
      sent_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setIsSending(true);

    try {
      const serverMsg = await api.post<Message>(
        `/conversations/${conversationId}/messages`,
        { content: content.trim() }
      );
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? serverMsg : m))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send');
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setIsSending(false);
    }
  };

  return {
    messages,
    isLoading,
    isSending,
    error,
    sendReply,
    refetch: fetchMessages,
  };
}

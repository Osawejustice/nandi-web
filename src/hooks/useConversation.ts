'use client';

import { useCallback, useEffect, useState } from 'react';
import { nandi } from '@/lib/nandi';
import { wsClient, type WSEvent } from '@/lib/ws';
import { errorMessage } from '@/lib/utils';
import type { Conversation, Message } from '@/lib/types';

export function useConversation(conversationId: string | null) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>('');

  const fetchDetail = useCallback(async () => {
    if (!conversationId) {
      setConversation(null);
      setMessages([]);
      setSummary('');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await nandi.conversations.get(conversationId);
      setConversation(res.conversation);
      setMessages(res.messages || []);
      setSummary(res.conversation.summary || '');
    } catch (err) {
      setError(errorMessage(err, 'Failed to load conversation'));
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    if (!conversationId) return;

    const unsubMessage = wsClient.on('new_message', (event: WSEvent) => {
      if (event.conversation_id !== conversationId) return;
      void fetchDetail();
    });

    const unsubUpdated = wsClient.on('conversation_updated', (event: WSEvent) => {
      if (event.conversation_id !== conversationId) return;
      void fetchDetail();
    });

    return () => {
      unsubMessage();
      unsubUpdated();
    };
  }, [conversationId, fetchDetail]);

  const sendReply = async (body: string) => {
    if (!conversationId || !body.trim()) return;
    const trimmed = body.trim();
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      contact_id: conversation?.contact_id || '',
      direction: 'outbound',
      channel: conversation?.channel || 'sms',
      body: trimmed,
      status: 'pending',
      sentiment_score: null,
      sentiment_label: '',
      metadata: {},
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setIsSending(true);
    setError(null);

    try {
      const serverMsg = await nandi.conversations.reply(conversationId, trimmed);
      setMessages((prev) =>
        prev.map((item) => (item.id === optimistic.id ? serverMsg : item))
      );
      setConversation((prev) =>
        prev
          ? {
              ...prev,
              last_message_preview: serverMsg.body,
              last_message_at: serverMsg.created_at,
              unread_count: 0,
            }
          : prev
      );
    } catch (err) {
      setError(errorMessage(err, 'Failed to send message'));
      setMessages((prev) => prev.filter((item) => item.id !== optimistic.id));
    } finally {
      setIsSending(false);
    }
  };

  const updateConversation = async (patch: { status?: string; assignee_id?: string }) => {
    if (!conversationId) return;
    setIsUpdating(true);
    setError(null);
    try {
      const updated = await nandi.conversations.update(conversationId, patch);
      setConversation(updated);
      return updated;
    } catch (err) {
      setError(errorMessage(err, 'Failed to update conversation'));
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const summarize = async () => {
    if (!conversationId) return;
    setIsSummarizing(true);
    setError(null);
    try {
      const res = await nandi.conversations.summarize(conversationId);
      setSummary(res.summary);
      setConversation((prev) => (prev ? { ...prev, summary: res.summary } : prev));
      return res.summary;
    } catch (err) {
      setError(errorMessage(err, 'Failed to summarize conversation'));
      throw err;
    } finally {
      setIsSummarizing(false);
    }
  };

  return {
    conversation,
    messages,
    isLoading,
    isSending,
    isUpdating,
    isSummarizing,
    error,
    summary,
    sendReply,
    updateConversation,
    summarize,
    refetch: fetchDetail,
  };
}

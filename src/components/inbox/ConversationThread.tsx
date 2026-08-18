'use client';

import { useRef, useEffect } from 'react';
import type { Message } from '@/lib/types';
import { MessageBubble } from './MessageBubble';
import { ReplyComposer } from './ReplyComposer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import type { Conversation, Sentiment } from '@/lib/types';

interface ConversationThreadProps {
  conversation: Conversation;
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  onSend: (content: string) => void;
  onBack: () => void;
}

function sentimentBadge(sentiment?: Sentiment) {
  switch (sentiment) {
    case 'positive':
      return <Badge variant="live">Positive</Badge>;
    case 'negative':
      return <Badge variant="destructive">Negative</Badge>;
    case 'neutral':
      return <Badge variant="secondary">Neutral</Badge>;
    default:
      return null;
  }
}

function channelColor(channel: string): string {
  switch (channel) {
    case 'whatsapp': return 'bg-green-500';
    case 'sms': return 'bg-sky-500';
    case 'voice': return 'bg-violet-500';
    case 'telegram': return 'bg-cyan-500';
    default: return 'bg-gray-400';
  }
}

export function ConversationThread({
  conversation,
  messages,
  isLoading,
  isSending,
  onSend,
  onBack,
}: ConversationThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
        </Button>

        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-brandSoft text-brand font-semibold">
              {conversation.contact.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface ${channelColor(
              conversation.channel
            )}`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-textMain text-sm truncate">
              {conversation.contact.name}
            </h3>
            {sentimentBadge(conversation.sentiment)}
          </div>
          <p className="text-xs text-textFaint truncate">
            {conversation.contact.phone}
            <span className="mx-1.5">·</span>
            <span className="capitalize">{conversation.channel}</span>
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-textMuted">
            <Phone size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-textMuted">
            <Video size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-textMuted">
            <MoreVertical size={16} />
          </Button>
        </div>
      </div>

      {/* ── Messages ──────────────────────────────────────────────────── */}
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="flex flex-col gap-3 p-4 min-h-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <svg className="animate-spin h-6 w-6 text-brand" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-textFaint text-sm">
              No messages yet.
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))
          )}
        </div>
      </ScrollArea>

      {/* ── Composer ──────────────────────────────────────────────────── */}
      <ReplyComposer onSend={onSend} isSending={isSending} />
    </div>
  );
}

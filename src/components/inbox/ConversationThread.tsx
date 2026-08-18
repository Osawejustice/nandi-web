'use client';

import { useEffect, useRef } from 'react';
import type { Conversation, Message, User } from '@/lib/types';
import { MessageBubble } from './MessageBubble';
import { ReplyComposer } from './ReplyComposer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { StatusBadge, SentimentBadge, ChannelBadge } from '@/components/StatusBadge';
import { ArrowLeft, PanelRight } from 'lucide-react';
import { contactName, initials } from '@/lib/utils';

interface ConversationThreadProps {
  conversation: Conversation;
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  error?: string | null;
  onSend: (content: string) => void;
  onBack: () => void;
  onToggleDetails?: () => void;
  agents?: User[];
}

export function ConversationThread({
  conversation,
  messages,
  isLoading,
  isSending,
  error,
  onSend,
  onBack,
  onToggleDetails,
}: ConversationThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const name = contactName(conversation.contact);
  const closed = conversation.status === 'closed';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full bg-background min-w-0">
      <div className="flex items-center gap-3 px-3 sm:px-4 py-3 border-b border-border bg-surface">
        <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={onBack} aria-label="Back to conversations">
          <ArrowLeft size={18} />
        </Button>
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-brandSoft text-brand font-semibold">
            {initials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-semibold text-textMain text-sm truncate">{name}</h3>
            <ChannelBadge channel={conversation.channel} />
            <StatusBadge status={conversation.status} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-textFaint truncate">
            <span className="truncate">{conversation.contact?.phone || 'No phone'}</span>
            <span>·</span>
            <span className="truncate">{conversation.assignee?.name || 'Unassigned'}</span>
            {conversation.sentiment_label ? <SentimentBadge label={conversation.sentiment_label} /> : null}
          </div>
        </div>
        {onToggleDetails ? (
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden h-8 w-8"
            onClick={onToggleDetails}
            aria-label="Toggle contact details"
          >
            <PanelRight size={16} />
          </Button>
        ) : null}
      </div>

      {error ? (
        <div className="px-4 py-2 text-xs text-red-700 bg-red-50 border-b border-red-100">{error}</div>
      ) : null}

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-3 p-4 min-h-full">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 w-2/3 rounded-2xl bg-soft animate-pulse" />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-textFaint text-sm">
              No messages yet.
            </div>
          ) : (
            messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <ReplyComposer
        onSend={onSend}
        isSending={isSending}
        disabled={closed}
        disabledReason={closed ? 'This conversation is closed. Reopen it to reply.' : undefined}
      />
    </div>
  );
}

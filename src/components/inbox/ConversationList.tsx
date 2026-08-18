'use client';

import type { Conversation, ConversationStatus } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { InboxFilters } from './InboxFilters';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { ChannelBadge, SentimentBadge } from '@/components/StatusBadge';
import { Search } from 'lucide-react';
import { cn, contactName, initials, timeAgo } from '@/lib/utils';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  statusFilter?: ConversationStatus | string;
  onStatusChange: (status?: ConversationStatus | string) => void;
  channelFilter?: string;
  onChannelChange: (channel?: string) => void;
  assigneeFilter?: string;
  onAssigneeChange: (assigneeId?: string) => void;
  agents: { id: string; name: string }[];
  search: string;
  onSearchChange: (value: string) => void;
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
  onSimulate?: () => void;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  statusFilter,
  onStatusChange,
  channelFilter,
  onChannelChange,
  assigneeFilter,
  onAssigneeChange,
  agents,
  search,
  onSearchChange,
  isLoading,
  error,
  onRetry,
  onSimulate,
}: ConversationListProps) {
  return (
    <div className="flex flex-col h-full bg-surface border-r border-border">
      <div className="px-4 py-3 border-b border-border space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-textMain">Inbox</p>
          {onSimulate ? (
            <button
              type="button"
              onClick={onSimulate}
              className="text-xs font-medium text-brand hover:underline"
            >
              Simulate inbound
            </button>
          ) : null}
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textFaint" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name, phone, or message"
            className="pl-9 h-9 text-sm"
            aria-label="Search conversations"
          />
        </div>
      </div>

      <InboxFilters
        active={statusFilter}
        onChange={onStatusChange}
        channel={channelFilter}
        onChannelChange={onChannelChange}
        assigneeId={assigneeFilter}
        onAssigneeChange={onAssigneeChange}
        agents={agents}
      />

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-3 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[72px] rounded-xl bg-soft animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-red-700">
            <p>{error}</p>
            {onRetry ? (
              <button type="button" onClick={onRetry} className="mt-2 text-brand font-medium underline">
                Retry
              </button>
            ) : null}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-textMuted text-sm px-6 text-center">
            <p className="font-medium text-textMain">No conversations yet.</p>
            <p className="mt-1 text-xs">Inbound SMS and WhatsApp messages will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((conv) => {
              const unread = (conv.unread_count || 0) > 0;
              const name = contactName(conv.contact);
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => onSelect(conv.id)}
                  className={cn(
                    'w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-soft focus-visible:bg-soft',
                    selectedId === conv.id && 'bg-brandSoft/60'
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-brandSoft text-brand text-sm font-semibold">
                        {initials(name)}
                      </AvatarFallback>
                    </Avatar>
                    {unread ? (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent border-2 border-surface" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn('text-sm truncate', unread ? 'font-semibold text-textMain' : 'font-medium text-textMain')}>
                        {name}
                      </span>
                      <span className="text-[11px] text-textFaint shrink-0">
                        {timeAgo(conv.last_message_at || conv.updated_at)}
                      </span>
                    </div>
                    <p className={cn('text-xs truncate mt-0.5', unread ? 'text-textMain' : 'text-textMuted')}>
                      {conv.last_message_preview || 'No messages yet'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <ChannelBadge channel={conv.channel} />
                      <span className="text-[10px] capitalize text-textFaint">{conv.status}</span>
                      {conv.sentiment_label ? <SentimentBadge label={conv.sentiment_label} /> : null}
                      {unread ? (
                        <span className="inline-flex items-center justify-center h-4 min-w-4 rounded-full bg-accent text-white text-[10px] font-bold px-1">
                          {conv.unread_count}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

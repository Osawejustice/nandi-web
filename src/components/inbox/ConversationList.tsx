'use client';

import type { Conversation, Sentiment, Channel } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { InboxFilters } from './InboxFilters';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConversationStatus } from '@/lib/types';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  statusFilter?: ConversationStatus;
  onStatusChange: (status?: ConversationStatus) => void;
  search: string;
  onSearchChange: (value: string) => void;
  isLoading: boolean;
}

function timeAgo(iso?: string): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function sentimentDot(sentiment?: Sentiment): string {
  switch (sentiment) {
    case 'positive': return 'bg-live';
    case 'negative': return 'bg-red-500';
    default: return 'bg-border';
  }
}

function channelLabel(channel: Channel): { label: string; classes: string } {
  switch (channel) {
    case 'whatsapp':
      return { label: 'WA', classes: 'bg-green-100 text-green-700' };
    case 'sms':
      return { label: 'SMS', classes: 'bg-sky-100 text-sky-700' };
    case 'voice':
      return { label: 'Voice', classes: 'bg-violet-100 text-violet-700' };
    case 'telegram':
      return { label: 'TG', classes: 'bg-cyan-100 text-cyan-700' };
    case 'email':
      return { label: 'Mail', classes: 'bg-gray-100 text-gray-600' };
    default:
      return { label: '?', classes: 'bg-gray-100 text-gray-600' };
  }
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  statusFilter,
  onStatusChange,
  search,
  onSearchChange,
  isLoading,
}: ConversationListProps) {
  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Search */}
      <div className="px-4 py-3 border-b border-border">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textFaint" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations…"
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Filters */}
      <InboxFilters active={statusFilter} onChange={onStatusChange} />

      {/* List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <svg className="animate-spin h-6 w-6 text-brand" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-textFaint text-sm">
            <p>No conversations found.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((conv) => {
              const ch = channelLabel(conv.channel);
              return (
                <button
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={cn(
                    'w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-soft',
                    selectedId === conv.id && 'bg-brandSoft/50'
                  )}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-brandSoft text-brand text-sm font-semibold">
                        {conv.contact.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {conv.sentiment && (
                      <span
                        className={cn(
                          'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface',
                          sentimentDot(conv.sentiment)
                        )}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-textMain text-sm truncate">
                        {conv.contact.name}
                      </span>
                      <span className="text-[11px] text-textFaint shrink-0">
                        {timeAgo(conv.last_message_at)}
                      </span>
                    </div>
                    <p className="text-xs text-textMuted truncate mt-0.5">
                      {conv.last_message || 'No messages yet'}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none',
                          ch.classes
                        )}
                      >
                        {ch.label}
                      </span>
                      {conv.unread_count && conv.unread_count > 0 && (
                        <span className="inline-flex items-center justify-center h-4 min-w-4 rounded-full bg-accent text-white text-[10px] font-bold px-1">
                          {conv.unread_count}
                        </span>
                      )}
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

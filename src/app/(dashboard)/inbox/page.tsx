'use client';

import { useState } from 'react';
import { useInbox } from '@/hooks/useInbox';
import { useConversation } from '@/hooks/useConversation';
import { ConversationList } from '@/components/inbox/ConversationList';
import { ConversationThread } from '@/components/inbox/ConversationThread';
import { Inbox as InboxIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InboxPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showThread, setShowThread] = useState(false);

  const {
    conversations,
    isLoading: listLoading,
    filters,
    setStatusFilter,
    setSearch,
  } = useInbox();

  const {
    messages,
    isLoading: threadLoading,
    isSending,
    sendReply,
  } = useConversation(selectedId);

  const selectedConversation = conversations.find((c) => c.id === selectedId) || null;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setShowThread(true);
  };

  const handleBack = () => {
    setShowThread(false);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6 lg:-m-8">
      {/* ── Conversation List (left panel) ───────────────────────────── */}
      <div
        className={cn(
          'w-full md:w-[380px] shrink-0 border-r border-border',
          showThread && 'hidden md:block'
        )}
      >
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={handleSelect}
          statusFilter={filters.status}
          onStatusChange={setStatusFilter}
          search={filters.search || ''}
          onSearchChange={setSearch}
          isLoading={listLoading}
        />
      </div>

      {/* ── Thread View (right panel) ────────────────────────────────── */}
      <div
        className={cn(
          'flex-1 min-w-0',
          !showThread && 'hidden md:block'
        )}
      >
        {selectedConversation ? (
          <ConversationThread
            conversation={selectedConversation}
            messages={messages}
            isLoading={threadLoading}
            isSending={isSending}
            onSend={sendReply}
            onBack={handleBack}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-brandSoft flex items-center justify-center mb-6">
              <InboxIcon size={32} className="text-brand" />
            </div>
            <h2 className="text-xl font-bold text-textMain mb-2">Select a conversation</h2>
            <p className="text-textMuted text-sm max-w-xs">
              Choose a conversation from the list to view the thread and reply.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

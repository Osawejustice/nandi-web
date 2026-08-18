'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useInbox } from '@/hooks/useInbox';
import { useConversation } from '@/hooks/useConversation';
import { useAgents } from '@/hooks/useAgents';
import { ConversationList } from '@/components/inbox/ConversationList';
import { ConversationThread } from '@/components/inbox/ConversationThread';
import { ContactSidebar } from '@/components/inbox/ContactSidebar';
import { Inbox as InboxIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { nandi } from '@/lib/nandi';
import { errorMessage } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function InboxPage() {
  return (
    <Suspense fallback={<div className="h-full bg-surface animate-pulse" />}>
      <InboxWorkspace />
    </Suspense>
  );
}

function InboxWorkspace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialId = searchParams.get('id');

  const [selectedId, setSelectedId] = useState<string | null>(initialId);
  const [mobilePane, setMobilePane] = useState<'list' | 'thread' | 'details'>(
    initialId ? 'thread' : 'list'
  );
  const [simulateOpen, setSimulateOpen] = useState(false);

  const {
    conversations,
    isLoading: listLoading,
    error: listError,
    filters,
    searchInput,
    setStatusFilter,
    setChannelFilter,
    setAssigneeFilter,
    setSearch,
    refetch,
    patchLocal,
  } = useInbox();

  const {
    conversation: detailed,
    messages,
    isLoading: threadLoading,
    isSending,
    isUpdating,
    isSummarizing,
    error: threadError,
    summary,
    sendReply,
    updateConversation,
    summarize,
  } = useConversation(selectedId);

  const { agents } = useAgents();

  const selectedConversation = useMemo(() => {
    if (detailed && detailed.id === selectedId) return detailed;
    return conversations.find((item) => item.id === selectedId) || null;
  }, [detailed, conversations, selectedId]);

  useEffect(() => {
    if (initialId && initialId !== selectedId) {
      setSelectedId(initialId);
      setMobilePane('thread');
    }
  }, [initialId, selectedId]);

  useEffect(() => {
    if (selectedId) patchLocal(selectedId, { unread_count: 0 });
  }, [selectedId, patchLocal]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setMobilePane('thread');
    router.replace(`/inbox?id=${id}`, { scroll: false });
  };

  const handleBack = () => {
    setMobilePane('list');
    setSelectedId(null);
    router.replace('/inbox', { scroll: false });
  };

  const handleStatus = async (status: string) => {
    const updated = await updateConversation({ status });
    if (updated) patchLocal(updated.id, updated);
  };

  const handleAssign = async (assigneeId: string) => {
    const updated = await updateConversation({ assignee_id: assigneeId });
    if (updated) patchLocal(updated.id, updated);
  };

  return (
    <div className="flex h-full min-h-0">
      <div
        className={cn(
          'w-full md:w-[360px] lg:w-[380px] shrink-0 min-h-0',
          mobilePane !== 'list' && 'hidden md:block'
        )}
      >
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={handleSelect}
          statusFilter={filters.status}
          onStatusChange={setStatusFilter}
          channelFilter={filters.channel}
          onChannelChange={setChannelFilter}
          assigneeFilter={filters.assignee_id}
          onAssigneeChange={setAssigneeFilter}
          agents={agents}
          search={searchInput}
          onSearchChange={setSearch}
          isLoading={listLoading}
          error={listError}
          onRetry={() => void refetch()}
          onSimulate={() => setSimulateOpen(true)}
        />
      </div>

      <div
        className={cn(
          'flex-1 min-w-0 min-h-0',
          mobilePane === 'list' && 'hidden md:flex md:flex-col',
          mobilePane === 'details' && 'hidden xl:flex xl:flex-col',
          mobilePane === 'thread' && 'flex flex-col'
        )}
      >
        {selectedConversation ? (
          <ConversationThread
            conversation={selectedConversation}
            messages={messages}
            isLoading={threadLoading}
            isSending={isSending}
            error={threadError}
            onSend={(body) => void sendReply(body)}
            onBack={handleBack}
            onToggleDetails={() => setMobilePane((pane) => (pane === 'details' ? 'thread' : 'details'))}
            agents={agents}
          />
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 rounded-full bg-brandSoft flex items-center justify-center mb-5">
              <InboxIcon size={28} className="text-brand" />
            </div>
            <h2 className="text-xl font-bold text-textMain mb-2">Select a conversation</h2>
            <p className="text-textMuted text-sm max-w-sm">
              Choose a thread from the list, or simulate an inbound customer message to try the workspace.
            </p>
            <Button className="mt-5" variant="outline" onClick={() => setSimulateOpen(true)}>
              Simulate inbound
            </Button>
          </div>
        )}
      </div>

      <div
        className={cn(
          'w-full xl:w-[300px] shrink-0 min-h-0',
          mobilePane === 'details' ? 'block' : 'hidden xl:block',
          !selectedConversation && 'hidden xl:block'
        )}
      >
        {selectedConversation ? (
          <ContactSidebar
            conversation={selectedConversation}
            agents={agents}
            isUpdating={isUpdating}
            onStatusChange={(status) => void handleStatus(status)}
            onAssign={(id) => void handleAssign(id)}
            onSummarize={() => void summarize()}
            isSummarizing={isSummarizing}
            summary={summary}
          />
        ) : (
          <div className="hidden xl:block h-full border-l border-border bg-surface" />
        )}
      </div>

      <SimulateInboundDialog
        open={simulateOpen}
        onOpenChange={setSimulateOpen}
        onCreated={(id) => {
          void refetch();
          handleSelect(id);
        }}
      />
    </div>
  );
}

function SimulateInboundDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (id: string) => void;
}) {
  const [form, setForm] = useState({
    phone: '+254700000001',
    name: 'Customer',
    body: 'Hello, I need help',
    channel: 'sms',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await nandi.conversations.simulateInbound(form);
      onCreated(res.conversation.id);
      onOpenChange(false);
    } catch (err) {
      setError(errorMessage(err, 'Could not simulate inbound message'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Simulate inbound message</DialogTitle>
          <DialogDescription>
            Uses the backend sandbox endpoint to ingest a real conversation.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <div>
            <Label htmlFor="sim-name">Customer name</Label>
            <Input
              id="sim-name"
              className="mt-1.5"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="sim-phone">Phone</Label>
            <Input
              id="sim-phone"
              className="mt-1.5"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="sim-channel">Channel</Label>
            <select
              id="sim-channel"
              className="mt-1.5 w-full h-10 rounded-full border border-border bg-background px-4 text-sm"
              value={form.channel}
              onChange={(e) => setForm((p) => ({ ...p, channel: e.target.value }))}
            >
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
          <div>
            <Label htmlFor="sim-body">Message</Label>
            <Textarea
              id="sim-body"
              className="mt-1.5"
              value={form.body}
              onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Sending…' : 'Ingest message'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

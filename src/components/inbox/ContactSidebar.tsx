'use client';

import Link from 'next/link';
import type { Conversation, User } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { StatusBadge, SentimentBadge, ChannelBadge } from '@/components/StatusBadge';
import { contactName, formatDateTime, initials } from '@/lib/utils';

interface ContactSidebarProps {
  conversation: Conversation;
  agents: User[];
  isUpdating?: boolean;
  onStatusChange: (status: string) => void;
  onAssign: (assigneeId: string) => void;
  onSummarize?: () => void;
  isSummarizing?: boolean;
  summary?: string;
}

const STATUSES = ['open', 'pending', 'resolved', 'closed'] as const;

export function ContactSidebar({
  conversation,
  agents,
  isUpdating,
  onStatusChange,
  onAssign,
  onSummarize,
  isSummarizing,
  summary,
}: ContactSidebarProps) {
  const contact = conversation.contact;
  const name = contactName(contact);

  return (
    <aside className="h-full overflow-y-auto bg-surface border-l border-border">
      <div className="p-5 border-b border-border text-center">
        <Avatar className="h-16 w-16 mx-auto">
          <AvatarFallback className="bg-brandSoft text-brand text-lg font-semibold">
            {initials(name)}
          </AvatarFallback>
        </Avatar>
        <h3 className="mt-3 font-semibold text-textMain">{name}</h3>
        {contact?.phone ? <p className="text-sm text-textMuted mt-0.5">{contact.phone}</p> : null}
        {contact?.email ? <p className="text-xs text-textFaint">{contact.email}</p> : null}
        {contact?.id ? (
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link href={`/contacts/${contact.id}`}>View contact</Link>
          </Button>
        ) : null}
      </div>

      <section className="p-5 border-b border-border space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-textMuted">Conversation</h4>
        <Row label="Channel">
          <ChannelBadge channel={conversation.channel} />
        </Row>
        <Row label="Status">
          <StatusBadge status={conversation.status} />
        </Row>
        <Row label="Sentiment">
          {conversation.sentiment_label ? (
            <SentimentBadge label={conversation.sentiment_label} />
          ) : (
            <span className="text-sm text-textFaint">—</span>
          )}
        </Row>
        <Row label="Assignee">
          <span className="text-sm text-textMain">{conversation.assignee?.name || 'Unassigned'}</span>
        </Row>
        <Row label="Updated">
          <span className="text-sm text-textMuted">{formatDateTime(conversation.updated_at)}</span>
        </Row>
      </section>

      {contact?.tags?.length ? (
        <section className="p-5 border-b border-border">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-textMuted mb-2">Tags</h4>
          <div className="flex flex-wrap gap-1.5">
            {contact.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-soft text-xs text-textMain">
                {tag}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <section className="p-5 border-b border-border space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-textMuted">Actions</h4>
        <label className="block">
          <span className="text-xs text-textMuted">Change status</span>
          <select
            className="mt-1 w-full h-9 rounded-full border border-border bg-background px-3 text-sm"
            value={conversation.status}
            disabled={isUpdating}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-textMuted">Assign to</span>
          <select
            className="mt-1 w-full h-9 rounded-full border border-border bg-background px-3 text-sm"
            value={conversation.assignee_id || ''}
            disabled={isUpdating}
            onChange={(e) => onAssign(e.target.value)}
          >
            <option value="">Unassigned</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </label>
        {onSummarize ? (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isSummarizing}
            onClick={onSummarize}
          >
            {isSummarizing ? 'Summarizing…' : 'Summarize thread'}
          </Button>
        ) : null}
      </section>

      {summary ? (
        <section className="p-5">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-textMuted mb-2">Summary</h4>
          <p className="text-sm text-textMain leading-relaxed">{summary}</p>
        </section>
      ) : null}
    </aside>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-textMuted">{label}</span>
      {children}
    </div>
  );
}

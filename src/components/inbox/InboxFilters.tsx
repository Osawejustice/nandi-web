'use client';

import type { ConversationStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface InboxFiltersProps {
  active: ConversationStatus | string | undefined;
  onChange: (status?: ConversationStatus | string) => void;
  channel?: string;
  onChannelChange: (channel?: string) => void;
  assigneeId?: string;
  onAssigneeChange: (assigneeId?: string) => void;
  agents: { id: string; name: string }[];
}

const STATUS_TABS: { label: string; value: ConversationStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Open', value: 'open' },
  { label: 'Pending', value: 'pending' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
];

export function InboxFilters({
  active,
  onChange,
  channel,
  onChannelChange,
  assigneeId,
  onAssigneeChange,
  agents,
}: InboxFiltersProps) {
  return (
    <div className="border-b border-border">
      <div className="flex gap-1 px-3 py-2 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap',
              active === tab.value
                ? 'bg-brand text-white'
                : 'text-textMuted hover:bg-soft hover:text-textMain'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 px-3 pb-2">
        <label className="sr-only" htmlFor="inbox-channel">
          Channel
        </label>
        <select
          id="inbox-channel"
          value={channel || ''}
          onChange={(e) => onChannelChange(e.target.value || undefined)}
          className="h-8 flex-1 rounded-full border border-border bg-background px-3 text-xs text-textMain"
        >
          <option value="">All channels</option>
          <option value="sms">SMS</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
        <label className="sr-only" htmlFor="inbox-assignee">
          Assignee
        </label>
        <select
          id="inbox-assignee"
          value={assigneeId || ''}
          onChange={(e) => onAssigneeChange(e.target.value || undefined)}
          className="h-8 flex-1 rounded-full border border-border bg-background px-3 text-xs text-textMain"
        >
          <option value="">Anyone</option>
          <option value="unassigned">Unassigned</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

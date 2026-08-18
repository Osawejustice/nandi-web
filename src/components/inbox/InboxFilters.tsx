'use client';

import type { ConversationStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface InboxFiltersProps {
  active: ConversationStatus | undefined;
  onChange: (status?: ConversationStatus) => void;
}

const TABS: { label: string; value: ConversationStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Open', value: 'open' },
  { label: 'Pending', value: 'pending' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
];

export function InboxFilters({ active, onChange }: InboxFiltersProps) {
  return (
    <div className="flex gap-1 px-4 py-2 border-b border-border overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab.label}
          onClick={() => onChange(tab.value)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
            active === tab.value
              ? 'bg-brand text-white'
              : 'text-textMuted hover:bg-soft hover:text-textMain'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Inbox, CheckCircle2, Clock3, Users } from 'lucide-react';
import { nandi } from '@/lib/nandi';
import { useAgents } from '@/hooks/useAgents';
import { ErrorBanner } from '@/components/ErrorBanner';
import { StatusBadge, ChannelBadge } from '@/components/StatusBadge';
import { contactName, errorMessage, formatNumber, timeAgo } from '@/lib/utils';
import type { AnalyticsOverview, Conversation } from '@/lib/types';

export default function DashboardPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [recent, setRecent] = useState<Conversation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { agents } = useAgents();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [metrics, inbox] = await Promise.all([
        nandi.analytics.overview(),
        nandi.conversations.list({ page: 1, per_page: 8 }),
      ]);
      setOverview(metrics);
      setRecent(inbox.data);
    } catch (err) {
      setError(errorMessage(err, 'Failed to load dashboard'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const byStatus = overview?.conversations_by_status || {};
  const byChannel = overview?.conversations_by_channel || {};
  const open = Number(byStatus.open || 0);
  const pending = Number(byStatus.pending || 0);
  const resolved = Number(byStatus.resolved || 0);
  const closed = Number(byStatus.closed || 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-textMain tracking-tight">Operations</h2>
        <p className="text-textMuted text-sm mt-1">Live workspace metrics from your Nandi backend.</p>
      </div>

      {error ? <ErrorBanner message={error} onRetry={() => void load()} /> : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Open conversations"
          value={loading ? '—' : formatNumber(open)}
          icon={Inbox}
        />
        <StatCard
          label="Pending"
          value={loading ? '—' : formatNumber(pending)}
          icon={Clock3}
        />
        <StatCard
          label="Resolved"
          value={loading ? '—' : formatNumber(resolved + closed)}
          icon={CheckCircle2}
        />
        <StatCard
          label="Messages (7 days)"
          value={loading ? '—' : formatNumber(overview?.messages_last_7_days)}
          icon={MessageSquare}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-surface border border-border rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-textMain">Recent conversations</h3>
            <Link href="/inbox" className="text-sm text-brand font-medium hover:underline">
              Open inbox
            </Link>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-soft animate-pulse" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <p className="p-8 text-sm text-textMuted">No conversations yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((conv) => (
                <li key={conv.id}>
                  <Link
                    href={`/inbox?id=${conv.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-soft"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-textMain truncate">
                          {contactName(conv.contact)}
                        </p>
                        <ChannelBadge channel={conv.channel} />
                        <StatusBadge status={conv.status} />
                      </div>
                      <p className="text-xs text-textMuted truncate mt-0.5">
                        {conv.last_message_preview || 'No messages yet'}
                      </p>
                    </div>
                    <span className="text-xs text-textFaint shrink-0">
                      {timeAgo(conv.last_message_at || conv.updated_at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className="bg-surface border border-border rounded-xl p-5">
            <h3 className="font-semibold text-textMain mb-4">By channel</h3>
            {loading ? (
              <div className="h-20 bg-soft rounded-lg animate-pulse" />
            ) : Object.keys(byChannel).length === 0 ? (
              <p className="text-sm text-textMuted">No channel data yet.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(byChannel).map(([channel, count]) => (
                  <div key={channel} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-textMain">{channel}</span>
                    <span className="font-medium">{formatNumber(count)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-textMain">Team</h3>
              <Users size={16} className="text-textMuted" />
            </div>
            {agents.length === 0 ? (
              <p className="text-sm text-textMuted">No agents found.</p>
            ) : (
              <ul className="space-y-3">
                {agents.slice(0, 6).map((agent) => (
                  <li key={agent.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-textMain truncate">{agent.name}</p>
                      <p className="text-xs text-textMuted capitalize">{agent.role}</p>
                    </div>
                    <StatusBadge status={agent.agent_status} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Inbox;
}) {
  return (
    <div className="p-5 bg-surface border border-border rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-textMuted">{label}</p>
        <Icon size={16} className="text-textFaint" />
      </div>
      <p className="text-3xl font-bold text-textMain tracking-tight">{value}</p>
    </div>
  );
}

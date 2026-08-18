'use client';

import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { nandi } from '@/lib/nandi';
import { useAgents } from '@/hooks/useAgents';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { formatNumber } from '@/lib/utils';
import type { AnalyticsOverview } from '@/lib/types';

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { agents } = useAgents();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setOverview(await nandi.analytics.overview());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const byStatus = overview?.conversations_by_status || {};
  const byChannel = overview?.conversations_by_channel || {};
  const agentReplies = overview?.agent_replies_last_7_days || [];
  const hasData =
    Object.keys(byStatus).length > 0 ||
    Object.keys(byChannel).length > 0 ||
    (overview?.messages_last_7_days || 0) > 0;

  const agentName = (id: string) => agents.find((agent) => agent.id === id)?.name || id.slice(0, 8);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-textMain">Analytics</h2>
        <p className="text-sm text-textMuted mt-1">
          Metrics come from the backend overview endpoint. Date filters are not supported yet.
        </p>
      </div>

      {error ? <ErrorBanner message={error} onRetry={() => void load()} /> : null}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 bg-soft rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !hasData ? (
        <EmptyState
          icon={BarChart3}
          title="No analytics data available for this period."
          description="Once conversations and messages flow through Nandi, this page will populate automatically."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Metric label="Messages last 7 days" value={formatNumber(overview?.messages_last_7_days)} />
            <Metric label="Messages last 30 days" value={formatNumber(overview?.messages_last_30_days)} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarCard title="Conversations by status" items={byStatus} />
            <BarCard title="Conversations by channel" items={byChannel} />
          </div>

          <section className="bg-surface border border-border rounded-xl p-5">
            <h3 className="font-semibold text-textMain mb-4">Agent replies (7 days)</h3>
            {agentReplies.length === 0 ? (
              <p className="text-sm text-textMuted">No agent replies in the last 7 days.</p>
            ) : (
              <BarCard
                title=""
                items={Object.fromEntries(agentReplies.map((row) => [agentName(row.user_id), row.replies]))}
                bare
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <p className="text-sm text-textMuted">{label}</p>
      <p className="text-3xl font-bold text-textMain mt-2">{value}</p>
    </div>
  );
}

function BarCard({
  title,
  items,
  bare,
}: {
  title: string;
  items: Record<string, number>;
  bare?: boolean;
}) {
  const entries = Object.entries(items);
  const max = Math.max(1, ...entries.map(([, value]) => Number(value) || 0));
  const body = (
    <div className="space-y-3">
      {entries.length === 0 ? (
        <p className="text-sm text-textMuted">No data.</p>
      ) : (
        entries.map(([label, value]) => (
          <div key={label}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="capitalize text-textMain">{label}</span>
              <span className="text-textMuted">{formatNumber(value)}</span>
            </div>
            <div className="h-2 rounded-full bg-soft overflow-hidden">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${Math.max(4, (Number(value) / max) * 100)}%` }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );

  if (bare) return body;
  return (
    <section className="bg-surface border border-border rounded-xl p-5">
      {title ? <h3 className="font-semibold text-textMain mb-4">{title}</h3> : null}
      {body}
    </section>
  );
}

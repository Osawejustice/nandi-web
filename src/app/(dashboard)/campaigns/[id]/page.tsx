'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { nandi } from '@/lib/nandi';
import { wsClient } from '@/lib/ws';
import { Button } from '@/components/ui/button';
import { ErrorBanner } from '@/components/ErrorBanner';
import { StatusBadge, ChannelBadge } from '@/components/StatusBadge';
import { errorMessage, formatDateTime, formatNumber } from '@/lib/utils';
import type { Campaign } from '@/lib/types';

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCampaign(await nandi.campaigns.get(params.id));
    } catch (err) {
      setError(errorMessage(err, 'Failed to load campaign'));
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    return wsClient.on('campaign_updated', (event) => {
      const payload = event.payload as { id?: string } | undefined;
      if (payload?.id === params.id) void load();
    });
  }, [load, params.id]);

  const start = async () => {
    if (!campaign) return;
    setStarting(true);
    setError(null);
    try {
      setCampaign(await nandi.campaigns.start(campaign.id));
    } catch (err) {
      setError(errorMessage(err, 'Could not start campaign'));
    } finally {
      setStarting(false);
    }
  };

  if (loading) return <div className="max-w-3xl mx-auto h-64 rounded-xl bg-soft animate-pulse" />;
  if (error && !campaign) return <ErrorBanner message={error} onRetry={() => void load()} />;
  if (!campaign) return null;

  const canStart = campaign.status === 'draft' || campaign.status === 'failed';
  const tag = typeof campaign.audience_filter?.tag === 'string' ? campaign.audience_filter.tag : '';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/campaigns" aria-label="Back to campaigns">
            <ArrowLeft size={18} />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-textMain">{campaign.name}</h1>
            <StatusBadge status={campaign.status} />
            <ChannelBadge channel={campaign.channel} />
          </div>
        </div>
        <Button onClick={() => void start()} disabled={!canStart || starting}>
          {starting ? 'Starting…' : 'Start campaign'}
        </Button>
      </div>

      {error ? <ErrorBanner message={error} /> : null}

      {!canStart ? (
        <p className="text-sm text-textMuted">
          Cancellation is not available on the API. A running or completed campaign cannot be stopped from here.
        </p>
      ) : null}

      <section className="bg-surface border border-border rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Audience tag" value={tag || 'All contacts'} />
        <Field label="Scheduled" value={formatDateTime(campaign.scheduled_at)} />
        <Field label="Created" value={formatDateTime(campaign.created_at)} />
        <Field label="Completed" value={formatDateTime(campaign.completed_at)} />
        <Field label="Audience size" value={formatNumber(campaign.total_count)} />
        <Field label="Sent" value={formatNumber(campaign.sent_count)} />
        <Field label="Failed" value={formatNumber(campaign.failed_count)} />
        {campaign.error_message ? <Field label="Error" value={campaign.error_message} /> : null}
      </section>

      <section className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-semibold text-textMain mb-2">Message</h2>
        <p className="text-sm text-textMain whitespace-pre-wrap leading-relaxed">{campaign.message_template}</p>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-textMuted">{label}</p>
      <p className="text-sm text-textMain mt-1">{value || '—'}</p>
    </div>
  );
}

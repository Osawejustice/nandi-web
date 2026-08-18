'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Send } from 'lucide-react';
import { nandi } from '@/lib/nandi';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { StatusBadge, ChannelBadge } from '@/components/StatusBadge';
import { errorMessage, formatDateTime, formatNumber } from '@/lib/utils';
import type { Campaign } from '@/lib/types';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const perPage = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await nandi.campaigns.list({ page, per_page: perPage });
      setCampaigns(res.data);
      setTotal(res.meta.total);
    } catch (err) {
      setError(errorMessage(err, 'Failed to load campaigns'));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const pages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-textMain">Campaigns</h2>
          <p className="text-sm text-textMuted">One-shot SMS or WhatsApp broadcasts to a tagged audience.</p>
        </div>
        <Button asChild>
          <Link href="/campaigns/new">
            <Plus size={16} className="mr-2" />
            New campaign
          </Link>
        </Button>
      </div>

      {error ? <ErrorBanner message={error} onRetry={() => void load()} /> : null}

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-soft rounded-lg animate-pulse" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <EmptyState
            icon={Send}
            title="No campaigns yet."
            description="Create a draft, choose an audience tag, then start sending."
            action={
              <Button asChild>
                <Link href="/campaigns/new">Create campaign</Link>
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-textMuted bg-soft/60">
                <tr>
                  <th className="px-4 py-3 font-semibold">Campaign</th>
                  <th className="px-4 py-3 font-semibold">Channel</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Audience</th>
                  <th className="px-4 py-3 font-semibold">Delivery</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-t border-border hover:bg-soft/50">
                    <td className="px-4 py-3">
                      <Link href={`/campaigns/${campaign.id}`} className="font-medium text-textMain hover:text-brand">
                        {campaign.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <ChannelBadge channel={campaign.channel} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={campaign.status} />
                    </td>
                    <td className="px-4 py-3 text-textMuted">
                      {campaign.total_count ? formatNumber(campaign.total_count) : audienceTag(campaign) || '—'}
                    </td>
                    <td className="px-4 py-3 text-textMuted">
                      {campaign.total_count
                        ? `${formatNumber(campaign.sent_count)} sent · ${formatNumber(campaign.failed_count)} failed`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-textFaint">{formatDateTime(campaign.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages > 1 ? (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function audienceTag(campaign: Campaign): string {
  const tag = campaign.audience_filter?.tag;
  return typeof tag === 'string' ? tag : '';
}

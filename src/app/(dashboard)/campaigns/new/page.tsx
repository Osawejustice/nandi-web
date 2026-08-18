'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { nandi } from '@/lib/nandi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { errorMessage } from '@/lib/utils';

export default function NewCampaignPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    channel: 'sms',
    message_template: '',
    tag: '',
    scheduled_at: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const created = await nandi.campaigns.create({
        name: form.name.trim(),
        channel: form.channel,
        message_template: form.message_template.trim(),
        tag: form.tag.trim() || undefined,
        scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : undefined,
      });
      router.push(`/campaigns/${created.id}`);
    } catch (err) {
      setError(errorMessage(err, 'Could not create campaign'));
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/campaigns" aria-label="Back to campaigns">
            <ArrowLeft size={18} />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-textMain">New campaign</h1>
          <p className="text-sm text-textMuted">Drafts can be started from the campaign detail page.</p>
        </div>
      </div>

      <form onSubmit={submit} className="bg-surface border border-border rounded-xl p-6 space-y-5">
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <div>
          <Label htmlFor="name">Campaign name</Label>
          <Input
            id="name"
            required
            className="mt-1.5"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="channel">Channel</Label>
          <select
            id="channel"
            className="mt-1.5 w-full h-10 rounded-full border border-border bg-background px-4 text-sm"
            value={form.channel}
            onChange={(e) => setForm((p) => ({ ...p, channel: e.target.value }))}
          >
            <option value="sms">SMS</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
        <div>
          <Label htmlFor="tag">Audience tag</Label>
          <Input
            id="tag"
            className="mt-1.5"
            value={form.tag}
            onChange={(e) => setForm((p) => ({ ...p, tag: e.target.value }))}
            placeholder="vip"
          />
          <p className="text-xs text-textMuted mt-1">
            Leave empty to target all contacts. Starting fails if the audience is empty.
          </p>
        </div>
        <div>
          <Label htmlFor="scheduled_at">Schedule (optional)</Label>
          <Input
            id="scheduled_at"
            type="datetime-local"
            className="mt-1.5"
            value={form.scheduled_at}
            onChange={(e) => setForm((p) => ({ ...p, scheduled_at: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="message_template">Message</Label>
          <Textarea
            id="message_template"
            required
            className="mt-1.5"
            value={form.message_template}
            onChange={(e) => setForm((p) => ({ ...p, message_template: e.target.value }))}
            placeholder="Hello from Nandi"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/campaigns">Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Creating…' : 'Create draft'}
          </Button>
        </div>
      </form>
    </div>
  );
}

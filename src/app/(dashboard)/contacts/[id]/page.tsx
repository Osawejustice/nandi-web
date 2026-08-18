'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Inbox } from 'lucide-react';
import { nandi } from '@/lib/nandi';
import { Button } from '@/components/ui/button';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import { ContactForm } from '@/components/contacts/ContactForm';
import { StatusBadge, ChannelBadge } from '@/components/StatusBadge';
import { errorMessage, formatDateTime, timeAgo } from '@/lib/utils';
import type { Contact, Conversation } from '@/lib/types';

export default function ContactDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const item = await nandi.contacts.get(params.id);
      setContact(item);
      const query = item.phone || item.name;
      const inbox = query
        ? await nandi.conversations.list({ q: query, per_page: 50 })
        : { data: [] as Conversation[] };
      setConversations(inbox.data.filter((conv) => conv.contact_id === item.id));
    } catch (err) {
      setError(errorMessage(err, 'Failed to load contact'));
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async () => {
    if (!contact) return;
    if (!window.confirm(`Delete ${contact.name}? This cannot be undone from the UI.`)) return;
    await nandi.contacts.remove(contact.id);
    router.push('/contacts');
  };

  if (loading) {
    return <div className="max-w-5xl mx-auto h-64 rounded-xl bg-soft animate-pulse" />;
  }

  if (error && !contact) {
    return <ErrorBanner message={error} onRetry={() => void load()} />;
  }

  if (!contact) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/contacts" aria-label="Back to contacts">
            <ArrowLeft size={18} />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-textMain truncate">{contact.name}</h1>
          <p className="text-sm text-textMuted">{contact.phone}</p>
        </div>
        <Button variant="destructive" onClick={() => void remove()}>
          Delete
        </Button>
      </div>

      {error ? <ErrorBanner message={error} onRetry={() => void load()} /> : null}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <section className="lg:col-span-2 bg-surface border border-border rounded-xl p-5">
          <h2 className="font-semibold text-textMain mb-4">Profile</h2>
          <ContactForm
            initial={contact}
            submitting={saving}
            submitLabel="Save changes"
            onSubmit={async (values) => {
              setSaving(true);
              try {
                const updated = await nandi.contacts.update(contact.id, values);
                setContact(updated);
              } finally {
                setSaving(false);
              }
            }}
          />
        </section>

        <section className="lg:col-span-3 bg-surface border border-border rounded-xl">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-textMain">Conversation history</h2>
            <p className="text-xs text-textMuted mt-1">
              Matched from inbox search by phone or name. A dedicated contact filter is not available on the API.
            </p>
          </div>
          {conversations.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No conversations found"
              description="When this contact messages you, their threads will appear here."
            />
          ) : (
            <ul className="divide-y divide-border">
              {conversations.map((conv) => (
                <li key={conv.id}>
                  <Link href={`/inbox?id=${conv.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-soft">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <ChannelBadge channel={conv.channel} />
                        <StatusBadge status={conv.status} />
                      </div>
                      <p className="text-sm text-textMain truncate mt-1">
                        {conv.last_message_preview || 'No messages yet'}
                      </p>
                      <p className="text-xs text-textFaint mt-0.5">
                        Updated {formatDateTime(conv.updated_at)}
                      </p>
                    </div>
                    <span className="text-xs text-textFaint">{timeAgo(conv.last_message_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

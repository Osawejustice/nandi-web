'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Users } from 'lucide-react';
import { nandi } from '@/lib/nandi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ContactForm } from '@/components/contacts/ContactForm';
import { errorMessage, formatDateTime } from '@/lib/utils';
import type { Contact } from '@/lib/types';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const perPage = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await nandi.contacts.list({ q, tag, page, per_page: perPage });
      setContacts(res.data);
      setTotal(res.meta.total);
    } catch (err) {
      setError(errorMessage(err, 'Failed to load contacts'));
    } finally {
      setLoading(false);
    }
  }, [q, tag, page]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setQ(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const pages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-textMain">Contacts</h2>
          <p className="text-sm text-textMuted">{total} people in this workspace</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={16} className="mr-2" />
          New contact
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textFaint" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, or email"
            className="pl-9"
            aria-label="Search contacts"
          />
        </div>
        <Input
          value={tag}
          onChange={(e) => {
            setPage(1);
            setTag(e.target.value);
          }}
          placeholder="Filter by tag"
          className="sm:w-48"
          aria-label="Filter by tag"
        />
      </div>

      {error ? <ErrorBanner message={error} onRetry={() => void load()} /> : null}

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 bg-soft rounded-lg animate-pulse" />
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No contacts yet."
            description="Create a contact or wait for the first inbound message to add one automatically."
            action={<Button onClick={() => setCreateOpen(true)}>Create contact</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-textMuted bg-soft/60">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Tags</th>
                  <th className="px-4 py-3 font-semibold">Updated</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id} className="border-t border-border hover:bg-soft/50">
                    <td className="px-4 py-3">
                      <Link href={`/contacts/${contact.id}`} className="font-medium text-textMain hover:text-brand">
                        {contact.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-textMuted font-mono text-xs">{contact.phone}</td>
                    <td className="px-4 py-3 text-textMuted">{contact.email || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(contact.tags || []).map((item) => (
                          <span key={item} className="px-2 py-0.5 rounded-full bg-soft text-[11px]">
                            {item}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-textFaint">{formatDateTime(contact.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages > 1 ? (
        <div className="flex items-center justify-between text-sm text-textMuted">
          <span>
            Page {page} of {pages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New contact</DialogTitle>
            <DialogDescription>Phone is the primary identifier for SMS and WhatsApp matching.</DialogDescription>
          </DialogHeader>
          <ContactForm
            submitting={saving}
            submitLabel="Create contact"
            onSubmit={async (values) => {
              setSaving(true);
              try {
                await nandi.contacts.create(values);
                setCreateOpen(false);
                await load();
              } finally {
                setSaving(false);
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

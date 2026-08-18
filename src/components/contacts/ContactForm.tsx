'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Contact, ContactInput } from '@/lib/types';

export function ContactForm({
  initial,
  submitting,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<Contact>;
  submitting?: boolean;
  submitLabel: string;
  onSubmit: (values: ContactInput) => Promise<void> | void;
}) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    phone: initial?.phone || '',
    email: initial?.email || '',
    tags: (initial?.tags || []).join(', '),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tags = form.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    await onSubmit({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      tags,
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="contact-name">Name</Label>
        <Input
          id="contact-name"
          required
          className="mt-1.5"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        />
      </div>
      <div>
        <Label htmlFor="contact-phone">Phone</Label>
        <Input
          id="contact-phone"
          required
          className="mt-1.5"
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          placeholder="+2547..."
        />
      </div>
      <div>
        <Label htmlFor="contact-email">Email</Label>
        <Input
          id="contact-email"
          type="email"
          className="mt-1.5"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        />
      </div>
      <div>
        <Label htmlFor="contact-tags">Tags</Label>
        <Input
          id="contact-tags"
          className="mt-1.5"
          value={form.tags}
          onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
          placeholder="vip, kenya"
        />
        <p className="text-xs text-textMuted mt-1">Comma-separated. Used for campaign audiences.</p>
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Saving…' : submitLabel}
      </Button>
    </form>
  );
}

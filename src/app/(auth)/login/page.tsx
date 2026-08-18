'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/inbox';
  const { login, isLoading, error, tenantChoices, clearError } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', tenant_slug: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({
        email: form.email,
        password: form.password,
        tenant_slug: form.tenant_slug || undefined,
      });
      router.push(next);
    } catch {
      // store handles error + tenant picker
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md p-8 bg-surface border border-border rounded-2xl shadow-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brandSoft text-brand mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">Welcome back</h1>
          <p className="text-textMuted text-sm mt-2">Log in to your Nandi workspace</p>
        </div>

        {error ? (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
            <button type="button" onClick={clearError} className="ml-2 underline font-medium">
              Dismiss
            </button>
          </div>
        ) : null}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@company.com"
              className="mt-1.5"
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="mt-1.5"
              autoComplete="current-password"
            />
          </div>

          {tenantChoices?.length ? (
            <div>
              <Label htmlFor="tenant_slug">Organization</Label>
              <select
                id="tenant_slug"
                name="tenant_slug"
                required
                value={form.tenant_slug}
                onChange={handleChange}
                className="mt-1.5 w-full h-10 rounded-full border border-border bg-background px-4 text-sm"
              >
                <option value="">Select organization</option>
                {tenantChoices.map((tenant) => (
                  <option key={tenant.id} value={tenant.slug}>
                    {tenant.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-textMuted mt-1.5">
                This email belongs to more than one organization.
              </p>
            </div>
          ) : null}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Log in'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-textMuted">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-brand hover:underline font-medium">
            Create workspace
          </Link>
        </div>
      </div>
    </div>
  );
}

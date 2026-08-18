"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuth();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(form);
      router.push('/create-organization');
    } catch {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md p-8 bg-surface border border-border rounded-2xl shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-textMain tracking-tight">Create an account</h1>
          <p className="text-textMuted text-sm mt-2">Start your journey with Nandi</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-full bg-red-50 border border-red-200 text-red-700 text-sm text-center">
            {error}
            <button onClick={clearError} className="ml-2 underline font-medium">Dismiss</button>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-textMain" htmlFor="first_name">First Name</label>
              <Input
                id="first_name"
                name="first_name"
                type="text"
                required
                value={form.first_name}
                onChange={handleChange}
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-textMain" htmlFor="last_name">Last Name</label>
              <Input
                id="last_name"
                name="last_name"
                type="text"
                required
                value={form.last_name}
                onChange={handleChange}
                placeholder="Doe"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-textMain" htmlFor="email">Work Email</label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="john@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-textMain" htmlFor="password">Password</label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : null}
            Create Account
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-textMuted">
          Already have an account?{' '}
          <Link href="/login" className="text-brand hover:underline font-medium">Log in</Link>
        </div>
      </div>
    </div>
  );
}

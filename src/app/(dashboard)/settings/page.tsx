'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { nandi } from '@/lib/nandi';
import { useAuthStore } from '@/stores/authStore';
import { useAgents } from '@/hooks/useAgents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorBanner } from '@/components/ErrorBanner';
import { StatusBadge } from '@/components/StatusBadge';
import { canManageTeam, errorMessage, formatDateTime } from '@/lib/utils';
import type { APIKey, APIKeyCreated, TenantSettings } from '@/lib/types';

type Section = 'profile' | 'organization' | 'team' | 'keys' | 'channels' | 'preferences';

export default function SettingsPage() {
  const router = useRouter();
  const { user, tenant, role, logout } = useAuthStore();
  const { agents, refetch } = useAgents();
  const [section, setSection] = useState<Section>('profile');
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [error, setError] = useState<string | null>(null);
  const manager = canManageTeam(role || user?.role);

  const load = async () => {
    setError(null);
    try {
      const current = await nandi.settings.get();
      setSettings(current);
      if (manager) {
        setKeys(await nandi.apiKeys.list());
      }
    } catch (err) {
      setError(errorMessage(err, 'Failed to load settings'));
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manager]);

  const nav: { id: Section; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'organization', label: 'Organization' },
    { id: 'team', label: 'Team' },
    { id: 'keys', label: 'API keys' },
    { id: 'channels', label: 'Channels' },
    { id: 'preferences', label: 'Preferences' },
  ];

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
      <nav className="flex lg:flex-col gap-1 overflow-x-auto">
        {nav.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSection(item.id)}
            className={`px-3 py-2 rounded-full text-sm text-left whitespace-nowrap ${
              section === item.id ? 'bg-brand/10 text-brand font-medium' : 'text-textMuted hover:bg-soft'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="space-y-5">
        {error ? <ErrorBanner message={error} onRetry={() => void load()} /> : null}

        {section === 'profile' ? (
          <Card title="Profile">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <Item label="Name" value={user?.name} />
              <Item label="Email" value={user?.email} />
              <Item label="Role" value={user?.role} />
              <Item label="Agent status" value={user?.agent_status} />
            </dl>
            <p className="text-xs text-textMuted mt-4">
              Profile updates are not available on the API. Change presence from the account menu.
            </p>
            <Button
              variant="destructive"
              className="mt-4"
              onClick={async () => {
                await logout();
                router.replace('/login');
              }}
            >
              Log out
            </Button>
          </Card>
        ) : null}

        {section === 'organization' ? (
          <Card title="Organization">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <Item label="Name" value={tenant?.name} />
              <Item label="Slug" value={tenant?.slug} />
              <Item label="Status" value={tenant?.status} />
              <Item label="Created" value={formatDateTime(tenant?.created_at)} />
            </dl>
            <p className="text-xs text-textMuted mt-4">Organization edits are not available on the API.</p>
          </Card>
        ) : null}

        {section === 'team' ? (
          <Card title="Team / agents">
            <ul className="divide-y divide-border">
              {agents.map((agent) => (
                <li key={agent.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-textMain">{agent.name}</p>
                    <p className="text-xs text-textMuted">{agent.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs capitalize text-textMuted">{agent.role}</span>
                    <StatusBadge status={agent.agent_status} />
                  </div>
                </li>
              ))}
            </ul>
            {manager ? (
              <CreateUserForm
                onCreated={async () => {
                  await refetch();
                }}
              />
            ) : (
              <p className="text-xs text-textMuted mt-4">Only owners and admins can add teammates.</p>
            )}
          </Card>
        ) : null}

        {section === 'keys' ? (
          <Card title="API keys">
            {!manager ? (
              <p className="text-sm text-textMuted">Only owners and admins can manage API keys.</p>
            ) : (
              <>
                <ul className="divide-y divide-border mb-4">
                  {keys.length === 0 ? (
                    <li className="text-sm text-textMuted py-2">No API keys yet.</li>
                  ) : (
                    keys.map((key) => (
                      <li key={key.id} className="py-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{key.name}</p>
                          <p className="text-xs text-textMuted font-mono">
                            {key.key_prefix} · {key.role}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            await nandi.apiKeys.revoke(key.id);
                            setKeys((prev) => prev.filter((item) => item.id !== key.id));
                          }}
                        >
                          Revoke
                        </Button>
                      </li>
                    ))
                  )}
                </ul>
                <CreateKeyForm
                  onCreated={(created) => {
                    setKeys((prev) => [created, ...prev]);
                  }}
                />
              </>
            )}
          </Card>
        ) : null}

        {section === 'channels' ? (
          <Card title="Channels / providers">
            <p className="text-sm text-textMuted mb-4">
              {settings?.secrets_note ||
                'Provider credentials are configured via backend environment variables, never stored in the frontend.'}
            </p>
            {settings?.providers ? (
              <div className="space-y-2">
                {Object.entries(settings.providers).map(([name, channels]) => (
                  <div key={name} className="flex items-center justify-between text-sm border border-border rounded-xl px-3 py-2">
                    <span className="font-medium capitalize">{name}</span>
                    <span className="text-textMuted">{(channels || []).join(', ') || 'no channels'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-textMuted">No provider status returned.</p>
            )}
          </Card>
        ) : null}

        {section === 'preferences' ? (
          <PreferencesForm
            settings={settings}
            canEdit={manager}
            onSaved={setSettings}
          />
        ) : null}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-surface border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-textMain mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Item({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-textMuted">{label}</dt>
      <dd className="mt-1 text-textMain">{value || '—'}</dd>
    </div>
  );
}

function CreateUserForm({ onCreated }: { onCreated: () => Promise<void> }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'agent' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="mt-6 space-y-3 border-t border-border pt-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          await nandi.auth.createUser(form);
          setForm({ name: '', email: '', password: '', role: 'agent' });
          await onCreated();
        } catch (err) {
          setError(errorMessage(err, 'Could not create user'));
        } finally {
          setBusy(false);
        }
      }}
    >
      <h3 className="text-sm font-semibold text-textMain">Add teammate</h3>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          required
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        />
        <Input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        />
        <Input
          required
          type="password"
          minLength={8}
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
        />
        <select
          className="h-10 rounded-full border border-border bg-background px-4 text-sm"
          value={form.role}
          onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
        >
          <option value="agent">Agent</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <Button type="submit" disabled={busy}>
        {busy ? 'Adding…' : 'Add user'}
      </Button>
    </form>
  );
}

function CreateKeyForm({ onCreated }: { onCreated: (key: APIKeyCreated) => void }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('admin');
  const [busy, setBusy] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          const created = await nandi.apiKeys.create({ name, role });
          setSecret(created.key);
          setName('');
          onCreated(created);
        } catch (err) {
          setError(errorMessage(err, 'Could not create API key'));
        } finally {
          setBusy(false);
        }
      }}
    >
      <h3 className="text-sm font-semibold text-textMain">Create API key</h3>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {secret ? (
        <div className="rounded-xl bg-accentSoft px-3 py-2 text-sm">
          Copy this key now. It will not be shown again.
          <p className="font-mono text-xs mt-1 break-all">{secret}</p>
        </div>
      ) : null}
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          required
          placeholder="Key name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          className="h-10 rounded-full border border-border bg-background px-4 text-sm"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="admin">Admin</option>
          <option value="agent">Agent</option>
        </select>
        <Button type="submit" disabled={busy}>
          {busy ? 'Creating…' : 'Create'}
        </Button>
      </div>
    </form>
  );
}

function PreferencesForm({
  settings,
  canEdit,
  onSaved,
}: {
  settings: TenantSettings | null;
  canEdit: boolean;
  onSaved: (settings: TenantSettings) => void;
}) {
  const flags = settings?.feature_flags || {};
  const [sentiment, setSentiment] = useState(Boolean(flags.sentiment ?? true));
  const [campaigns, setCampaigns] = useState(Boolean(flags.campaigns ?? true));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSentiment(Boolean(flags.sentiment ?? true));
    setCampaigns(Boolean(flags.campaigns ?? true));
  }, [flags.sentiment, flags.campaigns]);

  return (
    <section className="bg-surface border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-textMain mb-4">Preferences</h2>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!canEdit) return;
          setBusy(true);
          setError(null);
          try {
            const saved = await nandi.settings.update({
              feature_flags: { ...flags, sentiment, campaigns },
              preferences: settings?.preferences || {},
            });
            onSaved(saved);
          } catch (err) {
            setError(errorMessage(err, 'Could not save settings'));
          } finally {
            setBusy(false);
          }
        }}
      >
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={sentiment} onChange={(e) => setSentiment(e.target.checked)} disabled={!canEdit} />
          Sentiment analysis
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={campaigns} onChange={(e) => setCampaigns(e.target.checked)} disabled={!canEdit} />
          Campaigns
        </label>
        {!canEdit ? (
          <p className="text-xs text-textMuted">Only owners and admins can update workspace preferences.</p>
        ) : (
          <Button type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save preferences'}
          </Button>
        )}
      </form>
    </section>
  );
}

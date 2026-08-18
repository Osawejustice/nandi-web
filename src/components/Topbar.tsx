'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Menu } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import type { WSConnectionState } from '@/lib/ws';
import { cn } from '@/lib/utils';

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/inbox': 'Inbox',
  '/contacts': 'Contacts',
  '/campaigns': 'Campaigns',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
  '/help': 'Help',
};

function pageTitle(pathname: string): string {
  const match = Object.keys(TITLES)
    .sort((a, b) => b.length - a.length)
    .find((key) => pathname === key || pathname.startsWith(`${key}/`));
  return match ? TITLES[match] : 'Nandi';
}

function connectionLabel(state: WSConnectionState): { label: string; className: string } {
  switch (state) {
    case 'connected':
      return { label: 'Live', className: 'bg-liveSoft text-live' };
    case 'connecting':
    case 'reconnecting':
      return { label: 'Reconnecting', className: 'bg-accentSoft text-accent' };
    default:
      return { label: 'Offline', className: 'bg-soft text-textMuted' };
  }
}

export function Topbar({
  connectionState = 'idle',
  onMenuClick,
}: {
  connectionState?: WSConnectionState;
  onMenuClick?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, tenant, logout, setAgentStatus } = useAuthStore();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const live = connectionLabel(connectionState);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          className="lg:hidden p-2 -ml-2 rounded-full hover:bg-soft text-textMuted"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-textMain truncate">{pageTitle(pathname)}</h1>
          {tenant?.name ? (
            <p className="text-[11px] text-textMuted truncate lg:hidden">{tenant.name}</p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className={cn('hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold', live.className)}>
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              connectionState === 'connected' ? 'bg-live' : 'bg-current'
            )}
          />
          {live.label}
        </div>

        <button
          type="button"
          className="relative text-textMuted hover:text-textMain p-1.5 hover:bg-soft rounded-full"
          aria-label="Notifications"
          disabled
          title="Notifications are not available yet"
        >
          <Bell size={18} />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex items-center gap-2 text-sm font-medium text-textMain hover:text-brand px-2 py-1 rounded-full hover:bg-soft"
            aria-expanded={open}
            aria-haspopup="menu"
          >
            <span className="hidden sm:inline max-w-[140px] truncate">{user?.name || 'Account'}</span>
            <svg className={cn('w-4 h-4 transition-transform', open && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open ? (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-xl shadow-lg py-1 z-50"
            >
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-textMain truncate">{user?.name}</p>
                <p className="text-xs text-textMuted truncate">{user?.email}</p>
                <p className="text-xs text-textFaint mt-1 capitalize">
                  {user?.role} · {tenant?.name}
                </p>
              </div>
              <div className="px-3 py-2 border-b border-border">
                <p className="text-[11px] font-semibold text-textMuted uppercase mb-2">Status</p>
                <div className="flex gap-1">
                  {(['online', 'busy', 'offline'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        void setAgentStatus(status);
                        setOpen(false);
                      }}
                      className={cn(
                        'flex-1 text-[11px] capitalize rounded-full px-2 py-1 border',
                        user?.agent_status === status
                          ? 'border-brand bg-brandSoft text-brand'
                          : 'border-border text-textMuted hover:bg-soft'
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="w-full text-left px-4 py-2 text-sm text-textMain hover:bg-background"
                onClick={() => {
                  setOpen(false);
                  router.push('/settings');
                }}
              >
                Settings
              </button>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
              >
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

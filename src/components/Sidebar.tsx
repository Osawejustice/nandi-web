'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  Send,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { initials } from '@/lib/utils';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Inbox', href: '/inbox', icon: Inbox },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Campaigns', href: '/campaigns', icon: Send },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

const SECONDARY = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
];

export function Sidebar({
  mobileOpen = false,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const tenant = useAuthStore((s) => s.tenant);

  const nav = (
    <>
      <div className="p-5 border-b border-border flex items-center justify-between">
        <Link href="/inbox" className="flex items-center gap-2" onClick={onClose}>
          <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-textMain leading-none">Nandi</h2>
            {tenant?.name ? (
              <p className="text-[11px] text-textMuted truncate max-w-[140px] mt-0.5">{tenant.name}</p>
            ) : null}
          </div>
        </Link>
        <button
          type="button"
          className="lg:hidden p-1.5 rounded-full hover:bg-soft text-textMuted"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
      </div>

      <div className="px-4 py-4 flex-1 overflow-y-auto">
        <p className="text-[11px] font-semibold text-textMuted uppercase tracking-wider mb-2 px-2">
          Workspace
        </p>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-full font-medium transition-colors',
                  isActive ? 'bg-brand/10 text-brand' : 'text-textMuted hover:bg-soft hover:text-textMain'
                )}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <p className="text-[11px] font-semibold text-textMuted uppercase tracking-wider mb-2 px-2 mt-6">
          Account
        </p>
        <nav className="space-y-1">
          {SECONDARY.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-full font-medium transition-colors',
                  isActive ? 'bg-brand/10 text-brand' : 'text-textMuted hover:bg-soft hover:text-textMain'
                )}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <Link
          href="/settings"
          onClick={onClose}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-soft transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center font-semibold text-xs">
            {initials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-textMain text-sm truncate">{user?.name || 'Agent'}</p>
            <p className="text-textMuted text-xs truncate capitalize">
              {user?.role || 'member'}
              {user?.agent_status ? ` · ${user.agent_status}` : ''}
            </p>
          </div>
        </Link>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex w-64 bg-surface border-r border-border h-screen flex-col shrink-0">
        {nav}
      </aside>

      {mobileOpen ? (
        <div className="lg:hidden fixed inset-0 z-40">
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/40"
            aria-label="Close navigation overlay"
            onClick={onClose}
          />
          <aside className="relative z-50 flex w-72 max-w-[85vw] bg-surface h-full flex-col shadow-float">
            {nav}
          </aside>
        </div>
      ) : null}
    </>
  );
}

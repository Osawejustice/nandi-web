"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Inbox, Send, Users, BarChart3, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Inbox', href: '/inbox', icon: Inbox },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Campaigns', href: '/campaigns', icon: Send },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-surface border-r border-border h-screen flex flex-col shadow-[1px_0_10px_rgba(0,0,0,0.02)] relative z-10">
      <div className="p-5 border-b border-border flex items-center gap-2">
        <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-textMain">Nandi</h2>
      </div>
      
      <div className="px-4 py-3">
        <p className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2 px-2">Main Menu</p>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-full font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-brand/10 text-brand' 
                    : 'text-textMuted hover:bg-soft hover:text-textMain'
                }`}
              >
                <Icon size={20} className={isActive ? "text-brand" : "text-textMuted"} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-border bg-surface">
        <div className="flex items-center gap-3 p-2 rounded-full hover:bg-soft cursor-pointer transition-colors">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand to-brandLight flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-textMain text-sm truncate">John Doe</p>
            <p className="text-textMuted text-xs truncate">Acme Inc.</p>
          </div>
          <svg className="w-4 h-4 text-textMuted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      </div>
    </aside>
  );
}

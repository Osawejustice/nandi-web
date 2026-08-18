"use client";

import { useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Topbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push('/login');
  };

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-lg font-semibold text-textMain hidden md:block">Dashboard</h1>
        
        <div className="hidden md:flex items-center ml-8 max-w-md w-full bg-background border border-border rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-brand focus-within:border-brand transition-colors">
          <Search size={18} className="text-textMuted mr-2" />
          <input 
            type="text" 
            placeholder="Search contacts, calls..." 
            className="bg-transparent border-none focus:outline-none text-sm w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden sm:flex items-center gap-2 bg-liveSoft text-live px-3 py-1 rounded-full border border-liveSoft">
          <div className="w-2 h-2 rounded-full bg-live shadow-[0_0_8px_rgba(22,163,74,0.6)] animate-pulse"></div>
          <span className="text-xs font-semibold">Accepting Calls</span>
        </div>
        
        <button className="relative text-textMuted hover:text-textMain transition-colors p-1.5 hover:bg-soft rounded-full">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-surface"></span>
        </button>

        <div className="h-6 w-px bg-border"></div>

        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 text-sm font-medium text-textMain hover:text-brand transition-colors focus:outline-none"
          >
            My Profile
            <svg className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-sm font-medium text-textMain">John Doe</p>
                <p className="text-xs text-textMuted truncate">john@acme.inc</p>
              </div>
              <button className="w-full text-left px-4 py-2 text-sm text-textMain hover:bg-background transition-colors">Account Settings</button>
              <button className="w-full text-left px-4 py-2 text-sm text-textMain hover:bg-background transition-colors">Preferences</button>
              <div className="border-t border-border my-1"></div>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateOrganizationPage() {
  const [orgName, setOrgName] = useState('');
  const [slug, setSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleOrgNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setOrgName(val);
    // Auto-generate slug from name
    setSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      router.push('/dashboard');
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md p-8 bg-surface border border-border rounded-xl shadow-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand/10 text-brand mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">Set up workspace</h1>
          <p className="text-textMuted text-sm mt-2">Create an organization for your team</p>
        </div>
        
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-textMain" htmlFor="orgName">Organization Name</label>
            <input 
              type="text" 
              id="orgName" 
              required
              value={orgName}
              onChange={handleOrgNameChange}
              className="w-full bg-background border border-border rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
              placeholder="Acme Inc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-textMain" htmlFor="domain">Workspace Slug</label>
            <div className="flex items-center shadow-sm rounded-full overflow-hidden border border-border focus-within:border-brand focus-within:ring-1 focus-within:ring-brand transition-all">
              <input 
                type="text" 
                id="domain" 
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="flex-1 bg-background px-4 py-2.5 text-sm focus:outline-none min-w-0"
                placeholder="acme"
              />
              <div className="bg-surface border-l border-border px-4 py-2.5 text-sm text-textMuted select-none flex-shrink-0">
                .nandi.app
              </div>
            </div>
            <p className="text-xs text-textMuted mt-2">This will be your team's unique web address.</p>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading || !orgName || !slug}
            className="w-full bg-brand hover:bg-brandDark text-white py-2.5 rounded-full font-medium shadow-lift hover:shadow-float hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 flex items-center justify-center mt-6"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : "Create Organization"}
          </button>
        </form>
      </div>
    </div>
  );
}

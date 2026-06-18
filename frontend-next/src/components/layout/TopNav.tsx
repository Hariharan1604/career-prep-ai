'use client';

import { useState } from 'react';
import { Bell, Search, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function TopNav({ setMobileMenuOpen }: { setMobileMenuOpen: (v: boolean) => void }) {
  const { logout, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 md:px-8">
      <div className="flex items-center flex-1">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden mr-4 p-2 -ml-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="w-full max-w-md hidden sm:block">
          <label htmlFor="search" className="sr-only">Search</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-[var(--color-muted)]" aria-hidden="true" />
            </div>
            <input
              id="search"
              name="search"
              className="block w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] py-1.5 pl-10 pr-3 text-sm text-[var(--color-foreground)] placeholder-[var(--color-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] sm:text-sm"
              placeholder="Search features..."
              type="search"
            />
          </div>
        </div>
      </div>
      
      <div className="ml-4 flex items-center space-x-2 md:space-x-4 relative">
        <button
          type="button"
          className="rounded-full p-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-colors"
        >
          <span className="sr-only">View notifications</span>
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Profile Menu */}
        <div className="relative ml-1 md:ml-3">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex max-w-xs items-center rounded-full bg-[var(--color-background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all hover:ring-2 hover:ring-[var(--color-border)]"
          >
            <span className="sr-only">Open user menu</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 border border-blue-100 text-[var(--color-accent)] font-bold">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
            </div>
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-[var(--color-surface)] py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-[var(--color-border)]">
              <div className="px-4 py-2 border-b border-[var(--color-border)] mb-1">
                <p className="text-sm font-medium text-[var(--color-foreground)] truncate">{user?.full_name || 'User'}</p>
                <p className="text-xs text-[var(--color-muted)] truncate">{user?.email || ''}</p>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

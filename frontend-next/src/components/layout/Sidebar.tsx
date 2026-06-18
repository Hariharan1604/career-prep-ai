'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Target, PieChart, History, Settings, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Resume Analysis', href: '/analysis', icon: FileText },
  { name: 'Career Roadmap', href: '/roadmap', icon: Target },
  { name: 'Insights Hub', href: '/insights', icon: PieChart },
  { name: 'History', href: '/history', icon: History },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen: boolean, setMobileMenuOpen: (v: boolean) => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}
      
      {/* Sidebar Drawer */}
      <div className={twMerge(
        "fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:shadow-none",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 shrink-0 items-center justify-between px-6">
          <h1 className="text-xl font-bold tracking-tight text-[var(--color-foreground)]">CareerPrep<span className="text-[var(--color-accent)]">AI</span></h1>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
          <nav className="flex-1 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={twMerge(
                    clsx(
                      'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-[var(--color-background)] text-[var(--color-accent)]'
                        : 'text-[var(--color-muted)] hover:bg-[var(--color-background)] hover:text-[var(--color-foreground)]'
                    )
                  )}
                >
                  <item.icon
                    className={clsx(
                      'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                      isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)] group-hover:text-[var(--color-foreground)]'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}

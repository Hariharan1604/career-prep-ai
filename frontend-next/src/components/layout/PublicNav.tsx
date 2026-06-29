'use client';

import Link from 'next/link';
import { Briefcase, ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function PublicNav() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
      <Link href="/" className="flex items-center gap-2">
        <Briefcase className="w-6 h-6 text-[var(--color-accent)]" />
        <span className="text-xl font-bold text-[var(--color-foreground)] tracking-tight">Career Prep AI</span>
      </Link>
      
      <nav className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.name} 
              href={link.href} 
              className={`text-sm font-medium transition-colors ${
                isActive 
                  ? 'text-[var(--color-foreground)] border-b-2 border-[var(--color-accent)] pb-1' 
                  : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="flex items-center gap-4">
        <Link 
          href="/login" 
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-surface)] transition-colors text-[var(--color-foreground)]"
        >
          Sign In
        </Link>
        <Link 
          href="/signup" 
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-medium transition-colors shadow-sm"
        >
          Sign Up <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}

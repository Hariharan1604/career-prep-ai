'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // If auth finishes loading and there is no user, and we're not already on an auth page, redirect to login
    if (!loading && !user && !isAuthPage) {
      router.push('/login');
    }
    // If auth finishes loading and there is a user, but we're on an auth page, redirect to home
    if (!loading && user && isAuthPage) {
      router.push('/');
    }
  }, [user, loading, pathname, router, isAuthPage]);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // While checking auth state, show a full screen loader to prevent flashing unauthenticated content
  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-accent)] mb-4" />
        <p className="text-[var(--color-muted)] font-medium">Verifying session...</p>
      </div>
    );
  }

  // If redirecting to login, render nothing to prevent a flash of the protected page
  if (!user && !isAuthPage) {
    return null;
  }

  return (
    <>
      {!isAuthPage && <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />}
      <div className="flex flex-1 flex-col overflow-hidden w-full">
        {!isAuthPage && <TopNav setMobileMenuOpen={setMobileMenuOpen} />}
        <main className={`flex-1 overflow-y-auto ${!isAuthPage ? 'p-4 md:p-8' : ''}`}>
          <div className={`mx-auto ${!isAuthPage ? 'max-w-7xl' : 'h-full'}`}>
            {children}
          </div>
        </main>
      </div>
    </>
  );
}

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <body className="h-screen overflow-hidden flex bg-[var(--color-background)] text-[var(--color-foreground)]">
        <RouteGuard>
          {children}
        </RouteGuard>
      </body>
    </AuthProvider>
  );
}

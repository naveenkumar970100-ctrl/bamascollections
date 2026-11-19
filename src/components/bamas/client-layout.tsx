'use client';

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { SiteHeader, SiteFooter } from '@/components/bamas/shell';
import { MobileBottomBar } from '@/components/bamas/mobile-bottom-bar';
import { useCustomer } from '@/components/bamas/auth-context';

export function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useCustomer();

  const isAdminRoute = pathname?.startsWith('/admin');
  const isAdminUser = user?.role === 'admin';
  const isAuthRoute =
    !user &&
    (pathname === '/login' ||
      pathname === '/register' ||
      pathname === '/reset-password');
  const isProfileRoute = pathname === '/profile' || pathname === '/bookings' || pathname === '/address';

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {!isAdminRoute && !isAdminUser && <SiteHeader />}
      <div className={!isAdminRoute && !isAdminUser ? 'flex-1 customer-main-content' : 'flex-1'}>
        {children}
      </div>
      {!isAdminRoute && !isAdminUser && <MobileBottomBar />}
      {!isAdminRoute && !isAdminUser && !isAuthRoute && !isProfileRoute && <SiteFooter />}
    </div>
  );
}

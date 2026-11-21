'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CustomerContext, CustomerUser } from '@/components/bamas/auth-context';
import { api } from '@/lib/api';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  const [user, setUser] = useState<CustomerUser | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bamas_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [ready, setReady] = useState(false);

  const refreshUser = async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('bamas_token');
    if (!token) {
      setUser(null);
      setReady(true);
      return;
    }
    try {
      const res = await api.auth.getProfile();
      if (res && res.data) {
        setUser(res.data);
        localStorage.setItem('bamas_user', JSON.stringify(res.data));
      }
    } catch {
      // Keep cached user if network fails
    } finally {
      setReady(true);
    }
  };

  const login = async (payload: { email: string; password: string }) => {
    const res = await api.auth.login(payload);
    if (res && res.data) {
      setUser(res.data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('bamas_token', res.data.token || '');
        localStorage.setItem('bamas_user', JSON.stringify(res.data));
      }
    }
    return res;
  };

  const register = async (payload: { name: string; email: string; password: string; phone?: string }) => {
    const res = await api.auth.register(payload);
    if (res && res.data) {
      setUser(res.data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('bamas_token', res.data.token || '');
        localStorage.setItem('bamas_user', JSON.stringify(res.data));
      }
    }
    return res;
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bamas_token');
      localStorage.removeItem('bamas_user');
    }
    setUser(null);
  };

  useEffect(() => {
    refreshUser();

    const handleAuthChange = () => {
      const stored = localStorage.getItem('bamas_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {}
      } else {
        setUser(null);
      }
      refreshUser();
    };

    window.addEventListener('bamas_auth_changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('bamas_auth_changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CustomerContext.Provider value={{ user, ready, login, register, logout, refreshUser }}>
        {children}
        <Toaster position="top-right" richColors />
      </CustomerContext.Provider>
    </QueryClientProvider>
  );
}

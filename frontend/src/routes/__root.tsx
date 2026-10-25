import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import React, { useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { CustomerContext } from "@/components/bamas/auth-context";
import { SiteHeader, SiteFooter } from "@/components/bamas/shell";
import { MobileBottomBar } from "@/components/bamas/mobile-bottom-bar";
import { Button } from "@/components/ui/button";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });

    // Auto-recover from stale dynamic module import errors in dev/prod
    if (
      typeof window !== 'undefined' &&
      error?.message &&
      (error.message.includes('dynamically imported module') ||
        error.message.includes('Failed to fetch dynamically imported') ||
        error.message.includes('Importing a module script failed'))
    ) {
      const reloadKey = 'bamas_chunk_reload';
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem(reloadKey, String(now));
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              } else {
                router.invalidate();
                reset();
              }
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </Button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Bamas Collection" },
      { name: "description", content: "Timeless Sarees. Modern You." },
      { property: "og:title", content: "Bamas Collection" },
      { property: "og:description", content: "Timeless Sarees. Modern You." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return React.createElement(
    "html",
    { lang: "en" },
    React.createElement("head", null, React.createElement(HeadContent, null)),
    React.createElement("body", null, children, React.createElement(Scripts, null))
  );
}

import { api } from "@/lib/api";
import type { CustomerUser } from "@/components/bamas/auth-context";

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const [user, setUser] = useState<CustomerUser | any>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bamas_user");
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
  const [ready, setReady] = useState(() => typeof window !== 'undefined' && !!localStorage.getItem('bamas_user'));

  useEffect(() => {
    let active = true;

    // Check MERN backend session first
    if (typeof window !== "undefined" && localStorage.getItem("bamas_token")) {
      api.auth
        .getProfile()
        .then((res) => {
          if (active && res.data) {
            setUser(res.data);
          }
        })
        .catch(() => {
          // Keep cached user if offline
        })
        .finally(() => {
          if (active) setReady(true);
        });
    } else {
      // Fallback check to Supabase
      try {
        supabase.auth
          .getUser()
          .then(({ data }) => {
            if (active && data?.user) {
              setUser({
                id: data.user.id,
                email: data.user.email || "",
                name: (data.user.user_metadata as any)?.display_name || "",
              });
            }
          })
          .catch(() => {})
          .finally(() => {
            if (active) setReady(true);
          });
      } catch (err) {
        console.warn("[Auth Notice]: Supabase client init skipped:", err);
        if (active) setReady(true);
      }
    }

    // Real-time Google OAuth listener
    let authSubscription: { unsubscribe: () => void } | null = null;
    try {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!active) return;
        if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
          const email = session.user.email;
          if (email) {
            try {
              const googleName =
                (session.user.user_metadata as any)?.full_name ||
                (session.user.user_metadata as any)?.display_name ||
                (session.user.user_metadata as any)?.name ||
                email.split('@')[0];
              const googleAvatar = (session.user.user_metadata as any)?.avatar_url || '';

              const res = await api.auth.google({
                email,
                name: googleName,
                avatar: googleAvatar,
                googleId: session.user.id,
              });

              if (res.data) {
                setUser(res.data);
                localStorage.setItem('bamas_user', JSON.stringify(res.data));
              }
            } catch {
              const fallbackUser = {
                id: session.user.id,
                email: session.user.email || '',
                name: (session.user.user_metadata as any)?.display_name || (session.user.user_metadata as any)?.full_name || '',
              };
              setUser(fallbackUser);
              localStorage.setItem('bamas_user', JSON.stringify(fallbackUser));
            }
            router.invalidate();
          }
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('bamas_token');
          localStorage.removeItem('bamas_user');
          setUser(null);
          router.invalidate();
        }
      });
      authSubscription = data.subscription;
    } catch (err) {
      console.warn('[Auth Subscription Notice]:', err);
    }

    const handleAuthChange = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("bamas_user");
        setUser(stored ? JSON.parse(stored) : null);
        router.invalidate();
      }
    };
    window.addEventListener("bamas_auth_changed", handleAuthChange);

    return () => {
      active = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
      window.removeEventListener("bamas_auth_changed", handleAuthChange);
    };
  }, [router]);

  const routerState = useRouterState();
  const isAdminRoute = routerState.location.pathname.startsWith('/admin');
  const isAdminUser = user?.role === 'admin';
  const isAuthRoute = !user && (
    routerState.location.pathname === '/login' ||
    routerState.location.pathname === '/register' ||
    routerState.location.pathname === '/reset-password'
  );
  const isProfileRoute = routerState.location.pathname === '/profile';

  useEffect(() => {
    // When logged in as Admin, never show public pages: redirect immediately to the Admin Dashboard
    if (isAdminUser && !isAdminRoute) {
      router.navigate({ to: '/admin', replace: true });
    }
  }, [isAdminUser, isAdminRoute, router]);

  // If admin is logged in and tries to access any public page, render only the admin loading state while redirecting
  if (isAdminUser && !isAdminRoute) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #061821 0%, #0a2432 100%)',
          color: '#d4af37',
          fontFamily: 'Manrope, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              border: '3px solid rgba(212, 175, 55, 0.2)',
              borderTopColor: '#d4af37',
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p style={{ margin: 0, fontSize: '0.95rem', letterSpacing: '0.5px', fontWeight: 600 }}>
            Entering Admin Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <CustomerContext.Provider value={{ user, ready }}>
        {!isAdminRoute && !isAdminUser && <SiteHeader />}
        <div className={(!isAdminRoute && !isAdminUser) ? "customer-main-content" : undefined}>
          <Outlet />
        </div>
        {!isAdminRoute && !isAdminUser && !isAuthRoute && !isProfileRoute && <SiteFooter />}
        {!isAdminRoute && !isAdminUser && <MobileBottomBar />}
      </CustomerContext.Provider>
    </QueryClientProvider>
  );
}

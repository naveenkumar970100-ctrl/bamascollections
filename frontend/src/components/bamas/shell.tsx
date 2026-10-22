import { Link, useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Menu, X, UserRound, ArrowUpRight, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCustomer } from './auth-context';
import { supabase } from '@/integrations/supabase/client';
import bamasLogo from '@/assets/bamas-logo.jpg';
import { api } from '@/lib/api';
import { NotificationBell } from './notification-bell';

const nav = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Collection' },
  { to: '/about', label: 'Our story' },
  { to: '/faq', label: 'FAQs' },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useCustomer();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: configResp } = useQuery({
    queryKey: ['siteConfig'],
    queryFn: () => api.siteConfig.get(),
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const logoSrc = configResp?.data?.logoUrl || bamasLogo;

  async function signOut() {
    api.auth.logout();
    await queryClient.cancelQueries();
    queryClient.clear();
    try {
      await supabase.auth.signOut();
    } catch {}
    window.dispatchEvent(new Event('bamas_auth_changed'));
    await navigate({ to: '/login', replace: true });
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="wordmark" aria-label="Bamas Collection home">
          <img
            src={logoSrc}
            alt="Bamas Collection"
            width="50"
            height="50"
            onError={(e) => {
              e.currentTarget.src = bamasLogo;
            }}
            style={{
              borderRadius: '8px',
              objectFit: 'cover',
              boxShadow: '0 2px 10px rgba(212, 175, 55, 0.25)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
            }}
          />
          <span>
            BAMAS
            <small>COLLECTION</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: true }}
              activeProps={{ className: 'nav-active' }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <NotificationBell isAdmin={user?.role === 'admin'} />
          {user?.role === 'admin' && (
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex" style={{ borderColor: '#d4af37', color: '#092330', background: 'rgba(212, 175, 55, 0.08)', fontWeight: 600 }}>
              <Link to="/admin">
                <ShieldCheck size={14} style={{ marginRight: '4px', color: '#d4af37' }} /> Admin Portal
              </Link>
            </Button>
          )}
          <Button asChild variant="ghost" size="icon" title={user ? 'My account' : 'Log in'}>
            <Link to="/login" aria-label={user ? 'My account' : 'Log in'}>
              <UserRound />
            </Link>
          </Button>
          {user ? (
            <Button variant="ghost" size="icon" title="Sign out" onClick={signOut}>
              <LogOut />
            </Button>
          ) : (
            <Button asChild variant="outline" className="register-link">
              <Link to="/register">
                Join Bamas <ArrowUpRight />
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="mobile-menu-toggle"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin" onClick={() => setOpen(false)} style={{ color: '#d4af37', fontWeight: 700 }}>
              👑 Admin Dashboard
            </Link>
          )}
          <Link to="/register" onClick={() => setOpen(false)}>
            Join Bamas
          </Link>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  const { data: configResp } = useQuery({
    queryKey: ['siteConfig'],
    queryFn: () => api.siteConfig.get(),
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const logoSrc = configResp?.data?.logoUrl || bamasLogo;
  const tagline = configResp?.data?.tagline || 'Timeless Sarees. Modern You.';

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <Link
            to="/"
            className="footer-wordmark"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}
          >
            <img
              src={logoSrc}
              alt="Bamas Collection"
              width="44"
              height="44"
              onError={(e) => {
                e.currentTarget.src = bamasLogo;
              }}
              style={{
                borderRadius: '8px',
                objectFit: 'cover',
                border: '1px solid rgba(212, 175, 55, 0.4)',
              }}
            />
            <div>
              BAMAS <span>COLLECTION</span>
            </div>
          </Link>
          <p>{tagline}</p>
        </div>
        <nav aria-label="Footer navigation">
          {nav.slice(1).map((n) => (
            <Link key={n.to} to={n.to}>
              {n.label}
            </Link>
          ))}
          <Link to="/login">My account</Link>
        </nav>
        <div className="footer-note">
          Rooted in tradition.
          <br />
          Made for your story.
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Bamas Collection</span>
        <span>Elegance, in every thread.</span>
      </div>
    </footer>
  );
}

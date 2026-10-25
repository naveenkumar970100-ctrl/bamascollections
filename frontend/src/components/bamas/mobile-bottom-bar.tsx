import { useState, useEffect } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import {
  Home,
  ShoppingBag,
  MessageSquare,
  User,
} from 'lucide-react';
import { useCustomer } from './auth-context';
import { api } from '@/lib/api';

export function MobileBottomBar() {
  const { user } = useCustomer();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const [unreadNotifs, setUnreadNotifs] = useState(0);

  // Fetch unread notifications count
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const token = localStorage.getItem('bamas_token');
        if (!token) return;
        const res = await api.notifications.getAll();
        if (res.data?.unreadCount !== undefined) {
          setUnreadNotifs(res.data.unreadCount);
        }
      } catch {}
    };

    fetchNotifs();
    const handleSync = () => fetchNotifs();
    window.addEventListener('bamas_notification_received', handleSync);
    return () => window.removeEventListener('bamas_notification_received', handleSync);
  }, [user]);

  // Active navigation checks
  const isHome = pathname === '/';
  const isCollections = pathname.startsWith('/products');
  const isSupport = pathname === '/contact';
  const isProfile =
    pathname === '/profile' ||
    pathname === '/bookings' ||
    pathname === '/cart' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/notifications';

  return (
    <nav
      className="bamas-mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(212, 175, 55, 0.35)',
        boxShadow: '0 -4px 20px rgba(9, 35, 48, 0.08)',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        alignItems: 'center',
        zIndex: 899,
        fontFamily: 'Manrope, sans-serif',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* 1. Home */}
      <Link
        to="/"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          textDecoration: 'none',
          color: isHome ? '#092330' : '#718b96',
          height: '100%',
          position: 'relative',
        }}
      >
        <Home size={20} style={{ color: isHome ? '#d4af37' : 'currentColor', strokeWidth: isHome ? 2.3 : 1.8 }} />
        <span style={{ fontSize: '0.68rem', fontWeight: isHome ? 700 : 500, letterSpacing: '0.02em' }}>
          Home
        </span>
        {isHome && (
          <span
            style={{
              position: 'absolute',
              bottom: '4px',
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: '#d4af37',
            }}
          />
        )}
      </Link>

      {/* 2. Collections */}
      <Link
        to="/products"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          textDecoration: 'none',
          color: isCollections ? '#092330' : '#718b96',
          height: '100%',
          position: 'relative',
        }}
      >
        <ShoppingBag size={20} style={{ color: isCollections ? '#d4af37' : 'currentColor', strokeWidth: isCollections ? 2.3 : 1.8 }} />
        <span style={{ fontSize: '0.68rem', fontWeight: isCollections ? 700 : 500, letterSpacing: '0.02em' }}>
          Collections
        </span>
        {isCollections && (
          <span
            style={{
              position: 'absolute',
              bottom: '4px',
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: '#d4af37',
            }}
          />
        )}
      </Link>

      {/* 3. Support */}
      <Link
        to="/contact"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          textDecoration: 'none',
          color: isSupport ? '#092330' : '#718b96',
          height: '100%',
          position: 'relative',
        }}
      >
        <MessageSquare size={20} style={{ color: isSupport ? '#d4af37' : 'currentColor', strokeWidth: isSupport ? 2.3 : 1.8 }} />
        <span style={{ fontSize: '0.68rem', fontWeight: isSupport ? 700 : 500, letterSpacing: '0.02em' }}>
          Support
        </span>
        {isSupport && (
          <span
            style={{
              position: 'absolute',
              bottom: '4px',
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: '#d4af37',
            }}
          />
        )}
      </Link>

      {/* 4. Profile (Houses Bookings, Order History, Notifications, and Account) */}
      <Link
        to="/profile"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          textDecoration: 'none',
          color: isProfile ? '#092330' : '#718b96',
          height: '100%',
          position: 'relative',
        }}
      >
        <div style={{ position: 'relative' }}>
          <User size={20} style={{ color: isProfile ? '#d4af37' : 'currentColor', strokeWidth: isProfile ? 2.3 : 1.8 }} />
          {unreadNotifs > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-4px',
                background: '#ef4444',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
              }}
            />
          )}
        </div>
        <span style={{ fontSize: '0.68rem', fontWeight: isProfile ? 700 : 500, letterSpacing: '0.02em' }}>
          Profile
        </span>
        {isProfile && (
          <span
            style={{
              position: 'absolute',
              bottom: '4px',
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: '#d4af37',
            }}
          />
        )}
      </Link>
    </nav>
  );
}

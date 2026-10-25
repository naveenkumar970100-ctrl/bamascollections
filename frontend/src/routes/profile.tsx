import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  User,
  ShoppingBag,
  CalendarCheck,
  Package,
  Bell,
  BookOpen,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  LogOut,
  Sparkles,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  RefreshCw,
  Tag,
} from 'lucide-react';
import { pageHead } from '@/lib/page-head';
import { useCustomer } from '@/components/bamas/auth-context';
import { cart, type CartItem } from '@/lib/cart';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ConciergeChat } from '@/components/bamas/concierge-chat';

export const Route = createFileRoute('/profile')({
  head: () =>
    pageHead(
      'Patron Profile & Saree Bookings | Bamas Collection',
      'Manage your handloom saree bookings, view order history, delivery dispatches, and boutique concierge services.'
    ),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useCustomer();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Active bookings (Cart items)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      return cart.getItems ? cart.getItems() : [];
    } catch {
      return [];
    }
  });
  const [cartTotal, setCartTotal] = useState<number>(() => {
    try {
      if (typeof cart?.getSubtotal === 'function') return cart.getSubtotal();
      if (typeof cart?.getTotal === 'function') return cart.getTotal();
      const items = cart?.getItems ? cart.getItems() : [];
      return items.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0);
    } catch {
      return 0;
    }
  });

  // Past confirmed orders from MongoDB
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Unread notifications count
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  // User & Admin Live Chat modal state (Live chat strictly on profile page)
  const [chatOpen, setChatOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('chat') === 'open';
    }
    return false;
  });

  // Manage body class for hiding navigation bars on mobile while viewing profile details
  useEffect(() => {
    document.body.classList.add('profile-view-open');
    return () => {
      document.body.classList.remove('profile-view-open');
    };
  }, []);

  // Fetch orders and notifications
  useEffect(() => {
    const handleCartSync = () => {
      try {
        const items = cart.getItems ? cart.getItems() : [];
        setCartItems(items);
        const total = typeof cart?.getSubtotal === 'function'
          ? cart.getSubtotal()
          : items.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0);
        setCartTotal(total);
      } catch (err) {
        console.error('Cart sync error:', err);
      }
    };
    window.addEventListener('bamas_cart_updated', handleCartSync);

    const fetchProfileData = async () => {
      const token = localStorage.getItem('bamas_token');
      if (!token) return;

      try {
        setLoadingOrders(true);
        const [ordersRes, notifsRes] = await Promise.all([
          api.orders.getMyOrders().catch(() => ({ data: [] })),
          api.notifications.getAll().catch(() => ({ data: { unreadCount: 0 } })),
        ]);
        if (ordersRes.data) setOrders(ordersRes.data);
        if (notifsRes.data?.unreadCount !== undefined) {
          setUnreadNotifs(notifsRes.data.unreadCount);
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchProfileData();

    const handleNotifSync = () => fetchProfileData();
    window.addEventListener('bamas_notification_received', handleNotifSync);
    window.addEventListener('bamas_order_created', handleNotifSync);

    return () => {
      window.removeEventListener('bamas_cart_updated', handleCartSync);
      window.removeEventListener('bamas_notification_received', handleNotifSync);
      window.removeEventListener('bamas_order_created', handleNotifSync);
    };
  }, [user]);

  async function handleSignOut() {
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
    <div
      className="profile-page-container"
      style={{
        minHeight: '100vh',
        background: '#f8fafb',
        padding: '1.5rem 1rem 6rem',
        maxWidth: '840px',
        margin: '0 auto',
        fontFamily: 'Manrope, sans-serif',
      }}
    >
      {/* 1. LUXURY PATRON PROFILE CARD */}
      <div
        style={{
          background: 'linear-gradient(135deg, #061821 0%, #0a2432 55%, #071922 100%)',
          borderRadius: '1.25rem',
          padding: '1.5rem',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          boxShadow: '0 10px 30px rgba(9, 35, 48, 0.18)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '1.5rem',
          color: '#ffffff',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.22) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #d4af37 0%, #aa820a 100%)',
              border: '2px solid #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#061821',
              fontSize: '1.5rem',
              fontWeight: 800,
              boxShadow: '0 4px 16px rgba(212, 175, 55, 0.35)',
              flexShrink: 0,
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={28} />}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: '1.35rem',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: '0.02em',
                }}
              >
                {user?.name || 'Valued Patron'}
              </h1>
              <span
                style={{
                  background: 'rgba(212, 175, 55, 0.2)',
                  color: '#f3dfa2',
                  border: '1px solid rgba(212, 175, 55, 0.45)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <ShieldCheck size={11} /> Silk Mark Patron
              </span>
            </div>

            <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: '#93b6c2', wordBreak: 'break-all' }}>
              {user?.email || 'Bamas Luxury Silk Member'}
            </p>

            {user?.phone && (
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Phone size={12} style={{ color: '#d4af37' }} /> {user.phone}
              </p>
            )}

            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.72rem',
                  color: '#4ade80',
                  fontWeight: 600,
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} />
                Realtime Atelier Connected
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Sign-In Notice if not logged in */}
      {!user && (
        <div
          style={{
            background: 'linear-gradient(135deg, #092330 0%, #163e52 100%)',
            padding: '1.15rem 1.25rem',
            borderRadius: '1rem',
            color: '#ffffff',
            marginBottom: '1.5rem',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            boxShadow: '0 4px 14px rgba(9, 35, 48, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Sparkles size={16} style={{ color: '#d4af37' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Sign In to Track All Bookings</span>
          </div>
          <p style={{ margin: '0 0 0.85rem', fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            Access confirmed saree bookings, delivery tracking, and bespoke handloom recommendations.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Link
              to="/login"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#d4af37',
                color: '#092330',
                padding: '0.6rem',
                borderRadius: '0.5rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '0.6rem',
                borderRadius: '0.5rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Register
            </Link>
          </div>
        </div>
      )}

      {/* Admin Suite Shortcut if Admin User */}
      {user?.role === 'admin' && (
        <Link
          to="/admin"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.95rem 1.25rem',
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.45)',
            borderRadius: '0.85rem',
            color: '#092330',
            textDecoration: 'none',
            marginBottom: '1.5rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            boxShadow: '0 2px 10px rgba(212, 175, 55, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck size={20} style={{ color: '#d4af37' }} />
            <div>
              <span style={{ display: 'block', color: '#092330', fontWeight: 700 }}>
                👑 Administrator Suite Portal
              </span>
              <span style={{ fontSize: '0.75rem', color: '#688c99', fontWeight: 500 }}>
                Manage catalog, inventory, reviews & brand policies
              </span>
            </div>
          </div>
          <ChevronRight size={18} style={{ color: '#d4af37' }} />
        </Link>
      )}

      {/* 2. BOUTIQUE SERVICES & BOOKINGS HUB */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2
          style={{
            margin: '0 0 0.85rem',
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#092330',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <Sparkles size={18} style={{ color: '#d4af37' }} />
          Boutique Services & Bookings
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {/* My Saree Bookings & Orders Card (Opens dedicated full page) */}
          <Link
            to="/bookings"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.15rem',
              background: '#ffffff',
              borderRadius: '0.85rem',
              border: '1px solid rgba(212, 175, 55, 0.45)',
              boxShadow: '0 4px 14px rgba(212, 175, 55, 0.1)',
              textDecoration: 'none',
              color: '#092330',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(212, 175, 55, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#b89015',
                }}
              >
                <CalendarCheck size={22} style={{ color: '#d4af37' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#092330' }}>
                    My Saree Bookings & Orders
                  </span>
                  {(cartItems.length > 0 || orders.length > 0) && (
                    <span
                      style={{
                        background: '#d4af37',
                        color: '#092330',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '0.12rem 0.45rem',
                        borderRadius: '999px',
                      }}
                    >
                      {cartItems.length > 0
                        ? `${cartItems.length} in bag`
                        : `${orders.length} order${orders.length > 1 ? 's' : ''}`}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '0.76rem', color: '#688c99' }}>
                  View active silk bag, confirmed orders & live delivery dispatches
                </span>
              </div>
            </div>

            <ChevronRight size={18} style={{ color: '#d4af37' }} />
          </Link>
          {/* Notifications */}
          <Link
            to="/notifications"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.15rem',
              background: '#ffffff',
              borderRadius: '0.85rem',
              border: '1px solid rgba(9, 35, 48, 0.08)',
              boxShadow: '0 2px 8px rgba(9, 35, 48, 0.03)',
              textDecoration: 'none',
              color: '#092330',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(9, 35, 48, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#092330',
                }}
              >
                <Bell size={18} />
              </div>
              <div>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, display: 'block' }}>
                  Notifications & Announcements
                </span>
                <span style={{ fontSize: '0.75rem', color: '#688c99' }}>
                  Weave launches, discounts & order alerts
                </span>
              </div>
            </div>

            {unreadNotifs > 0 ? (
              <span
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                }}
              >
                {unreadNotifs}
              </span>
            ) : (
              <ChevronRight size={16} style={{ color: '#94a3b8' }} />
            )}
          </Link>

          {/* Our Story */}
          <Link
            to="/about"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.15rem',
              background: '#ffffff',
              borderRadius: '0.85rem',
              border: '1px solid rgba(9, 35, 48, 0.08)',
              boxShadow: '0 2px 8px rgba(9, 35, 48, 0.03)',
              textDecoration: 'none',
              color: '#092330',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(9, 35, 48, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#092330',
                }}
              >
                <BookOpen size={18} />
              </div>
              <div>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, display: 'block' }}>
                  Our Story & Handloom Heritage
                </span>
                <span style={{ fontSize: '0.75rem', color: '#688c99' }}>
                  Generations of pure silk craftsmanship
                </span>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: '#94a3b8' }} />
          </Link>

          {/* FAQs & Silk Mark */}
          <Link
            to="/faq"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.15rem',
              background: '#ffffff',
              borderRadius: '0.85rem',
              border: '1px solid rgba(9, 35, 48, 0.08)',
              boxShadow: '0 2px 8px rgba(9, 35, 48, 0.03)',
              textDecoration: 'none',
              color: '#092330',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(9, 35, 48, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#092330',
                }}
              >
                <HelpCircle size={18} />
              </div>
              <div>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, display: 'block' }}>
                  FAQs & Silk Mark Certification
                </span>
                <span style={{ fontSize: '0.75rem', color: '#688c99' }}>
                  Tested purity, care guide & exchange policies
                </span>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: '#94a3b8' }} />
          </Link>

          {/* Atelier Concierge Live Chat (Direct User & Admin) */}
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.15rem',
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(212, 175, 55, 0.08) 100%)',
              borderRadius: '0.85rem',
              border: '1px solid rgba(212, 175, 55, 0.45)',
              boxShadow: '0 4px 14px rgba(212, 175, 55, 0.1)',
              color: '#092330',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #092330 0%, #163e52 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#d4af37',
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                <MessageSquare size={20} />
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    boxShadow: '0 0 8px #22c55e',
                  }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#092330' }}>
                    Live Chat with Admin (Atelier Desk)
                  </span>
                  <span
                    style={{
                      background: 'rgba(34, 197, 94, 0.15)',
                      color: '#16a34a',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.12rem 0.45rem',
                      borderRadius: '999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e' }} />
                    Live Online
                  </span>
                </div>
                <span style={{ fontSize: '0.76rem', color: '#688c99', display: 'block', marginTop: '0.15rem' }}>
                  Direct 1-on-1 real-time messaging between you and our master admin
                </span>
              </div>
            </div>

            <ChevronRight size={18} style={{ color: '#d4af37', flexShrink: 0 }} />
          </button>
        </div>
      </div>

      {/* 5. SIGN OUT BUTTON (if user logged in) */}
      {user && (
        <button
          type="button"
          onClick={handleSignOut}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.85rem 1rem',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '0.85rem',
            color: '#dc2626',
            cursor: 'pointer',
            fontSize: '0.88rem',
            fontWeight: 700,
            transition: 'all 0.15s ease',
          }}
        >
          <LogOut size={16} /> Sign Out of Patron Account
        </button>
      )}

      {/* Dedicated Live Chat Modal (User & Admin Only) */}
      <ConciergeChat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        showFloatingButton={false}
      />
    </div>
  );
}

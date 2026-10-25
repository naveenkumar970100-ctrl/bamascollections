import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  User,
  Package,
  ShoppingBag,
  MapPin,
  Sparkles,
  LogOut,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCustomer } from './auth-context';
import { api } from '@/lib/api';
import { cart } from '@/lib/cart';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export function ProfileDropdown() {
  const { user } = useCustomer();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [cartCount, setCartCount] = useState(() => cart.getItems().reduce((acc, it) => acc + (it.quantity || 1), 0));
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch orders when dropdown opens or user changes
  const fetchOrders = async () => {
    if (!user) {
      setOrders([]);
      return;
    }
    setLoadingOrders(true);
    try {
      const res = await api.orders.getMyOrders();
      setOrders(res.data || []);
    } catch {
      // Ignore if unauthenticated
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user && open) {
      fetchOrders();
    }
  }, [user, open]);

  // Sync cart count
  useEffect(() => {
    const handleCartUpdate = () => {
      setCartCount(cart.getItems().reduce((acc, it) => acc + (it.quantity || 1), 0));
    };
    const handleOrderSync = () => fetchOrders();

    window.addEventListener('bamas_cart_updated', handleCartUpdate);
    window.addEventListener('bamas_order_created', handleOrderSync);

    return () => {
      window.removeEventListener('bamas_cart_updated', handleCartUpdate);
      window.removeEventListener('bamas_order_created', handleOrderSync);
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Navigate to full account page
  const goToFullPage = () => {
    setOpen(false);
    navigate({ to: user ? '/profile' : '/login' });
  };

  // Sign out
  const handleSignOut = async () => {
    setOpen(false);
    api.auth.logout();
    await queryClient.cancelQueries();
    queryClient.clear();
    try {
      await supabase.auth.signOut();
    } catch {}
    window.dispatchEvent(new Event('bamas_auth_changed'));
    navigate({ to: '/login', replace: true });
  };

  // Copy promo
  const handleCopyCoupon = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText('BAMAS10');
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  const initial = ((user?.name || user?.email || 'U').charAt(0) || 'U').toUpperCase();
  const isAdmin = user?.role === 'admin';

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Profile Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={user ? `Profile for ${user.name || user.email}` : 'Log in to account'}
        title={user ? `${user.name || 'Patron'} • View Bookings & Profile` : 'Sign In'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: open ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
          border: user ? '1.5px solid rgba(212, 175, 55, 0.6)' : '1px solid transparent',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          cursor: 'pointer',
          color: '#092330',
          transition: 'all 0.15s ease',
          boxShadow: user ? '0 1px 6px rgba(212, 175, 55, 0.25)' : 'none',
        }}
      >
        {user ? (
          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#092330' }}>
            {initial}
          </span>
        ) : (
          <User size={19} />
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '360px',
            maxWidth: 'calc(100vw - 24px)',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(9, 35, 48, 0.22)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            overflow: 'hidden',
            zIndex: 9999,
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {user ? (
            /* Logged In Patron Dropdown */
            <div>
              {/* Clickable Header: Redirects to full page when clicked */}
              <div
                onClick={goToFullPage}
                style={{
                  background: 'linear-gradient(135deg, #061821 0%, #0d2a38 100%)',
                  padding: '1.25rem',
                  color: '#ffffff',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.68rem', color: '#d4af37', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    👑 {isAdmin ? 'ADMINISTRATOR' : 'BAMAS ROYAL PATRON'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#d4af37', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                    Full Page <ArrowRight size={12} />
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #d4af37 0%, #b8972e 100%)',
                      color: '#061821',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.25rem',
                      boxShadow: '0 2px 8px rgba(212, 175, 55, 0.35)',
                      flexShrink: 0,
                    }}
                  >
                    {initial}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h4
                      style={{
                        margin: '0 0 2px',
                        fontSize: '1.15rem',
                        fontWeight: 700,
                        color: '#ffffff',
                        fontFamily: 'Cormorant Garamond, serif',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {user.name || 'Valued Patron'}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.email}
                    </p>
                    {user.phone && (
                      <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#d4af37' }}>
                        📱 {user.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats Strip */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2edf0',
                  padding: '0.75rem',
                  textAlign: 'center',
                }}
              >
                <div onClick={goToFullPage} style={{ cursor: 'pointer' }}>
                  <span style={{ fontSize: '0.68rem', color: '#688897', display: 'block', textTransform: 'uppercase' }}>
                    Bookings
                  </span>
                  <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#092330' }}>
                    {orders.length}
                  </span>
                </div>

                <div
                  onClick={() => {
                    setOpen(false);
                    navigate({ to: '/cart' });
                  }}
                  style={{ borderLeft: '1px solid #e2edf0', borderRight: '1px solid #e2edf0', cursor: 'pointer' }}
                >
                  <span style={{ fontSize: '0.68rem', color: '#688897', display: 'block', textTransform: 'uppercase' }}>
                    Silk Bag
                  </span>
                  <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#092330' }}>
                    {cartCount}
                  </span>
                </div>

                <div onClick={goToFullPage} style={{ cursor: 'pointer' }}>
                  <span style={{ fontSize: '0.68rem', color: '#688897', display: 'block', textTransform: 'uppercase' }}>
                    City
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#092330', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                    {user.address?.city || 'India'}
                  </span>
                </div>
              </div>

              {/* Recent Bookings Section */}
              <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#092330', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Recent Bookings
                  </span>
                  <span
                    onClick={goToFullPage}
                    style={{ fontSize: '0.72rem', color: '#0e7490', fontWeight: 700, cursor: 'pointer' }}
                  >
                    View All ({orders.length}) →
                  </span>
                </div>

                {loadingOrders ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                    <RefreshCw size={14} className="spin" style={{ margin: '0 auto 4px' }} />
                    Loading orders...
                  </div>
                ) : orders.length === 0 ? (
                  <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '0.78rem', color: '#64748b' }}>No saree bookings yet.</p>
                    <Link
                      to="/products"
                      onClick={() => setOpen(false)}
                      style={{ fontSize: '0.72rem', color: '#d4af37', fontWeight: 700, textDecoration: 'none' }}
                    >
                      Explore Boutique Collection →
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {orders.slice(0, 2).map((ord) => {
                      const num = ord._id?.toString().slice(-6).toUpperCase() || 'ORDER';
                      const firstItem = ord.orderItems?.[0];
                      const status = ord.status || (ord.isPaid ? 'Confirmed' : 'Placed');

                      return (
                        <div
                          key={ord._id}
                          onClick={goToFullPage}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.55rem 0.65rem',
                            borderRadius: '8px',
                            background: '#f8fafc',
                            cursor: 'pointer',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                            {firstItem?.image && (
                              <img
                                src={firstItem.image}
                                alt={firstItem.name}
                                style={{ width: '32px', height: '40px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                              />
                            )}
                            <div style={{ minWidth: 0 }}>
                              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#092330', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                #{num} · {firstItem?.name || 'Saree Booking'}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>
                                ✓ {status}
                              </span>
                            </div>
                          </div>

                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#092330', flexShrink: 0 }}>
                            ₹{(ord.totalPrice || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Menu Navigation Links */}
              <div style={{ padding: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate({ to: user ? '/bookings' : '/login' });
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#092330',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Package size={16} color="#d4af37" />
                    <span>My Bookings & Orders</span>
                  </div>
                  <ChevronRight size={14} color="#94a3b8" />
                </button>

                <button
                  type="button"
                  onClick={goToFullPage}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#092330',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <MapPin size={16} color="#d4af37" />
                    <span>Saved Delivery Address</span>
                  </div>
                  <ChevronRight size={14} color="#94a3b8" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate({ to: '/cart' });
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#092330',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <ShoppingBag size={16} color="#d4af37" />
                    <span>Silk Bag Checkout</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#f1f5f9', padding: '2px 8px', borderRadius: '999px', color: '#092330' }}>
                    {cartCount}
                  </span>
                </button>

                {/* 10% Privilege Code Quick Pill */}
                <div
                  onClick={handleCopyCoupon}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    background: '#fffdf7',
                    border: '1px dashed #d4af37',
                    margin: '0.4rem 0',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={14} color="#d4af37" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#092330' }}>
                      BAMAS10 (10% Off)
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: copiedCoupon ? '#059669' : '#b45309', fontWeight: 700 }}>
                    {copiedCoupon ? '✓ Copied!' : 'Click to Copy'}
                  </span>
                </div>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      navigate({ to: '/admin' });
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'rgba(212, 175, 55, 0.1)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#092330',
                      textAlign: 'left',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <ShieldCheck size={16} color="#d4af37" />
                      <span>Admin Management Suite</span>
                    </div>
                    <ChevronRight size={14} color="#d4af37" />
                  </button>
                )}

                {/* Sign Out */}
                <button
                  type="button"
                  onClick={handleSignOut}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#ef4444',
                    textAlign: 'left',
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Logged Out / Guest Dropdown */
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'rgba(212, 175, 55, 0.12)',
                  color: '#d4af37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.85rem',
                }}
              >
                <User size={26} />
              </div>

              <h4 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: 700, color: '#092330', fontFamily: 'Cormorant Garamond, serif' }}>
                Welcome to Bamas
              </h4>
              <p style={{ margin: '0 0 1.25rem', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
                Sign in to view your bookings, tracked orders, saved delivery addresses, and privilege perks.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Button
                  asChild
                  style={{
                    width: '100%',
                    background: '#092330',
                    color: '#ffffff',
                    fontWeight: 700,
                    border: '1px solid #d4af37',
                    height: '42px',
                    borderRadius: '8px',
                  }}
                >
                  <Link to="/login" onClick={() => setOpen(false)}>
                    Sign In to Account
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  style={{
                    width: '100%',
                    borderColor: '#cbd5e1',
                    color: '#092330',
                    fontWeight: 600,
                    height: '42px',
                    borderRadius: '8px',
                  }}
                >
                  <Link to="/register" onClick={() => setOpen(false)}>
                    Join Bamas / Register
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

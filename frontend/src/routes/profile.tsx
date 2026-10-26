import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  Package,
  ShoppingBag,
  MapPin,
  Sparkles,
  LogOut,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  MessageSquare,
  ArrowRight,
  User,
  Phone,
  Mail,
  Copy,
  Check,
  X,
} from 'lucide-react';
import { pageHead } from '@/lib/page-head';
import { useCustomer } from '@/components/bamas/auth-context';
import { cart } from '@/lib/cart';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ConciergeChat } from '@/components/bamas/concierge-chat';

export const Route = createFileRoute('/profile')({
  head: () =>
    pageHead(
      'Patron Profile | Bamas Collection',
      'Manage your royal handloom saree bookings, view orders, delivery address, and atelier concierge services.'
    ),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useCustomer();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State
  const [cartCount, setCartCount] = useState(() =>
    cart.getItems().reduce((acc, it) => acc + (it.quantity || 1), 0)
  );
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Keep body class for clean mobile layout
  useEffect(() => {
    document.body.classList.add('profile-view-open');
    return () => {
      document.body.classList.remove('profile-view-open');
    };
  }, []);

  // Fetch orders and cart
  useEffect(() => {
    const handleCartSync = () => {
      try {
        setCartCount(cart.getItems().reduce((acc, it) => acc + (it.quantity || 1), 0));
      } catch {}
    };
    window.addEventListener('bamas_cart_updated', handleCartSync);

    const fetchOrders = async () => {
      const token = localStorage.getItem('bamas_token');
      if (!token) return;
      try {
        setLoadingOrders(true);
        const res = await api.orders.getMyOrders();
        if (res.data) setOrders(res.data);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();

    const handleSync = () => fetchOrders();
    window.addEventListener('bamas_order_created', handleSync);
    window.addEventListener('bamas_notification_received', handleSync);

    return () => {
      window.removeEventListener('bamas_cart_updated', handleCartSync);
      window.removeEventListener('bamas_order_created', handleSync);
      window.removeEventListener('bamas_notification_received', handleSync);
    };
  }, [user]);

  // Sign out
  const handleSignOut = async () => {
    api.auth.logout();
    await queryClient.cancelQueries();
    queryClient.clear();
    try {
      await supabase.auth.signOut();
    } catch {}
    window.dispatchEvent(new Event('bamas_auth_changed'));
    navigate({ to: '/login', replace: true });
  };

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText('BAMAS10');
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  const initial = ((user?.name || user?.email || 'U').charAt(0) || 'U').toUpperCase();
  const isAdmin = user?.role === 'admin';

  return (
    <div
      className="profile-page-container"
      style={{
        minHeight: '100vh',
        background: '#f8fafb',
        padding: '1.25rem 1rem calc(80px + env(safe-area-inset-bottom, 16px))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'Manrope, sans-serif',
      }}
    >
      {/* Full Page Profile Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#ffffff',
          borderRadius: '18px',
          boxShadow: '0 12px 40px rgba(9, 35, 48, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {user ? (
          /* Logged In Patron Card */
          <div>
            {/* Header: Dark Navy Luxury Gradient */}
            <div
              style={{
                background: 'linear-gradient(135deg, #061821 0%, #0d2a38 100%)',
                padding: '1.35rem 1.25rem',
                color: '#ffffff',
                borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.65rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: '#d4af37',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  👑 {isAdmin ? 'ADMINISTRATOR' : 'BAMAS ROYAL PATRON'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.95rem' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #d4af37 0%, #b8972e 100%)',
                    color: '#061821',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.35rem',
                    boxShadow: '0 3px 12px rgba(212, 175, 55, 0.4)',
                    border: '2px solid #ffffff',
                    flexShrink: 0,
                  }}
                >
                  {initial}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <h2
                    style={{
                      margin: '0 0 3px',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      fontFamily: 'Cormorant Garamond, serif',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {user.name || 'Valued Patron'}
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.8rem',
                      color: '#94a3b8',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {user.email}
                  </p>
                  {user.phone && (
                    <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#d4af37' }}>
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
                padding: '0.85rem 0.5rem',
                textAlign: 'center',
              }}
            >
              <Link
                to="/bookings"
                style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
              >
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: '#688897',
                    display: 'block',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                  }}
                >
                  Bookings
                </span>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#092330' }}>
                  {orders.length}
                </span>
              </Link>

              <Link
                to="/cart"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  borderLeft: '1px solid #e2edf0',
                  borderRight: '1px solid #e2edf0',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: '#688897',
                    display: 'block',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                  }}
                >
                  Silk Bag
                </span>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#092330' }}>
                  {cartCount}
                </span>
              </Link>

              <Link
                to="/address"
                style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
              >
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: '#688897',
                    display: 'block',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                  }}
                >
                  City
                </span>
                <span
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: '#092330',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block',
                  }}
                >
                  {user.address?.city || 'India'}
                </span>
              </Link>
            </div>

            {/* Recent Bookings Section */}
            <div style={{ padding: '0.95rem 1.15rem', borderBottom: '1px solid #f1f5f9' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.65rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#092330',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Recent Bookings
                </span>
                <Link
                  to="/bookings"
                  style={{
                    fontSize: '0.72rem',
                    color: '#0e7490',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  View All ({orders.length}) →
                </Link>
              </div>

              {loadingOrders ? (
                <div
                  style={{
                    padding: '1.25rem',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '0.8rem',
                  }}
                >
                  <RefreshCw size={15} className="spin" style={{ margin: '0 auto 6px' }} />
                  Loading bookings...
                </div>
              ) : orders.length === 0 ? (
                <div
                  style={{
                    padding: '0.85rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ margin: '0 0 4px', fontSize: '0.78rem', color: '#64748b' }}>
                    No saree bookings yet.
                  </p>
                  <Link
                    to="/products"
                    style={{
                      fontSize: '0.74rem',
                      color: '#d4af37',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    Explore Boutique Collection →
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {orders.slice(0, 2).map((ord) => {
                    const num = ord._id?.toString().slice(-6).toUpperCase() || 'ORDER';
                    const firstItem = ord.orderItems?.[0];
                    const status = ord.status || (ord.isPaid ? 'Confirmed' : 'Placed');
                    const isConfirmed = status.toLowerCase().includes('confirm');
                    const isShipped = status.toLowerCase().includes('ship');

                    return (
                      <Link
                        key={ord._id}
                        to="/bookings"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.6rem 0.75rem',
                          borderRadius: '8px',
                          background: '#f8fafc',
                          textDecoration: 'none',
                          color: '#092330',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            minWidth: 0,
                          }}
                        >
                          {firstItem?.image && (
                            <img
                              src={firstItem.image}
                              alt={firstItem.name}
                              style={{
                                width: '34px',
                                height: '42px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <div style={{ minWidth: 0 }}>
                            <span
                              style={{
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                color: '#092330',
                                display: 'block',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              #{num} · {firstItem?.name || 'Saree Booking'}
                            </span>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                color: isConfirmed ? '#059669' : isShipped ? '#0284c7' : '#d97706',
                                fontWeight: 600,
                              }}
                            >
                              ✓ {status}
                            </span>
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: '0.84rem',
                            fontWeight: 800,
                            color: '#092330',
                            flexShrink: 0,
                          }}
                        >
                          ₹{(ord.totalPrice || 0).toLocaleString('en-IN')}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Menu Navigation Links */}
            <div style={{ padding: '0.65rem 0.75rem' }}>
              {/* 1. My Bookings & Orders */}
              <Link
                to="/bookings"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '8px',
                  background: 'transparent',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#092330',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Package size={17} color="#d4af37" />
                  <span>My Bookings & Orders</span>
                </div>
                <ChevronRight size={15} color="#94a3b8" />
              </Link>

              {/* 2. Saved Delivery Address */}
              <Link
                to="/address"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '8px',
                  background: 'transparent',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#092330',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <MapPin size={17} color="#d4af37" />
                  <span>Saved Delivery Address</span>
                </div>
                <ChevronRight size={15} color="#94a3b8" />
              </Link>

              {/* 3. Silk Bag Checkout */}
              <Link
                to="/cart"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '8px',
                  background: 'transparent',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#092330',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <ShoppingBag size={17} color="#d4af37" />
                  <span>Silk Bag Checkout</span>
                </div>
                <span
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    background: '#f1f5f9',
                    padding: '2px 9px',
                    borderRadius: '999px',
                    color: '#092330',
                  }}
                >
                  {cartCount}
                </span>
              </Link>

              {/* 4. 10% Privilege Code Quick Pill */}
              <div
                onClick={handleCopyCoupon}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: '#fffdf7',
                  border: '1px dashed #d4af37',
                  margin: '0.45rem 0',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <Sparkles size={15} color="#d4af37" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#092330' }}>
                    BAMAS10 (10% Off)
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.74rem',
                    color: copiedCoupon ? '#059669' : '#b45309',
                    fontWeight: 700,
                  }}
                >
                  {copiedCoupon ? '✓ Copied!' : 'Click to Copy'}
                </span>
              </div>

              {/* 5. Live Concierge Support Chat */}
              <button
                type="button"
                onClick={() => setChatOpen(true)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#092330',
                  textAlign: 'left',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ position: 'relative' }}>
                    <MessageSquare size={17} color="#d4af37" />
                    <span
                      style={{
                        position: 'absolute',
                        top: '-1px',
                        right: '-2px',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#22c55e',
                      }}
                    />
                  </div>
                  <span>Live Concierge Chat</span>
                </div>
                <ChevronRight size={15} color="#94a3b8" />
              </button>

              {/* 6. Admin Portal (if admin) */}
              {isAdmin && (
                <Link
                  to="/admin"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0.85rem',
                    borderRadius: '8px',
                    background: 'rgba(212, 175, 55, 0.1)',
                    textDecoration: 'none',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#092330',
                    boxSizing: 'border-box',
                    marginBottom: '0.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ShieldCheck size={17} color="#d4af37" />
                    <span>Administrator Suite</span>
                  </div>
                  <ChevronRight size={15} color="#d4af37" />
                </Link>
              )}

              {/* 7. Sign Out */}
              <button
                type="button"
                onClick={handleSignOut}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: '#dc2626',
                  textAlign: 'left',
                  boxSizing: 'border-box',
                  marginTop: '0.15rem',
                }}
              >
                <LogOut size={17} color="#dc2626" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* Guest Patron Card (Not Logged In) */
          <div>
            <div
              style={{
                background: 'linear-gradient(135deg, #061821 0%, #0d2a38 100%)',
                padding: '1.75rem 1.25rem',
                color: '#ffffff',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1.5px solid rgba(212, 175, 55, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                  color: '#d4af37',
                }}
              >
                <User size={26} />
              </div>

              <span
                style={{
                  fontSize: '0.7rem',
                  color: '#d4af37',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '0.25rem',
                }}
              >
                👑 BAMAS VALUED GUEST
              </span>

              <h2
                style={{
                  margin: '0 0 0.5rem',
                  fontSize: '1.35rem',
                  fontFamily: 'Cormorant Garamond, serif',
                  color: '#ffffff',
                }}
              >
                Welcome to Bamas Collection
              </h2>

              <p style={{ margin: '0 0 1.25rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                Sign in to manage your saree bookings, track deliveries, and access patron privileges.
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
                    padding: '0.65rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
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
                    padding: '0.65rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Register
                </Link>
              </div>
            </div>

            <div style={{ padding: '0.75rem' }}>
              <Link
                to="/cart"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '8px',
                  background: 'transparent',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#092330',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <ShoppingBag size={17} color="#d4af37" />
                  <span>Silk Bag Checkout</span>
                </div>
                <span
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    background: '#f1f5f9',
                    padding: '2px 9px',
                    borderRadius: '999px',
                    color: '#092330',
                  }}
                >
                  {cartCount}
                </span>
              </Link>

              <div
                onClick={handleCopyCoupon}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: '#fffdf7',
                  border: '1px dashed #d4af37',
                  margin: '0.45rem 0',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <Sparkles size={15} color="#d4af37" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#092330' }}>
                    BAMAS10 (10% Off)
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.74rem',
                    color: copiedCoupon ? '#059669' : '#b45309',
                    fontWeight: 700,
                  }}
                >
                  {copiedCoupon ? '✓ Copied!' : 'Click to Copy'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Concierge Chat Modal */}
      <ConciergeChat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        showFloatingButton={false}
      />
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  CalendarCheck,
  ShoppingBag,
  Package,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  Sparkles,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { pageHead } from '@/lib/page-head';
import { useCustomer } from '@/components/bamas/auth-context';
import { cart, type CartItem } from '@/lib/cart';
import { api } from '@/lib/api';

export const Route = createFileRoute('/bookings')({
  head: () =>
    pageHead(
      'My Saree Bookings & Orders | Bamas Collection',
      'View your active silk bag bookings, confirmed handloom saree orders, and live delivery status.'
    ),
  component: BookingsPage,
});

function BookingsPage() {
  const { user } = useCustomer();
  const navigate = useNavigate();

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

  // Fetch orders
  useEffect(() => {
    const handleCartSync = () => {
      try {
        const items = cart.getItems ? cart.getItems() : [];
        setCartItems(items);
        const total =
          typeof cart?.getSubtotal === 'function'
            ? cart.getSubtotal()
            : items.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0);
        setCartTotal(total);
      } catch (err) {
        console.error('Cart sync error:', err);
      }
    };
    window.addEventListener('bamas_cart_updated', handleCartSync);

    const fetchOrdersData = async () => {
      const token = localStorage.getItem('bamas_token');
      if (!token) return;

      try {
        setLoadingOrders(true);
        const res = await api.orders.getMyOrders().catch(() => ({ data: [] }));
        if (res.data) setOrders(res.data);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrdersData();

    const handleOrderSync = () => fetchOrdersData();
    window.addEventListener('bamas_order_created', handleOrderSync);

    return () => {
      window.removeEventListener('bamas_cart_updated', handleCartSync);
      window.removeEventListener('bamas_order_created', handleOrderSync);
    };
  }, [user]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafb',
        padding: '1.25rem 1rem 6rem',
        maxWidth: '840px',
        margin: '0 auto',
        fontFamily: 'Manrope, sans-serif',
      }}
    >
      {/* Top Header with Back to Profile Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Link
          to="/profile"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#092330',
            padding: '0.45rem 0.85rem',
            borderRadius: '0.55rem',
            fontSize: '0.82rem',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Profile</span>
        </Link>

        <h1
          style={{
            margin: 0,
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '1.35rem',
            fontWeight: 700,
            color: '#092330',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <CalendarCheck size={20} style={{ color: '#d4af37' }} />
          My Saree Bookings
        </h1>
      </div>

      {/* 1. ACTIVE BOOKINGS IN SILK BAG */}
      <div style={{ marginBottom: '2rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.85rem',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#092330',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <ShoppingBag size={18} style={{ color: '#d4af37' }} />
            Active Saree Bag ({cartItems.length})
          </h2>

          <Link
            to="/cart"
            style={{
              fontSize: '0.8rem',
              color: '#d4af37',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <span>Complete Order</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {cartItems.length > 0 ? (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '1rem',
              border: '1px solid rgba(9, 35, 48, 0.08)',
              padding: '1.15rem',
              boxShadow: '0 4px 16px rgba(9, 35, 48, 0.04)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    paddingBottom: '0.85rem',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: '58px',
                      height: '58px',
                      borderRadius: '0.5rem',
                      objectFit: 'cover',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        color: '#092330',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.name}
                    </h3>
                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                      {item.fabric || 'Pure Mulberry Silk'} · Qty: {item.quantity || 1}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#092330' }}>
                      ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.85rem',
                borderTop: '1px dashed #e2e8f0',
              }}
            >
              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Bag Subtotal:</span>
                <p style={{ margin: '0.1rem 0 0', fontSize: '1.15rem', fontWeight: 800, color: '#092330' }}>
                  ₹{cartTotal.toLocaleString('en-IN')}
                </p>
              </div>

              <Link
                to="/cart"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: 'linear-gradient(135deg, #092330 0%, #163e52 100%)',
                  color: '#d4af37',
                  border: '1px solid #d4af37',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '0.65rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(9, 35, 48, 0.2)',
                }}
              >
                <span>Checkout & Delivery</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '1rem',
              border: '1px solid rgba(9, 35, 48, 0.08)',
              padding: '1.75rem 1.25rem',
              textAlign: 'center',
              boxShadow: '0 2px 10px rgba(9, 35, 48, 0.03)',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'rgba(212, 175, 55, 0.12)',
                color: '#d4af37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem',
              }}
            >
              <ShoppingBag size={22} />
            </div>
            <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#092330' }}>
              No Active Sarees in Bag
            </h3>
            <p style={{ margin: '0.35rem auto 1rem', fontSize: '0.8rem', color: '#688c99', maxWidth: '320px' }}>
              Explore our handpicked pure zari heirloom silks for your special occasions.
            </p>
            <Link
              to="/products"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: '#d4af37',
                color: '#092330',
                padding: '0.6rem 1.25rem',
                borderRadius: '0.5rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <span>Explore Collections</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </div>

      {/* 2. CONFIRMED ORDERS & PAST BOOKINGS */}
      <div>
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
          <Package size={18} style={{ color: '#d4af37' }} />
          Confirmed Orders & Dispatch History
        </h2>

        {loadingOrders ? (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '1rem',
              padding: '2rem',
              textAlign: 'center',
              color: '#64748b',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <RefreshCw size={16} className="animate-spin" />
            <span>Loading confirmed booking history...</span>
          </div>
        ) : orders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {orders.map((order) => {
              const orderId = order._id?.slice(-8)?.toUpperCase() || 'BM-ORDER';
              const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'Recent';
              const itemsList = order.orderItems || [];
              const statusColor =
                order.orderStatus === 'Delivered'
                  ? '#16a34a'
                  : order.orderStatus === 'Dispatched'
                  ? '#0284c7'
                  : '#d4af37';

              return (
                <div
                  key={order._id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '1rem',
                    border: '1px solid rgba(9, 35, 48, 0.08)',
                    padding: '1.15rem',
                    boxShadow: '0 2px 10px rgba(9, 35, 48, 0.03)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.75rem',
                      paddingBottom: '0.65rem',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#092330' }}>
                        Booking #{orderId}
                      </span>
                      <p style={{ margin: '0.1rem 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                        {dateStr} · {order.paymentMethod || 'Prepaid'}
                      </p>
                    </div>

                    <span
                      style={{
                        background: `${statusColor}15`,
                        color: statusColor,
                        border: `1px solid ${statusColor}35`,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                      }}
                    >
                      {order.orderStatus || 'Confirmed'}
                    </span>
                  </div>

                  {/* Items in order */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {itemsList.map((it: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.82rem', color: '#334155' }}>
                          {it.name || 'Pure Silk Saree'} × {it.qty || 1}
                        </span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#092330' }}>
                          ₹{((it.price || 0) * (it.qty || 1)).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '0.65rem',
                      borderTop: '1px solid #f8fafc',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Status: {order.isPaid ? 'Payment Verified' : 'Cash on Delivery'}
                    </span>
                    <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#092330' }}>
                      Total: ₹{(order.totalPrice || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '1rem',
              border: '1px solid rgba(9, 35, 48, 0.08)',
              padding: '1.75rem 1rem',
              textAlign: 'center',
              color: '#64748b',
              fontSize: '0.82rem',
            }}
          >
            No confirmed orders yet. Once you place an order, live dispatch tracking will appear here.
          </div>
        )}
      </div>
    </div>
  );
}

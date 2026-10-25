import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Trash2,
  ShieldCheck,
  Truck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pageHead } from '@/lib/page-head';
import { cart, type CartItem } from '@/lib/cart';
import { BookingCheckout } from '@/components/bamas/booking-checkout';

export const Route = createFileRoute('/cart')({
  head: () =>
    pageHead(
      'Your Silk Bag | Bamas Collection',
      'Review your handcrafted pure handloom silk sarees in your bag and proceed to secure atelier booking checkout.'
    ),
  component: CartPage,
});

function CartPage() {
  const navigate = useNavigate();

  // Cart items state
  const [items, setItems] = useState<CartItem[]>(() => cart.getItems());
  const [isCheckout, setIsCheckout] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  // Set body class when Cart page is active to hide top nav bar on mobile
  useEffect(() => {
    document.body.classList.add('cart-view-open');
    return () => {
      document.body.classList.remove('cart-view-open');
    };
  }, []);

  // Sync with real-time cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      setItems(cart.getItems());
    };
    window.addEventListener('bamas_cart_updated', handleCartUpdate);
    return () => window.removeEventListener('bamas_cart_updated', handleCartUpdate);
  }, []);

  // Price calculations
  const rawSubtotal = items.reduce(
    (acc, it) => acc + (Number(it.price) || 0) * (it.quantity || 1),
    0
  );
  const taxPrice = Math.round(rawSubtotal * 0.05); // 5% Handloom GST
  const grandTotal = rawSubtotal + taxPrice;
  const totalItemCount = items.reduce((acc, it) => acc + (it.quantity || 1), 0);

  // Out of stock check
  const hasOutOfStockItems = items.some(
    (it) =>
      (Number(it.price) || 0) <= 0 ||
      (typeof it.countInStock === 'number' && it.countInStock <= 0) ||
      it.inStock === false
  );

  // 1. DEDICATED BOOKING CHECKOUT VIEW (Redirected when Proceed to Checkout is clicked)
  if (isCheckout && items.length > 0) {
    return (
      <main style={{ minHeight: '85vh', background: '#fafbfc', padding: '1.5rem 1rem 5rem' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <BookingCheckout
            cartItems={items}
            onBack={() => {
              setIsCheckout(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSuccessOrder={(order) => {
              setCompletedOrder(order);
              setIsCheckout(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      </main>
    );
  }

  // 2. ORDER CONFIRMATION RECEIPT VIEW
  if (completedOrder) {
    const orderNumber =
      completedOrder._id?.toString().slice(-8).toUpperCase() || 'BAMAS-ORDER';

    return (
      <main style={{ minHeight: '80vh', padding: '3rem 1rem', background: '#fafbfc' }}>
        <div
          style={{
            maxWidth: '680px',
            margin: '0 auto',
            background: '#ffffff',
            borderRadius: '1.25rem',
            border: '1px solid #dce8ec',
            padding: '2.5rem 2rem',
            boxShadow: '0 10px 30px rgba(9, 35, 48, 0.06)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(212, 175, 55, 0.15)',
              border: '2px solid rgba(212, 175, 55, 0.4)',
              color: '#d4af37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              color: '#d4af37',
              display: 'block',
              marginBottom: '0.35rem',
            }}
          >
            Atelier Reservation Confirmed
          </span>

          <h1
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '2.2rem',
              color: '#092330',
              fontWeight: 700,
              margin: '0 0 0.5rem',
            }}
          >
            Booking Registered #{orderNumber}
          </h1>

          <p style={{ color: '#527482', fontSize: '0.92rem', margin: '0 auto 1.75rem', maxWidth: '480px', lineHeight: 1.5 }}>
            Thank you! Your bespoke handloom silk saree booking has been received and registered with our weaving studio.
          </p>

          <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              onClick={() => {
                setCompletedOrder(null);
                navigate({ to: '/products' });
              }}
              style={{
                background: '#092330',
                color: '#ffffff',
                border: '1px solid #d4af37',
                padding: '0.75rem 1.75rem',
                fontWeight: 600,
                borderRadius: '0.5rem',
              }}
            >
              Browse More Sarees
            </Button>
            <Button
              onClick={() => {
                setCompletedOrder(null);
                navigate({ to: '/profile' });
              }}
              variant="outline"
              style={{
                borderColor: '#cbd5e1',
                padding: '0.75rem 1.5rem',
                fontWeight: 600,
                borderRadius: '0.5rem',
              }}
            >
              View in My Profile
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // 3. EMPTY SILK BAG VIEW
  if (items.length === 0) {
    return (
      <main style={{ minHeight: '75vh', padding: '4rem 1rem', background: '#fafbfc' }}>
        <div
          style={{
            maxWidth: '540px',
            margin: '0 auto',
            textAlign: 'center',
            background: '#ffffff',
            borderRadius: '1.25rem',
            border: '1px solid #dce8ec',
            padding: '3.5rem 2rem',
            boxShadow: '0 4px 20px rgba(9, 35, 48, 0.04)',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(212, 175, 55, 0.12)',
              color: '#d4af37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <ShoppingBag size={34} />
          </div>

          <h1
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '2.1rem',
              color: '#092330',
              fontWeight: 700,
              margin: '0 0 0.5rem',
            }}
          >
            Your Silk Bag is Empty
          </h1>

          <p style={{ color: '#527482', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 auto 1.75rem', maxWidth: '400px' }}>
            You haven't reserved any sarees yet. Explore our handcrafted pure mulberry silk sarees and bridal trousseaus.
          </p>

          <Button
            onClick={() => navigate({ to: '/products' })}
            style={{
              background: '#092330',
              color: '#ffffff',
              border: '1px solid #d4af37',
              padding: '0.75rem 2rem',
              fontSize: '0.95rem',
              fontWeight: 600,
              borderRadius: '0.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(9, 35, 48, 0.15)',
            }}
          >
            <span>Explore Saree Collection</span>
            <ArrowRight size={16} color="#d4af37" />
          </Button>
        </div>
      </main>
    );
  }

  // 4. CLEAN SAREE CART VIEW: SHOW ONLY SAREES & PROCEED TO CHECKOUT
  return (
    <main
      className="cart-page-container"
      style={{ minHeight: '85vh', background: '#fafbfc', padding: '2rem 1rem 6rem', fontFamily: 'Manrope, sans-serif' }}
    >
      <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '1.25rem' }}>
          <Link
            to="/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#527482',
              textDecoration: 'none',
              padding: '0.35rem 0.75rem',
              background: '#ffffff',
              borderRadius: '999px',
              border: '1px solid #dce8ec',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeft size={14} style={{ color: '#d4af37' }} />
            <span>Continue Browsing Sarees</span>
          </Link>
        </div>

        {/* Page Header */}
        <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #e2edf0', paddingBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#d4af37', display: 'block', marginBottom: '0.2rem' }}>
              Atelier Silk Bag
            </span>
            <h1
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '2.2rem',
                color: '#092330',
                fontWeight: 700,
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Your Reserved Sarees
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#688c99', fontWeight: 600 }}>
              {totalItemCount} {totalItemCount === 1 ? 'saree drape' : 'saree drapes'}
            </span>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Clear all sarees from your silk bag?')) {
                  cart.clear();
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '4px 8px',
                borderRadius: '4px',
              }}
            >
              <Trash2 size={13} />
              <span>Clear Bag</span>
            </button>
          </div>
        </div>

        {/* Out of stock warning banner if any item cannot be booked */}
        {hasOutOfStockItems && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.75rem',
              padding: '0.85rem 1.15rem',
              color: '#991b1b',
              fontSize: '0.82rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
            }}
          >
            <AlertTriangle size={18} style={{ color: '#dc2626', flexShrink: 0 }} />
            <div>
              <strong style={{ display: 'block' }}>One or more sarees in your bag are Out of Stock (₹0 or 0 Inventory)</strong>
              <span>Please remove out-of-stock items using the Remove button below to proceed with checkout.</span>
            </div>
          </div>
        )}

        {/* 2-Column Cart Grid: Saree Items on Left, Order Summary on Right */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.8fr) minmax(300px, 1.1fr)',
            gap: '2rem',
            alignItems: 'start',
          }}
          className="cart-main-grid"
        >
          {/* LEFT: SAREES LIST ONLY */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map((item) => {
              const itemPrice = Number(item.price) || 0;
              const isItemOutOfStock =
                itemPrice <= 0 ||
                (typeof item.countInStock === 'number' && item.countInStock <= 0) ||
                item.inStock === false;

              return (
                <div
                  key={item.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '1rem',
                    border: isItemOutOfStock ? '1.5px solid #fca5a5' : '1px solid #dce8ec',
                    padding: '1.15rem',
                    boxShadow: '0 4px 16px rgba(9, 35, 48, 0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.15rem',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                  }}
                  className="cart-saree-card"
                >
                  {/* Saree Photo */}
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: '84px',
                      height: '108px',
                      objectFit: 'cover',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      flexShrink: 0,
                    }}
                  />

                  {/* Saree Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          color: '#0e7490',
                          background: 'rgba(14, 116, 144, 0.08)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {item.category ? `${item.category} Edit` : 'Handloom Silk'}
                      </span>

                      {isItemOutOfStock ? (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: '#dc2626',
                            background: '#fee2e2',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          Out of Stock
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            color: '#16a34a',
                            background: '#dcfce7',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          ● In Stock
                        </span>
                      )}
                    </div>

                    <h3
                      style={{
                        margin: '0 0 0.35rem',
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: '#092330',
                        lineHeight: 1.3,
                      }}
                    >
                      {item.name}
                    </h3>

                    {/* Price */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.65rem' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#092330' }}>
                        ₹{(itemPrice * (item.quantity || 1)).toLocaleString('en-IN')}
                      </span>
                      {item.quantity > 1 && (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          (₹{itemPrice.toLocaleString('en-IN')} each)
                        </span>
                      )}
                    </div>

                    {/* Quantity Stepper & REMOVE OPTION */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      {/* Stepper */}
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          background: '#f8fafc',
                          overflow: 'hidden',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => cart.updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                          aria-label="Decrease quantity"
                          style={{
                            width: '32px',
                            height: '30px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: '#092330',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          –
                        </button>
                        <span
                          style={{
                            minWidth: '32px',
                            textAlign: 'center',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: '#092330',
                          }}
                        >
                          {item.quantity || 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => cart.updateQuantity(item.id, (item.quantity || 1) + 1)}
                          aria-label="Increase quantity"
                          style={{
                            width: '32px',
                            height: '30px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: '#092330',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          +
                        </button>
                      </div>

                      {/* CLEAR & PROMINENT REMOVE OPTION */}
                      <button
                        type="button"
                        onClick={() => cart.removeItem(item.id)}
                        className="cart-remove-item-btn"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: 'rgba(239, 68, 68, 0.08)',
                          color: '#dc2626',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: '6px',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Trash2 size={13} style={{ color: '#dc2626' }} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: ORDER SUMMARY & PROCEED TO CHECKOUT */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '1rem',
              border: '1px solid #dce8ec',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(9, 35, 48, 0.05)',
              position: 'sticky',
              top: '1.5rem',
            }}
          >
            <h2
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '1.35rem',
                fontWeight: 700,
                color: '#092330',
                margin: '0 0 1rem',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '0.75rem',
              }}
            >
              Order Summary
            </h2>

            {/* Line items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Subtotal ({totalItemCount} sarees)</span>
                <span style={{ fontWeight: 600, color: '#092330' }}>₹{rawSubtotal.toLocaleString('en-IN')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Handloom Tax (GST 5%)</span>
                <span style={{ fontWeight: 600, color: '#092330' }}>₹{taxPrice.toLocaleString('en-IN')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Insured Delivery</span>
                <span style={{ fontWeight: 700, color: '#16a34a' }}>COMPLIMENTARY</span>
              </div>

              <div style={{ borderTop: '1px solid #e2edf0', margin: '0.25rem 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#092330' }}>Total Amount</span>
                <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#d4af37' }}>
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* PROCEED TO CHECKOUT BUTTON */}
            <Button
              type="button"
              disabled={items.length === 0 || hasOutOfStockItems}
              onClick={() => {
                setIsCheckout(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                width: '100%',
                background: hasOutOfStockItems ? '#94a3b8' : '#092330',
                color: '#ffffff',
                border: hasOutOfStockItems ? '1px solid #cbd5e1' : '1px solid #d4af37',
                padding: '0.85rem 1.25rem',
                fontSize: '0.92rem',
                fontWeight: 700,
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: hasOutOfStockItems ? 'none' : '0 4px 16px rgba(9, 35, 48, 0.2)',
                cursor: hasOutOfStockItems ? 'not-allowed' : 'pointer',
                marginBottom: '1rem',
              }}
            >
              {hasOutOfStockItems ? (
                <span>Cannot Proceed (Item Out of Stock)</span>
              ) : (
                <>
                  <Sparkles size={16} color="#d4af37" />
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={16} />
                </>
              )}
            </Button>

            {/* Guarantees */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <ShieldCheck size={14} style={{ color: '#16a34a', flexShrink: 0 }} />
                <span>Silk Mark Certified 100% Pure Mulberry Silk</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Truck size={14} style={{ color: '#0284c7', flexShrink: 0 }} />
                <span>Pan-India Insured Transit with Live Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

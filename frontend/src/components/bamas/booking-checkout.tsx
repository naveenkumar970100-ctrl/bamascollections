import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Lock,
  LoaderCircle,
  Truck,
  CreditCard,
  QrCode,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCustomer } from './auth-context';
import { api } from '@/lib/api';
import { cart } from '@/lib/cart';

interface BookingCheckoutProps {
  saree?: any;
  quantity?: number;
  cartItems?: any[];
  onBack: () => void;
  onSuccessOrder?: (order: any) => void;
}

export function BookingCheckout({
  saree,
  quantity = 1,
  cartItems,
  onBack,
  onSuccessOrder,
}: BookingCheckoutProps) {
  const { user } = useCustomer();

  // Active items array (either from cartItems or single saree)
  const activeItems =
    cartItems && cartItems.length > 0
      ? cartItems
      : saree
      ? [{ ...saree, quantity }]
      : [];

  // Delivery form state (with sensible patron defaults)
  const [name, setName] = useState(user?.name || 'Valued Patron');
  const [email, setEmail] = useState(user?.email || 'patron@bamascollections.com');
  const [phone, setPhone] = useState(user?.phone || '9876543210');
  const [street, setStreet] = useState(user?.address?.street || 'Road No. 36, Jubilee Hills');
  const [city, setCity] = useState(user?.address?.city || 'Hyderabad');
  const [state, setState] = useState(user?.address?.state || 'Telangana');
  const [pincode, setPincode] = useState(user?.address?.postalCode || '500033');
  const [editingAddress, setEditingAddress] = useState(false);

  // Payment method selection ('UPI / QR Code' | 'Cards & NetBanking' | 'Cash on Delivery')
  const [paymentMethod, setPaymentMethod] = useState<
    'UPI / QR Code' | 'Cards & NetBanking' | 'Cash on Delivery'
  >('UPI / QR Code');
  const [upiId] = useState('bamas@okhdfcbank');

  // Simulation & order completion state
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success'>('idle');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  // Sync user details if patron signs in
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
      if (user.address?.street) setStreet(user.address.street);
      if (user.address?.city) setCity(user.address.city);
      if (user.address?.state) setState(user.address.state);
      if (user.address?.postalCode) setPincode(user.address.postalCode);
    }
  }, [user]);

  // Price calculations
  const itemsPrice = activeItems.reduce(
    (acc, it) => acc + (it.price || 0) * (it.quantity || 1),
    0
  );
  const taxPrice = Math.round(itemsPrice * 0.05); // 5% GST
  const totalPrice = itemsPrice + taxPrice;

  // Items are out of stock if price <= 0 or countInStock <= 0 or inStock is explicitly false
  const hasOutOfStockItems = activeItems.some(
    (it) =>
      (Number(it.price) || 0) <= 0 ||
      (typeof it.countInStock === 'number' && it.countInStock <= 0) ||
      it.inStock === false
  );

  const primaryItem = activeItems[0] || saree || {
    name: 'Handloom Silk Saree',
    price: 9500,
    category: 'Silk Bag',
    image: '',
  };
  const primaryName =
    activeItems.length > 1
      ? `${activeItems.length} Sarees (Silk Bag Order)`
      : primaryItem.name;
  const primaryImage = primaryItem.image;
  const totalQty = activeItems.reduce((acc, it) => acc + (it.quantity || 1), 0);

  // 1-Click Direct Demo Payment Handler
  async function handleDirectPay() {
    if (hasOutOfStockItems || totalPrice <= 0) {
      setError('Out of stock or ₹0 cost items cannot be booked. You can keep them in your cart.');
      return;
    }

    setPaymentState('processing');
    setBusy(true);
    setError('');

    try {
      // Simulate quick secure authorization
      await new Promise((resolve) => setTimeout(resolve, 800));

      const paymentResult = {
        id: 'DEMO_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        status: 'COMPLETED',
        method: paymentMethod === 'UPI / QR Code' ? `UPI (${upiId})` : paymentMethod,
        amount: totalPrice,
        paidAt: new Date().toISOString(),
      };

      const orderPayload = {
        orderItems: activeItems.map((item) => ({
          name: item.name || 'Bamas Heritage Saree',
          qty: item.quantity || 1,
          quantity: item.quantity || 1,
          image: item.image || '',
          price: Number(item.price) || 0,
          product: item.id || item._id || item.slug || 'saree',
        })),
        shippingAddress: {
          fullName: name || user?.name || 'Valued Patron',
          name: name || user?.name || 'Valued Patron',
          street: street || 'Road No. 36, Jubilee Hills',
          city: city || 'Hyderabad',
          state: state || 'Telangana',
          postalCode: pincode || '500033',
          pincode: pincode || '500033',
          country: 'India',
          phone: phone || user?.phone || '9876543210',
          email: email || user?.email,
        },
        paymentMethod: paymentResult.method,
        isPaid: true,
        paymentResult,
        itemsPrice,
        taxPrice,
        shippingPrice: 0,
        totalPrice,
        email: email || user?.email,
        phone: phone || user?.phone || '9876543210',
        name: name || user?.name || 'Valued Patron',
      };

      const res = await api.orders.create(orderPayload);
      const orderData = res.data || {
        _id: 'BAMAS-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        totalPrice,
        createdAt: new Date().toISOString(),
        isPaid: true,
        status: 'Confirmed',
        paymentMethod: paymentResult.method,
        orderItems: orderPayload.orderItems,
        shippingAddress: orderPayload.shippingAddress,
      };

      setPaymentState('success');

      if (cartItems && cartItems.length > 0) {
        cart.clear();
      } else if (saree?.id) {
        cart.removeItem(saree.id);
      }

      window.dispatchEvent(new Event('bamas_order_created'));
      window.dispatchEvent(new Event('bamas_notification_received'));

      setTimeout(() => {
        setCompletedOrder(orderData);
        if (onSuccessOrder) onSuccessOrder(orderData);
      }, 700);
    } catch (err: any) {
      setPaymentState('idle');
      setError(err.message || 'Payment simulation failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  // 1. If order is completed, show Royal Booking Confirmation Receipt
  if (completedOrder) {
    const orderNumber =
      completedOrder._id?.toString().slice(-8).toUpperCase() || 'BAMAS-ORDER';

    return (
      <div className="booking-receipt-page reveal">
        <div className="booking-receipt-card">
          <div className="booking-receipt-header">
            <div className="booking-receipt-seal">
              <CheckCircle2 size={36} color="#d4af37" />
            </div>
            <span className="eyebrow">Atelier Reservation Confirmed</span>
            <h2 className="booking-receipt-title">Thank You, {user?.name || name || 'Patron'}!</h2>
            <p className="booking-receipt-subtitle">
              Your bespoke handloom silk saree booking has been received and registered with our
              weaving studio.
            </p>
          </div>

          <div className="booking-receipt-meta-grid">
            <div className="receipt-meta-box">
              <span className="meta-label">Booking Reference</span>
              <span className="meta-val highlight">#{orderNumber}</span>
            </div>
            <div className="receipt-meta-box">
              <span className="meta-label">Payment Method</span>
              <span className="meta-val">{paymentMethod}</span>
            </div>
            <div className="receipt-meta-box">
              <span className="meta-label">Total Amount</span>
              <span className="meta-val gold">₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="receipt-meta-box">
              <span className="meta-label">Estimated Delivery</span>
              <span className="meta-val">3–5 Business Days (Insured)</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '1rem 0' }}>
            {activeItems.map((item, idx) => (
              <div key={item.id || idx} className="booking-receipt-item-row" style={{ margin: 0 }}>
                <img src={item.image} alt={item.name} className="receipt-item-photo" />
                <div className="receipt-item-info">
                  <h4>{item.name}</h4>
                  <span className="receipt-item-category">{item.category} edit</span>
                  <p>Quantity: {item.quantity || 1} saree drape(s)</p>
                </div>
                <span className="receipt-item-price">
                  ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="booking-receipt-destination">
            <MapPin size={16} className="text-gold" />
            <span>
              Shipping to: <strong>{street}, {city}, {state} — {pincode}</strong>
            </span>
          </div>

          <div
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginTop: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} color="#10b981" />
              <span style={{ fontSize: '0.85rem', color: '#065f46', fontWeight: 600 }}>
                Demo Payment Approved & Synced with Admin Dashboard in Real Time
              </span>
            </div>
            <a
              href="/admin"
              style={{
                fontSize: '0.8rem',
                color: '#092330',
                background: '#d4af37',
                padding: '4px 10px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              View in Admin Suite →
            </a>
          </div>

          <div className="booking-receipt-actions">
            <Button onClick={onBack} variant="outline" style={{ borderColor: 'var(--gold)' }}>
              Browse More Sarees
            </Button>
            <a
              href={`https://wa.me/919876543210?text=${encodeURIComponent(
                `Hello Bamas Collection, I have confirmed order #${orderNumber} for ${
                  activeItems.length > 1
                    ? `${activeItems.length} sarees (${activeItems.map((i) => i.name).join(', ')})`
                    : activeItems[0]?.name || saree?.name || 'Silk Saree'
                }.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="booking-receipt-wa-btn"
            >
              <span>Get WhatsApp Updates</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 2. Simple & Professional Checkout Screen in 100% Screen (No scrolling, zero cut-off)
  return (
    <main
      className="booking-checkout-container reveal"
      style={{
        minHeight: 'calc(100vh - 72px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem 1rem',
        background: '#f8fafc',
      }}
    >
      <div
        className="booking-checkout-panel"
        style={{
          maxWidth: '450px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '14px',
          boxShadow: '0 20px 45px rgba(9, 35, 48, 0.12)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '94vh',
        }}
      >
        {/* Top Header */}
        <div
          className="booking-checkout-header"
          style={{
            background: 'linear-gradient(135deg, #092330 0%, #103444 100%)',
            color: '#f8f9fa',
            padding: '0.8rem 1.15rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #d4af37 0%, #aa820a 100%)',
                color: '#092330',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
              }}
            >
              B
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
                  Bamas Payment
                </h3>
                <span
                  style={{
                    background: 'rgba(212, 175, 55, 0.2)',
                    color: '#d4af37',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '4px',
                  }}
                >
                  DEMO
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.68rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Lock size={10} color="#d4af37" /> 256-Bit SSL Insured
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            title="Cancel and return to Saree Details"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#cbd5e1',
              cursor: 'pointer',
              borderRadius: '50%',
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeft size={14} />
          </button>
        </div>

        {/* Amount & Saree Quick Bar */}
        <div
          className="booking-saree-quick-bar"
          style={{
            background: '#f8fafc',
            padding: '0.65rem 1.15rem',
            borderBottom: '1px solid #e2edf0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
            {primaryImage && (
              <img
                src={primaryImage}
                alt={primaryName}
                style={{
                  width: '38px',
                  height: '46px',
                  borderRadius: '4px',
                  objectFit: 'cover',
                  border: '1px solid #cbd5e1',
                  flexShrink: 0,
                }}
              />
            )}
            <div style={{ minWidth: 0 }}>
              <h4
                style={{
                  margin: '0 0 2px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#092330',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {primaryName}
              </h4>
              <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b' }}>
                Qty: {totalQty} · Free Express Delivery
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
              Total Payable
            </span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#092330' }}>
              ₹{totalPrice.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Delivery Address Summary Bar */}
        <div
          className="booking-address-summary-bar"
          style={{
            padding: '0.5rem 1.15rem',
            background: '#ffffff',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.74rem',
            color: '#475569',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
            <MapPin size={13} color="#d4af37" style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Deliver to: <strong style={{ color: '#092330' }}>{name || user?.name || 'Valued Patron'}</strong>, {city || 'Hyderabad'} ({pincode || '500033'})
            </span>
          </div>
          <button
            type="button"
            onClick={() => setEditingAddress(!editingAddress)}
            style={{
              background: 'none',
              border: 'none',
              color: '#0e7490',
              fontWeight: 700,
              fontSize: '0.72rem',
              cursor: 'pointer',
              padding: '2px 4px',
              flexShrink: 0,
            }}
          >
            {editingAddress ? 'Done' : 'Change'}
          </button>
        </div>

        {/* Collapsible Address Form if expanded */}
        {editingAddress && (
          <div
            className="booking-address-grid"
            style={{
              padding: '0.65rem 1.15rem',
              background: '#f8fafc',
              borderBottom: '1px solid #e2edf0',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.4rem',
              fontSize: '0.75rem',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                style={{ width: '100%', padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.75rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>Mobile Number</label>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Mobile (10 digits)"
                style={{ width: '100%', padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.75rem' }}
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>Street Address</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="House / Flat / Street address"
                style={{ width: '100%', padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.75rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                style={{ width: '100%', padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.75rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>Pincode (6 digits)</label>
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="500033"
                style={{ width: '100%', padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.75rem' }}
              />
            </div>
          </div>
        )}

        {/* Payment Methods Section */}
        <div
          className="booking-methods-section"
          style={{ padding: '0.75rem 1.15rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Select Payment Method
          </span>

          {/* 3 Payment Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {/* Option 1: UPI */}
            <label
              className="booking-payment-option"
              onClick={() => setPaymentMethod('UPI / QR Code')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.6rem 0.8rem',
                borderRadius: '8px',
                border: paymentMethod === 'UPI / QR Code' ? '1.5px solid #d4af37' : '1px solid #e2e8f0',
                background: paymentMethod === 'UPI / QR Code' ? '#fffdf7' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="radio"
                name="bookingCheckoutMethod"
                checked={paymentMethod === 'UPI / QR Code'}
                onChange={() => setPaymentMethod('UPI / QR Code')}
                style={{ accentColor: '#d4af37', width: '15px', height: '15px' }}
              />
              <QrCode size={17} color={paymentMethod === 'UPI / QR Code' ? '#d4af37' : '#64748b'} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: paymentMethod === 'UPI / QR Code' ? 700 : 600, color: '#092330' }}>
                    UPI / QR Code
                  </span>
                  <span style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: 700, background: '#ecfdf5', padding: '1px 5px', borderRadius: '4px' }}>
                    Fastest
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>
                  Google Pay, PhonePe, Paytm, BHIM UPI
                </span>
              </div>
            </label>

            {/* Option 2: Card */}
            <label
              className="booking-payment-option"
              onClick={() => setPaymentMethod('Cards & NetBanking')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.6rem 0.8rem',
                borderRadius: '8px',
                border: paymentMethod === 'Cards & NetBanking' ? '1.5px solid #d4af37' : '1px solid #e2e8f0',
                background: paymentMethod === 'Cards & NetBanking' ? '#fffdf7' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="radio"
                name="bookingCheckoutMethod"
                checked={paymentMethod === 'Cards & NetBanking'}
                onChange={() => setPaymentMethod('Cards & NetBanking')}
                style={{ accentColor: '#d4af37', width: '15px', height: '15px' }}
              />
              <CreditCard size={17} color={paymentMethod === 'Cards & NetBanking' ? '#d4af37' : '#64748b'} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: paymentMethod === 'Cards & NetBanking' ? 700 : 600, color: '#092330', display: 'block' }}>
                  Credit / Debit Card
                </span>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  Instant Demo Authorization (Test Card)
                </span>
              </div>
            </label>

            {/* Option 3: COD */}
            <label
              className="booking-payment-option"
              onClick={() => setPaymentMethod('Cash on Delivery')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.6rem 0.8rem',
                borderRadius: '8px',
                border: paymentMethod === 'Cash on Delivery' ? '1.5px solid #d4af37' : '1px solid #e2e8f0',
                background: paymentMethod === 'Cash on Delivery' ? '#fffdf7' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="radio"
                name="bookingCheckoutMethod"
                checked={paymentMethod === 'Cash on Delivery'}
                onChange={() => setPaymentMethod('Cash on Delivery')}
                style={{ accentColor: '#d4af37', width: '15px', height: '15px' }}
              />
              <Truck size={17} color={paymentMethod === 'Cash on Delivery' ? '#d4af37' : '#64748b'} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: paymentMethod === 'Cash on Delivery' ? 700 : 600, color: '#092330', display: 'block' }}>
                  Cash on Delivery
                </span>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  Pay upon doorstep delivery
                </span>
              </div>
            </label>
          </div>

          {/* Context Details */}
          {paymentMethod === 'UPI / QR Code' && (
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '0.5rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <QrCode size={18} color="#092330" />
                <div>
                  <span style={{ fontSize: '0.62rem', color: '#64748b', display: 'block' }}>UPI ID / VPA</span>
                  <strong style={{ fontSize: '0.78rem', color: '#092330' }}>bamas@okhdfcbank</strong>
                </div>
              </div>
              <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 600 }}>
                ✓ 1-Click Simulation
              </span>
            </div>
          )}

          {paymentMethod === 'Cards & NetBanking' && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.72rem', color: '#475569' }}>
              <strong style={{ color: '#092330' }}>Test Card: •••• 4242</strong> · Pre-authorized for instant demo payment.
            </div>
          )}

          {paymentMethod === 'Cash on Delivery' && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.72rem', color: '#475569' }}>
              <strong style={{ color: '#092330' }}>Doorstep Collection</strong> · Pay cash or UPI upon package handover.
            </div>
          )}

          {hasOutOfStockItems && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.6rem 0.75rem', color: '#991b1b', fontSize: '0.74rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <strong style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#dc2626' }}></span>
                Item Out of Stock (₹0 or 0 Inventory)
              </strong>
              <span>Out of stock pieces cannot be booked. However, you can keep them safely saved in your cart.</span>
            </div>
          )}

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.45rem 0.75rem', color: '#dc2626', fontSize: '0.75rem' }}>
              {error}
            </div>
          )}

          {/* Action Button & In-Place Animated State */}
          {paymentState === 'processing' ? (
            <div style={{ padding: '0.85rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <LoaderCircle className="spin" size={24} style={{ color: '#d4af37', margin: '0 auto 0.35rem' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#092330', display: 'block' }}>
                Authorizing Demo Payment...
              </span>
              <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                Registering booking in MongoDB Atlas & notifying master weavers
              </span>
            </div>
          ) : paymentState === 'success' ? (
            <div style={{ padding: '0.85rem', textAlign: 'center', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
              <CheckCircle2 size={24} style={{ color: '#10b981', margin: '0 auto 0.35rem' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#065f46', display: 'block' }}>
                Payment Approved!
              </span>
              <span style={{ fontSize: '0.7rem', color: '#047857' }}>
                ₹{totalPrice.toLocaleString('en-IN')} Received · Preparing your booking receipt...
              </span>
            </div>
          ) : (
            <Button
              type="button"
              className="booking-pay-btn"
              disabled={busy || hasOutOfStockItems || totalPrice <= 0}
              onClick={handleDirectPay}
              style={{
                background: hasOutOfStockItems || totalPrice <= 0 ? '#94a3b8' : '#092330',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.88rem',
                height: '42px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                border: hasOutOfStockItems || totalPrice <= 0 ? '1px solid #cbd5e1' : '1px solid #d4af37',
                boxShadow: hasOutOfStockItems || totalPrice <= 0 ? 'none' : '0 4px 14px rgba(9, 35, 48, 0.2)',
                width: '100%',
                cursor: hasOutOfStockItems || totalPrice <= 0 ? 'not-allowed' : 'pointer',
                marginTop: '0.2rem',
              }}
            >
              {hasOutOfStockItems || totalPrice <= 0 ? (
                <span>Cannot Book (Out of Stock)</span>
              ) : (
                <>
                  <Sparkles size={15} color="#d4af37" />
                  <span>Pay ₹{totalPrice.toLocaleString('en-IN')} (Demo)</span>
                </>
              )}
            </Button>
          )}

          {/* Guarantees */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.68rem', marginTop: '0.1rem' }}>
            <ShieldCheck size={12} color="#10b981" />
            <span>Silk Mark Certified 100% Pure Handloom · Insured Transit</span>
          </div>
        </div>
      </div>
    </main>
  );
}

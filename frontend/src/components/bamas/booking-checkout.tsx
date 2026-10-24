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
import { DemoPaymentModal, type PaymentSuccessResult } from './demo-payment-modal';

interface BookingCheckoutProps {
  saree: any;
  quantity?: number;
  onBack: () => void;
  onSuccessOrder?: (order: any) => void;
}

export function BookingCheckout({
  saree,
  quantity = 1,
  onBack,
  onSuccessOrder,
}: BookingCheckoutProps) {
  const { user } = useCustomer();

  // Delivery form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Telangana');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI / QR Code');

  // Submission, Modal & Confirmation state
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Sync user details if user signs in while on payment page
  useEffect(() => {
    if (user) {
      if (!name && user.name) setName(user.name);
      if (!email && user.email) setEmail(user.email);
      if (!phone && user.phone) setPhone(user.phone);
    }
  }, [user]);

  // Price calculations
  const unitPrice = saree.price || 0;
  const itemsPrice = unitPrice * quantity;
  const taxPrice = Math.round(itemsPrice * 0.05); // 5% GST
  const totalPrice = itemsPrice + taxPrice;

  async function handleConfirmBooking(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide the recipient patron name.');
      return;
    }

    if (!phone.trim() || phone.trim().length < 10) {
      setError('Please provide a valid 10-digit mobile number for order delivery.');
      return;
    }

    if (!street.trim() || !city.trim() || !pincode.trim()) {
      setError('Please provide complete delivery street, city, and PIN code.');
      return;
    }

    // Trigger Demo Payment Gateway modal
    setPaymentModalOpen(true);
  }

  async function handlePaymentSuccess(paymentResult: PaymentSuccessResult) {
    setPaymentModalOpen(false);
    setBusy(true);
    setError('');

    try {
      const orderPayload = {
        orderItems: [
          {
            name: saree.name,
            qty: quantity,
            quantity: quantity,
            image: saree.image,
            price: unitPrice,
            product: saree.id || saree._id || saree.slug || 'saree',
          },
        ],
        shippingAddress: {
          fullName: name || user?.name || 'Valued Patron',
          name: name || user?.name || 'Valued Patron',
          street,
          city,
          state,
          postalCode: pincode,
          pincode,
          country: 'India',
          phone: phone || user?.phone || '9876543210',
          email: email || user?.email,
        },
        paymentMethod: paymentResult.method || paymentMethod,
        isPaid: true,
        paymentResult,
        itemsPrice,
        taxPrice,
        shippingPrice: 0,
        totalPrice,
        email: email || user?.email,
        phone: phone || user?.phone,
        name: name || user?.name,
      };

      const res = await api.orders.create(orderPayload);
      const orderData = res.data || {
        _id: 'BAMAS-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        totalPrice,
        createdAt: new Date().toISOString(),
        isPaid: true,
        status: 'Confirmed',
        paymentMethod: paymentResult.method || paymentMethod,
      };

      // Remove from cart if present
      cart.removeItem(saree.id);

      // Trigger realtime update for Admin portal
      window.dispatchEvent(new Event('bamas_order_created'));
      window.dispatchEvent(new Event('bamas_notification_received'));

      setCompletedOrder(orderData);
      if (onSuccessOrder) onSuccessOrder(orderData);
    } catch (err: any) {
      setError(err.message || 'Failed to place booking. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  // If order is completed, show Royal Booking Confirmation Receipt
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
            <h2 className="booking-receipt-title">Thank You, {user?.name || 'Patron'}!</h2>
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

          <div className="booking-receipt-item-row">
            <img src={saree.image} alt={saree.name} className="receipt-item-photo" />
            <div className="receipt-item-info">
              <h4>{saree.name}</h4>
              <span className="receipt-item-category">{saree.category} edit</span>
              <p>Quantity: {quantity} saree drape(s)</p>
            </div>
            <span className="receipt-item-price">
              ₹{itemsPrice.toLocaleString('en-IN')}
            </span>
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
              href={`https://wa.me/919876543210?text=Hello%20Bamas%20Collection,%20I%20have%20booked%20order%20%23${orderNumber}%20for%20${encodeURIComponent(saree.name)}.`}
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

  return (
    <div className="booking-checkout-page reveal">
      {/* Top back navigation */}
      <div className="booking-checkout-top">
        <button type="button" onClick={onBack} className="booking-back-btn">
          <ArrowLeft size={16} />
          <span>Back to Saree Details</span>
        </button>
        <div className="booking-checkout-lock">
          <Lock size={14} className="text-gold" />
          <span>256-Bit Encrypted Patron Checkout</span>
        </div>
      </div>

      <div className="booking-checkout-grid">
        {/* Left Column: Delivery & Payment Details Form */}
        <div className="booking-form-col">
          <div className="booking-section-card">
            <h2 className="booking-section-heading">
              <span>1</span> Delivery Address & Contact
            </h2>

            {/* Login Status Banner on Payment Page */}
            {!user ? (
              <div className="booking-auth-required-box">
                <div className="booking-auth-required-content">
                  <div className="booking-auth-badge">
                    <Sparkles size={16} color="#d4af37" />
                    <span>Patron Login Required</span>
                  </div>
                  <h3>Sign in to complete your saree booking</h3>
                  <p>
                    Please sign in or register your account to confirm your order, get instant invoice
                    receipts, and track insured pan-India delivery.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <a
                    href="/login"
                    className="booking-auth-google-btn"
                    style={{ textDecoration: 'none', background: '#092330', color: '#ffffff', borderColor: '#092330' }}
                  >
                    <Lock size={16} />
                    <span>Sign in to Account</span>
                  </a>
                  <a
                    href="/register"
                    className="booking-auth-google-btn"
                    style={{ textDecoration: 'none', background: '#ffffff', color: '#092330', borderColor: 'rgba(9, 35, 48, 0.2)' }}
                  >
                    <span>Register Here</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="booking-auth-success-banner">
                <CheckCircle2 size={16} color="#10b981" />
                <span>
                  Signed in as <strong>{user.name || user.email}</strong> ({user.email})
                </span>
              </div>
            )}

            <form onSubmit={handleConfirmBooking} id="booking-payment-form">
              <div className="booking-fields-row">
                <div className="booking-field">
                  <label>Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Recipient's Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="booking-input"
                  />
                </div>
                <div className="booking-field">
                  <label>Mobile Number</label>
                  <input
                    required
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="booking-input"
                  />
                </div>
              </div>

              <div className="booking-field">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com (for order invoice & updates)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="booking-input"
                />
              </div>

              <div className="booking-field">
                <label>Delivery Address</label>
                <input
                  required
                  type="text"
                  placeholder="Flat/House No., Building, Street Name"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="booking-input"
                />
              </div>

              <div className="booking-fields-row-3">
                <div className="booking-field">
                  <label>City</label>
                  <input
                    required
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="booking-input"
                  />
                </div>
                <div className="booking-field">
                  <label>State</label>
                  <input
                    required
                    type="text"
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="booking-input"
                  />
                </div>
                <div className="booking-field">
                  <label>Pincode</label>
                  <input
                    required
                    type="text"
                    maxLength={6}
                    placeholder="PIN Code"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="booking-input"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Payment Method Section */}
          <div className="booking-section-card">
            <h2 className="booking-section-heading">
              <span>2</span> Select Payment Option
            </h2>

            <div className="booking-payment-options">
              <label
                className={`booking-payment-radio ${
                  paymentMethod === 'UPI / QR Code' ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'UPI / QR Code'}
                  onChange={() => setPaymentMethod('UPI / QR Code')}
                />
                <div className="payment-radio-content">
                  <div className="payment-radio-title">
                    <QrCode size={18} className="text-gold" />
                    <span>Instant UPI / QR Code</span>
                  </div>
                  <p>Google Pay, PhonePe, Paytm, or BHIM UPI (Zero convenience fee)</p>
                </div>
              </label>

              <label
                className={`booking-payment-radio ${
                  paymentMethod === 'Cards & NetBanking' ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Cards & NetBanking'}
                  onChange={() => setPaymentMethod('Cards & NetBanking')}
                />
                <div className="payment-radio-content">
                  <div className="payment-radio-title">
                    <CreditCard size={18} className="text-gold" />
                    <span>Credit / Debit Cards & Net Banking</span>
                  </div>
                  <p>All major Indian banks, Visa, MasterCard, RuPay</p>
                </div>
              </label>

              <label
                className={`booking-payment-radio ${
                  paymentMethod === 'Cash on Delivery' ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Cash on Delivery'}
                  onChange={() => setPaymentMethod('Cash on Delivery')}
                />
                <div className="payment-radio-content">
                  <div className="payment-radio-title">
                    <Truck size={18} className="text-gold" />
                    <span>Cash on Delivery (Pay on Doorstep)</span>
                  </div>
                  <p>Insured tamper-proof delivery box with verified receipt</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Confirmation CTA */}
        <div className="booking-summary-col">
          <div className="booking-summary-card">
            <h3 className="booking-summary-title">Booking Summary</h3>

            <div className="booking-summary-saree">
              <img src={saree.image} alt={saree.name} className="booking-saree-photo" />
              <div>
                <span className="eyebrow">{saree.category} edit</span>
                <h4>{saree.name}</h4>
                <p>Qty: {quantity} drape</p>
                <span className="booking-saree-price">
                  ₹{itemsPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="booking-price-breakdown">
              <div className="price-row">
                <span>Base Drape Price</span>
                <span>₹{itemsPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="price-row">
                <span>Handloom GST (5%)</span>
                <span>₹{taxPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="price-row highlight">
                <span>Insured Doorstep Shipping</span>
                <span className="free-tag">FREE COMPLIMENTARY</span>
              </div>
              <div className="price-divider" />
              <div className="price-row total">
                <span>Total Amount Payable</span>
                <span className="total-amount">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {error && (
              <div className="booking-error-banner">
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              form="booking-payment-form"
              disabled={busy}
              className="booking-submit-btn"
            >
              {busy ? (
                <>
                  <LoaderCircle className="spin" size={18} />
                  <span>Registering Saree Booking...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Proceed to Demo Payment (₹{totalPrice.toLocaleString('en-IN')})</span>
                </>
              )}
            </Button>

            <div className="booking-guarantees">
              <div className="booking-guarantee-item">
                <ShieldCheck size={14} className="text-gold" />
                <span>Silk Mark Certified 100% Pure Handloom</span>
              </div>
              <div className="booking-guarantee-item">
                <Truck size={14} className="text-gold" />
                <span>Transit Insurance Included</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Payment Gateway Modal */}
      <DemoPaymentModal
        open={paymentModalOpen}
        amount={totalPrice}
        saree={saree}
        quantity={quantity}
        customerName={name || user?.name || 'Valued Patron'}
        customerEmail={email || user?.email}
        customerPhone={phone || user?.phone}
        onClose={() => setPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}

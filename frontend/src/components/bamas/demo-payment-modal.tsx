import { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  QrCode,
  Building2,
  Truck,
  LoaderCircle,
  Lock,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PaymentSuccessResult {
  id: string;
  status: string;
  method: string;
  amount: number;
  paidAt: string;
}

interface DemoPaymentModalProps {
  open: boolean;
  amount: number;
  saree: {
    name: string;
    image: string;
    price: number;
    category?: string;
  };
  quantity?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onClose: () => void;
  onSuccess: (result: PaymentSuccessResult) => void;
}

export function DemoPaymentModal({
  open,
  amount,
  saree,
  quantity = 1,
  customerName = 'Valued Patron',
  customerEmail,
  customerPhone,
  onClose,
  onSuccess,
}: DemoPaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');
  const [upiId, setUpiId] = useState('patron@okhdfcbank');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardHolder, setCardHolder] = useState(customerName || 'Valued Patron');

  // Simulation status: idle | processing | success
  const [state, setState] = useState<'idle' | 'processing' | 'success'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  if (!open) return null;

  const handleSimulatePayment = () => {
    setState('processing');
    setStatusMessage('Initiating 256-bit bank encryption...');

    setTimeout(() => {
      setStatusMessage('Authorizing transaction with issuing bank...');
    }, 800);

    setTimeout(() => {
      setStatusMessage('Payment verified! Generating certified GST invoice...');
      setState('success');
    }, 1700);

    setTimeout(() => {
      const methodName =
        selectedMethod === 'upi'
          ? `UPI (${upiId})`
          : selectedMethod === 'card'
          ? `Test Card (ending ${cardNumber.slice(-4)})`
          : selectedMethod === 'netbanking'
          ? `NetBanking (${selectedBank})`
          : 'Cash on Delivery';

      onSuccess({
        id: 'DEMO_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        status: 'COMPLETED',
        method: methodName,
        amount,
        paidAt: new Date().toISOString(),
      });
    }, 2400);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(6, 24, 33, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && state === 'idle') onClose();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '1.25rem',
          maxWidth: '560px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Top Header Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #061821 0%, #0d2a38 100%)',
            color: '#f8f9fa',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #d4af37 0%, #aa820a 100%)',
                color: '#061821',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1rem',
                boxShadow: '0 2px 8px rgba(212, 175, 55, 0.4)',
              }}
            >
              B
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                  Bamas Payment Gateway
                </h3>
                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '999px',
                    border: '1px solid rgba(52, 211, 153, 0.4)',
                    letterSpacing: '0.04em',
                  }}
                >
                  DEMO MODE
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#88a8b4', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={12} style={{ color: '#d4af37' }} /> 256-Bit SSL Insured Transaction
              </p>
            </div>
          </div>

          {state === 'idle' && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#d4af37',
                cursor: 'pointer',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Amount & Saree Quick Bar */}
        <div
          style={{
            background: 'linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%)',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <img
              src={saree.image}
              alt={saree.name}
              style={{
                width: '46px',
                height: '58px',
                borderRadius: '6px',
                objectFit: 'cover',
                border: '1px solid rgba(212, 175, 55, 0.4)',
              }}
            />
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '0.75rem', color: '#d4af37', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {saree.category || 'Pure Silk'} Saree
              </p>
              <h4 style={{ margin: '0 0 2px', fontSize: '0.95rem', fontWeight: 600, color: '#092330' }}>
                {saree.name}
              </h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                Qty: {quantity} • Complimentary Express Shipping
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Total Payable
            </span>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#092330', fontFamily: 'Manrope, sans-serif' }}>
              ₹{amount.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        {state === 'processing' || state === 'success' ? (
          <div
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '260px',
            }}
          >
            {state === 'processing' ? (
              <>
                <LoaderCircle className="spin" size={48} style={{ color: '#d4af37', marginBottom: '1.25rem' }} />
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700, color: '#092330' }}>
                  Processing Demo Payment...
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>{statusMessage}</p>
              </>
            ) : (
              <>
                <CheckCircle2 size={54} style={{ color: '#10b981', marginBottom: '1rem', animation: 'scaleUp 0.3s ease-out' }} />
                <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.3rem', fontWeight: 700, color: '#092330' }}>
                  Payment Approved!
                </h3>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', color: '#10b981', fontWeight: 600 }}>
                  ₹{amount.toLocaleString('en-IN')} Received Successfully
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                  Confirming your atelier booking and notifying administration...
                </p>
              </>
            )}
          </div>
        ) : (
          <div>
            {/* Method Tabs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                borderBottom: '1px solid #e2e8f0',
                background: '#fafbfc',
              }}
            >
              {[
                { id: 'upi', label: 'UPI / QR', icon: QrCode },
                { id: 'card', label: 'Cards', icon: CreditCard },
                { id: 'netbanking', label: 'NetBanking', icon: Building2 },
                { id: 'cod', label: 'Doorstep', icon: Truck },
              ].map((m) => {
                const active = selectedMethod === m.id;
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m.id as any)}
                    style={{
                      padding: '0.85rem 0.5rem',
                      border: 'none',
                      background: active ? '#ffffff' : 'transparent',
                      color: active ? '#092330' : '#64748b',
                      fontWeight: active ? 700 : 500,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      borderBottom: active ? '3px solid #d4af37' : '3px solid transparent',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Icon size={18} style={{ color: active ? '#d4af37' : 'inherit' }} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Method Content */}
            <div style={{ padding: '1.5rem', minHeight: '220px' }}>
              {selectedMethod === 'upi' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Smartphone size={18} color="#d4af37" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#092330' }}>
                        Scan QR or enter UPI Virtual Payment Address
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      Zero Surcharge
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr',
                      gap: '1.25rem',
                      alignItems: 'center',
                      background: '#f8fafc',
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid #e2e8f0',
                      marginBottom: '1rem',
                    }}
                  >
                    {/* Simulated High-Res QR Code */}
                    <div
                      style={{
                        width: '120px',
                        height: '120px',
                        background: '#ffffff',
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                      }}
                    >
                      <svg width="90" height="90" viewBox="0 0 100 100">
                        <rect x="0" y="0" width="30" height="30" fill="#092330" />
                        <rect x="5" y="5" width="20" height="20" fill="#ffffff" />
                        <rect x="10" y="10" width="10" height="10" fill="#092330" />
                        <rect x="70" y="0" width="30" height="30" fill="#092330" />
                        <rect x="75" y="5" width="20" height="20" fill="#ffffff" />
                        <rect x="80" y="10" width="10" height="10" fill="#092330" />
                        <rect x="0" y="70" width="30" height="30" fill="#092330" />
                        <rect x="5" y="75" width="20" height="20" fill="#ffffff" />
                        <rect x="10" y="80" width="10" height="10" fill="#092330" />
                        <rect x="40" y="10" width="15" height="15" fill="#d4af37" />
                        <rect x="40" y="40" width="20" height="20" fill="#092330" />
                        <rect x="45" y="45" width="10" height="10" fill="#d4af37" />
                        <rect x="70" y="45" width="15" height="15" fill="#092330" />
                        <rect x="40" y="70" width="15" height="15" fill="#092330" />
                        <rect x="65" y="75" width="25" height="15" fill="#d4af37" />
                      </svg>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#092330', marginTop: '4px' }}>
                        Bamas Pay
                      </span>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#092330', marginBottom: '4px' }}>
                        UPI ID / VPA
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@bank"
                        style={{
                          width: '100%',
                          height: '40px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '0 10px',
                          fontSize: '0.85rem',
                          background: '#ffffff',
                          color: '#092330',
                          marginBottom: '0.5rem',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {['patron@okaxis', 'customer@ybl', 'bamas@paytm'].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setUpiId(preset)}
                            style={{
                              fontSize: '0.72rem',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              border: '1px solid #d4af37',
                              background: '#ffffff',
                              color: '#092330',
                              cursor: 'pointer',
                            }}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'card' && (
                <div>
                  {/* Card Visual Preview */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #061821 0%, #0e3040 50%, #15455c 100%)',
                      borderRadius: '0.75rem',
                      padding: '1rem 1.25rem',
                      color: '#ffffff',
                      marginBottom: '1rem',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      boxShadow: '0 4px 15px rgba(6, 24, 33, 0.25)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#d4af37' }}>
                        BAMAS PRIVILEGE CARD
                      </span>
                      <CreditCard size={20} color="#d4af37" />
                    </div>
                    <div style={{ fontSize: '1.1rem', letterSpacing: '2px', fontWeight: 600, fontFamily: 'monospace', marginBottom: '0.75rem' }}>
                      {cardNumber}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <div>
                        <span style={{ color: '#88a8b4', display: 'block', fontSize: '0.65rem' }}>CARDHOLDER</span>
                        <span style={{ fontWeight: 600 }}>{cardHolder}</span>
                      </div>
                      <div>
                        <span style={{ color: '#88a8b4', display: 'block', fontSize: '0.65rem' }}>EXPIRES</span>
                        <span style={{ fontWeight: 600 }}>{cardExpiry}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '3px' }}>
                        Card Number
                      </label>
                      <input
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        style={{ width: '100%', height: '38px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 8px', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '3px' }}>
                        Expiry
                      </label>
                      <input
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        style={{ width: '100%', height: '38px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 8px', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '3px' }}>
                        CVV
                      </label>
                      <input
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        style={{ width: '100%', height: '38px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 8px', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'netbanking' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#092330', marginBottom: '0.75rem' }}>
                    Select Preferred Bank (Demo Mode)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Punjab National'].map((b) => {
                      const isB = selectedBank === b;
                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setSelectedBank(b)}
                          style={{
                            padding: '0.75rem 0.5rem',
                            borderRadius: '8px',
                            border: isB ? '2px solid #d4af37' : '1px solid #cbd5e1',
                            background: isB ? '#fffbeb' : '#ffffff',
                            color: isB ? '#092330' : '#475569',
                            fontWeight: isB ? 700 : 500,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            textAlign: 'center',
                          }}
                        >
                          {b}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedMethod === 'cod' && (
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#092330', fontWeight: 700, marginBottom: '0.5rem' }}>
                    <Truck size={20} color="#d4af37" />
                    <span>Cash on Delivery (Pay on Doorstep)</span>
                  </div>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                    Your saree will be dispatched in a tamper-evident presentation gift box. You may pay
                    via cash, card, or UPI directly to the courier upon delivery.
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>
                    ✓ Zero extra handling fee for valued patrons
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer CTA */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderTop: '1px solid #e2e8f0',
                background: '#fafbfc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                style={{ color: '#64748b', fontWeight: 600 }}
              >
                Cancel & Review
              </Button>

              <Button
                type="button"
                onClick={handleSimulatePayment}
                style={{
                  background: 'linear-gradient(135deg, #092330 0%, #153c50 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  padding: '0 1.75rem',
                  height: '46px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  border: '1px solid #d4af37',
                  boxShadow: '0 4px 15px rgba(9, 35, 48, 0.25)',
                }}
              >
                <Sparkles size={16} color="#d4af37" />
                <span>Simulate Pay ₹{amount.toLocaleString('en-IN')} (Demo)</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import {
  X,
  CheckCircle2,
  CreditCard,
  QrCode,
  Truck,
  LoaderCircle,
  Lock,
  Sparkles,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { validateUpi } from '@/lib/validation';

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
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'cod'>('upi');
  const [upiId, setUpiId] = useState('bamas@okhdfcbank');
  const [upiTouched, setUpiTouched] = useState(false);
  const upiVal = validateUpi(upiId);

  // Simulation status: idle | processing | success
  const [state, setState] = useState<'idle' | 'processing' | 'success'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  if (!open) return null;

  const handleSimulatePayment = () => {
    setState('processing');
    setStatusMessage('Authorizing demo payment...');

    setTimeout(() => {
      setStatusMessage('Payment verified! Generating certified order...');
      setState('success');
    }, 1000);

    setTimeout(() => {
      const methodName =
        selectedMethod === 'upi'
          ? `UPI (${upiId})`
          : selectedMethod === 'card'
          ? 'Card (Test ending 4242)'
          : 'Cash on Delivery';

      onSuccess({
        id: 'DEMO_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        status: 'COMPLETED',
        method: methodName,
        amount,
        paidAt: new Date().toISOString(),
      });
      setState('idle');
    }, 1700);
  };

  return (
    <div
      className="demo-payment-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(6, 24, 33, 0.78)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem 1rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && state === 'idle') onClose();
      }}
    >
      <div
        className="demo-payment-card"
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          maxWidth: '440px',
          width: '100%',
          maxHeight: 'min(92vh, 560px)',
          boxShadow: '0 20px 45px rgba(9, 35, 48, 0.35)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #092330 0%, #103444 100%)',
            color: '#f8f9fa',
            padding: '0.75rem 1.15rem',
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
                <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, letterSpacing: '0.3px', color: '#ffffff' }}>
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
                    letterSpacing: '0.5px',
                  }}
                >
                  DEMO
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.68rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={10} style={{ color: '#d4af37' }} /> 256-Bit SSL Insured
              </p>
            </div>
          </div>

          {state === 'idle' && (
            <button
              type="button"
              onClick={onClose}
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
              <X size={15} />
            </button>
          )}
        </div>

        {/* Amount & Saree Quick Bar */}
        <div
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
            {saree.image && (
              <img
                src={saree.image}
                alt={saree.name}
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
                {saree.name}
              </h4>
              <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b' }}>
                Qty: {quantity} · Free Express Delivery
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
              Total Payable
            </span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#092330', fontFamily: 'Manrope, sans-serif' }}>
              ₹{amount.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Body */}
        {state === 'processing' || state === 'success' ? (
          <div
            style={{
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '220px',
            }}
          >
            {state === 'processing' ? (
              <>
                <LoaderCircle className="spin" size={42} style={{ color: '#d4af37', marginBottom: '1rem' }} />
                <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.1rem', fontWeight: 700, color: '#092330' }}>
                  Processing Demo Payment...
                </h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>{statusMessage}</p>
              </>
            ) : (
              <>
                <CheckCircle2 size={46} style={{ color: '#10b981', marginBottom: '0.75rem' }} />
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.15rem', fontWeight: 700, color: '#092330' }}>
                  Payment Approved!
                </h3>
                <p style={{ margin: '0 0 0.35rem', fontSize: '0.9rem', color: '#10b981', fontWeight: 600 }}>
                  ₹{amount.toLocaleString('en-IN')} Received Successfully
                </p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                  Confirming your atelier booking and notifying administration...
                </p>
              </>
            )}
          </div>
        ) : (
          <div style={{ padding: '0.75rem 1.15rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'block',
              }}
            >
              Select Payment Method
            </span>

            {/* 3 Simple Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {/* UPI Option */}
              <label
                onClick={() => setSelectedMethod('upi')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  border: '1.5px solid',
                  borderColor: selectedMethod === 'upi' ? '#d4af37' : '#e2e8f0',
                  background: selectedMethod === 'upi' ? '#fffdf7' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  name="demoPaymentMethod"
                  checked={selectedMethod === 'upi'}
                  onChange={() => setSelectedMethod('upi')}
                  style={{ accentColor: '#d4af37', width: '15px', height: '15px' }}
                />
                <QrCode size={17} color={selectedMethod === 'upi' ? '#d4af37' : '#64748b'} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: selectedMethod === 'upi' ? 700 : 600, color: '#092330' }}>
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

              {/* Card Option */}
              <label
                onClick={() => setSelectedMethod('card')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  border: '1.5px solid',
                  borderColor: selectedMethod === 'card' ? '#d4af37' : '#e2e8f0',
                  background: selectedMethod === 'card' ? '#fffdf7' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  name="demoPaymentMethod"
                  checked={selectedMethod === 'card'}
                  onChange={() => setSelectedMethod('card')}
                  style={{ accentColor: '#d4af37', width: '15px', height: '15px' }}
                />
                <CreditCard size={17} color={selectedMethod === 'card' ? '#d4af37' : '#64748b'} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: selectedMethod === 'card' ? 700 : 600, color: '#092330', display: 'block' }}>
                    Credit / Debit Card
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    Instant Demo Authorization (Test Card)
                  </span>
                </div>
              </label>

              {/* COD Option */}
              <label
                onClick={() => setSelectedMethod('cod')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  border: '1.5px solid',
                  borderColor: selectedMethod === 'cod' ? '#d4af37' : '#e2e8f0',
                  background: selectedMethod === 'cod' ? '#fffdf7' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  name="demoPaymentMethod"
                  checked={selectedMethod === 'cod'}
                  onChange={() => setSelectedMethod('cod')}
                  style={{ accentColor: '#d4af37', width: '15px', height: '15px' }}
                />
                <Truck size={17} color={selectedMethod === 'cod' ? '#d4af37' : '#64748b'} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: selectedMethod === 'cod' ? 700 : 600, color: '#092330', display: 'block' }}>
                    Cash on Delivery
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    Pay upon doorstep delivery
                  </span>
                </div>
              </label>
            </div>

            {/* Context details based on selection */}
            {selectedMethod === 'upi' && (
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="30" height="30" viewBox="0 0 100 100">
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
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.62rem', color: '#64748b', display: 'block' }}>
                        UPI ID / VPA
                      </span>
                      {upiTouched && upiVal.valid && (
                        <span style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: 700 }}>✓ Valid UPI</span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={upiId}
                      onBlur={() => setUpiTouched(true)}
                      onChange={(e) => {
                        setUpiId(e.target.value);
                        if (!upiTouched) setUpiTouched(true);
                      }}
                      placeholder="username@bank"
                      style={{
                        width: '100%',
                        padding: '3px 6px',
                        borderRadius: '4px',
                        border: upiTouched
                          ? (!upiVal.valid ? '1.5px solid #ef4444' : '1.5px solid #10b981')
                          : '1px solid #cbd5e1',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: '#092330',
                        marginTop: '1px',
                        outline: 'none',
                        background: '#ffffff',
                      }}
                    />
                  </div>
                </div>
                <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 600, flexShrink: 0 }}>
                  ✓ 1-Click Simulation
                </span>
              </div>
            )}

            {selectedMethod === 'card' && (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.72rem',
                  color: '#475569',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: '#092330', marginBottom: '1px' }}>
                  <CreditCard size={13} color="#d4af37" />
                  <span>Test Card: •••• 4242</span>
                </div>
                <span>Pre-authorized for instant demo payment. No card entry required.</span>
              </div>
            )}

            {selectedMethod === 'cod' && (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.72rem',
                  color: '#475569',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: '#092330', marginBottom: '1px' }}>
                  <Truck size={13} color="#d4af37" />
                  <span>Doorstep Collection</span>
                </div>
                <span>Pay cash or UPI upon package handover at your delivery address.</span>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.2rem' }}>
              <Button
                type="button"
                disabled={selectedMethod === 'upi' && !upiVal.valid}
                onClick={handleSimulatePayment}
                style={{
                  background: selectedMethod === 'upi' && !upiVal.valid ? '#64748b' : '#092330',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  height: '42px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  border: '1px solid #d4af37',
                  boxShadow: '0 4px 14px rgba(9, 35, 48, 0.2)',
                  width: '100%',
                  cursor: selectedMethod === 'upi' && !upiVal.valid ? 'not-allowed' : 'pointer',
                  opacity: selectedMethod === 'upi' && !upiVal.valid ? 0.6 : 1,
                }}
              >
                <Sparkles size={15} color="#d4af37" />
                <span>Pay ₹{amount.toLocaleString('en-IN')} (Demo)</span>
              </Button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.75rem',
                  padding: '4px',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                Cancel & Review Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

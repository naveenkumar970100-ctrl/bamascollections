import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export interface BookingAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saree?: any;
  quantity?: number;
  onSuccess?: (user: any) => void;
  title?: string;
  subtitle?: string;
}

export function BookingAuthModal({
  open,
  onOpenChange,
  saree,
  quantity = 1,
  onSuccess,
  title = 'Sign In to Book Saree',
  subtitle = 'Please sign in or create an account with your mobile or email to proceed with your handloom saree reservation.',
}: BookingAuthModalProps) {
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick fill default patron for testing if needed
  const handleQuickPatronLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.auth.login({
        identifier: 'patron@bamascollections.com',
        password: 'password123',
      });
      window.dispatchEvent(new Event('bamas_auth_changed'));
      onOpenChange(false);
      if (onSuccess) onSuccess(res.data);
    } catch {
      // Fallback try registering patron
      try {
        const regRes = await api.auth.register({
          name: 'Priya Sharma',
          email: 'patron@bamascollections.com',
          phone: '9876543210',
          password: 'password123',
        });
        window.dispatchEvent(new Event('bamas_auth_changed'));
        onOpenChange(false);
        if (onSuccess) onSuccess(regRes.data);
      } catch (err: any) {
        setError(err.message || 'Unable to authenticate quick patron account.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanId = identifier.trim();
    if (!cleanId) {
      setError('Please enter your email address or mobile number.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        const cleanName = name.trim();
        if (!cleanName) {
          setError('Please provide your full name.');
          setLoading(false);
          return;
        }

        const isEmail = cleanId.includes('@');
        const regPayload: any = {
          name: cleanName,
          password,
        };
        if (isEmail) {
          regPayload.email = cleanId;
        } else {
          regPayload.phone = cleanId;
        }

        const res = await api.auth.register(regPayload);
        window.dispatchEvent(new Event('bamas_auth_changed'));
        onOpenChange(false);
        if (onSuccess) onSuccess(res.data);
      } else {
        const res = await api.auth.login({
          identifier: cleanId,
          password,
        });
        window.dispatchEvent(new Event('bamas_auth_changed'));
        onOpenChange(false);
        if (onSuccess) onSuccess(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToFullLogin = () => {
    if (typeof window !== 'undefined' && saree) {
      sessionStorage.setItem(
        'bamas_pending_booking',
        JSON.stringify({
          saree,
          quantity,
          origin: window.location.pathname,
        })
      );
    }
    onOpenChange(false);
    navigate({ to: '/login' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="booking-auth-modal"
        style={{
          maxWidth: '460px',
          width: '92vw',
          background: 'linear-gradient(180deg, #061821 0%, #0a2432 100%)',
          color: '#ffffff',
          borderRadius: '1.25rem',
          border: '1.5px solid #d4af37',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(212, 175, 55, 0.35)',
          padding: '2rem 1.75rem',
          fontFamily: 'Manrope, sans-serif',
          maxHeight: '92vh',
          overflowY: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        <DialogTitle className="sr-only">Authentication Required for Saree Booking</DialogTitle>

        {/* Brand Crest */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              margin: '0 auto 0.85rem',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(9, 35, 48, 0.9) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid #d4af37',
              boxShadow: '0 6px 20px rgba(212, 175, 55, 0.25)',
            }}
          >
            <ShieldCheck size={28} color="#d4af37" />
          </div>

          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#d4af37',
              margin: '0 0 0.35rem',
              letterSpacing: '0.5px',
            }}
          >
            {title}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: '0.82rem',
              color: '#94a3b8',
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* Selected Saree Mini Preview Card */}
        {saree && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.65rem 0.85rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              marginBottom: '1.25rem',
            }}
          >
            {saree.image && (
              <img
                src={saree.image}
                alt={saree.name}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '6px',
                  objectFit: 'cover',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {saree.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#d4af37', fontWeight: 600 }}>
                {saree.price ? `₹${Number(saree.price).toLocaleString('en-IN')}` : 'Handloom Heirloom'}
                {quantity > 1 && ` × ${quantity}`}
              </div>
            </div>
            <div
              style={{
                fontSize: '0.68rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                background: 'rgba(22, 163, 74, 0.2)',
                color: '#86efac',
                border: '1px solid rgba(22, 163, 74, 0.4)',
                fontWeight: 600,
              }}
            >
              In Stock
            </div>
          </div>
        )}

        {/* Mode Switcher Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.35rem',
            padding: '0.3rem',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '10px',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            marginBottom: '1.25rem',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            style={{
              padding: '0.55rem',
              borderRadius: '7px',
              border: 'none',
              background: mode === 'login' ? '#d4af37' : 'transparent',
              color: mode === 'login' ? '#061821' : '#cbd5e1',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            style={{
              padding: '0.55rem',
              borderRadius: '7px',
              border: 'none',
              background: mode === 'register' ? '#d4af37' : 'transparent',
              color: mode === 'register' ? '#061821' : '#cbd5e1',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              fontSize: '0.8rem',
              marginBottom: '1rem',
              lineHeight: 1.4,
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
          {mode === 'register' && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#e2e8f0',
                  marginBottom: '0.35rem',
                }}
              >
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                  }}
                />
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem 0.7rem 2.3rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(212, 175, 55, 0.35)',
                    background: 'rgba(6, 24, 33, 0.8)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#e2e8f0',
                marginBottom: '0.35rem',
              }}
            >
              Email Address or Mobile Number
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={15}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              />
              <input
                type="text"
                required
                placeholder="patron@gmail.com or 9876543210"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.85rem 0.7rem 2.3rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  background: 'rgba(6, 24, 33, 0.8)',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#e2e8f0',
                marginBottom: '0.35rem',
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={15}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 2.4rem 0.7rem 2.3rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  background: 'rgba(6, 24, 33, 0.8)',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #d4af37 0%, #b89326 100%)',
              color: '#061821',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.92rem',
              boxShadow: '0 6px 20px rgba(212, 175, 55, 0.3)',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.25rem',
            }}
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="animate-spin" style={{ marginRight: '0.5rem' }} />
                Authenticating...
              </>
            ) : mode === 'login' ? (
              <>
                Sign In & Proceed to Booking <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
              </>
            ) : (
              <>
                Create Account & Book Saree <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
              </>
            )}
          </Button>

          {/* Quick Demo Patron 1-Click Access for smooth testing */}
          <button
            type="button"
            onClick={handleQuickPatronLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.55rem',
              borderRadius: '8px',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              background: 'rgba(212, 175, 55, 0.08)',
              color: '#d4af37',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <Sparkles size={14} /> 1-Click Fast Patron Sign-In (Priya Sharma)
          </button>
        </form>

        {/* Footer Link to Dedicated /login Page */}
        <div style={{ marginTop: '1.25rem', textAlign: 'center', borderTop: '1px solid rgba(212, 175, 55, 0.2)', paddingTop: '0.85rem' }}>
          <button
            type="button"
            onClick={handleGoToFullLogin}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.8rem',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Prefer full sign-in & registration screen? Open Login Page →
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

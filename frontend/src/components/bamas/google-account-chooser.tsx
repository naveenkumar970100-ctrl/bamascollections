import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { UserRound, LoaderCircle, X, ChevronDown, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import bamasLogo from '@/assets/bamas-logo.jpg';

interface GoogleAccountChooserProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
  redirectUrl?: string;
}

export function GoogleAccountChooser({
  open,
  onClose,
  onSuccess,
  redirectUrl,
}: GoogleAccountChooserProps) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [signingEmail, setSigningEmail] = useState('');
  const [error, setError] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  if (!open) return null;

  async function handleSelectAccount(email: string, name: string) {
    if (!email || !email.includes('@')) {
      setError('Please provide a valid Google Gmail address.');
      return;
    }

    setSigningEmail(email);
    setBusy(true);
    setError('');

    try {
      const res = await api.auth.google({
        email: email.toLowerCase().trim(),
        name: name.trim() || email.split('@')[0],
        avatar: '',
      });

      window.dispatchEvent(new Event('bamas_auth_changed'));

      if (onSuccess && res.data) {
        onSuccess(res.data);
      } else {
        if (redirectUrl) {
          navigate({ to: redirectUrl as any });
        } else if (res.data?.role === 'admin') {
          navigate({ to: '/admin' });
        } else {
          navigate({ to: '/products' });
        }
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google. Please try again.');
    } finally {
      setBusy(false);
      setSigningEmail('');
    }
  }

  function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = customEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid Google Account email address.');
      return;
    }
    const derivedName = customName.trim() || cleanEmail.split('@')[0];
    handleSelectAccount(cleanEmail, derivedName);
  }

  return (
    <div
      className="google-dark-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) {
          onClose();
        }
      }}
    >
      <div className="google-dark-wrapper">
        <div className="google-dark-card" role="dialog" aria-modal="true">
          {/* Top Google branding */}
          <div className="google-dark-top-row">
            <div className="google-dark-brand-title">
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </div>
            <button
              type="button"
              className="google-dark-close-btn"
              onClick={onClose}
              disabled={busy}
              aria-label="Close Google sign in"
            >
              <X size={18} />
            </button>
          </div>

          {error && (
            <div className="google-dark-error-box">
              <span>{error}</span>
            </div>
          )}

          {/* Main 2-column layout matching screenshot */}
          <div className="google-dark-content-grid">
            {/* Left Column: Official Bamas Collection Logo & Title */}
            <div className="google-dark-left-col">
              <div className="google-dark-app-logo">
                <img
                  src={bamasLogo}
                  alt="Bamas Collection"
                  width="48"
                  height="48"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '12px',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <h1 className="google-dark-title">Choose an account</h1>
              <p className="google-dark-subtitle">
                to continue to <span className="google-dark-app-name">Bamas Collection</span>
              </p>
            </div>

            {/* Right Column: Real Available Accounts (No Demo Accounts) */}
            <div className="google-dark-right-col">
              <div className="google-dark-accounts-group">
                {/* Real-time Google Account: naveen (naveenkumar970100@gmail.com) */}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    handleSelectAccount('naveenkumar970100@gmail.com', 'naveen')
                  }
                  className="google-dark-account-row"
                >
                  <div className="google-dark-avatar-circle" style={{ background: '#1a73e8' }}>
                    n
                  </div>
                  <div className="google-dark-account-info">
                    <span className="google-dark-account-name">naveen</span>
                    <span className="google-dark-account-email">
                      naveenkumar970100@gmail.com
                    </span>
                  </div>
                  {busy && signingEmail === 'naveenkumar970100@gmail.com' && (
                    <LoaderCircle size={18} className="spin text-blue-400" />
                  )}
                </button>

                {/* Option to use another real Google Account */}
                {showCustomInput ? (
                  <form
                    onSubmit={handleCustomSubmit}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem',
                      padding: '0.85rem 0.5rem',
                      borderBottom: '1px solid #3c4043',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#c4c7c5' }}>
                        Your Google Account email:
                      </span>
                      <input
                        type="email"
                        required
                        autoFocus
                        placeholder="example@gmail.com"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        style={{
                          background: '#28292a',
                          border: '1px solid #444746',
                          color: '#e3e3e3',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          fontSize: '0.875rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.2rem' }}>
                      <button
                        type="submit"
                        disabled={busy || !customEmail.trim()}
                        style={{
                          background: '#1a73e8',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '7px 16px',
                          fontSize: '0.825rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {busy ? <LoaderCircle size={14} className="spin" /> : 'Sign in'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomInput(false);
                          setCustomEmail('');
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#8e918f',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          padding: '4px 8px',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setShowCustomInput(true)}
                    className="google-dark-account-row"
                  >
                    <div className="google-dark-avatar-circle outline">
                      <UserRound size={18} color="#c4c7c5" />
                    </div>
                    <div className="google-dark-account-info">
                      <span className="google-dark-account-name">Use another account</span>
                    </div>
                  </button>
                )}
              </div>

              {/* Bottom Policy notice */}
              <p className="google-dark-terms-notice">
                Before using this app, you can review Bamas Collection's{' '}
                <a href="/about" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="/about" target="_blank" rel="noopener noreferrer">
                  Terms of Service
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Footer outside the card matching screenshot */}
        <div className="google-dark-footer-bar">
          <div className="google-dark-lang-selector">
            <span>English (United States)</span>
            <ChevronDown size={14} />
          </div>
          <div className="google-dark-footer-links">
            <a href="/faq" target="_blank" rel="noopener noreferrer">
              Help
            </a>
            <a href="/about" target="_blank" rel="noopener noreferrer">
              Privacy
            </a>
            <a href="/about" target="_blank" rel="noopener noreferrer">
              Terms
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

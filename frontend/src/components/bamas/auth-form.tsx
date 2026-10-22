import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  LoaderCircle,
  LogOut,
  LayoutDashboard,
  Mail,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { useCustomer } from './auth-context';
import { api } from '@/lib/api';
import hero from '@/assets/saree-hero.jpg';
import rose from '@/assets/rose-saree.jpg';
import ivory from '@/assets/ivory-saree.jpg';
import wine from '@/assets/wine-saree.jpg';
import sapphire from '@/assets/sapphire-saree.jpg';
import maroon from '@/assets/maroon-saree.jpg';
import tissue from '@/assets/tissue-saree.jpg';
import lavender from '@/assets/lavender-saree.jpg';

const imageMap: Record<string, string> = {
  '/assets/saree-hero.jpg': hero,
  '/assets/rose-saree.jpg': rose,
  '/assets/ivory-saree.jpg': ivory,
  '/assets/wine-saree.jpg': wine,
  '/assets/sapphire-saree.jpg': sapphire,
  '/assets/maroon-saree.jpg': maroon,
  '/assets/tissue-saree.jpg': tissue,
  '/assets/lavender-saree.jpg': lavender,
  emerald: hero,
  rose: rose,
  ivory: ivory,
  wine: wine,
  sapphire: sapphire,
  'maroon-bridal': maroon,
  tissue: tissue,
  lavender: lavender,
};

function getSareeImage(p: any) {
  if (p?.image && (p.image.startsWith('http') || p.image.startsWith('data:'))) {
    return p.image;
  }
  return imageMap[p?.image] || imageMap[p?.slug] || p?.image || ivory;
}

const image = ivory;

export function AuthForm({ mode }: { mode: 'login' | 'register' | 'reset' }) {
  const { user, ready } = useCustomer();
  const navigate = useNavigate();

  // Mode and form fields
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [forgot, setForgot] = useState(false);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    if (mode === 'reset') {
      setRecovery(new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery');
    }
  }, [mode]);

  useEffect(() => {
    if (!user || mode === 'reset') return;
    if (user.name) setName(user.name);
    else if (user.id) {
      let active = true;
      supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (!active) return;
          if (!error && data?.display_name) setName(data.display_name);
        });
      return () => {
        active = false;
      };
    }
  }, [user, mode]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'reset') {
        if (!recovery) throw new Error('Please open the password recovery link from your email.');
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setMessage('Your password has been updated.');
      } else if (user) {
        // Update profile in MERN backend
        try {
          await api.auth.updateProfile({ name: name.trim() });
          setMessage('Your profile has been saved.');
          window.dispatchEvent(new Event('bamas_auth_changed'));
        } catch {
          // Fallback to Supabase if backend was unreachable
          const { error } = await supabase
            .from('profiles')
            .update({ display_name: name.trim() })
            .eq('id', user.id);
          if (error) throw error;
          setMessage('Your profile has been saved.');
        }
      } else if (forgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setMessage('Check your email for a password reset link.');
      } else if (mode === 'register') {
        // Register in MERN Express + MongoDB Atlas backend
        const regPayload = {
          name: name.trim(),
          email: authMethod === 'email' ? email.trim() : undefined,
          phone: authMethod === 'phone' ? phoneNumber.trim() : phoneNumber.trim() || undefined,
          password,
        };

        try {
          const res = await api.auth.register(regPayload);
          setMessage('Account successfully created! Welcome to Bamas Collection.');
          window.dispatchEvent(new Event('bamas_auth_changed'));
          if (res.data?.role === 'admin') {
            setTimeout(() => navigate({ to: '/admin' }), 700);
          } else {
            setTimeout(() => navigate({ to: '/products' }), 700);
          }
        } catch (apiErr: any) {
          // Try Supabase as backup if backend failed
          if (authMethod === 'email' && email) {
            try {
              const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                  data: { display_name: name.trim() },
                  emailRedirectTo: window.location.origin,
                },
              });
              if (error) throw error;
              if (data.session) await navigate({ to: '/login' });
              else setMessage('Check your email to confirm your account before signing in.');
            } catch {
              throw apiErr;
            }
          } else {
            throw apiErr;
          }
        }
      } else {
        // Login with MERN Express + MongoDB Atlas backend (Role-based)
        const loginIdentifier = authMethod === 'email' ? email.trim() : phoneNumber.trim();

        try {
          const res = await api.auth.login({
            identifier: loginIdentifier,
            password,
          });

          window.dispatchEvent(new Event('bamas_auth_changed'));

          if (res.data?.role === 'admin') {
            setMessage('Welcome, Administrator! Redirecting to Admin Dashboard...');
            setTimeout(() => navigate({ to: '/admin' }), 600);
          } else {
            setMessage('Welcome back! Signed in successfully.');
            setTimeout(() => navigate({ to: '/products' }), 600);
          }
        } catch (apiErr: any) {
          // Fallback to Supabase if identifier is email
          if (loginIdentifier.includes('@')) {
            try {
              const { error } = await supabase.auth.signInWithPassword({
                email: loginIdentifier,
                password,
              });
              if (error) throw error;
              setMessage('Welcome back. You are signed in.');
              window.dispatchEvent(new Event('bamas_auth_changed'));
              setTimeout(() => navigate({ to: '/products' }), 600);
            } catch {
              throw apiErr;
            }
          } else {
            throw apiErr;
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    api.auth.logout();
    try {
      await supabase.auth.signOut();
    } catch {}
    window.dispatchEvent(new Event('bamas_auth_changed'));
    navigate({ to: '/login' });
  }

  async function google() {
    setBusy(true);
    setError('');
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (!('redirected' in result && result.redirected)) {
        await navigate({ to: '/login' });
      }
    } catch {
      // Fallback Google simulation for local development testing
      try {
        const demoGoogleEmail = 'customer.google@example.com';
        const res = await api.auth.google({
          email: demoGoogleEmail,
          name: 'Google Customer',
          avatar: '',
        });
        window.dispatchEvent(new Event('bamas_auth_changed'));
        if (res.data?.role === 'admin') {
          await navigate({ to: '/admin' });
        } else {
          await navigate({ to: '/products' });
        }
      } catch (err: any) {
        setError(err.message || 'Google sign-in is currently unavailable.');
      }
    } finally {
      setBusy(false);
    }
  }

  const account = Boolean(user) && mode !== 'reset';
  const isAdmin = user?.role === 'admin';

  const [liveProducts, setLiveProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (account) {
      setLoadingProducts(true);
      api.products
        .getAll()
        .then((res) => {
          if (res.data) setLiveProducts(res.data);
        })
        .catch(() => {})
        .finally(() => setLoadingProducts(false));
    }
  }, [account]);

  if (account) {
    return (
      <main className="section-wrap reveal" style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px 24px 80px' }}>
        {/* Top Lounge Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #061821 0%, #0d2a38 50%, #153748 100%)',
            borderRadius: '1.25rem',
            padding: '2rem 2.25rem',
            color: '#f8f9fa',
            border: '1px solid rgba(212, 175, 55, 0.45)',
            boxShadow: '0 20px 40px rgba(6, 24, 33, 0.25)',
            marginBottom: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #d4af37 0%, #b8972e 100%)',
                color: '#061821',
                fontSize: '1.6rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
              }}
            >
              {(user?.name || user?.email || 'B')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                <span style={{ color: '#d4af37', letterSpacing: '0.12em', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  BAMAS PRIVILEGE CLIENT
                </span>
                {isAdmin && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: '#d4af37',
                      background: 'rgba(212, 175, 55, 0.2)',
                      padding: '0.2rem 0.65rem',
                      borderRadius: '999px',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <ShieldCheck size={13} /> Administrator
                  </span>
                )}
              </div>
              <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 600, color: '#ffffff', fontFamily: 'var(--font-serif, serif)' }}>
                Welcome, {user?.name || 'Valued Patron'}
              </h1>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: '#a0b9c6' }}>
                {user?.email} {user?.phone ? `• ${user.phone}` : ''}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {isAdmin && (
              <Button asChild size="default" style={{ background: '#d4af37', color: '#061821', fontWeight: 700, border: 'none' }}>
                <Link to="/admin">
                  <LayoutDashboard size={16} style={{ marginRight: '0.4rem' }} /> Administrator Suite
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" size="default" style={{ borderColor: 'rgba(212, 175, 55, 0.5)', color: '#d4af37', background: 'transparent' }}>
              <Link to="/products">
                <ShoppingBag size={16} style={{ marginRight: '0.4rem' }} /> Browse Boutique
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="default"
              onClick={handleSignOut}
              style={{ color: '#ff8585', background: 'rgba(255, 133, 133, 0.08)' }}
            >
              <LogOut size={16} style={{ marginRight: '0.4rem' }} /> Sign Out
            </Button>
          </div>
        </div>

        {/* Dashboard Main Grid: Profile Settings + New Live Arrivals Showcase */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 360px) 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Left Column: Account Details & Edit Profile */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '1rem',
              padding: '1.75rem',
              border: '1px solid rgba(9, 35, 48, 0.1)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
            }}
          >
            <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: '#092330', marginBottom: '0.5rem', fontFamily: 'var(--font-serif, serif)' }}>
              Profile Details
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#688897', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Update your patron information to personalize your saree viewing and order experience.
            </p>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#092330' }}>
                Full Name
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '44px',
                    border: '1px solid #d4dce0',
                    borderRadius: '6px',
                    padding: '0 12px',
                    marginTop: '6px',
                    fontSize: '0.9rem',
                  }}
                />
              </label>

              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#092330' }}>
                Email Address
                <input
                  disabled
                  value={user?.email || ''}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '44px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '0 12px',
                    marginTop: '6px',
                    fontSize: '0.9rem',
                    background: '#f8fafc',
                    color: '#64748b',
                  }}
                />
              </label>

              {error && (
                <p role="alert" className="form-error" style={{ margin: 0, fontSize: '0.85rem', color: '#dc2626' }}>
                  {error}
                </p>
              )}

              {message && (
                <p role="status" className="form-success" style={{ margin: 0, fontSize: '0.85rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={16} /> {message}
                </p>
              )}

              <Button
                size="lg"
                type="submit"
                disabled={busy}
                style={{
                  background: '#092330',
                  color: '#ffffff',
                  fontWeight: 600,
                  marginTop: '0.5rem',
                }}
              >
                {busy ? <LoaderCircle className="spin" size={16} /> : 'Save Profile Changes'}
              </Button>
            </form>

            <hr style={{ margin: '1.75rem 0', borderColor: 'rgba(9, 35, 48, 0.08)' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#688897' }}>Account ID</span>
                <span style={{ fontWeight: 600, color: '#092330', fontFamily: 'monospace' }}>
                  {user?.id ? user.id.slice(0, 10) + '...' : 'Live Patron'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#688897' }}>Boutique Lounge</span>
                <span style={{ fontWeight: 600, color: '#16a34a' }}>Active VIP Member</span>
              </div>
            </div>
          </div>

          {/* Right Column: New Arrivals & Live Saree Showcase */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '1rem',
              padding: '1.75rem',
              border: '1px solid rgba(9, 35, 48, 0.1)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#d4af37', marginBottom: '0.2rem' }}>
                  <Sparkles size={16} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Live Saree Vault & New Creations
                  </span>
                </div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#092330', fontFamily: 'var(--font-serif, serif)' }}>
                  Curated Collection & Latest Arrivals
                </h2>
              </div>
              <Button asChild variant="outline" size="sm" style={{ borderColor: '#092330', color: '#092330' }}>
                <Link to="/products">
                  Explore Full Catalog <ArrowRight size={14} style={{ marginLeft: '0.35rem' }} />
                </Link>
              </Button>
            </div>

            {loadingProducts ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#688897' }}>
                <LoaderCircle className="spin" size={28} style={{ margin: '0 auto 0.75rem', color: '#d4af37' }} />
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Loading newly crafted saree pieces from the vault...</p>
              </div>
            ) : liveProducts.length === 0 ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', background: '#f8fafc', borderRadius: '0.75rem' }}>
                <p style={{ margin: 0, color: '#688897', fontSize: '0.95rem' }}>No sarees available in the catalog yet.</p>
                <Button asChild size="sm" style={{ marginTop: '1rem', background: '#092330' }}>
                  <Link to="/products">Browse Boutique</Link>
                </Button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                {liveProducts.slice(0, 6).map((product: any) => {
                  const pImg = getSareeImage(product);
                  return (
                    <div
                      key={product.id || product._id || product.slug}
                      style={{
                        background: '#fafafa',
                        borderRadius: '0.75rem',
                        overflow: 'hidden',
                        border: '1px solid rgba(9, 35, 48, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
                    >
                      <div style={{ position: 'relative', width: '100%', aspectRatio: '3 / 4', overflow: 'hidden', background: '#0b201f' }}>
                        <img
                          src={pImg}
                          alt={product.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                          onError={(e) => {
                            e.currentTarget.src = ivory;
                          }}
                        />
                        {product.isFeatured && (
                          <span
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: 'rgba(6, 24, 33, 0.85)',
                              backdropFilter: 'blur(4px)',
                              color: '#d4af37',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '999px',
                              border: '1px solid rgba(212, 175, 55, 0.4)',
                            }}
                          >
                            ★ Spotlight
                          </span>
                        )}
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '8px',
                            left: '8px',
                            background: 'rgba(6, 24, 33, 0.85)',
                            backdropFilter: 'blur(4px)',
                            color: '#ffffff',
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {product.category || 'Pure Silk'}
                        </span>
                      </div>
                      <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                        <div>
                          <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 600, color: '#092330' }}>
                            {product.name}
                          </h3>
                          <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#688897', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebKitLineClamp: 2, WebKitBoxOrient: 'vertical' }}>
                            {product.detail || product.description || product.fabric || 'Heritage weave with intricate golden borders.'}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid rgba(9, 35, 48, 0.06)' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#092330' }}>
                            {product.formattedPrice || `₹${(product.price || 0).toLocaleString('en-IN')}`}
                          </span>
                          <Button asChild size="sm" variant="ghost" style={{ padding: '0 0.5rem', height: '28px', fontSize: '0.75rem', color: '#d4af37', fontWeight: 600 }}>
                            <Link to="/products">
                              View <ArrowRight size={12} style={{ marginLeft: '2px' }} />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  const title = mode === 'reset'
    ? 'A Fresh Start'
    : forgot
    ? 'Forgot Your Password?'
    : mode === 'register'
    ? 'Join the Bamas Story'
    : 'Welcome Back';

  return (
    <main className="auth-page">
      <div className="auth-art">
        <img src={image} alt="Ivory saree with golden detailing" />
        <div>
          <span className="eyebrow">Bamas Collection</span>
          <h2>
            Elegance is
            <br />
            always personal.
          </h2>
          <p>Timeless sarees. Modern you.</p>
        </div>
      </div>
      <section className="auth-content reveal">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <span className="eyebrow">{account ? 'Your Profile' : 'A little tradition. A little you.'}</span>
          {isAdmin && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#d4af37',
                background: 'rgba(212, 175, 55, 0.15)',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <ShieldCheck size={13} /> Admin
            </span>
          )}
        </div>

        <h1>{title}</h1>
        <p>
          {account
            ? isAdmin
              ? 'Manage Bamas Collection store inventory, orders, and customer accounts.'
              : 'A space that’s yours.'
            : forgot
            ? 'We’ll email you a link to reset your password.'
            : mode === 'register'
            ? 'Create your account using email, phone number, or Google.'
            : mode === 'reset'
            ? 'Choose a new password for your account.'
            : 'Sign in to access your orders, bookings, and profile.'}
        </p>

        {account && isAdmin && (
          <div
            style={{
              padding: '1rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, rgba(9, 35, 48, 0.08) 0%, rgba(212, 175, 55, 0.12) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem', color: '#092330' }}>
                  Administrator Portal
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#527482' }}>
                  Logged in as {user?.email}
                </p>
              </div>
              <Button asChild size="sm" style={{ background: '#092330', color: '#d4af37', border: '1px solid #d4af37' }}>
                <Link to="/admin">
                  <LayoutDashboard size={15} style={{ marginRight: '0.35rem' }} /> Dashboard
                </Link>
              </Button>
            </div>
          </div>
        )}

        {!ready && <p>Loading your account…</p>}

        {/* Auth Method Tabs (Email vs Phone Number) */}
        {!account && mode !== 'reset' && !forgot && (
          <div
            style={{
              display: 'flex',
              background: 'rgba(9, 35, 48, 0.05)',
              borderRadius: '0.5rem',
              padding: '0.25rem',
              marginBottom: '1.25rem',
              border: '1px solid rgba(9, 35, 48, 0.08)',
            }}
          >
            <button
              type="button"
              onClick={() => setAuthMethod('email')}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                fontSize: '0.85rem',
                fontWeight: authMethod === 'email' ? 600 : 500,
                color: authMethod === 'email' ? '#092330' : '#527482',
                background: authMethod === 'email' ? '#ffffff' : 'transparent',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                boxShadow: authMethod === 'email' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease',
              }}
            >
              <Mail size={15} /> With Email
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('phone')}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                fontSize: '0.85rem',
                fontWeight: authMethod === 'phone' ? 600 : 500,
                color: authMethod === 'phone' ? '#092330' : '#527482',
                background: authMethod === 'phone' ? '#ffffff' : 'transparent',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                boxShadow: authMethod === 'phone' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease',
              }}
            >
              <Phone size={15} /> With Phone Number
            </button>
          </div>
        )}

        <form onSubmit={submit}>
          {((mode === 'register' && !forgot) || account) && (
            <label>
              Full name
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="Your full name"
                maxLength={100}
              />
            </label>
          )}

          {/* Email input field */}
          {mode !== 'reset' && (authMethod === 'email' || account) && (
            <label>
              Email address
              <input
                required={authMethod === 'email'}
                type="email"
                value={account ? user?.email ?? '' : email}
                disabled={account}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
              />
            </label>
          )}

          {/* Phone number input field */}
          {mode !== 'reset' && (authMethod === 'phone' || mode === 'register') && (
            <label>
              Phone number {mode === 'register' && authMethod === 'email' && <span style={{ color: '#888', fontWeight: 'normal', fontSize: '0.8rem' }}>(optional)</span>}
              <input
                required={authMethod === 'phone'}
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                autoComplete="tel"
                placeholder="+91 98765 43210"
              />
            </label>
          )}

          {!forgot && !account && (
            <label>
              Password
              <div className="password-input">
                <input
                  required
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder={mode === 'login' ? 'Your password' : 'At least 6 characters'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={show ? 'Hide password' : 'Show password'}
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </label>
          )}

          {mode === 'login' && !account && !forgot && (
            <Button
              className="forgot-button"
              type="button"
              variant="link"
              onClick={() => {
                setForgot(true);
                setMessage('');
                setError('');
              }}
            >
              Forgot password?
            </Button>
          )}

          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="form-success">
              <CheckCircle2 size={18} />
              {message}
            </p>
          )}

          <Button
            size="lg"
            className="auth-submit"
            disabled={busy || !ready || (mode === 'reset' && !recovery)}
            type="submit"
          >
            {busy ? (
              <LoaderCircle className="spin" />
            ) : account ? (
              'Save profile'
            ) : forgot ? (
              'Send reset link'
            ) : mode === 'register' ? (
              'Create account'
            ) : mode === 'reset' ? (
              'Update password'
            ) : (
              'Sign in'
            )}
            {!busy && <ArrowRight />}
          </Button>

          {account && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="auth-submit mt-3"
              onClick={handleSignOut}
              style={{ marginTop: '0.75rem' }}
            >
              <LogOut size={16} /> Sign out
            </Button>
          )}
        </form>

        {!account && mode !== 'reset' && !forgot && (
          <>
            <div className="auth-divider">
              <span>or</span>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="auth-submit"
              disabled={busy}
              onClick={google}
            >
              <span className="google-mark">G</span> Continue with Google
            </Button>
            <p className="auth-switch">
              {mode === 'login' ? (
                <>
                  New to Bamas? <Link to="/register">Create an account</Link>
                </>
              ) : (
                <>
                  Already part of the story? <Link to="/login">Sign in</Link>
                </>
              )}
            </p>
          </>
        )}

        {forgot && (
          <Button
            variant="link"
            onClick={() => {
              setForgot(false);
              setError('');
              setMessage('');
            }}
          >
            Back to sign in
          </Button>
        )}

        {mode === 'reset' && (
          <Link to="/login" className="text-link">
            Back to my account <ArrowRight size={16} />
          </Link>
        )}
      </section>
    </main>
  );
}

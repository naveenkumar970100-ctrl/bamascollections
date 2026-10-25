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
  Lock,
  User,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  ArrowUpRight,
  X,
  Package,
  MapPin,
  CreditCard,
  Truck,
  Calendar,
  RefreshCw,
  Copy,
  Check,
  Gift,
  Tag,
  ExternalLink,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReviewModal } from './review-modal';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import {
  validateName,
  validateEmail,
  validatePhone,
  validateIdentifier,
  validatePassword,
  validateConfirmPassword,
  validateAddress,
  validateCity,
  validateState,
  validatePincode,
} from '@/lib/validation';
import { useCustomer } from './auth-context';
import { api } from '@/lib/api';
import { cart } from '@/lib/cart';
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

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [forgot, setForgot] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [authTouched, setAuthTouched] = useState<Record<string, boolean>>({});

  // Real-time validation checks
  const nameVal = validateName(name, 'Full name');
  const idVal = validateIdentifier(identifier);
  const passVal = validatePassword(password);
  const confirmVal = validateConfirmPassword(password, confirmPassword);

  useEffect(() => {
    if (mode === 'reset') {
      setRecovery(new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery');
    }
  }, [mode]);

  useEffect(() => {
    let active = true;
    if (!user || mode === 'reset') return;
    if (user.name) {
      setName(user.name);
    } else if (user.id) {
      supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (!active) return;
          if (!error && data?.display_name) setName(data.display_name);
        });
    }
    return () => {
      active = false;
    };
  }, [user, mode]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    setAuthTouched({ name: true, identifier: true, password: true, confirmPassword: true });

    try {
      if (mode === 'register' && !forgot) {
        if (!nameVal.valid) throw new Error(nameVal.error);
        if (!idVal.valid) throw new Error(idVal.error);
        if (!passVal.valid) throw new Error(passVal.error);
        if (!confirmVal.valid) throw new Error(confirmVal.error);
      } else if (forgot) {
        const emailCheck = validateEmail(identifier, true);
        if (!emailCheck.valid) throw new Error(emailCheck.error);
      } else if (mode === 'login') {
        if (!idVal.valid) throw new Error(idVal.error);
        if (!password) throw new Error('Please enter your account password.');
      }

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
        const cleanEmail = identifier.trim();
        if (!cleanEmail || !cleanEmail.includes('@')) {
          throw new Error('Please enter a valid registered email address to receive password reset instructions.');
        }
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setMessage('Check your email for a password reset link.');
      } else if (mode === 'register') {
        // Register in MERN Express + MongoDB Atlas backend
        const cleanIdentifier = identifier.trim();
        if (!name.trim()) {
          throw new Error('Please provide your full name.');
        }
        if (!cleanIdentifier) {
          throw new Error('Please enter your email address or mobile number.');
        }
        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match. Please verify your confirm password.');
        }

        const isEmail = cleanIdentifier.includes('@');
        const regPayload: { name: string; email?: string; phone?: string; password: string; confirmPassword?: string } = {
          name: name.trim(),
          password,
          confirmPassword,
        };

        if (isEmail) {
          regPayload.email = cleanIdentifier;
        } else {
          regPayload.phone = cleanIdentifier;
        }

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
          // Try Supabase as backup if identifier is email
          if (isEmail) {
            try {
              const { data, error } = await supabase.auth.signUp({
                email: cleanIdentifier,
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
        const cleanIdentifier = identifier.trim();
        if (!cleanIdentifier) {
          throw new Error('Please enter your email or mobile number.');
        }
        if (!password) {
          throw new Error('Please enter your password.');
        }

        try {
          const res = await api.auth.login({
            identifier: cleanIdentifier,
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
          if (cleanIdentifier.includes('@')) {
            try {
              const { error } = await supabase.auth.signInWithPassword({
                email: cleanIdentifier,
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

  const account = Boolean(user) && mode !== 'reset';
  const isAdmin = user?.role === 'admin';

  // Patron Dashboard Tabs
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile' | 'address' | 'perks'>('bookings');

  // Bookings / Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Profile Edit State
  const [patronPhone, setPatronPhone] = useState(user?.phone || '');
  const [newPassword, setNewPassword] = useState('');
  const [accountConfirmPassword, setAccountConfirmPassword] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileErr, setProfileErr] = useState<string | null>(null);

  // Saved Delivery Address State
  const [addressStreet, setAddressStreet] = useState(user?.address?.street || '');
  const [addressCity, setAddressCity] = useState(user?.address?.city || '');
  const [addressState, setAddressState] = useState(user?.address?.state || 'Telangana');
  const [addressPincode, setAddressPincode] = useState(user?.address?.postalCode || '');
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressMsg, setAddressMsg] = useState<string | null>(null);
  const [addressErr, setAddressErr] = useState<string | null>(null);

  // Cart items state
  const [cartItems, setCartItems] = useState(() => cart.getItems());

  // Coupon copy feedback
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // Delivered Order Review & Rating State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewOrder, setSelectedReviewOrder] = useState<any>(null);
  const [selectedReviewItem, setSelectedReviewItem] = useState<any>(null);

  const handleOpenReviewModal = (order: any, item: any) => {
    setSelectedReviewOrder(order);
    setSelectedReviewItem(item);
    setReviewModalOpen(true);
  };

  async function fetchMyOrders() {
    setLoadingOrders(true);
    setOrdersError(null);
    try {
      const res = await api.orders.getMyOrders();
      setOrders(res.data || []);
    } catch (err: any) {
      setOrdersError(err.message || 'Unable to retrieve your bookings.');
    } finally {
      setLoadingOrders(false);
    }
  }

  useEffect(() => {
    if (isAdmin) {
      navigate({ to: '/admin', replace: true });
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (account) {
      fetchMyOrders();
      setName(user?.name || '');
      setPatronPhone(user?.phone || '');
      if (user?.address) {
        setAddressStreet(user.address.street || '');
        setAddressCity(user.address.city || '');
        setAddressState(user.address.state || 'Telangana');
        setAddressPincode(user.address.postalCode || '');
      }
    }
  }, [account, user]);

  useEffect(() => {
    const handleCartSync = () => setCartItems(cart.getItems());
    const handleOrderSync = () => fetchMyOrders();
    const handleReviewSync = () => fetchMyOrders();
    window.addEventListener('bamas_cart_updated', handleCartSync);
    window.addEventListener('bamas_order_created', handleOrderSync);
    window.addEventListener('bamas_review_created', handleReviewSync);
    return () => {
      window.removeEventListener('bamas_cart_updated', handleCartSync);
      window.removeEventListener('bamas_order_created', handleOrderSync);
      window.removeEventListener('bamas_review_created', handleReviewSync);
    };
  }, []);

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    setProfileErr(null);

    if (newPassword && newPassword !== accountConfirmPassword) {
      setProfileErr('New password and confirm password do not match.');
      setProfileSaving(false);
      return;
    }

    try {
      const payload: any = {
        name: name.trim(),
        phone: patronPhone.trim(),
      };
      if (newPassword) {
        payload.password = newPassword;
      }
      const res = await api.auth.updateProfile(payload);
      if (res.data) {
        localStorage.setItem('bamas_user', JSON.stringify(res.data));
        window.dispatchEvent(new Event('bamas_auth_changed'));
      }
      setProfileMsg('✓ Profile details saved successfully!');
      setNewPassword('');
      setAccountConfirmPassword('');
    } catch (err: any) {
      setProfileErr(err.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleSaveAddress(e: FormEvent) {
    e.preventDefault();
    setAddressSaving(true);
    setAddressMsg(null);
    setAddressErr(null);

    try {
      const addressPayload = {
        street: addressStreet.trim(),
        city: addressCity.trim(),
        state: addressState.trim(),
        postalCode: addressPincode.trim(),
        country: 'India',
      };
      const res = await api.auth.updateProfile({ address: addressPayload });
      if (res.data) {
        localStorage.setItem('bamas_user', JSON.stringify(res.data));
        window.dispatchEvent(new Event('bamas_auth_changed'));
      }
      setAddressMsg('✓ Default delivery address saved! Will auto-apply on your Silk Bag.');
    } catch (err: any) {
      setAddressErr(err.message || 'Failed to update address.');
    } finally {
      setAddressSaving(false);
    }
  }

  function handleCopyCoupon(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  }

  if (isAdmin) {
    return null;
  }

  if (account) {
    const totalBagCount = cartItems.reduce((acc, it) => acc + (it.quantity || 1), 0);

    return (
      <main className="section-wrap reveal" style={{ maxWidth: '1240px', margin: '0 auto', padding: '2rem 1.25rem 5rem' }}>
        {/* Top Hero Banner: Patron Identity & Quick Stats */}
        <div
          style={{
            background: 'linear-gradient(135deg, #061821 0%, #0d2a38 50%, #153748 100%)',
            borderRadius: '1.25rem',
            padding: '2rem 2.25rem',
            color: '#f8f9fa',
            border: '1px solid rgba(212, 175, 55, 0.45)',
            boxShadow: '0 20px 40px rgba(6, 24, 33, 0.25)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #d4af37 0%, #b8972e 100%)',
                  color: '#061821',
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
                  flexShrink: 0,
                }}
              >
                {((user?.name || user?.email || 'B').charAt(0) || 'B').toUpperCase()}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                  <span style={{ color: '#d4af37', letterSpacing: '0.12em', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    👑 BAMAS ROYAL PRIVILEGE CLIENT
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
                <h1 style={{ margin: 0, fontSize: '1.95rem', fontWeight: 600, color: '#ffffff', fontFamily: 'var(--font-serif, serif)' }}>
                  Welcome, {user?.name || 'Valued Patron'}
                </h1>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem', color: '#a0b9c6' }}>
                  {user?.email} {user?.phone ? `• ${user.phone}` : ''}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {isAdmin && (
                <Button asChild size="default" style={{ background: '#d4af37', color: '#061821', fontWeight: 700, border: 'none' }}>
                  <Link to="/admin">
                    <LayoutDashboard size={16} style={{ marginRight: '0.4rem' }} /> Admin Suite
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" size="default" style={{ borderColor: 'rgba(212, 175, 55, 0.5)', color: '#d4af37', background: 'transparent' }}>
                <Link to="/products">
                  <ShoppingBag size={16} style={{ marginRight: '0.4rem' }} /> Browse Boutique
                </Link>
              </Button>
              <Button asChild variant="outline" size="default" style={{ borderColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff', background: 'transparent' }}>
                <Link to="/cart">
                  <ShoppingBag size={16} style={{ marginRight: '0.4rem' }} /> Silk Bag ({totalBagCount})
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

          {/* Quick Stats Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              borderTop: '1px solid rgba(212, 175, 55, 0.2)',
              paddingTop: '1.25rem',
            }}
          >
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.75rem', padding: '0.85rem 1rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d4af37', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                <Package size={14} /> My Bookings
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Real-time database tracked</span>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.75rem', padding: '0.85rem 1rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                <ShoppingBag size={14} /> Silk Bag
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                {totalBagCount} {totalBagCount === 1 ? 'Drape' : 'Drapes'}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Reserved in active session</span>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.75rem', padding: '0.85rem 1rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                <Sparkles size={14} /> Privilege Tier
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                Gold Patron
              </div>
              <span style={{ fontSize: '0.72rem', color: '#d4af37' }}>10% off with code BAMAS10</span>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.75rem', padding: '0.85rem 1rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                <MapPin size={14} /> Saved Destination
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {addressCity || user?.address?.city || 'Not Set'}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {addressState || user?.address?.state || 'Add primary address'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            borderBottom: '1px solid #e2edf0',
            marginBottom: '2rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
          }}
        >
          {[
            { id: 'bookings', label: 'My Bookings & Orders', icon: Package, count: orders.length },
            { id: 'profile', label: 'Profile Information', icon: User },
            { id: 'address', label: 'Saved Delivery Address', icon: MapPin },
            { id: 'perks', label: 'Silk Bag & Privilege Perks', icon: Sparkles, count: totalBagCount },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: active ? '#092330' : 'transparent',
                  color: active ? '#d4af37' : '#527482',
                  fontWeight: active ? 700 : 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  borderBottom: active ? '2px solid #d4af37' : '2px solid transparent',
                }}
              >
                <Icon size={16} color={active ? '#d4af37' : 'inherit'} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    style={{
                      background: active ? 'rgba(212, 175, 55, 0.25)' : '#e2edf0',
                      color: active ? '#ffffff' : '#092330',
                      padding: '1px 7px',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: MY BOOKINGS & ORDERS */}
        {activeTab === 'bookings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#092330', fontFamily: 'var(--font-serif, serif)' }}>
                  Your Saree Bookings & Order History
                </h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#688897' }}>
                  All handloom sarees reserved under your patron account and verified with our weaving atelier.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fetchMyOrders}
                disabled={loadingOrders}
                style={{ borderColor: '#d4af37', color: '#092330', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <RefreshCw size={14} className={loadingOrders ? 'spin' : ''} />
                <span>{loadingOrders ? 'Refreshing...' : 'Refresh Orders'}</span>
              </Button>
            </div>

            {loadingOrders && orders.length === 0 ? (
              <div style={{ padding: '4rem 1rem', textAlign: 'center', background: '#ffffff', borderRadius: '1rem', border: '1px solid #dce8ec' }}>
                <LoaderCircle className="spin" size={32} style={{ color: '#d4af37', margin: '0 auto 1rem' }} />
                <p style={{ margin: 0, color: '#688897', fontSize: '0.92rem' }}>
                  Connecting to master atelier registry to fetch your bookings...
                </p>
              </div>
            ) : ordersError ? (
              <div style={{ padding: '2rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', color: '#b91c1c', textAlign: 'center' }}>
                <p style={{ margin: '0 0 1rem', fontSize: '0.92rem' }}>{ordersError}</p>
                <Button onClick={fetchMyOrders} size="sm" style={{ background: '#092330', color: '#ffffff' }}>
                  Try Again
                </Button>
              </div>
            ) : orders.length === 0 ? (
              /* Empty State */
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '1rem',
                  border: '1px solid #dce8ec',
                  padding: '4rem 2rem',
                  textAlign: 'center',
                  boxShadow: '0 4px 20px rgba(9, 35, 48, 0.03)',
                }}
              >
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: 'rgba(212, 175, 55, 0.12)',
                    color: '#d4af37',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                  }}
                >
                  <ShoppingBag size={32} />
                </div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: 700, color: '#092330', fontFamily: 'var(--font-serif, serif)' }}>
                  No Saree Bookings Yet
                </h3>
                <p style={{ margin: '0 auto 1.5rem', color: '#688897', fontSize: '0.9rem', maxWidth: '440px', lineHeight: 1.5 }}>
                  You haven't reserved any handloom silk sarees yet. Explore our bridal trousseaus, tissue weaves, and pure mulberry silks with complimentary pan-India shipping.
                </p>
                <Button asChild style={{ background: '#092330', color: '#d4af37', border: '1px solid #d4af37', padding: '0.75rem 1.75rem', borderRadius: '0.5rem', fontWeight: 700 }}>
                  <Link to="/products">
                    Explore Saree Collection <ArrowRight size={16} style={{ marginLeft: '0.4rem' }} />
                  </Link>
                </Button>
              </div>
            ) : (
              /* Orders List */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {orders.map((order) => {
                  const orderNum = order._id?.toString().slice(-6).toUpperCase() || 'ORDER';
                  const dateStr = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Recent Booking';

                  const isConfirmed = order.status === 'Confirmed' || order.isPaid;
                  const isShipped = order.status === 'Shipped' || order.status === 'In Transit';
                  const isDelivered = order.status === 'Delivered';

                  return (
                    <div
                      key={order._id}
                      style={{
                        background: '#ffffff',
                        borderRadius: '0.85rem',
                        border: '1px solid #dce8ec',
                        boxShadow: '0 2px 12px rgba(9, 35, 48, 0.04)',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Order Card Header */}
                      <div
                        style={{
                          background: '#f8fafc',
                          padding: '1rem 1.25rem',
                          borderBottom: '1px solid #e2edf0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '0.75rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: '#688897', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                              Booking ID
                            </span>
                            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#092330', fontFamily: 'monospace' }}>
                              #{orderNum}
                            </span>
                          </div>

                          <div style={{ height: '24px', width: '1px', background: '#cbd5e1' }} />

                          <div>
                            <span style={{ fontSize: '0.7rem', color: '#688897', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                              Placed On
                            </span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#092330' }}>
                              {dateStr}
                            </span>
                          </div>

                          <div style={{ height: '24px', width: '1px', background: '#cbd5e1' }} />

                          <div>
                            <span style={{ fontSize: '0.7rem', color: '#688897', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                              Payment Status
                            </span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16a34a' }}>
                              {order.isPaid ? '✓ Paid' : 'Pending'} ({order.paymentMethod || 'Online'})
                            </span>
                          </div>
                        </div>

                        {/* Status Badge & Total */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: isDelivered
                                ? '#ecfdf5'
                                : isShipped
                                ? '#eff6ff'
                                : isConfirmed
                                ? 'rgba(212, 175, 55, 0.15)'
                                : '#fef3c7',
                              color: isDelivered
                                ? '#059669'
                                : isShipped
                                ? '#2563eb'
                                : isConfirmed
                                ? '#b45309'
                                : '#d97706',
                              border: isConfirmed ? '1px solid rgba(212, 175, 55, 0.4)' : 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {isDelivered
                              ? '✨ Delivered'
                              : isShipped
                              ? '🚚 In Transit'
                              : isConfirmed
                              ? '✓ Confirmed & Weaving'
                              : '⏳ Processing'}
                          </span>

                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.7rem', color: '#688897', textTransform: 'uppercase', display: 'block' }}>
                              Total Amount
                            </span>
                            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#092330' }}>
                              ₹{(order.totalPrice || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {(order.orderItems || []).map((item: any, idx: number) => {
                          const itemImg = getSareeImage(item);
                          return (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '1rem',
                                padding: '0.65rem 0',
                                borderBottom: idx < order.orderItems.length - 1 ? '1px solid #f1f5f9' : 'none',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                                <img
                                  src={itemImg}
                                  alt={item.name}
                                  style={{
                                    width: '54px',
                                    height: '68px',
                                    borderRadius: '6px',
                                    objectFit: 'cover',
                                    border: '1px solid #e2e8f0',
                                    flexShrink: 0,
                                  }}
                                  onError={(e) => {
                                    e.currentTarget.src = ivory;
                                  }}
                                />
                                <div style={{ minWidth: 0 }}>
                                  <h4 style={{ margin: '0 0 2px', fontSize: '0.95rem', fontWeight: 700, color: '#092330' }}>
                                    {item.name}
                                  </h4>
                                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                                    Quantity: {item.quantity || item.qty || 1} · Pure Silk Mark Certified
                                  </p>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#092330', flexShrink: 0 }}>
                                  ₹{((item.price || 0) * (item.quantity || item.qty || 1)).toLocaleString('en-IN')}
                                </span>

                                {isDelivered && (
                                  <Button
                                    size="sm"
                                    type="button"
                                    onClick={() => handleOpenReviewModal(order, item)}
                                    style={{
                                      background: 'linear-gradient(135deg, #092330 0%, #153c50 100%)',
                                      color: '#d4af37',
                                      border: '1px solid #d4af37',
                                      fontSize: '0.78rem',
                                      fontWeight: 700,
                                      height: '32px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.35rem',
                                      cursor: 'pointer',
                                      boxShadow: '0 2px 6px rgba(9, 35, 48, 0.15)',
                                    }}
                                  >
                                    <Star size={13} fill="#d4af37" color="#d4af37" />
                                    <span>Rate & Review</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Order Footer & Actions */}
                      <div
                        style={{
                          background: '#fafbfc',
                          padding: '0.85rem 1.25rem',
                          borderTop: '1px solid #e2edf0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '0.75rem',
                          fontSize: '0.82rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                          <MapPin size={14} color="#d4af37" />
                          <span>
                            Delivery to:{' '}
                            <strong style={{ color: '#092330' }}>
                              {order.shippingAddress?.fullName || user?.name},{' '}
                              {order.shippingAddress?.city || 'India'}
                            </strong>
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                          {isDelivered && order.orderItems && order.orderItems.length > 0 && (
                            <Button
                              size="sm"
                              type="button"
                              onClick={() => handleOpenReviewModal(order, order.orderItems[0])}
                              style={{
                                background: 'linear-gradient(135deg, #d4af37 0%, #b8972e 100%)',
                                color: '#092330',
                                fontWeight: 800,
                                fontSize: '0.78rem',
                                height: '30px',
                                border: 'none',
                                boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                cursor: 'pointer',
                              }}
                            >
                              <Star size={13} fill="#092330" color="#092330" />
                              <span>Rate Saree & Photos</span>
                            </Button>
                          )}

                          <a
                            href={`https://wa.me/919876543210?text=${encodeURIComponent(
                              `Hello Bamas Collection, please share the tracking details for my saree booking #${orderNum}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              color: '#047857',
                              background: '#ecfdf5',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              textDecoration: 'none',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              border: '1px solid rgba(4, 120, 87, 0.2)',
                            }}
                          >
                            <span>WhatsApp Updates</span>
                            <ExternalLink size={12} />
                          </a>

                          <Button asChild size="sm" variant="outline" style={{ height: '30px', fontSize: '0.78rem' }}>
                            <Link to="/products">Re-order Saree</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PERSONAL PROFILE */}
        {activeTab === 'profile' && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '1rem',
              padding: '2rem',
              border: '1px solid #dce8ec',
              boxShadow: '0 4px 20px rgba(9, 35, 48, 0.03)',
              maxWidth: '680px',
            }}
          >
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#092330', fontFamily: 'var(--font-serif, serif)' }}>
                Personal Profile Credentials
              </h2>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#688897' }}>
                Update your registered patron name, primary mobile number, and account security credentials.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#092330', marginBottom: '0.35rem' }}>
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    padding: '0 12px',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#092330', marginBottom: '0.35rem' }}>
                  Primary Contact Mobile Number *
                </label>
                <input
                  type="tel"
                  value={patronPhone}
                  onChange={(e) => setPatronPhone(e.target.value)}
                  placeholder="e.g. 9876543210 (used for insured courier handover)"
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    padding: '0 12px',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#092330', marginBottom: '0.35rem' }}>
                  Registered Email Address (Verified)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    padding: '0 12px',
                    fontSize: '0.9rem',
                    background: '#f8fafc',
                    color: '#64748b',
                  }}
                />
                <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                  ✓ Verified Patron Identity
                </span>
              </div>

              {/* Security Password Update */}
              <div style={{ borderTop: '1px solid #e2edf0', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#092330', display: 'block', marginBottom: '0.75rem' }}>
                  Change Account Password (Optional)
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      style={{
                        width: '100%',
                        height: '40px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        padding: '0 12px',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={accountConfirmPassword}
                      onChange={(e) => setAccountConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      style={{
                        width: '100%',
                        height: '40px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        padding: '0 12px',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              {profileErr && (
                <div style={{ padding: '0.65rem 0.85rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#b91c1c', fontSize: '0.82rem' }}>
                  {profileErr}
                </div>
              )}

              {profileMsg && (
                <div style={{ padding: '0.65rem 0.85rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '6px', color: '#065f46', fontSize: '0.82rem', fontWeight: 600 }}>
                  {profileMsg}
                </div>
              )}

              <Button
                type="submit"
                disabled={profileSaving}
                style={{
                  background: '#092330',
                  color: '#ffffff',
                  fontWeight: 700,
                  height: '44px',
                  borderRadius: '6px',
                  border: '1px solid #d4af37',
                  marginTop: '0.5rem',
                }}
              >
                {profileSaving ? (
                  <>
                    <LoaderCircle size={16} className="spin" style={{ marginRight: '0.5rem' }} />
                    Saving Changes...
                  </>
                ) : (
                  'Save Profile Changes'
                )}
              </Button>
            </form>
          </div>
        )}

        {/* TAB 3: SAVED DELIVERY ADDRESS */}
        {activeTab === 'address' && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '1rem',
              padding: '2rem',
              border: '1px solid #dce8ec',
              boxShadow: '0 4px 20px rgba(9, 35, 48, 0.03)',
              maxWidth: '680px',
            }}
          >
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#092330', fontFamily: 'var(--font-serif, serif)' }}>
                Primary Delivery Destination
              </h2>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#688897' }}>
                Set your default delivery address so it automatically pre-fills during 1-click Silk Bag checkout.
              </p>
            </div>

            <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#092330', marginBottom: '0.35rem' }}>
                  Street / House Address *
                </label>
                <input
                  type="text"
                  required
                  value={addressStreet}
                  onChange={(e) => setAddressStreet(e.target.value)}
                  placeholder="Flat/House No., Building, Street Name"
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    padding: '0 12px',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#092330', marginBottom: '0.35rem' }}>
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressCity}
                    onChange={(e) => setAddressCity(e.target.value)}
                    placeholder="e.g. Hyderabad"
                    style={{
                      width: '100%',
                      height: '44px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      padding: '0 12px',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#092330', marginBottom: '0.35rem' }}>
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressState}
                    onChange={(e) => setAddressState(e.target.value)}
                    placeholder="e.g. Telangana"
                    style={{
                      width: '100%',
                      height: '44px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      padding: '0 12px',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#092330', marginBottom: '0.35rem' }}>
                    PIN Code (6 Digits) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={addressPincode}
                    onChange={(e) => setAddressPincode(e.target.value)}
                    placeholder="e.g. 500033"
                    style={{
                      width: '100%',
                      height: '44px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      padding: '0 12px',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {addressErr && (
                <div style={{ padding: '0.65rem 0.85rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#b91c1c', fontSize: '0.82rem' }}>
                  {addressErr}
                </div>
              )}

              {addressMsg && (
                <div style={{ padding: '0.65rem 0.85rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '6px', color: '#065f46', fontSize: '0.82rem', fontWeight: 600 }}>
                  {addressMsg}
                </div>
              )}

              <Button
                type="submit"
                disabled={addressSaving}
                style={{
                  background: '#092330',
                  color: '#ffffff',
                  fontWeight: 700,
                  height: '44px',
                  borderRadius: '6px',
                  border: '1px solid #d4af37',
                  marginTop: '0.5rem',
                }}
              >
                {addressSaving ? (
                  <>
                    <LoaderCircle size={16} className="spin" style={{ marginRight: '0.5rem' }} />
                    Saving Address...
                  </>
                ) : (
                  'Save Delivery Address'
                )}
              </Button>
            </form>
          </div>
        )}

        {/* TAB 4: SILK BAG & PRIVILEGE PERKS */}
        {activeTab === 'perks' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
            {/* Active Silk Bag Items */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '1rem',
                padding: '1.75rem',
                border: '1px solid #dce8ec',
                boxShadow: '0 4px 20px rgba(9, 35, 48, 0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#092330', fontFamily: 'var(--font-serif, serif)' }}>
                  Active Silk Bag ({totalBagCount})
                </h3>
                <Link to="/cart" style={{ fontSize: '0.82rem', color: '#0e7490', fontWeight: 700, textDecoration: 'none' }}>
                  Open Full Cart →
                </Link>
              </div>

              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#f8fafc', borderRadius: '0.75rem' }}>
                  <ShoppingBag size={28} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.88rem' }}>Your silk bag is currently empty.</p>
                  <Button asChild size="sm" style={{ background: '#092330', color: '#d4af37' }}>
                    <Link to="/products">Browse Saree Vault</Link>
                  </Button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        padding: '0.65rem',
                        background: '#f8fafc',
                        borderRadius: '0.5rem',
                        border: '1px solid #e2edf0',
                      }}
                    >
                      <img src={item.image} alt={item.name} style={{ width: '48px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ margin: '0 0 2px', fontSize: '0.88rem', fontWeight: 700, color: '#092330', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Qty: {item.quantity}</span>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#092330' }}>
                        ₹{((item.price || 0) * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}

                  <Button asChild style={{ width: '100%', marginTop: '0.75rem', background: '#092330', color: '#d4af37', border: '1px solid #d4af37', fontWeight: 700 }}>
                    <Link to="/cart">Proceed to 1-Click Checkout →</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Privilege Coupons & VIP Concierge */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '1rem',
                  padding: '1.75rem',
                  border: '1px solid #dce8ec',
                  boxShadow: '0 4px 20px rgba(9, 35, 48, 0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Gift size={20} color="#d4af37" />
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#092330', fontFamily: 'var(--font-serif, serif)' }}>
                    Exclusive Patron Privilege Codes
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {[
                    { code: 'BAMAS10', title: '10% Handloom Privilege', desc: 'Valid on all silk sarees and celebratory handlooms' },
                    { code: 'ROYAL15', title: '15% Bridal Atelier Voucher', desc: 'For trousseau and wedding bookings above ₹25,000' },
                    { code: 'HERITAGE', title: '₹2,000 Complimentary Voucher', desc: 'Instant voucher off total payable at checkout' },
                  ].map((coupon) => (
                    <div
                      key={coupon.code}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px dashed #d4af37',
                        background: '#fffdf7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#092330', fontFamily: 'monospace' }}>
                            {coupon.code}
                          </span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#b45309', background: 'rgba(212, 175, 55, 0.2)', padding: '1px 6px', borderRadius: '4px' }}>
                            Active
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{coupon.desc}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyCoupon(coupon.code)}
                        style={{
                          background: copiedCoupon === coupon.code ? '#ecfdf5' : '#092330',
                          color: copiedCoupon === coupon.code ? '#059669' : '#d4af37',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {copiedCoupon === coupon.code ? (
                          <>
                            <Check size={12} /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={12} /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* VIP Concierge Assistance */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #092330 0%, #153c50 100%)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  color: '#ffffff',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d4af37', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  <Sparkles size={14} /> VIP Atelier Concierge
                </div>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                  Personal Drape & Weaving Consultation
                </h4>
                <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: '#a0b9c6', lineHeight: 1.5 }}>
                  Need custom color dyeing, blouse stitching, or bridal trousseau guidance? Connect directly with our master weavers in Hyderabad.
                </p>
                <a
                  href="https://wa.me/919876543210?text=Hello%20Bamas%20Collection,%20I%20am%20a%20patron%20and%20would%20like%20a%20private%20saree%20consultation."
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#25D366',
                    color: '#ffffff',
                    padding: '0.65rem 1.25rem',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  <span>Chat on WhatsApp</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Customer Review & Image Upload Modal for Delivered Bookings */}
        {reviewModalOpen && selectedReviewItem && (
          <ReviewModal
            open={reviewModalOpen}
            order={selectedReviewOrder}
            item={selectedReviewItem}
            onClose={() => {
              setReviewModalOpen(false);
              setSelectedReviewOrder(null);
              setSelectedReviewItem(null);
            }}
            onSuccess={() => {
              fetchMyOrders();
            }}
          />
        )}
      </main>
    );
  }

  return (
    <main className="auth-ref-page">
      <div className="auth-ref-grid">
        {/* Left Column: Visual Artwork matching reference */}
        <div className="auth-ref-visual">
          <div className="auth-ref-image-frame">
            <img
              src={image}
              alt="Bamas Collection Heritage Saree"
            />
          </div>
        </div>

        {/* Right Column: Clean Form matching reference */}
        <div className="auth-ref-form-wrap">
          <h1 className="auth-ref-title">
            {mode === 'reset'
              ? 'Set new password'
              : forgot
              ? 'Reset password'
              : mode === 'register'
              ? 'Create account'
              : 'Welcome back'}
          </h1>
          <p className="auth-ref-subtitle">
            {forgot
              ? 'Enter your email address to receive password reset instructions.'
              : mode === 'reset'
              ? 'Choose a secure new password for your customer account.'
              : mode === 'register'
              ? 'Join to access your orders, bookings, and customer profile.'
              : 'Sign in to access your orders, bookings, and customer profile.'}
          </p>

          {error && (
            <div role="alert" className="auth-ref-feedback error">
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div role="status" className="auth-ref-feedback success">
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={submit}>
            <div className="auth-ref-fields">
              {/* Full Name for Register Mode */}
              {mode === 'register' && !forgot && (
                <div className="auth-ref-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="auth-ref-label">Full name</label>
                    {authTouched.name && nameVal.valid && (
                      <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>✓ Valid</span>
                    )}
                  </div>
                  <input
                    required
                    type="text"
                    value={name}
                    onBlur={() => setAuthTouched((p) => ({ ...p, name: true }))}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!authTouched.name) setAuthTouched((p) => ({ ...p, name: true }));
                    }}
                    autoComplete="name"
                    placeholder="Enter your full name"
                    maxLength={100}
                    className="auth-ref-input"
                    style={{
                      borderColor: authTouched.name ? (!nameVal.valid ? '#ef4444' : '#10b981') : undefined,
                      boxShadow: authTouched.name && !nameVal.valid ? '0 0 0 1px #ef4444' : undefined,
                    }}
                  />
                  {authTouched.name && !nameVal.valid && (
                    <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '3px', display: 'block' }}>
                      {nameVal.error}
                    </span>
                  )}
                </div>
              )}

              {/* Single Unified Input for Email or Mobile Number */}
              {mode !== 'reset' && (
                <div className="auth-ref-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="auth-ref-label">
                      {forgot ? 'Email address' : 'Email or mobile number'}
                    </label>
                    {authTouched.identifier && idVal.valid && (
                      <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
                        {idVal.isEmail ? '✓ Valid Email' : '✓ Valid 10-Digit Mobile'}
                      </span>
                    )}
                  </div>
                  <input
                    required
                    type={forgot ? 'email' : 'text'}
                    value={identifier}
                    onBlur={() => setAuthTouched((p) => ({ ...p, identifier: true }))}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (!authTouched.identifier) setAuthTouched((p) => ({ ...p, identifier: true }));
                    }}
                    autoComplete={mode === 'login' ? 'username' : 'email'}
                    placeholder={
                      forgot
                        ? 'Enter email address'
                        : 'Enter email or 10-digit mobile'
                    }
                    className="auth-ref-input"
                    style={{
                      borderColor: authTouched.identifier ? (!idVal.valid ? '#ef4444' : '#10b981') : undefined,
                      boxShadow: authTouched.identifier && !idVal.valid ? '0 0 0 1px #ef4444' : undefined,
                    }}
                  />
                  {authTouched.identifier && !idVal.valid && (
                    <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '3px', display: 'block' }}>
                      {idVal.error}
                    </span>
                  )}
                </div>
              )}

              {/* Password field */}
              {!forgot && (
                <div className="auth-ref-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="auth-ref-label">
                      {mode === 'reset' ? 'New password' : 'Password'}
                    </label>
                    {password && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color:
                            passVal.strength === 'strong'
                              ? '#10b981'
                              : passVal.strength === 'fair'
                              ? '#f59e0b'
                              : '#ef4444',
                        }}
                      >
                        Strength: {passVal.strength.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="auth-ref-input-wrap">
                    <input
                      required
                      type={show ? 'text' : 'password'}
                      value={password}
                      onBlur={() => setAuthTouched((p) => ({ ...p, password: true }))}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (!authTouched.password) setAuthTouched((p) => ({ ...p, password: true }));
                      }}
                      minLength={6}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      placeholder="Password (min 6 characters)"
                      className="auth-ref-input"
                      style={{
                        paddingRight: '45px',
                        borderColor: authTouched.password && password ? (!passVal.valid ? '#ef4444' : '#10b981') : undefined,
                        boxShadow: authTouched.password && password && !passVal.valid ? '0 0 0 1px #ef4444' : undefined,
                      }}
                    />
                    <button
                      type="button"
                      className="auth-ref-password-toggle"
                      aria-label={show ? 'Hide password' : 'Show password'}
                      onClick={() => setShow(!show)}
                    >
                      {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {authTouched.password && !passVal.valid && (
                    <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '3px', display: 'block' }}>
                      {passVal.error}
                    </span>
                  )}
                </div>
              )}

              {/* Confirm Password field for Register mode */}
              {mode === 'register' && !forgot && (
                <div className="auth-ref-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="auth-ref-label" htmlFor="confirm-password">
                      Confirm Password
                    </label>
                    {confirmPassword && confirmVal.valid && (
                      <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>✓ Passwords Match</span>
                    )}
                  </div>
                  <div className="auth-ref-input-wrap">
                    <input
                      id="confirm-password"
                      required
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onBlur={() => setAuthTouched((p) => ({ ...p, confirmPassword: true }))}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (!authTouched.confirmPassword) setAuthTouched((p) => ({ ...p, confirmPassword: true }));
                      }}
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Confirm password"
                      className="auth-ref-input"
                      style={{
                        paddingRight: '45px',
                        borderColor: authTouched.confirmPassword && confirmPassword ? (!confirmVal.valid ? '#ef4444' : '#10b981') : undefined,
                        boxShadow: authTouched.confirmPassword && confirmPassword && !confirmVal.valid ? '0 0 0 1px #ef4444' : undefined,
                      }}
                    />
                    <button
                      type="button"
                      className="auth-ref-password-toggle"
                      aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {authTouched.confirmPassword && confirmPassword && !confirmVal.valid && (
                    <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '3px', display: 'block' }}>
                      {confirmVal.error}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={busy || !ready || (mode === 'reset' && !recovery)}
              className="auth-ref-submit-btn"
            >
              {busy ? (
                <LoaderCircle className="spin" size={18} />
              ) : forgot ? (
                'Send reset link'
              ) : mode === 'register' ? (
                'Create account'
              ) : mode === 'reset' ? (
                'Update password'
              ) : (
                'Sign in'
              )}
            </button>
          </form>



          {/* Links matching reference */}
          <div className="auth-ref-links">
            {mode === 'login' && !forgot && (
              <button
                type="button"
                className="auth-ref-forgot-btn"
                onClick={() => {
                  setForgot(true);
                  setError('');
                  setMessage('');
                }}
              >
                Forgot password?
              </button>
            )}

            {mode !== 'reset' && !forgot && (
              <p className="auth-ref-switch-text">
                {mode === 'login' ? (
                  <>
                    New customer?{' '}
                    <Link to="/register" className="auth-ref-switch-link">
                      Register here
                    </Link>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <Link to="/login" className="auth-ref-switch-link">
                      Sign in here
                    </Link>
                  </>
                )}
              </p>
            )}

            {forgot && (
              <button
                type="button"
                className="auth-ref-forgot-btn"
                onClick={() => {
                  setForgot(false);
                  setError('');
                  setMessage('');
                }}
              >
                Back to sign in
              </button>
            )}

            {mode === 'reset' && (
              <Link to="/login" className="auth-ref-switch-link">
                Back to sign in
              </Link>
            )}
          </div>
        </div>
      </div>

    </main>
  );
}

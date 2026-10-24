import { Link, useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import {
  Menu,
  X,
  UserRound,
  ArrowUpRight,
  LogOut,
  ShieldCheck,
  Sparkles,
  Award,
  Heart,
  MapPin,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  Clock,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCustomer } from './auth-context';
import { supabase } from '@/integrations/supabase/client';
import bamasLogo from '@/assets/bamas-logo.jpg';
import { api } from '@/lib/api';
import { NotificationBell } from './notification-bell';
import { cart } from '@/lib/cart';
import { CartDrawer } from './cart-drawer';

const nav = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Collection' },
  { to: '/about', label: 'Our story' },
  { to: '/faq', label: 'FAQs' },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [cartCount, setCartCount] = useState(() => cart.getCount());
  const { user } = useCustomer();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCartUpdate = () => {
      setCartCount(cart.getCount());
    };
    window.addEventListener('bamas_cart_updated', handleCartUpdate);
    return () => {
      window.removeEventListener('bamas_cart_updated', handleCartUpdate);
    };
  }, []);

  const { data: configResp } = useQuery({
    queryKey: ['siteConfig'],
    queryFn: () => api.siteConfig.get(),
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const logoSrc = configResp?.data?.logoUrl || bamasLogo;

  async function signOut() {
    api.auth.logout();
    await queryClient.cancelQueries();
    queryClient.clear();
    try {
      await supabase.auth.signOut();
    } catch {}
    window.dispatchEvent(new Event('bamas_auth_changed'));
    await navigate({ to: '/login', replace: true });
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="wordmark" aria-label="Bamas Collection home">
          <img
            src={logoSrc}
            alt="Bamas Collection"
            width="50"
            height="50"
            onError={(e) => {
              e.currentTarget.src = bamasLogo;
            }}
            style={{
              borderRadius: '8px',
              objectFit: 'cover',
              boxShadow: '0 2px 10px rgba(212, 175, 55, 0.25)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
            }}
          />
          <span>
            BAMAS
            <small>COLLECTION</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: true }}
              activeProps={{ className: 'nav-active' }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <NotificationBell isAdmin={user?.role === 'admin'} />
          {user?.role === 'admin' && (
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex" style={{ borderColor: '#d4af37', color: '#092330', background: 'rgba(212, 175, 55, 0.08)', fontWeight: 600 }}>
              <Link to="/admin">
                <ShieldCheck size={14} style={{ marginRight: '4px', color: '#d4af37' }} /> Admin Portal
              </Link>
            </Button>
          )}
          {/* Silk Bag (Cart) Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="header-bag-btn"
            title="Silk Bag"
            aria-label={`Silk Bag with ${cartCount} items`}
            onClick={() => setCartDrawerOpen(true)}
            style={{ position: 'relative' }}
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  background: 'var(--gold, #d4af37)',
                  color: '#092330',
                  fontSize: '10px',
                  fontWeight: 700,
                  minWidth: '18px',
                  height: '18px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  border: '1.5px solid #ffffff',
                }}
              >
                {cartCount}
              </span>
            )}
          </Button>

          <Button asChild variant="ghost" size="icon" title={user ? 'My account' : 'Log in'}>
            <Link to="/login" aria-label={user ? 'My account' : 'Log in'}>
              <UserRound />
            </Link>
          </Button>
          {user ? (
            <Button variant="ghost" size="icon" title="Sign out" onClick={signOut}>
              <LogOut />
            </Button>
          ) : (
            <Button asChild variant="outline" className="register-link">
              <Link to="/register">
                Join Bamas <ArrowUpRight />
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="mobile-menu-toggle"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin" onClick={() => setOpen(false)} style={{ color: '#d4af37', fontWeight: 700 }}>
              👑 Admin Dashboard
            </Link>
          )}
          <Link to="/register" onClick={() => setOpen(false)}>
            Join Bamas
          </Link>
        </nav>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        open={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        onProceedToCheckout={() => {
          setCartDrawerOpen(false);
          navigate({ to: '/products' });
        }}
      />
    </header>
  );
}

export function SiteFooter() {
  const { data: configResp } = useQuery({
    queryKey: ['siteConfig'],
    queryFn: () => api.siteConfig.get(),
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const logoSrc = configResp?.data?.logoUrl || bamasLogo;
  const brandName = configResp?.data?.brandName || 'Bamas Collection';

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribing(true);
    setTimeout(() => {
      setSubscribing(false);
      setSubscribed(true);
      setNewsletterEmail('');
    }, 500);
  };

  return (
    <footer className="site-footer">
      <div className="footer-main-grid">
        {/* Column 1: Brand Essence & Contact */}
        <div className="footer-brand-col">
          <Link to="/" className="footer-brand-heading" aria-label="Bamas Collection home">
            <img
              src={logoSrc}
              alt={brandName}
              width="44"
              height="44"
              onError={(e) => {
                e.currentTarget.src = bamasLogo;
              }}
              className="footer-brand-logo"
            />
            <div>
              <span className="footer-brand-title">BAMAS</span>
              <span className="footer-brand-sub">COLLECTION</span>
            </div>
          </Link>
          <p className="footer-brand-desc">
            Handcrafted pure silk sarees rooted in heritage and woven for your timeless moments.
          </p>
          <div className="footer-contact-info">
            <div className="footer-contact-row">
              <Mail size={15} className="footer-contact-icon" />
              <span>concierge@bamascollections.com</span>
            </div>
            <div className="footer-contact-row">
              <Phone size={15} className="footer-contact-icon" />
              <span>+91 98765 43210</span>
            </div>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-col">
          <h3 className="footer-col-title">Navigation</h3>
          <ul className="footer-links-list">
            <li>
              <Link to="/products">Collection</Link>
            </li>
            <li>
              <Link to="/about">Our Story</Link>
            </li>
            <li>
              <Link to="/faq">FAQs</Link>
            </li>
            <li>
              <Link to="/login">My Account</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Curated Silks */}
        <div className="footer-col">
          <h3 className="footer-col-title">Curated Silks</h3>
          <ul className="footer-links-list">
            <li>
              <Link to="/products">Kanchipuram Pattu</Link>
            </li>
            <li>
              <Link to="/products">Banarasi Katan</Link>
            </li>
            <li>
              <Link to="/products">Pastel & Tissue</Link>
            </li>
            <li>
              <Link to="/products">Bridal Trousseau</Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Private Circle / Newsletter */}
        <div className="footer-newsletter-col">
          <h3 className="footer-col-title">Private Circle</h3>
          <p className="footer-newsletter-desc">
            Subscribe for discreet previews of new weave arrivals and private showcases.
          </p>

          {subscribed ? (
            <div className="footer-newsletter-success">
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <span>Thank you for joining our Private Circle.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="footer-newsletter-form">
              <div className="footer-newsletter-input-wrap">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="footer-newsletter-input"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="footer-newsletter-btn"
                  aria-label="Subscribe"
                >
                  <Send size={14} />
                </button>
              </div>
            </form>
          )}

          <a
            href="https://wa.me/919876543210?text=Hello%20Bamas%20Collection,%20I%20would%20like%20to%20inquire%20about%20your%20handloom%20sarees."
            target="_blank"
            rel="noopener noreferrer"
            className="footer-whatsapp-btn"
          >
            <span>WhatsApp Concierge</span>
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>

      {/* Bottom Legal & Heritage Philosophy Strip */}
      <div className="footer-bottom-strip">
        <div className="footer-bottom-inner">
          <span className="footer-copyright">
            © {new Date().getFullYear()} Bamas Collection. All rights reserved.
          </span>
          <span className="footer-tagline-quote">
            “Trends come and go. Elegance stays.”
          </span>
          <div className="footer-legal-links">
            <Link to="/about">Privacy</Link>
            <span>•</span>
            <Link to="/about">Terms</Link>
            <span>•</span>
            <Link to="/faq">Silk Mark</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

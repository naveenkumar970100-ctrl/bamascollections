import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  ShoppingBag,
  Users,
  Settings,
  Menu,
  X,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  LogOut,
  RefreshCw,
  IndianRupee,
  Search,
  CheckCircle,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  Sparkles,
  MessageSquare,
  Mail,
  Phone,
} from 'lucide-react';
import { useCustomer } from '@/components/bamas/auth-context';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { pageHead } from '@/lib/page-head';
import { NotificationBell } from '@/components/bamas/notification-bell';
import bamasLogo from '@/assets/bamas-logo.jpg';
import ivorySaree from '@/assets/ivory-saree.jpg';
import roseSaree from '@/assets/rose-saree.jpg';
import wineSaree from '@/assets/wine-saree.jpg';
import sapphireSaree from '@/assets/sapphire-saree.jpg';
import maroonSaree from '@/assets/maroon-saree.jpg';
import tissueSaree from '@/assets/tissue-saree.jpg';
import lavenderSaree from '@/assets/lavender-saree.jpg';
import sareeHero from '@/assets/saree-hero.jpg';

const fallbackSareeImages: Record<string, string> = {
  emerald: sareeHero,
  rose: roseSaree,
  ivory: ivorySaree,
  wine: wineSaree,
  sapphire: sapphireSaree,
  'maroon-bridal': maroonSaree,
  tissue: tissueSaree,
  lavender: lavenderSaree,
};

export const Route = createFileRoute('/admin')({
  head: () =>
    pageHead(
      'Admin Dashboard | Bamas Collection',
      'Manage orders, catalog collections, customer accounts, and site configuration in real-time.'
    ),
  component: AdminDashboardPage,
});

type TabType = 'overview' | 'bookings' | 'collections' | 'customers' | 'inquiries' | 'settings';

function AdminDashboardPage() {
  const { user, ready } = useCustomer();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hide browser window scrollbars while keeping full scroll capability
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.scrollbarWidth = 'none';
      document.body.style.scrollbarWidth = 'none';
      document.documentElement.classList.add('admin-portal-root');
      document.body.classList.add('admin-portal-root');
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.documentElement.style.scrollbarWidth = '';
        document.body.style.scrollbarWidth = '';
        document.documentElement.classList.remove('admin-portal-root');
        document.body.classList.remove('admin-portal-root');
      }
    };
  }, []);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Data states from MongoDB Atlas
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [siteConfig, setSiteConfig] = useState<any>({
    brandName: 'Bamas Collection',
    tagline: 'Timeless Sarees. Modern You.',
    heroHeading: 'Bamas Collection · Timeless sarees. Modern you.',
    heroSubheading: 'For the moments that become memories. Discover sarees as beautifully individual as you.',
    heroBannerUrl: 'https://res.cloudinary.com/ddgjubbbx/image/upload/v1792690710/bamascollections/branding/saree-hero-banner.jpg',
    logoUrl: 'https://res.cloudinary.com/ddgjubbbx/image/upload/v1792690709/bamascollections/branding/bamas-logo.jpg',
    contactEmail: 'support@bamascollections.com',
    contactPhone: '+91 98765 43210',
  });

  // Product Full-Page Studio State (No Popups)
  const [isEditingProductView, setIsEditingProductView] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [productFormData, setProductFormData] = useState({
    name: '',
    category: 'Bridal & Heirloom Silks',
    price: 32000,
    originalPrice: 38000,
    fabric: 'Pure Mulberry Silk',
    color: 'Crimson Vermillion',
    border: 'Antique Gold Zari',
    countInStock: 5,
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    detail: 'Exquisitely hand-woven pure silk drape adorned with royal antique gold zari detailing.',
  });

  const resetProductForm = () => {
    setProductFormData({
      name: '',
      category: 'Bridal & Heirloom Silks',
      price: 32000,
      originalPrice: 38000,
      fabric: 'Pure Mulberry Silk',
      color: 'Crimson Vermillion',
      border: 'Antique Gold Zari',
      countInStock: 5,
      isFeatured: true,
      image:
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      detail:
        'Exquisitely hand-woven pure silk drape adorned with royal antique gold zari detailing.',
    });
  };

  const [bookingFilter, setBookingFilter] = useState('All');
  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [inquiryFilter, setInquiryFilter] = useState('All');
  const [inquirySearch, setInquirySearch] = useState('');

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch all live data from backend
  const fetchAllData = async () => {
    try {
      setRefreshing(true);
      const [statsRes, ordersRes, inquiriesRes, productsRes, usersRes, configRes] = await Promise.all([
        api.admin.getStats().catch(() => ({ data: null })),
        api.admin.getOrders().catch(() => ({ data: [] })),
        api.admin.getInquiries().catch(() => ({ data: [] })),
        api.products.getAll().catch(() => ({ data: [] })),
        api.admin.getUsers().catch(() => ({ data: [] })),
        api.siteConfig.get().catch(() => ({ data: null })),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (ordersRes.data) setOrders(ordersRes.data);
      if (inquiriesRes.data) setInquiries(inquiriesRes.data);
      if (productsRes.data) setProducts(productsRes.data);
      if (usersRes.data) setCustomers(usersRes.data);
      if (configRes.data) setSiteConfig(configRes.data);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    const handleRealtimeUpdate = () => {
      fetchAllData();
    };

    window.addEventListener('bamas_order_created', handleRealtimeUpdate);
    window.addEventListener('bamas_notification_received', handleRealtimeUpdate);
    window.addEventListener('bamas_inquiry_created', handleRealtimeUpdate);
    const interval = setInterval(fetchAllData, 15000);

    return () => {
      window.removeEventListener('bamas_order_created', handleRealtimeUpdate);
      window.removeEventListener('bamas_notification_received', handleRealtimeUpdate);
      window.removeEventListener('bamas_inquiry_created', handleRealtimeUpdate);
      clearInterval(interval);
    };
  }, []);

  // Update order status live
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.admin.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      showNotification(`Order status updated to "${newStatus}" in MongoDB Atlas!`);
      fetchAllData();
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    }
  };

  // Toggle user role
  const handleToggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    try {
      await api.admin.updateUserRole(userId, newRole);
      setCustomers((prev) =>
        prev.map((c) => (c.id === userId || c._id === userId ? { ...c, role: newRole } : c))
      );
      showNotification(`User role updated to ${newRole}`);
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this customer account?')) return;
    try {
      await api.admin.deleteUser(userId);
      setCustomers((prev) => prev.filter((c) => c.id !== userId && c._id !== userId));
      showNotification('Customer account deleted successfully');
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    }
  };

  // Update inquiry status live
  const handleUpdateInquiryStatus = async (inquiryId: string, newStatus: string) => {
    try {
      await api.admin.updateInquiryStatus(inquiryId, newStatus);
      setInquiries((prev) =>
        prev.map((i) => (i._id === inquiryId ? { ...i, status: newStatus } : i))
      );
      showNotification(`Inquiry status updated to "${newStatus}"!`);
      fetchAllData();
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    }
  };

  // Delete customer inquiry
  const handleDeleteInquiry = async (inquiryId: string) => {
    if (!confirm('Are you sure you want to delete this customer inquiry?')) return;
    try {
      await api.admin.deleteInquiry(inquiryId);
      setInquiries((prev) => prev.filter((i) => i._id !== inquiryId));
      showNotification('Inquiry deleted successfully.');
      fetchAllData();
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    }
  };

  // Save product (Create or Edit in Full-Page Studio)
  const handleSaveProduct = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSavingProduct(true);
      if (editingProduct) {
        await api.admin.updateProduct(editingProduct.id || editingProduct._id, productFormData);
        showNotification('✨ Saree piece updated successfully in MongoDB Atlas!');
      } else {
        await api.admin.createProduct(productFormData);
        showNotification('✨ New saree piece published to live collection!');
      }
      setIsEditingProductView(false);
      setEditingProduct(null);
      fetchAllData();
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    } finally {
      setSavingProduct(false);
    }
  };

  // Image Upload handler for Saree Studio (Cloudinary direct + fallback)
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const res = await api.upload.uploadImage(file, 'bamascollections/products');
      if (res.data?.url) {
        setProductFormData((prev) => ({ ...prev, image: res.data.url }));
        showNotification('✨ Image uploaded directly to Cloudinary!');
      }
    } catch (err: any) {
      console.warn('Direct upload error, reading as Data URL:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setProductFormData((prev) => ({
          ...prev,
          image: reader.result as string,
        }));
        showNotification('Image loaded. Will sync to Cloudinary on save.');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Delete this saree piece from your active catalog?')) return;
    try {
      await api.admin.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId && p._id !== productId));
      showNotification('Saree deleted from collection.');
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    }
  };

  // Save Site Configuration
  const handleSaveSiteConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.siteConfig.update(siteConfig);
      showNotification('Branding & Site Configuration saved in database!');
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    }
  };

  const handleSignOut = () => {
    api.auth.logout();
    window.dispatchEvent(new Event('bamas_auth_changed'));
    navigate({ to: '/login' });
  };

  // Access check with immediate localStorage fallback so the admin portal never gets stuck on a loading screen
  const cachedUser = typeof window !== 'undefined' ? api.auth.getCurrentUser() : null;
  const activeUser = user || cachedUser;
  const isAdmin = activeUser?.role === 'admin';

  // Unauthorized view styled in Logo Peacock Teal & Gold
  if (!isAdmin) {
    return (
      <div
        style={{
          minHeight: '85vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
          background: 'linear-gradient(180deg, #f0f6f8 0%, #e2edf2 100%)',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '1rem',
            padding: '2.5rem 2rem',
            boxShadow: '0 12px 40px rgba(9, 35, 48, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '68px',
              height: '68px',
              margin: '0 auto 1.25rem',
              borderRadius: '50%',
              background: 'rgba(9, 35, 48, 0.08)',
              color: '#092330',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(212, 175, 55, 0.4)',
            }}
          >
            <ShieldCheck size={36} style={{ color: '#d4af37' }} />
          </div>
          <h1
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '2rem',
              fontWeight: 600,
              color: '#092330',
              margin: '0 0 0.5rem',
            }}
          >
            Administrator Access Required
          </h1>
          <p style={{ color: '#527482', fontSize: '0.95rem', lineHeight: '1.5', margin: '0 0 1.75rem' }}>
            The Bamas Administration Suite is reserved for verified staff. Please sign in with your authorized admin credentials.
          </p>

          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '0.5rem',
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              marginBottom: '1.5rem',
              textAlign: 'left',
              fontSize: '0.85rem',
              color: '#1a333f',
            }}
          >
            <p style={{ margin: '0 0 0.25rem', fontWeight: 600, color: '#092330' }}>Authorized Admin Account:</p>
            <p style={{ margin: 0 }}><strong>Email:</strong> admin@bamas.com</p>
            <p style={{ margin: 0 }}><strong>Password:</strong> admin@123</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Button
              asChild
              size="lg"
              style={{
                background: 'linear-gradient(135deg, #092330 0%, #10384c 100%)',
                color: '#d4af37',
                border: '1px solid #d4af37',
                fontWeight: 600,
              }}
            >
              <a href="/login">
                Sign In as Admin <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
              </a>
            </Button>
            <Button asChild variant="outline" style={{ borderColor: '#c5d8df', color: '#092330' }}>
              <a href="/">Back to Store Homepage</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (bookingFilter === 'All') return true;
    return o.status === bookingFilter;
  });

  // Filtered products
  const filteredProducts = products.filter((p) => {
    if (!productSearch) return true;
    const q = productSearch.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.fabric?.toLowerCase().includes(q)
    );
  });

  // Filtered customers
  const filteredCustomers = customers.filter((c) => {
    if (!customerSearch) return true;
    const q = customerSearch.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    );
  });

  // Filtered inquiries
  const filteredInquiries = inquiries.filter((inq) => {
    const matchesFilter = inquiryFilter === 'All' ? true : inq.status === inquiryFilter;
    if (!matchesFilter) return false;
    if (!inquirySearch) return true;
    const q = inquirySearch.toLowerCase();
    return (
      inq.name?.toLowerCase().includes(q) ||
      inq.email?.toLowerCase().includes(q) ||
      inq.phone?.toLowerCase().includes(q) ||
      inq.subject?.toLowerCase().includes(q) ||
      inq.sareeInterest?.toLowerCase().includes(q) ||
      inq.message?.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="admin-portal-root"
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#f3f7f9',
        color: '#092330',
        fontFamily: 'Manrope, sans-serif',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            background: '#092330',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid #d4af37',
            fontSize: '0.9rem',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <CheckCircle size={18} style={{ color: '#d4af37' }} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Drawer Backdrop on mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 20, 27, 0.65)',
            zIndex: 990,
            backdropFilter: 'blur(3px)',
          }}
        />
      )}

      {/* SIDEBAR: Deep Royal Peacock Teal & Gold */}
      <aside
        style={{
          width: '260px',
          background: 'linear-gradient(180deg, #061821 0%, #0a2432 55%, #071922 100%)',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 1000,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: sidebarOpen ? '4px 0 24px rgba(0,0,0,0.25)' : 'none',
          borderRight: '1px solid rgba(212, 175, 55, 0.22)',
        }}
        className="admin-sidebar"
      >
        {/* Brand header with Real Logo */}
        <div
          style={{
            padding: '1.25rem 1.25rem',
            borderBottom: '1px solid rgba(212, 175, 55, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src={bamasLogo}
              alt="Bamas Collection"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                objectFit: 'cover',
                border: '1.5px solid #d4af37',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            />
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.05rem',
                  fontFamily: 'Cormorant Garamond, serif',
                  letterSpacing: '1px',
                  fontWeight: 700,
                  color: '#d4af37',
                }}
              >
                BAMAS PORTAL
              </h2>
              <span
                style={{
                  fontSize: '0.68rem',
                  color: '#b6d3dc',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  fontWeight: 600,
                }}
              >
                Administrator Suite
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav
          style={{
            padding: '1.25rem 0.75rem',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'bookings', label: 'Bookings & Orders', icon: CalendarCheck, badge: orders.length },
            { id: 'collections', label: 'Collections', icon: ShoppingBag, badge: products.length },
            { id: 'customers', label: 'Customers', icon: Users, badge: customers.length },
            {
              id: 'inquiries',
              label: 'Customer Inquiries',
              icon: MessageSquare,
              badge: inquiries.filter((i: any) => i.status === 'New').length || (inquiries.length > 0 ? inquiries.length : undefined),
            },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id && !isEditingProductView;
            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    setActiveTab(item.id as TabType);
                    setIsEditingProductView(false);
                    if (isMobile) {
                      setSidebarOpen(false);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    background: active
                      ? 'linear-gradient(90deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.08) 100%)'
                      : 'transparent',
                    color: active ? '#f3dfa2' : '#a2c2cc',
                    cursor: 'pointer',
                    fontWeight: active ? 600 : 500,
                    fontSize: '0.9rem',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    width: '100%',
                    borderLeft: active ? '3px solid #d4af37' : '3px solid transparent',
                  }}
                >
                  <Icon size={18} style={{ color: active ? '#d4af37' : 'inherit' }} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      style={{
                        background: active ? '#d4af37' : 'rgba(212, 175, 55, 0.25)',
                        color: active ? '#061821' : '#f3dfa2',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Sub-item under Collections for Saree Studio */}
                {item.id === 'collections' && (
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      resetProductForm();
                      setIsEditingProductView(true);
                      setActiveTab('collections');
                      if (isMobile) {
                        setSidebarOpen(false);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.55rem 0.85rem 0.55rem 2.25rem',
                      marginTop: '0.15rem',
                      marginBottom: '0.25rem',
                      borderRadius: '0.375rem',
                      border: '1px solid',
                      borderColor:
                        isEditingProductView && !editingProduct
                          ? '#d4af37'
                          : 'rgba(212, 175, 55, 0.18)',
                      background:
                        isEditingProductView && !editingProduct
                          ? 'rgba(212, 175, 55, 0.15)'
                          : 'rgba(212, 175, 55, 0.04)',
                      color: isEditingProductView ? '#f3dfa2' : '#d4af37',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      width: '100%',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Plus size={14} style={{ color: '#d4af37' }} />
                    <span style={{ flex: 1 }}>
                      {isEditingProductView && editingProduct ? 'Editing Saree…' : '+ Add Saree Piece'}
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid rgba(212, 175, 55, 0.18)',
            background: 'rgba(4, 16, 22, 0.65)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #d4af37 0%, #aa820a 100%)',
                border: '1px solid #d4af37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#061821',
                fontSize: '0.85rem',
                fontWeight: 700,
              }}
            >
              A
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {activeUser?.name || 'Bamas Admin'}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.75rem',
                  color: '#93b6c2',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {activeUser?.email || 'admin@bamas.com'}
              </p>
            </div>
          </div>

          <div>
            <button
              onClick={handleSignOut}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: 600,
                transition: 'all 0.15s ease',
              }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          marginLeft: !isMobile && sidebarOpen ? '260px' : '0px',
          transition: 'margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="admin-main-wrap"
      >
        {/* TOPBAR */}
        <header
          style={{
            height: '64px',
            background: '#ffffff',
            borderBottom: '1px solid #dce8ec',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            position: 'sticky',
            top: 0,
            zIndex: 800,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              style={{
                background: sidebarOpen ? 'rgba(9, 35, 48, 0.05)' : 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.45)',
                color: '#092330',
                cursor: 'pointer',
                padding: '0.45rem',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              aria-label="Toggle sidebar"
            >
              <Menu size={22} style={{ color: '#092330' }} />
            </button>
            <h1
              style={{
                margin: 0,
                fontSize: '1.35rem',
                fontWeight: 700,
                color: '#092330',
                fontFamily: 'Cormorant Garamond, serif',
                letterSpacing: '0.5px',
                textTransform: 'capitalize',
              }}
            >
              {activeTab === 'bookings'
                ? 'Bookings & Orders'
                : activeTab === 'inquiries'
                ? 'Customer Inquiries'
                : activeTab}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <NotificationBell isAdmin={true} />
          </div>
        </header>

        {/* CONTENT VIEWPORT */}
        <main style={{ padding: '1.5rem', flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              {/* Metric KPI cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                {[
                  {
                    title: 'Total Revenue',
                    value: `₹${(stats?.overview?.totalRevenue || 0).toLocaleString('en-IN')}`,
                    icon: IndianRupee,
                    sub: 'Paid orders collected',
                    color: '#d4af37',
                    bg: 'rgba(212, 175, 55, 0.15)',
                  },
                  {
                    title: 'Orders & Bookings',
                    value: stats?.overview?.totalOrders || orders.length,
                    icon: CalendarCheck,
                    sub: `${stats?.overview?.pendingOrders || 0} pending processing`,
                    color: '#092330',
                    bg: 'rgba(9, 35, 48, 0.1)',
                  },
                  {
                    title: 'Catalog Sarees',
                    value: stats?.overview?.totalProducts || products.length,
                    icon: ShoppingBag,
                    sub: 'Active heirloom drapes',
                    color: '#0e7490',
                    bg: 'rgba(14, 116, 144, 0.1)',
                  },
                  {
                    title: 'Registered Customers',
                    value: stats?.overview?.totalUsers || customers.length,
                    icon: Users,
                    sub: 'Customer accounts',
                    color: '#047857',
                    bg: 'rgba(16, 185, 129, 0.1)',
                  },
                  {
                    title: 'Client Inquiries',
                    value: inquiries.length,
                    icon: MessageSquare,
                    sub: `${inquiries.filter((inq: any) => inq.status === 'New').length} pending response`,
                    color: '#b45309',
                    bg: 'rgba(217, 119, 6, 0.1)',
                  },
                ].map((kpi, i) => {
                  const Icon = kpi.icon;
                  return (
                    <div
                      key={i}
                      style={{
                        background: '#ffffff',
                        borderRadius: '0.75rem',
                        padding: '1.25rem',
                        border: '1px solid #dce8ec',
                        borderTop: '3px solid #d4af37',
                        boxShadow: '0 2px 10px rgba(9, 35, 48, 0.04)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#527482' }}>{kpi.title}</span>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: kpi.bg,
                            color: kpi.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon size={18} />
                        </div>
                      </div>
                      <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#092330', marginBottom: '0.25rem' }}>
                        {kpi.value}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#688c99' }}>{kpi.sub}</div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions & Recent Stream */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                {/* Fast Admin Actions */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    border: '1px solid #dce8ec',
                    boxShadow: '0 2px 8px rgba(9, 35, 48, 0.03)',
                  }}
                >
                  <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600, color: '#092330' }}>
                    Quick Management Actions
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        resetProductForm();
                        setIsEditingProductView(true);
                        setActiveTab('collections');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        background: 'linear-gradient(135deg, #092330 0%, #10384c 100%)',
                        border: '1px solid #d4af37',
                        color: '#d4af37',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(9, 35, 48, 0.15)',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={16} /> Add New Saree to Collection
                      </span>
                      <ArrowRight size={14} />
                    </button>

                    <button
                      onClick={() => setActiveTab('bookings')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        background: 'rgba(212, 175, 55, 0.1)',
                        border: '1px solid rgba(212, 175, 55, 0.35)',
                        color: '#997510',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CalendarCheck size={16} /> Manage Bookings & Orders
                      </span>
                      <ArrowRight size={14} />
                    </button>

                    <button
                      onClick={() => setActiveTab('settings')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        background: '#f8fafb',
                        border: '1px solid #dce8ec',
                        color: '#092330',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Settings size={16} /> Update Brand Info & Hero
                      </span>
                      <ArrowRight size={14} />
                    </button>

                    <button
                      onClick={() => setActiveTab('inquiries')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        background: 'rgba(14, 116, 144, 0.08)',
                        border: '1px solid rgba(14, 116, 144, 0.25)',
                        color: '#0e7490',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MessageSquare size={16} /> View Client Inquiries ({inquiries.filter((i: any) => i.status === 'New').length} New)
                      </span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Consultation Inquiries Overview */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    border: '1px solid #dce8ec',
                    boxShadow: '0 2px 8px rgba(9, 35, 48, 0.03)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#092330' }}>
                      Recent Drape Consultations
                    </h3>
                    <button
                      onClick={() => setActiveTab('inquiries')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0e7490',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      View all ({inquiries.length}) &rarr;
                    </button>
                  </div>

                  {inquiries.length === 0 ? (
                    <p style={{ color: '#688c99', fontSize: '0.85rem' }}>No pending consultation inquiries.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {inquiries.slice(0, 3).map((inq: any, i) => (
                        <div
                          key={inq._id || i}
                          style={{
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            background: '#f8fafb',
                            border: '1px solid #e1ebef',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <p style={{ margin: '0 0 0.15rem', fontWeight: 600, fontSize: '0.85rem', color: '#092330' }}>
                                {inq.name}
                              </p>
                              <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: '#527482' }}>
                                {inq.email} {inq.phone ? `· ${inq.phone}` : ''}
                              </p>
                            </div>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '999px',
                                background: 'rgba(9, 35, 48, 0.1)',
                                color: '#092330',
                                fontWeight: 600,
                                border: '1px solid rgba(212, 175, 55, 0.3)',
                              }}
                            >
                              {inq.sareeInterest || 'General'}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: '#385764', fontStyle: 'italic' }}>
                            "{inq.message?.slice(0, 80)}…"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Orders Table */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '0.75rem',
                  padding: '1.25rem',
                  border: '1px solid #dce8ec',
                  boxShadow: '0 2px 8px rgba(9, 35, 48, 0.03)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#092330' }}>
                    Recent Orders & Real-time Status
                  </h3>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#d4af37',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    View All Orders →
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#688c99' }}>
                    No customer orders placed yet.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '0.85rem',
                        textAlign: 'left',
                      }}
                    >
                      <thead>
                        <tr style={{ background: '#f0f6f8', borderBottom: '1px solid #dce8ec', color: '#365561' }}>
                          <th style={{ padding: '0.75rem' }}>Order ID</th>
                          <th style={{ padding: '0.75rem' }}>Customer</th>
                          <th style={{ padding: '0.75rem' }}>Amount</th>
                          <th style={{ padding: '0.75rem' }}>Status</th>
                          <th style={{ padding: '0.75rem' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order._id} style={{ borderBottom: '1px solid #edf4f7' }}>
                            <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontWeight: 600, color: '#092330' }}>
                              #{order._id?.slice(-6).toUpperCase()}
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <div style={{ fontWeight: 600, color: '#092330' }}>
                                {order.user?.name || order.shippingAddress?.fullName || 'Valued Guest'}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#688c99' }}>
                                {order.user?.email || 'Direct Order'}
                              </div>
                            </td>
                            <td style={{ padding: '0.75rem', fontWeight: 700, color: '#092330' }}>
                              ₹{(order.totalPrice || 0).toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <span
                                style={{
                                  padding: '0.2rem 0.6rem',
                                  borderRadius: '999px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  background:
                                    order.status === 'Delivered'
                                      ? 'rgba(16, 185, 129, 0.15)'
                                      : order.status === 'Shipped'
                                      ? 'rgba(14, 116, 144, 0.15)'
                                      : order.status === 'Cancelled'
                                      ? 'rgba(239, 68, 68, 0.15)'
                                      : 'rgba(212, 175, 55, 0.2)',
                                  color:
                                    order.status === 'Delivered'
                                      ? '#047857'
                                      : order.status === 'Shipped'
                                      ? '#0e7490'
                                      : order.status === 'Cancelled'
                                      ? '#b91c1c'
                                      : '#997510',
                                }}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                style={{
                                  padding: '0.3rem 0.5rem',
                                  borderRadius: '6px',
                                  border: '1px solid #d4af37',
                                  background: '#fff',
                                  fontSize: '0.8rem',
                                  color: '#092330',
                                  cursor: 'pointer',
                                }}
                              >
                                <option value="Placed">Placed</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BOOKINGS & ORDERS */}
          {activeTab === 'bookings' && (
            <div>
              {/* Filter tabs */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  overflowX: 'auto',
                  paddingBottom: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                {['All', 'Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => {
                  const isActive = bookingFilter === status;
                  return (
                    <button
                      key={status}
                      onClick={() => setBookingFilter(status)}
                      style={{
                        padding: '0.45rem 1rem',
                        borderRadius: '999px',
                        border: '1px solid',
                        borderColor: isActive ? '#092330' : '#d5e3e8',
                        background: isActive ? '#092330' : '#ffffff',
                        color: isActive ? '#d4af37' : '#527482',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        boxShadow: isActive ? '0 2px 8px rgba(9, 35, 48, 0.2)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>

              {filteredOrders.length === 0 ? (
                <div
                  style={{
                    background: '#fff',
                    borderRadius: '0.75rem',
                    padding: '3rem 1.5rem',
                    textAlign: 'center',
                    border: '1px solid #dce8ec',
                  }}
                >
                  <CalendarCheck size={44} style={{ color: '#d4af37', margin: '0 auto 0.75rem' }} />
                  <h3 style={{ margin: '0 0 0.5rem', color: '#092330' }}>No bookings matching "{bookingFilter}"</h3>
                  <p style={{ color: '#688c99', margin: 0, fontSize: '0.9rem' }}>
                    Orders placed by customers will sync here automatically in real time.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filteredOrders.map((order) => (
                    <div
                      key={order._id}
                      style={{
                        background: '#ffffff',
                        borderRadius: '0.75rem',
                        padding: '1.25rem',
                        border: '1px solid #dce8ec',
                        boxShadow: '0 2px 8px rgba(9, 35, 48, 0.03)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '0.75rem',
                          borderBottom: '1px solid #edf4f7',
                          paddingBottom: '0.85rem',
                          marginBottom: '0.85rem',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#092330' }}>
                              Order #{order._id?.slice(-6).toUpperCase()}
                            </span>
                            <span
                              style={{
                                padding: '0.15rem 0.5rem',
                                borderRadius: '999px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                background:
                                  order.status === 'Delivered'
                                    ? 'rgba(16, 185, 129, 0.15)'
                                    : order.status === 'Shipped'
                                    ? 'rgba(14, 116, 144, 0.15)'
                                    : order.status === 'Cancelled'
                                    ? 'rgba(239, 68, 68, 0.15)'
                                    : 'rgba(212, 175, 55, 0.2)',
                                color:
                                  order.status === 'Delivered'
                                    ? '#047857'
                                    : order.status === 'Shipped'
                                    ? '#0e7490'
                                    : order.status === 'Cancelled'
                                    ? '#b91c1c'
                                    : '#997510',
                              }}
                            >
                              {order.status}
                            </span>
                            {order.isPaid ? (
                              <span style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 600 }}>• Paid</span>
                            ) : (
                              <span style={{ fontSize: '0.7rem', color: '#b91c1c', fontWeight: 600 }}>
                                • Payment Pending
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#688c99' }}>
                            Placed on{' '}
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        {/* Status Updater */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', color: '#527482', fontWeight: 500 }}>Update Status:</span>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                            style={{
                              padding: '0.4rem 0.65rem',
                              borderRadius: '6px',
                              border: '1px solid #d4af37',
                              background: '#fff',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color: '#092330',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="Placed">Placed</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Customer & Items details */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                          gap: '1rem',
                        }}
                      >
                        <div>
                          <p
                            style={{
                              margin: '0 0 0.25rem',
                              fontSize: '0.75rem',
                              color: '#688c99',
                              textTransform: 'uppercase',
                              fontWeight: 600,
                            }}
                          >
                            Customer Details
                          </p>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#092330' }}>
                            {order.user?.name || order.shippingAddress?.fullName || 'Guest Customer'}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: '#527482' }}>{order.user?.email || 'N/A'}</p>
                          {order.shippingAddress && (
                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#527482' }}>
                              📍 {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                              {order.shippingAddress.state} {order.shippingAddress.postalCode}
                            </p>
                          )}
                        </div>

                        <div>
                          <p
                            style={{
                              margin: '0 0 0.25rem',
                              fontSize: '0.75rem',
                              color: '#688c99',
                              textTransform: 'uppercase',
                              fontWeight: 600,
                            }}
                          >
                            Items Ordered ({order.orderItems?.length || 0})
                          </p>
                          {order.orderItems?.map((item: any, idx: number) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.85rem',
                                marginBottom: '0.2rem',
                                color: '#1a333f',
                              }}
                            >
                              <span>
                                {item.qty}x {item.name}
                              </span>
                              <span style={{ fontWeight: 600 }}>
                                ₹{(item.price * item.qty).toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                          <div
                            style={{
                              borderTop: '1px dashed #dce8ec',
                              paddingTop: '0.4rem',
                              marginTop: '0.4rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontWeight: 700,
                            }}
                          >
                            <span style={{ color: '#092330' }}>Total Amount:</span>
                            <span style={{ color: '#092330', fontSize: '1rem' }}>
                              ₹{(order.totalPrice || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COLLECTIONS (Products management) */}
          {activeTab === 'collections' && (
            <div>
              {isEditingProductView ? (
                /* FULL PAGE SAREE STUDIO (IN-PAGE VIEW - NO POPUPS) */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Studio Top Control Bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      background: '#ffffff',
                      padding: '1.1rem 1.5rem',
                      borderRadius: '0.75rem',
                      border: '1px solid #dce8ec',
                      boxShadow: '0 2px 10px rgba(9, 35, 48, 0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingProductView(false);
                          setEditingProduct(null);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          padding: '0.55rem 0.95rem',
                          borderRadius: '6px',
                          border: '1px solid #d4af37',
                          background: 'rgba(212, 175, 55, 0.08)',
                          color: '#092330',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <ArrowLeft size={16} style={{ color: '#d4af37' }} /> Back to Collections
                      </button>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              color: '#688c99',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}
                          >
                            Collections / {editingProduct ? 'Edit Saree' : 'New Saree'}
                          </span>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              background: editingProduct
                                ? 'rgba(14, 165, 233, 0.12)'
                                : 'rgba(16, 185, 129, 0.12)',
                              color: editingProduct ? '#0369a1' : '#047857',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              fontWeight: 700,
                            }}
                          >
                            {editingProduct ? 'Editing Live Piece' : 'Creating New Piece'}
                          </span>
                        </div>
                        <h2
                          style={{
                            margin: '0.2rem 0 0',
                            fontSize: '1.45rem',
                            fontFamily: 'Cormorant Garamond, serif',
                            fontWeight: 700,
                            color: '#092330',
                          }}
                        >
                          {editingProduct
                            ? `Edit Saree: ${productFormData.name || 'Untitled'}`
                            : 'Add New Saree to Live Collection'}
                        </h2>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditingProductView(false);
                          setEditingProduct(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleSaveProduct()}
                        disabled={savingProduct || uploadingImage}
                        style={{
                          background: 'linear-gradient(135deg, #092330 0%, #123747 100%)',
                          color: '#d4af37',
                          border: '1px solid #d4af37',
                          fontWeight: 600,
                          boxShadow: '0 4px 12px rgba(9, 35, 48, 0.2)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          padding: '0.55rem 1.25rem',
                        }}
                      >
                        {savingProduct ? (
                          <>
                            <RefreshCw size={15} className="animate-spin" /> Publishing...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={15} />{' '}
                            {editingProduct ? 'Update Saree Piece' : 'Publish Saree to Collection'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* 2-Column Responsive Studio Form Layout */}
                  <form
                    onSubmit={handleSaveProduct}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.4fr) minmax(320px, 0.95fr)',
                      gap: '1.5rem',
                      alignItems: 'start',
                    }}
                  >
                    {/* Left Column: Specifications & Heritage Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {/* Card 1: Identity & Categorization */}
                      <div
                        style={{
                          background: '#ffffff',
                          borderRadius: '0.75rem',
                          border: '1px solid #dce8ec',
                          padding: '1.5rem',
                          boxShadow: '0 2px 8px rgba(9, 35, 48, 0.03)',
                        }}
                      >
                        <h3
                          style={{
                            margin: '0 0 1rem',
                            fontSize: '1.1rem',
                            fontFamily: 'Cormorant Garamond, serif',
                            fontWeight: 700,
                            color: '#092330',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                          }}
                        >
                          <Sparkles size={16} style={{ color: '#d4af37' }} /> Saree Identity & Collection
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div>
                            <label
                              style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: '#092330',
                                marginBottom: '0.35rem',
                              }}
                            >
                              Saree Title / Piece Name *
                            </label>
                            <input
                              required
                              type="text"
                              placeholder="e.g. Royal Emerald Kanjivaram Heirloom"
                              value={productFormData.name}
                              onChange={(e) =>
                                setProductFormData({ ...productFormData, name: e.target.value })
                              }
                              style={{
                                width: '100%',
                                padding: '0.7rem 0.85rem',
                                borderRadius: '6px',
                                border: '1px solid #d4af37',
                                fontSize: '0.95rem',
                                color: '#092330',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                              }}
                            />
                          </div>

                          <div>
                            <label
                              style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: '#092330',
                                marginBottom: '0.35rem',
                              }}
                            >
                              Collection Category *
                            </label>
                            <select
                              value={productFormData.category}
                              onChange={(e) =>
                                setProductFormData({ ...productFormData, category: e.target.value })
                              }
                              style={{
                                width: '100%',
                                padding: '0.7rem 0.85rem',
                                borderRadius: '6px',
                                border: '1px solid #dce8ec',
                                fontSize: '0.9rem',
                                color: '#092330',
                                background: '#ffffff',
                              }}
                            >
                              <option value="Bridal & Heirloom Silks">Bridal & Heirloom Silks</option>
                              <option value="Royal Kanjivaram">Royal Kanjivaram</option>
                              <option value="Banarasi Heritage">Banarasi Heritage</option>
                              <option value="Chanderi Radiance">Chanderi Radiance</option>
                              <option value="Tussar & Raw Silk">Tussar & Raw Silk</option>
                              <option value="Contemporary Organza">Contemporary Organza</option>
                              <option value="Everyday Elegance">Everyday Elegance</option>
                              <option value="Festive">Festive</option>
                              <option value="Party Wear">Party Wear</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Card 2: Pricing & Inventory */}
                      <div
                        style={{
                          background: '#ffffff',
                          borderRadius: '0.75rem',
                          border: '1px solid #dce8ec',
                          padding: '1.5rem',
                          boxShadow: '0 2px 8px rgba(9, 35, 48, 0.03)',
                        }}
                      >
                        <h3
                          style={{
                            margin: '0 0 1rem',
                            fontSize: '1.1rem',
                            fontFamily: 'Cormorant Garamond, serif',
                            fontWeight: 700,
                            color: '#092330',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                          }}
                        >
                          <IndianRupee size={16} style={{ color: '#d4af37' }} /> Pricing & Live Stock
                        </h3>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                            gap: '1rem',
                            marginBottom: '1rem',
                          }}
                        >
                          <div>
                            <label
                              style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: '#092330',
                                marginBottom: '0.35rem',
                              }}
                            >
                              Selling Price (₹) *
                            </label>
                            <input
                              required
                              type="number"
                              min="0"
                              placeholder="32000"
                              value={productFormData.price}
                              onChange={(e) =>
                                setProductFormData({ ...productFormData, price: Number(e.target.value) })
                              }
                              style={{
                                width: '100%',
                                padding: '0.7rem 0.85rem',
                                borderRadius: '6px',
                                border: '1px solid #dce8ec',
                                fontSize: '0.95rem',
                                color: '#092330',
                                fontWeight: 600,
                              }}
                            />
                          </div>

                          <div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '0.35rem',
                              }}
                            >
                              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#092330' }}>
                                Original / MRP Price (₹)
                              </label>
                              {productFormData.originalPrice > productFormData.price &&
                                productFormData.price > 0 && (
                                  <span
                                    style={{
                                      fontSize: '0.72rem',
                                      color: '#16a34a',
                                      fontWeight: 700,
                                      background: '#dcfce7',
                                      padding: '0.1rem 0.45rem',
                                      borderRadius: '4px',
                                    }}
                                  >
                                    {Math.round(
                                      ((productFormData.originalPrice - productFormData.price) /
                                        productFormData.originalPrice) *
                                        100
                                    )}
                                    % OFF
                                  </span>
                                )}
                            </div>
                            <input
                              type="number"
                              min="0"
                              placeholder="38000"
                              value={productFormData.originalPrice}
                              onChange={(e) =>
                                setProductFormData({
                                  ...productFormData,
                                  originalPrice: Number(e.target.value),
                                })
                              }
                              style={{
                                width: '100%',
                                padding: '0.7rem 0.85rem',
                                borderRadius: '6px',
                                border: '1px solid #dce8ec',
                                fontSize: '0.95rem',
                                color: '#092330',
                              }}
                            />
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                            gap: '1rem',
                          }}
                        >
                          <div>
                            <label
                              style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: '#092330',
                                marginBottom: '0.35rem',
                              }}
                            >
                              Count in Stock
                            </label>
                            <input
                              type="number"
                              min="0"
                              placeholder="5"
                              value={productFormData.countInStock}
                              onChange={(e) =>
                                setProductFormData({
                                  ...productFormData,
                                  countInStock: Number(e.target.value),
                                })
                              }
                              style={{
                                width: '100%',
                                padding: '0.7rem 0.85rem',
                                borderRadius: '6px',
                                border: '1px solid #dce8ec',
                                fontSize: '0.9rem',
                                color: '#092330',
                              }}
                            />
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                            }}
                          >
                            <label
                              style={{
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: '#092330',
                                marginBottom: '0.5rem',
                              }}
                            >
                              Inventory Status
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  padding: '0.45rem 0.85rem',
                                  borderRadius: '6px',
                                  fontSize: '0.82rem',
                                  fontWeight: 600,
                                  background:
                                    (productFormData.countInStock || 0) > 0 ? '#ecfdf5' : '#fef2f2',
                                  color:
                                    (productFormData.countInStock || 0) > 0 ? '#047857' : '#dc2626',
                                  border: '1px solid',
                                  borderColor:
                                    (productFormData.countInStock || 0) > 0 ? '#a7f3d0' : '#fecaca',
                                }}
                              >
                                <span
                                  style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background:
                                      (productFormData.countInStock || 0) > 0 ? '#10b981' : '#ef4444',
                                  }}
                                ></span>
                                {(productFormData.countInStock || 0) > 0
                                  ? 'In Stock (Live)'
                                  : 'Out of Stock'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card 3: Fabric & Weave Specifications */}
                      <div
                        style={{
                          background: '#ffffff',
                          borderRadius: '0.75rem',
                          border: '1px solid #dce8ec',
                          padding: '1.5rem',
                          boxShadow: '0 2px 8px rgba(9, 35, 48, 0.03)',
                        }}
                      >
                        <h3
                          style={{
                            margin: '0 0 1rem',
                            fontSize: '1.1rem',
                            fontFamily: 'Cormorant Garamond, serif',
                            fontWeight: 700,
                            color: '#092330',
                          }}
                        >
                          Weave & Material Craft
                        </h3>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                            gap: '1rem',
                            marginBottom: '1rem',
                          }}
                        >
                          <div>
                            <label
                              style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: '#092330',
                                marginBottom: '0.35rem',
                              }}
                            >
                              Fabric Type
                            </label>
                            <input
                              type="text"
                              placeholder="Pure Mulberry Silk"
                              value={productFormData.fabric}
                              onChange={(e) =>
                                setProductFormData({ ...productFormData, fabric: e.target.value })
                              }
                              style={{
                                width: '100%',
                                padding: '0.7rem 0.85rem',
                                borderRadius: '6px',
                                border: '1px solid #dce8ec',
                                fontSize: '0.9rem',
                                color: '#092330',
                              }}
                            />
                          </div>

                          <div>
                            <label
                              style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: '#092330',
                                marginBottom: '0.35rem',
                              }}
                            >
                              Primary Drape Color
                            </label>
                            <input
                              type="text"
                              placeholder="Crimson Vermillion"
                              value={productFormData.color}
                              onChange={(e) =>
                                setProductFormData({ ...productFormData, color: e.target.value })
                              }
                              style={{
                                width: '100%',
                                padding: '0.7rem 0.85rem',
                                borderRadius: '6px',
                                border: '1px solid #dce8ec',
                                fontSize: '0.9rem',
                                color: '#092330',
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color: '#092330',
                              marginBottom: '0.35rem',
                            }}
                          >
                            Border & Zari Detailing
                          </label>
                          <input
                            type="text"
                            placeholder="Royal Antique Gold Zari with Temple Motifs"
                            value={productFormData.border}
                            onChange={(e) =>
                              setProductFormData({ ...productFormData, border: e.target.value })
                            }
                            style={{
                              width: '100%',
                              padding: '0.7rem 0.85rem',
                              borderRadius: '6px',
                              border: '1px solid #dce8ec',
                              fontSize: '0.9rem',
                              color: '#092330',
                            }}
                          />
                        </div>
                      </div>

                      {/* Card 4: Heritage Story & Description */}
                      <div
                        style={{
                          background: '#ffffff',
                          borderRadius: '0.75rem',
                          border: '1px solid #dce8ec',
                          padding: '1.5rem',
                          boxShadow: '0 2px 8px rgba(9, 35, 48, 0.03)',
                        }}
                      >
                        <h3
                          style={{
                            margin: '0 0 1rem',
                            fontSize: '1.1rem',
                            fontFamily: 'Cormorant Garamond, serif',
                            fontWeight: 700,
                            color: '#092330',
                          }}
                        >
                          Heritage Story & Craftsmanship *
                        </h3>
                        <textarea
                          required
                          rows={4}
                          placeholder="Exquisitely hand-woven pure silk drape adorned with royal antique gold zari detailing. Inspired by timeless temple aesthetics and handcrafted for celebratory grandeur…"
                          value={productFormData.detail}
                          onChange={(e) =>
                            setProductFormData({ ...productFormData, detail: e.target.value })
                          }
                          style={{
                            width: '100%',
                            padding: '0.75rem 0.85rem',
                            borderRadius: '6px',
                            border: '1px solid #dce8ec',
                            fontSize: '0.9rem',
                            color: '#092330',
                            lineHeight: '1.5',
                          }}
                        />

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            marginTop: '1.25rem',
                            padding: '0.85rem 1rem',
                            borderRadius: '8px',
                            background: 'rgba(212, 175, 55, 0.08)',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                          }}
                        >
                          <input
                            type="checkbox"
                            id="studioFeaturedCheck"
                            checked={productFormData.isFeatured}
                            onChange={(e) =>
                              setProductFormData({
                                ...productFormData,
                                isFeatured: e.target.checked,
                              })
                            }
                            style={{
                              width: '18px',
                              height: '18px',
                              cursor: 'pointer',
                              accentColor: '#d4af37',
                            }}
                          />
                          <label
                            htmlFor="studioFeaturedCheck"
                            style={{
                              fontSize: '0.88rem',
                              fontWeight: 600,
                              color: '#092330',
                              cursor: 'pointer',
                            }}
                          >
                            ★ Feature this saree on homepage spotlight & showcase carousels
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Media Manager & Real-Time 3:4 Portrait Preview */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem',
                        position: isMobile ? 'static' : 'sticky',
                        top: '1rem',
                      }}
                    >
                      {/* Media Uploader Card */}
                      <div
                        style={{
                          background: '#ffffff',
                          borderRadius: '0.75rem',
                          border: '1px solid #dce8ec',
                          padding: '1.5rem',
                          boxShadow: '0 2px 8px rgba(9, 35, 48, 0.03)',
                        }}
                      >
                        <h3
                          style={{
                            margin: '0 0 1rem',
                            fontSize: '1.1rem',
                            fontFamily: 'Cormorant Garamond, serif',
                            fontWeight: 700,
                            color: '#092330',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                          }}
                        >
                          <UploadCloud size={17} style={{ color: '#d4af37' }} /> Saree Photography
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                          <input
                            type="file"
                            id="studio-saree-image-picker"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleImageFileChange}
                          />

                          <button
                            type="button"
                            disabled={uploadingImage}
                            onClick={() =>
                              document.getElementById('studio-saree-image-picker')?.click()
                            }
                            style={{
                              width: '100%',
                              padding: '0.75rem 1rem',
                              borderRadius: '8px',
                              border: '1px dashed #d4af37',
                              background: 'rgba(212, 175, 55, 0.08)',
                              color: '#092330',
                              fontSize: '0.88rem',
                              fontWeight: 600,
                              cursor: uploadingImage ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {uploadingImage ? (
                              <>
                                <RefreshCw
                                  size={16}
                                  className="animate-spin"
                                  style={{ color: '#d4af37' }}
                                />{' '}
                                Uploading to Cloudinary...
                              </>
                            ) : (
                              <>📁 Choose Photo & Upload to Cloudinary</>
                            )}
                          </button>

                          <div>
                            <label
                              style={{
                                display: 'block',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: '#688c99',
                                marginBottom: '0.35rem',
                              }}
                            >
                              Or paste direct Image URL / Cloudinary link:
                            </label>
                            <input
                              required
                              type="text"
                              placeholder="https://res.cloudinary.com/... or https://images.unsplash.com/..."
                              value={productFormData.image}
                              onChange={(e) =>
                                setProductFormData({ ...productFormData, image: e.target.value })
                              }
                              style={{
                                width: '100%',
                                padding: '0.65rem',
                                borderRadius: '6px',
                                border: '1px solid #dce8ec',
                                fontSize: '0.82rem',
                                color: '#092330',
                              }}
                            />
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontWeight: 600,
                                background: productFormData.image?.includes('cloudinary.com')
                                  ? '#ecfdf5'
                                  : '#f8fafc',
                                color: productFormData.image?.includes('cloudinary.com')
                                  ? '#047857'
                                  : '#527482',
                                border: '1px solid #dce8ec',
                              }}
                            >
                              {productFormData.image?.includes('cloudinary.com')
                                ? '☁️ Cloudinary Live Asset'
                                : '🔗 Web / Local Image'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#688c99' }}>
                              Aspect ratio: 3:4 portrait
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Live 3:4 Portrait Preview Card */}
                      <div
                        style={{
                          background: '#ffffff',
                          borderRadius: '0.75rem',
                          border: '1px solid #dce8ec',
                          padding: '1.25rem',
                          boxShadow: '0 4px 16px rgba(9, 35, 48, 0.06)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '0.75rem',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: '#092330',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}
                          >
                            Live Storefront Preview
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
                            ● Real-time render
                          </span>
                        </div>

                        {/* Exact 3:4 Saree Card replica */}
                        <div
                          style={{
                            background: '#ffffff',
                            borderRadius: '0.75rem',
                            overflow: 'hidden',
                            border: '1px solid #d4af37',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                          }}
                        >
                          <div
                            style={{
                              position: 'relative',
                              width: '100%',
                              aspectRatio: '3 / 4',
                              background:
                                'radial-gradient(circle at center, #0a2736 0%, #061821 100%)',
                              overflow: 'hidden',
                            }}
                          >
                            <img
                              src={productFormData.image || ivorySaree}
                              alt={productFormData.name || 'Saree Preview'}
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = ivorySaree;
                              }}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'center 0%',
                                display: 'block',
                              }}
                            />
                            {productFormData.isFeatured && (
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '10px',
                                  left: '10px',
                                  background: '#d4af37',
                                  color: '#061821',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '4px',
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                                }}
                              >
                                ★ Featured
                              </span>
                            )}
                            <span
                              style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background:
                                  (productFormData.countInStock || 0) > 0
                                    ? 'rgba(16, 185, 129, 0.92)'
                                    : 'rgba(239, 68, 68, 0.92)',
                                color: '#fff',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                              }}
                            >
                              {(productFormData.countInStock || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>

                          <div style={{ padding: '1rem' }}>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: '#688c99',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                              }}
                            >
                              {productFormData.category}
                            </span>
                            <h4
                              style={{
                                margin: '0.25rem 0 0.4rem',
                                fontSize: '1.15rem',
                                fontFamily: 'Cormorant Garamond, serif',
                                fontWeight: 700,
                                color: '#092330',
                              }}
                            >
                              {productFormData.name || 'Untitled Saree Piece'}
                            </h4>
                            <p
                              style={{
                                margin: '0 0 0.75rem',
                                fontSize: '0.8rem',
                                color: '#527482',
                                lineHeight: '1.4',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {productFormData.detail ||
                                'Handcrafted luxury drape with rich artisanal storytelling…'}
                            </p>

                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: '0.5rem',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '1.2rem',
                                  fontWeight: 700,
                                  color: '#092330',
                                }}
                              >
                                ₹{(productFormData.price || 0).toLocaleString('en-IN')}
                              </span>
                              {productFormData.originalPrice > productFormData.price && (
                                <span
                                  style={{
                                    fontSize: '0.85rem',
                                    color: '#93b6c2',
                                    textDecoration: 'line-through',
                                  }}
                                >
                                  ₹{productFormData.originalPrice.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Actions inside Right Column */}
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.75rem',
                          marginTop: '0.5rem',
                        }}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          style={{ flex: 1 }}
                          onClick={() => {
                            setIsEditingProductView(false);
                            setEditingProduct(null);
                          }}
                        >
                          Cancel & Return
                        </Button>
                        <Button
                          type="submit"
                          disabled={savingProduct || uploadingImage}
                          style={{
                            flex: 1.5,
                            background: 'linear-gradient(135deg, #092330 0%, #123747 100%)',
                            color: '#d4af37',
                            border: '1px solid #d4af37',
                            fontWeight: 600,
                            boxShadow: '0 4px 12px rgba(9, 35, 48, 0.2)',
                          }}
                        >
                          {savingProduct
                            ? 'Publishing…'
                            : editingProduct
                            ? 'Save Saree'
                            : 'Publish Saree'}
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                /* COLLECTIONS GRID VIEW */
                <div>
                  {/* Header with Search and Add Saree button */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div
                      style={{
                        position: 'relative',
                        flex: '1',
                        minWidth: '240px',
                        maxWidth: '400px',
                      }}
                    >
                      <Search
                        size={16}
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#688c99',
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Search sarees by name, category, fabric…"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                          borderRadius: '0.5rem',
                          border: '1px solid #dce8ec',
                          background: '#fff',
                          fontSize: '0.85rem',
                          color: '#092330',
                        }}
                      />
                    </div>

                    <Button
                      onClick={() => {
                        setEditingProduct(null);
                        resetProductForm();
                        setIsEditingProductView(true);
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #092330 0%, #123747 100%)',
                        color: '#d4af37',
                        border: '1px solid #d4af37',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        boxShadow: '0 4px 12px rgba(9, 35, 48, 0.2)',
                      }}
                    >
                      <Plus size={16} /> Add New Saree
                    </Button>
                  </div>

                  {/* Collections Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: '1.25rem',
                    }}
                  >
                {filteredProducts.map((p) => (
                  <div
                    key={p.id || p._id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                      border: '1px solid #dce8ec',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 2px 8px rgba(9, 35, 48, 0.04)',
                    }}
                  >
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '3 / 4',
                        background: 'radial-gradient(circle at center, #0a2736 0%, #061821 100%)',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={
                          p.image ||
                          p.images?.[0] ||
                          fallbackSareeImages[p.slug] ||
                          ivorySaree
                        }
                        alt={p.name}
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          const fallback = fallbackSareeImages[p.slug] || ivorySaree;
                          if (target.src !== fallback) {
                            target.src = fallback;
                          }
                        }}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: p.slug === 'emerald' ? '74% 0%' : 'center 0%',
                          display: 'block',
                        }}
                      />
                      {p.isFeatured && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            background: '#d4af37',
                            color: '#061821',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                          }}
                        >
                          ★ Featured
                        </span>
                      )}
                      <span
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: p.inStock ? 'rgba(16, 185, 129, 0.92)' : 'rgba(239, 68, 68, 0.92)',
                          color: '#fff',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                        }}
                      >
                        {p.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: '#688c99',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {p.category}
                      </span>
                      <h4
                        style={{
                          margin: '0.25rem 0 0.5rem',
                          fontSize: '1.1rem',
                          fontFamily: 'Cormorant Garamond, serif',
                          fontWeight: 700,
                          color: '#092330',
                        }}
                      >
                        {p.name}
                      </h4>
                      <p
                        style={{
                          margin: '0 0 0.75rem',
                          fontSize: '0.8rem',
                          color: '#527482',
                          lineHeight: '1.4',
                          flex: 1,
                        }}
                      >
                        {p.detail?.slice(0, 90)}…
                      </p>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#092330' }}>
                          ₹{(p.price || 0).toLocaleString('en-IN')}
                        </span>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <span style={{ fontSize: '0.85rem', color: '#93b6c2', textDecoration: 'line-through' }}>
                            ₹{p.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          borderTop: '1px solid #edf4f7',
                          paddingTop: '0.75rem',
                        }}
                      >
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setProductFormData({
                              name: p.name || '',
                              category: p.category || 'Bridal & Heirloom Silks',
                              price: p.price || 0,
                              originalPrice: p.originalPrice || 0,
                              fabric: p.fabric || '',
                              color: p.color || '',
                              border: p.border || '',
                              countInStock: p.countInStock || 5,
                              isFeatured: Boolean(p.isFeatured),
                              image: p.image || p.images?.[0] || '',
                              detail: p.detail || p.description || '',
                            });
                            setIsEditingProductView(true);
                          }}
                          style={{
                            flex: 1,
                            padding: '0.45rem',
                            borderRadius: '6px',
                            border: '1px solid #d4af37',
                            background: 'rgba(212, 175, 55, 0.08)',
                            color: '#092330',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <Edit size={13} style={{ color: '#d4af37' }} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id || p._id)}
                          style={{
                            padding: '0.45rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            background: 'rgba(239, 68, 68, 0.06)',
                            color: '#dc2626',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Delete Saree"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

          {/* TAB 4: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div>
              <div style={{ marginBottom: '1.25rem', maxWidth: '400px', position: 'relative' }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#688c99',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search customer by name, email, or phone…"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #dce8ec',
                    background: '#fff',
                    fontSize: '0.85rem',
                    color: '#092330',
                  }}
                />
              </div>

              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '0.75rem',
                  border: '1px solid #dce8ec',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(9, 35, 48, 0.03)',
                }}
              >
                <div style={{ overflowX: 'auto' }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '0.85rem',
                      textAlign: 'left',
                    }}
                  >
                    <thead>
                      <tr style={{ background: '#f0f6f8', borderBottom: '1px solid #dce8ec', color: '#365561' }}>
                        <th style={{ padding: '0.85rem 1rem' }}>Customer Name</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Contact Info</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Role</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Joined Date</th>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((c) => {
                        const isSelf = c.email === user?.email;
                        return (
                          <tr key={c.id || c._id} style={{ borderBottom: '1px solid #edf4f7' }}>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ fontWeight: 600, color: '#092330' }}>{c.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#688c99' }}>
                                ID: {(c.id || c._id)?.slice(-8)}
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ color: '#092330' }}>{c.email}</div>
                              <div style={{ fontSize: '0.75rem', color: '#527482' }}>
                                {c.phone || 'No phone provided'}
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <span
                                style={{
                                  padding: '0.2rem 0.6rem',
                                  borderRadius: '999px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  background: c.role === 'admin' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(9, 35, 48, 0.08)',
                                  color: c.role === 'admin' ? '#997510' : '#4a6d7c',
                                  border: c.role === 'admin' ? '1px solid rgba(212, 175, 55, 0.4)' : 'none',
                                }}
                              >
                                {c.role === 'admin' ? '👑 Admin' : 'Customer'}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 1rem', color: '#527482' }}>
                              {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                            </td>
                            <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                              {!isSelf && (
                                <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                                  <button
                                    onClick={() => handleToggleUserRole(c.id || c._id, c.role)}
                                    title="Toggle Role"
                                    style={{
                                      padding: '0.35rem 0.65rem',
                                      borderRadius: '6px',
                                      border: '1px solid #dce8ec',
                                      background: '#f8fafb',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      color: '#092330',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    {c.role === 'admin' ? 'Make Customer' : 'Make Admin'}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(c.id || c._id)}
                                    title="Delete Customer"
                                    style={{
                                      padding: '0.35rem 0.5rem',
                                      borderRadius: '6px',
                                      border: '1px solid rgba(239, 68, 68, 0.3)',
                                      background: 'rgba(239, 68, 68, 0.08)',
                                      color: '#dc2626',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              )}
                              {isSelf && (
                                <span style={{ fontSize: '0.75rem', color: '#d4af37', fontWeight: 600 }}>
                                  Active Session
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CUSTOMER INQUIRIES & CONCIERGE */}
          {activeTab === 'inquiries' && (
            <div>
              {/* Header with live sync indicator */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '0.75rem',
                  padding: '1.25rem 1.5rem',
                  border: '1px solid #dce8ec',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  boxShadow: '0 2px 8px rgba(9, 35, 48, 0.03)',
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: '0 0 0.35rem',
                      fontSize: '1.35rem',
                      fontFamily: 'Cormorant Garamond, serif',
                      color: '#092330',
                      fontWeight: 700,
                    }}
                  >
                    Customer Inquiries & Concierge Desk
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#527482' }}>
                    Messages submitted from the Contact Us page and saree consultation requests sync here in real time.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#047857',
                      background: 'rgba(16, 185, 129, 0.12)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '999px',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#10b981',
                        display: 'inline-block',
                      }}
                    />
                    Live Sync Active
                  </span>
                  <button
                    onClick={fetchAllData}
                    disabled={refreshing}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: '#f8fafb',
                      border: '1px solid #dce8ec',
                      borderRadius: '0.5rem',
                      padding: '0.45rem 0.85rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#092330',
                      cursor: 'pointer',
                    }}
                  >
                    <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Filter tabs & Search Bar */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                }}
              >
                {/* Status Filter Pills */}
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                  {[
                    { id: 'All', label: 'All Inquiries', count: inquiries.length },
                    { id: 'New', label: 'New', count: inquiries.filter((i) => i.status === 'New').length },
                    { id: 'In Review', label: 'In Review', count: inquiries.filter((i) => i.status === 'In Review').length },
                    { id: 'Answered', label: 'Answered', count: inquiries.filter((i) => i.status === 'Answered').length },
                    { id: 'Archived', label: 'Archived', count: inquiries.filter((i) => i.status === 'Archived').length },
                  ].map((filter) => {
                    const isActive = inquiryFilter === filter.id;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => setInquiryFilter(filter.id)}
                        style={{
                          padding: '0.45rem 0.95rem',
                          borderRadius: '999px',
                          border: '1px solid',
                          borderColor: isActive ? '#092330' : '#d5e3e8',
                          background: isActive ? '#092330' : '#ffffff',
                          color: isActive ? '#d4af37' : '#527482',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          transition: 'all 0.15s ease',
                          boxShadow: isActive ? '0 2px 8px rgba(9, 35, 48, 0.2)' : 'none',
                        }}
                      >
                        <span>{filter.label}</span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '999px',
                            background: isActive ? '#d4af37' : 'rgba(9, 35, 48, 0.08)',
                            color: isActive ? '#092330' : '#527482',
                            fontWeight: 700,
                          }}
                        >
                          {filter.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Search input */}
                <div style={{ position: 'relative', minWidth: '280px', flex: '1 1 300px', maxWidth: '420px' }}>
                  <Search
                    size={16}
                    style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#88a3ad' }}
                  />
                  <input
                    type="text"
                    placeholder="Search by client, phone, email, subject..."
                    value={inquirySearch}
                    onChange={(e) => setInquirySearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 1rem 0.5rem 2.35rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #dce8ec',
                      background: '#ffffff',
                      fontSize: '0.85rem',
                      color: '#092330',
                      outline: 'none',
                    }}
                  />
                  {inquirySearch && (
                    <button
                      onClick={() => setInquirySearch('')}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#88a3ad',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Inquiry cards list */}
              {filteredInquiries.length === 0 ? (
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '0.75rem',
                    padding: '3.5rem 1.5rem',
                    textAlign: 'center',
                    border: '1px solid #dce8ec',
                  }}
                >
                  <MessageSquare size={48} style={{ color: '#d4af37', margin: '0 auto 0.85rem', opacity: 0.8 }} />
                  <h3 style={{ margin: '0 0 0.5rem', color: '#092330', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem' }}>
                    No Inquiries Found
                  </h3>
                  <p style={{ color: '#688c99', margin: '0 auto 1.25rem', fontSize: '0.9rem', maxWidth: '460px' }}>
                    {inquirySearch
                      ? `No inquiries match your search term "${inquirySearch}". Try adjusting your keywords.`
                      : `There are currently no customer inquiries under the "${inquiryFilter}" status filter.`}
                  </p>
                  {(inquiryFilter !== 'All' || inquirySearch) && (
                    <button
                      onClick={() => {
                        setInquiryFilter('All');
                        setInquirySearch('');
                      }}
                      style={{
                        padding: '0.5rem 1.25rem',
                        borderRadius: '0.5rem',
                        background: '#092330',
                        color: '#d4af37',
                        border: '1px solid #d4af37',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {filteredInquiries.map((inq: any) => {
                    const statusColors: Record<string, { bg: string; color: string; border: string }> = {
                      New: { bg: 'rgba(245, 158, 11, 0.12)', color: '#b45309', border: 'rgba(245, 158, 11, 0.35)' },
                      'In Review': { bg: 'rgba(59, 130, 246, 0.12)', color: '#1d4ed8', border: 'rgba(59, 130, 246, 0.35)' },
                      Answered: { bg: 'rgba(16, 185, 129, 0.12)', color: '#047857', border: 'rgba(16, 185, 129, 0.35)' },
                      Archived: { bg: 'rgba(100, 116, 139, 0.12)', color: '#475569', border: 'rgba(100, 116, 139, 0.35)' },
                    };
                    const statusStyle = statusColors[inq.status] || statusColors.New;

                    const cleanPhone = (inq.phone || '').replace(/[^0-9]/g, '');
                    const waText = encodeURIComponent(
                      `Hello ${inq.name}, Greetings from Bamas Collection! Thank you for reaching out regarding "${inq.subject || inq.sareeInterest || 'your silk saree inquiry'}". How can our concierge assist you today?`
                    );
                    const waUrl = cleanPhone
                      ? `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${waText}`
                      : `https://wa.me/919876543210?text=${waText}`;

                    const mailSubject = encodeURIComponent(`Bamas Collection Concierge - Regarding: ${inq.subject || 'Your Saree Inquiry'}`);
                    const mailBody = encodeURIComponent(
                      `Dear ${inq.name},\n\nThank you for reaching out to Bamas Collection.\n\nRegarding your inquiry:\n"${inq.message}"\n\nOur team is delighted to assist you with our pure mulberry silk sarees.\n\nWarm regards,\nBamas Collection Concierge Desk`
                    );
                    const mailUrl = `mailto:${inq.email}?subject=${mailSubject}&body=${mailBody}`;

                    return (
                      <div
                        key={inq._id}
                        style={{
                          background: '#ffffff',
                          borderRadius: '0.75rem',
                          border: '1px solid #dce8ec',
                          borderLeft: '4px solid #d4af37',
                          padding: '1.5rem',
                          boxShadow: '0 2px 10px rgba(9, 35, 48, 0.04)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1rem',
                        }}
                      >
                        {/* Header: Name, Date, Status pill, and Delete */}
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                            borderBottom: '1px solid #f1f5f7',
                            paddingBottom: '0.85rem',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                              <h3
                                style={{
                                  margin: 0,
                                  fontSize: '1.2rem',
                                  fontFamily: 'Cormorant Garamond, serif',
                                  color: '#092330',
                                  fontWeight: 700,
                                }}
                              >
                                {inq.name}
                              </h3>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '0.2rem 0.65rem',
                                  borderRadius: '999px',
                                  background: statusStyle.bg,
                                  color: statusStyle.color,
                                  border: `1px solid ${statusStyle.border}`,
                                  fontWeight: 700,
                                  letterSpacing: '0.3px',
                                  textTransform: 'uppercase',
                                }}
                              >
                                {inq.status}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#688c99', marginTop: '0.2rem', display: 'block' }}>
                              Received{' '}
                              {inq.createdAt
                                ? new Date(inq.createdAt).toLocaleString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'Recently'}
                            </span>
                          </div>

                          {/* Status changer & Delete button */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <label style={{ fontSize: '0.75rem', color: '#527482', fontWeight: 600 }}>Status:</label>
                              <select
                                value={inq.status}
                                onChange={(e) => handleUpdateInquiryStatus(inq._id, e.target.value)}
                                style={{
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  color: '#092330',
                                  background: '#f8fafb',
                                  border: '1px solid #dce8ec',
                                  borderRadius: '0.35rem',
                                  padding: '0.35rem 0.65rem',
                                  outline: 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                <option value="New">New</option>
                                <option value="In Review">In Review</option>
                                <option value="Answered">Answered</option>
                                <option value="Archived">Archived</option>
                              </select>
                            </div>

                            <button
                              onClick={() => handleDeleteInquiry(inq._id)}
                              title="Delete inquiry"
                              style={{
                                background: 'transparent',
                                border: '1px solid #fee2e2',
                                color: '#ef4444',
                                borderRadius: '0.35rem',
                                padding: '0.35rem 0.5rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Contact details & Subject row */}
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.75rem',
                            alignItems: 'center',
                            fontSize: '0.82rem',
                          }}
                        >
                          <a
                            href={`mailto:${inq.email}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              color: '#0e7490',
                              background: 'rgba(14, 116, 144, 0.08)',
                              padding: '0.3rem 0.65rem',
                              borderRadius: '0.35rem',
                              textDecoration: 'none',
                              fontWeight: 500,
                            }}
                          >
                            <Mail size={13} />
                            {inq.email}
                          </a>

                          {inq.phone && (
                            <a
                              href={`tel:${inq.phone}`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                color: '#047857',
                                background: 'rgba(16, 185, 129, 0.08)',
                                padding: '0.3rem 0.65rem',
                                borderRadius: '0.35rem',
                                textDecoration: 'none',
                                fontWeight: 500,
                              }}
                            >
                              <Phone size={13} />
                              {inq.phone}
                            </a>
                          )}

                          {inq.sareeInterest && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                color: '#92400e',
                                background: 'rgba(217, 119, 6, 0.1)',
                                padding: '0.3rem 0.65rem',
                                borderRadius: '0.35rem',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                              }}
                            >
                              <ShoppingBag size={13} />
                              Interest: {inq.sareeInterest}
                            </span>
                          )}

                          {inq.subject && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                color: '#092330',
                                fontWeight: 600,
                                fontSize: '0.82rem',
                              }}
                            >
                              <span style={{ color: '#d4af37' }}>●</span> Subject: {inq.subject}
                            </span>
                          )}
                        </div>

                        {/* Customer Message Block */}
                        <div
                          style={{
                            background: '#faf8f5',
                            borderLeft: '3px solid #d4af37',
                            borderRadius: '0 0.5rem 0.5rem 0',
                            padding: '1rem 1.25rem',
                            fontSize: '0.88rem',
                            lineHeight: 1.6,
                            color: '#1a3340',
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {inq.message}
                        </div>

                        {/* Quick Response Concierge Action Bar */}
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.65rem',
                            alignItems: 'center',
                            paddingTop: '0.5rem',
                          }}
                        >
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.45rem',
                              background: '#25D366',
                              color: '#ffffff',
                              padding: '0.5rem 1rem',
                              borderRadius: '0.45rem',
                              textDecoration: 'none',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)',
                              transition: 'transform 0.15s ease',
                            }}
                          >
                            <span>💬</span>
                            Chat on WhatsApp
                          </a>

                          <a
                            href={mailUrl}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.45rem',
                              background: '#092330',
                              color: '#d4af37',
                              padding: '0.5rem 1rem',
                              borderRadius: '0.45rem',
                              textDecoration: 'none',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              border: '1px solid #d4af37',
                              transition: 'transform 0.15s ease',
                            }}
                          >
                            <Mail size={14} />
                            Reply via Email
                          </a>

                          {inq.status !== 'Answered' && (
                            <button
                              onClick={() => handleUpdateInquiryStatus(inq._id, 'Answered')}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                background: '#f0fdf4',
                                color: '#166534',
                                border: '1px solid #bbf7d0',
                                padding: '0.5rem 0.85rem',
                                borderRadius: '0.45rem',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              <CheckCircle size={14} />
                              Mark Answered
                            </button>
                          )}

                          {inq.status !== 'Archived' && (
                            <button
                              onClick={() => handleUpdateInquiryStatus(inq._id, 'Archived')}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                background: '#f8fafc',
                                color: '#64748b',
                                border: '1px solid #e2e8f0',
                                padding: '0.5rem 0.85rem',
                                borderRadius: '0.45rem',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Archive
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SETTINGS (Brand & Site Configuration) */}
          {activeTab === 'settings' && (
            <div style={{ maxWidth: '800px' }}>
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '0.75rem',
                  padding: '1.75rem',
                  border: '1px solid #dce8ec',
                  boxShadow: '0 2px 10px rgba(9, 35, 48, 0.04)',
                }}
              >
                <h3
                  style={{
                    margin: '0 0 0.5rem',
                    fontSize: '1.35rem',
                    fontFamily: 'Cormorant Garamond, serif',
                    fontWeight: 700,
                    color: '#092330',
                  }}
                >
                  Storefront Branding & Configuration
                </h3>
                <p style={{ color: '#527482', fontSize: '0.85rem', margin: '0 0 1.5rem' }}>
                  Update store title, hero banner, logo image, and customer support contact details saved in MongoDB
                  Atlas.
                </p>

                <form
                  onSubmit={handleSaveSiteConfig}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#092330',
                          marginBottom: '0.35rem',
                        }}
                      >
                        Brand Name
                      </label>
                      <input
                        type="text"
                        value={siteConfig.brandName || ''}
                        onChange={(e) => setSiteConfig({ ...siteConfig, brandName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.6rem',
                          borderRadius: '6px',
                          border: '1px solid #d4af37',
                          fontSize: '0.9rem',
                          color: '#092330',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#092330',
                          marginBottom: '0.35rem',
                        }}
                      >
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={siteConfig.tagline || ''}
                        onChange={(e) => setSiteConfig({ ...siteConfig, tagline: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.6rem',
                          borderRadius: '6px',
                          border: '1px solid #dce8ec',
                          fontSize: '0.9rem',
                          color: '#092330',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#092330',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Hero Heading Text
                    </label>
                    <input
                      type="text"
                      value={siteConfig.heroHeading || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, heroHeading: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        borderRadius: '6px',
                        border: '1px solid #dce8ec',
                        fontSize: '0.9rem',
                        color: '#092330',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#092330',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Hero Subheading Text
                    </label>
                    <textarea
                      rows={2}
                      value={siteConfig.heroSubheading || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, heroSubheading: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        borderRadius: '6px',
                        border: '1px solid #dce8ec',
                        fontSize: '0.9rem',
                        color: '#092330',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#092330',
                          marginBottom: '0.35rem',
                        }}
                      >
                        Hero Banner Image (Upload or enter URL)
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <input
                            type="file"
                            id="hero-banner-picker"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  setSiteConfig({
                                    ...siteConfig,
                                    heroBannerUrl: reader.result as string,
                                  });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById('hero-banner-picker')?.click()}
                            style={{
                              background: '#061821',
                              color: '#d4af37',
                              border: '1px solid #d4af37',
                              padding: '0.35rem 0.75rem',
                              borderRadius: '4px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            📁 Upload Banner
                          </button>
                        </div>
                        <input
                          type="text"
                          value={siteConfig.heroBannerUrl || ''}
                          onChange={(e) => setSiteConfig({ ...siteConfig, heroBannerUrl: e.target.value })}
                          placeholder="https://... or data:image/..."
                          style={{
                            width: '100%',
                            padding: '0.6rem',
                            borderRadius: '6px',
                            border: '1px solid #dce8ec',
                            fontSize: '0.85rem',
                            color: '#092330',
                          }}
                        />
                        {siteConfig.heroBannerUrl && (
                          <div
                            style={{
                              height: '90px',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              border: '1px solid #dce8ec',
                              background: '#0a2432',
                            }}
                          >
                            <img
                              src={siteConfig.heroBannerUrl}
                              alt="Hero Preview"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = sareeHero;
                              }}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#092330',
                          marginBottom: '0.35rem',
                        }}
                      >
                        Brand Logo Image (Upload or enter URL)
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <input
                            type="file"
                            id="logo-image-picker"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  setSiteConfig({
                                    ...siteConfig,
                                    logoUrl: reader.result as string,
                                  });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById('logo-image-picker')?.click()}
                            style={{
                              background: '#061821',
                              color: '#d4af37',
                              border: '1px solid #d4af37',
                              padding: '0.35rem 0.75rem',
                              borderRadius: '4px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            📁 Upload Logo
                          </button>
                        </div>
                        <input
                          type="text"
                          value={siteConfig.logoUrl || ''}
                          onChange={(e) => setSiteConfig({ ...siteConfig, logoUrl: e.target.value })}
                          placeholder="https://... or data:image/..."
                          style={{
                            width: '100%',
                            padding: '0.6rem',
                            borderRadius: '6px',
                            border: '1px solid #dce8ec',
                            fontSize: '0.85rem',
                            color: '#092330',
                          }}
                        />
                        {siteConfig.logoUrl && (
                          <div
                            style={{
                              width: '90px',
                              height: '90px',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              border: '1px solid #dce8ec',
                              background: '#0a2432',
                            }}
                          >
                            <img
                              src={siteConfig.logoUrl}
                              alt="Logo Preview"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = bamasLogo;
                              }}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#092330',
                          marginBottom: '0.35rem',
                        }}
                      >
                        Customer Support Email
                      </label>
                      <input
                        type="email"
                        value={siteConfig.contactEmail || ''}
                        onChange={(e) => setSiteConfig({ ...siteConfig, contactEmail: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.6rem',
                          borderRadius: '6px',
                          border: '1px solid #dce8ec',
                          fontSize: '0.9rem',
                          color: '#092330',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#092330',
                          marginBottom: '0.35rem',
                        }}
                      >
                        Customer Support Phone
                      </label>
                      <input
                        type="text"
                        value={siteConfig.contactPhone || ''}
                        onChange={(e) => setSiteConfig({ ...siteConfig, contactPhone: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.6rem',
                          borderRadius: '6px',
                          border: '1px solid #dce8ec',
                          fontSize: '0.9rem',
                          color: '#092330',
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      borderTop: '1px solid #dce8ec',
                      paddingTop: '1.25rem',
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Button
                      type="submit"
                      size="lg"
                      style={{
                        background: 'linear-gradient(135deg, #092330 0%, #123747 100%)',
                        color: '#d4af37',
                        border: '1px solid #d4af37',
                        fontWeight: 600,
                        padding: '0 2rem',
                        boxShadow: '0 4px 14px rgba(9, 35, 48, 0.25)',
                      }}
                    >
                      Save Storefront Settings
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

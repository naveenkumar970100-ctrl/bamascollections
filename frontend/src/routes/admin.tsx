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
  Star,
  Camera,
  Maximize2,
  Lock,
  Eye,
  EyeOff,
  Send,
  User,
  Bell,
  ChevronLeft,
} from 'lucide-react';
import { useCustomer } from '@/components/bamas/auth-context';
import { api } from '@/lib/api';
import { getSocket, joinChatRoom, leaveChatRoom } from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { pageHead } from '@/lib/page-head';
import { NotificationBell } from '@/components/bamas/notification-bell';
import { collection } from '@/lib/collection';
import { validateName, validateEmail, validatePhone, validatePrice, validateRequired } from '@/lib/validation';
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

type TabType = 'overview' | 'bookings' | 'collections' | 'customers' | 'reviews' | 'inquiries' | 'settings' | 'profile';

function AdminDashboardPage() {
  const { user, ready } = useCustomer();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
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
  const [products, setProducts] = useState<any[]>(collection);
  const [customers, setCustomers] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewFilter, setReviewFilter] = useState('All');
  const [reviewSearch, setReviewSearch] = useState('');
  const [previewReviewPhoto, setPreviewReviewPhoto] = useState<string | null>(null);
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

  const [siteTouched, setSiteTouched] = useState<Record<string, boolean>>({});
  const siteEmailVal = validateEmail(siteConfig.contactEmail || '');
  const sitePhoneVal = validatePhone(siteConfig.contactPhone || '');

  // Product Full-Page Studio State (No Popups)
  const [isEditingProductView, setIsEditingProductView] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingRelatedImage, setUploadingRelatedImage] = useState(false);
  const [newRelatedImageUrl, setNewRelatedImageUrl] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newHighlightInput, setNewHighlightInput] = useState('');
  const [newSpecLabel, setNewSpecLabel] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [productFormData, setProductFormData] = useState<{
    name: string;
    category: string;
    price: number;
    originalPrice: number;
    fabric: string;
    color: string;
    border: string;
    countInStock: number;
    isFeatured: boolean;
    image: string;
    images: string[];
    detail: string;
    zariAuthenticity: string;
    blousePiece: string;
    drapeLength: string;
    careInstructions: string;
    shippingReturns: string;
    highlights: string[];
    customSpecs: { label: string; value: string }[];
    taxNotice: string;
    certificationNotice: string;
    whatsappText: string;
    whatsappNumber: string;
  }>({
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
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'],
    detail: 'Exquisitely hand-woven pure silk drape adorned with royal antique gold zari detailing.',
    zariAuthenticity: 'Certified Tested Gold Zari',
    blousePiece: 'Included (Matching Unstitched Pure Silk, 0.8m)',
    drapeLength: '6.3 Metres (including blouse)',
    careInstructions:
      'Dry Clean Only to maintain the sheen and longevity of authentic handwoven pure zari silk. Store folded in a breathable cotton or muslin bag. Avoid direct spraying of perfumes or chemicals onto the pure zari border. Refold periodically along different crease lines.',
    shippingReturns:
      'All authentic heirloom sarees are dispatched in tamper-evident luxury keepsake boxes with complimentary insured domestic courier (3-5 business days). Easy 7-day exchanges available for unworn items with original seals intact.',
    highlights: ['Tested Gold Zari', 'Free Delivery in 3–5 Days', 'Blouse Piece Included'],
    customSpecs: [],
    taxNotice: 'Taxes Included · Free Insured Dispatch',
    certificationNotice: 'Silk Mark Certified · 100% Pure Silk',
    whatsappText: 'Questions? Chat with Bamas Stylist on WhatsApp',
    whatsappNumber: '919876543210',
  });

  const [productTouched, setProductTouched] = useState<Record<string, boolean>>({});

  const productNameVal = validateRequired(productFormData.name, 'Saree Title', 3);
  const productPriceVal = validatePrice(productFormData.price);
  const productFabricVal = validateRequired(productFormData.fabric, 'Fabric Type', 2);
  const productColorVal = validateRequired(productFormData.color, 'Primary Drape Color', 2);
  const productDetailVal = validateRequired(productFormData.detail, 'Heritage Story & Craftsmanship', 10);
  const productCatVal = isCreatingNewCategory
    ? validateRequired(newCategoryName, 'New Category Name', 2)
    : { valid: Boolean(productFormData.category), error: productFormData.category ? '' : 'Please select a category.' };

  const isProductFormValid =
    productNameVal.valid &&
    productPriceVal.valid &&
    productFabricVal.valid &&
    productColorVal.valid &&
    productDetailVal.valid &&
    productCatVal.valid &&
    Boolean(productFormData.image);

  const resetProductForm = () => {
    setIsCreatingNewCategory(false);
    setNewCategoryName('');
    setNewRelatedImageUrl('');
    setNewHighlightInput('');
    setNewSpecLabel('');
    setNewSpecValue('');
    setProductTouched({});
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
      images: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      ],
      detail:
        'Exquisitely hand-woven pure silk drape adorned with royal antique gold zari detailing.',
      zariAuthenticity: 'Certified Tested Gold Zari',
      blousePiece: 'Included (Matching Unstitched Pure Silk, 0.8m)',
      drapeLength: '6.3 Metres (including blouse)',
      careInstructions:
        'Dry Clean Only to maintain the sheen and longevity of authentic handwoven pure zari silk. Store folded in a breathable cotton or muslin bag. Avoid direct spraying of perfumes or chemicals onto the pure zari border. Refold periodically along different crease lines.',
      shippingReturns:
        'All authentic heirloom sarees are dispatched in tamper-evident luxury keepsake boxes with complimentary insured domestic courier (3-5 business days). Easy 7-day exchanges available for unworn items with original seals intact.',
      highlights: ['Tested Gold Zari', 'Free Delivery in 3–5 Days', 'Blouse Piece Included'],
      customSpecs: [],
      taxNotice: 'Taxes Included · Free Insured Dispatch',
      certificationNotice: 'Silk Mark Certified · 100% Pure Silk',
      whatsappText: 'Questions? Chat with Bamas Stylist on WhatsApp',
      whatsappNumber: '919876543210',
    });
  };

  const [bookingFilter, setBookingFilter] = useState('All');
  const [productSearch, setProductSearch] = useState('');
  const [overviewCategory, setOverviewCategory] = useState('All');
  const [overviewProductSearch, setOverviewProductSearch] = useState('');
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
      const [statsRes, ordersRes, inquiriesRes, productsRes, usersRes, configRes, reviewsRes] = await Promise.all([
        api.admin.getStats().catch(() => ({ data: null })),
        api.admin.getOrders().catch(() => ({ data: [] })),
        api.admin.getInquiries().catch(() => ({ data: [] })),
        api.products.getAll().catch(() => ({ data: [] })),
        api.admin.getUsers().catch(() => ({ data: [] })),
        api.siteConfig.get().catch(() => ({ data: null })),
        api.admin.getReviews().catch(() => ({ data: [] })),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (ordersRes.data) setOrders(ordersRes.data);
      if (inquiriesRes.data) setInquiries(inquiriesRes.data);
      if (productsRes.data && productsRes.data.length > 0) {
        setProducts(productsRes.data);
      } else if (collection && collection.length > 0) {
        setProducts(collection);
      }
      if (usersRes.data) setCustomers(usersRes.data);
      if (configRes.data) setSiteConfig(configRes.data);
      if (reviewsRes.data) setReviews(reviewsRes.data);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    getSocket();

    const handleRealtimeOrderCreated = (e: any) => {
      const order = e.detail;
      if (order) {
        setOrders((prev) => [order, ...prev.filter((o) => o._id !== order._id)]);
        showNotification(`🛍️ New Order #${order._id?.slice(-6)?.toUpperCase()} received live via WebSocket!`);
      }
    };

    const handleRealtimeOrderUpdated = (e: any) => {
      const updated = e.detail;
      if (updated) {
        setOrders((prev) => prev.map((o) => (o._id === updated._id ? { ...o, ...updated } : o)));
      }
    };

    const handleRealtimeOrderDeleted = (e: any) => {
      const { id } = e.detail || {};
      if (id) {
        setOrders((prev) => prev.filter((o) => o._id !== id));
      }
    };

    const handleRealtimeInquiryCreated = (e: any) => {
      const inq = e.detail;
      if (inq) {
        setInquiries((prev) => [inq, ...prev.filter((item) => item._id !== inq._id)]);
        showNotification(`💬 New Saree Inquiry from ${inq.name}!`);
      }
    };

    const handleRealtimeInquiryUpdated = (e: any) => {
      const inq = e.detail;
      if (inq) {
        setInquiries((prev) =>
          prev.map((item) => (item._id === inq._id ? { ...item, ...inq } : item))
        );
      }
    };

    const handleRealtimeMessageReceived = (e: any) => {
      const payload = e.detail;
      if (payload?.inquiryId && payload?.message) {
        setInquiries((prev) =>
          prev.map((inq) => {
            if (inq._id === payload.inquiryId) {
              const msgs = Array.isArray(inq.messages) ? inq.messages : [];
              const exists = msgs.some((m: any) => m._id && m._id === payload.message._id);
              if (!exists) {
                return {
                  ...inq,
                  messages: [...msgs, payload.message],
                  status: payload.inquiry?.status || inq.status,
                };
              }
            }
            return inq;
          })
        );
        if (payload.message.senderRole !== 'admin') {
          showNotification(`💬 New message from ${payload.message.senderName}: "${payload.message.text.slice(0, 45)}..."`);
        }
      }
    };

    const handleRealtimeNotification = (e: any) => {
      const notif = e.detail;
      if (notif) {
        showNotification(`🔔 ${notif.title || 'New Atelier Notification'}`);
      }
    };

    const handleRealtimeReview = () => {
      api.admin.getReviews().then((res) => {
        if (res.data) setReviews(res.data);
      }).catch(() => {});
    };

    window.addEventListener('bamas_order_created', handleRealtimeOrderCreated);
    window.addEventListener('bamas_order_updated', handleRealtimeOrderUpdated);
    window.addEventListener('bamas_order_deleted', handleRealtimeOrderDeleted);
    window.addEventListener('bamas_inquiry_created', handleRealtimeInquiryCreated);
    window.addEventListener('bamas_inquiry_updated', handleRealtimeInquiryUpdated);
    window.addEventListener('bamas_message_received', handleRealtimeMessageReceived);
    window.addEventListener('bamas_notification_received', handleRealtimeNotification);
    window.addEventListener('bamas_review_created', handleRealtimeReview);
    window.addEventListener('bamas_review_deleted', handleRealtimeReview);

    const interval = setInterval(fetchAllData, 25000);

    return () => {
      window.removeEventListener('bamas_order_created', handleRealtimeOrderCreated);
      window.removeEventListener('bamas_order_updated', handleRealtimeOrderUpdated);
      window.removeEventListener('bamas_order_deleted', handleRealtimeOrderDeleted);
      window.removeEventListener('bamas_inquiry_created', handleRealtimeInquiryCreated);
      window.removeEventListener('bamas_inquiry_updated', handleRealtimeInquiryUpdated);
      window.removeEventListener('bamas_message_received', handleRealtimeMessageReceived);
      window.removeEventListener('bamas_notification_received', handleRealtimeNotification);
      window.removeEventListener('bamas_review_created', handleRealtimeReview);
      window.removeEventListener('bamas_review_deleted', handleRealtimeReview);
      clearInterval(interval);
    };
  }, []);

  // Delete customer review and recalculate rating
  const handleDeleteReview = async (productId: string, reviewId: string) => {
    if (!confirm('Are you sure you want to permanently delete this customer review? The product average rating will be automatically updated.')) return;
    try {
      await api.admin.deleteReview(productId, reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      showNotification('✓ Customer review deleted and product rating updated!');
      fetchAllData();
    } catch (err: any) {
      showNotification(`Error deleting review: ${err.message}`);
    }
  };

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

  // Delete booking / order permanently from database
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(`Are you sure you want to permanently delete Order #${orderId?.slice(-6).toUpperCase()}? This action cannot be undone.`)) return;
    try {
      await api.admin.deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      showNotification(`Order #${orderId?.slice(-6).toUpperCase()} permanently deleted from database.`);
      fetchAllData();
    } catch (err: any) {
      showNotification(`Error deleting order: ${err.message}`);
    }
  };

  // Customer CRUD State & Handlers
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerModalMode, setCustomerModalMode] = useState<'create' | 'edit'>('create');
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [customerFormSaving, setCustomerFormSaving] = useState(false);
  const [customerFormError, setCustomerFormError] = useState<string | null>(null);
  const [customerFormData, setCustomerFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer' as 'customer' | 'admin',
    password: '',
    street: '',
    city: '',
    state: 'Telangana',
    postalCode: '',
  });

  const handleStartCreateCustomer = () => {
    setEditingCustomer(null);
    setCustomerModalMode('create');
    setCustomerFormData({
      name: '',
      email: '',
      phone: '',
      role: 'customer',
      password: '',
      street: '',
      city: '',
      state: 'Telangana',
      postalCode: '',
    });
    setCustomerFormError(null);
    setIsCustomerModalOpen(true);
  };

  const handleStartEditCustomer = (c: any) => {
    setEditingCustomer(c);
    setCustomerModalMode('edit');
    setCustomerFormData({
      name: c.name || '',
      email: c.email || '',
      phone: c.phone || '',
      role: (c.role === 'admin' ? 'admin' : 'customer') as 'customer' | 'admin',
      password: '',
      street: c.address?.street || '',
      city: c.address?.city || '',
      state: c.address?.state || 'Telangana',
      postalCode: c.address?.postalCode || '',
    });
    setCustomerFormError(null);
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerFormData.name.trim()) {
      setCustomerFormError('Please enter customer full name.');
      return;
    }
    if (!customerFormData.email.trim() && !customerFormData.phone.trim()) {
      setCustomerFormError('Please provide either an email or mobile phone.');
      return;
    }
    if (customerModalMode === 'create' && (!customerFormData.password || customerFormData.password.length < 6)) {
      setCustomerFormError('Please set a password of at least 6 characters.');
      return;
    }

    setCustomerFormSaving(true);
    setCustomerFormError(null);

    try {
      const payload: any = {
        name: customerFormData.name.trim(),
        email: customerFormData.email.trim() || undefined,
        phone: customerFormData.phone.trim() || undefined,
        role: customerFormData.role,
        address: {
          street: customerFormData.street.trim(),
          city: customerFormData.city.trim(),
          state: customerFormData.state.trim(),
          postalCode: customerFormData.postalCode.trim(),
          country: 'India',
        },
      };

      if (customerFormData.password && customerFormData.password.trim().length >= 6) {
        payload.password = customerFormData.password.trim();
      }

      if (customerModalMode === 'create') {
        const res = await api.admin.createUser(payload);
        showNotification(`✨ Customer account "${customerFormData.name}" created successfully!`);
        if (res.data) {
          setCustomers((prev) => [res.data, ...prev]);
        } else {
          fetchAllData();
        }
      } else {
        const cId = editingCustomer.id || editingCustomer._id;
        const res = await api.admin.updateUser(cId, payload);
        showNotification(`✨ Customer profile for "${customerFormData.name}" updated!`);
        if (res.data) {
          setCustomers((prev) =>
            prev.map((item) => (item.id === cId || item._id === cId ? { ...item, ...res.data } : item))
          );
        } else {
          fetchAllData();
        }
      }

      setIsCustomerModalOpen(false);
      setEditingCustomer(null);
    } catch (err: any) {
      setCustomerFormError(err.message || 'Failed to save customer account.');
    } finally {
      setCustomerFormSaving(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    const target = customers.find((c) => (c.id || c._id) === userId);
    if (!confirm(`Are you sure you want to permanently delete customer account "${target?.name || 'this customer'}"?`)) return;
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

  // Direct Message states for inquiries
  const [openInquiryChatId, setOpenInquiryChatId] = useState<string | null>(null);
  const [inquiryReplyTexts, setInquiryReplyTexts] = useState<Record<string, string>>({});
  const [inquirySending, setInquirySending] = useState<Record<string, boolean>>({});

  const handleToggleInquiryChat = (inquiryId: string) => {
    if (openInquiryChatId === inquiryId) {
      leaveChatRoom(inquiryId);
      setOpenInquiryChatId(null);
    } else {
      if (openInquiryChatId) {
        leaveChatRoom(openInquiryChatId);
      }
      joinChatRoom(inquiryId);
      setOpenInquiryChatId(inquiryId);
    }
  };

  const handleSendInquiryReply = async (inquiryId: string) => {
    const text = (inquiryReplyTexts[inquiryId] || '').trim();
    if (!text) return;

    setInquirySending((prev) => ({ ...prev, [inquiryId]: true }));
    try {
      const res = await api.admin.sendInquiryMessage(inquiryId, {
        text,
        senderName: 'Bamas Admin',
      });

      if (res.data?.inquiry) {
        setInquiries((prev) =>
          prev.map((item) => (item._id === inquiryId ? { ...item, ...res.data.inquiry } : item))
        );
      }
      setInquiryReplyTexts((prev) => ({ ...prev, [inquiryId]: '' }));
      showNotification('✓ Direct message sent to customer in real-time!');
    } catch (err: any) {
      showNotification(`Failed to send message: ${err.message}`);
    } finally {
      setInquirySending((prev) => ({ ...prev, [inquiryId]: false }));
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
    setProductTouched({ name: true, price: true, fabric: true, color: true, detail: true, category: true, image: true });

    if (!isProductFormValid) {
      if (!productNameVal.valid) { showNotification(`Validation: ${productNameVal.error}`); return; }
      if (!productPriceVal.valid) { showNotification(`Validation: ${productPriceVal.error}`); return; }
      if (!productCatVal.valid) { showNotification(`Validation: ${productCatVal.error}`); return; }
      if (!productFabricVal.valid) { showNotification(`Validation: ${productFabricVal.error}`); return; }
      if (!productColorVal.valid) { showNotification(`Validation: ${productColorVal.error}`); return; }
      if (!productDetailVal.valid) { showNotification(`Validation: ${productDetailVal.error}`); return; }
      if (!productFormData.image) { showNotification('Validation: Please upload or select a cover image for this saree.'); return; }
      return;
    }

    try {
      setSavingProduct(true);
      const categoryToSave =
        isCreatingNewCategory && newCategoryName.trim()
          ? newCategoryName.trim()
          : productFormData.category || 'Bridal & Heirloom Silks';

      const allImagesList = Array.from(
        new Set([productFormData.image, ...(productFormData.images || [])].filter(Boolean))
      );

      const payload = {
        ...productFormData,
        image: productFormData.image || allImagesList[0] || '',
        images: allImagesList.length > 0 ? allImagesList : (productFormData.image ? [productFormData.image] : []),
        category: categoryToSave,
      };

      if (editingProduct) {
        await api.admin.updateProduct(editingProduct.id || editingProduct._id, payload);
        showNotification(`✨ Saree piece updated successfully in category "${categoryToSave}"!`);
      } else {
        await api.admin.createProduct(payload);
        showNotification(`✨ New saree piece published in category "${categoryToSave}"!`);
      }
      setIsEditingProductView(false);
      setEditingProduct(null);
      setIsCreatingNewCategory(false);
      setNewCategoryName('');
      setNewRelatedImageUrl('');
      fetchAllData();
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    } finally {
      setSavingProduct(false);
    }
  };

  // Primary Cover Image Upload handler for Saree Studio (Cloudinary direct + fallback)
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const res = await api.upload.uploadImage(file, 'bamascollections/products');
      if (res.data?.url) {
        const url = res.data.url;
        setProductFormData((prev) => ({
          ...prev,
          image: url,
          images: Array.from(new Set([url, ...(prev.images || [])])),
        }));
        showNotification('✨ Primary cover photo uploaded directly to Cloudinary!');
      }
    } catch (err: any) {
      console.warn('Direct upload error, reading as Data URL:', err);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setProductFormData((prev) => ({
          ...prev,
          image: dataUrl,
          images: Array.from(new Set([dataUrl, ...(prev.images || [])])),
        }));
        showNotification('Primary image loaded. Will sync to Cloudinary on save.');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  // Upload one or multiple related images for Saree Studio
  const handleRelatedImagesFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingRelatedImage(true);
      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const res = await api.upload.uploadImage(file, 'bamascollections/products');
          if (res.data?.url) {
            newUrls.push(res.data.url);
          }
        } catch (uploadErr) {
          console.warn('Direct upload error for related image, saving data URL:', uploadErr);
          await new Promise<void>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              if (reader.result) newUrls.push(reader.result as string);
              resolve();
            };
            reader.readAsDataURL(file);
          });
        }
      }

      if (newUrls.length > 0) {
        setProductFormData((prev) => {
          const currentList = prev.images || (prev.image ? [prev.image] : []);
          const merged = Array.from(new Set([...currentList, ...newUrls]));
          return {
            ...prev,
            image: prev.image || merged[0] || '',
            images: merged,
          };
        });
        showNotification(`✨ Added ${newUrls.length} related photo(s) to this saree piece!`);
      }
    } catch (err: any) {
      showNotification(`Upload error: ${err.message}`);
    } finally {
      setUploadingRelatedImage(false);
      e.target.value = '';
    }
  };

  // Add related photo by direct URL input
  const handleAddRelatedImageUrl = () => {
    if (!newRelatedImageUrl.trim()) return;
    const url = newRelatedImageUrl.trim();
    setProductFormData((prev) => {
      const currentList = prev.images || (prev.image ? [prev.image] : []);
      const merged = Array.from(new Set([...currentList, url]));
      return {
        ...prev,
        image: prev.image || merged[0] || '',
        images: merged,
      };
    });
    setNewRelatedImageUrl('');
    showNotification('✨ Related photo URL added!');
  };

  // Remove photo from gallery
  const handleRemoveRelatedImage = (indexToRemove: number) => {
    setProductFormData((prev) => {
      const currentList = prev.images || (prev.image ? [prev.image] : []);
      const targetImg = currentList[indexToRemove];
      const updated = currentList.filter((_, idx) => idx !== indexToRemove);
      let newPrimary = prev.image;
      if (prev.image === targetImg) {
        newPrimary = updated[0] || '';
      }
      return {
        ...prev,
        image: newPrimary,
        images: updated,
      };
    });
    showNotification('Photo removed from saree gallery.');
  };

  // Set an existing gallery photo as Primary Cover
  const handleSetPrimaryImage = (imgUrl: string) => {
    setProductFormData((prev) => {
      const currentList = prev.images || [];
      const rest = currentList.filter((item) => item !== imgUrl);
      return {
        ...prev,
        image: imgUrl,
        images: [imgUrl, ...rest],
      };
    });
    showNotification('★ Set as primary cover photo!');
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

  // Start editing a product
  const handleStartEditProduct = (p: any) => {
    setEditingProduct(p);
    setIsCreatingNewCategory(false);
    setNewCategoryName('');
    setNewRelatedImageUrl('');
    setNewHighlightInput('');
    setNewSpecLabel('');
    setNewSpecValue('');

    const initialImages = Array.isArray(p.images) && p.images.length > 0
      ? p.images
      : (p.image ? [p.image] : []);

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
      image: p.image || initialImages[0] || '',
      images: initialImages,
      detail: p.detail || p.description || '',
      zariAuthenticity: p.zariAuthenticity || 'Certified Tested Gold Zari',
      blousePiece: p.blousePiece || 'Included (Matching Unstitched Pure Silk, 0.8m)',
      drapeLength: p.drapeLength || '6.3 Metres (including blouse)',
      careInstructions:
        p.careInstructions ||
        'Dry Clean Only to maintain the sheen and longevity of authentic handwoven pure zari silk. Store folded in a breathable cotton or muslin bag. Avoid direct spraying of perfumes or chemicals onto the pure zari border. Refold periodically along different crease lines.',
      shippingReturns:
        p.shippingReturns ||
        'All authentic heirloom sarees are dispatched in tamper-evident luxury keepsake boxes with complimentary insured domestic courier (3-5 business days). Easy 7-day exchanges available for unworn items with original seals intact.',
      highlights:
        Array.isArray(p.highlights) && p.highlights.length > 0
          ? p.highlights
          : ['Tested Gold Zari', 'Free Delivery in 3–5 Days', 'Blouse Piece Included'],
      customSpecs: Array.isArray(p.customSpecs) ? p.customSpecs : [],
      taxNotice: p.taxNotice || 'Taxes Included · Free Insured Dispatch',
      certificationNotice: p.certificationNotice || 'Silk Mark Certified · 100% Pure Silk',
      whatsappText: p.whatsappText || 'Questions? Chat with Bamas Stylist on WhatsApp',
      whatsappNumber: p.whatsappNumber || '919876543210',
    });
    setIsEditingProductView(true);
    setActiveTab('collections');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Start creating a new product
  const handleStartNewProduct = () => {
    setEditingProduct(null);
    setIsCreatingNewCategory(false);
    setNewCategoryName('');
    setNewRelatedImageUrl('');
    resetProductForm();
    setIsEditingProductView(true);
    setActiveTab('collections');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper actions for dynamic PDP highlight chips & custom specs
  const handleAddHighlight = () => {
    const trimmed = newHighlightInput.trim();
    if (!trimmed) return;
    setProductFormData((prev) => ({
      ...prev,
      highlights: [...(prev.highlights || []), trimmed],
    }));
    setNewHighlightInput('');
  };

  const handleRemoveHighlight = (index: number) => {
    setProductFormData((prev) => ({
      ...prev,
      highlights: (prev.highlights || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddCustomSpec = () => {
    const label = newSpecLabel.trim();
    const value = newSpecValue.trim();
    if (!label || !value) return;
    setProductFormData((prev) => ({
      ...prev,
      customSpecs: [...(prev.customSpecs || []), { label, value }],
    }));
    setNewSpecLabel('');
    setNewSpecValue('');
  };

  const handleRemoveCustomSpec = (index: number) => {
    setProductFormData((prev) => ({
      ...prev,
      customSpecs: (prev.customSpecs || []).filter((_, i) => i !== index),
    }));
  };

  // Check URL search parameters (e.g., ?tab=collections&edit=...) for direct edit access from PDP
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as TabType | null;
    const editId = params.get('edit');

    if (tabParam && ['overview', 'bookings', 'collections', 'customers', 'reviews', 'inquiries', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }

    if (editId && products && products.length > 0) {
      const target = products.find((p) => p.id === editId || p._id === editId);
      if (target) {
        handleStartEditProduct(target);
      }
    }
  }, [products]);

  // Quick toggle featured status
  const handleToggleFeatured = async (p: any) => {
    try {
      const id = p.id || p._id;
      const newFeatured = !p.isFeatured;
      await api.admin.updateProduct(id, { isFeatured: newFeatured });
      setProducts((prev) =>
        prev.map((item) => (item.id === id || item._id === id ? { ...item, isFeatured: newFeatured } : item))
      );
      showNotification(
        newFeatured
          ? `★ "${p.name}" will now be showcased on the Home Page!`
          : `"${p.name}" removed from Home Page featured list.`
      );
      fetchAllData();
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    }
  };

  // Save Site Configuration
  const handleSaveSiteConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSiteTouched({ contactEmail: true, contactPhone: true });

    if (siteConfig.contactEmail && !siteEmailVal.valid) {
      showNotification(`Validation: ${siteEmailVal.error}`);
      return;
    }
    if (siteConfig.contactPhone && !sitePhoneVal.valid) {
      showNotification(`Validation: ${sitePhoneVal.error}`);
      return;
    }

    try {
      await api.siteConfig.update(siteConfig);
      showNotification('Branding & Site Configuration saved in database!');
    } catch (err: any) {
      showNotification(`Error: ${err.message}`);
    }
  };

  const [localAdminUser, setLocalAdminUser] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      return api.auth.getCurrentUser();
    }
    return null;
  });

  const [adminEmail, setAdminEmail] = useState('admin@bamas.com');
  const [adminPassword, setAdminPassword] = useState('admin@123');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminLoggingIn, setAdminLoggingIn] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  const activeUser = localAdminUser || user || (typeof window !== 'undefined' ? api.auth.getCurrentUser() : null);
  const isAdmin = activeUser?.role === 'admin';

  const handleDirectAdminLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    const loginIdentifier = (customEmail ?? adminEmail).trim();
    const loginPass = customPass ?? adminPassword;

    if (!loginIdentifier || !loginPass) {
      setAdminLoginError('Please enter both email and password.');
      return;
    }

    setAdminLoginError(null);
    setAdminLoggingIn(true);

    try {
      const res = await api.auth.login({
        identifier: loginIdentifier,
        password: loginPass,
      });

      if (res.data?.role !== 'admin') {
        throw new Error('This account does not have administrator privileges. Please sign in with an authorized admin account.');
      }

      setLocalAdminUser(res.data);
      window.dispatchEvent(new Event('bamas_auth_changed'));
      showNotification('✨ Welcome to Bamas Admin Dashboard!');
      fetchAllData();
    } catch (err: any) {
      setAdminLoginError(err.message || 'Invalid administrator credentials. Please check and try again.');
    } finally {
      setAdminLoggingIn(false);
    }
  };

  const handleSignOut = () => {
    api.auth.logout();
    setLocalAdminUser(null);
    window.dispatchEvent(new Event('bamas_auth_changed'));
  };

  // Dedicated Executive Admin Portal Sign-In View (No 'Administrator Access Required' warning screen)
  if (!isAdmin) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
          background: 'linear-gradient(180deg, #061821 0%, #0b222f 50%, #061821 100%)',
          fontFamily: 'Manrope, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: '460px',
            width: '100%',
            background: 'rgba(10, 34, 47, 0.85)',
            backdropFilter: 'blur(16px)',
            borderRadius: '1.25rem',
            padding: '2.5rem 2rem',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(212, 175, 55, 0.3)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            textAlign: 'center',
            color: '#ffffff',
          }}
        >
          {/* Atelier Brand Crest */}
          <div
            style={{
              width: '68px',
              height: '68px',
              margin: '0 auto 1.25rem',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(9, 35, 48, 0.8) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid #d4af37',
              boxShadow: '0 8px 24px rgba(212, 175, 55, 0.25)',
            }}
          >
            <ShieldCheck size={34} style={{ color: '#d4af37' }} />
          </div>

          <h1
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '2rem',
              fontWeight: 700,
              color: '#d4af37',
              margin: '0 0 0.35rem',
              letterSpacing: '0.5px',
            }}
          >
            Bamas Administration Suite
          </h1>
          <p
            style={{
              color: '#94a3b8',
              fontSize: '0.88rem',
              lineHeight: '1.5',
              margin: '0 0 1.75rem',
            }}
          >
            Sign in with authorized administrator credentials to manage live collections, bookings, and customer inquiries.
          </p>

          {adminLoginError && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                fontSize: '0.82rem',
                marginBottom: '1.25rem',
                textAlign: 'left',
                lineHeight: '1.4',
              }}
            >
              {adminLoginError}
            </div>
          )}

          <form onSubmit={(e) => handleDirectAdminLogin(e)} style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '1.1rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#e2e8f0',
                  marginBottom: '0.35rem',
                }}
              >
                Administrator Email / Username
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
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
                  placeholder="admin@bamas.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.85rem 0.75rem 2.4rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(212, 175, 55, 0.35)',
                    background: 'rgba(6, 24, 33, 0.8)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.4rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#e2e8f0',
                  marginBottom: '0.35rem',
                }}
              >
                Security Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                  }}
                />
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  placeholder="admin@123"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.5rem 0.75rem 2.4rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(212, 175, 55, 0.35)',
                    background: 'rgba(6, 24, 33, 0.8)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
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
                  title={showAdminPassword ? 'Hide password' : 'Show password'}
                >
                  {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Button
                type="submit"
                size="lg"
                disabled={adminLoggingIn}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #d4af37 0%, #b89326 100%)',
                  color: '#061821',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  letterSpacing: '0.3px',
                  boxShadow: '0 6px 20px rgba(212, 175, 55, 0.3)',
                  cursor: adminLoggingIn ? 'not-allowed' : 'pointer',
                }}
              >
                {adminLoggingIn ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" style={{ marginRight: '0.5rem' }} /> Authenticating...
                  </>
                ) : (
                  <>
                    Sign In to Admin Dashboard <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={() => handleDirectAdminLogin(undefined, 'admin@bamas.com', 'admin@123')}
                disabled={adminLoggingIn}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  background: 'rgba(212, 175, 55, 0.1)',
                  color: '#d4af37',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: adminLoggingIn ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <Sparkles size={14} /> 1-Click Instant Admin Access (admin@bamas.com)
              </button>

              <a
                href="/"
                style={{
                  marginTop: '0.5rem',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '0.82rem',
                  textDecoration: 'none',
                  display: 'block',
                }}
              >
                ← Return to Storefront
              </a>
            </div>
          </form>
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

      {/* SIDEBAR: Deep Royal Peacock Teal & Gold (Desktop View) */}
      <aside
        style={{
          width: '260px',
          background: 'linear-gradient(180deg, #061821 0%, #0a2432 55%, #071922 100%)',
          color: '#ffffff',
          display: isMobile ? 'none' : 'flex',
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
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            style={{
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              borderRadius: '6px',
              color: '#d4af37',
              cursor: 'pointer',
              padding: '0.35rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={18} />
          </button>
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
            { id: 'reviews', label: 'Customer Reviews', icon: Star, badge: reviews.length },
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {!isMobile && (
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
            )}

            {isMobile && (activeTab === 'customers' || activeTab === 'reviews' || activeTab === 'settings') && (
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'rgba(212, 175, 55, 0.12)',
                  border: '1px solid rgba(212, 175, 55, 0.5)',
                  color: '#092330',
                  cursor: 'pointer',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                <ArrowLeft size={16} style={{ color: '#092330' }} />
                <span>Profile</span>
              </button>
            )}

            <h1
              style={{
                margin: 0,
                fontSize: isMobile ? '1.15rem' : '1.35rem',
                fontWeight: 700,
                color: '#092330',
                fontFamily: 'Cormorant Garamond, serif',
                letterSpacing: '0.5px',
                textTransform: 'capitalize',
              }}
            >
              {activeTab === 'bookings'
                ? 'Bookings & Orders'
                : activeTab === 'reviews'
                ? 'Customer Reviews & Patron Photos'
                : activeTab === 'inquiries'
                ? 'Customer Inquiries'
                : activeTab === 'profile'
                ? 'Admin Profile & Hub'
                : activeTab}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <NotificationBell isAdmin={true} />
          </div>
        </header>

        {/* CONTENT VIEWPORT */}
        <main
          style={{
            padding: isMobile ? '1rem 0.85rem 5.5rem 0.85rem' : '1.5rem',
            flex: 1,
            maxWidth: '1400px',
            width: '100%',
            margin: '0 auto',
          }}
        >
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
                    tab: 'bookings' as TabType,
                    actionLabel: 'View Bookings & Orders',
                  },
                  {
                    title: 'Orders & Bookings',
                    value: stats?.overview?.totalOrders || orders.length,
                    icon: CalendarCheck,
                    sub: `${stats?.overview?.pendingOrders || 0} pending processing`,
                    color: '#092330',
                    bg: 'rgba(9, 35, 48, 0.1)',
                    tab: 'bookings' as TabType,
                    actionLabel: 'Manage All Orders',
                  },
                  {
                    title: 'Catalog Sarees',
                    value: stats?.overview?.totalProducts || products.length,
                    icon: ShoppingBag,
                    sub: 'Active heirloom drapes',
                    color: '#0e7490',
                    bg: 'rgba(14, 116, 144, 0.1)',
                    tab: 'collections' as TabType,
                    actionLabel: 'Browse All Sarees',
                  },
                  {
                    title: 'Registered Customers',
                    value: stats?.overview?.totalUsers || customers.length,
                    icon: Users,
                    sub: 'Customer accounts',
                    color: '#047857',
                    bg: 'rgba(16, 185, 129, 0.1)',
                    tab: 'customers' as TabType,
                    actionLabel: 'Manage Customer Accounts',
                  },
                  {
                    title: 'Customer Reviews',
                    value: reviews.length,
                    icon: Star,
                    sub: `${reviews.filter((r: any) => r.isVerifiedBuyer).length} verified drapes`,
                    color: '#ca8a04',
                    bg: 'rgba(202, 138, 4, 0.12)',
                    tab: 'reviews' as TabType,
                    actionLabel: 'Moderate Reviews',
                  },
                  {
                    title: 'Client Inquiries',
                    value: inquiries.length,
                    icon: MessageSquare,
                    sub: `${inquiries.filter((inq: any) => inq.status === 'New').length} pending response`,
                    color: '#b45309',
                    bg: 'rgba(217, 119, 6, 0.1)',
                    tab: 'inquiries' as TabType,
                    actionLabel: 'View Live Inquiries',
                  },
                ].map((kpi, i) => {
                  const Icon = kpi.icon;
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        setActiveTab(kpi.tab);
                        setIsEditingProductView(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setActiveTab(kpi.tab);
                          setIsEditingProductView(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      style={{
                        background: '#ffffff',
                        borderRadius: '0.75rem',
                        padding: '1.25rem',
                        border: '1px solid #dce8ec',
                        borderTop: '3px solid #d4af37',
                        boxShadow: '0 2px 10px rgba(9, 35, 48, 0.04)',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 10px 24px rgba(9, 35, 48, 0.1)';
                        e.currentTarget.style.borderColor = '#d4af37';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(9, 35, 48, 0.04)';
                        e.currentTarget.style.borderColor = '#dce8ec';
                      }}
                      title={`Open ${kpi.title} page`}
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
                      <div style={{ fontSize: '0.75rem', color: '#688c99', marginBottom: '0.75rem' }}>{kpi.sub}</div>
                      <div
                        style={{
                          marginTop: 'auto',
                          paddingTop: '0.65rem',
                          borderTop: '1px dashed #edf4f7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          color: '#0e7490',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        <span>{kpi.actionLabel}</span>
                        <ArrowRight size={13} style={{ color: '#d4af37' }} />
                      </div>
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
                          onClick={() => {
                            setActiveTab('inquiries');
                            setIsEditingProductView(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          role="button"
                          tabIndex={0}
                          style={{
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            background: '#f8fafb',
                            border: '1px solid #e1ebef',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#d4af37';
                            e.currentTarget.style.background = '#ffffff';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(9, 35, 48, 0.06)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e1ebef';
                            e.currentTarget.style.background = '#f8fafb';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          title="Click to view all client inquiries"
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

              {/* LIVE COLLECTIONS SHOWCASE (STORED IN MONGODB DATABASE) */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  border: '1px solid #dce8ec',
                  boxShadow: '0 2px 10px rgba(9, 35, 48, 0.04)',
                  marginBottom: '1.5rem',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    marginBottom: '1.25rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid #edf4f7',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: '#d4af37',
                        }}
                      >
                        Live Database Storefront
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          background: 'rgba(16, 185, 129, 0.12)',
                          color: '#047857',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '999px',
                          fontWeight: 600,
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        ● {products.length} Sarees in MongoDB
                      </span>
                    </div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '1.35rem',
                        fontFamily: 'Cormorant Garamond, serif',
                        fontWeight: 700,
                        color: '#092330',
                      }}
                    >
                      All Saree Collections in Database
                    </h3>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: '#688c99' }}>
                      Direct real-time view of catalog items stored in MongoDB. Any saree added or updated here instantly reflects on the public Home page and Collections page.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', width: '220px' }}>
                      <Search
                        size={14}
                        style={{
                          position: 'absolute',
                          left: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#688c99',
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Search sarees…"
                        value={overviewProductSearch}
                        onChange={(e) => setOverviewProductSearch(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.45rem 0.65rem 0.45rem 1.85rem',
                          borderRadius: '6px',
                          border: '1px solid #dce8ec',
                          background: '#f8fafb',
                          fontSize: '0.8rem',
                          color: '#092330',
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleStartNewProduct}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.5rem 0.95rem',
                        borderRadius: '6px',
                        background: 'linear-gradient(135deg, #092330 0%, #123747 100%)',
                        color: '#d4af37',
                        border: '1px solid #d4af37',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(9, 35, 48, 0.15)',
                      }}
                    >
                      <Plus size={15} /> Add New Saree
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('collections');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.5rem 0.85rem',
                        borderRadius: '6px',
                        background: 'rgba(212, 175, 55, 0.1)',
                        color: '#997510',
                        border: '1px solid rgba(212, 175, 55, 0.35)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Studio View <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Dynamic Category Pills Filter */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  {(() => {
                    const uniqueCategories = [
                      'All',
                      ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
                    ];
                    return uniqueCategories.map((cat) => {
                      const count =
                        cat === 'All'
                          ? products.length
                          : products.filter(
                              (p) => (p.category || '').toLowerCase() === cat.toLowerCase()
                            ).length;
                      const isSelected = overviewCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setOverviewCategory(cat)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            border: isSelected ? '1px solid #d4af37' : '1px solid #dce8ec',
                            background: isSelected ? '#092330' : '#f8fafb',
                            color: isSelected ? '#d4af37' : '#527482',
                          }}
                        >
                          {cat} ({count})
                        </button>
                      );
                    });
                  })()}
                </div>

                {/* Saree Grid */}
                {(() => {
                  const filtered = products.filter((p) => {
                    const matchCategory =
                      overviewCategory === 'All' ||
                      (p.category || '').toLowerCase().includes(overviewCategory.toLowerCase());
                    const matchSearch =
                      !overviewProductSearch ||
                      (p.name || '').toLowerCase().includes(overviewProductSearch.toLowerCase()) ||
                      (p.category || '').toLowerCase().includes(overviewProductSearch.toLowerCase()) ||
                      (p.fabric || '').toLowerCase().includes(overviewProductSearch.toLowerCase());
                    return matchCategory && matchSearch;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div
                        style={{
                          padding: '3rem 1.5rem',
                          textAlign: 'center',
                          borderRadius: '0.5rem',
                          background: '#f8fafb',
                          border: '1px dashed #cfdfe5',
                        }}
                      >
                        <ShoppingBag size={32} style={{ color: '#d4af37', margin: '0 auto 0.75rem' }} />
                        <h4 style={{ margin: '0 0 0.4rem', fontSize: '1.1rem', color: '#092330' }}>
                          {products.length === 0
                            ? 'No Saree Collections in Database Yet'
                            : 'No Sarees Match Your Filter'}
                        </h4>
                        <p
                          style={{
                            maxWidth: '460px',
                            margin: '0 auto 1.25rem',
                            fontSize: '0.82rem',
                            color: '#688c99',
                            lineHeight: '1.5',
                          }}
                        >
                          {products.length === 0
                            ? 'Local and seed mock products have been disabled. Admins can add handcrafted sarees directly to MongoDB Atlas from here.'
                            : 'Try adjusting your search terms or selecting a different category filter.'}
                        </p>
                        <button
                          type="button"
                          onClick={handleStartNewProduct}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            padding: '0.55rem 1.1rem',
                            borderRadius: '6px',
                            background: '#092330',
                            color: '#d4af37',
                            border: '1px solid #d4af37',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                          }}
                        >
                          <Plus size={16} /> Add First Saree Piece
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                        gap: '1.25rem',
                      }}
                    >
                      {filtered.map((p) => {
                        const productId = p.id || p._id;
                        return (
                          <div
                            key={productId}
                            onClick={() => handleStartEditProduct(p)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleStartEditProduct(p);
                              }
                            }}
                            style={{
                              background: '#ffffff',
                              borderRadius: '8px',
                              border: '1px solid #dce8ec',
                              overflow: 'hidden',
                              display: 'flex',
                              flexDirection: 'column',
                              transition: 'all 0.25s ease',
                              boxShadow: '0 2px 8px rgba(9, 35, 48, 0.04)',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-4px)';
                              e.currentTarget.style.boxShadow = '0 10px 24px rgba(9, 35, 48, 0.12)';
                              e.currentTarget.style.borderColor = '#d4af37';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(9, 35, 48, 0.04)';
                              e.currentTarget.style.borderColor = '#dce8ec';
                            }}
                            title={`Click to open and edit "${p.name}"`}
                          >
                            {/* Photo 3:4 */}
                            <div
                              style={{
                                position: 'relative',
                                width: '100%',
                                aspectRatio: '3 / 4',
                                overflow: 'hidden',
                                background: '#f0f5f7',
                              }}
                            >
                              <img
                                src={p.image || ivorySaree}
                                alt={p.name}
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = ivorySaree;
                                }}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  objectPosition: 'center 0%',
                                }}
                              />
                              {/* Category Badge */}
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '8px',
                                  left: '8px',
                                  background: 'rgba(9, 35, 48, 0.85)',
                                  color: '#ffffff',
                                  fontSize: '0.68rem',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '4px',
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  backdropFilter: 'blur(4px)',
                                }}
                              >
                                {p.category}
                              </span>

                              {/* Featured Toggle Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleFeatured(p);
                                }}
                                title={p.isFeatured ? 'Featured on Home Page (click to remove)' : 'Not featured (click to feature on Home Page)'}
                                style={{
                                  position: 'absolute',
                                  top: '8px',
                                  right: '8px',
                                  background: p.isFeatured ? '#d4af37' : 'rgba(255, 255, 255, 0.9)',
                                  color: p.isFeatured ? '#061821' : '#688c99',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: '4px',
                                  border: p.isFeatured ? '1px solid #c29d2b' : '1px solid #dce8ec',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                }}
                              >
                                <Sparkles size={11} /> {p.isFeatured ? '★ Home Page' : '+ Feature'}
                              </button>

                              {/* Stock status pill */}
                              <span
                                style={{
                                  position: 'absolute',
                                  bottom: '8px',
                                  left: '8px',
                                  background:
                                    (p.countInStock || 0) > 0
                                      ? 'rgba(16, 185, 129, 0.92)'
                                      : 'rgba(239, 68, 68, 0.92)',
                                  color: '#ffffff',
                                  fontSize: '0.68rem',
                                  fontWeight: 600,
                                  padding: '0.15rem 0.45rem',
                                  borderRadius: '4px',
                                }}
                              >
                                {(p.countInStock || 0) > 0 ? `Stock: ${p.countInStock}` : 'Out of Stock'}
                              </span>
                            </div>

                            {/* Info */}
                            <div style={{ padding: '0.9rem', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  color: '#688c99',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  marginBottom: '0.2rem',
                                }}
                              >
                                {p.fabric || 'Pure Silk & Zari'}
                              </span>
                              <h4
                                title={p.name}
                                style={{
                                  margin: '0 0 0.35rem',
                                  fontSize: '1.05rem',
                                  fontFamily: 'Cormorant Garamond, serif',
                                  fontWeight: 700,
                                  color: '#092330',
                                  lineHeight: '1.25',
                                  minHeight: '2.5rem',
                                  maxHeight: '2.5rem',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {p.name}
                              </h4>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'baseline',
                                  gap: '0.4rem',
                                  marginBottom: '0.75rem',
                                }}
                              >
                                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#092330' }}>
                                  ₹{(p.price || 0).toLocaleString('en-IN')}
                                </span>
                                {p.originalPrice > p.price && (
                                  <span style={{ fontSize: '0.78rem', color: '#93b6c2', textDecoration: 'line-through' }}>
                                    ₹{p.originalPrice.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>

                              {/* Buttons */}
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 1fr',
                                  gap: '0.45rem',
                                  marginTop: 'auto',
                                  paddingTop: '0.65rem',
                                  borderTop: '1px solid #edf4f7',
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartEditProduct(p);
                                  }}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.3rem',
                                    padding: '0.4rem 0.5rem',
                                    borderRadius: '5px',
                                    background: 'rgba(212, 175, 55, 0.1)',
                                    color: '#092330',
                                    border: '1px solid #d4af37',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                >
                                  <Edit size={12} /> Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProduct(productId);
                                  }}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.3rem',
                                    padding: '0.4rem 0.5rem',
                                    borderRadius: '5px',
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    color: '#b91c1c',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                >
                                  <Trash2 size={12} /> Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
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
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
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
                                <button
                                  type="button"
                                  onClick={() => handleDeleteOrder(order._id)}
                                  title="Permanently Delete Order"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0.35rem 0.5rem',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(239, 68, 68, 0.35)',
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    color: '#dc2626',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                  }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
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

                        {/* Status Updater & Delete Action */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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

                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(order._id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.4rem 0.75rem',
                              borderRadius: '6px',
                              border: '1px solid rgba(239, 68, 68, 0.35)',
                              background: 'rgba(239, 68, 68, 0.08)',
                              color: '#dc2626',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <Trash2 size={13} /> Delete Order
                          </button>
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      {editingProduct && (
                        <>
                          <a
                            href={`/products/${editingProduct.id || editingProduct._id}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.55rem 0.85rem',
                              borderRadius: '6px',
                              border: '1px solid #dce8ec',
                              background: '#ffffff',
                              color: '#092330',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              textDecoration: 'none',
                            }}
                            title="Preview saree on live store"
                          >
                            <ExternalLink size={14} style={{ color: '#d4af37' }} /> Live PDP
                          </a>
                          <button
                            type="button"
                            onClick={async () => {
                              const pId = editingProduct.id || editingProduct._id;
                              if (confirm(`Permanently delete "${productFormData.name || 'this saree'}" from catalog?`)) {
                                await handleDeleteProduct(pId);
                                setIsEditingProductView(false);
                                setEditingProduct(null);
                              }
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.55rem 0.85rem',
                              borderRadius: '6px',
                              border: '1px solid #fca5a5',
                              background: '#fef2f2',
                              color: '#b91c1c',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                            title="Delete this saree piece"
                          >
                            <Trash2 size={14} /> Delete Saree
                          </button>
                        </>
                      )}
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                              <label
                                style={{
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  color: '#092330',
                                }}
                              >
                                Saree Title / Piece Name *
                              </label>
                              {productTouched.name && productNameVal.valid && (
                                <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>✓ Valid Title</span>
                              )}
                            </div>
                            <input
                              required
                              type="text"
                              placeholder="e.g. Royal Emerald Kanjivaram Heirloom"
                              value={productFormData.name}
                              onBlur={() => setProductTouched((p) => ({ ...p, name: true }))}
                              onChange={(e) => {
                                setProductFormData({ ...productFormData, name: e.target.value });
                                if (!productTouched.name) setProductTouched((p) => ({ ...p, name: true }));
                              }}
                              style={{
                                width: '100%',
                                padding: '0.7rem 0.85rem',
                                borderRadius: '6px',
                                border: productTouched.name ? (!productNameVal.valid ? '1.5px solid #ef4444' : '1.5px solid #10b981') : '1px solid #d4af37',
                                boxShadow: productTouched.name && !productNameVal.valid ? '0 0 0 1px #ef4444' : '0 1px 3px rgba(0,0,0,0.02)',
                                fontSize: '0.95rem',
                                color: '#092330',
                                outline: 'none',
                              }}
                            />
                            {productTouched.name && !productNameVal.valid && (
                              <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '3px', display: 'block' }}>
                                {productNameVal.error}
                              </span>
                            )}
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                              <label
                                style={{
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  color: '#092330',
                                }}
                              >
                                Collection Category *
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsCreatingNewCategory(!isCreatingNewCategory);
                                  if (!isCreatingNewCategory) {
                                    setNewCategoryName('');
                                  }
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#b89025',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                }}
                              >
                                {isCreatingNewCategory ? '← Choose Existing Category' : '+ Create New Category'}
                              </button>
                            </div>

                            {isCreatingNewCategory ? (
                              <div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  <input
                                    required
                                    type="text"
                                    placeholder="Type new category name (e.g. Chanderi, Pure Organza, Katan Silk...)"
                                    value={newCategoryName}
                                    onBlur={() => setProductTouched((p) => ({ ...p, category: true }))}
                                    onChange={(e) => {
                                      setNewCategoryName(e.target.value);
                                      setProductFormData((prev) => ({ ...prev, category: e.target.value }));
                                      if (!productTouched.category) setProductTouched((p) => ({ ...p, category: true }));
                                    }}
                                    style={{
                                      flex: 1,
                                      padding: '0.7rem 0.85rem',
                                      borderRadius: '6px',
                                      border: productTouched.category
                                        ? (!productCatVal.valid ? '1.5px solid #ef4444' : '1.5px solid #10b981')
                                        : '2px solid #d4af37',
                                      boxShadow: productTouched.category && !productCatVal.valid ? '0 0 0 1px #ef4444' : '0 2px 6px rgba(212, 175, 55, 0.15)',
                                      fontSize: '0.9rem',
                                      color: '#092330',
                                      background: '#fffdf6',
                                      outline: 'none',
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsCreatingNewCategory(false);
                                      setNewCategoryName('');
                                    }}
                                    style={{
                                      padding: '0.65rem 0.85rem',
                                      borderRadius: '6px',
                                      border: '1px solid #dce8ec',
                                      background: '#f8fafb',
                                      fontSize: '0.8rem',
                                      fontWeight: 600,
                                      color: '#527482',
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                                {productTouched.category && !productCatVal.valid && (
                                  <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '3px', display: 'block' }}>
                                    {productCatVal.error}
                                  </span>
                                )}
                                <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: '#688c99' }}>
                                  ✨ This new category will automatically be saved and will immediately update the Home page, Collection filters, and Admin dashboard.
                                </p>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <select
                                  value={productFormData.category}
                                  onChange={(e) => {
                                    if (e.target.value === '__CREATE_NEW__') {
                                      setIsCreatingNewCategory(true);
                                      setNewCategoryName('');
                                    } else {
                                      setProductFormData({ ...productFormData, category: e.target.value });
                                    }
                                  }}
                                  style={{
                                    flex: 1,
                                    padding: '0.7rem 0.85rem',
                                    borderRadius: '6px',
                                    border: '1px solid #dce8ec',
                                    fontSize: '0.9rem',
                                    color: '#092330',
                                    background: '#ffffff',
                                  }}
                                >
                                  {Array.from(
                                    new Set([
                                      'Bridal & Heirloom Silks',
                                      'Silk',
                                      'Festive',
                                      'Everyday',
                                      'Bridal',
                                      'Royal Kanjivaram',
                                      'Banarasi Heritage',
                                      'Chanderi Radiance',
                                      'Contemporary Organza',
                                      ...products.map((p) => p.category).filter(Boolean),
                                      ...(productFormData.category ? [productFormData.category] : []),
                                    ])
                                  ).map((cat) => (
                                    <option key={cat} value={cat}>
                                      {cat}
                                    </option>
                                  ))}
                                  <option value="__CREATE_NEW__" style={{ fontWeight: 700, color: '#d4af37' }}>
                                    + Create New Category...
                                  </option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsCreatingNewCategory(true);
                                    setNewCategoryName('');
                                  }}
                                  style={{
                                    padding: '0.65rem 0.85rem',
                                    borderRadius: '6px',
                                    border: '1px solid #d4af37',
                                    background: 'rgba(212, 175, 55, 0.1)',
                                    color: '#092330',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  + New Category
                                </button>
                              </div>
                            )}
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                              <label
                                style={{
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  color: '#092330',
                                }}
                              >
                                Selling Price (₹) *
                              </label>
                              {productTouched.price && productPriceVal.valid && (
                                <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>✓ Valid Price</span>
                              )}
                            </div>
                            <input
                              required
                              type="number"
                              min="0"
                              placeholder="32000"
                              value={productFormData.price}
                              onBlur={() => setProductTouched((p) => ({ ...p, price: true }))}
                              onChange={(e) => {
                                setProductFormData({ ...productFormData, price: Number(e.target.value) });
                                if (!productTouched.price) setProductTouched((p) => ({ ...p, price: true }));
                              }}
                              style={{
                                width: '100%',
                                padding: '0.7rem 0.85rem',
                                borderRadius: '6px',
                                border: productTouched.price
                                  ? (!productPriceVal.valid ? '1.5px solid #ef4444' : '1.5px solid #10b981')
                                  : '1px solid #dce8ec',
                                boxShadow: productTouched.price && !productPriceVal.valid ? '0 0 0 1px #ef4444' : 'none',
                                fontSize: '0.95rem',
                                color: '#092330',
                                fontWeight: 600,
                                outline: 'none',
                              }}
                            />
                            {productTouched.price && !productPriceVal.valid && (
                              <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '3px', display: 'block' }}>
                                {productPriceVal.error}
                              </span>
                            )}
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                              <label
                                style={{
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  color: '#092330',
                                }}
                              >
                                Fabric Type *
                              </label>
                              {productTouched.fabric && productFabricVal.valid && (
                                <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>✓ Valid Fabric</span>
                              )}
                            </div>
                            <input
                              type="text"
                              placeholder="Pure Mulberry Silk"
                              value={productFormData.fabric}
                              onBlur={() => setProductTouched((p) => ({ ...p, fabric: true }))}
                              onChange={(e) => {
                                setProductFormData({ ...productFormData, fabric: e.target.value });
                                if (!productTouched.fabric) setProductTouched((p) => ({ ...p, fabric: true }));
                              }}
                              style={{
                                width: '100%',
                                padding: '0.7rem 0.85rem',
                                borderRadius: '6px',
                                border: productTouched.fabric
                                  ? (!productFabricVal.valid ? '1.5px solid #ef4444' : '1.5px solid #10b981')
                                  : '1px solid #dce8ec',
                                boxShadow: productTouched.fabric && !productFabricVal.valid ? '0 0 0 1px #ef4444' : 'none',
                                fontSize: '0.9rem',
                                color: '#092330',
                                outline: 'none',
                              }}
                            />
                            {productTouched.fabric && !productFabricVal.valid && (
                              <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '3px', display: 'block' }}>
                                {productFabricVal.error}
                              </span>
                            )}
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                              <label
                                style={{
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  color: '#092330',
                                }}
                              >
                                Primary Drape Color *
                              </label>
                              {productTouched.color && productColorVal.valid && (
                                <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>✓ Valid Color</span>
                              )}
                            </div>
                            <input
                              type="text"
                              placeholder="Crimson Vermillion"
                              value={productFormData.color}
                              onBlur={() => setProductTouched((p) => ({ ...p, color: true }))}
                              onChange={(e) => {
                                setProductFormData({ ...productFormData, color: e.target.value });
                                if (!productTouched.color) setProductTouched((p) => ({ ...p, color: true }));
                              }}
                              style={{
                                width: '100%',
                                padding: '0.7rem 0.85rem',
                                borderRadius: '6px',
                                border: productTouched.color
                                  ? (!productColorVal.valid ? '1.5px solid #ef4444' : '1.5px solid #10b981')
                                  : '1px solid #dce8ec',
                                boxShadow: productTouched.color && !productColorVal.valid ? '0 0 0 1px #ef4444' : 'none',
                                fontSize: '0.9rem',
                                color: '#092330',
                                outline: 'none',
                              }}
                            />
                            {productTouched.color && !productColorVal.valid && (
                              <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '3px', display: 'block' }}>
                                {productColorVal.error}
                              </span>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <h3
                            style={{
                              margin: 0,
                              fontSize: '1.1rem',
                              fontFamily: 'Cormorant Garamond, serif',
                              fontWeight: 700,
                              color: '#092330',
                            }}
                          >
                            Heritage Story & Craftsmanship *
                          </h3>
                          {productTouched.detail && productDetailVal.valid && (
                            <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>✓ Story Verified</span>
                          )}
                        </div>
                        <textarea
                          required
                          rows={4}
                          placeholder="Exquisitely hand-woven pure silk drape adorned with royal antique gold zari detailing. Inspired by timeless temple aesthetics and handcrafted for celebratory grandeur…"
                          value={productFormData.detail}
                          onBlur={() => setProductTouched((p) => ({ ...p, detail: true }))}
                          onChange={(e) => {
                            setProductFormData({ ...productFormData, detail: e.target.value });
                            if (!productTouched.detail) setProductTouched((p) => ({ ...p, detail: true }));
                          }}
                          style={{
                            width: '100%',
                            padding: '0.75rem 0.85rem',
                            borderRadius: '6px',
                            border: productTouched.detail
                              ? (!productDetailVal.valid ? '1.5px solid #ef4444' : '1.5px solid #10b981')
                              : '1px solid #dce8ec',
                            boxShadow: productTouched.detail && !productDetailVal.valid ? '0 0 0 1px #ef4444' : 'none',
                            fontSize: '0.9rem',
                            color: '#092330',
                            lineHeight: '1.5',
                            outline: 'none',
                          }}
                        />
                        {productTouched.detail && !productDetailVal.valid && (
                          <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '3px', display: 'block' }}>
                            {productDetailVal.error}
                          </span>
                        )}

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

                      {/* Card 5: Atelier Specifications & Drape Details (PDP Product Details Tab) */}
                      <div
                        style={{
                          background: '#ffffff',
                          borderRadius: '0.75rem',
                          border: '1px solid #dce8ec',
                          padding: '1.5rem',
                          boxShadow: '0 2px 8px rgba(9, 35, 48, 0.03)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                          <h3
                            style={{
                              margin: 0,
                              fontSize: '1.1rem',
                              fontFamily: 'Cormorant Garamond, serif',
                              fontWeight: 700,
                              color: '#092330',
                            }}
                          >
                            Atelier Specifications (Product Details Tab)
                          </h3>
                          <span style={{ fontSize: '0.72rem', color: '#688c99', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                            PDP Tab 1 Data
                          </span>
                        </div>
                        <p style={{ margin: '0 0 1rem', fontSize: '0.78rem', color: '#688c99' }}>
                          These values dynamically populate the specification table shown under the 'Product Details' tab on the live saree page.
                        </p>

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
                              Zari Authenticity
                            </label>
                            <input
                              type="text"
                              placeholder="Certified Tested Gold Zari"
                              value={productFormData.zariAuthenticity}
                              onChange={(e) =>
                                setProductFormData({ ...productFormData, zariAuthenticity: e.target.value })
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
                              Blouse Piece Specification
                            </label>
                            <input
                              type="text"
                              placeholder="Included (Matching Unstitched Pure Silk, 0.8m)"
                              value={productFormData.blousePiece}
                              onChange={(e) =>
                                setProductFormData({ ...productFormData, blousePiece: e.target.value })
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

                        <div style={{ marginBottom: '1.25rem' }}>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color: '#092330',
                              marginBottom: '0.35rem',
                            }}
                          >
                            Total Drape Length
                          </label>
                          <input
                            type="text"
                            placeholder="6.3 Metres (including blouse)"
                            value={productFormData.drapeLength}
                            onChange={(e) =>
                              setProductFormData({ ...productFormData, drapeLength: e.target.value })
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

                        {/* Custom Specifications Dynamic List */}
                        <div style={{ borderTop: '1px solid #eef2f5', paddingTop: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.3rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#092330' }}>
                              Custom Specification Rows
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#688c99' }}>
                              Optional bespoke metrics (e.g., Weave Cluster, Pallu Motif)
                            </span>
                          </div>

                          {/* Existing Custom Specs */}
                          {productFormData.customSpecs && productFormData.customSpecs.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                              {productFormData.customSpecs.map((spec, sIdx) => (
                                <div
                                  key={sIdx}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 0.75rem',
                                    background: '#f8fafc',
                                    borderRadius: '6px',
                                    border: '1px solid #e2e8f0',
                                  }}
                                >
                                  <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#092330', minWidth: '130px' }}>
                                    {spec.label}:
                                  </span>
                                  <span style={{ fontSize: '0.82rem', color: '#527482', flex: 1 }}>
                                    {spec.value}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCustomSpec(sIdx)}
                                    title="Delete specification"
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#ef4444',
                                      cursor: 'pointer',
                                      padding: '3px 6px',
                                      borderRadius: '4px',
                                      display: 'flex',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Custom Spec Row Inputs */}
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr auto',
                              gap: '0.5rem',
                              alignItems: 'center',
                              background: '#f8fafc',
                              padding: '0.75rem',
                              borderRadius: '6px',
                              border: '1px dashed #cbd5e1',
                            }}
                          >
                            <input
                              type="text"
                              placeholder="Row Title (e.g. Origin / Cluster)"
                              value={newSpecLabel}
                              onChange={(e) => setNewSpecLabel(e.target.value)}
                              style={{
                                padding: '0.55rem 0.65rem',
                                borderRadius: '6px',
                                border: '1px solid #dce8ec',
                                fontSize: '0.82rem',
                                color: '#092330',
                              }}
                            />
                            <input
                              type="text"
                              placeholder="Value (e.g. Kanchipuram, Tamil Nadu)"
                              value={newSpecValue}
                              onChange={(e) => setNewSpecValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddCustomSpec();
                                }
                              }}
                              style={{
                                padding: '0.55rem 0.65rem',
                                borderRadius: '6px',
                                border: '1px solid #dce8ec',
                                fontSize: '0.82rem',
                                color: '#092330',
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleAddCustomSpec}
                              disabled={!newSpecLabel.trim() || !newSpecValue.trim()}
                              style={{
                                padding: '0.55rem 0.95rem',
                                borderRadius: '6px',
                                border: '1px solid #d4af37',
                                background: 'rgba(212, 175, 55, 0.12)',
                                color: '#092330',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                cursor: !newSpecLabel.trim() || !newSpecValue.trim() ? 'not-allowed' : 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              + Add Row
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Card 6: PDP Policy & Care Tabs Content */}
                      <div
                        style={{
                          background: '#ffffff',
                          borderRadius: '0.75rem',
                          border: '1px solid #dce8ec',
                          padding: '1.5rem',
                          boxShadow: '0 2px 8px rgba(9, 35, 48, 0.03)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                          <h3
                            style={{
                              margin: 0,
                              fontSize: '1.1rem',
                              fontFamily: 'Cormorant Garamond, serif',
                              fontWeight: 700,
                              color: '#092330',
                            }}
                          >
                            PDP Tabs Content (Fabric & Care · Delivery & Returns)
                          </h3>
                          <span style={{ fontSize: '0.72rem', color: '#688c99', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                            PDP Tabs 2 & 3
                          </span>
                        </div>
                        <p style={{ margin: '0 0 1rem', fontSize: '0.78rem', color: '#688c99' }}>
                          Edit or update the complete policy narratives displayed to buyers in the tab switchers below the saree.
                        </p>

                        <div style={{ marginBottom: '1.25rem' }}>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color: '#092330',
                              marginBottom: '0.35rem',
                            }}
                          >
                            Fabric & Care Instructions (Tab 2 Content)
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Dry Clean Only to maintain the sheen and longevity of authentic handwoven pure zari silk. Store folded in a breathable cotton or muslin bag…"
                            value={productFormData.careInstructions}
                            onChange={(e) =>
                              setProductFormData({ ...productFormData, careInstructions: e.target.value })
                            }
                            style={{
                              width: '100%',
                              padding: '0.7rem 0.85rem',
                              borderRadius: '6px',
                              border: '1px solid #dce8ec',
                              fontSize: '0.85rem',
                              color: '#092330',
                              lineHeight: '1.5',
                              outline: 'none',
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
                            Delivery, Shipping & Returns Policy (Tab 3 Content)
                          </label>
                          <textarea
                            rows={3}
                            placeholder="All authentic heirloom sarees are dispatched in tamper-evident luxury keepsake boxes with complimentary insured domestic courier (3-5 business days)…"
                            value={productFormData.shippingReturns}
                            onChange={(e) =>
                              setProductFormData({ ...productFormData, shippingReturns: e.target.value })
                            }
                            style={{
                              width: '100%',
                              padding: '0.7rem 0.85rem',
                              borderRadius: '6px',
                              border: '1px solid #dce8ec',
                              fontSize: '0.85rem',
                              color: '#092330',
                              lineHeight: '1.5',
                              outline: 'none',
                            }}
                          />
                        </div>
                      </div>

                      {/* Card 7: WhatsApp Concierge, Trust Highlights & Badges */}
                      <div
                        style={{
                          background: '#ffffff',
                          borderRadius: '0.75rem',
                          border: '1px solid #dce8ec',
                          padding: '1.5rem',
                          boxShadow: '0 2px 8px rgba(9, 35, 48, 0.03)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                          <h3
                            style={{
                              margin: 0,
                              fontSize: '1.1rem',
                              fontFamily: 'Cormorant Garamond, serif',
                              fontWeight: 700,
                              color: '#092330',
                            }}
                          >
                            WhatsApp Concierge & Key Trust Highlights
                          </h3>
                          <span style={{ fontSize: '0.72rem', color: '#688c99', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                            Interactive Action Items
                          </span>
                        </div>
                        <p style={{ margin: '0 0 1rem', fontSize: '0.78rem', color: '#688c99' }}>
                          Manage the WhatsApp stylist button text and phone destination, trust chips, and product certification badges.
                        </p>

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
                              WhatsApp Concierge Button Text
                            </label>
                            <input
                              type="text"
                              placeholder="Questions? Chat with Bamas Stylist on WhatsApp"
                              value={productFormData.whatsappText}
                              onChange={(e) =>
                                setProductFormData({ ...productFormData, whatsappText: e.target.value })
                              }
                              style={{
                                width: '100%',
                                padding: '0.7rem 0.85rem',
                                borderRadius: '6px',
                                border: '1px solid #dce8ec',
                                fontSize: '0.88rem',
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
                              WhatsApp Phone Number (with Country Code)
                            </label>
                            <input
                              type="text"
                              placeholder="919876543210"
                              value={productFormData.whatsappNumber}
                              onChange={(e) =>
                                setProductFormData({ ...productFormData, whatsappNumber: e.target.value })
                              }
                              style={{
                                width: '100%',
                                padding: '0.7rem 0.85rem',
                                borderRadius: '6px',
                                border: '1px solid #dce8ec',
                                fontSize: '0.88rem',
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
                            marginBottom: '1.25rem',
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
                              Certification Badge Notice
                            </label>
                            <input
                              type="text"
                              placeholder="Silk Mark Certified · 100% Pure Silk"
                              value={productFormData.certificationNotice}
                              onChange={(e) =>
                                setProductFormData({ ...productFormData, certificationNotice: e.target.value })
                              }
                              style={{
                                width: '100%',
                                padding: '0.7rem 0.85rem',
                                borderRadius: '6px',
                                border: '1px solid #dce8ec',
                                fontSize: '0.88rem',
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
                              Taxes & Dispatch Badge Notice
                            </label>
                            <input
                              type="text"
                              placeholder="Taxes Included · Free Insured Dispatch"
                              value={productFormData.taxNotice}
                              onChange={(e) =>
                                setProductFormData({ ...productFormData, taxNotice: e.target.value })
                              }
                              style={{
                                width: '100%',
                                padding: '0.7rem 0.85rem',
                                borderRadius: '6px',
                                border: '1px solid #dce8ec',
                                fontSize: '0.88rem',
                                color: '#092330',
                              }}
                            />
                          </div>
                        </div>

                        {/* Key Trust Highlights Chips Manager */}
                        <div style={{ borderTop: '1px solid #eef2f5', paddingTop: '1rem' }}>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color: '#092330',
                              marginBottom: '0.35rem',
                            }}
                          >
                            Key Trust Highlights (Pills below title on live page)
                          </label>

                          {/* Existing Highlights */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            {productFormData.highlights && productFormData.highlights.map((hl, hIdx) => (
                              <span
                                key={hIdx}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  padding: '0.35rem 0.7rem',
                                  borderRadius: '999px',
                                  background: 'rgba(212, 175, 55, 0.12)',
                                  border: '1px solid rgba(212, 175, 55, 0.4)',
                                  color: '#092330',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                }}
                              >
                                {hl}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveHighlight(hIdx)}
                                  title="Remove highlight"
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#688c99',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    lineHeight: 1,
                                    padding: '0 2px',
                                  }}
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>

                          {/* Add Highlight Input */}
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                              type="text"
                              placeholder="New highlight (e.g. Free Delivery in 3–5 Days, Tested Gold Zari)"
                              value={newHighlightInput}
                              onChange={(e) => setNewHighlightInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddHighlight();
                                }
                              }}
                              style={{
                                flex: 1,
                                padding: '0.55rem 0.75rem',
                                borderRadius: '6px',
                                border: '1px solid #dce8ec',
                                fontSize: '0.82rem',
                                color: '#092330',
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleAddHighlight}
                              disabled={!newHighlightInput.trim()}
                              style={{
                                padding: '0.55rem 0.95rem',
                                borderRadius: '6px',
                                border: '1px solid #d4af37',
                                background: 'rgba(212, 175, 55, 0.12)',
                                color: '#092330',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                cursor: !newHighlightInput.trim() ? 'not-allowed' : 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              + Add Highlight
                            </button>
                          </div>
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
                          <span
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: '#092330',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}
                          >
                            1. Primary Cover Photo *
                          </span>

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
                                Uploading Cover to Cloudinary...
                              </>
                            ) : (
                              <>📁 Choose Primary Cover Photo & Upload</>
                            )}
                          </button>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                              <label
                                style={{
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  color: '#688c99',
                                }}
                              >
                                Or paste direct Primary Cover Image URL:
                              </label>
                              {productFormData.image && (
                                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>✓ Image Set</span>
                              )}
                            </div>
                            <input
                              required
                              type="text"
                              placeholder="https://res.cloudinary.com/... or https://images.unsplash.com/..."
                              value={productFormData.image}
                              onBlur={() => setProductTouched((prev) => ({ ...prev, image: true }))}
                              onChange={(e) => {
                                const val = e.target.value;
                                setProductFormData((prev) => ({
                                  ...prev,
                                  image: val,
                                  images: Array.from(new Set([val, ...(prev.images || [])])),
                                }));
                                if (!productTouched.image) setProductTouched((prev) => ({ ...prev, image: true }));
                              }}
                              style={{
                                width: '100%',
                                padding: '0.65rem',
                                borderRadius: '6px',
                                border: productTouched.image
                                  ? (!productFormData.image ? '1.5px solid #ef4444' : '1.5px solid #10b981')
                                  : '1px solid #dce8ec',
                                fontSize: '0.82rem',
                                color: '#092330',
                                outline: 'none',
                              }}
                            />
                            {productTouched.image && !productFormData.image && (
                              <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '3px', display: 'block' }}>
                                A primary cover image is required to publish this saree.
                              </span>
                            )}
                          </div>

                          {/* SECTION 2: RELATED ANGLES & DETAIL PHOTOS */}
                          <div
                            style={{
                              marginTop: '0.75rem',
                              paddingTop: '1rem',
                              borderTop: '1px solid #eef2f5',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '0.4rem',
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
                                2. Related Angles & Detail Photos (Stored in DB)
                              </span>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  background: 'rgba(212, 175, 55, 0.15)',
                                  color: '#966d12',
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '9999px',
                                  fontWeight: 700,
                                }}
                              >
                                {productFormData.images?.length || 1} Photo(s)
                              </span>
                            </div>
                            <p
                              style={{
                                fontSize: '0.76rem',
                                color: '#688c99',
                                margin: '0 0 0.85rem',
                                lineHeight: '1.4',
                              }}
                            >
                              Add multiple photos (pallu weave, border closeup, blouse piece). These appear directly below the main image in the saree details page for customer previews.
                            </p>

                            <input
                              type="file"
                              id="studio-related-image-picker"
                              accept="image/*"
                              multiple
                              style={{ display: 'none' }}
                              onChange={handleRelatedImagesFileChange}
                            />

                            <button
                              type="button"
                              disabled={uploadingRelatedImage}
                              onClick={() =>
                                document.getElementById('studio-related-image-picker')?.click()
                              }
                              style={{
                                width: '100%',
                                padding: '0.65rem 0.85rem',
                                borderRadius: '6px',
                                border: '1px solid #0e303d',
                                background: '#0e303d',
                                color: '#ffffff',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                cursor: uploadingRelatedImage ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.45rem',
                                marginBottom: '0.75rem',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              {uploadingRelatedImage ? (
                                <>
                                  <RefreshCw
                                    size={15}
                                    className="animate-spin"
                                    style={{ color: '#d4af37' }}
                                  />{' '}
                                  Uploading Related Photos...
                                </>
                              ) : (
                                <>+ Upload Additional Angle Photos (Select Multiple)</>
                              )}
                            </button>

                            {/* Direct URL input for related photo */}
                            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
                              <input
                                type="text"
                                placeholder="Or paste additional photo URL..."
                                value={newRelatedImageUrl}
                                onChange={(e) => setNewRelatedImageUrl(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddRelatedImageUrl();
                                  }
                                }}
                                style={{
                                  flex: 1,
                                  padding: '0.55rem 0.65rem',
                                  borderRadius: '6px',
                                  border: '1px solid #dce8ec',
                                  fontSize: '0.8rem',
                                  color: '#092330',
                                }}
                              />
                              <button
                                type="button"
                                onClick={handleAddRelatedImageUrl}
                                style={{
                                  padding: '0.55rem 0.85rem',
                                  borderRadius: '6px',
                                  border: '1px solid #d4af37',
                                  background: 'rgba(212, 175, 55, 0.12)',
                                  color: '#092330',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                + Add
                              </button>
                            </div>

                            {/* Gallery List of all attached photos */}
                            {productFormData.images && productFormData.images.length > 0 && (
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                                  gap: '0.65rem',
                                  maxHeight: '260px',
                                  overflowY: 'auto',
                                  padding: '0.4rem',
                                  background: '#f8fafc',
                                  borderRadius: '8px',
                                  border: '1px solid #e2e8f0',
                                }}
                              >
                                {productFormData.images.map((imgUrl, idx) => {
                                  const isPrimary =
                                    imgUrl === productFormData.image ||
                                    (!productFormData.image && idx === 0);
                                  return (
                                    <div
                                      key={idx}
                                      style={{
                                        position: 'relative',
                                        borderRadius: '6px',
                                        overflow: 'hidden',
                                        border: isPrimary
                                          ? '2px solid #d4af37'
                                          : '1px solid #dce8ec',
                                        boxShadow: isPrimary
                                          ? '0 0 0 2px rgba(212, 175, 55, 0.25)'
                                          : 'none',
                                        background: '#ffffff',
                                      }}
                                    >
                                      <img
                                        src={imgUrl}
                                        alt={`Saree angle ${idx + 1}`}
                                        style={{
                                          width: '100%',
                                          height: '80px',
                                          objectFit: 'cover',
                                          display: 'block',
                                        }}
                                      />
                                      {isPrimary ? (
                                        <div
                                          style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            background: 'rgba(9, 35, 48, 0.9)',
                                            color: '#d4af37',
                                            fontSize: '0.62rem',
                                            fontWeight: 700,
                                            textAlign: 'center',
                                            padding: '2px 0',
                                          }}
                                        >
                                          ★ Cover
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => handleSetPrimaryImage(imgUrl)}
                                          title="Set as Primary Cover Photo"
                                          style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            background: 'rgba(255, 255, 255, 0.92)',
                                            border: 'none',
                                            color: '#092330',
                                            fontSize: '0.6rem',
                                            fontWeight: 600,
                                            padding: '2px 0',
                                            cursor: 'pointer',
                                          }}
                                        >
                                          Make Cover
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveRelatedImage(idx)}
                                        title="Remove photo"
                                        style={{
                                          position: 'absolute',
                                          top: '3px',
                                          right: '3px',
                                          width: '18px',
                                          height: '18px',
                                          borderRadius: '50%',
                                          background: 'rgba(239, 68, 68, 0.9)',
                                          color: '#ffffff',
                                          border: 'none',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontSize: '11px',
                                          lineHeight: 1,
                                          cursor: 'pointer',
                                        }}
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
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

                  {filteredProducts.length === 0 ? (
                    <div
                      style={{
                        padding: '3.5rem 1.5rem',
                        textAlign: 'center',
                        background: '#ffffff',
                        borderRadius: '0.75rem',
                        border: '1px dashed #cfdfe5',
                        boxShadow: '0 2px 8px rgba(9, 35, 48, 0.03)',
                      }}
                    >
                      <ShoppingBag size={36} style={{ color: '#d4af37', margin: '0 auto 0.75rem' }} />
                      <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', color: '#092330' }}>
                        {productSearch ? 'No sarees match your search' : 'No collections loaded yet'}
                      </h4>
                      <p style={{ margin: '0 auto 1.25rem', maxWidth: '420px', fontSize: '0.85rem', color: '#688c99' }}>
                        {productSearch
                          ? `No sarees found matching "${productSearch}". Try clearing your search.`
                          : 'Click below to load the live collection catalog from MongoDB.'}
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        {productSearch && (
                          <Button variant="outline" size="sm" onClick={() => setProductSearch('')}>
                            Clear Search
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => fetchAllData()}
                          style={{
                            background: '#092330',
                            color: '#d4af37',
                            border: '1px solid #d4af37',
                          }}
                        >
                          <RefreshCw size={14} className="mr-1" /> Refresh from Database
                        </Button>
                      </div>
                    </div>
                  ) : (
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
                    onClick={() => handleStartEditProduct(p)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleStartEditProduct(p);
                      }
                    }}
                    style={{
                      background: '#ffffff',
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                      border: '1px solid #dce8ec',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 2px 8px rgba(9, 35, 48, 0.04)',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 10px 24px rgba(9, 35, 48, 0.12)';
                      e.currentTarget.style.borderColor = '#d4af37';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(9, 35, 48, 0.04)';
                      e.currentTarget.style.borderColor = '#dce8ec';
                    }}
                    title={`Click to edit "${p.name}"`}
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
                        title={p.name}
                        style={{
                          margin: '0.25rem 0 0.35rem',
                          fontSize: '1.1rem',
                          fontFamily: 'Cormorant Garamond, serif',
                          fontWeight: 700,
                          color: '#092330',
                          lineHeight: '1.25',
                          minHeight: '2.75rem',
                          maxHeight: '2.75rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
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
                          minHeight: '2.25rem',
                          maxHeight: '2.25rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {p.detail || p.description}
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
                          marginTop: 'auto',
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProduct(p.id || p._id);
                          }}
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
            )}
          </div>
          )}
        </div>
      )}

          {/* TAB 4: CUSTOMERS & STAFF (FULL CRUD) */}
          {activeTab === 'customers' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ maxWidth: '380px', width: '100%', position: 'relative' }}>
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.82rem', color: '#688c99', fontWeight: 600 }}>
                    {filteredCustomers.length} Customer{filteredCustomers.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    type="button"
                    onClick={handleStartCreateCustomer}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.55rem 1rem',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #092330 0%, #123747 100%)',
                      color: '#d4af37',
                      border: '1px solid #d4af37',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(9, 35, 48, 0.15)',
                    }}
                  >
                    <Plus size={15} /> Add New Customer
                  </button>
                </div>
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
                                <div style={{ display: 'inline-flex', gap: '0.45rem', alignItems: 'center' }}>
                                  <button
                                    onClick={() => handleStartEditCustomer(c)}
                                    title="Edit Customer Details"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.3rem',
                                      padding: '0.35rem 0.65rem',
                                      borderRadius: '6px',
                                      border: '1px solid #dce8ec',
                                      background: '#f8fafb',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      color: '#092330',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s ease',
                                    }}
                                  >
                                    <Edit size={13} style={{ color: '#d4af37' }} /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(c.id || c._id)}
                                    title="Delete Customer Account"
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
                                <div style={{ display: 'inline-flex', gap: '0.45rem', alignItems: 'center' }}>
                                  <button
                                    onClick={() => handleStartEditCustomer(c)}
                                    title="Edit Your Administrator Profile"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.3rem',
                                      padding: '0.35rem 0.65rem',
                                      borderRadius: '6px',
                                      border: '1px solid rgba(212, 175, 55, 0.4)',
                                      background: 'rgba(212, 175, 55, 0.1)',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      color: '#092330',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <Edit size={13} style={{ color: '#d4af37' }} /> Edit
                                  </button>
                                  <span style={{ fontSize: '0.72rem', color: '#d4af37', fontWeight: 600 }}>
                                    (Active)
                                  </span>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Customer Create / Edit Modal Dialog */}
              <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
                <DialogContent
                  style={{
                    maxWidth: '540px',
                    width: '95vw',
                    padding: '1.75rem',
                    borderRadius: '1rem',
                    background: '#ffffff',
                    border: '1px solid #dce8ec',
                    boxShadow: '0 20px 50px rgba(9, 35, 48, 0.15)',
                    fontFamily: 'Manrope, sans-serif',
                  }}
                >
                  <DialogTitle
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '1.45rem',
                      fontWeight: 700,
                      color: '#092330',
                      margin: '0 0 0.25rem',
                    }}
                  >
                    {customerModalMode === 'create'
                      ? 'Add New Customer Account'
                      : `Edit Profile: ${editingCustomer?.name || 'Customer'}`}
                  </DialogTitle>
                  <p style={{ margin: '0 0 1.25rem', fontSize: '0.8rem', color: '#688c99' }}>
                    {customerModalMode === 'create'
                      ? 'Create an authenticated patron profile in MongoDB Atlas.'
                      : 'Update contact details, delivery address, or security password.'}
                  </p>

                  {customerFormError && (
                    <div
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '6px',
                        background: '#fef2f2',
                        border: '1px solid #fca5a5',
                        color: '#b91c1c',
                        fontSize: '0.82rem',
                        marginBottom: '1rem',
                      }}
                    >
                      {customerFormError}
                    </div>
                  )}

                  <form onSubmit={handleSaveCustomer}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                        gap: '0.85rem',
                        marginBottom: '0.85rem',
                      }}
                    >
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#092330', marginBottom: '0.3rem' }}>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Priya Sharma"
                          value={customerFormData.name}
                          onChange={(e) => setCustomerFormData({ ...customerFormData, name: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid #dce8ec',
                            fontSize: '0.88rem',
                            color: '#092330',
                            outline: 'none',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#092330', marginBottom: '0.3rem' }}>
                          Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="priya@example.com"
                          value={customerFormData.email}
                          onChange={(e) => setCustomerFormData({ ...customerFormData, email: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid #dce8ec',
                            fontSize: '0.88rem',
                            color: '#092330',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                        gap: '0.85rem',
                        marginBottom: '0.85rem',
                      }}
                    >
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#092330', marginBottom: '0.3rem' }}>
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={customerFormData.phone}
                          onChange={(e) => setCustomerFormData({ ...customerFormData, phone: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid #dce8ec',
                            fontSize: '0.88rem',
                            color: '#092330',
                            outline: 'none',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#092330', marginBottom: '0.3rem' }}>
                          {customerModalMode === 'create' ? 'Set Password *' : 'Update Password (optional)'}
                        </label>
                        <input
                          type="password"
                          placeholder={customerModalMode === 'create' ? 'Minimum 6 characters' : 'Leave blank to preserve current password'}
                          value={customerFormData.password}
                          onChange={(e) => setCustomerFormData({ ...customerFormData, password: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid #dce8ec',
                            fontSize: '0.88rem',
                            color: '#092330',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>

                    {/* Delivery Address Fields */}
                    <div style={{ borderTop: '1px solid #edf4f7', paddingTop: '0.85rem', marginBottom: '1.25rem' }}>
                      <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#092330', marginBottom: '0.5rem' }}>
                        Default Delivery Address
                      </span>
                      <div style={{ marginBottom: '0.6rem' }}>
                        <input
                          type="text"
                          placeholder="Street Address / Suite"
                          value={customerFormData.street}
                          onChange={(e) => setCustomerFormData({ ...customerFormData, street: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.55rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid #dce8ec',
                            fontSize: '0.85rem',
                            color: '#092330',
                          }}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                        <input
                          type="text"
                          placeholder="City"
                          value={customerFormData.city}
                          onChange={(e) => setCustomerFormData({ ...customerFormData, city: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.55rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid #dce8ec',
                            fontSize: '0.85rem',
                            color: '#092330',
                          }}
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={customerFormData.state}
                          onChange={(e) => setCustomerFormData({ ...customerFormData, state: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.55rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid #dce8ec',
                            fontSize: '0.85rem',
                            color: '#092330',
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Postal Code"
                          value={customerFormData.postalCode}
                          onChange={(e) => setCustomerFormData({ ...customerFormData, postalCode: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.55rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid #dce8ec',
                            fontSize: '0.85rem',
                            color: '#092330',
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCustomerModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={customerFormSaving}
                        style={{
                          background: 'linear-gradient(135deg, #092330 0%, #123747 100%)',
                          color: '#d4af37',
                          border: '1px solid #d4af37',
                          fontWeight: 600,
                        }}
                      >
                        {customerFormSaving ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" style={{ marginRight: '0.4rem' }} /> Saving...
                          </>
                        ) : customerModalMode === 'create' ? (
                          'Create Customer'
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* TAB: CUSTOMER REVIEWS & RATINGS */}
          {activeTab === 'reviews' && (
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
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#092330' }}>
                    Customer Reviews & Patron Photos ({reviews.length})
                  </h2>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#688c99' }}>
                    Verified patron star ratings, drape feedback, and real photos stored live in MongoDB Atlas.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={fetchAllData}
                    disabled={refreshing}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.55rem 0.95rem',
                      borderRadius: '0.5rem',
                      background: '#f8fafc',
                      color: '#092330',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
                    <span>{refreshing ? 'Syncing...' : 'Live Refresh'}</span>
                  </button>
                </div>
              </div>

              {/* Metrics KPI Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    border: '1px solid #dce8ec',
                    boxShadow: '0 2px 8px rgba(9, 35, 48, 0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '0.5rem',
                      background: 'linear-gradient(135deg, #092330 0%, #153c50 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#d4af37',
                    }}
                  >
                    <Star size={22} fill="#d4af37" />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#688c99', fontWeight: 600, textTransform: 'uppercase' }}>
                      Average Drape Score
                    </span>
                    <h3 style={{ margin: '0.1rem 0 0', fontSize: '1.45rem', fontWeight: 800, color: '#092330' }}>
                      {reviews.length > 0 ? `${(reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)} / 5.0` : '—'}
                    </h3>
                  </div>
                </div>

                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    border: '1px solid #dce8ec',
                    boxShadow: '0 2px 8px rgba(9, 35, 48, 0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '0.5rem',
                      background: '#ecfdf5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#059669',
                    }}
                  >
                    <CheckCircle size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#688c99', fontWeight: 600, textTransform: 'uppercase' }}>
                      Total Patron Reviews
                    </span>
                    <h3 style={{ margin: '0.1rem 0 0', fontSize: '1.45rem', fontWeight: 800, color: '#092330' }}>
                      {reviews.length} Verified
                    </h3>
                  </div>
                </div>

                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    border: '1px solid #dce8ec',
                    boxShadow: '0 2px 8px rgba(9, 35, 48, 0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '0.5rem',
                      background: '#eff6ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563eb',
                    }}
                  >
                    <Camera size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#688c99', fontWeight: 600, textTransform: 'uppercase' }}>
                      Reviews With Photos
                    </span>
                    <h3 style={{ margin: '0.1rem 0 0', fontSize: '1.45rem', fontWeight: 800, color: '#092330' }}>
                      {reviews.filter((r) => r.images && r.images.length > 0).length} Uploaded
                    </h3>
                  </div>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '0.75rem',
                  padding: '1rem 1.25rem',
                  border: '1px solid #dce8ec',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={reviewSearch}
                    onChange={(e) => setReviewSearch(e.target.value)}
                    placeholder="Search by patron name, saree, or review text..."
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem 0.5rem 36px',
                      borderRadius: '0.5rem',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                  {reviewSearch && (
                    <button
                      onClick={() => setReviewSearch('')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8',
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['All', '5', '4', '3', '2', '1', 'With Photos'].map((flt) => {
                    const active = reviewFilter === flt;
                    return (
                      <button
                        key={flt}
                        type="button"
                        onClick={() => setReviewFilter(flt)}
                        style={{
                          padding: '0.4rem 0.85rem',
                          borderRadius: '999px',
                          border: active ? '1px solid #092330' : '1px solid #dce8ec',
                          background: active ? '#092330' : '#ffffff',
                          color: active ? '#d4af37' : '#527482',
                          fontWeight: active ? 700 : 500,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        {flt === 'With Photos' ? (
                          <>
                            <Camera size={12} />
                            <span>With Photos ({reviews.filter((r) => r.images && r.images.length > 0).length})</span>
                          </>
                        ) : flt === 'All' ? (
                          <span>All Reviews ({reviews.length})</span>
                        ) : (
                          <>
                            <span>{flt} ★</span>
                            <span style={{ opacity: 0.7 }}>
                              ({reviews.filter((r) => Math.round(r.rating) === Number(flt)).length})
                            </span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List */}
              {(() => {
                const filteredReviews = reviews.filter((rev) => {
                  const matchSearch =
                    !reviewSearch ||
                    (rev.name || '').toLowerCase().includes(reviewSearch.toLowerCase()) ||
                    (rev.comment || '').toLowerCase().includes(reviewSearch.toLowerCase()) ||
                    (rev.productName || '').toLowerCase().includes(reviewSearch.toLowerCase());

                  if (!matchSearch) return false;

                  if (reviewFilter === 'All') return true;
                  if (reviewFilter === 'With Photos') return Boolean(rev.images && rev.images.length > 0);
                  const starNum = parseInt(reviewFilter, 10);
                  if (!isNaN(starNum)) return Math.round(rev.rating) === starNum;
                  return true;
                });

                if (filteredReviews.length === 0) {
                  return (
                    <div
                      style={{
                        background: '#ffffff',
                        borderRadius: '0.75rem',
                        padding: '3rem 1.5rem',
                        border: '1px solid #dce8ec',
                        textAlign: 'center',
                      }}
                    >
                      <Star size={36} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
                      <h4 style={{ margin: '0 0 0.35rem', fontSize: '1.1rem', fontWeight: 700, color: '#092330' }}>
                        No Reviews Match Filter
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#688c99' }}>
                        Customer ratings submitted upon delivery will automatically sync and appear here in real time.
                      </p>
                    </div>
                  );
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredReviews.map((rev) => {
                      const dateStr = rev.createdAt
                        ? new Date(rev.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Verified Purchase';

                      return (
                        <div
                          key={rev._id}
                          style={{
                            background: '#ffffff',
                            borderRadius: '0.75rem',
                            padding: '1.25rem 1.5rem',
                            border: '1px solid #dce8ec',
                            boxShadow: '0 2px 8px rgba(9, 35, 48, 0.03)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.85rem',
                          }}
                        >
                          {/* Card Header */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '0.75rem',
                              borderBottom: '1px solid #f1f5f9',
                              paddingBottom: '0.75rem',
                            }}
                          >
                            {/* Product Info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
                              <img
                                src={rev.productImage || ivorySaree}
                                alt={rev.productName}
                                style={{
                                  width: '44px',
                                  height: '56px',
                                  objectFit: 'cover',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  flexShrink: 0,
                                }}
                                onError={(e) => {
                                  e.currentTarget.src = ivorySaree;
                                }}
                              />
                              <div style={{ minWidth: 0 }}>
                                <span style={{ fontSize: '0.7rem', color: '#688c99', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                                  Reviewed Saree Piece
                                </span>
                                <h4 style={{ margin: '0 0 2px', fontSize: '0.95rem', fontWeight: 700, color: '#092330' }}>
                                  {rev.productName || 'Handloom Silk Saree'}
                                </h4>
                                {rev.productSlug && (
                                  <a
                                    href={`/products?saree=${rev.productSlug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      fontSize: '0.72rem',
                                      color: '#0e7490',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.2rem',
                                      textDecoration: 'none',
                                      fontWeight: 600,
                                    }}
                                  >
                                    <span>View on Storefront</span>
                                    <ExternalLink size={10} />
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Reviewer & Rating Badges */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      size={15}
                                      fill={s <= (rev.rating || 5) ? '#d4af37' : '#e2e8f0'}
                                      color={s <= (rev.rating || 5) ? '#d4af37' : '#cbd5e1'}
                                    />
                                  ))}
                                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#092330', marginLeft: '4px' }}>
                                    {rev.rating}.0
                                  </span>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>
                                  {dateStr}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteReview(rev.productId, rev._id)}
                                title="Delete customer review"
                                style={{
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  color: '#dc2626',
                                  border: '1px solid rgba(239, 68, 68, 0.25)',
                                  borderRadius: '6px',
                                  padding: '0.45rem',
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

                          {/* Reviewer Details Bar */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.82rem' }}>
                            <span style={{ fontWeight: 700, color: '#092330' }}>
                              By {rev.name || 'Valued Patron'}
                            </span>
                            <span style={{ color: '#cbd5e1' }}>•</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#059669', fontWeight: 600 }}>
                              <ShieldCheck size={13} /> Verified Atelier Purchase
                            </span>
                            {rev.order && (
                              <>
                                <span style={{ color: '#cbd5e1' }}>•</span>
                                <span style={{ fontFamily: 'monospace', color: '#64748b' }}>
                                  Order #{rev.order.toString().slice(-6).toUpperCase()}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Review Comment Text */}
                          <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            "{rev.comment}"
                          </p>

                          {/* Customer Uploaded Photos */}
                          {rev.images && Array.isArray(rev.images) && rev.images.length > 0 && (
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                                <Camera size={13} color="#d4af37" />
                                <span>Customer Uploaded Drape Photos ({rev.images.length})</span>
                              </div>
                              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                                {rev.images.map((imgUrl: string, pIdx: number) => (
                                  <div
                                    key={pIdx}
                                    onClick={() => setPreviewReviewPhoto(imgUrl)}
                                    style={{
                                      position: 'relative',
                                      width: '90px',
                                      height: '110px',
                                      borderRadius: '6px',
                                      overflow: 'hidden',
                                      border: '1px solid #cbd5e1',
                                      cursor: 'pointer',
                                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                                      transition: 'transform 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                  >
                                    <img src={imgUrl} alt={`Customer photo ${pIdx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div
                                      style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'rgba(0,0,0,0.25)',
                                        opacity: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'opacity 0.15s ease',
                                      }}
                                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                                    >
                                      <Maximize2 size={16} color="#ffffff" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
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

                        {/* Direct Concierge Messaging Action Bar */}
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.65rem',
                            alignItems: 'center',
                            paddingTop: '0.5rem',
                          }}
                        >
                          <button
                            onClick={() => handleToggleInquiryChat(inq._id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.45rem',
                              background: openInquiryChatId === inq._id ? '#d4af37' : '#092330',
                              color: openInquiryChatId === inq._id ? '#092330' : '#ffffff',
                              padding: '0.5rem 1rem',
                              borderRadius: '0.45rem',
                              border: '1px solid #d4af37',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(9, 35, 48, 0.2)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <MessageSquare size={14} style={{ color: openInquiryChatId === inq._id ? '#092330' : '#d4af37' }} />
                            <span>{openInquiryChatId === inq._id ? 'Close Direct Chat' : 'Direct Message'}</span>
                            {Array.isArray(inq.messages) && inq.messages.length > 0 && (
                              <span
                                style={{
                                  background: openInquiryChatId === inq._id ? '#092330' : '#d4af37',
                                  color: openInquiryChatId === inq._id ? '#ffffff' : '#092330',
                                  borderRadius: '999px',
                                  fontSize: '0.68rem',
                                  padding: '0.1rem 0.45rem',
                                  fontWeight: 800,
                                }}
                              >
                                {inq.messages.length}
                              </span>
                            )}
                          </button>

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

                          <button
                            onClick={() => handleDeleteInquiry(inq._id)}
                            title="Delete Inquiry"
                            style={{
                              marginLeft: 'auto',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              background: '#fef2f2',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                              padding: '0.5rem 0.75rem',
                              borderRadius: '0.45rem',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Interactive Direct Message Thread Drawer */}
                        {openInquiryChatId === inq._id && (
                          <div
                            style={{
                              marginTop: '1rem',
                              background: '#ffffff',
                              borderRadius: '0.75rem',
                              border: '1px solid #dce8ec',
                              boxShadow: '0 4px 20px rgba(9, 35, 48, 0.08)',
                              overflow: 'hidden',
                              animation: 'fadeIn 0.2s ease-in-out',
                            }}
                          >
                            {/* Chat Header */}
                            <div
                              style={{
                                padding: '0.75rem 1rem',
                                background: '#f8fafc',
                                borderBottom: '1px solid #edf2f7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span
                                  style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: '#22c55e',
                                    boxShadow: '0 0 8px #22c55e',
                                  }}
                                />
                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#092330' }}>
                                  Live Concierge Direct Message · {inq.name}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                Real-Time WebSocket Active
                              </span>
                            </div>

                            {/* Message Bubble History */}
                            <div
                              style={{
                                padding: '1rem',
                                maxHeight: '280px',
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem',
                                background: '#fafbfc',
                              }}
                            >
                              {(inq.messages && inq.messages.length > 0
                                ? inq.messages
                                : [
                                    {
                                      senderRole: 'user',
                                      senderName: inq.name,
                                      text: inq.message,
                                      createdAt: inq.createdAt,
                                    },
                                  ]
                              ).map((msg: any, mIdx: number) => {
                                const isAdmin = msg.senderRole === 'admin';
                                return (
                                  <div
                                    key={msg._id || mIdx}
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: isAdmin ? 'flex-end' : 'flex-start',
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        color: isAdmin ? '#d4af37' : '#527482',
                                        marginBottom: '0.2rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                      }}
                                    >
                                      <span>{isAdmin ? '👑 You (Bamas Admin)' : inq.name}</span>
                                      <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 400 }}>
                                        {msg.createdAt
                                          ? new Date(msg.createdAt).toLocaleTimeString([], {
                                              hour: '2-digit',
                                              minute: '2-digit',
                                            })
                                          : ''}
                                      </span>
                                    </div>
                                    <div
                                      style={{
                                        maxWidth: '85%',
                                        padding: '0.7rem 0.95rem',
                                        borderRadius: isAdmin ? '0.75rem 0.15rem 0.75rem 0.75rem' : '0.15rem 0.75rem 0.75rem 0.75rem',
                                        background: isAdmin ? '#092330' : '#ffffff',
                                        color: isAdmin ? '#f8fafc' : '#092330',
                                        border: isAdmin ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid #e2e8f0',
                                        fontSize: '0.85rem',
                                        lineHeight: 1.5,
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                        whiteSpace: 'pre-wrap',
                                      }}
                                    >
                                      {msg.text}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Quick Response Suggestion Chips */}
                            <div
                              style={{
                                padding: '0.45rem 0.85rem',
                                background: '#f1f5f9',
                                borderTop: '1px solid #edf2f7',
                                display: 'flex',
                                gap: '0.4rem',
                                overflowX: 'auto',
                              }}
                            >
                              {[
                                'Yes, this pure zari saree includes matching unstitched blouse piece (0.8m).',
                                'Our senior stylist can schedule a private video consultation for you.',
                                'Dispatched in a luxury keepsake box with complimentary insured express courier.',
                              ].map((quickText, qIdx) => (
                                <button
                                  key={qIdx}
                                  type="button"
                                  onClick={() =>
                                    setInquiryReplyTexts((prev) => ({
                                      ...prev,
                                      [inq._id]: quickText,
                                    }))
                                  }
                                  style={{
                                    whiteSpace: 'nowrap',
                                    fontSize: '0.72rem',
                                    background: '#ffffff',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '999px',
                                    padding: '0.2rem 0.6rem',
                                    color: '#092330',
                                    cursor: 'pointer',
                                  }}
                                >
                                  {quickText.slice(0, 38)}...
                                </button>
                              ))}
                            </div>

                            {/* Reply Input Bar */}
                            <div
                              style={{
                                padding: '0.75rem 1rem',
                                background: '#ffffff',
                                borderTop: '1px solid #edf2f7',
                                display: 'flex',
                                gap: '0.65rem',
                                alignItems: 'center',
                              }}
                            >
                              <input
                                type="text"
                                placeholder={`Type direct message to ${inq.name} (Press Enter to send)...`}
                                value={inquiryReplyTexts[inq._id] || ''}
                                onChange={(e) =>
                                  setInquiryReplyTexts((prev) => ({
                                    ...prev,
                                    [inq._id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendInquiryReply(inq._id);
                                  }
                                }}
                                disabled={Boolean(inquirySending[inq._id])}
                                style={{
                                  flex: 1,
                                  padding: '0.65rem 0.85rem',
                                  borderRadius: '0.45rem',
                                  border: '1px solid #cbd5e1',
                                  fontSize: '0.85rem',
                                  outline: 'none',
                                  color: '#092330',
                                }}
                              />

                              <button
                                onClick={() => handleSendInquiryReply(inq._id)}
                                disabled={
                                  !inquiryReplyTexts[inq._id]?.trim() ||
                                  Boolean(inquirySending[inq._id])
                                }
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  padding: '0.65rem 1.15rem',
                                  background:
                                    inquiryReplyTexts[inq._id]?.trim() &&
                                    !inquirySending[inq._id]
                                      ? '#092330'
                                      : '#cbd5e1',
                                  color: '#d4af37',
                                  border: '1px solid #d4af37',
                                  borderRadius: '0.45rem',
                                  fontSize: '0.82rem',
                                  fontWeight: 700,
                                  cursor:
                                    inquiryReplyTexts[inq._id]?.trim() &&
                                    !inquirySending[inq._id]
                                      ? 'pointer'
                                      : 'default',
                                }}
                              >
                                <Send size={14} />
                                <span>{inquirySending[inq._id] ? 'Sending...' : 'Send Message'}</span>
                              </button>
                            </div>
                          </div>
                        )}
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <label
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#092330',
                          }}
                        >
                          Customer Support Email
                        </label>
                        {siteTouched.contactEmail && siteEmailVal.valid && (
                          <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>✓ Valid Email</span>
                        )}
                      </div>
                      <input
                        type="email"
                        value={siteConfig.contactEmail || ''}
                        onBlur={() => setSiteTouched((p) => ({ ...p, contactEmail: true }))}
                        onChange={(e) => {
                          setSiteConfig({ ...siteConfig, contactEmail: e.target.value });
                          if (!siteTouched.contactEmail) setSiteTouched((p) => ({ ...p, contactEmail: true }));
                        }}
                        style={{
                          width: '100%',
                          padding: '0.6rem',
                          borderRadius: '6px',
                          border: siteTouched.contactEmail
                            ? (!siteEmailVal.valid ? '1.5px solid #ef4444' : '1.5px solid #10b981')
                            : '1px solid #dce8ec',
                          fontSize: '0.9rem',
                          color: '#092330',
                          outline: 'none',
                        }}
                      />
                      {siteTouched.contactEmail && !siteEmailVal.valid && (
                        <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '3px', display: 'block' }}>
                          {siteEmailVal.error}
                        </span>
                      )}
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <label
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#092330',
                          }}
                        >
                          Customer Support Phone
                        </label>
                        {siteTouched.contactPhone && sitePhoneVal.valid && (
                          <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>✓ Valid Phone</span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={siteConfig.contactPhone || ''}
                        onBlur={() => setSiteTouched((p) => ({ ...p, contactPhone: true }))}
                        onChange={(e) => {
                          setSiteConfig({ ...siteConfig, contactPhone: e.target.value });
                          if (!siteTouched.contactPhone) setSiteTouched((p) => ({ ...p, contactPhone: true }));
                        }}
                        style={{
                          width: '100%',
                          padding: '0.6rem',
                          borderRadius: '6px',
                          border: siteTouched.contactPhone
                            ? (!sitePhoneVal.valid ? '1.5px solid #ef4444' : '1.5px solid #10b981')
                            : '1px solid #dce8ec',
                          fontSize: '0.9rem',
                          color: '#092330',
                          outline: 'none',
                        }}
                      />
                      {siteTouched.contactPhone && !sitePhoneVal.valid && (
                        <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '3px', display: 'block' }}>
                          {sitePhoneVal.error}
                        </span>
                      )}
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

          {/* TAB: ADMIN PROFILE & REMAINING MANAGEMENT MODULES (Mobile Hub) */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Executive Admin Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #061821 0%, #0a2432 55%, #071922 100%)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  boxShadow: '0 10px 30px rgba(9, 35, 48, 0.25)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-30px',
                    right: '-30px',
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #d4af37 0%, #aa820a 100%)',
                      border: '2px solid #ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#061821',
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      boxShadow: '0 4px 16px rgba(212, 175, 55, 0.4)',
                    }}
                  >
                    A
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                        {activeUser?.name || 'Bamas Admin'}
                      </h2>
                      <span
                        style={{
                          background: 'rgba(212, 175, 55, 0.2)',
                          color: '#f3dfa2',
                          border: '1px solid rgba(212, 175, 55, 0.45)',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <ShieldCheck size={11} /> Executive Suite
                      </span>
                    </div>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#93b6c2', wordBreak: 'break-all' }}>
                      {activeUser?.email || 'admin@bamas.com'}
                    </p>
                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.72rem', color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                      WebSocket Live Synchronized · MongoDB Atlas
                    </p>
                  </div>
                </div>
              </div>

              {/* Remaining Admin Modules Section */}
              <div>
                <h3
                  style={{
                    margin: '0.5rem 0 0.85rem',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: '#092330',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <Sparkles size={16} style={{ color: '#d4af37' }} />
                  Administrative Modules
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Module 1: Customers */}
                  <div
                    onClick={() => setActiveTab('customers')}
                    style={{
                      background: '#ffffff',
                      borderRadius: '12px',
                      padding: '1rem 1.15rem',
                      border: '1px solid rgba(9, 35, 48, 0.08)',
                      boxShadow: '0 2px 10px rgba(9, 35, 48, 0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: 'rgba(9, 35, 48, 0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#092330',
                        }}
                      >
                        <Users size={20} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, color: '#092330', fontSize: '0.95rem' }}>
                            Customers Directory
                          </span>
                          <span
                            style={{
                              background: 'rgba(212, 175, 55, 0.2)',
                              color: '#855d04',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '0.1rem 0.45rem',
                              borderRadius: '999px',
                            }}
                          >
                            {customers.length}
                          </span>
                        </div>
                        <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#667085' }}>
                          Manage registered patrons, order history & profiles
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={18} style={{ color: '#98a2b3' }} />
                  </div>

                  {/* Module 2: Reviews */}
                  <div
                    onClick={() => setActiveTab('reviews')}
                    style={{
                      background: '#ffffff',
                      borderRadius: '12px',
                      padding: '1rem 1.15rem',
                      border: '1px solid rgba(9, 35, 48, 0.08)',
                      boxShadow: '0 2px 10px rgba(9, 35, 48, 0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: 'rgba(212, 175, 55, 0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#b89015',
                        }}
                      >
                        <Star size={20} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, color: '#092330', fontSize: '0.95rem' }}>
                            Customer Reviews & Photos
                          </span>
                          <span
                            style={{
                              background: 'rgba(212, 175, 55, 0.2)',
                              color: '#855d04',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '0.1rem 0.45rem',
                              borderRadius: '999px',
                            }}
                          >
                            {reviews.length}
                          </span>
                        </div>
                        <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#667085' }}>
                          Moderate customer ratings and verified drape photos
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={18} style={{ color: '#98a2b3' }} />
                  </div>

                  {/* Module 3: Settings */}
                  <div
                    onClick={() => setActiveTab('settings')}
                    style={{
                      background: '#ffffff',
                      borderRadius: '12px',
                      padding: '1rem 1.15rem',
                      border: '1px solid rgba(9, 35, 48, 0.08)',
                      boxShadow: '0 2px 10px rgba(9, 35, 48, 0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: 'rgba(9, 35, 48, 0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#092330',
                        }}
                      >
                        <Settings size={20} />
                      </div>
                      <div>
                        <span style={{ fontWeight: 700, color: '#092330', fontSize: '0.95rem' }}>
                          Store Settings & Policies
                        </span>
                        <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#667085' }}>
                          Configure hero headings, WhatsApp concierge & taxes
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={18} style={{ color: '#98a2b3' }} />
                  </div>

                  {/* Module 4: Notifications Hub */}
                  <div
                    onClick={() => navigate({ to: '/notifications' })}
                    style={{
                      background: '#ffffff',
                      borderRadius: '12px',
                      padding: '1rem 1.15rem',
                      border: '1px solid rgba(9, 35, 48, 0.08)',
                      boxShadow: '0 2px 10px rgba(9, 35, 48, 0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: 'rgba(9, 35, 48, 0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#092330',
                        }}
                      >
                        <Bell size={20} />
                      </div>
                      <div>
                        <span style={{ fontWeight: 700, color: '#092330', fontSize: '0.95rem' }}>
                          System Notifications
                        </span>
                        <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#667085' }}>
                          Live real-time alerts and executive updates
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={18} style={{ color: '#98a2b3' }} />
                  </div>

                  {/* Module 5: View Live Boutique */}
                  <div
                    onClick={() => navigate({ to: '/' })}
                    style={{
                      background: '#ffffff',
                      borderRadius: '12px',
                      padding: '1rem 1.15rem',
                      border: '1px solid rgba(9, 35, 48, 0.08)',
                      boxShadow: '0 2px 10px rgba(9, 35, 48, 0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: 'rgba(9, 35, 48, 0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#092330',
                        }}
                      >
                        <ExternalLink size={20} />
                      </div>
                      <div>
                        <span style={{ fontWeight: 700, color: '#092330', fontSize: '0.95rem' }}>
                          Visit Customer Storefront
                        </span>
                        <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#667085' }}>
                          Experience Bamas Collection boutique live
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={18} style={{ color: '#98a2b3' }} />
                  </div>

                  {/* Module 6: Sign Out */}
                  <div
                    onClick={handleSignOut}
                    style={{
                      background: 'rgba(239, 68, 68, 0.06)',
                      borderRadius: '12px',
                      padding: '1rem 1.15rem',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      marginTop: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: 'rgba(239, 68, 68, 0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ef4444',
                        }}
                      >
                        <LogOut size={20} />
                      </div>
                      <div>
                        <span style={{ fontWeight: 700, color: '#b91c1c', fontSize: '0.95rem' }}>
                          Sign Out of Administrator
                        </span>
                        <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#ef4444' }}>
                          Safely end executive portal session
                        </p>
                      </div>
                    </div>
                    <LogOut size={18} style={{ color: '#ef4444' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ADMIN MOBILE BOTTOM BAR (Mobile Viewport Only) */}
      {isMobile && (
        <nav
          className="admin-mobile-bottom-bar"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '64px',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderTop: '1px solid rgba(212, 175, 55, 0.35)',
            boxShadow: '0 -4px 20px rgba(9, 35, 48, 0.08)',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            zIndex: 900,
          }}
        >
          {/* 1. Home / Overview */}
          {(() => {
            const active = activeTab === 'overview';
            return (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('overview');
                  setIsEditingProductView(false);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px 2px',
                  color: active ? '#092330' : '#8c9ea7',
                  position: 'relative',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <LayoutDashboard size={20} style={{ color: active ? '#d4af37' : 'currentColor' }} />
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: active ? 700 : 500,
                    letterSpacing: '0.2px',
                    color: active ? '#092330' : '#8c9ea7',
                  }}
                >
                  Home
                </span>
                {active && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      width: '16px',
                      height: '2.5px',
                      borderRadius: '2px',
                      background: '#d4af37',
                    }}
                  />
                )}
              </button>
            );
          })()}

          {/* 2. Bookings */}
          {(() => {
            const active = activeTab === 'bookings';
            return (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('bookings');
                  setIsEditingProductView(false);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px 2px',
                  color: active ? '#092330' : '#8c9ea7',
                  position: 'relative',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <CalendarCheck size={20} style={{ color: active ? '#d4af37' : 'currentColor' }} />
                  {orders.length > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-8px',
                        background: '#d4af37',
                        color: '#092330',
                        fontSize: '0.6rem',
                        fontWeight: 800,
                        minWidth: '15px',
                        height: '15px',
                        borderRadius: '999px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 2px',
                      }}
                    >
                      {orders.length > 99 ? '99+' : orders.length}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: active ? 700 : 500,
                    letterSpacing: '0.2px',
                    color: active ? '#092330' : '#8c9ea7',
                  }}
                >
                  Bookings
                </span>
                {active && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      width: '16px',
                      height: '2.5px',
                      borderRadius: '2px',
                      background: '#d4af37',
                    }}
                  />
                )}
              </button>
            );
          })()}

          {/* 3. Collections */}
          {(() => {
            const active = activeTab === 'collections';
            return (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('collections');
                  setIsEditingProductView(false);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px 2px',
                  color: active ? '#092330' : '#8c9ea7',
                  position: 'relative',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <ShoppingBag size={20} style={{ color: active ? '#d4af37' : 'currentColor' }} />
                  {products.length > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-8px',
                        background: 'rgba(9, 35, 48, 0.1)',
                        color: '#092330',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        minWidth: '15px',
                        height: '15px',
                        borderRadius: '999px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 2px',
                      }}
                    >
                      {products.length > 99 ? '99+' : products.length}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: active ? 700 : 500,
                    letterSpacing: '0.2px',
                    color: active ? '#092330' : '#8c9ea7',
                  }}
                >
                  Collections
                </span>
                {active && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      width: '16px',
                      height: '2.5px',
                      borderRadius: '2px',
                      background: '#d4af37',
                    }}
                  />
                )}
              </button>
            );
          })()}

          {/* 4. Support (Inquiries) */}
          {(() => {
            const active = activeTab === 'inquiries';
            const newCount = inquiries.filter((i: any) => i.status === 'New').length;
            return (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('inquiries');
                  setIsEditingProductView(false);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px 2px',
                  color: active ? '#092330' : '#8c9ea7',
                  position: 'relative',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <MessageSquare size={20} style={{ color: active ? '#d4af37' : 'currentColor' }} />
                  {newCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-8px',
                        background: '#ef4444',
                        color: '#ffffff',
                        fontSize: '0.6rem',
                        fontWeight: 800,
                        minWidth: '15px',
                        height: '15px',
                        borderRadius: '999px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 2px',
                      }}
                    >
                      {newCount}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: active ? 700 : 500,
                    letterSpacing: '0.2px',
                    color: active ? '#092330' : '#8c9ea7',
                  }}
                >
                  Support
                </span>
                {active && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      width: '16px',
                      height: '2.5px',
                      borderRadius: '2px',
                      background: '#d4af37',
                    }}
                  />
                )}
              </button>
            );
          })()}

          {/* 5. Profile (Houses Customers, Reviews, Settings, Profile Info, Sign Out) */}
          {(() => {
            const active = activeTab === 'profile' || activeTab === 'customers' || activeTab === 'reviews' || activeTab === 'settings';
            return (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('profile');
                  setIsEditingProductView(false);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px 2px',
                  color: active ? '#092330' : '#8c9ea7',
                  position: 'relative',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <User size={20} style={{ color: active ? '#d4af37' : 'currentColor' }} />
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: active ? 700 : 500,
                    letterSpacing: '0.2px',
                    color: active ? '#092330' : '#8c9ea7',
                  }}
                >
                  Profile
                </span>
                {active && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      width: '16px',
                      height: '2.5px',
                      borderRadius: '2px',
                      background: '#d4af37',
                    }}
                  />
                )}
              </button>
            );
          })()}
        </nav>
      )}

      {/* Fullscreen Patron Photo Modal in Admin */}
      <Dialog open={!!previewReviewPhoto} onOpenChange={(open) => !open && setPreviewReviewPhoto(null)}>
        <DialogContent className="pdp-lightbox-dialog" style={{ maxWidth: '640px', padding: '1rem', background: '#092330', border: '1px solid #d4af37' }}>
          <DialogTitle className="sr-only">Customer Drape Photo Preview</DialogTitle>
          {previewReviewPhoto && (
            <div style={{ position: 'relative', textAlign: 'center' }}>
              <img
                src={previewReviewPhoto}
                alt="Patron Drape Photo"
                style={{ maxHeight: '80vh', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px', margin: '0 auto', display: 'block' }}
              />
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#d4af37', fontSize: '0.85rem', fontWeight: 600 }}>
                <Camera size={16} />
                <span>Verified Customer Drape Photo (Stored in Cloudinary)</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

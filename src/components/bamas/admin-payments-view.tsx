import { useState, useRef } from 'react';
import {
  IndianRupee,
  Activity,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  Trash2,
  Edit,
  Eye,
  Copy,
  Check,
  UploadCloud,
  ExternalLink,
  Printer,
  Sparkles,
  Lock,
  X,
  CreditCard,
  Truck,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { api } from '@/lib/api';

export interface PaymentItem {
  _id: string;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  upiId?: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'Refunded';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  verifiedByAdmin?: boolean;
  notes?: string;
  paidAt: string;
  createdAt: string;
  order?: any;
  user?: any;
  rawDetails?: any;
}

export interface PaymentMethodItem {
  _id: string;
  title: string;
  upiId: string;
  payeeName: string;
  bankName: string;
  qrCodeUrl: string;
  description: string;
  isActive: boolean;
  isDefault?: boolean;
  createdAt?: string;
}

interface AdminPaymentsViewProps {
  payments: PaymentItem[];
  setPayments: React.Dispatch<React.SetStateAction<PaymentItem[]>>;
  paymentStats: {
    totalRevenue: number;
    todayRevenue: number;
    totalPayments: number;
    completedCount: number;
    pendingCount: number;
    refundedCount: number;
  };
  setPaymentStats: React.Dispatch<React.SetStateAction<any>>;
  paymentMethods: PaymentMethodItem[];
  setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethodItem[]>>;
  activePaymentMethod: PaymentMethodItem | null;
  setActivePaymentMethod: React.Dispatch<React.SetStateAction<PaymentMethodItem | null>>;
  refreshing: boolean;
  onRefresh: () => void;
  isMobile: boolean;
  showNotification: (msg: string) => void;
  orders: any[];
}

export function AdminPaymentsView({
  payments,
  setPayments,
  paymentStats,
  setPaymentStats,
  paymentMethods,
  setPaymentMethods,
  activePaymentMethod,
  setActivePaymentMethod,
  refreshing,
  onRefresh,
  isMobile,
  showNotification,
  orders,
}: AdminPaymentsViewProps) {
  const [subTab, setSubTab] = useState<'transactions' | 'upi_gateways'>('transactions');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Selected receipt modal
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentItem | null>(null);

  // UPI CRUD Modal state
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethodItem | null>(null);
  const [upiForm, setUpiForm] = useState<{
    title: string;
    upiId: string;
    payeeName: string;
    bankName: string;
    qrCodeUrl: string;
    description: string;
    isActive: boolean;
  }>({
    title: 'Primary UPI Gateway',
    upiId: '',
    payeeName: 'Bamas Collections Atelier',
    bankName: 'HDFC Bank',
    qrCodeUrl: '',
    description: 'Scan and pay using any UPI app (Google Pay, PhonePe, Paytm, BHIM)',
    isActive: true,
  });
  const [uploadingQr, setUploadingQr] = useState(false);
  const [savingMethod, setSavingMethod] = useState(false);
  const qrFileInputRef = useRef<HTMLInputElement | null>(null);

  // Copy helper
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Open add UPI modal
  const handleOpenAddModal = () => {
    setEditingMethod(null);
    setUpiForm({
      title: 'Primary UPI Gateway',
      upiId: '',
      payeeName: 'Bamas Collections Atelier',
      bankName: 'HDFC Bank',
      qrCodeUrl: '',
      description: 'Scan and pay using any UPI app (Google Pay, PhonePe, Paytm, BHIM)',
      isActive: paymentMethods.length === 0,
    });
    setIsUpiModalOpen(true);
  };

  // Open edit UPI modal
  const handleOpenEditModal = (method: PaymentMethodItem) => {
    setEditingMethod(method);
    setUpiForm({
      title: method.title || '',
      upiId: method.upiId || '',
      payeeName: method.payeeName || '',
      bankName: method.bankName || 'HDFC Bank',
      qrCodeUrl: method.qrCodeUrl || '',
      description: method.description || '',
      isActive: method.isActive,
    });
    setIsUpiModalOpen(true);
  };

  // QR Code file upload to Cloudinary via backend
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingQr(true);
      const res = await api.upload.uploadImage(file, 'bamascollections/payments');
      if (res.data?.url) {
        setUpiForm((prev) => ({ ...prev, qrCodeUrl: res.data.url }));
        showNotification('✅ QR Code image uploaded successfully!');
      }
    } catch (err: any) {
      showNotification(`❌ QR upload failed: ${err.message}`);
    } finally {
      setUploadingQr(false);
    }
  };

  // Save UPI Gateway (Create or Update)
  const handleSaveUpiGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiForm.upiId.trim() || !upiForm.upiId.includes('@')) {
      alert('Please enter a valid UPI ID containing "@" (e.g. bamas@okhdfcbank)');
      return;
    }

    try {
      setSavingMethod(true);
      if (editingMethod) {
        // Update
        const res = await api.payments.updateMethod(editingMethod._id, upiForm);
        const updated = res.data;
        setPaymentMethods((prev) =>
          prev.map((m) => (m._id === updated._id ? updated : upiForm.isActive ? { ...m, isActive: false } : m))
        );
        if (updated.isActive) {
          setActivePaymentMethod(updated);
        }
        showNotification(`✅ Updated UPI Gateway: ${updated.upiId}`);
      } else {
        // Create
        const res = await api.payments.createMethod(upiForm);
        const created = res.data;
        if (created.isActive) {
          setPaymentMethods((prev) => [created, ...prev.map((m) => ({ ...m, isActive: false }))]);
          setActivePaymentMethod(created);
        } else {
          setPaymentMethods((prev) => [created, ...prev]);
        }
        showNotification(`✅ Added new UPI Gateway: ${created.upiId}`);
      }
      setIsUpiModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save UPI Gateway');
    } finally {
      setSavingMethod(false);
    }
  };

  // Set Active Gateway (1-click realtime activation)
  const handleSetActiveGateway = async (id: string) => {
    try {
      const res = await api.payments.setActiveMethod(id);
      const activated = res.data;
      setActivePaymentMethod(activated);
      setPaymentMethods((prev) =>
        prev.map((m) => ({
          ...m,
          isActive: m._id === id,
        }))
      );
      showNotification(`⚡ Live Gateway Switched to: ${activated.upiId}`);
    } catch (err: any) {
      alert(err.message || 'Failed to activate gateway');
    }
  };

  // Delete UPI Gateway
  const handleDeleteGateway = async (id: string) => {
    const target = paymentMethods.find((m) => m._id === id);
    if (!confirm(`Delete UPI Gateway "${target?.title || target?.upiId}"?`)) return;

    try {
      await api.payments.deleteMethod(id);
      setPaymentMethods((prev) => prev.filter((m) => m._id !== id));
      if (target?.isActive) {
        // Refresh active
        const activeRes = await api.payments.getActiveMethod();
        if (activeRes.data) setActivePaymentMethod(activeRes.data);
      }
      showNotification('🗑️ Payment Gateway deleted');
    } catch (err: any) {
      alert(err.message || 'Failed to delete gateway');
    }
  };

  // Update Payment Transaction Status
  const handleUpdatePaymentStatus = async (paymentId: string, newStatus: 'Completed' | 'Pending' | 'Refunded') => {
    try {
      const res = await api.payments.updateStatus(paymentId, { status: newStatus });
      const updated = res.data;
      setPayments((prev) => prev.map((p) => (p._id === paymentId ? { ...p, ...updated } : p)));
      if (selectedReceipt && selectedReceipt._id === paymentId) {
        setSelectedReceipt((prev) => (prev ? { ...prev, ...updated } : null));
      }
      showNotification(`💳 Payment marked as ${newStatus}`);
    } catch (err: any) {
      alert(err.message || 'Failed to update payment status');
    }
  };

  // Delete Payment Transaction
  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to permanently delete this payment transaction record?')) return;
    try {
      await api.payments.delete(paymentId);
      setPayments((prev) => prev.filter((p) => p._id !== paymentId));
      if (selectedReceipt?._id === paymentId) setSelectedReceipt(null);
      showNotification('🗑️ Payment record deleted');
    } catch (err: any) {
      alert(err.message || 'Failed to delete payment');
    }
  };

  // Filtered Payments
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      !searchQuery ||
      payment.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.customerPhone?.includes(searchQuery) ||
      payment.upiId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.paymentMethod?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || payment.status === statusFilter;
    const matchesMethod =
      methodFilter === 'All' ||
      (methodFilter === 'UPI' && (payment.paymentMethod?.toLowerCase().includes('upi') || payment.upiId)) ||
      (methodFilter === 'Card' && payment.paymentMethod?.toLowerCase().includes('card')) ||
      (methodFilter === 'COD' && payment.paymentMethod?.toLowerCase().includes('delivery'));

    return matchesSearch && matchesStatus && matchesMethod;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Header & Live Gateway Alert Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #092330 0%, #103444 100%)',
          borderRadius: '14px',
          padding: isMobile ? '1.15rem' : '1.35rem 1.75rem',
          color: '#ffffff',
          boxShadow: '0 10px 30px rgba(9, 35, 48, 0.18)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                background: 'rgba(212, 175, 55, 0.2)',
                color: '#d4af37',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              Atelier Treasury
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.72rem',
                color: '#10b981',
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 10px #10b981',
                  display: 'inline-block',
                }}
              />
              WebSocket Real-Time Sync Active
            </span>
          </div>
          <h2
            style={{
              margin: '0 0 0.35rem',
              fontSize: isMobile ? '1.35rem' : '1.75rem',
              fontWeight: 700,
              fontFamily: 'Cormorant Garamond, serif',
              letterSpacing: '0.5px',
              color: '#ffffff',
            }}
          >
            Payments & UPI Management
          </h2>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8', maxWidth: '620px', lineHeight: 1.5 }}>
            Live transaction audit trail, settlement verification, and real-time QR code / UPI ID configuration.
            Updates made here immediately propagate to patron checkout screens without page reload.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', zIndex: 1, width: isMobile ? '100%' : 'auto' }}>
          <Button
            type="button"
            onClick={onRefresh}
            variant="outline"
            disabled={refreshing}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#f8fafc',
              fontSize: '0.82rem',
              padding: '0.55rem 0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Syncing...' : 'Sync Live'}
          </Button>

          <Button
            type="button"
            onClick={handleOpenAddModal}
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #aa820a 100%)',
              color: '#092330',
              fontWeight: 700,
              fontSize: '0.82rem',
              padding: '0.55rem 1.15rem',
              border: 'none',
              boxShadow: '0 4px 15px rgba(212, 175, 55, 0.35)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flex: isMobile ? 1 : 'none',
              justifyContent: 'center',
            }}
          >
            <Plus size={15} />
            Add UPI Gateway
          </Button>
        </div>
      </div>

      {/* 2. Key Financial Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: '0.85rem',
        }}
      >
        {/* Total Settled Revenue */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '1.1rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Settled Volume
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(212, 175, 55, 0.15)',
                color: '#aa820a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IndianRupee size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#092330', fontFamily: 'Manrope, sans-serif' }}>
            ₹{paymentStats.totalRevenue.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
            {paymentStats.completedCount} Verified Transactions
          </span>
        </div>

        {/* Today's Collections */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '1.1rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Today's Collections
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Activity size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#092330', fontFamily: 'Manrope, sans-serif' }}>
            ₹{paymentStats.todayRevenue.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            Live collections today
          </span>
        </div>

        {/* Pending Verification */}
        <div
          style={{
            background: paymentStats.pendingCount > 0 ? '#fffdf5' : '#ffffff',
            borderRadius: '12px',
            padding: '1.1rem',
            border: paymentStats.pendingCount > 0 ? '1.5px solid #fde68a' : '1px solid #e2e8f0',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Pending Verification
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: paymentStats.pendingCount > 0 ? '#fef3c7' : '#f1f5f9',
                color: paymentStats.pendingCount > 0 ? '#d97706' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {paymentStats.pendingCount > 0 ? <Clock size={16} /> : <CheckCircle2 size={16} />}
            </div>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: paymentStats.pendingCount > 0 ? '#b45309' : '#092330' }}>
            {paymentStats.pendingCount}
          </div>
          <span style={{ fontSize: '0.72rem', color: paymentStats.pendingCount > 0 ? '#d97706' : '#64748b', fontWeight: 600 }}>
            {paymentStats.pendingCount > 0 ? 'Needs admin confirmation' : 'All transactions cleared'}
          </span>
        </div>

        {/* Active Gateway */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: '12px',
            padding: '1.1rem',
            border: '1.5px solid rgba(212, 175, 55, 0.4)',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: '#092330', fontWeight: 700, textTransform: 'uppercase' }}>
              Live Active UPI Gateway
            </span>
            <span
              style={{
                background: '#d1fae5',
                color: '#047857',
                fontSize: '0.62rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              LIVE
            </span>
          </div>
          <div
            style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: '#092330',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {activePaymentMethod?.upiId || 'bamas@okhdfcbank'}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {activePaymentMethod?.payeeName || 'Bamas Collections Atelier'} ({activePaymentMethod?.bankName || 'HDFC'})
          </span>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs: Transactions vs UPI / QR Gateway CRUD */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0.5rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setSubTab('transactions')}
            style={{
              background: subTab === 'transactions' ? '#092330' : 'transparent',
              color: subTab === 'transactions' ? '#ffffff' : '#475569',
              border: 'none',
              padding: '0.55rem 1.15rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <CreditCard size={15} />
            Transactions Ledger
            <span
              style={{
                background: subTab === 'transactions' ? '#d4af37' : '#e2e8f0',
                color: subTab === 'transactions' ? '#092330' : '#475569',
                fontSize: '0.68rem',
                padding: '1px 6px',
                borderRadius: '10px',
                fontWeight: 700,
              }}
            >
              {payments.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('upi_gateways')}
            style={{
              background: subTab === 'upi_gateways' ? '#092330' : 'transparent',
              color: subTab === 'upi_gateways' ? '#ffffff' : '#475569',
              border: 'none',
              padding: '0.55rem 1.15rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <QrCode size={15} />
            UPI & QR Gateways (CRUD)
            <span
              style={{
                background: subTab === 'upi_gateways' ? '#d4af37' : '#e2e8f0',
                color: subTab === 'upi_gateways' ? '#092330' : '#475569',
                fontSize: '0.68rem',
                padding: '1px 6px',
                borderRadius: '10px',
                fontWeight: 700,
              }}
            >
              {paymentMethods.length}
            </span>
          </button>
        </div>

        {subTab === 'transactions' && (
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Showing <strong>{filteredPayments.length}</strong> of {payments.length} transactions
          </span>
        )}
      </div>

      {/* 4. SUB-TAB CONTENT */}

      {/* VIEW A: TRANSACTIONS LEDGER */}
      {subTab === 'transactions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Search & Filter Bar */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'center',
              gap: '0.75rem',
              justifyContent: 'space-between',
            }}
          >
            {/* Search Input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '0.45rem 0.75rem',
                flex: 1,
                minWidth: '240px',
              }}
            >
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search by patron name, phone, email, txn ID, UPI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '0.82rem',
                  width: '100%',
                  color: '#092330',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>Status:</span>
              {['All', 'Completed', 'Pending', 'Failed', 'Refunded'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  style={{
                    border: '1px solid',
                    borderColor: statusFilter === status ? '#092330' : '#e2e8f0',
                    background: statusFilter === status ? '#092330' : '#ffffff',
                    color: statusFilter === status ? '#ffffff' : '#64748b',
                    padding: '3px 9px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Method Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>Method:</span>
              {['All', 'UPI', 'Card', 'COD'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setMethodFilter(method)}
                  style={{
                    border: '1px solid',
                    borderColor: methodFilter === method ? '#d4af37' : '#e2e8f0',
                    background: methodFilter === method ? '#fffdf7' : '#ffffff',
                    color: methodFilter === method ? '#715100' : '#64748b',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions Table */}
          {filteredPayments.length === 0 ? (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '3rem 1.5rem',
                textAlign: 'center',
                border: '1px dashed #cbd5e1',
                color: '#64748b',
              }}
            >
              <CreditCard size={42} style={{ color: '#cbd5e1', margin: '0 auto 0.75rem' }} />
              <h3 style={{ margin: '0 0 0.35rem', color: '#092330', fontSize: '1.1rem' }}>No Transactions Found</h3>
              <p style={{ margin: '0 0 1rem', fontSize: '0.82rem' }}>
                {searchQuery || statusFilter !== 'All' || methodFilter !== 'All'
                  ? 'Try adjusting your search criteria or filter tags.'
                  : 'Customer orders and simulated payments will automatically show up here live.'}
              </p>
              {(searchQuery || statusFilter !== 'All' || methodFilter !== 'All') && (
                <Button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('All');
                    setMethodFilter('All');
                  }}
                  variant="outline"
                  style={{ fontSize: '0.8rem' }}
                >
                  Reset Filters
                </Button>
              )}
            </div>
          ) : (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                overflowX: 'auto',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '840px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Transaction ID / Ref</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Patron Customer</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Payment Gateway</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Date & Time</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '0.82rem' }}>
                  {filteredPayments.map((payment) => {
                    const isUpi = payment.paymentMethod?.toLowerCase().includes('upi') || Boolean(payment.upiId);
                    const isCard = payment.paymentMethod?.toLowerCase().includes('card');

                    return (
                      <tr
                        key={payment._id || payment.transactionId}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#fcfdfd')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* 1. Transaction ID */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <strong style={{ fontFamily: 'monospace', color: '#092330', fontSize: '0.82rem' }}>
                              {payment.transactionId}
                            </strong>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(payment.transactionId, payment._id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: copiedId === payment._id ? '#10b981' : '#94a3b8',
                                cursor: 'pointer',
                                padding: '2px',
                              }}
                              title="Copy Transaction ID"
                            >
                              {copiedId === payment._id ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                          </div>
                          {payment.order && (
                            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                              Order #{typeof payment.order === 'object' && payment.order._id ? payment.order._id.toString().slice(-6).toUpperCase() : payment.order.toString().slice(-6).toUpperCase()}
                            </span>
                          )}
                        </td>

                        {/* 2. Patron info */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: '#092330' }}>
                            {payment.customerName || 'Valued Patron'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {payment.customerPhone || payment.customerEmail || 'Direct Atelier Purchase'}
                          </div>
                        </td>

                        {/* 3. Amount */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <strong style={{ fontSize: '0.92rem', color: '#092330', fontFamily: 'Manrope, sans-serif' }}>
                            ₹{Number(payment.amount || 0).toLocaleString('en-IN')}
                          </strong>
                        </td>

                        {/* 4. Payment Gateway */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px' }}>
                            {isUpi ? (
                              <>
                                <span
                                  style={{
                                    background: '#fffdf7',
                                    border: '1px solid #d4af37',
                                    color: '#aa820a',
                                    padding: '2px 7px',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  <QrCode size={12} />
                                  UPI: {payment.upiId || 'bamas@okhdfcbank'}
                                </span>
                                {(payment.paymentProofUrl || payment.screenshotUrl) && (
                                  <span
                                    style={{
                                      background: '#ecfdf5',
                                      border: '1px solid #a7f3d0',
                                      color: '#047857',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      fontSize: '0.64rem',
                                      fontWeight: 700,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px',
                                    }}
                                  >
                                    📸 Proof Attached
                                  </span>
                                )}
                              </>
                            ) : isCard ? (
                              <span
                                style={{
                                  background: '#f8fafc',
                                  border: '1px solid #cbd5e1',
                                  color: '#334155',
                                  padding: '2px 7px',
                                  borderRadius: '4px',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <CreditCard size={12} />
                                Card
                              </span>
                            ) : (
                              <span
                                style={{
                                  background: '#f8fafc',
                                  border: '1px solid #cbd5e1',
                                  color: '#475569',
                                  padding: '2px 7px',
                                  borderRadius: '4px',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Truck size={12} />
                                Cash on Delivery
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 5. Status Badge */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {payment.status === 'Completed' && (
                            <span
                              style={{
                                background: '#ecfdf5',
                                color: '#047857',
                                border: '1px solid #a7f3d0',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <CheckCircle2 size={12} />
                              Completed
                            </span>
                          )}
                          {payment.status === 'Pending' && (
                            <span
                              style={{
                                background: '#fffbeb',
                                color: '#b45309',
                                border: '1px solid #fde68a',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Clock size={12} />
                              Pending
                            </span>
                          )}
                          {payment.status === 'Failed' && (
                            <span
                              style={{
                                background: '#fef2f2',
                                color: '#b91c1c',
                                border: '1px solid #fecaca',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <AlertCircle size={12} />
                              Failed
                            </span>
                          )}
                          {payment.status === 'Refunded' && (
                            <span
                              style={{
                                background: '#f5f3ff',
                                color: '#6d28d9',
                                border: '1px solid #ddd6fe',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <RotateCcw size={12} />
                              Refunded
                            </span>
                          )}
                        </td>

                        {/* 6. Date */}
                        <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.75rem' }}>
                          {new Date(payment.paidAt || payment.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                          <span style={{ display: 'block', fontSize: '0.68rem', color: '#94a3b8' }}>
                            {new Date(payment.paidAt || payment.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>

                        {/* 7. Action buttons */}
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            {payment.status === 'Pending' ? (
                              <button
                                type="button"
                                onClick={() => handleUpdatePaymentStatus(payment._id, 'Completed')}
                                style={{
                                  background: '#10b981',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '5px',
                                  padding: '4px 8px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                                title="Verify and Mark as Completed"
                              >
                                <Check size={12} />
                                Verify
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdatePaymentStatus(
                                    payment._id,
                                    payment.status === 'Completed' ? 'Refunded' : 'Completed'
                                  )
                                }
                                style={{
                                  background: '#f1f5f9',
                                  color: '#475569',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '5px',
                                  padding: '4px 8px',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                                title="Toggle status"
                              >
                                {payment.status === 'Completed' ? 'Refund' : 'Re-verify'}
                              </button>
                            )}

                            {/* View Receipt */}
                            <button
                              type="button"
                              onClick={() => setSelectedReceipt(payment)}
                              style={{
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                borderRadius: '5px',
                                color: '#092330',
                                padding: '4px 7px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                              title="View Official Certificate Receipt"
                            >
                              <Eye size={13} />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeletePayment(payment._id)}
                              style={{
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '5px',
                                color: '#dc2626',
                                padding: '4px 7px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                              title="Delete Record"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW B: UPI & QR GATEWAY MANAGEMENT (FULL CRUD) */}
      {subTab === 'upi_gateways' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Explanation Callout Banner */}
          <div
            style={{
              background: '#fffdf7',
              border: '1.5px solid rgba(212, 175, 55, 0.5)',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#092330', fontSize: '0.92rem' }}>
                <Sparkles size={16} color="#d4af37" />
                Live Real-Time Payment Method Gateway
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b', maxWidth: '680px' }}>
                Configure multiple UPI IDs and QR code images. When you activate or edit a gateway, it will
                instantly update on the customer checkout screen in real-time.
              </p>
            </div>

            <Button
              type="button"
              onClick={handleOpenAddModal}
              style={{
                background: '#092330',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Plus size={15} />
              Add New UPI Account
            </Button>
          </div>

          {/* Gateways Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '1.15rem',
            }}
          >
            {paymentMethods.map((method) => {
              const isActive = method.isActive;

              return (
                <div
                  key={method._id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: isActive ? '2px solid #d4af37' : '1px solid #e2e8f0',
                    boxShadow: isActive ? '0 8px 24px rgba(212, 175, 55, 0.18)' : '0 2px 8px rgba(0,0,0,0.03)',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 2px', fontSize: '1rem', fontWeight: 700, color: '#092330' }}>
                        {method.title || 'UPI Gateway'}
                      </h4>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        Bank: <strong>{method.bankName || 'HDFC Bank'}</strong>
                      </span>
                    </div>

                    {isActive ? (
                      <span
                        style={{
                          background: '#ecfdf5',
                          color: '#047857',
                          border: '1.5px solid #10b981',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          letterSpacing: '0.5px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                        LIVE ACTIVE GATEWAY
                      </span>
                    ) : (
                      <span
                        style={{
                          background: '#f1f5f9',
                          color: '#64748b',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                        }}
                      >
                        Inactive
                      </span>
                    )}
                  </div>

                  {/* Card Body with QR Code & UPI Details */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {/* QR Code container */}
                    <div
                      style={{
                        width: '95px',
                        height: '95px',
                        borderRadius: '8px',
                        background: '#ffffff',
                        border: '1.5px solid #cbd5e1',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                      }}
                    >
                      {method.qrCodeUrl || method.upiId ? (
                        <img
                          src={
                            method.qrCodeUrl ||
                            `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=6&data=${encodeURIComponent(`upi://pay?pa=${encodeURIComponent(method.upiId)}&pn=${encodeURIComponent(method.payeeName || 'Bamas Collections Atelier')}&cu=INR`)}`
                          }
                          alt="UPI QR Code"
                          style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px' }}
                        />
                      ) : (
                        <svg width="76" height="76" viewBox="0 0 100 100">
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
                      )}
                    </div>

                    {/* VPA Details */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>
                        VPA / UPI ID
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <strong
                          style={{
                            fontSize: '0.92rem',
                            color: '#092330',
                            fontFamily: 'monospace',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {method.upiId}
                        </strong>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(method.upiId, method._id)}
                          style={{
                            background: copiedId === method._id ? '#d1fae5' : '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRadius: '4px',
                            padding: '2px 5px',
                            cursor: 'pointer',
                            fontSize: '0.65rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          {copiedId === method._id ? <Check size={11} color="#065f46" /> : <Copy size={11} />}
                        </button>
                      </div>

                      <div style={{ fontSize: '0.74rem', color: '#475569' }}>
                        <strong>Payee:</strong> {method.payeeName}
                      </div>

                      <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                        {method.description || 'Scan via any UPI app'}
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div
                    style={{
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                    }}
                  >
                    {!isActive ? (
                      <Button
                        type="button"
                        onClick={() => handleSetActiveGateway(method._id)}
                        style={{
                          background: 'linear-gradient(135deg, #d4af37 0%, #aa820a 100%)',
                          color: '#092330',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          padding: '0.4rem 0.85rem',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        ⚡ Make Live Gateway
                      </Button>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={13} /> Active in Checkout
                      </span>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Button
                        type="button"
                        onClick={() => handleOpenEditModal(method)}
                        variant="outline"
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.4rem 0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Edit size={13} />
                        Edit
                      </Button>

                      {paymentMethods.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => handleDeleteGateway(method._id)}
                          variant="ghost"
                          style={{
                            color: '#dc2626',
                            padding: '0.4rem 0.6rem',
                            cursor: 'pointer',
                          }}
                          title="Delete Gateway"
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. ADD / EDIT UPI GATEWAY MODAL (DIALOG) */}
      <Dialog open={isUpiModalOpen} onOpenChange={setIsUpiModalOpen}>
        <DialogContent
          style={{
            maxWidth: '520px',
            width: '94%',
            borderRadius: '14px',
            padding: '1.5rem',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <DialogTitle style={{ fontSize: '1.2rem', fontWeight: 700, color: '#092330', margin: 0 }}>
                {editingMethod ? 'Edit UPI & QR Gateway' : 'Add New UPI Gateway & QR'}
              </DialogTitle>
              <DialogDescription style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0' }}>
                Updates sync live to customer checkouts and the payment simulation engine.
              </DialogDescription>
            </div>
          </div>

          <form onSubmit={handleSaveUpiGateway} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Title */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#092330', marginBottom: '3px' }}>
                Gateway Label / Name
              </label>
              <input
                type="text"
                required
                value={upiForm.title}
                onChange={(e) => setUpiForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Primary HDFC UPI Gateway"
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* UPI ID */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#092330', marginBottom: '3px' }}>
                UPI ID / VPA Address *
              </label>
              <input
                type="text"
                required
                value={upiForm.upiId}
                onChange={(e) => setUpiForm((prev) => ({ ...prev, upiId: e.target.value.toLowerCase().trim() }))}
                placeholder="e.g. bamas@okhdfcbank or merchant@axisbank"
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                Must be a valid VPA with '@' symbol (e.g. username@bank)
              </span>
            </div>

            {/* Payee Name & Bank Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#092330', marginBottom: '3px' }}>
                  Payee / Account Name
                </label>
                <input
                  type="text"
                  required
                  value={upiForm.payeeName}
                  onChange={(e) => setUpiForm((prev) => ({ ...prev, payeeName: e.target.value }))}
                  placeholder="Bamas Collections"
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#092330', marginBottom: '3px' }}>
                  Bank Institution
                </label>
                <input
                  type="text"
                  value={upiForm.bankName}
                  onChange={(e) => setUpiForm((prev) => ({ ...prev, bankName: e.target.value }))}
                  placeholder="HDFC Bank"
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* QR Code Upload / URL */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#092330', marginBottom: '3px' }}>
                Custom QR Code Image (Upload or Paste URL)
              </label>

              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  ref={qrFileInputRef}
                  onChange={handleQrUpload}
                  style={{ display: 'none' }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => qrFileInputRef.current?.click()}
                  disabled={uploadingQr}
                  style={{
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    flexShrink: 0,
                  }}
                >
                  <UploadCloud size={14} className={uploadingQr ? 'spin' : ''} />
                  {uploadingQr ? 'Uploading QR...' : 'Upload QR Image'}
                </Button>

                <input
                  type="text"
                  value={upiForm.qrCodeUrl}
                  onChange={(e) => setUpiForm((prev) => ({ ...prev, qrCodeUrl: e.target.value }))}
                  placeholder="https://... Cloudinary or image URL"
                  style={{
                    flex: 1,
                    padding: '0.55rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.78rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* QR Preview if present */}
              {upiForm.qrCodeUrl ? (
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <img
                    src={upiForm.qrCodeUrl}
                    alt="Uploaded QR Code"
                    style={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'contain',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      padding: '2px',
                    }}
                  />
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600, display: 'block' }}>
                      ✓ Custom QR Code Image Ready
                    </span>
                    <button
                      type="button"
                      onClick={() => setUpiForm((prev) => ({ ...prev, qrCodeUrl: '' }))}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#dc2626',
                        fontSize: '0.68rem',
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline',
                      }}
                    >
                      Remove image (use auto-generated UPI QR)
                    </button>
                  </div>
                </div>
              ) : upiForm.upiId && upiForm.upiId.includes('@') ? (
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.65rem', background: '#f8fafc', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=4&data=${encodeURIComponent(`upi://pay?pa=${encodeURIComponent(upiForm.upiId)}&pn=${encodeURIComponent(upiForm.payeeName || 'Bamas Collections Atelier')}&cu=INR`)}`}
                    alt="Auto-Generated UPI QR Code"
                    style={{
                      width: '48px',
                      height: '48px',
                      objectFit: 'contain',
                      borderRadius: '4px',
                      background: '#fff',
                      border: '1px solid #cbd5e1',
                    }}
                  />
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#092330', fontWeight: 700, display: 'block' }}>
                      ⚡ Auto-Generated Dynamic UPI QR
                    </span>
                    <span style={{ fontSize: '0.66rem', color: '#64748b' }}>
                      Scannable with Google Pay, PhonePe, Paytm & BHIM. You can also upload a custom QR image.
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Description / Instructions */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#092330', marginBottom: '3px' }}>
                Patron Instructions
              </label>
              <input
                type="text"
                value={upiForm.description}
                onChange={(e) => setUpiForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Scan and pay using any UPI app (Google Pay, PhonePe, Paytm, BHIM)"
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Set as Active Checkbox */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                background: '#f8fafc',
                padding: '0.6rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
              }}
            >
              <input
                type="checkbox"
                checked={upiForm.isActive}
                onChange={(e) => setUpiForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                style={{ width: '16px', height: '16px', accentColor: '#d4af37' }}
              />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#092330' }}>
                Set as Active Live Gateway immediately
              </span>
            </label>

            {/* Action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUpiModalOpen(false)}
                style={{ fontSize: '0.82rem' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingMethod || uploadingQr}
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #aa820a 100%)',
                  color: '#092330',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  border: 'none',
                }}
              >
                {savingMethod ? 'Saving...' : editingMethod ? 'Update Gateway' : 'Save & Publish Gateway'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. CERTIFIED PAYMENT RECEIPT MODAL (DIALOG) */}
      <Dialog open={Boolean(selectedReceipt)} onOpenChange={(open) => !open && setSelectedReceipt(null)}>
        <DialogContent
          style={{
            maxWidth: '560px',
            width: '95%',
            borderRadius: '14px',
            padding: '1.75rem',
            background: '#ffffff',
            boxShadow: '0 25px 50px -12px rgba(9, 35, 48, 0.25)',
          }}
        >
          {selectedReceipt && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Receipt Header */}
              <div
                style={{
                  borderBottom: '2px solid rgba(212, 175, 55, 0.4)',
                  paddingBottom: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#aa820a', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Certified Atelier Receipt
                  </span>
                  <DialogTitle style={{ margin: '2px 0 0', fontSize: '1.35rem', fontWeight: 700, color: '#092330', fontFamily: 'Cormorant Garamond, serif' }}>
                    Bamas Collection
                  </DialogTitle>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      background: selectedReceipt.status === 'Completed' ? '#ecfdf5' : '#fffbeb',
                      color: selectedReceipt.status === 'Completed' ? '#047857' : '#b45309',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                  >
                    {selectedReceipt.status}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                    {new Date(selectedReceipt.paidAt || selectedReceipt.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Receipt Details Grid */}
              <div
                style={{
                  background: '#f8fafc',
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  fontSize: '0.78rem',
                }}
              >
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem' }}>Transaction ID</span>
                  <strong style={{ fontFamily: 'monospace', color: '#092330' }}>{selectedReceipt.transactionId}</strong>
                </div>

                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem' }}>Payment Method</span>
                  <strong style={{ color: '#092330' }}>{selectedReceipt.paymentMethod}</strong>
                </div>

                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem' }}>Patron Name</span>
                  <strong style={{ color: '#092330' }}>{selectedReceipt.customerName}</strong>
                </div>

                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem' }}>Contact</span>
                  <strong style={{ color: '#092330' }}>{selectedReceipt.customerPhone || selectedReceipt.customerEmail || 'Patron'}</strong>
                </div>
              </div>

              {/* Items breakdown if linked to Order */}
              {selectedReceipt.order && selectedReceipt.order.orderItems && selectedReceipt.order.orderItems.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
                    Purchased Pieces
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {selectedReceipt.order.orderItems.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.35rem 0',
                          borderBottom: '1px solid #f1f5f9',
                          fontSize: '0.8rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{ width: '28px', height: '34px', objectFit: 'cover', borderRadius: '3px' }}
                            />
                          )}
                          <div>
                            <span style={{ fontWeight: 600, color: '#092330' }}>{item.name}</span>
                            <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>Qty: {item.quantity || item.qty || 1}</span>
                          </div>
                        </div>
                        <strong>₹{Number(item.price || 0).toLocaleString('en-IN')}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Payment Proof Screenshot */}
              {(selectedReceipt.paymentProofUrl || selectedReceipt.order?.paymentProofUrl || selectedReceipt.order?.paymentResult?.screenshotUrl) && (
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1.5px solid #10b981',
                    padding: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#047857' }}>
                      📸 Patron Payment Screenshot Proof
                    </span>
                    <a
                      href={selectedReceipt.paymentProofUrl || selectedReceipt.order?.paymentProofUrl || selectedReceipt.order?.paymentResult?.screenshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.68rem', color: '#0284c7', textDecoration: 'underline', fontWeight: 600 }}
                    >
                      Open Full Size ↗
                    </a>
                  </div>
                  <div
                    style={{
                      maxHeight: '180px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      background: '#041017',
                      textAlign: 'center',
                    }}
                  >
                    <img
                      src={selectedReceipt.paymentProofUrl || selectedReceipt.order?.paymentProofUrl || selectedReceipt.order?.paymentResult?.screenshotUrl}
                      alt="Payment Proof"
                      style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain', margin: '0 auto', display: 'block' }}
                    />
                  </div>
                </div>
              )}

              {/* Total Settlement */}
              <div
                style={{
                  background: '#fffdf7',
                  border: '1px solid #d4af37',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#aa820a', fontWeight: 700, textTransform: 'uppercase' }}>
                    Settled Amount
                  </span>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b' }}>
                    Certified by Atelier Audit Ledger
                  </span>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#092330', fontFamily: 'Manrope, sans-serif' }}>
                  ₹{Number(selectedReceipt.amount || 0).toLocaleString('en-IN')}
                </div>
              </div>

              {/* Receipt Footer Action */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.print()}
                  style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Printer size={13} />
                  Print Receipt
                </Button>

                <Button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  style={{ background: '#092330', color: '#ffffff', fontSize: '0.78rem' }}
                >
                  Close Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  MessageSquare,
  ShoppingBag,
  Sparkles,
  UserPlus,
  Send,
  ChevronLeft,
  ChevronRight,
  Search,
  RefreshCw,
} from 'lucide-react';
import { pageHead } from '@/lib/page-head';
import { api } from '@/lib/api';
import { useCustomer } from '@/components/bamas/auth-context';

export const Route = createFileRoute('/notifications')({
  head: () =>
    pageHead(
      'Notifications & Concierge Desk',
      'Order dispatches, inquiries, and luxury atelier announcements from Bamas Collections.'
    ),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user } = useCustomer();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'orders'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Compose Message Form
  const [showCompose, setShowCompose] = useState(false);
  const [composeTitle, setComposeTitle] = useState('');
  const [composeMessage, setComposeMessage] = useState('');
  const [composeSending, setComposeSending] = useState(false);
  const [composeSuccess, setComposeSuccess] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.notifications.getAll();
      if (res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 8000);
    return () => clearInterval(interval);
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id || n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendCompose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTitle || !composeMessage) return;

    setComposeSending(true);
    try {
      await api.notifications.send({
        recipientRole: isAdmin ? 'customer' : 'admin',
        title: composeTitle,
        message: composeMessage,
        type: isAdmin ? 'broadcast' : 'inquiry',
      });
      setComposeSuccess(true);
      setComposeTitle('');
      setComposeMessage('');
      fetchNotifications();
      setTimeout(() => {
        setComposeSuccess(false);
        setShowCompose(false);
      }, 1400);
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setComposeSending(false);
    }
  };

  const getAvatarBadge = (type: string) => {
    switch (type) {
      case 'order':
        return (
          <div className="notification-icon-avatar" style={{ background: '#fefce8', color: '#b45309', border: '1px solid #fef08a' }}>
            <ShoppingBag size={16} />
          </div>
        );
      case 'inquiry':
        return (
          <div className="notification-icon-avatar" style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe' }}>
            <MessageSquare size={16} />
          </div>
        );
      case 'registration':
        return (
          <div className="notification-icon-avatar" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
            <UserPlus size={16} />
          </div>
        );
      case 'status_update':
        return (
          <div className="notification-icon-avatar" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
            <Check size={16} />
          </div>
        );
      default:
        return (
          <div className="notification-icon-avatar" style={{ background: '#fdf4ff', color: '#9333ea', border: '1px solid #f5d0fe' }}>
            <Sparkles size={16} />
          </div>
        );
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

  const filtered = notifications.filter((n) => {
    if (activeTab === 'unread' && n.isRead) return false;
    if (activeTab === 'orders' && n.type !== 'order') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title?.toLowerCase().includes(q);
      const matchMsg = n.message?.toLowerCase().includes(q);
      const matchSender = n.senderName?.toLowerCase().includes(q);
      if (!matchTitle && !matchMsg && !matchSender) return false;
    }
    return true;
  });

  const orderCount = notifications.filter((n) => n.type === 'order').length;

  const quickTopics = isAdmin
    ? [
        '✨ Festive Silk Edit Now Live',
        '📢 Special Handloom Artisan Showcase',
        '⚡ Express Delivery Available Across India',
      ]
    : [
        'Custom Blouse & Drape Inquiry',
        'Order Delivery Status Check',
        'Bridal Silk Consultation Request',
        'Pure Mulberry Silk Care Advice',
      ];

  const handleCardClick = (n: any) => {
    const id = n.id || n._id;
    if (!n.isRead) {
      handleMarkRead(id);
    }
    if (n.targetUrl) {
      navigate({ to: n.targetUrl as any });
    }
  };

  return (
    <div style={{ minHeight: '85vh', background: '#f8fafc', padding: '1.25rem 0 3.5rem' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 1rem' }}>
        {/* Top Navigation Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#092330',
              fontWeight: 600,
              fontSize: '0.82rem',
              textDecoration: 'none',
              background: '#ffffff',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
            }}
          >
            <ChevronLeft size={16} /> Return Home
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh notifications"
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.45rem 0.75rem',
                color: '#64748b',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} /> Refresh
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#b8860b',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <CheckCheck size={14} /> Mark all read ({unreadCount})
              </button>
            )}
          </div>
        </div>

        {/* Clean, Light Header */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            marginBottom: '1rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#092330' }}>
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: '#092330',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                  }}
                >
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.45 }}>
              Real-time order dispatches, inquiries, and atelier broadcasts.
            </p>
          </div>

          <button
            onClick={() => setShowCompose(!showCompose)}
            style={{
              background: '#092330',
              color: '#ffffff',
              border: 'none',
              padding: '0.55rem 1.15rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'background 0.15s ease',
            }}
          >
            <Send size={13} />
            {showCompose ? 'Back to Alerts' : isAdmin ? '+ Broadcast' : '+ Message Concierge'}
          </button>
        </div>

        {/* Compose Form */}
        {showCompose ? (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '1.25rem 1.5rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', paddingBottom: '0.65rem', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#092330' }}>
                {isAdmin ? 'Broadcast Customer Announcement' : 'Message Bamas Concierge'}
              </h3>
              <button
                type="button"
                onClick={() => setShowCompose(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>

            {/* Quick Suggestions */}
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#64748b', marginBottom: '0.35rem' }}>
                Suggested topics:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {quickTopics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    className="notification-topic-pill"
                    onClick={() => setComposeTitle(topic)}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSendCompose} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#092330', marginBottom: '0.3rem' }}>
                  Subject *
                </label>
                <input
                  required
                  type="text"
                  placeholder={
                    isAdmin
                      ? 'e.g. Exclusive Festive Mulberry Silk Edit Now Live'
                      : 'e.g. Question on Mulberry Silk Customization'
                  }
                  value={composeTitle}
                  onChange={(e) => setComposeTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '15px',
                    color: '#092330',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#092330', marginBottom: '0.3rem' }}>
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={
                    isAdmin
                      ? 'Type announcement message for all customer accounts...'
                      : 'Share your questions, wedding dates, or saree customization requests...'
                  }
                  value={composeMessage}
                  onChange={(e) => setComposeMessage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '15px',
                    color: '#092330',
                    resize: 'none',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                ></textarea>
              </div>

              {composeSuccess && (
                <div
                  style={{
                    padding: '0.65rem',
                    background: '#ecfdf5',
                    color: '#065f46',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textAlign: 'center',
                  }}
                >
                  ✓ Notification dispatched successfully!
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  style={{
                    padding: '0.55rem 1.15rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#64748b',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={composeSending}
                  style={{
                    padding: '0.55rem 1.35rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#092330',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Send size={14} />
                  {composeSending ? 'Dispatching...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {/* Clean Segment Tabs & Search */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '0.5rem 0.75rem',
            marginBottom: '0.85rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.65rem',
          }}
        >
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '2px', gap: '2px' }}>
            <button
              type="button"
              className={`notification-segment-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
              style={{ padding: '0.35rem 0.75rem' }}
            >
              All {notifications.length > 0 ? `(${notifications.length})` : ''}
            </button>
            <button
              type="button"
              className={`notification-segment-btn ${activeTab === 'unread' ? 'active' : ''}`}
              onClick={() => setActiveTab('unread')}
              style={{ padding: '0.35rem 0.75rem' }}
            >
              Unread {unreadCount > 0 ? `(${unreadCount})` : ''}
            </button>
            {orderCount > 0 && (
              <button
                type="button"
                className={`notification-segment-btn ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
                style={{ padding: '0.35rem 0.75rem' }}
              >
                Orders ({orderCount})
              </button>
            )}
          </div>

          <div style={{ position: 'relative', width: '200px', maxWidth: '100%' }}>
            <Search size={13} style={{ position: 'absolute', left: '9px', top: '9px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: '32px',
                padding: '0 0.65rem 0 28px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.78rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Notifications Feed */}
        {loading ? (
          <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
            <div className="animate-spin" style={{ width: '28px', height: '28px', border: '3px solid #cbd5e1', borderTopColor: '#092330', borderRadius: '50%', margin: '0 auto 0.85rem' }}></div>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>Loading notifications...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '3.5rem 1.5rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <Bell size={24} style={{ color: '#94a3b8' }} />
            </div>
            <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem', fontWeight: 600, color: '#092330' }}>
              {activeTab === 'unread' ? 'All caught up' : 'No notifications'}
            </h3>
            <p style={{ margin: '0 auto 1.25rem', fontSize: '0.82rem', color: '#64748b', maxWidth: '320px', lineHeight: 1.5 }}>
              {activeTab === 'unread'
                ? 'You have reviewed all your messages and order dispatches.'
                : 'New order updates and messages will appear here.'}
            </p>
            <Link
              to="/products"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: '#092330',
                color: '#ffffff',
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Browse Saree Collection →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {filtered.map((n) => {
              const id = n.id || n._id;
              const isRead = !!n.isRead;
              return (
                <div
                  key={id}
                  className={`notification-card ${!isRead ? 'unread' : ''}`}
                  onClick={() => handleCardClick(n)}
                >
                  <div className="notification-card-top">
                    {getAvatarBadge(n.type)}

                    <div className="notification-card-content">
                      <div className="notification-card-header-row">
                        <span className="notification-card-sender">
                          {n.senderName || 'Bamas Collections'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span className="notification-card-time">{formatTime(n.createdAt)}</span>
                          {!isRead && (
                            <span
                              style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                background: '#d4af37',
                                display: 'inline-block',
                              }}
                            ></span>
                          )}
                        </div>
                      </div>

                      <h4 className="notification-card-title">{n.title}</h4>
                      <p className="notification-card-message">{n.message}</p>

                      <div className="notification-card-footer">
                        {n.targetUrl ? (
                          <span className="notification-card-link">
                            View details <ChevronRight size={13} />
                          </span>
                        ) : (
                          <span></span>
                        )}

                        {!isRead && (
                          <button
                            type="button"
                            className="notification-mark-read-btn"
                            onClick={(e) => handleMarkRead(id, e)}
                          >
                            <Check size={12} /> Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

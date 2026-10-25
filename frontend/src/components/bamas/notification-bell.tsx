import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  Bell,
  Check,
  CheckCheck,
  MessageSquare,
  ShoppingBag,
  Sparkles,
  UserPlus,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useCustomer } from './auth-context';

export function NotificationBell({ isAdmin = false }: { isAdmin?: boolean }) {
  const { user } = useCustomer();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'orders'>('all');

  // Compose Message Screen
  const [showCompose, setShowCompose] = useState(false);
  const [composeTitle, setComposeTitle] = useState('');
  const [composeMessage, setComposeMessage] = useState('');
  const [composeSending, setComposeSending] = useState(false);
  const [composeSuccess, setComposeSuccess] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('bamas_token') : null;
    if (!token && !user) return;
    try {
      const res = await api.notifications.getAll();
      if (res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch {
      // Ignore if offline
    }
  };

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('bamas_token') : null;
    if (!token && !user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 8000);
    const handleFocus = () => fetchNotifications();
    const handleSync = () => fetchNotifications();

    window.addEventListener('focus', handleFocus);
    window.addEventListener('bamas_notification_received', handleSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('bamas_notification_received', handleSync);
    };
  }, [user]);

  // Lock mobile body scroll when open on mobile
  useEffect(() => {
    if (open) {
      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close dropdown on outside click (for desktop)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
      if (isMobile) return;

      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

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
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  // Filter list
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'orders') return n.type === 'order';
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
      setOpen(false);
      navigate({ to: n.targetUrl as any });
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) {
            setShowCompose(false);
            fetchNotifications();
          }
        }}
        title="Notifications"
        aria-label="Real-time Notifications"
        className="notification-bell-btn"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="notification-badge-pip">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Full-Page on Mobile / Floating Dropdown on Desktop */}
      {open && (
        <div className="notification-drawer" role="dialog" aria-modal="true" aria-label="Notifications Drawer">
          {/* Top App Bar Header */}
          <div className="notification-drawer-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <button
                type="button"
                className="back-btn"
                onClick={() => {
                  if (showCompose) {
                    setShowCompose(false);
                  } else {
                    setOpen(false);
                  }
                }}
                aria-label="Close notifications"
              >
                <ChevronLeft size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1.08rem', color: '#092330', letterSpacing: '-0.01em' }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span
                    style={{
                      background: '#092330',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '1px 7px',
                      borderRadius: '999px',
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {unreadCount > 0 && !showCompose && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#b8860b',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '4px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <CheckCheck size={14} /> Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                title="Close"
                aria-label="Close"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Segmented Filter Bar (Clean & Professional) */}
          {!showCompose && (
            <div className="notification-segment-bar">
              <button
                type="button"
                className={`notification-segment-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All {notifications.length > 0 ? `(${notifications.length})` : ''}
              </button>
              <button
                type="button"
                className={`notification-segment-btn ${activeTab === 'unread' ? 'active' : ''}`}
                onClick={() => setActiveTab('unread')}
              >
                Unread {unreadCount > 0 ? `(${unreadCount})` : ''}
              </button>
              {orderCount > 0 && (
                <button
                  type="button"
                  className={`notification-segment-btn ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  Orders ({orderCount})
                </button>
              )}
            </div>
          )}

          {/* Concierge Action Strip */}
          {!showCompose && (
            <div className="notification-concierge-bar">
              <span>{isAdmin ? 'Reach all customer portals' : 'Have questions or styling requests?'}</span>
              <button
                type="button"
                className="notification-concierge-btn"
                onClick={() => setShowCompose(true)}
              >
                <Send size={11} />
                {isAdmin ? 'Broadcast' : 'Message Concierge'}
              </button>
            </div>
          )}

          {/* Content: List or Compose */}
          {showCompose ? (
            /* Compose View */
            <div className="notification-compose-pane">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#092330',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: 0,
                  }}
                >
                  <ChevronLeft size={16} /> Back to notifications
                </button>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                  {isAdmin ? 'Customer Broadcast' : 'Direct Concierge Desk'}
                </span>
              </div>

              {/* Suggestions */}
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#64748b', marginBottom: '0.35rem' }}>
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
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#092330',
                      marginBottom: '0.3rem',
                    }}
                  >
                    Subject *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder={
                      isAdmin
                        ? 'e.g. Exclusive Festive Bridal Edit Now Live'
                        : 'e.g. Inquiry regarding Custom Saree Blouse'
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
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#092330',
                      marginBottom: '0.3rem',
                    }}
                  >
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder={
                      isAdmin
                        ? 'Type announcement message for all customer accounts...'
                        : 'Describe your question, required dates, or custom drape needs...'
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
                      fontSize: '0.82rem',
                      textAlign: 'center',
                      fontWeight: 600,
                    }}
                  >
                    ✓ Dispatched successfully!
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowCompose(false)}
                    style={{
                      padding: '0.55rem 1rem',
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
                      padding: '0.55rem 1.25rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#092330',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Send size={13} />
                    {composeSending ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Notification Cards Feed */
            <div className="notification-drawer-body">
              {filteredNotifications.length === 0 ? (
                <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 0.85rem',
                    }}
                  >
                    <Bell size={22} style={{ color: '#94a3b8' }} />
                  </div>
                  <h4 style={{ margin: '0 0 0.3rem', fontSize: '0.95rem', fontWeight: 600, color: '#092330' }}>
                    {activeTab === 'unread' ? 'All caught up' : 'No notifications'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', maxWidth: '260px', marginInline: 'auto', lineHeight: 1.45 }}>
                    {activeTab === 'unread'
                      ? 'You have reviewed all your notifications.'
                      : 'New order updates and messages will appear here.'}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((n) => {
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
                })
              )}
            </div>
          )}

          {/* Desktop Footer Link */}
          <div
            className="hidden md:flex"
            style={{
              padding: '0.55rem 1rem',
              background: '#f8fafc',
              borderTop: '1px solid #f1f5f9',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.74rem',
              color: '#64748b',
            }}
          >
            <span>Live updates active</span>
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              style={{
                color: '#092330',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              Full Page View <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

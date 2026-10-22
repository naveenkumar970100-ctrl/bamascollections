import { useState, useEffect, useRef } from 'react';
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
  Clock,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useCustomer } from './auth-context';

export function NotificationBell({ isAdmin = false }: { isAdmin?: boolean }) {
  const { user } = useCustomer();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Send message modal
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
      // Ignore if unauthenticated or offline
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

    // Real-time polling every 8 seconds for new messages
    const interval = setInterval(fetchNotifications, 8000);

    const handleFocus = () => fetchNotifications();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleMarkRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
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
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to send notification');
    } finally {
      setComposeSending(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingBag size={15} style={{ color: '#d4af37' }} />;
      case 'inquiry':
        return <MessageSquare size={15} style={{ color: '#38bdf8' }} />;
      case 'registration':
        return <UserPlus size={15} style={{ color: '#10b981' }} />;
      case 'status_update':
        return <Check size={15} style={{ color: '#10b981' }} />;
      default:
        return <Sparkles size={15} style={{ color: '#d4af37' }} />;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) fetchNotifications();
        }}
        title="Real-time Notifications"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: isAdmin ? '#ffffff' : 'rgba(212, 175, 55, 0.08)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          color: '#092330',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#d4af37';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.35)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <Bell size={18} style={{ color: '#092330' }} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              minWidth: '18px',
              height: '18px',
              padding: '0 4px',
              borderRadius: '999px',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
              border: '2px solid #ffffff',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Drawer */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '360px',
            maxWidth: 'calc(100vw - 24px)',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            boxShadow: '0 16px 40px rgba(6, 24, 33, 0.2)',
            zIndex: 9999,
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {/* Panel Header */}
          <div
            style={{
              padding: '0.9rem 1rem',
              background: 'linear-gradient(135deg, #061821 0%, #0a2432 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={16} style={{ color: '#d4af37' }} />
              <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: '#d4af37',
                    color: '#061821',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.45rem',
                    borderRadius: '999px',
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#d4af37',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    padding: '0.2rem 0.4rem',
                    borderRadius: '4px',
                  }}
                >
                  <CheckCheck size={14} /> Read all
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  padding: '2px',
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Quick Action Button: Send Message */}
          <div
            style={{
              padding: '0.6rem 1rem',
              background: '#f8fafc',
              borderBottom: '1px solid #edf2f7',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {isAdmin ? 'Admin Console' : 'Customer Concierge'}
            </span>
            <button
              onClick={() => setShowCompose(true)}
              style={{
                background: '#061821',
                color: '#d4af37',
                border: '1px solid #d4af37',
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Send size={11} />
              {isAdmin ? 'Send to Customers' : 'Message Admin'}
            </button>
          </div>

          {/* Notifications List or Inline Compose View */}
          {showCompose ? (
            <div style={{ padding: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.85rem',
                  paddingBottom: '0.6rem',
                  borderBottom: '1px solid #e2e8f0',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#092330',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: 0,
                  }}
                >
                  ← Back to Alerts
                </button>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d4af37' }}>
                  {isAdmin ? '📢 Broadcast Announcement' : '✉️ Message Admin'}
                </span>
              </div>

              <form onSubmit={handleSendCompose}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#092330',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Subject / Title *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder={
                      isAdmin
                        ? 'e.g. Exclusive Festive Bridal Edit Now Live'
                        : 'e.g. Question on Mulberry Silk Customization'
                    }
                    value={composeTitle}
                    onChange={(e) => setComposeTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.65rem',
                      borderRadius: '6px',
                      border: '1px solid #dce8ec',
                      fontSize: '0.82rem',
                      color: '#092330',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '0.85rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#092330',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Message *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder={
                      isAdmin
                        ? 'Write message to broadcast to customer portals...'
                        : 'Type your message directly to Bamas administrators...'
                    }
                    value={composeMessage}
                    onChange={(e) => setComposeMessage(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.65rem',
                      borderRadius: '6px',
                      border: '1px solid #dce8ec',
                      fontSize: '0.82rem',
                      color: '#092330',
                      resize: 'none',
                    }}
                  ></textarea>
                </div>

                {composeSuccess && (
                  <div
                    style={{
                      padding: '0.45rem',
                      background: '#ecfdf5',
                      color: '#065f46',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      marginBottom: '0.75rem',
                      textAlign: 'center',
                      fontWeight: 600,
                    }}
                  >
                    ✓ Notification dispatched successfully!
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowCompose(false)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '6px',
                      border: '1px solid #dce8ec',
                      background: '#ffffff',
                      color: '#64748b',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={composeSending}
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: '6px',
                      border: '1px solid #d4af37',
                      background: 'linear-gradient(135deg, #061821 0%, #0a2432 100%)',
                      color: '#d4af37',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Send size={13} />
                    {composeSending ? 'Dispatching...' : 'Send'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                  <Bell size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>No notifications yet</p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem' }}>
                    {isAdmin
                      ? 'Inquiries and customer orders will arrive here in real time.'
                      : 'Order updates and stylist responses will appear here.'}
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.isRead && handleMarkRead(n.id)}
                    style={{
                      padding: '0.85rem 1rem',
                      borderBottom: '1px solid #f1f5f9',
                      background: n.isRead ? '#ffffff' : 'rgba(212, 175, 55, 0.05)',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'flex-start',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = n.isRead ? '#f8fafc' : 'rgba(212, 175, 55, 0.09)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = n.isRead ? '#ffffff' : 'rgba(212, 175, 55, 0.05)';
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: '#061821',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      {getIcon(n.type)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.83rem',
                            fontWeight: n.isRead ? 600 : 700,
                            color: '#092330',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {n.title}
                        </p>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                          {formatTime(n.createdAt)}
                        </span>
                      </div>

                      <p
                        style={{
                          margin: '0.2rem 0 0',
                          fontSize: '0.78rem',
                          color: '#64748b',
                          lineHeight: '1.35',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {n.message}
                      </p>

                      <div
                        style={{
                          marginTop: '0.35rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ fontSize: '0.68rem', color: '#d4af37', fontWeight: 600 }}>
                          {n.senderName || 'Bamas Collections'}
                        </span>
                        {!n.isRead && (
                          <span
                            style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              background: '#d4af37',
                            }}
                          ></span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

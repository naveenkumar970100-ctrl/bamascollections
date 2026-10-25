import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, ArrowLeft, Plus, Check, CheckCheck, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { useCustomer } from './auth-context';
import { getSocket, joinChatRoom, leaveChatRoom } from '@/lib/socket';

export interface ConciergeChatProps {
  isOpen?: boolean;
  onClose?: () => void;
  showFloatingButton?: boolean;
}

export function ConciergeChat({
  isOpen: controlledIsOpen,
  onClose,
  showFloatingButton = false,
}: ConciergeChatProps = {}) {
  const { user } = useCustomer();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const [activeInquiryId, setActiveInquiryId] = useState<string | null>(null);
  const [activeInquiry, setActiveInquiry] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const handleOpen = () => {
    setInternalIsOpen(true);
  };

  // Load active inquiry from storage or fetch latest customer inquiry
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedId = localStorage.getItem('bamas_active_chat_id');
    if (storedId) {
      setActiveInquiryId(storedId);
    } else if (user?.email) {
      api.inquiries
        .getMy(user.email)
        .then((res) => {
          if (res.data && res.data.length > 0) {
            const latest = res.data[0];
            setActiveInquiryId(latest._id);
            localStorage.setItem('bamas_active_chat_id', latest._id);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Fetch active conversation thread
  useEffect(() => {
    if (!activeInquiryId) return;

    joinChatRoom(activeInquiryId);

    const loadThread = async () => {
      try {
        setLoading(true);
        const res = await api.inquiries.getById(activeInquiryId);
        if (res.data) {
          setActiveInquiry(res.data);
          const thread = res.data.messages || [];
          if (thread.length === 0 && res.data.message) {
            setMessages([
              {
                senderRole: 'user',
                senderName: res.data.name,
                text: res.data.message,
                createdAt: res.data.createdAt,
              },
            ]);
          } else {
            setMessages(thread);
          }
        }
      } catch (err) {
        console.warn('Could not load chat thread:', err);
      } finally {
        setLoading(false);
      }
    };

    loadThread();

    return () => {
      leaveChatRoom(activeInquiryId);
    };
  }, [activeInquiryId]);

  // Real-time WebSocket incoming message listener
  useEffect(() => {
    getSocket();

    const handleIncomingMessage = (e: any) => {
      const payload = e.detail;
      if (!payload) return;

      const incomingInquiryId = payload.inquiryId || payload.inquiry?._id;
      if (activeInquiryId && incomingInquiryId === activeInquiryId) {
        if (payload.message) {
          setMessages((prev) => {
            const exists = prev.some((m) => m._id && m._id === payload.message._id);
            if (exists) return prev;
            return [...prev, payload.message];
          });
        }
        if (payload.inquiry) {
          setActiveInquiry(payload.inquiry);
        }
        if (!isOpen) {
          setUnreadCount((c) => c + 1);
        }
      } else if (!activeInquiryId && payload.inquiry?._id) {
        // Adopt new inquiry thread
        setActiveInquiryId(payload.inquiry._id);
        localStorage.setItem('bamas_active_chat_id', payload.inquiry._id);
        if (payload.message) {
          setMessages([payload.message]);
        }
        if (!isOpen) {
          setUnreadCount((c) => c + 1);
        }
      }
    };

    window.addEventListener('bamas_message_received', handleIncomingMessage);

    return () => {
      window.removeEventListener('bamas_message_received', handleIncomingMessage);
    };
  }, [activeInquiryId, isOpen]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Clear unread badge when opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const handleStartNewChat = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bamas_active_chat_id');
    }
    if (activeInquiryId) {
      leaveChatRoom(activeInquiryId);
    }
    setActiveInquiryId(null);
    setActiveInquiry(null);
    setMessages([]);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || sending) return;

    setSending(true);

    try {
      if (activeInquiryId) {
        // Send message to existing thread
        const senderName = user?.name || guestName.trim() || activeInquiry?.name || 'Customer';
        const res = await api.inquiries.sendMessage(activeInquiryId, {
          text,
          senderName,
          senderRole: 'user',
        });

        if (res.data?.message) {
          setMessages((prev) => [...prev, res.data.message]);
        }
        setInputText('');
      } else {
        // First message: Create new inquiry and initialize direct conversation
        const name = user?.name || guestName.trim() || 'Valued Patron';
        const email = user?.email || guestEmail.trim() || 'patron@bamascollections.com';
        const phone = user?.phone || guestPhone.trim() || '';

        const res = await api.inquiries.create({
          name,
          email,
          phone,
          subject: 'Live Concierge Direct Message',
          message: text,
        });

        if (res.data?._id) {
          setActiveInquiryId(res.data._id);
          setActiveInquiry(res.data);
          if (typeof window !== 'undefined') {
            localStorage.setItem('bamas_active_chat_id', res.data._id);
          }
          setMessages(
            res.data.messages || [
              {
                senderRole: 'user',
                senderName: name,
                text,
                createdAt: new Date(),
              },
            ]
          );
          joinChatRoom(res.data._id);
        }
        setInputText('');
      }
    } catch (err: any) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Optional Floating Button - Only shown when explicitly requested (defaults to false) */}
      {showFloatingButton && !isOpen && (
        <div
          className="bamas-concierge-floating-wrap"
          style={{
            position: 'fixed',
            bottom: '5rem',
            right: '1.25rem',
            zIndex: 880,
            fontFamily: 'Manrope, sans-serif',
          }}
        >
          <button
            onClick={handleOpen}
            title="Chat with Bamas Concierge"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              background: 'linear-gradient(135deg, #092330 0%, #16384a 100%)',
              color: '#ffffff',
              border: '1px solid rgba(212, 175, 55, 0.45)',
              padding: '0.75rem 1.25rem',
              borderRadius: '999px',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(9, 35, 48, 0.35)',
              transition: 'all 0.25s ease',
            }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <MessageSquare size={19} style={{ color: '#d4af37' }} />
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 8px #22c55e',
                }}
              />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.02em', color: '#f8fafc' }}>
                Atelier Concierge
              </div>
              <div style={{ fontSize: '0.68rem', color: '#93b6c2' }}>Live Direct Chat</div>
            </div>

            {unreadCount > 0 && (
              <span
                style={{
                  background: '#d4af37',
                  color: '#092330',
                  borderRadius: '999px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.5rem',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Dedicated User & Admin Live Chat Modal / View */}
      {isOpen && (
        <div
          className="bamas-livechat-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
        >
          <div className="bamas-livechat-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #092330 0%, #102d3d 100%)',
                padding: '1rem 1.25rem',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleClose}
                  title="Back to Profile"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.65rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                  }}
                >
                  <ArrowLeft size={15} />
                  <span>Back</span>
                </button>

                <div>
                  <h4
                    style={{
                      margin: 0,
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: '#f8fafc',
                      letterSpacing: '0.02em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                    }}
                  >
                    <span>Direct Live Chat</span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontFamily: 'Manrope, sans-serif',
                        fontWeight: 700,
                        background: 'rgba(212, 175, 55, 0.2)',
                        border: '1px solid rgba(212, 175, 55, 0.4)',
                        color: '#d4af37',
                        padding: '0.1rem 0.45rem',
                        borderRadius: '999px',
                      }}
                    >
                      User & Admin
                    </span>
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: '#93b6c2' }}>
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#22c55e',
                        boxShadow: '0 0 6px #22c55e',
                      }}
                    />
                    <span>Atelier Concierge • Real-time Active</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {activeInquiryId && (
                  <button
                    type="button"
                    onClick={handleStartNewChat}
                    title="Start fresh conversation"
                    style={{
                      background: 'rgba(212, 175, 55, 0.15)',
                      border: '1px solid rgba(212, 175, 55, 0.35)',
                      color: '#d4af37',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.35rem 0.65rem',
                      borderRadius: '0.45rem',
                      cursor: 'pointer',
                    }}
                  >
                    + New Chat
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleClose}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    color: '#ffffff',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div
              style={{
                flex: 1,
                padding: '1rem',
                overflowY: 'auto',
                background: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}
            >
              {/* Atelier Welcome Banner */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.85rem',
                  padding: '0.9rem 1.1rem',
                  textAlign: 'center',
                  fontSize: '0.82rem',
                  color: '#64748b',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                }}
              >
                <p style={{ margin: '0 0 0.35rem 0', fontWeight: 700, color: '#092330', fontSize: '0.88rem' }}>
                  ✨ Bamas Collections Atelier Live Desk
                </p>
                Direct real-time 1-on-1 communication with Admin & master stylists. Inquire about pure silk sarees, custom borders, blouse tailoring, and order tracking.
              </div>

              {/* Conversation Threads */}
              {messages.map((m: any, idx: number) => {
                const isAdmin = m.senderRole === 'admin';
                return (
                  <div
                    key={m._id || idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isAdmin ? 'flex-start' : 'flex-end',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: isAdmin ? '#092330' : '#854d0e',
                        marginBottom: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      {isAdmin ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#092330' }}>
                          <ShieldCheck size={13} style={{ color: '#d4af37' }} /> 👑 Admin (Bamas Atelier)
                        </span>
                      ) : (
                        <span>You ({m.senderName || user?.name || 'Customer'})</span>
                      )}
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 400 }}>
                        {m.createdAt
                          ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : ''}
                      </span>
                    </div>

                    <div
                      style={{
                        maxWidth: '82%',
                        padding: '0.75rem 1rem',
                        borderRadius: isAdmin ? '0.2rem 1rem 1rem 1rem' : '1rem 0.2rem 1rem 1rem',
                        background: isAdmin ? '#092330' : 'linear-gradient(135deg, #d4af37 0%, #c49b27 100%)',
                        color: isAdmin ? '#ffffff' : '#092330',
                        fontWeight: isAdmin ? 400 : 600,
                        fontSize: '0.88rem',
                        lineHeight: '1.45',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.78rem', padding: '1rem' }}>
                  Connecting to atelier messages...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Guest identification (if not signed in and starting first thread) */}
            {!user && !activeInquiryId && (
              <div
                style={{
                  padding: '0.65rem 1rem',
                  background: '#f1f5f9',
                  borderTop: '1px solid #e2e8f0',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                }}
              >
                <input
                  type="text"
                  placeholder="Your Name *"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  style={{
                    fontSize: '0.78rem',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '0.35rem',
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    background: '#ffffff',
                  }}
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  style={{
                    fontSize: '0.78rem',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '0.35rem',
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    background: '#ffffff',
                  }}
                />
              </div>
            )}

            {/* Quick Consultation Suggestions */}
            {messages.length === 0 && (
              <div
                style={{
                  padding: '0.5rem 0.85rem',
                  background: '#f8fafc',
                  display: 'flex',
                  gap: '0.4rem',
                  overflowX: 'auto',
                  borderTop: '1px solid #e2e8f0',
                }}
              >
                {[
                  'Do your sarees include blouse piece?',
                  'Can I book a video consultation?',
                  'How fast is insured delivery?',
                  'Can you customize the zari border?',
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setInputText(suggestion)}
                    style={{
                      whiteSpace: 'nowrap',
                      fontSize: '0.72rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '999px',
                      padding: '0.3rem 0.75rem',
                      color: '#092330',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: '0.75rem 1rem',
                background: '#ffffff',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <input
                type="text"
                placeholder="Type your message to Admin..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={sending}
                style={{
                  flex: 1,
                  padding: '0.7rem 0.95rem',
                  borderRadius: '0.55rem',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  color: '#092330',
                }}
              />

              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                style={{
                  background: inputText.trim() && !sending ? '#092330' : '#cbd5e1',
                  color: '#d4af37',
                  border: 'none',
                  width: '42px',
                  height: '42px',
                  borderRadius: '0.55rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputText.trim() && !sending ? 'pointer' : 'default',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

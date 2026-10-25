import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  Send,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  Award,
  Gem,
  MessageSquare,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pageHead } from '@/lib/page-head';
import { api } from '@/lib/api';
import { validateName, validateEmail, validatePhone, validateRequired } from '@/lib/validation';
import { useCustomer } from '@/components/bamas/auth-context';
import hero from '@/assets/saree-hero.jpg';
import maroon from '@/assets/maroon-saree.jpg';

export const Route = createFileRoute('/contact')({
  head: () =>
    pageHead(
      'Contact Us & Bespoke Concierge',
      'Connect with Bamas Collection for bespoke handloom styling, private bridal viewing, or customer assistance in real-time.'
    ),
  component: ContactPage,
});

function ContactPage() {
  const { user } = useCustomer();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    sareeInterest: 'Bridal & Heirloom Silks',
    preferredContact: 'Email',
    subject: '',
    message: '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedInquiry, setSubmittedInquiry] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Real-time validation checks
  const nameVal = validateName(formData.name, 'Full name');
  const emailVal = validateEmail(formData.email, true);
  const phoneVal = validatePhone(formData.phone, false);
  const messageVal = validateRequired(formData.message, 'Message', 10);
  const isFormValid = nameVal.valid && emailVal.valid && (!formData.phone || phoneVal.valid) && messageVal.valid;

  const sareeInterests = [
    'Bridal & Heirloom Silks',
    'Pure Kanchipuram Pattu',
    'Banarasi Brocade & Katan',
    'Pastel & Metallic Tissue',
    'Festive Occasion Drapes',
    'Bespoke Bridal Trousseau Styling',
    'Order Tracking & Delivery Assistance',
    'General Consultation',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setTouched({ name: true, email: true, phone: true, message: true });

    if (!isFormValid) {
      if (!nameVal.valid) setErrorMessage(nameVal.error);
      else if (!emailVal.valid) setErrorMessage(emailVal.error);
      else if (formData.phone && !phoneVal.valid) setErrorMessage(phoneVal.error);
      else if (!messageVal.valid) setErrorMessage(messageVal.error);
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.inquiries.create({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim() || `${formData.sareeInterest} Consultation`,
        sareeInterest: formData.sareeInterest,
        message: formData.message.trim(),
      });

      // Notify other tabs and real-time listeners
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bamas_inquiry_created', { detail: res.data }));
        window.dispatchEvent(new Event('bamas_notification_received'));
      }

      setSubmittedInquiry(res.data || { _id: Date.now().toString(), ...formData });
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to submit your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedInquiry(null);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      sareeInterest: 'Bridal & Heirloom Silks',
      preferredContact: 'Email',
      subject: '',
      message: '',
    });
  };

  return (
    <main style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Hero Header */}
      <section
        style={{
          background: 'linear-gradient(180deg, #061821 0%, #0a2432 100%)',
          color: '#f8fafc',
          padding: '70px 24px 80px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.12,
            backgroundImage: `url(${hero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(3px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '820px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              color: 'var(--gold)',
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '18px',
            }}
          >
            <Sparkles size={14} /> Personal Concierge & Consultations
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
              lineHeight: 1.15,
              margin: '0 0 16px',
              color: '#ffffff',
              fontWeight: 500,
            }}
          >
            Connect With Bamas
          </h1>

          <p
            style={{
              fontSize: '1.05rem',
              lineHeight: 1.7,
              opacity: 0.88,
              maxWidth: '620px',
              margin: '0 auto',
              fontWeight: 400,
            }}
          >
            Whether you desire bespoke bridal styling, guidance on authentic handloom zari, or wish to schedule a private studio viewing — our styling team welcomes your conversation.
          </p>
        </div>
      </section>

      {/* 4 Luxury Contact Cards */}
      {/* Luxury Contact Cards */}
      <section style={{ maxWidth: '1280px', margin: '-40px auto 60px', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Card 1: Official Support Mail (Sole Digital Support Option) */}
          <div
            style={{
              background: 'var(--card)',
              border: '1.5px solid rgba(212, 175, 55, 0.45)',
              borderRadius: '12px',
              padding: '28px 24px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.3s ease, border-color 0.3s ease',
            }}
          >
            <div>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  background: 'rgba(212, 175, 55, 0.15)',
                  color: 'var(--gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Mail size={22} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                  Official Support Mail
                </h3>
                <span
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#22c55e',
                  }}
                  title="Active Support Desk"
                />
              </div>
              <p style={{ margin: '0 0 16px', fontSize: '0.88rem', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                Direct email desk for handloom inquiries, order updates, bespoke bridal styling, and customer assistance.
              </p>
            </div>
            <a
              href="mailto:support@bamascollections.com"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px 18px',
                borderRadius: '6px',
                background: 'var(--primary)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.9rem',
                textDecoration: 'none',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                boxShadow: '0 4px 14px rgba(9, 35, 48, 0.2)',
              }}
            >
              <Mail size={16} /> support@bamascollections.com <ArrowUpRight size={15} />
            </a>
          </div>

          {/* Card 2: Heritage Weave Studio */}
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '12px',
              padding: '28px 24px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  background: 'rgba(212, 175, 55, 0.15)',
                  color: 'var(--gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <MapPin size={22} />
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                Heritage Weave Studio
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: '0.88rem', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                42 Silk Weaver's Lane, Jubilee Hills, Hyderabad, Telangana 500033
              </p>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} style={{ color: 'var(--gold)' }} /> Mon – Sat: 10:30 AM – 8:00 PM
            </div>
          </div>

          {/* Card 3: Certified Silk Mark */}
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '12px',
              padding: '28px 24px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  background: 'rgba(212, 175, 55, 0.15)',
                  color: 'var(--gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Award size={22} />
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                Certified Silk Mark
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: '0.88rem', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                100% genuine pure mulberry silk and authentic gold zari tested for heritage heirlooms.
              </p>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} /> Certified Handloom Guarantee
            </div>
          </div>
        </div>
      </section>

      {/* Main Form and Editorial Grid */}
      <section style={{ maxWidth: '1280px', margin: '0 auto 80px', padding: '0 24px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Real-Time Form */}
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: 'clamp(24px, 4vw, 40px)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ marginBottom: '28px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  color: 'var(--gold)',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                Send Us An Inquiry
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2rem',
                  lineHeight: 1.2,
                  margin: '0 0 8px',
                }}
              >
                Consult Our Drape Specialist
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', margin: 0 }}>
                Submissions are received in real-time by our styling team with immediate notification.
              </p>
            </div>

            {submittedInquiry ? (
              /* Success Confirmation Card */
              <div
                style={{
                  background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.08) 0%, rgba(6, 24, 33, 0.04) 100%)',
                  border: '1.5px solid rgba(212, 175, 55, 0.5)',
                  borderRadius: '12px',
                  padding: '32px 24px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(212, 175, 55, 0.2)',
                    color: 'var(--gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <CheckCircle2 size={32} />
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.8rem',
                    margin: '0 0 8px',
                    color: 'var(--foreground)',
                  }}
                >
                  Inquiry Received
                </h3>

                <p
                  style={{
                    fontSize: '0.92rem',
                    color: 'var(--muted-foreground)',
                    lineHeight: 1.6,
                    maxWidth: '460px',
                    margin: '0 auto 20px',
                  }}
                >
                  Thank you, <strong style={{ color: 'var(--foreground)' }}>{formData.name}</strong>. Your consultation request for <strong style={{ color: 'var(--gold)' }}>{formData.sareeInterest}</strong> has been logged in real-time.
                </p>

                <div
                  style={{
                    display: 'inline-block',
                    padding: '6px 14px',
                    background: 'var(--secondary)',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    color: 'var(--muted-foreground)',
                    marginBottom: '24px',
                    fontFamily: 'monospace',
                  }}
                >
                  Ref ID: BAMAS-INQ-{(submittedInquiry._id || '').slice(-6).toUpperCase() || 'LIVE'}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '320px', margin: '0 auto' }}>
                  <a
                    href="mailto:support@bamascollections.com"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 20px',
                      borderRadius: '6px',
                      background: 'var(--primary)',
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                    }}
                  >
                    <Mail size={16} /> Email Support Team <ArrowUpRight size={16} />
                  </a>

                  <Button
                    variant="outline"
                    onClick={handleReset}
                    style={{
                      borderColor: 'var(--border)',
                      fontSize: '0.85rem',
                    }}
                  >
                    Submit Another Inquiry
                  </Button>
                </div>
              </div>
            ) : (
              /* Real-time Interactive Form */
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {errorMessage && (
                  <div
                    style={{
                      background: '#fee2e2',
                      color: '#991b1b',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      border: '1px solid #f87171',
                    }}
                  >
                    {errorMessage}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label
                        htmlFor="contact-name"
                        style={{ fontSize: '0.82rem', fontWeight: 600 }}
                      >
                        Your Full Name <span style={{ color: 'var(--gold)' }}>*</span>
                      </label>
                      {touched.name && nameVal.valid && (
                        <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>✓ Valid</span>
                      )}
                    </div>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      placeholder="e.g. Radhika Sharma"
                      value={formData.name}
                      onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (!touched.name) setTouched((p) => ({ ...p, name: true }));
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        border: touched.name ? (!nameVal.valid ? '1.5px solid #ef4444' : '1.5px solid #10b981') : '1px solid var(--border)',
                        boxShadow: touched.name && !nameVal.valid ? '0 0 0 1px #ef4444' : 'none',
                        background: 'var(--background)',
                        color: 'var(--foreground)',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                    {touched.name && !nameVal.valid && (
                      <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                        {nameVal.error}
                      </span>
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label
                        htmlFor="contact-email"
                        style={{ fontSize: '0.82rem', fontWeight: 600 }}
                      >
                        Email Address <span style={{ color: 'var(--gold)' }}>*</span>
                      </label>
                      {touched.email && emailVal.valid && (
                        <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>✓ Valid</span>
                      )}
                    </div>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      placeholder="radhika@example.com"
                      value={formData.email}
                      onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (!touched.email) setTouched((p) => ({ ...p, email: true }));
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        border: touched.email ? (!emailVal.valid ? '1.5px solid #ef4444' : '1.5px solid #10b981') : '1px solid var(--border)',
                        boxShadow: touched.email && !emailVal.valid ? '0 0 0 1px #ef4444' : 'none',
                        background: 'var(--background)',
                        color: 'var(--foreground)',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                    {touched.email && !emailVal.valid && (
                      <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                        {emailVal.error}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label
                        htmlFor="contact-phone"
                        style={{ fontSize: '0.82rem', fontWeight: 600 }}
                      >
                        Phone Number (Optional)
                      </label>
                      {touched.phone && formData.phone && phoneVal.valid && (
                        <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>✓ 10 Digits</span>
                      )}
                    </div>
                    <input
                      id="contact-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (!touched.phone) setTouched((p) => ({ ...p, phone: true }));
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        border: touched.phone && formData.phone ? (!phoneVal.valid ? '1.5px solid #ef4444' : '1.5px solid #10b981') : '1px solid var(--border)',
                        boxShadow: touched.phone && formData.phone && !phoneVal.valid ? '0 0 0 1px #ef4444' : 'none',
                        background: 'var(--background)',
                        color: 'var(--foreground)',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                    {touched.phone && formData.phone && !phoneVal.valid && (
                      <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                        {phoneVal.error}
                      </span>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-interest"
                      style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}
                    >
                      Saree Interest / Occasion
                    </label>
                    <select
                      id="contact-interest"
                      value={formData.sareeInterest}
                      onChange={(e) => setFormData({ ...formData, sareeInterest: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        background: 'var(--background)',
                        color: 'var(--foreground)',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                      }}
                    >
                      {sareeInterests.map((interest) => (
                        <option key={interest} value={interest}>
                          {interest}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-subject"
                    style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}
                  >
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    placeholder="e.g. Inquiring about wedding trousseau drape consultation"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label
                      htmlFor="contact-message"
                      style={{ fontSize: '0.82rem', fontWeight: 600 }}
                    >
                      Your Message or Saree Requirements <span style={{ color: 'var(--gold)' }}>*</span>
                    </label>
                    {touched.message && messageVal.valid && (
                      <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>✓ Detailed</span>
                    )}
                  </div>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    placeholder="Describe your saree preferences, event date, color palette, or any specific weaves you are looking for..."
                    value={formData.message}
                    onBlur={() => setTouched((p) => ({ ...p, message: true }))}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (!touched.message) setTouched((p) => ({ ...p, message: true }));
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '6px',
                      border: touched.message ? (!messageVal.valid ? '1.5px solid #ef4444' : '1.5px solid #10b981') : '1px solid var(--border)',
                      boxShadow: touched.message && !messageVal.valid ? '0 0 0 1px #ef4444' : 'none',
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      outline: 'none',
                    }}
                  />
                  {touched.message && !messageVal.valid && (
                    <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                      {messageVal.error}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    Method of Response
                  </label>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 14px',
                      background: 'rgba(212, 175, 55, 0.08)',
                      border: '1px solid rgba(212, 175, 55, 0.35)',
                      borderRadius: '6px',
                      fontSize: '0.86rem',
                      color: 'var(--foreground)',
                      fontWeight: 600,
                    }}
                  >
                    <Mail size={16} style={{ color: 'var(--gold)' }} />
                    <span>Official Support Email (support@bamascollections.com)</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    height: '48px',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: '1px solid var(--gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    marginTop: '8px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(212, 175, 55, 0.25)',
                  }}
                >
                  {submitting ? (
                    <>
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTopColor: '#ffffff',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                        }}
                      />
                      Transmitting Inquiry...
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Send Real-Time Inquiry
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Right Column: Editorial Visual & Studio Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.1)',
                height: '380px',
              }}
            >
              <img
                src={maroon}
                alt="Bamas Silk Studio"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 20%',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, transparent 40%, rgba(6, 24, 33, 0.95) 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '28px',
                  color: '#ffffff',
                }}
              >
                <span
                  style={{
                    color: 'var(--gold)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '4px',
                  }}
                >
                  The Atelier Experience
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.6rem',
                    margin: '0 0 6px',
                  }}
                >
                  Private Bridal Viewings
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9, lineHeight: 1.5 }}>
                  Experience our curated heirloom Banarasi and Kanchipuram bridal silks with dedicated draping specialists in Hyderabad.
                </p>
              </div>
            </div>

            {/* Quick Guarantees Strip */}
            <div
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '24px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Clock size={20} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '0.92rem', fontWeight: 600 }}>Fast Response</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                    Replies within 2 to 4 hours via official support email.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Gem size={20} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '0.92rem', fontWeight: 600 }}>Heirloom Guidance</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                    Silk purity, zari testing, and color coordination advice.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Support Mail Callout Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(6, 24, 33, 0.05) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                borderRadius: '12px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--gold)', display: 'block' }}>
                  Need Direct Support?
                </span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--foreground)' }}>
                  Email: support@bamascollections.com
                </span>
              </div>
              <a
                href="mailto:support@bamascollections.com"
                style={{
                  background: 'var(--primary)',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0,
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                }}
              >
                <Mail size={14} /> Send Email <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Inquiries Accordion */}
      <section
        style={{
          maxWidth: '1000px',
          margin: '0 auto 100px',
          padding: '0 24px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              fontWeight: 700,
              letterSpacing: '1.5px',
              display: 'block',
              marginBottom: '6px',
            }}
          >
            Instant Answers
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', margin: 0 }}>
            Frequently Asked Concierge Questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            {
              q: 'How do video drape appointments work?',
              a: 'Once you submit your inquiry or reach out to our support email desk, our senior stylist will schedule a private 20-minute video call to show you sarees draped on mannequins under natural studio lighting, detail the zari borders, and answer any styling queries.',
            },
            {
              q: 'Are your sarees accompanied by a Silk Mark certificate?',
              a: 'Yes, all pure silk sarees in our collection carry the certified Silk Mark tag issued by the Silk Mark Organisation of India, guaranteeing 100% natural pure mulberry silk.',
            },
            {
              q: 'Can I request customized blouse stitching and fall/pico?',
              a: 'Certainly. All saree orders can be customized with complimentary fall and edge finishing. Bespoke blouse stitching can also be arranged with your measurements before dispatch.',
            },
            {
              q: 'Do you deliver across India and internationally?',
              a: 'Yes, we offer insured express shipping across all major Indian pincodes (delivery in 2–4 business days) and international worldwide delivery (5–7 business days).',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '20px 24px',
              }}
            >
              <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                {item.q}
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

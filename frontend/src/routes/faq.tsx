import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { CheckCircle2, LoaderCircle, Send } from 'lucide-react';
import { pageHead } from '@/lib/page-head';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { validateName, validateEmail, validatePhone, validateRequired } from '@/lib/validation';

export const Route = createFileRoute('/faq')({
  head: () =>
    pageHead(
      'Frequently Asked Questions',
      'Find answers about the Bamas preview collection, customer accounts and saree care.'
    ),
  component: FAQ,
});

const questions = [
  [
    'How can I explore the collection?',
    'Visit our Collection page to see the saree edits. Select a piece to discover its colour story and details.',
  ],
  [
    'Can I purchase a saree or reserve an edit?',
    'Yes! You can reserve pieces, submit styling consultation requests, or inquire about custom draping directly through our online collection portal.',
  ],
  [
    'How do I create a Bamas account?',
    'Visit the Register page and enter your name, email and password. Your customer account is securely stored in our cloud MongoDB database.',
  ],
  [
    'How do I reset my password?',
    'On the Login page, choose Forgot password and enter your email to receive recovery instructions.',
  ],
  [
    'Can I change my profile details?',
    'Yes. Sign in, open My account, update your name, phone or address, and choose Save profile.',
  ],
  [
    'How should I care for a saree?',
    'Always follow the care instructions provided with the actual garment. For delicate mulberry silk or handwoven gold zari detailing, dry clean with a specialist silk cleaner.',
  ],
  [
    'What are the shipping destinations and times?',
    'We deliver across India within 3-5 business days. Express bridal deliveries and international consultations are available on request.',
  ],
];

function FAQ() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const nameVal = validateName(name);
  const emailVal = validateEmail(email);
  const phoneVal = validatePhone(phone);
  const msgVal = validateRequired(message, 'Inquiry Message', 10);

  const isFormValid = nameVal.valid && emailVal.valid && phoneVal.valid && msgVal.valid;

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, message: true });

    if (!isFormValid) {
      if (!nameVal.valid) { setError(nameVal.error); return; }
      if (!emailVal.valid) { setError(emailVal.error); return; }
      if (!phoneVal.valid) { setError(phoneVal.error); return; }
      if (!msgVal.valid) { setError(msgVal.error); return; }
      return;
    }

    setBusy(true);
    setError('');
    setSuccess(false);

    try {
      await api.inquiries.create({
        name,
        email,
        phone,
        subject: subject || 'General Saree Inquiry',
        message,
      });
      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
      setTouched({});
    } catch (err: any) {
      setError(err.message || 'Failed to submit message. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <div className="page-title reveal">
        <span className="eyebrow">A little clarity</span>
        <h1>Frequently asked questions</h1>
        <p>Everything you’d like to know about Bamas.</p>
      </div>

      <section className="faq-wrap">
        {questions.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}

        {/* Styling consultation & inquiry section connected to MongoDB API */}
        <div
          style={{
            marginTop: '3.5rem',
            padding: '2.5rem 2rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '1rem',
            border: '1px solid rgba(212, 175, 55, 0.2)',
          }}
        >
          <span className="eyebrow">Personal Styling Consultation</span>
          <h2 style={{ fontSize: '1.6rem', marginTop: '0.25rem', marginBottom: '0.75rem' }}>
            Have a question or custom saree inquiry?
          </h2>
          <p style={{ color: 'var(--muted, #9ca3af)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Reach out directly to our artisan styling team. All inquiries are saved to our database
            and answered within 24 hours.
          </p>

          <form
            onSubmit={handleContactSubmit}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem' }}>
                  Full name *
                </label>
                {touched.name && nameVal.valid && (
                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>✓ Valid</span>
                )}
              </div>
              <input
                required
                value={name}
                onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!touched.name) setTouched((p) => ({ ...p, name: true }));
                }}
                placeholder="Your full name"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.4rem',
                  border: touched.name
                    ? (!nameVal.valid ? '1.5px solid #ef4444' : '1.5px solid #10b981')
                    : '1px solid rgba(255,255,255,0.15)',
                  boxShadow: touched.name && !nameVal.valid ? '0 0 0 1px #ef4444' : 'none',
                  background: 'rgba(0,0,0,0.2)',
                  color: 'inherit',
                  outline: 'none',
                }}
              />
              {touched.name && !nameVal.valid && (
                <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '3px', display: 'block' }}>
                  {nameVal.error}
                </span>
              )}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem' }}>
                  Email address *
                </label>
                {touched.email && emailVal.valid && (
                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>✓ Valid Email</span>
                )}
              </div>
              <input
                required
                type="email"
                value={email}
                onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (!touched.email) setTouched((p) => ({ ...p, email: true }));
                }}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.4rem',
                  border: touched.email
                    ? (!emailVal.valid ? '1.5px solid #ef4444' : '1.5px solid #10b981')
                    : '1px solid rgba(255,255,255,0.15)',
                  boxShadow: touched.email && !emailVal.valid ? '0 0 0 1px #ef4444' : 'none',
                  background: 'rgba(0,0,0,0.2)',
                  color: 'inherit',
                  outline: 'none',
                }}
              />
              {touched.email && !emailVal.valid && (
                <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '3px', display: 'block' }}>
                  {emailVal.error}
                </span>
              )}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem' }}>
                  Phone number
                </label>
                {touched.phone && phone && phoneVal.valid && (
                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>✓ Valid Phone</span>
                )}
              </div>
              <input
                value={phone}
                onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (!touched.phone) setTouched((p) => ({ ...p, phone: true }));
                }}
                placeholder="10-digit mobile number"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.4rem',
                  border: touched.phone && phone
                    ? (!phoneVal.valid ? '1.5px solid #ef4444' : '1.5px solid #10b981')
                    : '1px solid rgba(255,255,255,0.15)',
                  boxShadow: touched.phone && phone && !phoneVal.valid ? '0 0 0 1px #ef4444' : 'none',
                  background: 'rgba(0,0,0,0.2)',
                  color: 'inherit',
                  outline: 'none',
                }}
              />
              {touched.phone && phone && !phoneVal.valid && (
                <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '3px', display: 'block' }}>
                  {phoneVal.error}
                </span>
              )}
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.3rem' }}>
                Topic / Occasion
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Bridal Drape, Festive Gifting"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.4rem',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(0,0,0,0.2)',
                  color: 'inherit',
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem' }}>
                  Your message *
                </label>
                {touched.message && msgVal.valid && (
                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>✓ Valid Message</span>
                )}
              </div>
              <textarea
                required
                rows={3}
                value={message}
                onBlur={() => setTouched((p) => ({ ...p, message: true }))}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (!touched.message) setTouched((p) => ({ ...p, message: true }));
                }}
                placeholder="How may our stylists assist your saree selection? (minimum 10 characters)"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.4rem',
                  border: touched.message
                    ? (!msgVal.valid ? '1.5px solid #ef4444' : '1.5px solid #10b981')
                    : '1px solid rgba(255,255,255,0.15)',
                  boxShadow: touched.message && !msgVal.valid ? '0 0 0 1px #ef4444' : 'none',
                  background: 'rgba(0,0,0,0.2)',
                  color: 'inherit',
                  outline: 'none',
                }}
              />
              {touched.message && !msgVal.valid && (
                <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '3px', display: 'block' }}>
                  {msgVal.error}
                </span>
              )}
            </div>

            {error && (
              <p style={{ color: '#ef4444', fontSize: '0.85rem', gridColumn: '1 / -1' }}>
                {error}
              </p>
            )}

            {success && (
              <p
                style={{
                  color: '#10b981',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  gridColumn: '1 / -1',
                }}
              >
                <CheckCircle2 size={18} /> Thank you! Your inquiry has been sent to our styling team.
              </p>
            )}

            <div style={{ gridColumn: '1 / -1' }}>
              <Button size="lg" type="submit" disabled={busy}>
                {busy ? <LoaderCircle className="spin" /> : <Send size={16} />} Send Inquiry
              </Button>
            </div>
          </form>
        </div>

        <div className="faq-account">
          Ready to be part of the story?{' '}
          <Link to="/register" className="text-link">
            Join Bamas
          </Link>
        </div>
      </section>
    </main>
  );
}

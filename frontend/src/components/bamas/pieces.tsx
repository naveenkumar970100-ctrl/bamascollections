import { useState } from 'react';
import { ArrowUpRight, CheckCircle2, LoaderCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { api } from '@/lib/api';

export function Pieces({ items }: { items: any[] }) {
  const [piece, setPiece] = useState<any | null>(null);
  const [inquireOpen, setInquireOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  async function handleInquireSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!piece) return;
    setBusy(true);
    try {
      await api.inquiries.create({
        name,
        email,
        phone,
        subject: `Inquiry: ${piece.name}`,
        message: message || `I am interested in acquiring ${piece.name}. Please provide details on delivery and blouse customisation.`,
        sareeInterest: piece.name,
      });
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        setInquireOpen(false);
        setName('');
        setEmail('');
        setMessage('');
      }, 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="pieces-grid">
        {items.map((p, i) => (
          <article className={`piece reveal delay-${i}`} key={p.id || i}>
            <button
              className="piece-photo"
              aria-label={`View ${p.name}`}
              onClick={() => {
                setPiece(p);
                setInquireOpen(false);
              }}
            >
              <img
                className={p.position}
                src={p.image}
                width="768"
                height="1024"
                loading="lazy"
                alt={p.name}
              />
              <span className="piece-view">
                Discover <ArrowUpRight size={18} />
              </span>
            </button>
            <div className="piece-meta">
              <div>
                <span className="eyebrow">{p.category} edit</span>
                <h3>{p.name}</h3>
                {p.formattedPrice && (
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--gold, #d4af37)',
                      fontWeight: 600,
                      marginTop: '0.2rem',
                    }}
                  >
                    {p.formattedPrice}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Details for ${p.name}`}
                onClick={() => {
                  setPiece(p);
                  setInquireOpen(false);
                }}
              >
                <ArrowUpRight />
              </Button>
            </div>
          </article>
        ))}
      </div>

      <Dialog
        open={Boolean(piece)}
        onOpenChange={(v) => {
          if (!v) {
            setPiece(null);
            setInquireOpen(false);
          }
        }}
      >
        <DialogContent className="piece-dialog">
          {piece && (
            <>
              <img src={piece.image} className={piece.position} alt={piece.name} />
              <div>
                <span className="eyebrow">{piece.category} edit</span>
                <DialogTitle>{piece.name}</DialogTitle>
                {piece.formattedPrice && (
                  <p
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: 'var(--gold, #d4af37)',
                      margin: '0.4rem 0',
                    }}
                  >
                    {piece.formattedPrice}
                  </p>
                )}
                <DialogDescription>{piece.detail}</DialogDescription>

                {piece.fabric && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      fontSize: '0.85rem',
                      lineHeight: '1.6',
                      opacity: 0.9,
                    }}
                  >
                    <p>
                      <strong>Fabric:</strong> {piece.fabric}
                    </p>
                    {piece.color && (
                      <p>
                        <strong>Palette:</strong> {piece.color}
                      </p>
                    )}
                  </div>
                )}

                {!inquireOpen ? (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                    <Button onClick={() => setInquireOpen(true)}>Inquire & Reserve Piece</Button>
                    <Button variant="outline" onClick={() => setPiece(null)}>
                      Close
                    </Button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleInquireSubmit}
                    style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      background: 'rgba(0,0,0,0.03)',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--gold, #d4af37)',
                        fontWeight: 600,
                      }}
                    >
                      Styling & Order Consultation
                    </span>
                    <input
                      required
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        padding: '0.5rem',
                        fontSize: '0.85rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #ccc',
                      }}
                    />
                    <input
                      required
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        padding: '0.5rem',
                        fontSize: '0.85rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #ccc',
                      }}
                    />
                    <input
                      placeholder="Phone (optional)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        padding: '0.5rem',
                        fontSize: '0.85rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #ccc',
                      }}
                    />
                    <textarea
                      placeholder={`Any bespoke drape questions regarding ${piece.name}?`}
                      rows={2}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      style={{
                        padding: '0.5rem',
                        fontSize: '0.85rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #ccc',
                      }}
                    />
                    {sentSuccess && (
                      <p
                        style={{
                          color: '#10b981',
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <CheckCircle2 size={16} /> Inquiry recorded in database!
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <Button size="sm" type="submit" disabled={busy || sentSuccess}>
                        {busy ? <LoaderCircle className="spin" /> : <Send size={14} />} Send to Bamas
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => setInquireOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

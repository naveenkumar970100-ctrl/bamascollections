import { useState } from 'react';
import { ArrowUpRight, CheckCircle2, LoaderCircle, Send, ShoppingBag, Zap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { cart } from '@/lib/cart';
import { validateName, validateEmail, validatePhone, validateRequired } from '@/lib/validation';
import { CartDrawer } from './cart-drawer';
import { BookingCheckout } from './booking-checkout';
import { SareeDetailFullPage } from './saree-detail-full-page';

export function Pieces({
  items,
  onSelectPiece,
  onBuyNow,
}: {
  items: any[];
  onSelectPiece?: (piece: any) => void;
  onBuyNow?: (piece: any) => void;
}) {
  const [piece, setPiece] = useState<any | null>(null);
  const [activeFullSaree, setActiveFullSaree] = useState<any | null>(null);
  const [inquireOpen, setInquireOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [directBuySaree, setDirectBuySaree] = useState<any | null>(null);

  // Real-time validation checks for inquiry
  const nameValidation = validateName(name, 'Your name');
  const emailValidation = validateEmail(email, true);
  const phoneValidation = validatePhone(phone, false);
  const messageValidation = validateRequired(message || 'I am interested in acquiring this saree.', 'Message', 5);
  const isFormValid = nameValidation.valid && emailValidation.valid && (!phone || phoneValidation.valid);

  function handleCardClick(p: any) {
    if (onSelectPiece) {
      onSelectPiece(p);
    } else {
      setActiveFullSaree(p);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleAddToCart(p: any) {
    cart.addItem(
      {
        id: p.id || p._id || p.slug,
        name: p.name,
        category: p.category,
        price: p.price || 0,
        formattedPrice: p.formattedPrice,
        image: p.image,
        fabric: p.fabric,
        color: p.color,
      },
      1
    );
    window.location.href = '/cart';
  }

  function handleBuyNow(p: any) {
    if (onBuyNow) {
      onBuyNow(p);
    } else {
      setDirectBuySaree(p);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function handleInquireSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, message: true });
    if (!isFormValid || !piece) return;
    setBusy(true);
    try {
      await api.inquiries.create({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
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
        setTouched({});
      }, 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (activeFullSaree) {
    return (
      <SareeDetailFullPage
        saree={activeFullSaree}
        onBack={() => {
          setActiveFullSaree(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  if (directBuySaree) {
    return (
      <BookingCheckout
        saree={directBuySaree}
        quantity={1}
        onBack={() => setDirectBuySaree(null)}
      />
    );
  }

  return (
    <>
      <div className="pieces-grid">
        {items.map((p, i) => {
          const priceNum = typeof p.price === 'number' ? p.price : Number(p.price || 0);
          const countInStock =
            typeof p.countInStock === 'number'
              ? p.countInStock
              : p.countInStock !== undefined
              ? Number(p.countInStock)
              : 10;
          const isOutOfStock = priceNum <= 0 || countInStock <= 0 || p.inStock === false;

          return (
            <article className={`piece reveal delay-${i}`} key={p.id || i}>
              <button
                className="piece-photo"
                aria-label={`View full details of ${p.name}`}
                onClick={() => handleCardClick(p)}
              >
                <img
                  className={p.position}
                  src={p.image}
                  width="768"
                  height="1024"
                  loading="lazy"
                  alt={p.name}
                />
                {isOutOfStock && (
                  <span className="piece-stock-pill out-of-stock">Out of Stock</span>
                )}
                <span className="piece-view">
                  View Full Details <ArrowUpRight size={18} />
                </span>
              </button>
              <div className="piece-meta" onClick={() => handleCardClick(p)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                  <span className="piece-eyebrow">
                    {p.category
                      ? p.category.toLowerCase().endsWith('edit')
                        ? p.category
                        : `${p.category} edit`
                      : 'Heritage Edit'}
                  </span>
                  {!isOutOfStock && countInStock <= 5 && (
                    <span style={{ fontSize: '0.68rem', color: '#d97706', fontWeight: 600 }}>
                      Only {countInStock} left
                    </span>
                  )}
                </div>

                <div className="piece-title-wrap">
                  <h3 className="piece-title" title={p.name}>
                    <span>{p.name}</span>
                    <ArrowUpRight size={16} className="piece-title-arrow" />
                  </h3>
                </div>

                <p className={`piece-price ${isOutOfStock ? 'out-of-stock-text' : ''}`}>
                  {isOutOfStock
                    ? 'Out of Stock'
                    : (p.formattedPrice || (p.price ? `₹${Number(p.price).toLocaleString('en-IN')}` : ''))}
                </p>
              </div>

              {/* Quick Card Action Buttons: Add to Cart & Buy Now */}
              <div className="piece-card-cta-row">
                <button
                  type="button"
                  className="card-btn-cart"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(p);
                  }}
                  title={`Add ${p.name} to cart`}
                >
                  <ShoppingBag size={15} />
                  <span>{addedId === (p.id || p._id || p.slug) ? 'Added ✓' : 'Add to Cart'}</span>
                </button>

                <button
                  type="button"
                  className={`card-btn-buy ${isOutOfStock ? 'disabled' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isOutOfStock) {
                      alert(`"${p.name}" is currently Out of Stock (Cost is ₹0 or 0 count available) and cannot be booked directly. You can add it to your bag or inquire.`);
                      return;
                    }
                    handleBuyNow(p);
                  }}
                  disabled={isOutOfStock}
                  style={
                    isOutOfStock
                      ? { opacity: 0.5, cursor: 'not-allowed', background: '#cbd5e1', color: '#64748b' }
                      : {}
                  }
                  title={isOutOfStock ? `${p.name} is Out of Stock - Cannot Book` : `Buy ${p.name} now`}
                >
                  <Zap size={15} />
                  <span>{isOutOfStock ? 'Cannot Book' : 'Buy Now'}</span>
                </button>
              </div>
            </article>
          );
        })}
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <input
                        required
                        placeholder="Your full name *"
                        value={name}
                        onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                        onChange={(e) => setName(e.target.value)}
                        style={{
                          padding: '0.5rem',
                          fontSize: '0.85rem',
                          borderRadius: '0.25rem',
                          border: touched.name && !nameValidation.valid ? '1px solid #ef4444' : touched.name && nameValidation.valid ? '1px solid #10b981' : '1px solid #ccc',
                          outline: 'none',
                        }}
                      />
                      {touched.name && !nameValidation.valid && (
                        <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{nameValidation.error}</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <input
                        required
                        type="email"
                        placeholder="Your email address *"
                        value={email}
                        onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                          padding: '0.5rem',
                          fontSize: '0.85rem',
                          borderRadius: '0.25rem',
                          border: touched.email && !emailValidation.valid ? '1px solid #ef4444' : touched.email && emailValidation.valid ? '1px solid #10b981' : '1px solid #ccc',
                          outline: 'none',
                        }}
                      />
                      {touched.email && !emailValidation.valid && (
                        <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{emailValidation.error}</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <input
                        placeholder="10-digit mobile (optional)"
                        value={phone}
                        onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{
                          padding: '0.5rem',
                          fontSize: '0.85rem',
                          borderRadius: '0.25rem',
                          border: touched.phone && phone && !phoneValidation.valid ? '1px solid #ef4444' : touched.phone && phoneValidation.valid ? '1px solid #10b981' : '1px solid #ccc',
                          outline: 'none',
                        }}
                      />
                      {touched.phone && phone && !phoneValidation.valid && (
                        <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{phoneValidation.error}</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
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
                    </div>
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

      {/* Cart Drawer */}
      <CartDrawer
        open={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        onProceedToCheckout={() => {
          setCartDrawerOpen(false);
          const cartItems = cart.getItems();
          if (cartItems.length > 0) {
            handleBuyNow(cartItems[0]);
          } else if (items.length > 0) {
            handleBuyNow(items[0]);
          }
        }}
      />
    </>
  );
}

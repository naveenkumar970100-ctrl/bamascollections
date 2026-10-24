import { useState, useEffect } from 'react';
import { ShoppingBag, X, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cart, type CartItem } from '@/lib/cart';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export function CartDrawer({ open, onClose, onProceedToCheckout }: CartDrawerProps) {
  const [items, setItems] = useState<CartItem[]>(() => cart.getItems());

  useEffect(() => {
    const handleCartUpdate = () => {
      setItems(cart.getItems());
    };
    window.addEventListener('bamas_cart_updated', handleCartUpdate);
    return () => {
      window.removeEventListener('bamas_cart_updated', handleCartUpdate);
    };
  }, []);

  if (!open) return null;

  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  return (
    <div
      className="cart-drawer-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside className="cart-drawer-panel" aria-label="Your Bamas Silk Bag">
        <div className="cart-drawer-header">
          <div className="cart-drawer-title-wrap">
            <ShoppingBag size={20} className="text-gold" />
            <h2 className="cart-drawer-heading">Your Silk Bag</h2>
            <span className="cart-drawer-badge">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button
            type="button"
            className="cart-drawer-close"
            onClick={onClose}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-drawer-empty">
            <div className="cart-drawer-empty-icon">
              <ShoppingBag size={36} />
            </div>
            <h3>Your Bag is Empty</h3>
            <p>Explore our handcrafted heirloom silk sarees and add your favorite drape.</p>
            <Button onClick={onClose} style={{ marginTop: '1rem' }}>
              Explore Collections
            </Button>
          </div>
        ) : (
          <>
            <div className="cart-drawer-items-list">
              {items.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-photo"
                  />
                  <div className="cart-item-details">
                    <span className="cart-item-category">{item.category} edit</span>
                    <h4 className="cart-item-name">{item.name}</h4>
                    <span className="cart-item-price">
                      ₹{((item.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </span>

                    <div className="cart-item-controls">
                      <div className="cart-qty-stepper">
                        <button
                          type="button"
                          onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="cart-item-remove"
                        onClick={() => cart.removeItem(item.id)}
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-drawer-footer">
              <div className="cart-drawer-trust-banner">
                <ShieldCheck size={16} className="text-gold" />
                <span>Silk Mark Certified Pure · Pan-India Insured Transit</span>
              </div>

              <div className="cart-drawer-totals">
                <div className="cart-drawer-total-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="cart-drawer-total-row muted">
                  <span>Insured Shipping</span>
                  <span className="text-emerald">COMPLIMENTARY</span>
                </div>
                <div className="cart-drawer-total-row grand">
                  <span>Total Payable</span>
                  <span className="grand-price">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Button
                className="cart-drawer-checkout-btn"
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
              >
                <span>Proceed to Booking & Payment</span>
                <ArrowRight size={18} />
              </Button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

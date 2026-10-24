import { useState } from 'react';
import {
  ArrowLeft,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  Check,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cart } from '@/lib/cart';
import { BookingCheckout } from './booking-checkout';
import { CartDrawer } from './cart-drawer';

interface SareeDetailFullPageProps {
  saree: any;
  onBack: () => void;
}

export function SareeDetailFullPage({ saree, onBack }: SareeDetailFullPageProps) {
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'shipping'>('details');

  function handleAddToCart() {
    cart.addItem(
      {
        id: saree.id || saree._id || saree.slug,
        name: saree.name,
        category: saree.category,
        price: saree.price || 0,
        formattedPrice: saree.formattedPrice,
        image: saree.image,
        fabric: saree.fabric,
        color: saree.color,
      },
      quantity
    );

    setAddedNotice(true);
    setCartOpen(true);
    setTimeout(() => setAddedNotice(false), 2200);
  }

  function handleBuyNow() {
    setCheckoutOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Dedicated Booking & Payment Checkout
  if (checkoutOpen) {
    return (
      <BookingCheckout
        saree={saree}
        quantity={quantity}
        onBack={() => setCheckoutOpen(false)}
      />
    );
  }

  const priceValue = saree.price || 0;
  const formattedPrice =
    saree.formattedPrice || `₹${priceValue.toLocaleString('en-IN')}`;

  return (
    <div className="pdp-container reveal">
      {/* Top Breadcrumb Bar */}
      <nav className="pdp-top-nav" aria-label="Breadcrumb">
        <button type="button" onClick={onBack} className="pdp-back-button">
          <ArrowLeft size={16} />
          <span>Back to Collection</span>
        </button>
        <div className="pdp-breadcrumb">
          <span>Home</span>
          <span>/</span>
          <span>Collection</span>
          <span>/</span>
          <span>{saree.category}</span>
          <span>/</span>
          <span className="current">{saree.name}</span>
        </div>
      </nav>

      {/* Main 2-Column Product Detail Layout */}
      <div className="pdp-layout">
        {/* Left: Clean High-Resolution Portrait Photo */}
        <div className="pdp-media-column">
          <div className="pdp-image-wrapper">
            <img
              src={saree.image}
              alt={saree.name}
              className={`pdp-main-image ${saree.position || ''}`}
            />
            <div className="pdp-certified-badge">
              <ShieldCheck size={16} className="text-gold" />
              <span>Silk Mark Certified · 100% Pure Silk</span>
            </div>
          </div>
        </div>

        {/* Right: Clean, Professional Product Information & Action Buttons */}
        <div className="pdp-info-column">
          {/* Header Info */}
          <div className="pdp-header">
            <span className="pdp-category-tag">{saree.category} Edit</span>
            <h1 className="pdp-title">{saree.name}</h1>
            <div className="pdp-price-row">
              <span className="pdp-price">{formattedPrice}</span>
              <span className="pdp-tax-badge">Taxes Included · Free Insured Dispatch</span>
            </div>
          </div>

          {/* Description */}
          <p className="pdp-description">
            {saree.detail ||
              'A magnificent heirloom handloom masterpiece woven with certified natural silk and traditional gold zari motifs, curated for milestone celebrations and lifetime memories.'}
          </p>

          {/* Key Trust Highlights */}
          <div className="pdp-highlights-row">
            <div className="pdp-highlight-chip">
              <Sparkles size={14} className="text-gold" />
              <span>Tested Gold Zari</span>
            </div>
            <div className="pdp-highlight-chip">
              <Truck size={14} className="text-gold" />
              <span>Free Delivery in 3–5 Days</span>
            </div>
            <div className="pdp-highlight-chip">
              <Check size={14} className="text-gold" />
              <span>Blouse Piece Included</span>
            </div>
          </div>

          <hr className="pdp-divider" />

          {/* Quantity Selector & Main Action Buttons */}
          <div className="pdp-actions-section">
            <div className="pdp-qty-group">
              <span className="pdp-qty-label">Quantity:</span>
              <div className="pdp-stepper">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Prominent Action Buttons: Add to Cart & Buy Now */}
            <div className="pdp-buttons-row">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddToCart}
                className="pdp-btn pdp-btn-cart"
              >
                <ShoppingBag size={18} />
                <span>{addedNotice ? 'Added to Cart ✓' : 'Add to Cart'}</span>
              </Button>

              <Button
                type="button"
                onClick={handleBuyNow}
                className="pdp-btn pdp-btn-buy"
              >
                <Zap size={18} />
                <span>Buy Now</span>
              </Button>
            </div>

            {/* WhatsApp Concierge Consultation */}
            <a
              href={`https://wa.me/919876543210?text=Hello%20Bamas%20Collection,%20I%20would%20like%20to%20inquire%20about%20${encodeURIComponent(saree.name)}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="pdp-wa-link"
            >
              <span>Questions? Chat with Bamas Stylist on WhatsApp</span>
            </a>
          </div>

          {/* Clean Specification Tabs */}
          <div className="pdp-tabs-container">
            <div className="pdp-tabs-nav" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'details'}
                className={`pdp-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Product Details
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'care'}
                className={`pdp-tab-btn ${activeTab === 'care' ? 'active' : ''}`}
                onClick={() => setActiveTab('care')}
              >
                Fabric & Care
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'shipping'}
                className={`pdp-tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
                onClick={() => setActiveTab('shipping')}
              >
                Delivery & Returns
              </button>
            </div>

            <div className="pdp-tab-content">
              {activeTab === 'details' && (
                <div className="pdp-specs-table">
                  <div className="pdp-spec-item">
                    <span className="spec-name">Fabric</span>
                    <span className="spec-val">
                      {saree.fabric || '100% Pure Mulberry Silk with Gold Zari'}
                    </span>
                  </div>
                  <div className="pdp-spec-item">
                    <span className="spec-name">Palette / Color</span>
                    <span className="spec-val">{saree.color || saree.category}</span>
                  </div>
                  <div className="pdp-spec-item">
                    <span className="spec-name">Zari Authenticity</span>
                    <span className="spec-val">Certified Tested Gold Zari</span>
                  </div>
                  <div className="pdp-spec-item">
                    <span className="spec-name">Blouse Piece</span>
                    <span className="spec-val">Included (Matching Unstitched Pure Silk, 0.8m)</span>
                  </div>
                  <div className="pdp-spec-item">
                    <span className="spec-name">Total Drape Length</span>
                    <span className="spec-val">6.3 Metres (including blouse)</span>
                  </div>
                </div>
              )}

              {activeTab === 'care' && (
                <div className="pdp-text-content">
                  <p>
                    • <strong>Care:</strong> Strictly dry clean only to maintain silk texture and zari brilliance.
                  </p>
                  <p>
                    • <strong>Storage:</strong> Store draped in clean, unbleached cotton muslin cloth. Avoid direct sunlight and moisture.
                  </p>
                  <p>
                    • <strong>Caution:</strong> Do not spray deodorants, perfumes or harsh alcohol directly onto metallic zari.
                  </p>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="pdp-text-content">
                  <p>
                    • <strong>Insured Shipping:</strong> Complimentary air express delivery across all pin codes in India within 3–5 business days.
                  </p>
                  <p>
                    • <strong>Packaging:</strong> Dispatched in our signature Bamas Collection presentation gift box with tamper-evident security seal.
                  </p>
                  <p>
                    • <strong>Hassle-Free Returns:</strong> 7-day doorstep return and exchange support for any manufacturing discrepancy.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onProceedToCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />
    </div>
  );
}

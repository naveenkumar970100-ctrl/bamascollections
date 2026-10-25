import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  ArrowLeft,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  Check,
  Sparkles,
  Eye,
  Maximize2,
  Star,
  Camera,
  MessageSquare,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cart } from '@/lib/cart';
import { api } from '@/lib/api';
import { useCustomer } from './auth-context';
import { BookingCheckout } from './booking-checkout';
import { CartDrawer } from './cart-drawer';

interface SareeDetailFullPageProps {
  saree: any;
  onBack: () => void;
}

export function SareeDetailFullPage({ saree, onBack }: SareeDetailFullPageProps) {
  const { user } = useCustomer();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'shipping'>('details');
  const [zoomOpen, setZoomOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string>(saree.image || '');
  const [galleryImages, setGalleryImages] = useState<string[]>(() => {
    if (Array.isArray(saree.images) && saree.images.length > 0) return saree.images;
    return saree.image ? [saree.image] : [];
  });

  const [currentSaree, setCurrentSaree] = useState<any>(() => saree);
  const [reviews, setReviews] = useState<any[]>(() => saree.reviews || []);
  const [rating, setRating] = useState<number>(() => saree.rating || 5);
  const [numReviews, setNumReviews] = useState<number>(() => saree.numReviews || 0);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  // Manage body class for hiding navigation bars on mobile while viewing product details
  useEffect(() => {
    document.body.classList.add('pdp-view-open');
    return () => {
      document.body.classList.remove('pdp-view-open');
    };
  }, []);

  // Sync when saree prop changes and fetch live images and reviews from MongoDB Atlas
  const loadProductDetails = () => {
    const idOrSlug = currentSaree.slug || currentSaree.id || currentSaree._id || saree.slug || saree.id || saree._id;
    if (!idOrSlug) return;
    api.products
      .getBySlugOrId(idOrSlug)
      .then((res) => {
        if (res?.data) {
          setCurrentSaree((prev: any) => ({ ...prev, ...res.data }));
          const prodImages = Array.isArray(res.data.images) && res.data.images.length > 0
            ? res.data.images.filter((img: string) => typeof img === 'string' && img.trim().length > 0)
            : res.data.image
            ? [res.data.image]
            : [];
          const revs = Array.isArray(res.data.reviews) ? res.data.reviews : [];
          setReviews(revs);
          if (res.data.rating !== undefined) setRating(res.data.rating);
          if (res.data.numReviews !== undefined) setNumReviews(res.data.numReviews);

          // Combine product images and genuine customer drape photos so all related views appear below the main banner
          const reviewPhotos = revs.flatMap((r: any) => r.images || []).filter(Boolean);
          const combined = Array.from(new Set([...prodImages, ...reviewPhotos]));
          if (combined.length > 0) {
            setGalleryImages(combined);
            if (!selectedImage || selectedImage === saree.image) {
              setSelectedImage(combined[0]);
            }
          }
        }
      })
      .catch((err) => {
        console.warn('[PDP]: Could not fetch fresh product details:', err);
      });
  };

  useEffect(() => {
    setCurrentSaree(saree);
    if (saree.image) setSelectedImage(saree.image);

    const initialList =
      Array.isArray(saree.images) && saree.images.length > 0
        ? saree.images.filter((img: string) => typeof img === 'string' && img.trim().length > 0)
        : saree.image
        ? [saree.image]
        : [];
    const initialRevPhotos = (saree.reviews || []).flatMap((r: any) => r.images || []).filter(Boolean);
    const uniqueImages = Array.from(new Set([...initialList, ...initialRevPhotos]));
    setGalleryImages(uniqueImages);
    setReviews(saree.reviews || []);
    setRating(saree.rating || 0);
    setNumReviews(saree.numReviews || 0);

    loadProductDetails();

    const handleReviewSync = () => loadProductDetails();
    const handleProductSync = (e: any) => {
      const updated = e.detail;
      if (!updated) return;
      const currentId = currentSaree.id || currentSaree._id || currentSaree.slug || saree.id || saree._id || saree.slug;
      const targetId = updated.id || updated._id || updated.slug;
      if (
        currentId === targetId ||
        currentSaree.slug === updated.slug ||
        (currentSaree.name && updated.name && currentSaree.name.toLowerCase() === updated.name.toLowerCase())
      ) {
        setCurrentSaree((prev: any) => ({
          ...prev,
          ...updated,
          price: typeof updated.price === 'number' ? updated.price : Number(updated.price || 0),
          countInStock:
            typeof updated.countInStock === 'number'
              ? updated.countInStock
              : updated.countInStock !== undefined
              ? Number(updated.countInStock)
              : 0,
          inStock: updated.inStock !== false && (updated.countInStock === undefined || updated.countInStock > 0),
        }));
      }
    };

    window.addEventListener('bamas_review_created', handleReviewSync);
    window.addEventListener('bamas_product_updated', handleProductSync);
    return () => {
      window.removeEventListener('bamas_review_created', handleReviewSync);
      window.removeEventListener('bamas_product_updated', handleProductSync);
    };
  }, [saree]);

  const priceValue = typeof currentSaree.price === 'number' ? currentSaree.price : Number(currentSaree.price || 0);
  const stockCount =
    typeof currentSaree.countInStock === 'number'
      ? currentSaree.countInStock
      : currentSaree.countInStock !== undefined
      ? Number(currentSaree.countInStock)
      : 10;
  const isOutOfStock = priceValue <= 0 || stockCount <= 0 || currentSaree.inStock === false;

  const formattedPrice =
    priceValue > 0
      ? (currentSaree.formattedPrice && currentSaree.formattedPrice !== 'Out of Stock'
          ? currentSaree.formattedPrice
          : `₹${priceValue.toLocaleString('en-IN')}`)
      : 'Out of Stock';

  function handleAddToCart() {
    cart.addItem(
      {
        id: currentSaree.id || currentSaree._id || currentSaree.slug,
        name: currentSaree.name,
        category: currentSaree.category,
        price: priceValue,
        formattedPrice: formattedPrice,
        image: selectedImage || currentSaree.image,
        fabric: currentSaree.fabric,
        color: currentSaree.color,
      },
      quantity
    );

    window.location.href = '/cart';
  }

  function handleBuyNow() {
    if (isOutOfStock) {
      alert('This saree is currently Out of Stock (Cost ₹0 or 0 count available) and cannot be booked directly. You can add it to your bag or consult with our stylist via support email.');
      return;
    }
    setCheckoutOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Dedicated Booking & Payment Checkout
  if (checkoutOpen) {
    return (
      <BookingCheckout
        saree={{ ...currentSaree, image: selectedImage || currentSaree.image }}
        quantity={quantity}
        onBack={() => setCheckoutOpen(false)}
      />
    );
  }

  const viewLabels = [
    'Main Drape',
    'Pallu & Weave',
    'Border Detail',
    'Pleats Fall',
    'Fabric Close-up',
    'Blouse Piece',
  ];

  // Active photo index in gallery
  const activeImg = selectedImage || saree.image;
  const currentImageIndex = Math.max(0, galleryImages.indexOf(activeImg));

  const handlePrevImage = () => {
    if (galleryImages.length <= 1) return;
    const prevIdx = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    setSelectedImage(galleryImages[prevIdx]);
  };

  const handleNextImage = () => {
    if (galleryImages.length <= 1) return;
    const nextIdx = (currentImageIndex + 1) % galleryImages.length;
    setSelectedImage(galleryImages[nextIdx]);
  };

  useEffect(() => {
    if (!zoomOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (galleryImages.length > 1) {
          const prevIdx = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
          setSelectedImage(galleryImages[prevIdx]);
        }
      } else if (e.key === 'ArrowRight') {
        if (galleryImages.length > 1) {
          const nextIdx = (currentImageIndex + 1) % galleryImages.length;
          setSelectedImage(galleryImages[nextIdx]);
        }
      } else if (e.key === 'Escape') {
        setZoomOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomOpen, currentImageIndex, galleryImages]);

  return (
    <div className="pdp-container reveal">
      {/* Top Nav Bar */}
      <nav className="pdp-top-nav" aria-label="Navigation">
        <button type="button" onClick={onBack} className="pdp-back-button">
          <ArrowLeft size={16} />
          <span>Back to Collection</span>
        </button>
      </nav>

      {/* Main 2-Column Product Detail Layout */}
      <div className="pdp-layout">
        {/* Left: Clean High-Resolution Portrait Photo & Related Images Below */}
        <div className="pdp-media-column">
          <div
            className="pdp-image-wrapper"
            onClick={() => setZoomOpen(true)}
            title="Click to view full photo in high resolution"
          >
            <img
              src={selectedImage || saree.image}
              alt={saree.name}
              className={`pdp-main-image ${saree.position || ''}`}
            />
            <button
              type="button"
              className="pdp-zoom-btn"
              onClick={(e) => {
                e.stopPropagation();
                setZoomOpen(true);
              }}
              title="Full Image View"
            >
              <Maximize2 size={16} />
            </button>
            <div className="pdp-certified-badge">
              <ShieldCheck size={16} className="text-gold" />
              <span>{saree.certificationNotice || 'Silk Mark Certified · 100% Pure Silk'}</span>
            </div>
          </div>

          {/* RELATED IMAGES GALLERY DIRECTLY BELOW THE MAIN BANNER IMAGE */}
          {galleryImages && galleryImages.length > 0 && (
            <div className="pdp-gallery-strip">
              <div className="pdp-gallery-header">
                <div className="pdp-gallery-title-group">
                  <Sparkles size={14} className="text-gold" />
                  <span className="pdp-gallery-title">Related Views & Angles</span>
                </div>
                <span className="pdp-gallery-count">{galleryImages.length} {galleryImages.length === 1 ? 'View' : 'Views'}</span>
              </div>

              <div className="pdp-gallery-thumbnails">
                {galleryImages.map((imgUrl: string, idx: number) => {
                  const isSelected = (selectedImage || saree.image) === imgUrl;
                  const label =
                    idx === 0
                      ? 'Main Drape'
                      : viewLabels[idx] || `Angle ${idx + 1}`;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`pdp-gallery-thumb ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedImage(imgUrl)}
                      title={`Click to view ${label}`}
                    >
                      <div className="pdp-gallery-thumb-img-wrap">
                        <img src={imgUrl} alt={`${saree.name} - ${label}`} />
                        {isSelected && <span className="pdp-thumb-active-dot" />}
                      </div>
                      <span className="pdp-gallery-thumb-label">{label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="pdp-gallery-tip">
                <Eye size={12} />
                <span>Select any photo above to inspect in high resolution</span>
              </p>
            </div>
          )}
        </div>

        {/* Right: Clean, Professional Product Information & Action Buttons */}
        <div className="pdp-info-column">
          {/* Admin Live Controls Banner for logged-in Administrator */}
          {user?.role === 'admin' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.65rem',
                background: 'linear-gradient(135deg, #061821 0%, #0a2432 100%)',
                color: '#ffffff',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1px solid #d4af37',
                marginBottom: '1rem',
                boxShadow: '0 4px 12px rgba(6, 24, 33, 0.15)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '0.74rem',
                    background: '#d4af37',
                    color: '#061821',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    fontWeight: 800,
                  }}
                >
                  👑 ADMIN
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f1f5f9' }}>
                  Live Product Management
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() =>
                    navigate({
                      to: '/admin',
                      search: { tab: 'collections', edit: saree.id || saree._id || saree.slug },
                    } as any)
                  }
                  style={{
                    background: '#d4af37',
                    color: '#061821',
                    border: 'none',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Edit size={13} /> Edit Saree Details
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (
                      !window.confirm(
                        `Are you sure you want to permanently delete "${saree.name}" from MongoDB Atlas?`
                      )
                    ) {
                      return;
                    }
                    try {
                      setDeletingProduct(true);
                      await api.admin.deleteProduct(saree.id || saree._id);
                      alert(`✓ "${saree.name}" removed from database.`);
                      window.dispatchEvent(new Event('bamas_product_deleted'));
                      onBack();
                    } catch (err: any) {
                      alert(`Error deleting product: ${err.message}`);
                    } finally {
                      setDeletingProduct(false);
                    }
                  }}
                  disabled={deletingProduct}
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Trash2 size={13} /> {deletingProduct ? 'Deleting...' : 'Delete Saree'}
                </button>
              </div>
            </div>
          )}

          {/* Header Info */}
          <div className="pdp-header">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.65rem',
              }}
            >
              <span className="pdp-category-tag">{currentSaree.category} Edit</span>

              {/* Real-Time Inventory Stock Counter Badge */}
              {isOutOfStock ? (
                <span className="pdp-stock-badge pdp-stock-badge-out">
                  <span className="pdp-stock-dot out" /> Out of Stock (0 Available)
                </span>
              ) : stockCount <= 5 ? (
                <span className="pdp-stock-badge pdp-stock-badge-low">
                  <span className="pdp-stock-dot low" /> ⚡ Only {stockCount} Left in Stock
                </span>
              ) : (
                <span className="pdp-stock-badge pdp-stock-badge-in">
                  <span className="pdp-stock-dot in" /> ● In Stock ({stockCount} pieces available)
                </span>
              )}
            </div>

            <h1 className="pdp-title">{currentSaree.name}</h1>

            <div className="pdp-price-row">
              {isOutOfStock ? (
                <>
                  <span className="pdp-price pdp-out-of-stock-price">Out of Stock</span>
                  <span className="pdp-tax-badge" style={{ color: '#ef4444', fontWeight: 600 }}>
                    Unavailable for direct booking · Add to Bag or Consult Stylist
                  </span>
                </>
              ) : (
                <>
                  <span className="pdp-price">{formattedPrice}</span>
                  <span className="pdp-tax-badge">
                    {currentSaree.taxNotice || 'Taxes Included · Free Insured Dispatch'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="pdp-description">
            {currentSaree.detail ||
              currentSaree.description ||
              'A magnificent heirloom handloom masterpiece woven with certified natural silk and traditional gold zari motifs, curated for milestone celebrations and lifetime memories.'}
          </p>

          {/* Key Trust Highlights */}
          <div className="pdp-highlights-row">
            {(Array.isArray(currentSaree.highlights) && currentSaree.highlights.length > 0
              ? currentSaree.highlights
              : ['Tested Gold Zari', 'Free Delivery in 3–5 Days', 'Blouse Piece Included']
            ).map((h: string, idx: number) => (
              <div key={idx} className="pdp-highlight-chip">
                <Sparkles size={14} className="text-gold" />
                <span>{h}</span>
              </div>
            ))}
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
                  disabled={isOutOfStock || quantity <= 1}
                  aria-label="Decrease quantity"
                  style={{ opacity: isOutOfStock || quantity <= 1 ? 0.4 : 1, cursor: isOutOfStock || quantity <= 1 ? 'not-allowed' : 'pointer' }}
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => (isOutOfStock ? 1 : Math.min(stockCount || 10, q + 1)))}
                  disabled={isOutOfStock || quantity >= stockCount}
                  aria-label="Increase quantity"
                  style={{ opacity: isOutOfStock || quantity >= stockCount ? 0.4 : 1, cursor: isOutOfStock || quantity >= stockCount ? 'not-allowed' : 'pointer' }}
                >
                  +
                </button>
              </div>

              {/* Stock Inventory Details Hint */}
              <span className="pdp-stock-hint" style={{ fontSize: '0.8rem', color: isOutOfStock ? '#ef4444' : '#64748b' }}>
                {isOutOfStock ? (
                  <strong style={{ color: '#ef4444' }}>0 available in archive</strong>
                ) : (
                  <span><strong>{stockCount}</strong> available</span>
                )}
              </span>
            </div>

            {/* Prominent Action Buttons: Add to Cart (Allowed) & Buy Now (Disabled when Cost 0 / Out of Stock) */}
            <div className="pdp-buttons-row">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddToCart}
                className="pdp-btn pdp-btn-cart"
                title="Add this piece to your shopping bag"
              >
                <ShoppingBag size={18} />
                <span>{addedNotice ? 'Added to Cart ✓' : 'Add to Cart'}</span>
              </Button>

              <Button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`pdp-btn pdp-btn-buy ${isOutOfStock ? 'pdp-btn-disabled' : ''}`}
                style={
                  isOutOfStock
                    ? {
                        background: '#e2e8f0',
                        color: '#94a3b8',
                        cursor: 'not-allowed',
                        border: '1px solid #cbd5e1',
                        boxShadow: 'none',
                      }
                    : {}
                }
                title={isOutOfStock ? 'Out of Stock - Cannot book this item directly' : 'Proceed to immediate booking'}
              >
                <Zap size={18} />
                <span>{isOutOfStock ? 'Cannot Book (Out of Stock)' : 'Buy Now'}</span>
              </Button>
            </div>

            {/* Support Mail Consultation */}
            <a
              href={`mailto:support@bamascollections.com?subject=Inquiry%20regarding%20${encodeURIComponent(currentSaree.name)}`}
              className="pdp-wa-link"
              style={{
                background: 'rgba(9, 35, 48, 0.05)',
                color: '#092330',
                border: '1px solid rgba(212, 175, 55, 0.35)',
              }}
            >
              <span>Questions? Inquire with Atelier Support Mail Desk</span>
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
                  {saree.fabric && (
                    <div className="pdp-spec-item">
                      <span className="spec-name">Fabric</span>
                      <span className="spec-val">{saree.fabric}</span>
                    </div>
                  )}
                  {(saree.color || saree.category) && (
                    <div className="pdp-spec-item">
                      <span className="spec-name">Palette / Color</span>
                      <span className="spec-val">{saree.color || saree.category}</span>
                    </div>
                  )}
                  {saree.border && (
                    <div className="pdp-spec-item">
                      <span className="spec-name">Border & Zari</span>
                      <span className="spec-val">{saree.border}</span>
                    </div>
                  )}
                  {saree.zariAuthenticity && (
                    <div className="pdp-spec-item">
                      <span className="spec-name">Zari Authenticity</span>
                      <span className="spec-val">{saree.zariAuthenticity}</span>
                    </div>
                  )}
                  {saree.blousePiece && (
                    <div className="pdp-spec-item">
                      <span className="spec-name">Blouse Piece</span>
                      <span className="spec-val">{saree.blousePiece}</span>
                    </div>
                  )}
                  {saree.drapeLength && (
                    <div className="pdp-spec-item">
                      <span className="spec-name">Total Drape Length</span>
                      <span className="spec-val">{saree.drapeLength}</span>
                    </div>
                  )}
                  {Array.isArray(saree.customSpecs) &&
                    saree.customSpecs.map((cs: any, idx: number) =>
                      cs.label && cs.value ? (
                        <div key={idx} className="pdp-spec-item">
                          <span className="spec-name">{cs.label}</span>
                          <span className="spec-val">{cs.value}</span>
                        </div>
                      ) : null
                    )}
                </div>
              )}

              {activeTab === 'care' && (
                <div className="pdp-text-content">
                  {(
                    saree.careInstructions ||
                    '• Strictly dry clean only to maintain silk texture and zari brilliance.\n• Store draped in clean, unbleached cotton muslin cloth. Avoid direct sunlight and moisture.\n• Do not spray deodorants, perfumes or harsh alcohol directly onto metallic zari.'
                  )
                    .split('\n')
                    .filter((l: string) => l.trim())
                    .map((line: string, idx: number) => (
                      <p key={idx}>{line.startsWith('•') ? line : `• ${line}`}</p>
                    ))}
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="pdp-text-content">
                  {(
                    saree.shippingReturns ||
                    '• Insured Shipping: Complimentary express air delivery across all pin codes in India within 3–5 business days.\n• Packaging: Dispatched in our signature Bamas Collection presentation gift box with tamper-evident security seal.\n• Hassle-Free Returns: 7-day doorstep return and exchange support for any manufacturing discrepancy.'
                  )
                    .split('\n')
                    .filter((l: string) => l.trim())
                    .map((line: string, idx: number) => (
                      <p key={idx}>{line.startsWith('•') ? line : `• ${line}`}</p>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOMER REVIEWS & RATINGS SECTION BELOW THE PRODUCT */}
      <section className="pdp-reviews-section" style={{ marginTop: '3.5rem', paddingTop: '2rem', borderTop: '1px solid #e2edf0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '0.25rem' }}>
              Verified Atelier Drapes
            </span>
            <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 700, color: '#092330', fontFamily: 'var(--font-serif, serif)' }}>
              Customer Ratings & Reviews
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ecfdf5', padding: '0.45rem 0.95rem', borderRadius: '999px', border: '1px solid #a7f3d0' }}>
            <ShieldCheck size={16} color="#059669" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#065f46' }}>
              100% Genuine Handloom Buyer Reviews
            </span>
          </div>
        </div>

        {reviews.length === 0 ? (
          /* Simple and Professional Empty State: Only shown if no customer has reviewed yet */
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              background: '#ffffff',
              borderRadius: '0.85rem',
              border: '1px solid #e2edf0',
              boxShadow: '0 2px 10px rgba(9, 35, 48, 0.03)',
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
              <MessageSquare size={24} color="#94a3b8" />
            </div>
            <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.15rem', fontWeight: 700, color: '#092330' }}>
              No Customer Reviews Yet
            </h3>
            <p style={{ margin: '0 auto 1.25rem', fontSize: '0.88rem', color: '#64748b', maxWidth: '440px', lineHeight: 1.6 }}>
              This authentic handloom saree has not received public reviews yet. Verified patrons can submit star ratings, reviews, and drape photographs directly from their Patron Dashboard once their order is delivered.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.85rem',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '999px',
                fontSize: '0.78rem',
                color: '#475569',
              }}
            >
              <ShieldCheck size={14} color="#d4af37" />
              <span>Only authenticated orders are eligible for verified reviews</span>
            </div>
          </div>
        ) : (
          /* Genuine Customer Reviews Section: Rendered ONLY when actual reviews exist */
          <>
            {/* Simple & Professional Overview Card */}
            {(() => {
              const realRating = Number(
                (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1)
              );

              return (
                <div
                  className="pdp-reviews-overview-card"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.75rem',
                    background: '#ffffff',
                    borderRadius: '0.85rem',
                    padding: '1.75rem',
                    color: '#092330',
                    border: '1px solid #e2edf0',
                    boxShadow: '0 2px 12px rgba(9, 35, 48, 0.04)',
                    marginBottom: '2rem',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#9c7317', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Patron Satisfaction Score
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', margin: '0.35rem 0' }}>
                      <span style={{ fontSize: '3rem', fontWeight: 800, color: '#092330', lineHeight: 1 }}>
                        {realRating.toFixed(1)}
                      </span>
                      <div>
                        <div style={{ display: 'flex', gap: '3px' }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={18}
                              fill={s <= Math.round(realRating) ? '#d4af37' : '#e2e8f0'}
                              color={s <= Math.round(realRating) ? '#d4af37' : '#cbd5e1'}
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'block', marginTop: '4px' }}>
                          Based on {reviews.length} verified review{reviews.length === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>
                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                      Authentic feedback submitted by verified buyers of this drape.
                    </p>
                  </div>

                  {/* Clean Breakdown Bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', justifyContent: 'center' }}>
                    {[5, 4, 3, 2, 1].map((s) => {
                      const count = reviews.filter((r) => Math.round(r.rating) === s).length;
                      const pct = (count / reviews.length) * 100;
                      return (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem' }}>
                          <span style={{ width: '36px', color: '#475569', fontWeight: 600 }}>{s} ★</span>
                          <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: '#d4af37', borderRadius: '999px', transition: 'width 0.4s ease' }} />
                          </div>
                          <span style={{ width: '28px', textAlign: 'right', color: '#94a3b8', fontSize: '0.75rem' }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Individual Genuine Review Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map((rev, rIdx) => {
                const revDate = rev.createdAt
                  ? new Date(rev.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Verified Patron';

                return (
                  <div
                    key={rev._id || rIdx}
                    style={{
                      background: '#ffffff',
                      borderRadius: '0.75rem',
                      padding: '1.25rem 1.5rem',
                      border: '1px solid #e2edf0',
                      boxShadow: '0 2px 8px rgba(9, 35, 48, 0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.65rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #092330, #1b4961)',
                            color: '#d4af37',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {(rev.name?.charAt(0) || 'P').toUpperCase()}
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#092330' }}>
                            {rev.name || 'Valued Patron'}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                            <ShieldCheck size={13} />
                            <span>✓ Verified Atelier Purchase</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={14}
                              fill={s <= (rev.rating || 5) ? '#d4af37' : '#e2e8f0'}
                              color={s <= (rev.rating || 5) ? '#d4af37' : '#cbd5e1'}
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{revDate}</span>
                      </div>
                    </div>

                    <p style={{ margin: '0 0 0.85rem', fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
                      {rev.comment}
                    </p>

                    {/* Review Attached Images */}
                    {rev.images && Array.isArray(rev.images) && rev.images.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                        {rev.images.map((img: string, iIdx: number) => (
                          <div
                            key={iIdx}
                            onClick={() => setPreviewPhoto(img)}
                            style={{
                              width: '76px',
                              height: '90px',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              border: '1px solid #cbd5e1',
                              transition: 'transform 0.15s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                          >
                            <img src={img} alt="Customer review photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onProceedToCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      {/* Fullscreen High-Resolution Lightbox / Image Dialog */}
      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent
          className="pdp-lightbox-dialog no-default-close"
          style={{
            maxWidth: '96vw',
            width: 'min(960px, 94vw)',
            height: 'min(92vh, 880px)',
            maxHeight: '94vh',
            padding: 0,
            background: 'rgba(5, 17, 24, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '16px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(212, 175, 55, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <DialogTitle className="sr-only">{saree.name} - Full Resolution Saree View</DialogTitle>

          {/* Clean Top Header */}
          <div
            className="pdp-lightbox-header"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.25rem',
              borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
              background: 'linear-gradient(180deg, rgba(9, 35, 48, 0.85) 0%, rgba(9, 35, 48, 0.45) 100%)',
              zIndex: 10,
            }}
          >
            <div style={{ minWidth: 0, paddingRight: '0.75rem' }}>
              <h3
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  margin: 0,
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {saree.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '3px' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: '#d4af37',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontWeight: 700,
                  }}
                >
                  {viewLabels[currentImageIndex] || 'Curated Drape'}
                </span>
                {galleryImages.length > 1 && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: '#94a3b8',
                      background: 'rgba(255, 255, 255, 0.08)',
                      padding: '0.1rem 0.45rem',
                      borderRadius: '999px',
                    }}
                  >
                    View {currentImageIndex + 1} of {galleryImages.length}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setZoomOpen(false)}
              aria-label="Close image preview"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#d4af37';
                e.currentTarget.style.color = '#092330';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#ffffff';
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Main Photo Area - Guaranteed Entire Image View (Uncropped) */}
          <div
            className="pdp-lightbox-photo-area"
            style={{
              position: 'relative',
              flex: '1 1 0%',
              minHeight: 0,
              minWidth: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.75rem',
              overflow: 'hidden',
              background: '#030a0e',
              boxSizing: 'border-box',
            }}
          >
            <img
              src={activeImg}
              alt={`${saree.name} - ${viewLabels[currentImageIndex] || 'Drape View'}`}
              style={{
                width: '100%',
                height: '100%',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                objectPosition: 'center center',
                borderRadius: '8px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.65)',
                userSelect: 'none',
                display: 'block',
                margin: 'auto',
              }}
            />

            {/* Left Prev Arrow Button */}
            {galleryImages.length > 1 && (
              <button
                type="button"
                className="pdp-lightbox-nav-btn pdp-lightbox-nav-prev"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                aria-label="Previous saree angle"
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'rgba(9, 35, 48, 0.85)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.35)',
                  zIndex: 6,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#d4af37';
                  e.currentTarget.style.color = '#092330';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(9, 35, 48, 0.85)';
                  e.currentTarget.style.color = '#ffffff';
                }}
              >
                <ChevronLeft size={22} />
              </button>
            )}

            {/* Right Next Arrow Button */}
            {galleryImages.length > 1 && (
              <button
                type="button"
                className="pdp-lightbox-nav-btn pdp-lightbox-nav-next"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                aria-label="Next saree angle"
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'rgba(9, 35, 48, 0.85)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.35)',
                  zIndex: 6,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#d4af37';
                  e.currentTarget.style.color = '#092330';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(9, 35, 48, 0.85)';
                  e.currentTarget.style.color = '#ffffff';
                }}
              >
                <ChevronRight size={22} />
              </button>
            )}
          </div>

          {/* Clean Bottom Navigation Bar with Thumbnails & Quick Actions */}
          <div
            className="pdp-lightbox-footer"
            style={{
              padding: '0.75rem 1.25rem',
              background: 'linear-gradient(0deg, rgba(9, 35, 48, 0.95) 0%, rgba(9, 35, 48, 0.75) 100%)',
              borderTop: '1px solid rgba(212, 175, 55, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            {/* Gallery Thumbnails */}
            {galleryImages.length > 1 ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  overflowX: 'auto',
                  maxWidth: '100%',
                  padding: '2px 0',
                }}
              >
                {galleryImages.map((imgUrl, idx) => {
                  const isCur = activeImg === imgUrl;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(imgUrl)}
                      style={{
                        width: '42px',
                        height: '54px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        padding: 0,
                        border: isCur ? '2px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.15)',
                        background: '#061821',
                        cursor: 'pointer',
                        opacity: isCur ? 1 : 0.6,
                        transform: isCur ? 'scale(1.05)' : 'none',
                        transition: 'all 0.2s ease',
                        flexShrink: 0,
                      }}
                      title={viewLabels[idx] || `Angle ${idx + 1}`}
                    >
                      <img
                        src={imgUrl}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#d4af37',
                  fontSize: '0.8rem',
                }}
              >
                <ShieldCheck size={16} />
                <span>Certified Pure Mulberry Silk</span>
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="pdp-lightbox-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginLeft: 'auto' }}>
              {isOutOfStock ? (
                <span
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: '#ef4444',
                    marginRight: '0.35rem',
                  }}
                >
                  Out of Stock
                </span>
              ) : formattedPrice ? (
                <span
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#d4af37',
                    marginRight: '0.35rem',
                  }}
                >
                  {formattedPrice}
                </span>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  setZoomOpen(false);
                  handleAddToCart();
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.95rem',
                  background: 'transparent',
                  color: '#ffffff',
                  border: '1px solid rgba(212, 175, 55, 0.45)',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <ShoppingBag size={14} style={{ color: '#d4af37' }} />
                <span>Add to Bag</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isOutOfStock) {
                    alert('This saree is currently Out of Stock and cannot be booked directly. You can add it to your bag or consult with our stylist.');
                    return;
                  }
                  setZoomOpen(false);
                  handleBuyNow();
                }}
                disabled={isOutOfStock}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1.15rem',
                  background: isOutOfStock
                    ? '#334155'
                    : 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                  color: isOutOfStock ? '#94a3b8' : '#092330',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  opacity: isOutOfStock ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                  boxShadow: isOutOfStock ? 'none' : '0 4px 12px rgba(212, 175, 55, 0.3)',
                }}
              >
                <Zap size={14} />
                <span>{isOutOfStock ? 'Cannot Book' : 'Buy Now'}</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Patron Photo Modal */}
      <Dialog open={!!previewPhoto} onOpenChange={(open) => !open && setPreviewPhoto(null)}>
        <DialogContent
          className="pdp-lightbox-dialog no-default-close"
          style={{
            maxWidth: '640px',
            width: '92vw',
            padding: '1.25rem',
            background: 'rgba(5, 17, 24, 0.96)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '16px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)',
          }}
        >
          <DialogTitle className="sr-only">Verified Patron Photo View</DialogTitle>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#d4af37',
                fontSize: '0.88rem',
                fontWeight: 700,
              }}
            >
              <ShieldCheck size={18} />
              <span>Verified Patron Real Photo Drape</span>
            </div>
            <button
              type="button"
              onClick={() => setPreviewPhoto(null)}
              aria-label="Close verified drape photo"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
          {previewPhoto && (
            <div style={{ position: 'relative', textAlign: 'center' }}>
              <img
                src={previewPhoto}
                alt="Verified Patron Drape"
                style={{
                  maxHeight: '74vh',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  borderRadius: '10px',
                  margin: '0 auto',
                  display: 'block',
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}

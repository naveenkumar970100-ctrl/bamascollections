import { useState, useRef } from 'react';
import {
  Star,
  UploadCloud,
  X,
  Camera,
  CheckCircle2,
  LoaderCircle,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface ReviewModalProps {
  open: boolean;
  order: any;
  item: any;
  onClose: () => void;
  onSuccess: (newReview?: any) => void;
}

export function ReviewModal({ open, order, item, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [touched, setTouched] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open || !item) return null;

  const ratingLabels: Record<number, string> = {
    1: 'Disappointing Weave',
    2: 'Needs Improvement',
    3: 'Average Quality',
    4: 'Very Pleased & Graceful',
    5: 'Exceptional Heirloom Drape ★★★★★',
  };

  const isCommentValid = comment.trim().length >= 5;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const newUploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const res = await api.upload.uploadImage(file, 'bamascollections/reviews');
          if (res.data?.url) {
            newUploadedUrls.push(res.data.url);
          }
        } catch (uploadErr) {
          console.warn('[Review Upload Fallback to Data URL]:', uploadErr);
          // Fallback to base64 data URL
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          newUploadedUrls.push(dataUrl);
        }
      }

      setImages((prev) => Array.from(new Set([...prev, ...newUploadedUrls])));
    } catch (err: any) {
      setError(err.message || 'Failed to upload photos. You can also paste image URLs directly.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    const url = imageUrlInput.trim();
    if (!images.includes(url)) {
      setImages((prev) => [...prev, url]);
    }
    setImageUrlInput('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!isCommentValid) {
      setError('Please provide at least 5 characters sharing your experience with this saree.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Find saree identifier (id or slug or item.product)
      const productIdOrSlug = item.product || item.id || item._id || item.slug;
      const orderId = order?._id || order?.id;

      const reviewPayload = {
        rating,
        comment: comment.trim(),
        images,
        name: order?.shippingAddress?.fullName || order?.customerName,
        orderId,
      };

      const res = await api.products.createReview(productIdOrSlug, reviewPayload);

      setSuccess(true);
      window.dispatchEvent(new Event('bamas_review_created'));

      setTimeout(() => {
        onSuccess(res.data?.review);
        onClose();
      }, 1400);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(6, 24, 33, 0.78)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting && !uploading) onClose();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '520px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(9, 35, 48, 0.4)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #092330 0%, #123747 100%)',
            color: '#f8f9fa',
            padding: '1.15rem 1.4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(212, 175, 55, 0.2)',
                color: '#d4af37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={17} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                Rate & Review Delivered Saree
              </h3>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8' }}>
                Order #{order?._id?.toString().slice(-6).toUpperCase() || 'DELIVERED'} · Verified Patron Review
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#cbd5e1',
              cursor: submitting ? 'not-allowed' : 'pointer',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Product Snapshot Bar */}
        <div
          style={{
            background: '#f8fafc',
            padding: '0.85rem 1.4rem',
            borderBottom: '1px solid #e2edf0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
          }}
        >
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: '46px',
                height: '56px',
                borderRadius: '6px',
                objectFit: 'cover',
                border: '1px solid #cbd5e1',
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: '46px',
                height: '56px',
                borderRadius: '6px',
                background: '#092330',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d4af37',
              }}
            >
              <ShoppingBag size={20} />
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <h4
              style={{
                margin: '0 0 2px',
                fontSize: '0.92rem',
                fontWeight: 700,
                color: '#092330',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {item.name}
            </h4>
            <span
              style={{
                fontSize: '0.72rem',
                color: '#047857',
                fontWeight: 700,
                background: '#ecfdf5',
                padding: '2px 8px',
                borderRadius: '4px',
                display: 'inline-block',
              }}
            >
              ✓ Delivered & In Possession
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '1.4rem', overflowY: 'auto', flex: 1 }}>
          {success ? (
            <div
              style={{
                padding: '2.5rem 1rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={54} color="#10b981" style={{ marginBottom: '1rem' }} />
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.3rem', fontWeight: 700, color: '#092330' }}>
                Thank You for Your Patron Review!
              </h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', maxWidth: '380px' }}>
                Your review and customer photos have been recorded live in our database and published to the saree's collection page.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Star Rating Section */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#092330',
                    marginBottom: '0.4rem',
                  }}
                >
                  Your Rating *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '3px',
                          cursor: 'pointer',
                          transition: 'transform 0.15s ease',
                          transform: active ? 'scale(1.15)' : 'scale(1)',
                        }}
                      >
                        <Star
                          size={28}
                          color={active ? '#d4af37' : '#cbd5e1'}
                          fill={active ? '#d4af37' : 'none'}
                        />
                      </button>
                    );
                  })}
                  <span
                    style={{
                      marginLeft: '0.5rem',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: rating >= 4 ? '#b89025' : '#64748b',
                    }}
                  >
                    {ratingLabels[hoverRating || rating]}
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#092330',
                    }}
                  >
                    Review Thoughts & Craftsmanship *
                  </label>
                  <span style={{ fontSize: '0.72rem', color: isCommentValid ? '#10b981' : '#94a3b8' }}>
                    {comment.length} chars (min 5)
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about the silk softness, zari luster, border detailing, drape flow, or occasion styling..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: touched && !isCommentValid ? '1.5px solid #ef4444' : '1px solid #dce8ec',
                    fontSize: '0.9rem',
                    color: '#092330',
                    lineHeight: '1.45',
                    outline: 'none',
                    boxShadow: touched && !isCommentValid ? '0 0 0 1px #ef4444' : 'none',
                  }}
                />
                {touched && !isCommentValid && (
                  <span style={{ fontSize: '0.72rem', color: '#ef4444', display: 'block', marginTop: '3px' }}>
                    Please write at least 5 characters for your review.
                  </span>
                )}
              </div>

              {/* Customer Photos Upload Section */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#092330',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Camera size={16} color="#d4af37" /> Customer Photos ({images.length})
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#688897' }}>
                    Will be featured in customer gallery below product
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      flex: 1,
                      border: '1px dashed #d4af37',
                      background: 'rgba(212, 175, 55, 0.08)',
                      color: '#092330',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      height: '42px',
                    }}
                  >
                    {uploading ? (
                      <>
                        <LoaderCircle size={15} className="spin" style={{ marginRight: '6px' }} />
                        Uploading to Cloudinary...
                      </>
                    ) : (
                      <>
                        <UploadCloud size={16} style={{ color: '#d4af37', marginRight: '6px' }} />
                        Choose Photos from Device
                      </>
                    )}
                  </Button>
                </div>

                {/* Direct image URL input fallback */}
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="Or paste direct image URL (https://...)"
                    style={{
                      flex: 1,
                      padding: '0.45rem 0.65rem',
                      borderRadius: '6px',
                      border: '1px solid #dce8ec',
                      fontSize: '0.8rem',
                      color: '#092330',
                      outline: 'none',
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddImageUrl}
                    disabled={!imageUrlInput.trim()}
                    style={{ fontSize: '0.78rem' }}
                  >
                    + Add
                  </Button>
                </div>

                {/* Uploaded Photos Thumbnails Preview */}
                {images.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                      padding: '0.5rem',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2edf0',
                    }}
                  >
                    {images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: 'relative',
                          width: '62px',
                          height: '62px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          border: '1px solid #cbd5e1',
                        }}
                      >
                        <img
                          src={imgUrl}
                          alt={`Review photo ${idx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            background: 'rgba(0, 0, 0, 0.65)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div
                  style={{
                    padding: '0.65rem 0.85rem',
                    background: '#fef2f2',
                    borderRadius: '6px',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    fontSize: '0.82rem',
                  }}
                >
                  {error}
                </div>
              )}

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={submitting}
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={submitting || uploading}
                  style={{
                    flex: 2,
                    background: 'linear-gradient(135deg, #092330 0%, #123747 100%)',
                    color: '#d4af37',
                    fontWeight: 700,
                    border: '1px solid #d4af37',
                    boxShadow: '0 4px 15px rgba(9, 35, 48, 0.25)',
                  }}
                >
                  {submitting ? (
                    <>
                      <LoaderCircle size={16} className="spin" style={{ marginRight: '6px' }} />
                      Publishing Review...
                    </>
                  ) : (
                    <>Publish Rating & Review</>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

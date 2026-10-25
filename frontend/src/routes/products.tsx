import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pieces } from '@/components/bamas/pieces';
import { SareeDetailFullPage } from '@/components/bamas/saree-detail-full-page';
import { BookingCheckout } from '@/components/bamas/booking-checkout';
import { pageHead } from '@/lib/page-head';
import { api } from '@/lib/api';
import { collection } from '@/lib/collection';
import hero from '@/assets/saree-hero.jpg';
import rose from '@/assets/rose-saree.jpg';
import ivory from '@/assets/ivory-saree.jpg';
import wine from '@/assets/wine-saree.jpg';
import sapphire from '@/assets/sapphire-saree.jpg';
import maroon from '@/assets/maroon-saree.jpg';
import tissue from '@/assets/tissue-saree.jpg';
import lavender from '@/assets/lavender-saree.jpg';

const imageMap: Record<string, string> = {
  '/assets/saree-hero.jpg': hero,
  '/assets/rose-saree.jpg': rose,
  '/assets/ivory-saree.jpg': ivory,
  '/assets/wine-saree.jpg': wine,
  '/assets/sapphire-saree.jpg': sapphire,
  '/assets/maroon-saree.jpg': maroon,
  '/assets/tissue-saree.jpg': tissue,
  '/assets/lavender-saree.jpg': lavender,
  emerald: hero,
  rose: rose,
  ivory: ivory,
  wine: wine,
  sapphire: sapphire,
  'maroon-bridal': maroon,
  tissue: tissue,
  lavender: lavender,
};

function mapProductItem(p: any) {
  const primaryImg =
    p.image && (p.image.startsWith('http') || p.image.startsWith('data:'))
      ? p.image
      : imageMap[p.image] || imageMap[p.slug] || p.image || hero;

  const rawImages = Array.isArray(p.images) && p.images.length > 0 ? p.images : [primaryImg];
  const mappedImages = rawImages.map((img: string) =>
    img && (img.startsWith('http') || img.startsWith('data:')) ? img : imageMap[img] || img
  );

  const priceNum = typeof p.price === 'number' ? p.price : Number(p.price || 0);
  const countInStock =
    typeof p.countInStock === 'number'
      ? p.countInStock
      : p.countInStock !== undefined
      ? Number(p.countInStock)
      : 10;
  const inStock = p.inStock !== false && countInStock > 0 && priceNum > 0;

  return {
    ...p,
    id: p.slug || p.id || p._id,
    name: p.name,
    category: p.category,
    price: priceNum,
    countInStock,
    inStock,
    formattedPrice: priceNum > 0 ? `₹${priceNum.toLocaleString('en-IN')}` : 'Out of Stock',
    image: primaryImg,
    images: mappedImages,
    detail: p.detail || p.description,
    fabric: p.fabric,
    color: p.color,
    position: p.position || '',
    isFeatured: p.isFeatured,
    createdAt: p.createdAt,
  };
}

export const Route = createFileRoute('/products')({
  head: () =>
    pageHead(
      'The Collection',
      'Explore the Bamas Collection saree edits, from festive emerald and wine to royal sapphire, bridal Banarasi and soft organza.'
    ),
  component: Products,
});

function Products() {
  const [selectedSaree, setSelectedSaree] = useState<any | null>(null);
  const [checkoutSaree, setCheckoutSaree] = useState<any | null>(null);
  const [category, setCategory] = useState('All');
  const [allProducts, setAllProducts] = useState<any[]>(() => collection);
  const [products, setProducts] = useState<any[]>(() => collection.map(mapProductItem));
  const [isLive, setIsLive] = useState(false);

  // Check if a saree was selected from home or another page
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('bamas_selected_saree');
      if (saved) {
        setSelectedSaree(JSON.parse(saved));
        sessionStorage.removeItem('bamas_selected_saree');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {}
  }, []);

  // Fetch all live products on mount and when category changes
  useEffect(() => {
    let active = true;
    api.products
      .getAll(category !== 'All' ? { category } : {})
      .then((res) => {
        if (!active) return;
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map(mapProductItem);
          setProducts(mapped);
          setIsLive(true);
        } else {
          const fallback =
            category === 'All'
              ? collection
              : collection.filter((c) => c.category.toLowerCase() === category.toLowerCase());
          setProducts(fallback.map(mapProductItem));
        }
      })
      .catch(() => {
        if (active) {
          const fallback =
            category === 'All'
              ? collection
              : collection.filter((c) => c.category.toLowerCase() === category.toLowerCase());
          setProducts(fallback.map(mapProductItem));
          setIsLive(false);
        }
      });

    return () => {
      active = false;
    };
  }, [category]);

  // Also fetch all once to compute dynamic categories
  useEffect(() => {
    api.products
      .getAll()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setAllProducts(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // ⚡ Real-Time WebSocket Synchronization for catalog & inventory
  useEffect(() => {
    const handleProductUpdated = (e: any) => {
      const updated = e.detail;
      if (!updated) return;
      const mapped = mapProductItem(updated);
      setAllProducts((prev) => {
        const idx = prev.findIndex(
          (p) => (p.id || p._id || p.slug) === (updated.id || updated._id || updated.slug)
        );
        if (idx > -1) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...updated };
          return next;
        }
        return [updated, ...prev];
      });

      setProducts((prev) => {
        const idx = prev.findIndex(
          (p) => (p.id || p._id || p.slug) === (updated.id || updated._id || updated.slug)
        );
        if (idx > -1) {
          const next = [...prev];
          next[idx] = mapped;
          return next;
        }
        return prev;
      });
    };

    const handleProductCreated = (e: any) => {
      const created = e.detail;
      if (!created) return;
      const mapped = mapProductItem(created);
      setAllProducts((prev) => [created, ...prev]);
      if (
        category === 'All' ||
        (created.category && created.category.toLowerCase().includes(category.toLowerCase()))
      ) {
        setProducts((prev) => [mapped, ...prev]);
      }
    };

    const handleProductDeleted = (e: any) => {
      const data = e.detail;
      if (!data) return;
      const targetId = data.id || data.slug;
      setAllProducts((prev) =>
        prev.filter((p) => (p.id || p._id || p.slug) !== targetId && p.slug !== data.slug)
      );
      setProducts((prev) =>
        prev.filter((p) => (p.id || p._id || p.slug) !== targetId && p.slug !== data.slug)
      );
    };

    window.addEventListener('bamas_product_updated', handleProductUpdated);
    window.addEventListener('bamas_product_created', handleProductCreated);
    window.addEventListener('bamas_product_deleted', handleProductDeleted);

    return () => {
      window.removeEventListener('bamas_product_updated', handleProductUpdated);
      window.removeEventListener('bamas_product_created', handleProductCreated);
      window.removeEventListener('bamas_product_deleted', handleProductDeleted);
    };
  }, [category]);

  // Compute clean available categories dynamically from live catalog (filtering out test/empty values)
  const availableCategories = [
    'All',
    'Silk',
    'Bridal',
    'Festive',
    'Everyday',
    ...Array.from(
      new Set(
        allProducts
          .map((p) => (p.category ? p.category.trim() : ''))
          .filter(
            (c) =>
              c &&
              c.toLowerCase() !== 'all' &&
              c.toLowerCase() !== 'test' &&
              !['Silk', 'Bridal', 'Festive', 'Everyday'].some(
                (std) => std.toLowerCase() === c.toLowerCase()
              )
          )
      )
    ),
  ];

  // Calculate live count for each category
  const getCategoryCount = (c: string) => {
    if (c === 'All') return allProducts.length;
    return allProducts.filter((p) => {
      const pCat = (p.category || '').toLowerCase();
      const qCat = c.toLowerCase();
      return pCat.includes(qCat) || qCat.includes(pCat);
    }).length;
  };

  const items = products;

  if (checkoutSaree) {
    return (
      <main>
        <BookingCheckout
          saree={checkoutSaree}
          quantity={1}
          onBack={() => {
            setCheckoutSaree(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </main>
    );
  }

  if (selectedSaree) {
    return (
      <main>
        <SareeDetailFullPage
          saree={selectedSaree}
          onBack={() => {
            setSelectedSaree(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </main>
    );
  }

  return (
    <main>
      <div className="page-title reveal">
        <span className="eyebrow">A story in every drape</span>
        <h1>The Bamas Collection</h1>
        <p>
          Heritage-inspired details. Modern silhouettes.
          <br />
          Explore handcrafted sarees designed for your memorable moments.
        </p>
      </div>
      <section className="section-wrap">
        <div className="catalog-toolbar" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div className="category-filter-rail" role="tablist" aria-label="Collection filters">
            {availableCategories.map((c) => {
              const isActive = category === c;
              const count = getCategoryCount(c);
              return (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setCategory(c)}
                  className={`category-pill-btn ${isActive ? 'active' : ''}`}
                >
                  {isActive && <Sparkles size={12} className="category-pill-sparkle" />}
                  <span>{c === 'All' ? 'All Sarees' : c}</span>
                  <span className="category-pill-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
        {items.length > 0 ? (
          <Pieces
            items={items}
            onSelectPiece={(piece) => {
              setSelectedSaree(piece);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBuyNow={(piece) => {
              setCheckoutSaree(piece);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          <div
            style={{
              padding: '4rem 1.5rem',
              textAlign: 'center',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              margin: '1.5rem 0',
              boxShadow: '0 4px 20px rgba(9, 35, 48, 0.04)',
            }}
          >
            <span className="eyebrow" style={{ color: 'var(--gold)', marginBottom: '0.5rem' }}>
              Collection Catalog
            </span>
            <h3
              style={{
                fontSize: '1.85rem',
                margin: '0.5rem 0',
                fontFamily: 'Cormorant Garamond, serif',
                color: 'var(--foreground)',
              }}
            >
              No Sarees in this Selection
            </h3>
            <p
              style={{
                maxWidth: '480px',
                margin: '0.5rem auto 1.5rem',
                color: 'var(--muted-foreground)',
                fontSize: '0.95rem',
                lineHeight: '1.6',
              }}
            >
              All collections are dynamically populated from the database. When the administration team adds sarees to this category, they will instantly appear here.
            </p>
            <a href="/admin" className="text-link" style={{ fontSize: '0.9rem' }}>
              Open Admin Portal &rarr;
            </a>
          </div>
        )}
        <p className="catalog-note">
          Bamas Signature Collection · Pure handloom silk, authentic gold zari and bespoke drape consultation.
        </p>
      </section>
    </main>
  );
}

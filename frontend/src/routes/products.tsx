import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Pieces } from '@/components/bamas/pieces';
import { SareeDetailFullPage } from '@/components/bamas/saree-detail-full-page';
import { BookingCheckout } from '@/components/bamas/booking-checkout';
import { collection } from '@/lib/collection';
import { pageHead } from '@/lib/page-head';
import { api } from '@/lib/api';
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
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>(collection);
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
        if (!active || !res.data) return;
        const mapped = res.data.map((p: any) => ({
          id: p.slug || p.id || p._id,
          name: p.name,
          category: p.category,
          price: p.price,
          formattedPrice: p.formattedPrice || `₹${(p.price || 0).toLocaleString('en-IN')}`,
          image:
            p.image && (p.image.startsWith('http') || p.image.startsWith('data:'))
              ? p.image
              : imageMap[p.image] || imageMap[p.slug] || p.image || hero,
          detail: p.detail || p.description,
          fabric: p.fabric,
          color: p.color,
          position: p.position || '',
          isFeatured: p.isFeatured,
          createdAt: p.createdAt,
        }));

        setProducts(mapped);
        setIsLive(true);
      })
      .catch(() => {
        if (active) {
          const filtered = collection.filter((p) => category === 'All' || p.category === category);
          setProducts(filtered);
          setIsLive(false);
        }
      });

    return () => {
      active = false;
    };
  }, [category]);

  // Also fetch all once to compute dynamic categories
  useEffect(() => {
    api.products.getAll().then((res) => {
      if (res.data && res.data.length > 0) {
        setAllProducts(res.data);
      }
    }).catch(() => {});
  }, []);

  // Compute available categories dynamically from live catalog
  const availableCategories = [
    'All',
    ...Array.from(
      new Set([
        ...allProducts.map((p) => p.category).filter(Boolean),
        'Silk',
        'Bridal',
        'Festive',
        'Everyday',
      ])
    ),
  ];

  const items = isLive
    ? products
    : collection.filter((p) => category === 'All' || p.category === category);

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
        <div className="catalog-toolbar">
          <div className="category-tabs" aria-label="Collection filters">
            {availableCategories.map((c) => (
              <Button
                variant={category === c ? 'default' : 'ghost'}
                key={c}
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
              >
                {c === 'All' ? 'All Sarees' : c}
              </Button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isLive && (
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '9999px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontWeight: 500,
                }}
              >
                ● Live Catalog
              </span>
            )}
            <span>
              {items.length} collection {items.length === 1 ? 'piece' : 'pieces'}
            </span>
          </div>
        </div>
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
        <p className="catalog-note">
          Bamas Signature Collection · Pure handloom silk, authentic gold zari and bespoke drape consultation.
        </p>
      </section>
    </main>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { Link } from '@/lib/router-shim';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ArrowUpRight, Flower2, Gem, Heart, Sparkles } from 'lucide-react';
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

function getImgSrc(img: any): string {
  if (!img) return '';
  if (typeof img === 'string') return img;
  if (typeof img === 'object' && typeof img.src === 'string') return img.src;
  return String(img);
}

const imageMap: Record<string, string> = {
  '/assets/saree-hero.jpg': getImgSrc(hero),
  '/assets/rose-saree.jpg': getImgSrc(rose),
  '/assets/ivory-saree.jpg': getImgSrc(ivory),
  '/assets/wine-saree.jpg': getImgSrc(wine),
  '/assets/sapphire-saree.jpg': getImgSrc(sapphire),
  '/assets/maroon-saree.jpg': getImgSrc(maroon),
  '/assets/tissue-saree.jpg': getImgSrc(tissue),
  '/assets/lavender-saree.jpg': getImgSrc(lavender),
  emerald: getImgSrc(hero),
  rose: getImgSrc(rose),
  ivory: getImgSrc(ivory),
  wine: getImgSrc(wine),
  sapphire: getImgSrc(sapphire),
  'maroon-bridal': getImgSrc(maroon),
  tissue: getImgSrc(tissue),
  lavender: getImgSrc(lavender),
};


export default function Home() {
  const { data: configResp } = useQuery({
    queryKey: ['siteConfig'],
    queryFn: () => api.siteConfig.get(),
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const { data: productsResp } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => api.products.getAll(),
    staleTime: 1000 * 15, // 15 seconds so new sarees reflect immediately
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const heroImage = configResp?.data?.heroBannerUrl || hero;

  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedSaree, setSelectedSaree] = useState<any | null>(null);
  const [checkoutSaree, setCheckoutSaree] = useState<any | null>(null);

  // Resume saree booking checkout if patron logged in from /login
  useEffect(() => {
    try {
      const autoCheckoutStr = sessionStorage.getItem('bamas_auto_checkout_saree');
      if (autoCheckoutStr) {
        const autoCheckout = JSON.parse(autoCheckoutStr);
        sessionStorage.removeItem('bamas_auto_checkout_saree');
        if (autoCheckout.saree) {
          setCheckoutSaree(autoCheckout.saree);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
    } catch {}
  }, []);

  // Prioritize featured and newly added sarees on the homepage
  const rawProducts =
    productsResp?.data && productsResp.data.length > 0 ? productsResp.data : collection;

  // Dynamically derive clean categories from live products
  const homeCategories = [
    'All',
    'Silk',
    'Bridal',
    'Festive',
    'Everyday',
    ...Array.from(
      new Set(
        rawProducts
          .map((p: any) => (p.category ? p.category.trim() : ''))
          .filter(
            (c: string) =>
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

  const filteredRawProducts =
    activeCategory === 'All'
      ? rawProducts
      : rawProducts.filter(
          (p: any) => (p.category || '').toLowerCase() === activeCategory.toLowerCase()
        );

  const sortedProducts = [...filteredRawProducts].sort((a: any, b: any) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const displayItems = sortedProducts.slice(0, 8).map((p: any) => {
    const imgStr = getImgSrc(p.image);
    const primaryImg =
      imgStr && (imgStr.startsWith('http') || imgStr.startsWith('data:') || imgStr.startsWith('/'))
        ? imgStr
        : getImgSrc(imageMap[imgStr]) || getImgSrc(imageMap[p.slug]) || imgStr || getImgSrc(hero);

    const rawImages = Array.isArray(p.images) && p.images.length > 0 ? p.images : [primaryImg];
    const mappedImages = rawImages.map((img: any) => {
      const s = getImgSrc(img);
      return s && (s.startsWith('http') || s.startsWith('data:') || s.startsWith('/')) ? s : getImgSrc(imageMap[s]) || s;
    });

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
    };
  });

  // If checkout is active directly for a booked saree
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

  // If a specific saree was clicked from the homepage, show the exact details page directly
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
      <section className="hero">
        <img
          src={getImgSrc(heroImage) || getImgSrc(hero)}
          onError={(e) => {
            e.currentTarget.src = getImgSrc(hero);
          }}
          width="1536"
          height="1024"
          alt="Emerald saree with a golden border in a heritage courtyard"
          className="hero-photo"
          fetchPriority="high"
          decoding="async"
        />
        <div className="hero-inner reveal">
          <div className="hero-floating-badge">
            <Sparkles size={13} className="gold-sparkle" />
            <span>Pure Mulberry Silk · Certified Handloom</span>
          </div>
          <span className="eyebrow delay-1">Tradition, beautifully reimagined</span>
          <h1 className="delay-2">
            Bamas Collection
            <br />
            <em>Timeless sarees.</em>
            <br />
            Modern you.
          </h1>
          <p className="delay-3">
            For the moments that become memories.
            <br />
            Discover sarees as beautifully individual as you.
          </p>
          <div className="delay-4">
            <Button asChild className="hero-button">
              <Link to="/products">
                Explore the collection <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
        <div className="hero-bottom">
          <span>
            <i /> A story in every drape
          </span>
          <div className="hero-pager" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </div>
      </section>

      <div className="promise-strip">
        <div className="reveal delay-1">
          <Flower2 />
          <span>Inspired by heritage</span>
        </div>
        <div className="reveal delay-2">
          <Gem />
          <span>Thoughtful details</span>
        </div>
        <div className="reveal delay-3">
          <Heart />
          <span>Elegance for every moment</span>
        </div>
      </div>

      <section className="section-wrap">
        <div className="section-heading reveal">
          <div>
            <span className="eyebrow">The Bamas edit</span>
            <h2>Find your kind of timeless.</h2>
          </div>
          <Link to="/products" className="text-link">
            View collection <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* Dynamic Collection Category Filter with Side Scroller */}
        <div style={{ margin: '0.75rem 0 1.5rem', width: '100%', overflow: 'hidden' }}>
          <div className="category-filter-rail" role="tablist" aria-label="Curated Categories">
            {homeCategories.map((cat, catIdx) => {
              const isSelected = activeCategory === cat;
              const count =
                cat === 'All'
                  ? rawProducts.length
                  : rawProducts.filter((p: any) => {
                      const pCat = (p.category || '').toLowerCase();
                      const qCat = cat.toLowerCase();
                      return pCat.includes(qCat) || qCat.includes(pCat);
                    }).length;

              return (
                <button
                  key={`home-cat-${cat || catIdx}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveCategory(cat)}
                  className={`category-pill-btn ${isSelected ? 'active' : ''}`}
                >
                  {isSelected && <Sparkles size={12} className="category-pill-sparkle" />}
                  <span>{cat === 'All' ? 'All Curations' : cat}</span>
                  <span className="category-pill-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {displayItems.length > 0 ? (
          <Pieces
            items={displayItems}
            onSelectPiece={(s) => {
              setSelectedSaree(s);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBuyNow={(piece) => {
              const currentUser = typeof window !== 'undefined' ? api.auth.getCurrentUser() : null;
              if (!currentUser) {
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem(
                    'bamas_pending_booking',
                    JSON.stringify({
                      saree: piece,
                      quantity: 1,
                      origin: '/',
                    })
                  );
                  window.location.href = '/login';
                }
                return;
              }
              setCheckoutSaree(piece);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          <div
            style={{
              padding: '3.5rem 1.5rem',
              textAlign: 'center',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              boxShadow: '0 4px 20px rgba(9, 35, 48, 0.04)',
            }}
          >
            <span className="eyebrow" style={{ color: 'var(--gold)', marginBottom: '0.5rem' }}>
              Bamas Curated Archive
            </span>
            <h3
              style={{
                fontSize: '1.85rem',
                margin: '0.5rem 0',
                fontFamily: 'Cormorant Garamond, serif',
                color: 'var(--foreground)',
              }}
            >
              Curating New Heirloom Collections
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
              All collections are dynamically maintained in the database. As the administration team adds new saree pieces, they will automatically be unveiled here.
            </p>
            <Link to="/products" className="text-link" style={{ fontSize: '0.9rem' }}>
              Explore Collection Catalog &rarr;
            </Link>
          </div>
        )}
      </section>

      {/* Royal Bridal & Festive Spotlight */}
      <section
        style={{
          padding: '2rem 24px 4rem',
          maxWidth: '1280px',
          margin: 'auto',
        }}
      >
        <div
          className="spotlight-card spotlight-card-inner reveal"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2.5rem',
            alignItems: 'center',
            background: 'radial-gradient(circle at top right, rgba(212,175,55,0.12), rgba(15,28,28,0.7))',
            borderRadius: '1.25rem',
            padding: '2.5rem',
            border: '1px solid rgba(212,175,55,0.3)',
          }}
        >
          <div className="spotlight-image-grid">
            <img
              src={getImgSrc(maroon)}
              alt="Noor Banarasi Bridal Saree"
              className="spotlight-photo"
              loading="lazy"
              decoding="async"
              style={{
                borderRadius: '0.75rem',
                width: '100%',
                height: '320px',
                objectFit: 'cover',
                objectPosition: 'center 0%',
                boxShadow: '0 12px 28px rgba(0,0,0,0.25)',
                border: '1px solid rgba(212,175,55,0.2)',
              }}
            />
            <img
              src={getImgSrc(sapphire)}
              alt="Royal Sapphire Silk Saree"
              className="spotlight-photo"
              loading="lazy"
              decoding="async"
              style={{
                borderRadius: '0.75rem',
                width: '100%',
                height: '320px',
                objectFit: 'cover',
                objectPosition: 'center 0%',
                marginTop: '1.25rem',
                boxShadow: '0 12px 28px rgba(0,0,0,0.25)',
                border: '1px solid rgba(212,175,55,0.2)',
              }}
            />
          </div>
          <div>
            <span className="eyebrow" style={{ color: 'var(--gold)' }}>The Bridal & Silk Spotlight</span>
            <h2
              style={{
                fontSize: '2.2rem',
                margin: '0.5rem 0 1rem',
                lineHeight: 1.2,
              }}
            >
              Heirloom Drapes for Your Landmark Moments.
            </h2>
            <p
              style={{
                opacity: 0.85,
                lineHeight: 1.7,
                fontSize: '0.95rem',
                marginBottom: '1.5rem',
              }}
            >
              From royal crimson Banarasi brocades to peacock-hued Kanchipuram silks, each piece in our
              curated collection is handwoven with certified authentic zari and pure mulberry silk.
            </p>
            <Button asChild size="lg" className="hero-button">
              <Link to="/products">
                Explore Bridal & Silk Edits <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="story-band">
        <img
          src={getImgSrc(rose)}
          alt="Rose-coloured saree with intricate golden weaving"
          loading="lazy"
          decoding="async"
          width="768"
          height="1024"
          className="story-photo"
          style={{ objectPosition: 'center 0%' }}
        />
        <div className="story-copy">
          <span className="eyebrow">More than a saree</span>
          <h2>
            A little heritage.
            <br />
            A lot of you.
          </h2>
          <p>
            There's something special about a saree. The way it moves, the memories it holds, the
            confidence it brings. At Bamas, we celebrate that connection — between tradition and the
            woman you are today.
          </p>
          <Link to="/about" className="text-link">
            Discover our story <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      <section className="quote-section">
        <span className="eyebrow">The Bamas philosophy</span>
        <h2>"Trends come and go. Elegance stays."</h2>
        <p>Timeless Sarees. Modern You.</p>
      </section>
    </main>
  );
}


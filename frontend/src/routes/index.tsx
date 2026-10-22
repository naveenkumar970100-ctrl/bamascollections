import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ArrowUpRight, Flower2, Gem, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pieces } from '@/components/bamas/pieces';
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

export const Route = createFileRoute('/')({
  head: () =>
    pageHead(
      'Timeless Sarees. Modern You.',
      'Discover Bamas Collection — timeless sarees with heritage details and a modern point of view, made for the moments that become memories.',
      'https://bamascollections.lovable.app/og-home.jpg'
    ),
  component: Home,
});

function Home() {
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

  // Prioritize featured and newly added sarees on the homepage
  const sortedProducts = productsResp?.data && productsResp.data.length > 0
    ? [...productsResp.data].sort((a: any, b: any) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime());
      })
    : [];

  const displayItems =
    sortedProducts.length > 0
      ? sortedProducts.slice(0, 8).map((p: any) => ({
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
        }))
      : collection;

  return (
    <main>
      <section className="hero">
        <img
          src={heroImage}
          onError={(e) => {
            e.currentTarget.src = hero;
          }}
          width="1536"
          height="1024"
          alt="Emerald saree with a golden border in a heritage courtyard"
          className="hero-photo"
          fetchPriority="high"
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
        <Pieces items={displayItems} />
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
              src={maroon}
              alt="Noor Banarasi Bridal Saree"
              className="spotlight-photo"
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
              src={sapphire}
              alt="Royal Sapphire Silk Saree"
              className="spotlight-photo"
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
          src={rose}
          alt="Rose-coloured saree with intricate golden weaving"
          loading="lazy"
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
            There’s something special about a saree. The way it moves, the memories it holds, the
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
        <h2>“Trends come and go. Elegance stays.”</h2>
        <p>Timeless Sarees. Modern You.</p>
      </section>
    </main>
  );
}

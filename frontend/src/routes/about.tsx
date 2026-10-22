import { createFileRoute, Link } from '@tanstack/react-router';
import { Flower2, Heart, Gem, Sparkles, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { pageHead } from '@/lib/page-head';
import hero from '@/assets/saree-hero.jpg';
import maroon from '@/assets/maroon-saree.jpg';
import tissue from '@/assets/tissue-saree.jpg';

export const Route = createFileRoute('/about')({
  head: () =>
    pageHead(
      'Our Story',
      'Meet Bamas Collection, where timeless saree traditions meet your own modern story.'
    ),
  component: About,
});

function About() {
  return (
    <main>
      <div className="page-title reveal">
        <span className="eyebrow">Rooted in tradition. Made for today.</span>
        <h1>The story of Bamas</h1>
        <p>Timeless Sarees. Modern You.</p>
      </div>

      <section className="about-intro">
        <img
          src={hero}
          alt="A graceful emerald saree in a traditional courtyard"
          width="1536"
          height="1024"
          style={{ objectPosition: '74% 0%' }}
        />
        <div className="reveal">
          <span className="eyebrow">Our point of view</span>
          <h2>
            Some things never
            <br />
            go out of style.
          </h2>
          <p>
            A saree is more than what you wear. It’s a little piece of heritage, a reflection of
            personality, and a part of the moments you’ll always remember.
          </p>
          <p>
            Bamas Collection brings that feeling into the present. Our world is one of rich colours,
            graceful drapes and details that speak softly — an expression of timeless elegance for
            the modern you.
          </p>
          <Link to="/products" className="text-link">
            Find your Bamas moment <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      {/* Visual Artisan Showcase */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '2rem auto 4rem',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
        }}
      >
        <div
          style={{
            position: 'relative',
            borderRadius: '1rem',
            overflow: 'hidden',
            aspectRatio: '3/4',
            boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
          }}
        >
          <img
            src={maroon}
            alt="Handcrafted Banarasi bridal weaving"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '1.5rem',
              background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
              color: '#fff',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'var(--gold, #d4af37)',
              }}
            >
              Heirloom Artistry
            </span>
            <h3 style={{ fontSize: '1.3rem', margin: '0.25rem 0' }}>The Banarasi Loom</h3>
            <p style={{ fontSize: '0.825rem', opacity: 0.9 }}>
              Every thread hand-guided by master weavers carrying generations of loom mastery.
            </p>
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            borderRadius: '1rem',
            overflow: 'hidden',
            aspectRatio: '3/4',
            boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
          }}
        >
          <img
            src={tissue}
            alt="Contemporary shimmering tissue silk saree"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '1.5rem',
              background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
              color: '#fff',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'var(--gold, #d4af37)',
              }}
            >
              Modern Luxury
            </span>
            <h3 style={{ fontSize: '1.3rem', margin: '0.25rem 0' }}>Gilded Silhouettes</h3>
            <p style={{ fontSize: '0.825rem', opacity: 0.9 }}>
              Lightweight metallic silk that flows with effortless grace from day celebrations into evening galas.
            </p>
          </div>
        </div>
      </section>

      <section className="values">
        <div>
          <Flower2 />
          <h3>Heritage, reimagined.</h3>
          <p>
            Inspired by the beauty of Indian saree traditions, with a fresh perspective for today.
          </p>
        </div>
        <div>
          <Gem />
          <h3>Beauty in the details.</h3>
          <p>
            Thoughtful colours, intricate patterns and graceful silhouettes define the Bamas aesthetic.
          </p>
        </div>
        <div>
          <Heart />
          <h3>Always, unapologetically you.</h3>
          <p>
            Style that celebrates your individuality, from everyday memories to special occasions.
          </p>
        </div>
      </section>
    </main>
  );
}

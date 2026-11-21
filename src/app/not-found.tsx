import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        textAlign: 'center',
        fontFamily: 'Manrope, sans-serif',
      }}
    >
      <span
        style={{
          fontSize: '0.82rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#d4af37',
          fontWeight: 700,
          marginBottom: '0.5rem',
        }}
      >
        404 • Page Not Found
      </span>
      <h1
        style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          color: '#092330',
          fontFamily: 'Cormorant Garamond, serif',
          margin: '0 0 1rem',
        }}
      >
        Timeless Drapes, Uncharted Paths
      </h1>
      <p style={{ color: '#64748b', maxWidth: '440px', lineHeight: 1.6, margin: '0 0 1.75rem' }}>
        The saree or page you are looking for might have been moved, renamed, or is currently reserved in our private vaults.
      </p>
      <Link
        href="/products"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: '#092330',
          color: '#ffffff',
          padding: '0.75rem 1.75rem',
          borderRadius: '8px',
          fontWeight: 700,
          fontSize: '0.92rem',
          textDecoration: 'none',
          border: '1px solid #d4af37',
        }}
      >
        Explore Collections
      </Link>
    </div>
  );
}


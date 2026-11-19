import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import { ClientLayout } from '@/components/bamas/client-layout';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://bamascollections.vercel.app'),
  title: 'Bamas Collection | Timeless Sarees. Modern You.',
  description: 'Explore the Bamas Collection saree edits, from festive emerald and wine to royal sapphire, bridal Banarasi and soft organza.',
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: 'Bamas Collection',
    description: 'Timeless Sarees. Modern You.',
    url: 'https://bamascollections.vercel.app',
    siteName: 'Bamas Collection',
    images: [
      {
        url: '/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'Bamas Collection Luxury Sarees',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@400;500;600;700&display=swap"
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}

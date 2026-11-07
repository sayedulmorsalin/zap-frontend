import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ShopProvider } from '../context/ShopContext';
import { WhatsAppFloatingButton } from '../components/Common/WhatsAppFloatingButton';
import { SearchModal } from '../components/Modals/SearchModal';
import { CustomerBottomNav } from '../components/Navigation/CustomerBottomNav';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ZAP Footwear | Premium Shoes, Sneakers & Formal Leather in Bangladesh',
  description: 'ZAP is the premier footwear destination in Bangladesh. Discover mastercrafted genuine leather formal shoes, high-performance athletic runners, urban streetwear sneakers, and ergonomic comfort styles with nationwide delivery.',
  keywords: 'zap footwear, shoes bd, sneakers bangladesh, formal leather shoes dhaka, luxury shoes bd, running shoes bangladesh',
  openGraph: {
    title: 'ZAP Footwear | Premium Shoes & Sneakers',
    description: 'Elevate your stride. Mastercrafted footwear with complimentary nationwide delivery over Tk 2,500.',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://zap-api-s07dc5-55b9e4-185-209-229-28.sslip.io" crossOrigin="" />
        <link rel="dns-prefetch" href="https://zap-api-s07dc5-55b9e4-185-209-229-28.sslip.io" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body suppressHydrationWarning>
        <ShopProvider>
          {children}
          <SearchModal />
          <CustomerBottomNav />
          <WhatsAppFloatingButton />
        </ShopProvider>
      </body>
    </html>
  );
}

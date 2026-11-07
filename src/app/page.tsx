'use client';

import React from 'react';
import { AnnouncementBar } from '../components/Header/AnnouncementBar';
import { Navbar } from '../components/Header/Navbar';
import { HeroSlider } from '../components/Hero/HeroSlider';
import { StoryCategories } from '../components/Hero/StoryCategories';
import { ProductCatalog } from '../components/Catalog/ProductCatalog';
import { Footer } from '../components/Footer/Footer';

// Modals & Drawers
import { QuickViewModal } from '../components/Modals/QuickViewModal';
import { CartDrawer } from '../components/Modals/CartDrawer';
import { WishlistDrawer } from '../components/Modals/WishlistDrawer';
import { CheckoutModal } from '../components/Modals/CheckoutModal';
import { TrackOrderModal } from '../components/Modals/TrackOrderModal';
import { SizeGuideModal } from '../components/Modals/SizeGuideModal';

import { useShop } from '../context/ShopContext';

export default function Home() {
  const { toastMessage } = useShop();

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      {/* 1. Header Structure */}
      <AnnouncementBar />
      <Navbar />

      {/* 2. Hero Presentation */}
      <HeroSlider />
      <StoryCategories />

      {/* 3. Core Product Showcase & Filter Catalog */}
      <ProductCatalog />

      {/* 4. Rich Footer (with Value Proposition Info Cards) */}
      <Footer />

      {/* 9. Interactive Overlays & Modals */}
      <QuickViewModal />
      <CartDrawer />
      <WishlistDrawer />
      <CheckoutModal />
      <TrackOrderModal />
      <SizeGuideModal />

      {/* 10. Global Toast Alert */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast-dot" />
          <span>{toastMessage}</span>
        </div>
      )}
    </main>
  );
}

'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Compass, Search, Heart, ShoppingBag } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const CustomerBottomNav: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    cartCount,
    wishlistCount,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsSearchOpen,
    setSelectedCategory,
    setSelectedBrand,
    setSelectedGender,
  } = useShop();

  // Hide bottom navigation on Admin, Checkout, or Product Details page (where sticky buy bar exists)
  if (
    !pathname ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/products/')
  ) {
    return null;
  }

  const handleHomeClick = () => {
    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/');
    }
  };

  const handleShopClick = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedGender('ALL');
    if (pathname === '/') {
      const catalog = document.getElementById('product-catalog');
      if (catalog) {
        catalog.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push('/#product-catalog');
    }
  };

  const isHomeActive = pathname === '/';

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="customer-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 990,
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid #E2E8F0',
        display: 'none',
        gridTemplateColumns: 'repeat(5, 1fr)',
        alignItems: 'center',
        height: '58px',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* 1. Home */}
      <button
        type="button"
        onClick={handleHomeClick}
        aria-label="Home"
        style={navBtnStyle}
      >
        <Home size={20} color={isHomeActive ? '#D32F2F' : '#64748B'} />
        <span style={{ ...navLabelStyle, color: isHomeActive ? '#D32F2F' : '#64748B', fontWeight: isHomeActive ? 800 : 600 }}>
          Home
        </span>
      </button>

      {/* 2. Shop / Catalog */}
      <button
        type="button"
        onClick={handleShopClick}
        aria-label="Shop Catalog"
        style={navBtnStyle}
      >
        <Compass size={20} color="#64748B" />
        <span style={{ ...navLabelStyle, color: '#64748B' }}>
          Catalog
        </span>
      </button>

      {/* 3. Search */}
      <button
        type="button"
        onClick={() => setIsSearchOpen(true)}
        aria-label="Search Shoes"
        style={navBtnStyle}
      >
        <Search size={20} color="#64748B" />
        <span style={{ ...navLabelStyle, color: '#64748B' }}>
          Search
        </span>
      </button>

      {/* 4. Wishlist */}
      <button
        type="button"
        onClick={() => setIsWishlistOpen(true)}
        aria-label="Wishlist"
        style={{ ...navBtnStyle, position: 'relative' }}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Heart
            size={20}
            color={wishlistCount > 0 ? '#D32F2F' : '#64748B'}
            fill={wishlistCount > 0 ? '#D32F2F' : 'none'}
          />
          {wishlistCount > 0 && (
            <span style={badgeStyle}>
              {wishlistCount}
            </span>
          )}
        </div>
        <span style={{ ...navLabelStyle, color: wishlistCount > 0 ? '#D32F2F' : '#64748B' }}>
          Wishlist
        </span>
      </button>

      {/* 5. Bag / Cart */}
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        aria-label="Cart Bag"
        style={{ ...navBtnStyle, position: 'relative' }}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShoppingBag
            size={20}
            color={cartCount > 0 ? '#D32F2F' : '#64748B'}
          />
          {cartCount > 0 && (
            <span style={badgeStyle}>
              {cartCount}
            </span>
          )}
        </div>
        <span style={{ ...navLabelStyle, color: cartCount > 0 ? '#D32F2F' : '#64748B' }}>
          Bag
        </span>
      </button>

      <style jsx>{`
        @media (max-width: 768px) {
          .customer-bottom-nav {
            display: grid !important;
          }
        }
      `}</style>
    </nav>
  );
};

const navBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '3px',
  padding: '6px 0',
  width: '100%',
  WebkitTapHighlightColor: 'transparent',
};

const navLabelStyle: React.CSSProperties = {
  fontSize: '0.66rem',
  fontWeight: 600,
  letterSpacing: '0.02em',
  lineHeight: 1,
};

const badgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-6px',
  right: '-8px',
  backgroundColor: '#D32F2F',
  color: '#FFFFFF',
  borderRadius: '999px',
  fontSize: '0.62rem',
  fontWeight: 800,
  minWidth: '16px',
  height: '16px',
  padding: '0 4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 5px rgba(211,47,47,0.4)',
};


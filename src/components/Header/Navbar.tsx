'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  Menu, 
  X, 
  ChevronDown, 
  Percent, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const Navbar: React.FC = () => {
  const {
    cartCount,
    cartSubtotal,
    wishlistCount,
    brands,
    setIsCartOpen,
    setIsWishlistOpen,
    setSelectedBrand,
    setSelectedGender,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    products,
    setQuickViewProduct,
  } = useShop();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBrandsDropdownOpen, setIsBrandsDropdownOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchActive(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim() === '' ? [] : products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const handleBrandClick = (slug: string) => {
    setSelectedBrand(slug);
    setSelectedCategory('all');
    setIsBrandsDropdownOpen(false);
    setIsMobileMenuOpen(false);

    // Smooth scroll to catalog
    const catalogElem = document.getElementById('product-catalog');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGenderClick = (gender: 'MEN' | 'WOMEN' | 'KIDS') => {
    setSelectedGender(gender);
    setSelectedBrand('all');
    setSelectedCategory('all');
    setIsMobileMenuOpen(false);

    const catalogElem = document.getElementById('product-catalog');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSaleClick = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setIsMobileMenuOpen(false);

    const catalogElem = document.getElementById('product-catalog');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backgroundColor: '#FFFFFF',
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
      borderBottom: '1px solid #E5E7EB',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '74px',
        gap: '20px',
      }}>
        {/* Brand Logo (ZAP Atelier Luxury Logo) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => {
              setSelectedBrand('all');
              setSelectedCategory('all');
              setSelectedGender('ALL');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              padding: 0,
            }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #09090B 0%, #18181B 100%)',
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: '1.65rem',
              letterSpacing: '0.04em',
              padding: '3px 14px',
              borderRadius: '8px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
            }}>
              <span>ZAP</span>
              <span style={{ color: '#E11D48', fontSize: '1.6rem', lineHeight: 1 }}>.</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: '#09090B',
                letterSpacing: '0.14em',
                lineHeight: 1,
              }}>
                STUDIO
              </span>
              <span style={{
                fontSize: '0.55rem',
                color: '#71717A',
                fontWeight: 700,
                letterSpacing: '0.08em',
              }}>
                PREMIUM FOOTWEAR
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{
          display: 'none',
          alignItems: 'center',
          gap: '26px',
          height: '100%',
        }} className="desktop-nav">
          <button
            onClick={() => handleGenderClick('MEN')}
            style={navLinkStyle}
          >
            MEN
          </button>

          <button
            onClick={() => handleGenderClick('WOMEN')}
            style={navLinkStyle}
          >
            WOMEN
          </button>

          <button
            onClick={() => handleGenderClick('KIDS')}
            style={navLinkStyle}
          >
            KIDS
          </button>

          {/* Brands Dropdown */}
          <div 
            style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
            onMouseEnter={() => setIsBrandsDropdownOpen(true)}
            onMouseLeave={() => setIsBrandsDropdownOpen(false)}
          >
            <button
              style={{
                ...navLinkStyle,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              BRANDS
              <ChevronDown size={14} />
            </button>

            {isBrandsDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '-20px',
                width: '320px',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                borderRadius: '0 0 12px 12px',
                border: '1px solid #E2E8F0',
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                zIndex: 1100,
                animation: 'slideDown 0.2s ease-out',
              }}>
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => handleBrandClick(brand.slug)}
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#D32F2F';
                      e.currentTarget.style.backgroundColor = '#FFEBEE';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.backgroundColor = '#F8FAFC';
                    }}
                  >
                    <span style={{
                      fontWeight: 800,
                      fontSize: '0.825rem',
                      color: brand.badgeColor,
                    }}>
                      {brand.name}
                    </span>
                    <span style={{
                      fontSize: '0.68rem',
                      color: '#64748B',
                      marginTop: '2px',
                    }}>
                      {brand.tagline.split('&')[0]}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSaleClick}
            style={{
              ...navLinkStyle,
              color: '#D32F2F',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Percent size={14} />
            <span>SALE</span>
            <span style={{
              background: '#D32F2F',
              color: '#FFFFFF',
              fontSize: '0.625rem',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '999px',
              letterSpacing: '0.04em',
            }}>
              UP TO 50%
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedBrand('all');
              const catalogElem = document.getElementById('product-catalog');
              if (catalogElem) catalogElem.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              ...navLinkStyle,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Sparkles size={14} color="#D97706" />
            <span>NEW ARRIVALS</span>
          </button>
        </nav>

        {/* Live Search Input Bar */}
        <div 
          ref={searchRef}
          style={{
            position: 'relative',
            flex: 1,
            maxWidth: '380px',
            display: 'none',
          }} 
          className="search-bar-desktop"
        >
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}>
            <Search 
              size={17} 
              color="#94A3B8" 
              style={{ position: 'absolute', left: '12px' }} 
            />
            <input
              type="text"
              placeholder="Search shoes by brand, style, size..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchActive(true);
              }}
              onFocus={() => setIsSearchActive(true)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const catalogElem = document.getElementById('product-catalog');
                  if (catalogElem) catalogElem.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Autocomplete Results Dropdown */}
          {isSearchActive && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              backgroundColor: '#FFFFFF',
              boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '8px 0',
              zIndex: 1200,
              animation: 'slideDown 0.2s ease-out',
            }}>
              <div style={{
                padding: '6px 14px',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#64748B',
                textTransform: 'uppercase',
                borderBottom: '1px solid #F1F5F9',
              }}>
                Instant Footwear Results
              </div>
              {searchResults.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    setQuickViewProduct(product);
                    setIsSearchActive(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 14px',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    width={42}
                    height={42}
                    unoptimized
                    style={{
                      width: '42px',
                      height: '42px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.72rem', color: '#D32F2F', fontWeight: 700 }}>
                      {product.brand}
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#0F172A',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {product.name}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>
                      Tk {product.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
              <div style={{
                padding: '8px 14px',
                borderTop: '1px solid #F1F5F9',
                textAlign: 'center',
              }}>
                <button
                  onClick={() => {
                    setIsSearchActive(false);
                    const catalogElem = document.getElementById('product-catalog');
                    if (catalogElem) catalogElem.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#D32F2F',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  View all matching results <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Actions (Wishlist & Cart Bag) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Wishlist Button */}
          <button
            onClick={() => setIsWishlistOpen(true)}
            aria-label="Wishlist"
            style={{
              position: 'relative',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1E293B',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Heart size={22} color={wishlistCount > 0 ? '#D32F2F' : '#334155'} fill={wishlistCount > 0 ? '#D32F2F' : 'none'} />
            {wishlistCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                backgroundColor: '#D32F2F',
                color: '#FFFFFF',
                borderRadius: '50%',
                fontSize: '0.65rem',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 5px rgba(211,47,47,0.4)',
              }}>
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Bag Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Cart"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: 'var(--radius-full)',
              padding: '8px 16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D32F2F';
              e.currentTarget.style.backgroundColor = '#FFEBEE';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.backgroundColor = '#F8FAFC';
            }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <ShoppingBag size={20} color="#D32F2F" />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-10px',
                  backgroundColor: '#D32F2F',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(211,47,47,0.4)',
                }}>
                  {cartCount}
                </span>
              )}
            </div>
            <div style={{ display: 'none', flexDirection: 'column', alignItems: 'flex-start' }} className="cart-text-desktop">
              <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>BAG TOTAL</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
                Tk {cartSubtotal.toLocaleString()}
              </span>
            </div>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Mobile Navigation"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              color: '#0F172A',
            }}
            className="mobile-hamburger-btn"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          padding: '16px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          animation: 'slideDown 0.2s ease-out',
        }}>
          {/* Mobile Search */}
          <div style={{ marginBottom: '16px', position: 'relative' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search shoe models, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 36px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.9rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={() => handleGenderClick('MEN')} style={mobileNavLinkStyle}>MEN&apos;S SHOES</button>
            <button onClick={() => handleGenderClick('WOMEN')} style={mobileNavLinkStyle}>WOMEN&apos;S SHOES</button>
            <button onClick={() => handleGenderClick('KIDS')} style={mobileNavLinkStyle}>KIDS&apos; COLLECTION</button>
            <button onClick={handleSaleClick} style={{ ...mobileNavLinkStyle, color: '#D32F2F', fontWeight: 700 }}>
              SPECIAL SALE OFFERS (-50%)
            </button>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: '8px' }}>
              OUR BRANDS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => handleBrandClick(b.slug)}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textAlign: 'left',
                    color: b.badgeColor,
                    cursor: 'pointer',
                  }}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (min-width: 992px) {
          .desktop-nav {
            display: flex !important;
          }
          .search-bar-desktop {
            display: block !important;
          }
          .cart-text-desktop {
            display: flex !important;
          }
        }
        @media (max-width: 991px) {
          .mobile-hamburger-btn {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
};

const navLinkStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '0.875rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
  color: '#1E293B',
  cursor: 'pointer',
  padding: '8px 0',
  position: 'relative',
  transition: 'color 0.15s ease',
};

const mobileNavLinkStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '0.95rem',
  fontWeight: 600,
  color: '#0F172A',
  textAlign: 'left',
  padding: '8px 4px',
  cursor: 'pointer',
};

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  RotateCcw, 
  ArrowUpDown, 
  SlidersHorizontal,
  X
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ProductCard } from './ProductCard';

export const ProductCatalog: React.FC = () => {
  const {
    products,
    brands,
    selectedCategory,
    setSelectedCategory,
    selectedBrand,
    setSelectedBrand,
    selectedGender,
    setSelectedGender,
    searchQuery,
    setSearchQuery,
    priceFilter,
    setPriceFilter,
    selectedSize,
    setSelectedSize,
    sortBy,
    setSortBy,
    resetFilters,
  } = useShop();

  const categories = [
    { id: 'all', label: 'All Shoes' },
    { id: 'formal', label: 'Formal Shoes' },
    { id: 'sneakers', label: 'Athletic & Sneakers' },
    { id: 'casual', label: 'Casual & Loafers' },
    { id: 'heels', label: 'Ladies Heels' },
    { id: 'boots', label: 'Outdoor Boots' },
    { id: 'sandals', label: 'Sandals & Chappals' },
  ];

  const priceOptions = [
    { id: 'all', label: 'All Prices' },
    { id: 'under-2000', label: 'Under Tk 2,000' },
    { id: '2000-3500', label: 'Tk 2,000 - Tk 3,500' },
    { id: '3500-5000', label: 'Tk 3,500 - Tk 5,000' },
    { id: 'above-5000', label: 'Above Tk 5,000' },
  ];

  const sizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

  // Check URL query parameters and hash on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('search');
      if (q && q.trim()) {
        setSearchQuery(q.trim());
      }

      const scrollToCatalog = () => {
        const catalogElem = document.getElementById('product-catalog');
        if (catalogElem) {
          setTimeout(() => {
            catalogElem.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }
      };

      if (window.location.hash === '#product-catalog' || (q && q.trim())) {
        scrollToCatalog();
      }

      window.addEventListener('hashchange', scrollToCatalog);
      return () => window.removeEventListener('hashchange', scrollToCatalog);
    }
  }, [setSearchQuery]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Search query
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchName = product.name.toLowerCase().includes(q);
          const matchBrand = product.brand.toLowerCase().includes(q);
          const matchCat = product.categoryName.toLowerCase().includes(q);
          const matchSku = product.sku.toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchCat && !matchSku) return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && product.category !== selectedCategory) {
          return false;
        }

        // Brand filter
        if (selectedBrand !== 'all' && product.brandSlug !== selectedBrand) {
          return false;
        }

        // Gender filter
        if (selectedGender !== 'ALL') {
          if (product.gender !== selectedGender && product.gender !== 'UNISEX') {
            return false;
          }
        }

        // Size filter
        if (selectedSize !== 'all' && !product.sizes.includes(selectedSize)) {
          return false;
        }

        // Price filter
        if (priceFilter === 'under-2000' && product.price >= 2000) return false;
        if (priceFilter === '2000-3500' && (product.price < 2000 || product.price > 3500)) return false;
        if (priceFilter === '3500-5000' && (product.price < 3500 || product.price > 5000)) return false;
        if (priceFilter === 'above-5000' && product.price <= 5000) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'newest') {
          const diff = (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
          if (diff !== 0) return diff;
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        }
        // default: featured
        const featuredDiff = (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        if (featuredDiff !== 0) return featuredDiff;
        return (b.rating || 0) - (a.rating || 0);
      });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedBrand,
    selectedGender,
    selectedSize,
    priceFilter,
    sortBy,
  ]);

  const hasActiveFilters = 
    selectedCategory !== 'all' || 
    selectedBrand !== 'all' || 
    selectedGender !== 'ALL' || 
    selectedSize !== 'all' || 
    priceFilter !== 'all' ||
    searchQuery.trim() !== '';

  const activeFilterCount = 
    (selectedCategory !== 'all' ? 1 : 0) + 
    (selectedBrand !== 'all' ? 1 : 0) + 
    (selectedGender !== 'ALL' ? 1 : 0) + 
    (selectedSize !== 'all' ? 1 : 0) + 
    (priceFilter !== 'all' ? 1 : 0);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  return (
    <section id="product-catalog" style={{
      padding: '50px 0 70px',
      backgroundColor: '#F8FAFC',
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
    }}>
      <div className="container" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        {/* Section Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          <div className="zap-badge" style={{ marginBottom: '12px' }}>
            <span>EXPLORE OUR SHOWCASE</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
            fontWeight: 900,
            color: '#0F172A',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            marginBottom: '10px',
          }}>
            FOOTWEAR CATALOGUE
          </h2>
          <p style={{
            color: '#64748B',
            fontSize: '1rem',
            maxWidth: '600px',
          }}>
            From formal executive leather to explosive athletic running shoes, find your perfect pair with authentic ZAP mastercrafted durability.
          </p>
        </div>

        {/* Quick Category Navigation Pills */}
        <div 
          className="catalog-category-pills"
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            paddingBottom: '16px',
            marginBottom: '24px',
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '9px 18px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                border: selectedCategory === cat.id ? 'none' : '1px solid #CBD5E1',
                backgroundColor: selectedCategory === cat.id ? '#D32F2F' : '#FFFFFF',
                color: selectedCategory === cat.id ? '#FFFFFF' : '#334155',
                boxShadow: selectedCategory === cat.id ? '0 4px 12px rgba(211,47,47,0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Filter & Controls Toolbar */}
        <div className="catalog-filter-bar" style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '16px 20px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          {/* Desktop Filter Bar (>= 900px) */}
          <div className="desktop-filter-bar" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            {/* Filter Selectors */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              {/* Brand Filter Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B' }}>BRAND:</span>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  style={selectStyle}
                >
                  <option value="all">All Brands</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.slug}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Gender Filter Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B' }}>GENDER:</span>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  style={selectStyle}
                >
                  <option value="ALL">All Genders</option>
                  <option value="MEN">Men</option>
                  <option value="WOMEN">Women</option>
                  <option value="KIDS">Kids</option>
                </select>
              </div>

              {/* Price Filter Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B' }}>PRICE:</span>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  style={selectStyle}
                >
                  {priceOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Size Filter Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B' }}>SIZE:</span>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  style={selectStyle}
                >
                  <option value="all">All Sizes</option>
                  {sizes.map((s) => (
                    <option key={s} value={s}>EU {s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort & Reset Area */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              {/* Sort By Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowUpDown size={15} color="#64748B" />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B' }}>SORT:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={selectStyle}
                >
                  <option value="featured">Featured First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>

              {/* Reset Button */}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #FECACA',
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Filter Bar (< 900px) */}
          <div className="mobile-filter-bar" style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            width: '100%',
          }}>
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '10px',
                border: '1.5px solid #0F172A',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <SlidersHorizontal size={15} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span style={{
                  backgroundColor: '#D32F2F',
                  color: '#FFFFFF',
                  borderRadius: '999px',
                  padding: '1px 7px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                }}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '6px 10px',
              flex: 1,
              maxWidth: '180px',
            }}>
              <ArrowUpDown size={13} color="#64748B" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#0F172A',
                  cursor: 'pointer',
                }}
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low-High</option>
                <option value="price-desc">Price: High-Low</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '9px 10px',
                  borderRadius: '10px',
                  border: '1px solid #FECACA',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              marginTop: '14px',
              paddingTop: '12px',
              borderTop: '1px solid #F1F5F9',
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>
                Active Filters:
              </span>

              {selectedCategory !== 'all' && (
                <span style={activePillStyle}>
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('all')} style={removePillBtn}><X size={12} /></button>
                </span>
              )}

              {selectedBrand !== 'all' && (
                <span style={activePillStyle}>
                  Brand: {selectedBrand}
                  <button onClick={() => setSelectedBrand('all')} style={removePillBtn}><X size={12} /></button>
                </span>
              )}

              {selectedGender !== 'ALL' && (
                <span style={activePillStyle}>
                  Gender: {selectedGender}
                  <button onClick={() => setSelectedGender('ALL')} style={removePillBtn}><X size={12} /></button>
                </span>
              )}

              {selectedSize !== 'all' && (
                <span style={activePillStyle}>
                  Size: EU {selectedSize}
                  <button onClick={() => setSelectedSize('all')} style={removePillBtn}><X size={12} /></button>
                </span>
              )}

              {priceFilter !== 'all' && (
                <span style={activePillStyle}>
                  Price: {priceFilter}
                  <button onClick={() => setPriceFilter('all')} style={removePillBtn}><X size={12} /></button>
                </span>
              )}

              {searchQuery && (
                <span style={activePillStyle}>
                  Search: &quot;{searchQuery}&quot;
                  <button onClick={() => setSearchQuery('')} style={removePillBtn}><X size={12} /></button>
                </span>
              )}

              <span style={{ marginLeft: 'auto', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Shoe' : 'Shoes'} Found
              </span>
            </div>
          )}
        </div>

        {/* Mobile Filter Bottom Sheet Modal */}
        {isMobileFilterOpen && (
          <div
            className="modal-backdrop"
            onClick={() => setIsMobileFilterOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#FFFFFF',
                width: '100%',
                maxWidth: '520px',
                maxHeight: '85vh',
                borderTopLeftRadius: '22px',
                borderTopRightRadius: '22px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 -10px 30px rgba(0,0,0,0.25)',
              }}
            >
              {/* Modal Header */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SlidersHorizontal size={18} color="#D32F2F" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Filter Footwear {activeFilterCount > 0 && `(${activeFilterCount})`}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: '#64748B' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Scrollable Filter Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>
                {/* Gender Filter */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    DEPARTMENT / GENDER
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {['ALL', 'MEN', 'WOMEN', 'KIDS'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setSelectedGender(g)}
                        style={{
                          padding: '9px 4px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          border: selectedGender === g ? '1.5px solid #D32F2F' : '1px solid #E2E8F0',
                          backgroundColor: selectedGender === g ? '#FFEBEE' : '#F8FAFC',
                          color: selectedGender === g ? '#D32F2F' : '#334155',
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brand Filter */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    BRANDS
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedBrand('all')}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '999px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        border: selectedBrand === 'all' ? '1.5px solid #D32F2F' : '1px solid #E2E8F0',
                        backgroundColor: selectedBrand === 'all' ? '#FFEBEE' : '#FFFFFF',
                        color: selectedBrand === 'all' ? '#D32F2F' : '#334155',
                        cursor: 'pointer',
                      }}
                    >
                      All Brands
                    </button>
                    {brands.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBrand(b.slug)}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '999px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          border: selectedBrand === b.slug ? '1.5px solid #D32F2F' : '1px solid #E2E8F0',
                          backgroundColor: selectedBrand === b.slug ? '#FFEBEE' : '#FFFFFF',
                          color: selectedBrand === b.slug ? '#D32F2F' : '#334155',
                          cursor: 'pointer',
                        }}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Filter */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    SIZE (EU)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedSize('all')}
                      style={{
                        padding: '8px 2px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        border: selectedSize === 'all' ? '1.5px solid #D32F2F' : '1px solid #E2E8F0',
                        backgroundColor: selectedSize === 'all' ? '#FFEBEE' : '#F8FAFC',
                        color: selectedSize === 'all' ? '#D32F2F' : '#334155',
                        cursor: 'pointer',
                      }}
                    >
                      All
                    </button>
                    {sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        style={{
                          padding: '8px 2px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          border: selectedSize === s ? '1.5px solid #D32F2F' : '1px solid #E2E8F0',
                          backgroundColor: selectedSize === s ? '#FFEBEE' : '#F8FAFC',
                          color: selectedSize === s ? '#D32F2F' : '#334155',
                          cursor: 'pointer',
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    PRICE RANGE
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {priceOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPriceFilter(opt.id)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          border: priceFilter === opt.id ? '1.5px solid #D32F2F' : '1px solid #E2E8F0',
                          backgroundColor: priceFilter === opt.id ? '#FFEBEE' : '#FFFFFF',
                          color: priceFilter === opt.id ? '#D32F2F' : '#1E293B',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>{opt.label}</span>
                        {priceFilter === opt.id && <span style={{ color: '#D32F2F', fontWeight: 800 }}>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sticky Bottom Bar in Drawer */}
              <div style={{
                padding: '14px 20px',
                borderTop: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                gap: '12px',
              }}>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#F8FAFC',
                      color: '#475569',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    borderRadius: '8px',
                    justifyContent: 'center',
                  }}
                >
                  Show {filteredProducts.length} Footwear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="product-catalog-grid">
            {filteredProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} priority={idx < 4} />
            ))}
          </div>
        ) : (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '60px 20px',
            textAlign: 'center',
            maxWidth: '540px',
            margin: '0 auto',
          }}>
            <SlidersHorizontal size={48} color="#CBD5E1" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              {products.length === 0 ? 'No Footwear in Store Yet' : 'No Footwear Matches Your Filter'}
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '20px' }}>
              {products.length === 0 
                ? 'Your store catalog is ready! Add your footwear products through the Admin panel or sync from the database.'
                : "We couldn't find any shoe matching your current combination of brand, size, and price filters."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="btn btn-primary"
              >
                <RotateCcw size={16} />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .desktop-filter-bar {
            display: none !important;
          }
          .mobile-filter-bar {
            display: flex !important;
          }
          .catalog-category-pills {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            scroll-snap-type: x mandatory !important;
            -webkit-overflow-scrolling: touch !important;
            scrollbar-width: none !important;
            padding-bottom: 8px !important;
            margin-bottom: 16px !important;
          }
          .catalog-category-pills::-webkit-scrollbar {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
};

const selectStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: '8px',
  border: '1px solid #CBD5E1',
  backgroundColor: '#F8FAFC',
  fontSize: '0.825rem',
  fontWeight: 600,
  color: '#0F172A',
  outline: 'none',
  cursor: 'pointer',
};

const activePillStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  backgroundColor: '#FFEBEE',
  color: '#D32F2F',
  border: '1px solid #FFCDD2',
  padding: '3px 10px',
  borderRadius: '999px',
  fontSize: '0.75rem',
  fontWeight: 700,
};

const removePillBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#D32F2F',
  display: 'flex',
  alignItems: 'center',
  padding: 0,
};

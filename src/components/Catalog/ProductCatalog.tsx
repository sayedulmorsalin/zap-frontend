'use client';

import React, { useMemo } from 'react';
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
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
        // default: featured
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
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

  return (
    <section id="product-catalog" style={{
      padding: '50px 0 70px',
      backgroundColor: '#F8FAFC',
    }}>
      <div className="container">
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
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '16px',
          marginBottom: '24px',
          scrollbarWidth: 'none',
        }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.875rem',
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
          padding: '18px 20px',
          marginBottom: '28px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <div style={{
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

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="product-catalog-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
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

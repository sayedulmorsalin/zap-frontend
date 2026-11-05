'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, X, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { FormattedText, stripHtml } from '../Common/FormattedText';

const POPULAR_SEARCHES = [
  'Formal Leather',
  'Sneakers',
  'Casual',
  'Loafers',
  'Running',
  'Oxford',
  'Anchor Crest',
  'Boots',
];

export const SearchModal: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    products,
  } = useShop();

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when modal opens and lock body scroll
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isSearchOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  // Do not render inside admin
  if (!isSearchOpen || pathname?.startsWith('/admin')) {
    return null;
  }

  const queryClean = searchQuery.trim().toLowerCase();

  const matchingProducts = queryClean === ''
    ? []
    : products.filter((p) => {
        const plainName = stripHtml(p.name).toLowerCase();
        const matchName = plainName.includes(queryClean);
        const matchBrand = p.brand.toLowerCase().includes(queryClean);
        const matchCat = (p.categoryName || '').toLowerCase().includes(queryClean);
        const matchSku = (p.sku || '').toLowerCase().includes(queryClean);
        const matchColor = (p.colors || []).some((c) => c.name.toLowerCase().includes(queryClean));
        return matchName || matchBrand || matchCat || matchSku || matchColor;
      }).slice(0, 8);

  const handleExecuteSearch = (term?: string) => {
    const q = term !== undefined ? term : searchQuery;
    if (term !== undefined) {
      setSearchQuery(term);
    }
    setIsSearchOpen(false);

    if (pathname === '/') {
      const catalogElem = document.getElementById('product-catalog');
      if (catalogElem) {
        catalogElem.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push(`/?search=${encodeURIComponent(q)}#product-catalog`);
    }
  };

  const handleProductSelect = (slugOrId: string) => {
    setIsSearchOpen(false);
    router.push(`/products/${slugOrId}`);
  };

  return (
    <div
      className="modal-backdrop"
      onClick={() => setIsSearchOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
    >
      <div
        className="search-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          marginTop: '10px',
          marginBottom: '20px',
          animation: 'slideDown 0.22s ease-out',
        }}
      >
        {/* Search Input Header */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteSearch();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            position: 'relative',
          }}
        >
          <Search size={22} color="#D32F2F" style={{ flexShrink: 0 }} />

          <input
            ref={inputRef}
            type="search"
            inputMode="search"
            enterKeyHint="search"
            placeholder="Search shoes by brand, style, size, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '1.05rem',
              color: '#0F172A',
              fontWeight: 600,
              backgroundColor: 'transparent',
              padding: '6px 0',
            }}
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              style={{
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748B',
                flexShrink: 0,
              }}
            >
              <X size={16} />
            </button>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-sm"
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            Search
          </button>

          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            aria-label="Close search"
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569',
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </form>

        {/* Modal Body */}
        <div style={{ maxHeight: '70vh', overflowY: 'auto', padding: '16px 20px' }}>
          {/* If query is empty: Show Popular / Trending Suggestions */}
          {queryClean === '' && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '12px',
              }}>
                <TrendingUp size={15} color="#D32F2F" />
                <span>Trending Searches</span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearchQuery(term);
                      inputRef.current?.focus();
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '20px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#F8FAFC',
                      color: '#1E293B',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFEBEE';
                      e.currentTarget.style.borderColor = '#D32F2F';
                      e.currentTarget.style.color = '#D32F2F';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F8FAFC';
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.color = '#1E293B';
                    }}
                  >
                    <Sparkles size={12} color="#D97706" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>

              <div style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '12px',
              }}>
                Featured Collections
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                {products.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleProductSelect(p.slug || p.id)}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      backgroundColor: '#FFFFFF',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    <div style={{ aspectRatio: '1/1', position: 'relative', backgroundColor: '#F8FAFC' }}>
                      <Image
                        src={p.images?.[0] || '/images/shoe-leather-formal.jpg'}
                        alt={stripHtml(p.name)}
                        fill
                        unoptimized
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ padding: '8px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#D32F2F', fontWeight: 700 }}>{p.brand}</div>
                      <div style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: '#0F172A',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        <FormattedText text={p.name} />
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                        Tk {p.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* When query is typed */}
          {queryClean !== '' && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '10px',
                borderBottom: '1px solid #F1F5F9',
                marginBottom: '12px',
              }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B' }}>
                  {matchingProducts.length > 0 
                    ? `Found ${matchingProducts.length} ${matchingProducts.length === 1 ? 'shoe' : 'shoes'} for "${searchQuery}"`
                    : `No shoes found for "${searchQuery}"`}
                </span>
                {matchingProducts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleExecuteSearch()}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#D32F2F',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    View in Catalog <ArrowRight size={13} />
                  </button>
                )}
              </div>

              {/* No results state */}
              {matchingProducts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '36px 12px' }}>
                  <Search size={40} color="#CBD5E1" style={{ marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                    No matching footwear found
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: '340px', margin: '0 auto 16px' }}>
                    Try searching by a broader term like &quot;Leather&quot;, &quot;Sneakers&quot;, or browse our categories.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      handleExecuteSearch('');
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    Browse All Shoes
                  </button>
                </div>
              )}

              {/* Results list */}
              {matchingProducts.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {matchingProducts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${encodeURIComponent(p.slug || String(p.id))}`}
                      onClick={() => setIsSearchOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        border: '1px solid #F1F5F9',
                        backgroundColor: '#FFFFFF',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        color: 'inherit',
                        WebkitTapHighlightColor: 'transparent',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F8FAFC';
                        e.currentTarget.style.borderColor = '#E2E8F0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#F1F5F9';
                      }}
                    >
                      <Image
                        src={p.images?.[0] || '/images/shoe-leather-formal.jpg'}
                        alt={stripHtml(p.name)}
                        width={52}
                        height={52}
                        unoptimized
                        style={{
                          width: '52px',
                          height: '52px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          flexShrink: 0,
                        }}
                      />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.72rem', color: '#D32F2F', fontWeight: 800, textTransform: 'uppercase' }}>
                            {p.brand}
                          </span>
                          {p.sku && (
                            <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                              • {p.sku}
                            </span>
                          )}
                        </div>
                        <div style={{
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          color: '#0F172A',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: 1.3,
                        }}>
                          <FormattedText text={p.name} />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          Sizes: {p.sizes.slice(0, 4).join(', ')}{p.sizes.length > 4 ? '...' : ''}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0F172A' }}>
                          Tk {p.price.toLocaleString()}
                        </div>
                        {p.regularPrice > p.price && (
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                            Tk {p.regularPrice.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}

                  {/* View All Button */}
                  <button
                    type="button"
                    onClick={() => handleExecuteSearch()}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      marginTop: '8px',
                      padding: '12px',
                      borderRadius: '12px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>View All Results for &quot;{searchQuery}&quot;</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

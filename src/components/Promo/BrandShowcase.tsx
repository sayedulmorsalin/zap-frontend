'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { BRANDS_DATA } from '../../data/brands';
import { useShop } from '../../context/ShopContext';

export const BrandShowcase: React.FC = () => {
  const { setSelectedBrand, setSelectedCategory } = useShop();

  const handleBrandClick = (slug: string) => {
    setSelectedBrand(slug);
    setSelectedCategory('all');
    const catalogElem = document.getElementById('product-catalog');
    if (catalogElem) catalogElem.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section style={{
      padding: '60px 0',
      backgroundColor: '#FFFFFF',
      borderTop: '1px solid #E2E8F0',
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '36px',
        }}>
          <div className="zap-badge" style={{ marginBottom: '12px' }}>
            <span>CURATED BRAND PORTFOLIO</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
            fontWeight: 900,
            color: '#0F172A',
            letterSpacing: '-0.02em',
            marginBottom: '8px',
          }}>
            EXPLORE OUR ICONIC BRANDS
          </h2>
          <p style={{
            color: '#64748B',
            fontSize: '0.95rem',
            maxWidth: '560px',
          }}>
            Discover footwear engineered for every lifestyle, generation, and occasion across Bangladesh.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '20px',
        }}>
          {BRANDS_DATA.map((brand) => (
            <div
              key={brand.id}
              onClick={() => handleBrandClick(brand.slug)}
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = brand.badgeColor;
                e.currentTarget.style.boxShadow = `0 12px 24px -4px rgba(0,0,0,0.08)`;
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.backgroundColor = '#F8FAFC';
              }}
            >
              {/* Brand Accent Bar on Top */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                backgroundColor: brand.badgeColor,
              }} />

              <div>
                <div style={{
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  fontStyle: brand.slug === 'zap' ? 'italic' : 'normal',
                  color: brand.badgeColor,
                  letterSpacing: '0.04em',
                  marginBottom: '6px',
                }}>
                  {brand.name}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#0F172A',
                  marginBottom: '10px',
                }}>
                  {brand.tagline}
                </div>
                <p style={{
                  fontSize: '0.78rem',
                  color: '#64748B',
                  lineHeight: 1.45,
                  marginBottom: '20px',
                }}>
                  {brand.description}
                </p>
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: brand.badgeColor,
                marginTop: 'auto',
              }}>
                <span>Shop {brand.name}</span>
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

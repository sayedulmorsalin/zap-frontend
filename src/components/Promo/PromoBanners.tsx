'use client';

import React from 'react';
import { ArrowRight, Zap, Sparkles } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const PromoBanners: React.FC = () => {
  const { setSelectedBrand, setSelectedCategory } = useShop();

  const scrollToCatalog = () => {
    const catalogElem = document.getElementById('product-catalog');
    if (catalogElem) catalogElem.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section style={{ padding: '40px 0 20px', backgroundColor: '#FFFFFF' }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          {/* Banner 1: Power Athletics */}
          <div
            style={{
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              minHeight: '260px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '30px',
              color: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              cursor: 'pointer',
            }}
            onClick={() => {
              setSelectedBrand('power');
              setSelectedCategory('all');
              scrollToCatalog();
            }}
          >
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'url(/images/shoe-power-runner.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.65)',
              transition: 'transform 0.5s ease',
            }}
            className="promo-bg"
            />
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: '#E11D48',
                color: '#FFFFFF',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                marginBottom: '10px',
              }}>
                <Zap size={12} fill="#FFFFFF" />
                <span>POWER ATHLETICS</span>
              </div>
              <h3 style={{
                fontSize: '1.6rem',
                fontWeight: 900,
                lineHeight: 1.15,
                fontStyle: 'italic',
                marginBottom: '6px',
              }}>
                SPEED & ENDURANCE 2026
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#E2E8F0',
                marginBottom: '16px',
                maxWidth: '380px',
              }}>
                Explore lightweight running shoes with responsive kinetic rebound foam.
              </p>
              <button
                className="btn btn-primary btn-sm"
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: '#E11D48',
                }}
              >
                <span>Shop Power Range</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Banner 2: Marie Claire Paris */}
          <div
            style={{
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              minHeight: '260px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '30px',
              color: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              cursor: 'pointer',
            }}
            onClick={() => {
              setSelectedBrand('marie-claire');
              setSelectedCategory('all');
              scrollToCatalog();
            }}
          >
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'url(https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.65)',
              transition: 'transform 0.5s ease',
            }}
            className="promo-bg"
            />
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: '#9333EA',
                color: '#FFFFFF',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                marginBottom: '10px',
              }}>
                <Sparkles size={12} fill="#FFFFFF" />
                <span>MARIE CLAIRE PARIS</span>
              </div>
              <h3 style={{
                fontSize: '1.6rem',
                fontWeight: 900,
                lineHeight: 1.15,
                marginBottom: '6px',
              }}>
                PARISIAN CHIC HEELS
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#E2E8F0',
                marginBottom: '16px',
                maxWidth: '380px',
              }}>
                Pointed stiletto pumps, comfortable block heels and evening sandals.
              </p>
              <button
                className="btn btn-primary btn-sm"
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: '#9333EA',
                }}
              >
                <span>Shop Marie Claire</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .promo-bg:hover {
          transform: scale(1.05);
        }
      `}</style>
    </section>
  );
};

'use client';

import React from 'react';
import { ArrowRight, Zap, Sparkles } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { BannerTargetType } from '../../types/banner';

export const PromoBanners: React.FC = () => {
  const { 
    promoBanners, 
    setSelectedBrand, 
    setSelectedCategory, 
    setSelectedGender 
  } = useShop();

  const scrollToCatalog = () => {
    const catalogElem = document.getElementById('product-catalog');
    if (catalogElem) catalogElem.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBannerClick = (type: BannerTargetType, value: string) => {
    if (type === 'brand') {
      setSelectedBrand(value);
      setSelectedCategory('all');
    } else if (type === 'category') {
      setSelectedCategory(value);
    } else if (type === 'gender') {
      setSelectedGender(value);
      setSelectedBrand('all');
      setSelectedCategory('all');
    } else {
      setSelectedBrand('all');
      setSelectedCategory('all');
      setSelectedGender('ALL');
    }
    scrollToCatalog();
  };

  // Filter active promotional banners and sort by order
  const activeBanners = (promoBanners || [])
    .filter((b) => b.isActive)
    .sort((a, b) => a.order - b.order);

  if (activeBanners.length === 0) {
    return null;
  }

  return (
    <section style={{ padding: '40px 0 20px', backgroundColor: '#FFFFFF' }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          {activeBanners.map((banner, index) => {
            const isAlternate = index % 2 !== 0;
            const IconComponent = isAlternate ? Sparkles : Zap;
            const cardColor = banner.badgeColor || (isAlternate ? '#9333EA' : '#E11D48');

            return (
              <div
                key={banner.id}
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
                onClick={() => handleBannerClick(banner.targetType, banner.targetValue)}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${banner.image || '/images/shoe-power-runner.jpg'})`,
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
                    backgroundColor: cardColor,
                    color: '#FFFFFF',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    marginBottom: '10px',
                  }}>
                    <IconComponent size={12} fill="#FFFFFF" />
                    <span>{banner.tag}</span>
                  </div>

                  <h3 style={{
                    fontSize: '1.6rem',
                    fontWeight: 900,
                    lineHeight: 1.15,
                    fontStyle: 'italic',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                  }}>
                    {banner.title}
                  </h3>

                  <p style={{
                    fontSize: '0.875rem',
                    color: '#E2E8F0',
                    marginBottom: '16px',
                    maxWidth: '380px',
                  }}>
                    {banner.description}
                  </p>

                  <button
                    className="btn btn-primary btn-sm"
                    style={{
                      alignSelf: 'flex-start',
                      backgroundColor: cardColor,
                      borderColor: cardColor,
                    }}
                  >
                    <span>{banner.ctaText || 'Explore Range'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
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

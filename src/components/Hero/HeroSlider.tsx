'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { BannerTargetType } from '../../types/banner';
import { FormattedText, stripHtml } from '../Common/FormattedText';
import { normalizeImageUrl } from '../../services/api';

export const HeroSlider: React.FC = () => {
  const { 
    heroSlides, 
    setSelectedGender, 
    setSelectedBrand, 
    setSelectedCategory 
  } = useShop();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const scrollToCatalog = () => {
    const catalogElem = document.getElementById('product-catalog');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAction = (type: BannerTargetType, value: string) => {
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

  // Filter active slides and sort by order
  const activeSlides = (heroSlides || [])
    .filter((s) => s.isActive)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const sortedFallback = [...(heroSlides || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  const slides = activeSlides.length > 0 ? activeSlides : sortedFallback;

  // Auto-play timer
  useEffect(() => {
    if (isHovered || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isHovered, slides.length]);

  if (!slides || slides.length === 0) {
    return null;
  }

  const safeIndex = currentSlide % slides.length;
  const slide = slides[safeIndex] || slides[0];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        backgroundColor: '#0F172A',
        overflow: 'hidden',
        color: '#FFFFFF',
      }}
    >
      {/* Background Graphic Accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '60%',
        height: '100%',
        background: `radial-gradient(circle at 70% 50%, ${slide.accentColor ? slide.accentColor + '30' : 'rgba(211, 47, 47, 0.18)'} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div className="container" style={{
        minHeight: '520px',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '40px',
        paddingBottom: '50px',
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '40px',
          alignItems: 'center',
          width: '100%',
        }} className="hero-grid">
          {/* Left Column: Hero Typography & CTAs */}
          <div style={{ maxWidth: '580px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: '#FCA5A5',
              marginBottom: '16px',
            }}>
              <ShieldCheck size={14} color={slide.accentColor || '#D32F2F'} />
              <span>{slide.tag}</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              fontStyle: 'italic',
              marginBottom: '12px',
              textTransform: 'uppercase',
            }}>
              <FormattedText text={slide.headline} />
            </h1>

            <h2 style={{
              fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)',
              fontWeight: 700,
              color: '#E2E8F0',
              letterSpacing: '0.02em',
              marginBottom: '16px',
            }}>
              <FormattedText text={slide.subheadline} />
            </h2>

            <p style={{
              fontSize: '1rem',
              color: '#94A3B8',
              lineHeight: 1.6,
              marginBottom: '28px',
              maxWidth: '520px',
            }}>
              <FormattedText text={slide.description} />
            </p>

            <div style={{
              display: 'flex',
              gap: '14px',
              flexWrap: 'wrap',
            }}>
              {slide.ctaText && (
                <button
                  onClick={() => handleAction(slide.ctaTargetType, slide.ctaTargetValue)}
                  className="btn btn-primary"
                  style={{
                    padding: '14px 28px',
                    fontSize: '0.95rem',
                    backgroundColor: slide.accentColor || '#D32F2F',
                    borderColor: slide.accentColor || '#D32F2F',
                  }}
                >
                  <span>{slide.ctaText}</span>
                  <ArrowRight size={17} />
                </button>
              )}

              {slide.secondaryCtaText && (
                <button
                  onClick={() => handleAction(slide.secondaryCtaTargetType, slide.secondaryCtaTargetValue)}
                  className="btn btn-secondary"
                  style={{
                    padding: '14px 24px',
                    fontSize: '0.95rem',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    color: '#FFFFFF',
                    borderColor: 'rgba(255,255,255,0.2)',
                  }}
                >
                  <span>{slide.secondaryCtaText}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '560px',
              aspectRatio: '16/10',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(211, 47, 47, 0.25)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
            }}>
              <Image
                src={normalizeImageUrl(slide.image) || '/images/hero-banner.jpg'}
                alt={stripHtml(slide.headline)}
                width={960}
                height={600}
                priority
                unoptimized
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.7s ease',
                  transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                }}
              />

              {/* Floating Quality Badge */}
              <div style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                padding: '10px 16px',
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600 }}>
                  {slide.badgeText || 'CRAFTED EXCELLENCE'}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#F87171' }}>
                  {slide.badgeSubtext || '100% Certified ZAP Quality'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prev / Next Slider Navigation Buttons (show when > 1 slide) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(6px)',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = slide.accentColor || '#D32F2F')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)')}
          >
            <ChevronLeft size={22} />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(6px)',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = slide.accentColor || '#D32F2F')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)')}
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Slide Indicator Dots */}
      {slides.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '18px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px',
          zIndex: 10,
        }}>
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                width: idx === safeIndex ? '28px' : '10px',
                height: '8px',
                borderRadius: '999px',
                backgroundColor: idx === safeIndex ? (slide.accentColor || '#D32F2F') : 'rgba(255, 255, 255, 0.3)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @media (min-width: 900px) {
          .hero-grid {
            grid-template-columns: 1.15fr 0.95fr !important;
          }
        }
      `}</style>
    </section>
  );
};

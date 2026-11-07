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
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Touch Swipe State
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

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

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > 45) nextSlide();
    if (distance < -45) prevSlide();
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const defaultFallback = slide.ctaTargetType === 'category' && slide.ctaTargetValue === 'formal'
    ? '/images/shoe-leather-formal.jpg'
    : '/images/shoe-power-runner.jpg';

  const rawUrl = slide.image ? normalizeImageUrl(slide.image) : defaultFallback;
  const slideImageUrl = imgErrors[slide.id] ? defaultFallback : (rawUrl || defaultFallback);

  return (
    <section
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'relative',
        backgroundColor: '#090D16',
        overflow: 'hidden',
        color: '#FFFFFF',
        width: '100%',
        maxWidth: '100%',
      }}
    >
      {/* Background Graphic Ambient Accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '65%',
        height: '100%',
        background: `radial-gradient(circle at 70% 45%, ${slide.accentColor ? slide.accentColor + '35' : 'rgba(211, 47, 47, 0.22)'} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div className="container hero-container" style={{
        minHeight: '520px',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '36px',
        paddingBottom: '44px',
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.15fr 0.95fr',
          gap: '36px',
          alignItems: 'center',
          width: '100%',
        }} className="hero-grid">
          {/* Typography & CTAs */}
          <div className="hero-text-col" style={{ maxWidth: '580px' }}>
            <div className="hero-tag" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              backdropFilter: 'blur(8px)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: '#FCA5A5',
              marginBottom: '14px',
            }}>
              <ShieldCheck size={14} color={slide.accentColor || '#D32F2F'} />
              <span>{slide.tag}</span>
            </div>

            <h1 className="hero-headline" style={{
              fontSize: 'clamp(2.2rem, 4.6vw, 3.6rem)',
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              fontStyle: 'italic',
              marginBottom: '10px',
              textTransform: 'uppercase',
            }}>
              <FormattedText text={slide.headline} />
            </h1>

            <h2 className="hero-subheadline" style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              fontWeight: 700,
              color: '#E2E8F0',
              letterSpacing: '0.04em',
              marginBottom: '14px',
            }}>
              <FormattedText text={slide.subheadline} />
            </h2>

            <p className="hero-description" style={{
              fontSize: '0.95rem',
              color: '#94A3B8',
              lineHeight: 1.55,
              marginBottom: '24px',
              maxWidth: '520px',
            }}>
              <FormattedText text={slide.description} />
            </p>

            <div className="hero-actions" style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}>
              {slide.ctaText && (
                <button
                  onClick={() => handleAction(slide.ctaTargetType, slide.ctaTargetValue)}
                  className="btn btn-primary hero-primary-btn"
                  style={{
                    padding: '13px 26px',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    backgroundColor: slide.accentColor || '#D32F2F',
                    borderColor: slide.accentColor || '#D32F2F',
                    boxShadow: `0 8px 20px -4px ${slide.accentColor ? slide.accentColor + '60' : 'rgba(211,47,47,0.45)'}`,
                    borderRadius: '10px',
                  }}
                >
                  <span>{slide.ctaText}</span>
                  <ArrowRight size={16} />
                </button>
              )}

              {slide.secondaryCtaText && (
                <button
                  onClick={() => handleAction(slide.secondaryCtaTargetType, slide.secondaryCtaTargetValue)}
                  className="btn btn-secondary hero-secondary-btn"
                  style={{
                    padding: '13px 22px',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    color: '#FFFFFF',
                    borderColor: 'rgba(255,255,255,0.18)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: '10px',
                  }}
                >
                  <span>{slide.secondaryCtaText}</span>
                </button>
              )}
            </div>
          </div>

          {/* Hero Visual Showcase */}
          <div className="hero-visual-col" style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}>
            <div className="hero-visual-card" style={{
              position: 'relative',
              width: '100%',
              maxWidth: '560px',
              aspectRatio: '16/10',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.7), 0 0 35px rgba(211, 47, 47, 0.25)',
              border: '1.5px solid rgba(255, 255, 255, 0.12)',
              backgroundColor: '#1E293B',
            }}>
              <Image
                src={slideImageUrl}
                alt={stripHtml(slide.headline)}
                width={960}
                height={600}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                onError={() => {
                  if (!imgErrors[slide.id]) {
                    setImgErrors((prev) => ({ ...prev, [slide.id]: true }));
                  }
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.6s ease',
                  transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                }}
              />

              {/* Floating Quality Badge */}
              <div className="hero-floating-badge" style={{
                position: 'absolute',
                bottom: '14px',
                right: '14px',
                backgroundColor: 'rgba(15, 23, 42, 0.88)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: '10px',
                padding: '8px 14px',
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}>
                <span style={{ fontSize: '0.64rem', color: '#94A3B8', fontWeight: 600 }}>
                  {slide.badgeText || 'CRAFTED EXCELLENCE'}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#F87171' }}>
                  {slide.badgeSubtext || '100% Certified ZAP Quality'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prev / Next Slider Navigation Buttons (desktop only) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="hero-nav-arrow"
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(6px)',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = slide.accentColor || '#D32F2F')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)')}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="hero-nav-arrow"
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(6px)',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = slide.accentColor || '#D32F2F')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)')}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Slide Indicator Dots */}
      {slides.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '14px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '7px',
          zIndex: 10,
        }}>
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                width: idx === safeIndex ? '26px' : '8px',
                height: '6px',
                borderRadius: '999px',
                backgroundColor: idx === safeIndex ? (slide.accentColor || '#D32F2F') : 'rgba(255, 255, 255, 0.25)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 899px) {
          .hero-container {
            min-height: auto !important;
            padding-top: 20px !important;
            padding-bottom: 34px !important;
            width: 100% !important;
            max-width: 100% !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
          }
          .hero-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 16px !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
          }
          .hero-text-col {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
          }
          .hero-tag {
            font-size: 0.7rem !important;
            padding: 4px 10px !important;
            margin-bottom: 8px !important;
          }
          .hero-headline {
            font-size: 1.75rem !important;
            line-height: 1.12 !important;
            margin-bottom: 6px !important;
          }
          .hero-subheadline {
            font-size: 0.85rem !important;
            margin-bottom: 10px !important;
            color: #F87171 !important;
          }
          .hero-description {
            font-size: 0.82rem !important;
            line-height: 1.4 !important;
            margin-bottom: 16px !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 2 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
          }
          .hero-actions {
            display: flex !important;
            gap: 8px !important;
            width: 100% !important;
            max-width: 100% !important;
            flex-wrap: wrap !important;
          }
          .hero-primary-btn {
            flex: 1 !important;
            padding: 11px 16px !important;
            font-size: 0.84rem !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .hero-secondary-btn {
            padding: 11px 14px !important;
            font-size: 0.82rem !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .hero-visual-card {
            border-radius: 14px !important;
            max-height: 220px !important;
          }
          .hero-floating-badge {
            bottom: 8px !important;
            right: 8px !important;
            padding: 4px 8px !important;
            border-radius: 6px !important;
          }
          .hero-floating-badge span:first-child {
            font-size: 0.58rem !important;
          }
          .hero-floating-badge span:last-child {
            font-size: 0.72rem !important;
          }
          .hero-nav-arrow {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
};

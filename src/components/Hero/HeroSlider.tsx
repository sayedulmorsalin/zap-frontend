'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

interface SlideItem {
  id: number;
  tag: string;
  headline: string;
  subheadline: string;
  description: string;
  image: string;
  ctaText: string;
  ctaAction: () => void;
  secondaryCtaText: string;
  secondaryCtaAction: () => void;
  accentColor: string;
}

export const HeroSlider: React.FC = () => {
  const { setSelectedGender, setSelectedBrand, setSelectedCategory } = useShop();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const scrollToCatalog = () => {
    const catalogElem = document.getElementById('product-catalog');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const slides: SlideItem[] = [
    {
      id: 1,
      tag: 'ZAP ATELIER &bull; SS 2026',
      headline: 'MASTER YOUR STRIDE',
      subheadline: 'ARCHITECTURAL FOOTWEAR & LEATHER CRAFT',
      description: 'The pinnacle of contemporary footwear design. Handcrafted genuine leather oxfords, effortless everyday luxury walkers, and high-performance sneakers engineered for modern living.',
      image: '/images/hero-banner.jpg',
      ctaText: 'SHOP MEN’S STYLES',
      ctaAction: () => {
        setSelectedGender('MEN');
        setSelectedBrand('all');
        setSelectedCategory('all');
        scrollToCatalog();
      },
      secondaryCtaText: 'LADIES’ COLLECTION',
      secondaryCtaAction: () => {
        setSelectedGender('WOMEN');
        setSelectedBrand('all');
        setSelectedCategory('all');
        scrollToCatalog();
      },
      accentColor: '#D32F2F',
    },
    {
      id: 2,
      tag: 'POWER ATHLETICS',
      headline: 'VELOCITY RUN NITRO',
      subheadline: 'UNLEASH YOUR FASTEST PACE',
      description: 'Engineered with reactive kinetic foam and breathable aerodynamic mesh. Maximum energy return for 5k runs, gym workouts, and active lifestyle.',
      image: '/images/shoe-power-runner.jpg',
      ctaText: 'SHOP POWER SNEAKERS',
      ctaAction: () => {
        setSelectedBrand('power');
        setSelectedCategory('all');
        scrollToCatalog();
      },
      secondaryCtaText: 'VIEW RUNNING GEAR',
      secondaryCtaAction: () => {
        setSelectedCategory('sneakers');
        scrollToCatalog();
      },
      accentColor: '#E11D48',
    },
    {
      id: 3,
      tag: 'HUSH PUPPIES LUXURY',
      headline: 'EXECUTIVE ZERO-G',
      subheadline: 'ALL-DAY BOARDROOM COMFORT',
      description: 'Experience pure cloud comfort in hand-burnished genuine cow leather. Orthopedic arch support and shock-dampening heels for effortless all-day wear.',
      image: '/images/shoe-leather-formal.jpg',
      ctaText: 'SHOP HUSH PUPPIES',
      ctaAction: () => {
        setSelectedBrand('hush-puppies');
        setSelectedCategory('all');
        scrollToCatalog();
      },
      secondaryCtaText: 'EXPLORE FORMAL SHOES',
      secondaryCtaAction: () => {
        setSelectedCategory('formal');
        scrollToCatalog();
      },
      accentColor: '#B45309',
    },
  ];

  // Auto-play timer
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isHovered, slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const slide = slides[currentSlide];

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
        background: 'radial-gradient(circle at 70% 50%, rgba(211, 47, 47, 0.18) 0%, transparent 70%)',
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
              <ShieldCheck size={14} color="#D32F2F" />
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
              {slide.headline}
            </h1>

            <h2 style={{
              fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)',
              fontWeight: 700,
              color: '#E2E8F0',
              letterSpacing: '0.02em',
              marginBottom: '16px',
            }}>
              {slide.subheadline}
            </h2>

            <p style={{
              fontSize: '1rem',
              color: '#94A3B8',
              lineHeight: 1.6,
              marginBottom: '28px',
              maxWidth: '520px',
            }}>
              {slide.description}
            </p>

            <div style={{
              display: 'flex',
              gap: '14px',
              flexWrap: 'wrap',
            }}>
              <button
                onClick={slide.ctaAction}
                className="btn btn-primary"
                style={{
                  padding: '14px 28px',
                  fontSize: '0.95rem',
                }}
              >
                <span>{slide.ctaText}</span>
                <ArrowRight size={17} />
              </button>

              <button
                onClick={slide.secondaryCtaAction}
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
                src={slide.image}
                alt={slide.headline}
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
                <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600 }}>CRAFTED EXCELLENCE</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#F87171' }}>100% Certified ZAP Quality</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prev / Next Slider Navigation Buttons */}
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
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#D32F2F')}
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
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#D32F2F')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)')}
      >
        <ChevronRight size={22} />
      </button>

      {/* Slide Indicator Dots */}
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
              width: idx === currentSlide ? '28px' : '10px',
              height: '8px',
              borderRadius: '999px',
              backgroundColor: idx === currentSlide ? '#D32F2F' : 'rgba(255, 255, 255, 0.3)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

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

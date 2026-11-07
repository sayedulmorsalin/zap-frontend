'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useShop } from '../../context/ShopContext';

interface StoryItem {
  id: string;
  title: string;
  image: string;
  category: string;
  brand?: string;
  gender?: string;
}

export const StoryCategories: React.FC = () => {
  const { setSelectedCategory, setSelectedBrand, setSelectedGender } = useShop();
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const stories: StoryItem[] = [
    {
      id: 's1',
      title: 'Men Formal',
      image: '/images/shoe-leather-formal.jpg',
      category: 'formal',
      gender: 'MEN',
    },
    {
      id: 's2',
      title: 'Power Athletics',
      image: '/images/shoe-power-runner.jpg',
      category: 'sneakers',
      brand: 'power',
    },
    {
      id: 's3',
      title: 'North Star',
      image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=300&q=80',
      category: 'casual',
      brand: 'north-star',
    },
    {
      id: 's4',
      title: 'Ladies Heels',
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=300&q=80',
      category: 'heels',
      gender: 'WOMEN',
    },
    {
      id: 's5',
      title: 'ZAP Comfit',
      image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=300&q=80',
      category: 'casual',
      brand: 'zap-comfit',
    },
    {
      id: 's6',
      title: 'Outdoor Boots',
      image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=300&q=80',
      category: 'boots',
      brand: 'weinbrenner',
    },
    {
      id: 's7',
      title: 'Sandals',
      image: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=300&q=80',
      category: 'sandals',
    },
    {
      id: 's8',
      title: 'Kids Fun',
      image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=300&q=80',
      category: 'sneakers',
      brand: 'bubblegummers',
      gender: 'KIDS',
    },
  ];

  const handleStoryClick = (story: StoryItem) => {
    setSelectedCategory(story.category);
    if (story.brand) setSelectedBrand(story.brand);
    else setSelectedBrand('all');
    if (story.gender) setSelectedGender(story.gender);
    else setSelectedGender('ALL');

    const catalogElem = document.getElementById('product-catalog');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section style={{
      backgroundColor: '#FFFFFF',
      padding: '16px 0 12px',
      borderBottom: '1px solid #E2E8F0',
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
    }}>
      <div className="container" style={{ padding: '0 8px', width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
        <div 
          className="story-categories-track"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            paddingBottom: '4px',
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
          }}
        >
          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() => handleStoryClick(story)}
              className="story-btn"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                textAlign: 'center',
                flexShrink: 0,
                padding: '4px 2px',
              }}
            >
              <div 
                className="story-ring"
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  padding: '2.5px',
                  background: 'linear-gradient(135deg, #D32F2F 0%, #F59E0B 100%)',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  backgroundColor: '#F8FAFC',
                  border: '2px solid #FFFFFF',
                }}>
                  <Image
                    src={
                      imgErrors[story.id]
                        ? (story.category === 'formal' ? '/images/shoe-leather-formal.jpg' : '/images/shoe-power-runner.jpg')
                        : story.image
                    }
                    alt={story.title}
                    width={80}
                    height={80}
                    sizes="80px"
                    onError={() => {
                      setImgErrors((prev: Record<string, boolean>) => ({ ...prev, [story.id]: true }));
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              </div>
              <span 
                className="story-title"
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#1E293B',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.01em',
                }}
              >
                {story.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .story-categories-track {
          justify-content: center;
          flex-wrap: wrap;
          width: 100%;
          max-width: 100%;
        }
        @media (max-width: 900px) {
          .story-categories-track {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
            justify-content: flex-start !important;
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            scroll-snap-type: x mandatory !important;
            -webkit-overflow-scrolling: touch !important;
            scrollbar-width: none !important;
            padding: 4px 10px !important;
            gap: 12px !important;
          }
          .story-categories-track::-webkit-scrollbar {
            display: none !important;
          }
          .story-btn {
            scroll-snap-align: start !important;
            width: 64px !important;
          }
          .story-ring {
            width: 56px !important;
            height: 56px !important;
          }
        }
      `}</style>
    </section>
  );
};

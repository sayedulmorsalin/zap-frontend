'use client';

import React from 'react';
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
      padding: '24px 0 16px',
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollbarWidth: 'none',
        }}>
          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() => handleStoryClick(story)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0,
                textAlign: 'center',
                width: '84px',
              }}
            >
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                padding: '3px',
                background: 'linear-gradient(135deg, #D32F2F, #F59E0B)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
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
                    src={story.image}
                    alt={story.title}
                    width={80}
                    height={80}
                    unoptimized
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              </div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#1E293B',
                whiteSpace: 'nowrap',
              }}>
                {story.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

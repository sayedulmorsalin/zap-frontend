'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  X, 
  ShoppingBag, 
  Heart, 
  Star, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Ruler,
  ExternalLink 
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const QuickViewModal: React.FC = () => {
  const router = useRouter();
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    toggleWishlist,
    isWishlisted,
    setIsSizeGuideOpen,
  } = useShop();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const wishlisted = isWishlisted(product.id);
  const currentSize = selectedSize || product.sizes[0] || '41';
  const currentColor = selectedColor || product.colors[0]?.name || 'Standard';

  const handleAddToCart = () => {
    addToCart(product, currentSize, currentColor, quantity);
    setQuickViewProduct(null);
  };

  return (
    <div className="modal-backdrop" onClick={() => setQuickViewProduct(null)}>
      <div
        className="animate-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          maxWidth: '880px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          aria-label="Close Modal"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B',
            transition: 'all 0.15s ease',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#FFEBEE';
            e.currentTarget.style.color = '#D32F2F';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#F1F5F9';
            e.currentTarget.style.color = '#64748B';
          }}
        >
          <X size={20} />
        </button>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '32px',
        }} className="quickview-grid">
          {/* Left: Product Images Gallery */}
          <div>
            <div style={{
              width: '100%',
              aspectRatio: '1/1',
              borderRadius: '16px',
              backgroundColor: '#F8FAFC',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #E2E8F0',
              marginBottom: '12px',
              position: 'relative',
            }}>
              <Image
                src={product.images[activeImageIdx] || product.images[0]}
                alt={product.name}
                width={500}
                height={500}
                unoptimized
                style={{
                  width: '92%',
                  height: '92%',
                  objectFit: 'contain',
                }}
              />

              {product.discountPercentage && product.discountPercentage > 0 && (
                <span className="badge-discount" suppressHydrationWarning>
                  -{product.discountPercentage}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '10px' }}>
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: activeImageIdx === idx ? '2px solid #D32F2F' : '1px solid #E2E8F0',
                      padding: '2px',
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    <Image
                      src={img}
                      alt={`View ${idx + 1}`}
                      width={64}
                      height={64}
                      unoptimized
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & Controls */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}>
              <span style={{
                color: '#D32F2F',
                fontWeight: 800,
                fontSize: '0.825rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                {product.brand}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                SKU: {product.sku}
              </span>
            </div>

            <h2 style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1.25,
              marginBottom: '10px',
            }}>
              {product.name}
            </h2>

            {/* Ratings */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={15}
                    color="#F59E0B"
                    fill={star <= Math.round(product.rating) ? '#F59E0B' : 'none'}
                  />
                ))}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                {product.rating}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                ({product.reviewCount} verified reviews)
              </span>
              <span style={{
                fontSize: '0.75rem',
                color: '#15803D',
                fontWeight: 700,
                backgroundColor: '#DCFCE7',
                padding: '2px 8px',
                borderRadius: '4px',
              }}>
                In Stock
              </span>
            </div>

            {/* Price Box */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              padding: '14px 18px',
              border: '1px solid #E2E8F0',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A' }}>
                  Tk {product.price.toLocaleString()}
                </span>
                {product.regularPrice > product.price && (
                  <>
                    <span style={{
                      fontSize: '1rem',
                      color: '#94A3B8',
                      textDecoration: 'line-through',
                    }}>
                      Tk {product.regularPrice.toLocaleString()}
                    </span>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      color: '#D32F2F',
                      backgroundColor: '#FFEBEE',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}>
                      Save Tk {(product.regularPrice - product.price).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                Prices inclusive of VAT. Free delivery applies over Tk 2,500.
              </div>
            </div>

            {/* Size Selector */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0F172A' }}>
                  SELECT SIZE (EU): <strong>{currentSize}</strong>
                </span>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#D32F2F',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Ruler size={13} />
                  <span>Size Chart Guide</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    style={{
                      minWidth: '44px',
                      height: '38px',
                      padding: '0 10px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: sz === currentSize ? '2px solid #D32F2F' : '1px solid #CBD5E1',
                      backgroundColor: sz === currentSize ? '#FFEBEE' : '#FFFFFF',
                      color: sz === currentSize ? '#D32F2F' : '#1E293B',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '8px' }}>
                COLOR: <strong>{currentColor}</strong>
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    title={c.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: c.name === currentColor ? '2px solid #D32F2F' : '1px solid #E2E8F0',
                      backgroundColor: c.name === currentColor ? '#FFEBEE' : '#FFFFFF',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                    }}
                  >
                    <span style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: c.hex,
                      border: '1px solid #CBD5E1',
                      display: 'inline-block',
                    }} />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Stepper & CTAs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
              flexWrap: 'wrap',
            }}>
              {/* Stepper */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1.5px solid #CBD5E1',
                borderRadius: '8px',
                overflow: 'hidden',
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    width: '38px',
                    height: '42px',
                    border: 'none',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                  }}
                >
                  -
                </button>
                <span style={{
                  width: '40px',
                  textAlign: 'center',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    width: '38px',
                    height: '42px',
                    border: 'none',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                  }}
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  minWidth: '160px',
                }}
              >
                <ShoppingBag size={18} />
                <span>Add to Shopping Bag</span>
              </button>

              {/* Wishlist toggle */}
              <button
                onClick={() => toggleWishlist(product.id)}
                aria-label="Wishlist"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Heart size={20} color={wishlisted ? '#D32F2F' : '#64748B'} fill={wishlisted ? '#D32F2F' : 'none'} />
              </button>
            </div>

            {/* Direct Link to Full Product Page */}
            <button
              onClick={() => {
                setQuickViewProduct(null);
                router.push(`/products/${product.slug || product.id}`);
              }}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #000000',
                backgroundColor: '#000000',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#27272A')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#000000')}
            >
              <span>View Full Product Page</span>
              <ExternalLink size={15} />
            </button>

            {/* Trust Badges */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              paddingTop: '16px',
              borderTop: '1px solid #E2E8F0',
              textAlign: 'center',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <Truck size={18} color="#D32F2F" />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0F172A' }}>Fast BD Delivery</span>
                <span style={{ fontSize: '0.65rem', color: '#64748B' }}>Dhaka 24-48h</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <RotateCcw size={18} color="#D32F2F" />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0F172A' }}>7 Days Return</span>
                <span style={{ fontSize: '0.65rem', color: '#64748B' }}>Easy Exchange</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={18} color="#D32F2F" />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0F172A' }}>100% Genuine</span>
                <span style={{ fontSize: '0.65rem', color: '#64748B' }}>ZAP Certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 768px) {
          .quickview-grid {
            grid-template-columns: 1fr 1.1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

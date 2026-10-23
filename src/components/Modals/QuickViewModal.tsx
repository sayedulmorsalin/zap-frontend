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

  // Determine active color
  const currentColor = selectedColor || product.colors?.[0]?.name || product.colorVariants?.[0]?.color || 'Standard';

  // Find colorway group matching active color
  const selectedColorway = product.colorVariants?.find(
    (cv) => cv.color.toLowerCase() === currentColor.toLowerCase()
  );

  // Images for this colorway or fallback to general product images
  const activeImages = (selectedColorway && selectedColorway.images && selectedColorway.images.length > 0)
    ? selectedColorway.images
    : (product.images || []);

  // Build size -> stock map for selected color
  const sizeStockMap: { [size: string]: number } = {};
  if (selectedColorway && selectedColorway.sizes.length > 0) {
    selectedColorway.sizes.forEach((s) => {
      sizeStockMap[s.size] = typeof s.stock === 'number' ? s.stock : Number(s.stock) || 0;
    });
  } else if (product.variants && product.variants.length > 0) {
    product.variants
      .filter((v) => (v.color || '').toLowerCase() === currentColor.toLowerCase())
      .forEach((v) => {
        sizeStockMap[v.size] = typeof v.stock === 'number' ? v.stock : Number(v.stock) || 0;
      });
  } else {
    (product.sizes || []).forEach((sz) => {
      sizeStockMap[sz] = 10;
    });
  }

  // Determine available sizes for this colorway
  const availableSizes = selectedColorway && selectedColorway.sizes.length > 0
    ? selectedColorway.sizes.map((s) => s.size)
    : (product.sizes || []);

  const currentSize = selectedSize && availableSizes.includes(selectedSize)
    ? selectedSize
    : (availableSizes[0] || '41');

  const currentAvailableStock = sizeStockMap[currentSize] ?? 0;
  const isOutOfStock = currentAvailableStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, currentSize, currentColor, quantity);
    setQuickViewProduct(null);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, currentSize, currentColor, quantity);
    setQuickViewProduct(null);
    router.push('/checkout');
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
                src={activeImages[activeImageIdx] || activeImages[0] || product.images[0]}
                alt={`${product.name} - ${currentColor}`}
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
            {activeImages.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {activeImages.map((img, idx) => (
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

            {/* Ratings & Stock Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              flexWrap: 'wrap',
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
                ({product.reviewCount} reviews)
              </span>

              {isOutOfStock ? (
                <span style={{
                  fontSize: '0.75rem',
                  color: '#DC2626',
                  fontWeight: 700,
                  backgroundColor: '#FEE2E2',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}>
                  Out of Stock
                </span>
              ) : currentAvailableStock <= 5 ? (
                <span style={{
                  fontSize: '0.75rem',
                  color: '#D97706',
                  fontWeight: 700,
                  backgroundColor: '#FEF3C7',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}>
                  Only {currentAvailableStock} left in Size {currentSize}!
                </span>
              ) : (
                <span style={{
                  fontSize: '0.75rem',
                  color: '#15803D',
                  fontWeight: 700,
                  backgroundColor: '#DCFCE7',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}>
                  In Stock ({currentAvailableStock} pairs)
                </span>
              )}
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

            {/* Color Selector */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0F172A' }}>
                  COLORWAY: <strong style={{ color: '#D32F2F' }}>{currentColor}</strong>
                </span>
                {selectedColorway?.images && selectedColorway.images.length > 0 && (
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                    {selectedColorway.images.length} photos
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {product.colors.map((c) => {
                  const isSelected = c.name.toLowerCase() === currentColor.toLowerCase();
                  return (
                    <button
                      key={c.name}
                      onClick={() => {
                        setSelectedColor(c.name);
                        setActiveImageIdx(0);
                        const cw = product.colorVariants?.find((item) => item.color.toLowerCase() === c.name.toLowerCase());
                        if (cw && cw.sizes.length > 0) {
                          const hasStock = cw.sizes.find(s => (typeof s.stock === 'number' ? s.stock : Number(s.stock) || 0) > 0);
                          setSelectedSize(hasStock ? hasStock.size : cw.sizes[0].size);
                        }
                        setQuantity(1);
                      }}
                      title={c.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid #D32F2F' : '1px solid #CBD5E1',
                        backgroundColor: isSelected ? '#FFEBEE' : '#FFFFFF',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? '#D32F2F' : '#334155',
                        transition: 'all 0.15s ease',
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
                  );
                })}
              </div>
            </div>

            {/* Size Selector with Live Stock Display */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0F172A' }}>
                  SELECT SIZE (EU): <strong style={{ color: '#D32F2F' }}>{currentSize}</strong>
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
                  <span>Size Guide</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {availableSizes.map((sz) => {
                  const stock = sizeStockMap[sz] ?? 0;
                  const out = stock <= 0;
                  const isSelected = sz === currentSize;

                  return (
                    <button
                      key={sz}
                      onClick={() => {
                        setSelectedSize(sz);
                        if (quantity > stock && stock > 0) {
                          setQuantity(stock);
                        }
                      }}
                      style={{
                        minWidth: '52px',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        border: isSelected ? '2px solid #D32F2F' : '1px solid #CBD5E1',
                        backgroundColor: isSelected ? '#FFEBEE' : out ? '#F8FAFC' : '#FFFFFF',
                        color: isSelected ? '#D32F2F' : out ? '#94A3B8' : '#1E293B',
                        opacity: out ? 0.6 : 1,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        textDecoration: out ? 'line-through' : 'none',
                      }}>
                        {sz}
                      </span>
                      <span style={{
                        fontSize: '0.625rem',
                        fontWeight: 600,
                        color: out ? '#EF4444' : stock <= 5 ? '#D97706' : '#16A34A',
                        marginTop: '2px',
                        lineHeight: 1,
                      }}>
                        {out ? '0 left' : `${stock} left`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper & CTAs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
              flexWrap: 'wrap',
            }}>
              {/* Stepper */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1.5px solid #CBD5E1',
                borderRadius: '8px',
                overflow: 'hidden',
                opacity: isOutOfStock ? 0.5 : 1,
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isOutOfStock || quantity <= 1}
                  style={{
                    width: '38px',
                    height: '42px',
                    border: 'none',
                    background: '#F8FAFC',
                    cursor: isOutOfStock || quantity <= 1 ? 'not-allowed' : 'pointer',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#334155',
                  }}
                >
                  -
                </button>
                <span style={{
                  width: '40px',
                  textAlign: 'center',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: '#0F172A',
                }}>
                  {isOutOfStock ? 0 : quantity}
                </span>
                <button
                  onClick={() => {
                    if (quantity < currentAvailableStock) {
                      setQuantity(quantity + 1);
                    }
                  }}
                  disabled={isOutOfStock || quantity >= currentAvailableStock}
                  style={{
                    width: '38px',
                    height: '42px',
                    border: 'none',
                    background: '#F8FAFC',
                    cursor: isOutOfStock || quantity >= currentAvailableStock ? 'not-allowed' : 'pointer',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#334155',
                  }}
                >
                  +
                </button>
              </div>

              {/* Buy Now & Add to Bag Buttons */}
              <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '220px' }}>
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="btn"
                  style={{
                    flex: 1,
                    minWidth: '110px',
                    padding: '12px 14px',
                    backgroundColor: isOutOfStock ? '#94A3B8' : '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    opacity: isOutOfStock ? 0.6 : 1,
                  }}
                >
                  {isOutOfStock ? 'Sold Out' : 'Buy Now'}
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="btn btn-primary"
                  style={{
                    flex: 1.2,
                    minWidth: '130px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    opacity: isOutOfStock ? 0.6 : 1,
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ShoppingBag size={17} />
                  <span>{isOutOfStock ? 'Out of Stock' : 'Add to Bag'}</span>
                </button>
              </div>

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

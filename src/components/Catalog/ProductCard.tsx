'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, Eye, ShoppingBag, Star } from 'lucide-react';
import { Product } from '../../types/product';
import { useShop } from '../../context/ShopContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();
  const { addToCart, toggleWishlist, isWishlisted, setQuickViewProduct, setIsCartOpen } = useShop();
  const [selectedSize, setSelectedSize] = useState<string>((product.sizes && product.sizes[0]) || '41');
  const [selectedColor, setSelectedColor] = useState<string>((product.colors && product.colors[0]?.name) || 'Standard');
  const [isHovered, setIsHovered] = useState(false);

  const wishlisted = isWishlisted(product.id);

  // Resolve active colorway for image & stock preview
  const selectedColorway = product.colorVariants?.find(
    (cv) => cv.color.toLowerCase() === selectedColor.toLowerCase()
  );

  const primaryImg = selectedColorway?.images?.[0] || product.images?.[0] || '/images/shoe-leather-formal.jpg';
  const secondaryImg = selectedColorway?.images?.[1] || product.images?.[1] || primaryImg;

  // Determine stock for current selected color & size
  let currentStock = 10;
  if (selectedColorway && selectedColorway.sizes.length > 0) {
    const sObj = selectedColorway.sizes.find((s) => s.size === selectedSize);
    currentStock = sObj ? (typeof sObj.stock === 'number' ? sObj.stock : Number(sObj.stock) || 0) : 0;
  } else if (product.variants && product.variants.length > 0) {
    const vObj = product.variants.find(
      (v) => (v.color || '').toLowerCase() === selectedColor.toLowerCase() && v.size === selectedSize
    );
    currentStock = vObj ? (typeof vObj.stock === 'number' ? vObj.stock : Number(vObj.stock) || 0) : 0;
  } else if (product.inStock === false) {
    currentStock = 0;
  }
  const isOutOfStock = currentStock <= 0 || product.inStock === false;

  const handleCardClick = (e: React.MouseEvent) => {
    // Navigate to product page if didn't click button
    const target = e.target as HTMLElement;
    if (!target.closest('button')) {
      router.push(`/products/${product.slug || product.id}`);
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, selectedSize, selectedColor, 1);
    setIsCartOpen(false);
    router.push('/checkout');
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="product-card"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isHovered ? '0 16px 32px -4px rgba(0, 0, 0, 0.1)' : '0 2px 6px rgba(0, 0, 0, 0.04)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        cursor: 'pointer',
      }}
    >
      {/* Badges Container */}
      {product.discountPercentage && product.discountPercentage > 0 && (
        <span className="badge-discount" suppressHydrationWarning>
          -{product.discountPercentage}% OFF
        </span>
      )}

      {product.isNewArrival && (
        <span className="badge-tag" suppressHydrationWarning>
          NEW
        </span>
      )}
      {!product.isNewArrival && product.isBestseller && (
        <span className="badge-tag" style={{ backgroundColor: '#D97706' }} suppressHydrationWarning>
          BESTSELLER
        </span>
      )}

      {/* Wishlist Button (Top Right) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
        aria-label="Add to Wishlist"
        className="product-card-wishlist"
        style={{
          position: 'absolute',
          top: '12px',
          right: product.isNewArrival || product.isBestseller ? '64px' : '12px',
          zIndex: 3,
          backgroundColor: '#FFFFFF',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #E2E8F0',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          transition: 'transform 0.15s ease, background 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <Heart
          size={18}
          color={wishlisted ? '#D32F2F' : '#64748B'}
          fill={wishlisted ? '#D32F2F' : 'none'}
        />
      </button>

      {/* Shoe Image Area with Dual Angle Hover & Color Swatch Sync */}
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1/1',
        backgroundColor: '#F8FAFC',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Image
          src={isHovered ? secondaryImg : primaryImg}
          alt={product.name}
          width={400}
          height={400}
          unoptimized
          style={{
            width: '90%',
            height: '90%',
            objectFit: 'contain',
            transition: 'transform 0.4s ease, opacity 0.3s ease',
            transform: isHovered ? 'scale(1.08)' : 'scale(1)',
          }}
        />

        {/* Hover Quick Actions Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          right: '12px',
          display: 'flex',
          gap: '8px',
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.25s ease',
          zIndex: 4,
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/products/${product.slug || product.id}`);
            }}
            className="btn btn-secondary btn-sm"
            style={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            <Eye size={14} color="#0F172A" />
            <span>View Details</span>
          </button>
        </div>
      </div>

      {/* Product Information Body */}
      <div className="product-card-body" style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
      }}>
        {/* Brand & Category */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '6px',
        }}>
          <span className="product-card-brand" style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#D32F2F',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            {product.brand}
          </span>
          <span className="product-card-gender" style={{
            fontSize: '0.72rem',
            color: '#64748B',
            fontWeight: 500,
          }}>
            {product.gender}
          </span>
        </div>

        {/* Product Title */}
        <h3 className="product-card-title" style={{
          fontSize: '0.95rem',
          fontWeight: 700,
          color: '#0F172A',
          lineHeight: 1.35,
          marginBottom: '8px',
          minHeight: '2.7em',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {product.name}
        </h3>

        {/* Rating Stars */}
        <div className="product-card-rating" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          marginBottom: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={13}
                color="#F59E0B"
                fill={star <= Math.round(product.rating) ? '#F59E0B' : 'none'}
              />
            ))}
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E293B' }}>
            {product.rating}
          </span>
          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
            ({product.reviewCount})
          </span>
        </div>

        {/* Size Selection Chips */}
        <div className="product-card-sizes" style={{ marginBottom: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '4px',
          }}>
            <span className="product-card-sizes-label" style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>
              SIZE (EU):
            </span>
            <span style={{ fontSize: '0.7rem', color: isOutOfStock ? '#DC2626' : '#0F172A', fontWeight: 800 }}>
              {selectedSize} {isOutOfStock ? '(Sold Out)' : `(${currentStock} left)`}
            </span>
          </div>
          <div className="product-card-sizes-chips" style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
          }}>
            {(product.sizes || []).slice(0, 5).map((sz) => {
              let szStock = 10;
              if (selectedColorway && selectedColorway.sizes.length > 0) {
                const sObj = selectedColorway.sizes.find((s) => s.size === sz);
                szStock = sObj ? (typeof sObj.stock === 'number' ? sObj.stock : Number(sObj.stock) || 0) : 0;
              }
              const isSzOut = szStock <= 0;
              return (
                <button
                  key={sz}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(sz);
                  }}
                  className="product-card-size-btn"
                  style={{
                    width: '32px',
                    height: '26px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    border: sz === selectedSize ? '1.5px solid #D32F2F' : '1px solid #E2E8F0',
                    backgroundColor: sz === selectedSize ? '#FFEBEE' : isSzOut ? '#F1F5F9' : '#FFFFFF',
                    color: sz === selectedSize ? '#D32F2F' : isSzOut ? '#94A3B8' : '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: isSzOut ? 'line-through' : 'none',
                    opacity: isSzOut ? 0.6 : 1,
                    transition: 'all 0.15s ease',
                  }}
                  title={isSzOut ? `Size ${sz} is out of stock` : `Size ${sz} (${szStock} in stock)`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Swatch Dots */}
        {(product.colors || []).length > 1 && (
          <div className="product-card-colors" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <span className="product-card-colors-label" style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>COLOR:</span>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {(product.colors || []).map((c) => (
                <button
                  key={c.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedColor(c.name);
                    const cw = product.colorVariants?.find((item) => item.color.toLowerCase() === c.name.toLowerCase());
                    if (cw && cw.sizes.length > 0) {
                      const hasStock = cw.sizes.find((s) => (typeof s.stock === 'number' ? s.stock : Number(s.stock) || 0) > 0);
                      if (hasStock) {
                        setSelectedSize(hasStock.size);
                      }
                    }
                  }}
                  title={c.name}
                  className="product-card-color-dot"
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: c.hex,
                    border: c.name.toLowerCase() === selectedColor.toLowerCase() ? '2px solid #D32F2F' : '1px solid #CBD5E1',
                    padding: 0,
                    cursor: 'pointer',
                    boxShadow: c.name.toLowerCase() === selectedColor.toLowerCase() ? '0 0 0 1px #D32F2F' : 'none',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Price & Savings */}
        <div className="product-card-pricing" style={{
          marginTop: 'auto',
          paddingTop: '10px',
          borderTop: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: '14px',
        }}>
          <div>
            <div className="product-card-price" style={{
              fontSize: '1.2rem',
              fontWeight: 900,
              color: '#0F172A',
            }} suppressHydrationWarning>
              Tk {product.price.toLocaleString()}
            </div>
            {product.regularPrice > product.price && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="product-card-regular-price" style={{
                  fontSize: '0.8rem',
                  color: '#94A3B8',
                  textDecoration: 'line-through',
                }} suppressHydrationWarning>
                  Tk {product.regularPrice.toLocaleString()}
                </span>
                <span className="product-card-save-badge" style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#15803D',
                }} suppressHydrationWarning>
                  Save Tk {(product.regularPrice - product.price).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Buy Now & Add To Bag CTA Buttons */}
        <div className="product-card-actions" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          width: '100%',
        }}>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="product-card-btn product-card-buy-btn"
            style={{
              padding: '9px 10px',
              fontSize: '0.82rem',
              fontWeight: 700,
              borderRadius: '8px',
              border: '1.5px solid #0F172A',
              backgroundColor: isOutOfStock ? '#94A3B8' : '#0F172A',
              color: '#FFFFFF',
              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              opacity: isOutOfStock ? 0.6 : 1,
            }}
          >
            <span>{isOutOfStock ? 'Sold Out' : 'Buy Now'}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isOutOfStock) return;
              addToCart(product, selectedSize, selectedColor, 1);
            }}
            disabled={isOutOfStock}
            className="btn btn-primary product-card-btn product-card-bag-btn"
            style={{
              padding: '9px 10px',
              fontSize: '0.82rem',
              fontWeight: 700,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              opacity: isOutOfStock ? 0.6 : 1,
            }}
          >
            <ShoppingBag size={14} />
            <span>{isOutOfStock ? 'Out of Stock' : 'Add to Bag'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

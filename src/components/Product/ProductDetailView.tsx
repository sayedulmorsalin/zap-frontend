'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  Share2, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Star, 
  Check, 
  MessageCircle, 
  ShoppingBag, 
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { Product } from '../../types/product';
import { useShop } from '../../context/ShopContext';
import { AnnouncementBar } from '../Header/AnnouncementBar';
import { Navbar } from '../Header/Navbar';
import { Footer } from '../Footer/Footer';
import { CartDrawer } from '../Modals/CartDrawer';
import { WishlistDrawer } from '../Modals/WishlistDrawer';
import { CheckoutModal } from '../Modals/CheckoutModal';
import { TrackOrderModal } from '../Modals/TrackOrderModal';
import { SizeGuideModal } from '../Modals/SizeGuideModal';
import { COLOR_IMAGE_MAP, SAMPLE_REVIEWS } from '../../data/anchorCrest';

interface ProductDetailViewProps {
  initialProduct: Product;
  relatedProducts?: Product[];
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  initialProduct,
  relatedProducts = [],
}) => {
  const router = useRouter();
  const { 
    addToCart, 
    toggleWishlist, 
    isWishlisted, 
    setIsCheckoutOpen, 
    setIsCartOpen,
    showToast,
    toastMessage,
    products: allProducts,
  } = useShop();

  const product = initialProduct;
  const wishlisted = isWishlisted(product.id);

  // Default color and size resolution
  const defaultColor = product.colors?.[0]?.name || product.colorVariants?.[0]?.color || 'Classic Black';
  const defaultColorway = product.colorVariants?.find(
    (cv) => cv.color.toLowerCase() === defaultColor.toLowerCase()
  );
  const defaultSize = defaultColorway && defaultColorway.sizes.length > 0
    ? (defaultColorway.sizes.find((s) => s.stock > 0)?.size || defaultColorway.sizes[0].size)
    : (product.sizes?.[0] || '41');

  // States
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>(defaultColor);
  const [selectedSize, setSelectedSize] = useState<string>(defaultSize);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'sizeguide'>('description');
  const [showOptionsWarning, setShowOptionsWarning] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync state when product changes (e.g. navigation across related products)
  useEffect(() => {
    setActiveImageIdx(0);
    const newColor = product.colors?.[0]?.name || product.colorVariants?.[0]?.color || 'Classic Black';
    setSelectedColor(newColor);
    const cw = product.colorVariants?.find((c) => c.color.toLowerCase() === newColor.toLowerCase());
    const newSz = cw && cw.sizes.length > 0
      ? (cw.sizes.find((s) => s.stock > 0)?.size || cw.sizes[0].size)
      : (product.sizes?.[0] || '41');
    setSelectedSize(newSz);
    setQuantity(1);
  }, [product.id]);

  // Reviews state
  const [reviewsList, setReviewsList] = useState(SAMPLE_REVIEWS);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Fallback related products if not provided
  const finalRelated = (relatedProducts.length > 0 ? relatedProducts : allProducts.filter(p => p.id !== product.id)).slice(0, 4);

  // Resolve active colorway and its images & size stock
  const selectedColorway = product.colorVariants?.find(
    (cv) => cv.color.toLowerCase() === selectedColor.toLowerCase()
  );

  const activeImages = (selectedColorway && selectedColorway.images && selectedColorway.images.length > 0)
    ? selectedColorway.images
    : (product.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80']);

  // Build size -> stock map for selected color
  const sizeStockMap: { [size: string]: number } = {};
  if (selectedColorway && selectedColorway.sizes.length > 0) {
    selectedColorway.sizes.forEach((s) => {
      sizeStockMap[s.size] = typeof s.stock === 'number' ? s.stock : Number(s.stock) || 0;
    });
  } else if (product.variants && product.variants.length > 0) {
    product.variants
      .filter((v) => (v.color || '').toLowerCase() === selectedColor.toLowerCase())
      .forEach((v) => {
        sizeStockMap[v.size] = typeof v.stock === 'number' ? v.stock : Number(v.stock) || 0;
      });
  } else {
    (product.sizes || ['39', '40', '41', '42', '43', '44']).forEach((sz) => {
      sizeStockMap[sz] = 10;
    });
  }

  // Sorted available sizes (e.g., 39, 40, 41, 42, 43, 44, 45)
  const rawSizes = Object.keys(sizeStockMap).length > 0
    ? Object.keys(sizeStockMap)
    : (product.sizes || []);
  const currentAvailableSizes = [...rawSizes].sort((a, b) => {
    const numA = Number(a);
    const numB = Number(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  const currentStock = sizeStockMap[selectedSize] ?? 0;
  const isSelectedSizeOutOfStock = currentStock <= 0;

  // Color selection handling: update color and sync thumbnail
  const handleColorChange = (colorName: string) => {
    setSelectedColor(colorName);
    setShowOptionsWarning(false);
    setActiveImageIdx(0);

    // If the newly selected color has sizes, auto-select first in-stock size if current size is out of stock
    const newColorway = product.colorVariants?.find(
      (cv) => cv.color.toLowerCase() === colorName.toLowerCase()
    );
    let newSz = selectedSize;
    if (newColorway && newColorway.sizes.length > 0) {
      const match = newColorway.sizes.find((s) => s.size === selectedSize && s.stock > 0);
      if (!match) {
        const firstInStock = newColorway.sizes.find((s) => s.stock > 0) || newColorway.sizes[0];
        if (firstInStock) {
          newSz = firstInStock.size;
          setSelectedSize(newSz);
        }
      }
    }
    const targetStock = newColorway?.sizes?.find((s) => s.size === newSz)?.stock ?? 10;
    if (targetStock > 0 && quantity > targetStock) {
      setQuantity(targetStock);
    }
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    setShowOptionsWarning(false);
    const newStock = sizeStockMap[size] ?? 0;
    if (newStock > 0 && quantity > newStock) {
      setQuantity(newStock);
    }
  };

  const handleBuyNow = () => {
    const sizeToUse = selectedSize || currentAvailableSizes[0] || '41';
    if (!selectedSize) {
      setSelectedSize(sizeToUse);
    }
    if (isSelectedSizeOutOfStock) {
      showToast(`Size ${sizeToUse} is currently out of stock in ${selectedColor}`);
      return;
    }
    addToCart(product, sizeToUse, selectedColor, quantity);
    setIsCartOpen(false);
    router.push('/checkout');
  };

  const handleAddToCart = () => {
    const sizeToUse = selectedSize || currentAvailableSizes[0] || '41';
    if (!selectedSize) {
      setSelectedSize(sizeToUse);
    }
    if (isSelectedSizeOutOfStock) {
      showToast(`Size ${sizeToUse} is currently out of stock in ${selectedColor}`);
      return;
    }
    addToCart(product, sizeToUse, selectedColor, quantity);
    setIsCartOpen(true);
    showToast(`${product.name} (${selectedColor}, Size ${sizeToUse}) added to your bag!`);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      showToast('Product link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;

    const newRev = {
      id: `rev-${Date.now()}`,
      author: newReviewAuthor.trim(),
      location: 'Verified Buyer',
      rating: newReviewRating,
      date: 'Just now',
      verified: true,
      title: 'Satisfied Customer',
      comment: newReviewComment.trim(),
    };

    setReviewsList([newRev, ...reviewsList]);
    setNewReviewAuthor('');
    setNewReviewComment('');
    setReviewSubmitted(true);
    showToast('Thank you! Your review has been submitted.');
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  // Color thumbnails helper
  const getColorThumbnail = (cName: string, fallbackIdx: number) => {
    const cv = product.colorVariants?.find((c) => c.color.toLowerCase() === cName.toLowerCase());
    if (cv && cv.images && cv.images.length > 0) return cv.images[0];

    const cObj = product.colors.find((c) => c.name.toLowerCase() === cName.toLowerCase());
    if (cObj && cObj.images && cObj.images.length > 0) return cObj.images[0];

    if (COLOR_IMAGE_MAP[cName]) return COLOR_IMAGE_MAP[cName];
    return product.images[fallbackIdx] || product.images[0];
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', color: '#111827' }}>
      {/* 1. Header Bar */}
      <AnnouncementBar />
      <Navbar />

      {/* 2. Breadcrumb Navigation */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #F3F4F6',
        padding: '12px 0',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.85rem',
          color: '#6B7280',
        }}>
          <Link href="/" style={{ color: '#111827', textDecoration: 'none', fontWeight: 500 }}>
            Shop
          </Link>
          <span>/</span>
          <Link href="/" style={{ color: '#6B7280', textDecoration: 'none' }}>
            {product.categoryName || 'Casual Shoes'}
          </Link>
          <span>/</span>
          <span style={{ color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {product.name}
          </span>
        </div>
      </div>

      {/* 3. Main Product Details Showcase */}
      <main className="container product-detail-main" style={{ padding: '36px 20px', flex: 1 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)',
          gap: '48px',
        }} className="product-showcase-grid">

          {/* ─── LEFT: Shoe Gallery with Vertical Thumbnail Strip ─── */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }} className="product-gallery-container">
            {/* Vertical Thumbnails */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              width: '80px',
              flexShrink: 0,
            }} className="vertical-thumbnails">
              {activeImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  onMouseEnter={() => setActiveImageIdx(idx)}
                  style={{
                    width: '76px',
                    height: '76px',
                    border: activeImageIdx === idx ? '2px solid #000000' : '1px solid #E5E7EB',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    backgroundColor: '#F9FAFB',
                    cursor: 'pointer',
                    padding: '2px',
                    transition: 'all 0.15s ease',
                    boxShadow: activeImageIdx === idx ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                  }}
                  aria-label={`View angle ${idx + 1}`}
                >
                  <Image
                    src={imgUrl}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    width={80}
                    height={80}
                    unoptimized
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '4px',
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Main Image Display with SKU watermark */}
            <div style={{
              flex: 1,
              position: 'relative',
              aspectRatio: '1/1',
              backgroundColor: '#1E232A',
              borderRadius: '10px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
            }}>
              <Image
                src={activeImages[activeImageIdx] || activeImages[0] || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'}
                alt={product.name}
                width={700}
                height={700}
                priority
                unoptimized
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  transition: 'opacity 0.25s ease',
                }}
              />

              {/* Bottom Right SKU Watermark/Badge (only when not embedded in image) */}
              {!activeImages[activeImageIdx]?.includes('SKU Images') && product.sku && (
                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '18px',
                  color: '#E5E7EB',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                  pointerEvents: 'none',
                }}>
                  {product.sku}
                </div>
              )}

              {/* Discount / New Badges */}
              {product.discountPercentage && product.discountPercentage > 0 && (
                <span className="badge-discount" suppressHydrationWarning>
                  -{product.discountPercentage}% OFF
                </span>
              )}

              {/* Wishlist floating toggle */}
              <button
                onClick={() => toggleWishlist(product.id)}
                aria-label="Wishlist toggle"
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #E5E7EB',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'transform 0.15s ease',
                  zIndex: 2,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Heart
                  size={19}
                  color={wishlisted ? '#DC2626' : '#4B5563'}
                  fill={wishlisted ? '#DC2626' : 'none'}
                />
              </button>
            </div>
          </div>

          {/* ─── RIGHT: Product Title, SKU, Price, Options & Actions ─── */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Title */}
            <h1 className="product-detail-title" style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#111827',
              lineHeight: 1.25,
              marginBottom: '4px',
            }}>
              {product.name}
            </h1>

            {/* SKU */}
            <div style={{
              fontSize: '0.88rem',
              fontWeight: 600,
              color: '#6B7280',
              marginBottom: '16px',
            }}>
              SKU {product.sku || 'C2287'}
            </div>

            {/* Price */}
            <div className="product-detail-price" style={{
              fontSize: '1.45rem',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'baseline',
              gap: '12px',
            }}>
              <span>BDT {product.price.toLocaleString()}</span>
              {product.regularPrice > product.price && (
                <span style={{ fontSize: '1rem', color: '#9CA3AF', textDecoration: 'line-through', fontWeight: 400 }}>
                  BDT {product.regularPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Trust and Feature Bullets with Emojis */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '9px',
              fontSize: '0.92rem',
              lineHeight: 1.5,
              color: '#374151',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚡</span>
                <span style={{ fontWeight: 600 }}>LEVEL UP YOUR SHOE COLLECTION!</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🚚</span>
                <span>Pre-order delivery in 20–25 days ( 2-3 days if in stock)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎁</span>
                <span>Extra 10% coupon after first delivery (SMS)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🌐</span>
                <span>High-quality imported shoes</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>💎</span>
                <span>Handpicked for quality, comfort & durability</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🔮</span>
                <span>Perfect for bold, modern style-lovers</span>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', marginBottom: '22px' }} />

            {/* Color Option */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{
                fontSize: '0.92rem',
                fontWeight: 600,
                color: '#111827',
                marginBottom: '10px',
              }}>
                Color: <span style={{ fontWeight: 400, color: '#4B5563' }}>{selectedColor}</span>
              </div>

              {/* Color Thumbnails */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {product.colors.map((c, idx) => {
                  const thumb = getColorThumbnail(c.name, idx);
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      onClick={() => handleColorChange(c.name)}
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        border: isSelected ? '2.5px solid #000000' : '1px solid #D1D5DB',
                        padding: '1px',
                        backgroundColor: '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.18)' : 'none',
                        position: 'relative',
                      }}
                      title={c.name}
                    >
                      <Image
                        src={thumb}
                        alt={c.name}
                        width={60}
                        height={60}
                        unoptimized
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '4px',
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Option */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
              }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#111827' }}>
                  Size: {selectedSize ? <span style={{ fontWeight: 400, color: '#4B5563' }}>EU {selectedSize}</span> : <span style={{ color: '#DC2626', fontSize: '0.82rem' }}>Required</span>}
                </span>
                <button
                  onClick={() => setActiveTab('sizeguide')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6B7280',
                    fontSize: '0.82rem',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  Size Guide
                </button>
              </div>

              {/* Size Buttons Row */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {currentAvailableSizes.map((s) => {
                  const isSelected = selectedSize === s;
                  const szStock = sizeStockMap[s] ?? 0;
                  const isSzOut = szStock <= 0;
                  const isLow = szStock > 0 && szStock <= 5;

                  return (
                    <button
                      key={s}
                      onClick={() => handleSizeChange(s)}
                      style={{
                        minWidth: '54px',
                        height: '46px',
                        padding: '2px 10px',
                        borderRadius: '6px',
                        border: isSelected
                          ? '2px solid #000000'
                          : isSzOut
                          ? '1px dashed #CBD5E1'
                          : '1px solid #D1D5DB',
                        backgroundColor: isSelected
                          ? '#000000'
                          : isSzOut
                          ? '#F8FAFC'
                          : '#FFFFFF',
                        color: isSelected
                          ? '#FFFFFF'
                          : isSzOut
                          ? '#94A3B8'
                          : '#111827',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1.1,
                      }}
                      title={isSzOut ? `Size ${s} is out of stock in ${selectedColor}` : `Size ${s}: ${szStock} pairs available in ${selectedColor}`}
                    >
                      <span style={{ textDecoration: isSzOut ? 'line-through' : 'none' }}>
                        {s}
                      </span>
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        color: isSelected ? '#A7F3D0' : isSzOut ? '#EF4444' : isLow ? '#D97706' : '#64748B',
                        marginTop: '2px',
                      }}>
                        {isSzOut ? '0 left' : isLow ? `${szStock} left` : `${szStock} left`}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Stock Status Guidance */}
              <div style={{ marginTop: '10px', fontSize: '0.82rem' }}>
                {isSelectedSizeOutOfStock ? (
                  <span style={{ color: '#DC2626', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span>⚠️</span>
                    <span>Size {selectedSize} is currently out of stock in {selectedColor}.</span>
                  </span>
                ) : currentStock <= 5 ? (
                  <span style={{ color: '#D97706', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span>⚡</span>
                    <span>Limited Stock: Only {currentStock} shoes left in Size {selectedSize} ({selectedColor})!</span>
                  </span>
                ) : (
                  <span style={{ color: '#15803D', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={14} color="#15803D" />
                    <span>In Stock ({currentStock} available in Size {selectedSize})</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                Quantity
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: '1px solid #D1D5DB',
                borderRadius: '4px',
                overflow: 'hidden',
                backgroundColor: isSelectedSizeOutOfStock ? '#F1F5F9' : '#FFFFFF',
              }}>
                <button
                  disabled={isSelectedSizeOutOfStock || quantity <= 1}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    width: '38px',
                    height: '38px',
                    border: 'none',
                    background: 'none',
                    cursor: isSelectedSizeOutOfStock || quantity <= 1 ? 'not-allowed' : 'pointer',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: isSelectedSizeOutOfStock || quantity <= 1 ? '#CBD5E1' : '#4B5563',
                  }}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <div style={{
                  width: '46px',
                  textAlign: 'center',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: isSelectedSizeOutOfStock ? '#94A3B8' : '#111827',
                }}>
                  {isSelectedSizeOutOfStock ? 0 : quantity}
                </div>
                <button
                  disabled={isSelectedSizeOutOfStock || (currentStock > 0 && quantity >= currentStock)}
                  onClick={() => setQuantity(Math.min(Math.max(1, currentStock), quantity + 1))}
                  style={{
                    width: '38px',
                    height: '38px',
                    border: 'none',
                    background: 'none',
                    cursor: isSelectedSizeOutOfStock || (currentStock > 0 && quantity >= currentStock) ? 'not-allowed' : 'pointer',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: isSelectedSizeOutOfStock || (currentStock > 0 && quantity >= currentStock) ? '#CBD5E1' : '#4B5563',
                  }}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Selection Guidance Message */}
            {(!selectedSize || showOptionsWarning) && (
              <div style={{
                fontSize: '0.85rem',
                color: showOptionsWarning ? '#DC2626' : '#6B7280',
                marginBottom: '14px',
                fontWeight: showOptionsWarning ? 600 : 400,
              }}>
                Please select options
              </div>
            )}

            {/* Action Buttons: Buy Now & Add to Cart */}
            <div className="product-action-buttons" style={{ display: 'flex', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
              <button
                disabled={isSelectedSizeOutOfStock}
                onClick={handleBuyNow}
                style={{
                  flex: 1,
                  minWidth: '140px',
                  backgroundColor: isSelectedSizeOutOfStock ? '#E2E8F0' : '#000000',
                  color: isSelectedSizeOutOfStock ? '#94A3B8' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '13px 28px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  cursor: isSelectedSizeOutOfStock ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelectedSizeOutOfStock) e.currentTarget.style.backgroundColor = '#27272A';
                }}
                onMouseLeave={(e) => {
                  if (!isSelectedSizeOutOfStock) e.currentTarget.style.backgroundColor = '#000000';
                }}
              >
                {isSelectedSizeOutOfStock ? 'Out of Stock' : 'Buy Now'}
              </button>

              <button
                disabled={isSelectedSizeOutOfStock}
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  minWidth: '160px',
                  backgroundColor: isSelectedSizeOutOfStock ? '#F8FAFC' : '#FFFFFF',
                  color: isSelectedSizeOutOfStock ? '#94A3B8' : '#111827',
                  border: isSelectedSizeOutOfStock ? '1px solid #E2E8F0' : '1px solid #D1D5DB',
                  borderRadius: '4px',
                  padding: '13px 28px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: isSelectedSizeOutOfStock ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelectedSizeOutOfStock) {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                    e.currentTarget.style.borderColor = '#9CA3AF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelectedSizeOutOfStock) {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#D1D5DB';
                  }
                }}
              >
                {isSelectedSizeOutOfStock ? 'Out of Stock' : 'Add to Bag'}
              </button>
            </div>

            {/* Secondary actions: Share */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px', fontSize: '0.85rem', color: '#6B7280' }}>
              <button
                onClick={handleShare}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#6B7280',
                  fontSize: '0.85rem',
                }}
              >
                <Share2 size={15} />
                <span>{copiedLink ? 'Link Copied!' : 'Share Product'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── 4. Tabs Section (Description, Reviews, Size Guide) ─── */}
        <section style={{ marginTop: '56px', borderTop: '1px solid #E5E7EB', paddingTop: '28px' }}>
          {/* Tab Navigation */}
          <div 
            className="product-detail-tabs"
            style={{
              display: 'flex',
              gap: '36px',
              borderBottom: '1px solid #E5E7EB',
              marginBottom: '28px',
            }}
          >
            <button
              onClick={() => setActiveTab('description')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'description' ? '2.5px solid #000000' : '2.5px solid transparent',
                padding: '10px 0 14px 0',
                fontSize: '1.15rem',
                fontWeight: activeTab === 'description' ? 700 : 500,
                color: activeTab === 'description' ? '#000000' : '#6B7280',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Description
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'reviews' ? '2.5px solid #000000' : '2.5px solid transparent',
                padding: '10px 0 14px 0',
                fontSize: '1.15rem',
                fontWeight: activeTab === 'reviews' ? 700 : 500,
                color: activeTab === 'reviews' ? '#000000' : '#6B7280',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Reviews ({reviewsList.length})
            </button>

            <button
              onClick={() => setActiveTab('sizeguide')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'sizeguide' ? '2.5px solid #000000' : '2.5px solid transparent',
                padding: '10px 0 14px 0',
                fontSize: '1.15rem',
                fontWeight: activeTab === 'sizeguide' ? 700 : 500,
                color: activeTab === 'sizeguide' ? '#000000' : '#6B7280',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Size Guide
            </button>
          </div>

          {/* Tab 1: Description Content */}
          {activeTab === 'description' && (
            <div style={{ maxWidth: '880px', lineHeight: 1.7, color: '#374151' }}>
              <div style={{
                backgroundColor: '#FAFAFA',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid #F3F4F6',
                marginBottom: '28px',
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '12px 24px',
                  fontSize: '0.92rem',
                }}>
                  <div><strong style={{ color: '#111827' }}>Color: </strong> Beige, Black, Black and White</div>
                  <div><strong style={{ color: '#111827' }}>Upper Material: </strong> PU Leather + Mesh Material</div>
                  <div><strong style={{ color: '#111827' }}>Outsole Material: </strong> Rubber Foam</div>
                  <div><strong style={{ color: '#111827' }}>Insole Material: </strong> EVA Sole</div>
                  <div><strong style={{ color: '#111827' }}>Toe Shape: </strong> Round Head</div>
                  <div><strong style={{ color: '#111827' }}>Closure Type: </strong> Lace Up (Quick-Tie Dial)</div>
                  <div><strong style={{ color: '#111827' }}>Pattern Type: </strong> Solid Color</div>
                  <div><strong style={{ color: '#111827' }}>Features: </strong> Anti-Slip, Wear-Resistant, Lightweight</div>
                </div>
              </div>

              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginBottom: '10px' }}>
                Engineered for Daily Stride & Modern Aesthetics
              </h4>
              <p style={{ marginBottom: '14px', fontSize: '0.92rem' }}>
                The {product.name} seamlessly pairs high-performance cushioning with futuristic outdoor streetwear design. Featuring a durable PU leather and micro-mesh composite upper, it ensures optimum breathability during warm days while remaining resilient to everyday scuffs.
              </p>
              <p style={{ fontSize: '0.92rem' }}>
                The high-rebound rubber foam outsole provides confident traction across rain-slicked tiles and rugged roads, while the anatomic EVA insole absorbs impact on every step.
              </p>
            </div>
          )}

          {/* Tab 2: Reviews Content */}
          {activeTab === 'reviews' && (
            <div style={{ maxWidth: '880px' }}>
              {/* Rating summary */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                padding: '20px',
                backgroundColor: '#F9FAFB',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                marginBottom: '28px',
                flexWrap: 'wrap',
              }}>
                <div style={{ textAlign: 'center', minWidth: '100px' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>
                    4.9
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', margin: '6px 0' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={16} color="#F59E0B" fill="#F59E0B" />
                    ))}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                    {reviewsList.length} verified ratings
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: '220px', borderLeft: '1px solid #E5E7EB', paddingLeft: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', marginBottom: '4px' }}>
                    <span>5 stars</span>
                    <div style={{ flex: 1, height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '92%', height: '100%', backgroundColor: '#F59E0B' }} />
                    </div>
                    <span>92%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                    <span>4 stars</span>
                    <div style={{ flex: 1, height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '8%', height: '100%', backgroundColor: '#F59E0B' }} />
                    </div>
                    <span>8%</span>
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '36px' }}>
                {reviewsList.map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      borderBottom: '1px solid #F3F4F6',
                      paddingBottom: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '0.92rem', color: '#111827' }}>{rev.author}</strong>
                        {rev.verified && (
                          <span style={{
                            fontSize: '0.72rem',
                            color: '#16A34A',
                            backgroundColor: '#DCFCE7',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 600,
                          }}>
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>{rev.date}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '2px', marginBottom: '6px' }}>
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={14} color="#F59E0B" fill="#F59E0B" />
                      ))}
                    </div>

                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#111827', marginBottom: '4px' }}>
                      {rev.title}
                    </div>
                    <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.5 }}>
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>

              {/* Submit Review Form */}
              <div style={{
                backgroundColor: '#F9FAFB',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
              }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '14px' }}>
                  Write a Review
                </h4>
                <form onSubmit={handleAddReview} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Rating
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => setNewReviewRating(starVal)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px',
                          }}
                        >
                          <Star
                            size={20}
                            color="#F59E0B"
                            fill={starVal <= newReviewRating ? '#F59E0B' : 'none'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mahfuzur Rahman"
                      value={newReviewAuthor}
                      onChange={(e) => setNewReviewAuthor(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '4px',
                        fontSize: '0.88rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                      Your Review
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Share your experience with fit, comfort and quality..."
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '4px',
                        fontSize: '0.88rem',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      alignSelf: 'flex-start',
                      backgroundColor: '#000000',
                      color: '#FFFFFF',
                      padding: '10px 24px',
                      borderRadius: '4px',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                    }}
                  >
                    Submit Review
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Tab 3: Size Guide Content */}
          {activeTab === 'sizeguide' && (
            <div style={{ maxWidth: '880px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
                Men&apos;s Footwear Size Chart
              </h4>

              {/* Sizing Table */}
              <div className="sizing-table-container" style={{ overflowX: 'auto', marginBottom: '28px' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.88rem',
                  textAlign: 'center',
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#000000', color: '#FFFFFF' }}>
                      <th style={{ padding: '12px 14px' }}>EU Size</th>
                      <th style={{ padding: '12px 14px' }}>US Size</th>
                      <th style={{ padding: '12px 14px' }}>UK Size</th>
                      <th style={{ padding: '12px 14px' }}>Foot Length (CM)</th>
                      <th style={{ padding: '12px 14px' }}>Inches</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { eu: '39', us: '6.5', uk: '6.0', cm: '24.5', inch: '9.6' },
                      { eu: '40', us: '7.0', uk: '6.5', cm: '25.0', inch: '9.8' },
                      { eu: '41', us: '8.0', uk: '7.5', cm: '25.5', inch: '10.0' },
                      { eu: '42', us: '8.5', uk: '8.0', cm: '26.0', inch: '10.2' },
                      { eu: '43', us: '9.5', uk: '9.0', cm: '26.5', inch: '10.4' },
                      { eu: '44', us: '10.0', uk: '9.5', cm: '27.0', inch: '10.6' },
                      { eu: '45', us: '11.0', uk: '10.5', cm: '27.5', inch: '10.8' },
                    ].map((row, idx) => (
                      <tr
                        key={row.eu}
                        style={{
                          backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                          borderBottom: '1px solid #E5E7EB',
                        }}
                      >
                        <td style={{ padding: '10px 14px', fontWeight: 700 }}>{row.eu}</td>
                        <td style={{ padding: '10px 14px' }}>{row.us}</td>
                        <td style={{ padding: '10px 14px' }}>{row.uk}</td>
                        <td style={{ padding: '10px 14px' }}>{row.cm} cm</td>
                        <td style={{ padding: '10px 14px' }}>{row.inch}&quot;</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Visual Size Chart Banner from Xenno */}
              <div style={{
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '28px',
              }}>
                <Image
                  src="https://bd-5.edkncdn.net/img/2382x2768/stores/62244cd4d172ea73c7ec033b/editor/1763967733440-7fFZ8xgbmxxxue2_DfYE2/Size Chart_Male.webp"
                  alt="Men Size Guide Chart"
                  width={800}
                  height={930}
                  unoptimized
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>

              {/* Measuring instructions */}
              <div style={{
                backgroundColor: '#F9FAFB',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
              }}>
                <h5 style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '8px', color: '#111827' }}>
                  How to accurately measure your foot:
                </h5>
                <ol style={{ paddingLeft: '20px', fontSize: '0.88rem', lineHeight: 1.6, color: '#4B5563' }}>
                  <li>Place a blank sheet of paper flat on the ground against a wall.</li>
                  <li>Stand upright on the paper with your heel firmly touching the wall.</li>
                  <li>Mark the furthest tip of your longest toe with a pencil held straight.</li>
                  <li>Measure the distance from the edge to the mark in centimeters and match with the table.</li>
                </ol>
              </div>
            </div>
          )}
        </section>

        {/* ─── 5. Related Products Section ─── */}
        {finalRelated.length > 0 && (
          <section style={{ marginTop: '64px', borderTop: '1px solid #E5E7EB', paddingTop: '32px' }}>
            <h3 style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '20px',
            }}>
              Related Products
            </h3>

            <div className="related-products-grid">
              {finalRelated.map((item) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/products/${item.slug || item.id}`)}
                  className="related-product-card"
                  style={{
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    position: 'relative',
                    aspectRatio: '1/1',
                    backgroundColor: '#F8FAFC',
                    overflow: 'hidden',
                  }}>
                    <Image
                      src={item.images?.[0] || product.images?.[0] || '/images/shoe-leather-formal.jpg'}
                      alt={item.name}
                      width={300}
                      height={300}
                      unoptimized
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  </div>
                  <div className="related-product-card-body" style={{ padding: '14px' }}>
                    <div className="related-product-card-brand" style={{ fontSize: '0.72rem', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                      {item.brand}
                    </div>
                    <div className="related-product-card-title" style={{
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      color: '#111827',
                      lineHeight: 1.3,
                      marginBottom: '8px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {item.name}
                    </div>
                    <div className="related-product-card-price" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>
                      BDT {item.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>


      {/* ─── 6b. Mobile Sticky Purchase Bar ─── */}
      <div className="mobile-sticky-bar">
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {product.name}
          </span>
          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#D32F2F' }}>
            BDT {product.price.toLocaleString()}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button
            disabled={isSelectedSizeOutOfStock}
            onClick={handleAddToCart}
            style={{
              backgroundColor: isSelectedSizeOutOfStock ? '#F8FAFC' : '#FFFFFF',
              color: isSelectedSizeOutOfStock ? '#94A3B8' : '#111827',
              border: isSelectedSizeOutOfStock ? '1.5px solid #E2E8F0' : '1.5px solid #D1D5DB',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: isSelectedSizeOutOfStock ? 'not-allowed' : 'pointer',
              opacity: isSelectedSizeOutOfStock ? 0.6 : 1,
            }}
          >
            {isSelectedSizeOutOfStock ? 'Sold Out' : 'Add to Bag'}
          </button>
          <button
            disabled={isSelectedSizeOutOfStock}
            onClick={handleBuyNow}
            style={{
              backgroundColor: isSelectedSizeOutOfStock ? '#94A3B8' : '#000000',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: isSelectedSizeOutOfStock ? 'not-allowed' : 'pointer',
              opacity: isSelectedSizeOutOfStock ? 0.6 : 1,
            }}
          >
            {isSelectedSizeOutOfStock ? 'Sold Out' : 'Buy Now'}
          </button>
        </div>
      </div>

      {/* ─── 7. Global Drawers & Modals ─── */}
      <CartDrawer />
      <WishlistDrawer />
      <CheckoutModal />
      <TrackOrderModal />
      <SizeGuideModal />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast-dot" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── 8. Footer ─── */}
      <Footer />
    </div>
  );
};

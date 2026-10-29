'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  Tag, 
  CheckCircle,
  AlertCircle 
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { FormattedText, stripHtml } from '../Common/FormattedText';

export const CartDrawer: React.FC = () => {
  const router = useRouter();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    freeShippingThreshold,
    freeShippingRemaining,
    freeShippingPercent,
    appliedCoupon,
    discountAmount,
    applyCoupon,
    removeCoupon,
    setIsCheckoutOpen,
    deliveryLocation,
    setDeliveryLocation,
    deliveryFeeInsideDhaka,
    deliveryFeeOutsideDhaka,
    deliveryFee,
  } = useShop();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const isInsideDhaka = deliveryLocation === 'inside_dhaka';
  const finalTotal = Math.max(0, cartSubtotal + deliveryFee - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponError(null);
      setCouponInput('');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    router.push('/checkout');
  };

  return (
    <div className="drawer-backdrop" onClick={() => setIsCartOpen(false)}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#FFFFFF',
          boxShadow: '-8px 0 30px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10000,
          animation: 'drawerSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={22} color="#D32F2F" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
              Your Shopping Bag ({cart.length})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            aria-label="Close Shopping Bag"
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div style={{
          padding: '14px 24px',
          backgroundColor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            color: '#0F172A',
            fontWeight: 700,
          }}>
            <Truck size={15} color="#D32F2F" />
            {freeShippingRemaining === 0 ? (
              <span style={{ color: '#15803D' }}>
                🎉 Congratulations! You have unlocked <strong>FREE Delivery</strong>!
              </span>
            ) : (
              <span>
                Add <strong>Tk {freeShippingRemaining.toLocaleString()}</strong> more for <strong>FREE Delivery</strong> across BD
              </span>
            )}
          </div>
          <div className="shipping-bar-container">
            <div
              className="shipping-bar-fill"
              style={{ width: `${freeShippingPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {cart.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              color: '#64748B',
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#FFEBEE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <ShoppingBag size={38} color="#D32F2F" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                Your Shopping Bag is Empty
              </h3>
              <p style={{ fontSize: '0.875rem', marginBottom: '24px', maxWidth: '280px' }}>
                Explore authentic ZAP footwear, runners, and formal shoes.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn btn-primary"
              >
                Start Shopping Now
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const itemColorway = item.product.colorVariants?.find(
                (cv) => cv.color.toLowerCase() === item.selectedColor.toLowerCase()
              );
              const itemImage = itemColorway?.images?.[0] || item.product.images[0];

              let maxStock = 99;
              if (itemColorway && itemColorway.sizes.length > 0) {
                const szObj = itemColorway.sizes.find((s) => s.size === item.selectedSize);
                if (szObj) maxStock = typeof szObj.stock === 'number' ? szObj.stock : Number(szObj.stock) || 0;
              } else if (item.product.variants && item.product.variants.length > 0) {
                const vObj = item.product.variants.find(
                  (v) => (v.color || '').toLowerCase() === item.selectedColor.toLowerCase() && v.size === item.selectedSize
                );
                if (vObj) maxStock = typeof vObj.stock === 'number' ? vObj.stock : Number(vObj.stock) || 0;
              }

              return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: '14px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid #F1F5F9',
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '10px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Image
                    src={itemImage}
                    alt={`${stripHtml(item.product.name)} - ${item.selectedColor}`}
                    width={72}
                    height={72}
                    unoptimized
                    style={{ width: '90%', height: '90%', objectFit: 'contain' }}
                  />
                </div>

                {/* Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#D32F2F', textTransform: 'uppercase' }}>
                        {item.product.brand}
                      </span>
                      <h4 style={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: '#0F172A',
                        lineHeight: 1.3,
                        marginBottom: '4px',
                      }}>
                        <FormattedText text={item.product.name} />
                      </h4>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Remove item"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94A3B8',
                        padding: '4px',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div style={{
                    fontSize: '0.75rem',
                    color: '#64748B',
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '8px',
                  }}>
                    <span>Size: <strong>EU {item.selectedSize}</strong></span>
                    <span>Color: <strong>{item.selectedColor}</strong></span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 'auto',
                  }}>
                    {/* Stepper */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      overflow: 'hidden',
                    }}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{
                          width: '26px',
                          height: '26px',
                          border: 'none',
                          background: '#F8FAFC',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                        }}
                      >
                        -
                      </button>
                      <span style={{
                        width: '30px',
                        textAlign: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                      }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          if (item.quantity < maxStock) {
                            updateQuantity(item.id, item.quantity + 1);
                          }
                        }}
                        disabled={item.quantity >= maxStock}
                        style={{
                          width: '26px',
                          height: '26px',
                          border: 'none',
                          background: '#F8FAFC',
                          cursor: item.quantity >= maxStock ? 'not-allowed' : 'pointer',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          opacity: item.quantity >= maxStock ? 0.4 : 1,
                        }}
                        title={item.quantity >= maxStock ? `Maximum stock reached (${maxStock} pairs available)` : undefined}
                      >
                        +
                      </button>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.925rem', fontWeight: 800, color: '#0F172A' }}>
                        Tk {(item.product.price * item.quantity).toLocaleString()}
                      </div>
                      {item.quantity > 1 && (
                        <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                          Tk {item.product.price.toLocaleString()} each
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        </div>

        {/* Footer Summary (if items present) */}
        {cart.length > 0 && (
          <div style={{
            padding: '20px 24px',
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
          }}>
            {/* Promo Code Box */}
            <div style={{ marginBottom: '16px' }}>
              {appliedCoupon ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  padding: '8px 12px',
                  borderRadius: '8px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={15} color="#059669" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#065F46' }}>
                      Promo applied: {appliedCoupon} (-Tk {discountAmount.toLocaleString()})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#DC2626',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Tag size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. ZAP15)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px 8px 32px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.8rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-secondary btn-sm"
                    style={{ fontWeight: 700 }}
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#DC2626',
                  fontSize: '0.72rem',
                  marginTop: '4px',
                }}>
                  <AlertCircle size={12} />
                  <span>{couponError}</span>
                </div>
              )}
            </div>

            {/* Delivery Destination Selector */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              padding: '8px 10px',
              marginBottom: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                  Delivery Destination:
                </span>
                <span style={{ fontSize: '0.72rem', color: '#D32F2F', fontWeight: 600 }}>
                  {isInsideDhaka ? `Inside Dhaka (৳${deliveryFeeInsideDhaka})` : `Outside Dhaka (৳${deliveryFeeOutsideDhaka})`}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setDeliveryLocation('inside_dhaka')}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: isInsideDhaka ? '1.5px solid #D32F2F' : '1px solid #E2E8F0',
                    backgroundColor: isInsideDhaka ? '#FEF2F2' : '#F8FAFC',
                    color: isInsideDhaka ? '#D32F2F' : '#64748B',
                    fontSize: '0.75rem',
                    fontWeight: isInsideDhaka ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Inside Dhaka (৳{deliveryFeeInsideDhaka})
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryLocation('outside_dhaka')}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: !isInsideDhaka ? '1.5px solid #D32F2F' : '1px solid #E2E8F0',
                    backgroundColor: !isInsideDhaka ? '#FEF2F2' : '#F8FAFC',
                    color: !isInsideDhaka ? '#D32F2F' : '#64748B',
                    fontSize: '0.75rem',
                    fontWeight: !isInsideDhaka ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Outside Dhaka (৳{deliveryFeeOutsideDhaka})
                </button>
              </div>
            </div>

            {/* Price Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748B' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>Tk {cartSubtotal.toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748B' }}>
                <span>Delivery ({isInsideDhaka ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                <span>
                  {deliveryFee === 0 ? (
                    <strong style={{ color: '#15803D' }}>FREE</strong>
                  ) : (
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>Tk {deliveryFee}</span>
                  )}
                </span>
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#15803D' }}>
                  <span>Promo Discount</span>
                  <span style={{ fontWeight: 700 }}>-Tk {discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.15rem',
                fontWeight: 900,
                color: '#0F172A',
                borderTop: '1px solid #E2E8F0',
                paddingTop: '8px',
                marginTop: '4px',
              }}>
                <span>Total Amount</span>
                <span>Tk {finalTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={handleProceedToCheckout}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '0.95rem',
              }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={17} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

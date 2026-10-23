'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Truck, 
  Lock, 
  ArrowLeft, 
  ShoppingBag, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Tag, 
  ChevronRight,
  PackageCheck,
  RotateCcw,
  Clock,
  Sparkles
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Order, PaymentMethod } from '../../types/admin';
import { AnnouncementBar } from '../../components/Header/AnnouncementBar';
import { Navbar } from '../../components/Header/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { CartDrawer } from '../../components/Modals/CartDrawer';
import { WishlistDrawer } from '../../components/Modals/WishlistDrawer';
import { TrackOrderModal } from '../../components/Modals/TrackOrderModal';
import { SizeGuideModal } from '../../components/Modals/SizeGuideModal';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    cartSubtotal,
    cartCount,
    freeShippingThreshold,
    freeShippingRemaining,
    freeShippingPercent,
    appliedCoupon,
    discountAmount,
    applyCoupon,
    removeCoupon,
    updateQuantity,
    removeFromCart,
    clearCart,
    showToast,
    addOrder,
    setIsTrackOrderOpen,
    setIsCartOpen,
    toastMessage,
  } = useShop();

  // Close any open cart drawer when arriving at checkout page
  React.useEffect(() => {
    setIsCartOpen(false);
  }, [setIsCartOpen]);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [division, setDivision] = useState('Dhaka');
  const [postalCode, setPostalCode] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  
  // Coupon input state
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  // Submission & Confirmation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const deliveryFee = cartSubtotal >= freeShippingThreshold || cart.length === 0 ? 0 : 100;
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

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('Your shopping bag is empty.');
      return;
    }

    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      showToast('Please fill in your name, mobile number and address.');
      return;
    }

    setIsSubmitting(true);

    const generatedOrderNumber = `ZAP-BD-${Math.floor(100000 + Math.random() * 900000)}`;
    const trackingCode = `SF-BD-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: generatedOrderNumber,
      customerName: fullName.trim(),
      customerEmail: email.trim() || 'customer@zapbd.com',
      customerPhone: phone.trim(),
      shippingAddress: address.trim(),
      city: division === 'Dhaka' ? 'Dhaka' : division,
      division: division,
      items: cart.map((item) => ({
        id: `item-${Date.now()}-${item.id}`,
        productId: item.product.id,
        product: item.product,
        size: item.selectedSize,
        color: item.selectedColor,
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalPrice: item.product.price * item.quantity,
      })),
      subtotal: cartSubtotal,
      shippingCost: deliveryFee,
      discount: discountAmount,
      total: finalTotal,
      status: 'CONFIRMED',
      paymentStatus: paymentMethod === 'bkash' || paymentMethod === 'card' ? 'PAID' : 'UNPAID',
      paymentMethod: paymentMethod,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      courierName: 'Steadfast Express',
      trackingNumber: trackingCode,
      estimatedDelivery: division === 'Dhaka' ? '24 - 48 Hours' : '2 - 4 Business Days',
      couponCode: appliedCoupon || undefined,
      notes: orderNotes ? `${orderNotes} | Customer: ${fullName.trim()}` : `Order placed via ZAP Online Store with ${paymentMethod.toUpperCase()}`,
    };

    setTimeout(() => {
      addOrder(newOrder);
      setConfirmedOrder(newOrder);
      clearCart();
      setIsSubmitting(false);
      showToast(`Order ${generatedOrderNumber} placed successfully!`);
    }, 400);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC' }}>
      <AnnouncementBar />
      <Navbar />

      {/* Main Container */}
      <main style={{ flex: 1, padding: '24px 0 60px' }}>
        <div className="container">
          
          {/* Breadcrumb Navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            color: '#64748B',
            marginBottom: '20px',
          }}>
            <Link href="/" style={{ color: '#0F172A', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
            <ChevronRight size={14} />
            <span style={{ color: '#D32F2F', fontWeight: 700 }}>Checkout</span>
          </div>

          {/* If Order Just Placed: Success Screen */}
          {confirmedOrder ? (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              padding: '48px 24px',
              maxWidth: '820px',
              margin: '0 auto',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
              textAlign: 'center',
            }}>
              <div style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                backgroundColor: '#DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <CheckCircle2 size={48} color="#15803D" />
              </div>

              <div className="zap-badge" style={{ marginBottom: '12px', backgroundColor: '#15803D', color: '#FFFFFF' }}>
                <PackageCheck size={14} />
                <span>ORDER CONFIRMED</span>
              </div>

              <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0F172A', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                Thank You for Your Order!
              </h1>

              <p style={{ color: '#64748B', fontSize: '1rem', maxWidth: '580px', margin: '0 auto 28px' }}>
                We have received your order and dispatched details to our central Tongi fulfillment center. An SMS confirmation will be sent shortly.
              </p>

              {/* Order Receipt Box */}
              <div style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '28px',
                maxWidth: '600px',
                margin: '0 auto 32px',
                textAlign: 'left',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid #E2E8F0', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.875rem', color: '#64748B' }}>Order Number</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#D32F2F', letterSpacing: '0.04em' }}>
                    {confirmedOrder.orderNumber}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px', fontSize: '0.875rem' }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Recipient</span>
                    <strong style={{ color: '#0F172A' }}>{confirmedOrder.customerName}</strong>
                    <div style={{ color: '#64748B', fontSize: '0.8rem' }}>{confirmedOrder.customerPhone}</div>
                  </div>

                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Payment Method</span>
                    <strong style={{ color: '#0F172A' }}>
                      {confirmedOrder.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : confirmedOrder.paymentMethod === 'bkash' ? 'bKash / Nagad' : 'Card'}
                    </strong>
                    <div style={{ color: '#15803D', fontSize: '0.8rem', fontWeight: 700 }}>
                      {confirmedOrder.paymentStatus === 'PAID' ? '✓ Paid' : 'Due on Doorstep Delivery'}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '16px', fontSize: '0.875rem' }}>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Delivery Address</span>
                  <div style={{ color: '#0F172A', fontWeight: 600 }}>{confirmedOrder.shippingAddress}, {confirmedOrder.city}, Bangladesh</div>
                  <div style={{ color: '#64748B', fontSize: '0.8rem', marginTop: '3px' }}>
                    Estimated Arrival: <strong>{confirmedOrder.estimatedDelivery}</strong> via Steadfast Express
                  </div>
                </div>

                {/* Items Purchased */}
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px', marginBottom: '14px' }}>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
                    Purchased Footwear ({confirmedOrder.items.length})
                  </span>
                  {confirmedOrder.items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.85rem' }}>
                      <span style={{ color: '#0F172A' }}>
                        {item.product.name} <span style={{ color: '#64748B' }}>({item.color}, Size {item.size}) x {item.quantity}</span>
                      </span>
                      <strong style={{ color: '#0F172A' }}>Tk {item.totalPrice.toLocaleString()}</strong>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  borderTop: '2px solid #E2E8F0',
                  paddingTop: '12px',
                  fontSize: '1.15rem',
                  fontWeight: 900,
                  color: '#0F172A',
                }}>
                  <span>Total Amount:</span>
                  <span style={{ color: '#D32F2F', fontSize: '1.35rem' }}>Tk {confirmedOrder.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  href="/"
                  className="btn btn-primary"
                  style={{ padding: '14px 32px', fontSize: '0.95rem' }}
                >
                  <ShoppingBag size={18} />
                  <span>Continue Exploring Footwear</span>
                </Link>

                <button
                  onClick={() => setIsTrackOrderOpen(true)}
                  className="btn btn-secondary"
                  style={{ padding: '14px 28px', fontSize: '0.95rem' }}
                >
                  <Truck size={18} />
                  <span>Track Your Order</span>
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            /* Empty Cart Screen */
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              padding: '60px 24px',
              maxWidth: '640px',
              margin: '30px auto',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                backgroundColor: '#F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <ShoppingBag size={38} color="#94A3B8" />
              </div>

              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
                Your Shopping Bag is Empty
              </h2>

              <p style={{ color: '#64748B', fontSize: '0.95rem', maxWidth: '420px', margin: '0 auto 24px' }}>
                You have not selected any footwear yet. Explore our mastercrafted collection to find your favorite pair.
              </p>

              <Link href="/" className="btn btn-primary" style={{ padding: '13px 30px' }}>
                <ShoppingBag size={18} />
                <span>Browse Footwear Collection</span>
              </Link>
            </div>
          ) : (
            /* Active Checkout Layout */
            <div>
              {/* Header Headline */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <div className="zap-badge" style={{ backgroundColor: '#000000', color: '#FFFFFF' }}>
                    <Lock size={12} />
                    <span>SECURE 256-BIT ENCRYPTED CHECKOUT</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={15} /> 100% Genuine Footwear Guarantee
                  </span>
                </div>

                <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  Complete Your Order
                </h1>
                <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                  Doorstep delivery across all 64 districts with Cash on Delivery & 7-day size exchange guarantee.
                </p>
              </div>

              {/* 2-Column Responsive Checkout Grid */}
              <div className="checkout-layout-grid">
                
                {/* ── LEFT COLUMN: Shipping & Payment Form ── */}
                <div>
                  <form onSubmit={handleSubmitOrder}>
                    
                    {/* Section 1: Customer Contact Details */}
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      padding: '24px',
                      marginBottom: '20px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '18px',
                        paddingBottom: '12px',
                        borderBottom: '1px solid #F1F5F9',
                      }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: '#0F172A',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                        }}>
                          1
                        </div>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                          Customer Information
                        </h2>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={labelStyle}>
                            <User size={13} style={{ display: 'inline', marginRight: '4px' }} />
                            FULL NAME <span style={{ color: '#D32F2F' }}>*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Mahfuz Rahman"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            style={inputStyle}
                          />
                        </div>

                        <div>
                          <label style={labelStyle}>
                            <Phone size={13} style={{ display: 'inline', marginRight: '4px' }} />
                            MOBILE NUMBER (+880) <span style={{ color: '#D32F2F' }}>*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="017XXXXXXXX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            style={inputStyle}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={labelStyle}>
                          <Mail size={13} style={{ display: 'inline', marginRight: '4px' }} />
                          EMAIL ADDRESS (FOR RECEIPT & TRACKING UPDATES)
                        </label>
                        <input
                          type="email"
                          placeholder="shopper@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    {/* Section 2: Delivery & Shipping Address */}
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      padding: '24px',
                      marginBottom: '20px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '18px',
                        paddingBottom: '12px',
                        borderBottom: '1px solid #F1F5F9',
                      }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: '#0F172A',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                        }}>
                          2
                        </div>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                          Shipping & Delivery Address
                        </h2>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>
                          <MapPin size={13} style={{ display: 'inline', marginRight: '4px' }} />
                          FULL STREET ADDRESS / HOUSE & ROAD <span style={{ color: '#D32F2F' }}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="House #12, Road #4, Sector 7, Uttara / Banani"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          style={inputStyle}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={labelStyle}>DIVISION / REGION <span style={{ color: '#D32F2F' }}>*</span></label>
                          <select
                            value={division}
                            onChange={(e) => setDivision(e.target.value)}
                            style={inputStyle}
                          >
                            <option value="Dhaka">Dhaka (24-48h Express Delivery)</option>
                            <option value="Chittagong">Chittagong (2-3 Business Days)</option>
                            <option value="Sylhet">Sylhet (2-3 Business Days)</option>
                            <option value="Rajshahi">Rajshahi (3-4 Business Days)</option>
                            <option value="Khulna">Khulna (3-4 Business Days)</option>
                            <option value="Barisal">Barisal (3-4 Business Days)</option>
                            <option value="Rangpur">Rangpur (3-4 Business Days)</option>
                            <option value="Mymensingh">Mymensingh (2-3 Business Days)</option>
                          </select>
                        </div>

                        <div>
                          <label style={labelStyle}>POSTAL CODE (OPTIONAL)</label>
                          <input
                            type="text"
                            placeholder="e.g. 1230"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            style={inputStyle}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={labelStyle}>SPECIAL DELIVERY INSTRUCTIONS</label>
                        <textarea
                          rows={2}
                          placeholder="Call before arrival, deliver to reception, etc."
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          style={{
                            ...inputStyle,
                            resize: 'vertical',
                            fontFamily: 'inherit',
                          }}
                        />
                      </div>
                    </div>

                    {/* Section 3: Payment Method Selection */}
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      padding: '24px',
                      marginBottom: '24px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '18px',
                        paddingBottom: '12px',
                        borderBottom: '1px solid #F1F5F9',
                      }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: '#0F172A',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                        }}>
                          3
                        </div>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                          Select Payment Method
                        </h2>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        
                        {/* COD Option */}
                        <label style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '14px',
                          padding: '16px',
                          borderRadius: '12px',
                          border: paymentMethod === 'cod' ? '2px solid #D32F2F' : '1.5px solid #E2E8F0',
                          backgroundColor: paymentMethod === 'cod' ? '#FEF2F2' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}>
                          <input
                            type="radio"
                            name="checkoutPayment"
                            checked={paymentMethod === 'cod'}
                            onChange={() => setPaymentMethod('cod')}
                            style={{ marginTop: '4px', accentColor: '#D32F2F' }}
                          />
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: paymentMethod === 'cod' ? '#FEE2E2' : '#F1F5F9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <Banknote size={22} color="#D32F2F" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>Cash on Delivery (COD)</strong>
                              <span style={{
                                backgroundColor: '#DCFCE7',
                                color: '#15803D',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: '4px',
                              }}>
                                MOST POPULAR
                              </span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0' }}>
                              Pay cash in hand when your shoes are delivered to your doorstep. You can inspect the package before payment.
                            </p>
                          </div>
                        </label>

                        {/* bKash Option */}
                        <label style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '14px',
                          padding: '16px',
                          borderRadius: '12px',
                          border: paymentMethod === 'bkash' ? '2px solid #D32F2F' : '1.5px solid #E2E8F0',
                          backgroundColor: paymentMethod === 'bkash' ? '#FEF2F2' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}>
                          <input
                            type="radio"
                            name="checkoutPayment"
                            checked={paymentMethod === 'bkash'}
                            onChange={() => setPaymentMethod('bkash')}
                            style={{ marginTop: '4px', accentColor: '#D32F2F' }}
                          />
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: paymentMethod === 'bkash' ? '#FEE2E2' : '#F1F5F9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <Smartphone size={22} color="#E11D48" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>bKash / Nagad Mobile Banking</strong>
                              <span style={{
                                backgroundColor: '#EFF6FF',
                                color: '#1D4ED8',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: '4px',
                              }}>
                                INSTANT CONFIRMATION
                              </span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0' }}>
                              Seamless payment via bKash / Nagad wallet or scan QR code on dispatch.
                            </p>
                          </div>
                        </label>

                        {/* Card Option */}
                        <label style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '14px',
                          padding: '16px',
                          borderRadius: '12px',
                          border: paymentMethod === 'card' ? '2px solid #D32F2F' : '1.5px solid #E2E8F0',
                          backgroundColor: paymentMethod === 'card' ? '#FEF2F2' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}>
                          <input
                            type="radio"
                            name="checkoutPayment"
                            checked={paymentMethod === 'card'}
                            onChange={() => setPaymentMethod('card')}
                            style={{ marginTop: '4px', accentColor: '#D32F2F' }}
                          />
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: paymentMethod === 'card' ? '#FEE2E2' : '#F1F5F9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <CreditCard size={22} color="#2563EB" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>Credit / Debit Card (Visa / MasterCard / Amex)</strong>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0' }}>
                              Secured SSLCommerz gateway with 3D Secure bank OTP validation.
                            </p>
                          </div>
                        </label>

                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        padding: '16px 28px',
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        letterSpacing: '0.02em',
                        borderRadius: '10px',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        opacity: isSubmitting ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                      }}
                    >
                      <Lock size={18} />
                      <span>{isSubmitting ? 'Processing Order...' : `Confirm Order (Tk ${finalTotal.toLocaleString()})`}</span>
                    </button>

                    <p style={{ fontSize: '0.75rem', color: '#64748B', textAlign: 'center', marginTop: '12px' }}>
                      By clicking &ldquo;Confirm Order&rdquo;, you agree to ZAP&apos;s Terms of Service and 7-day doorstep shoe exchange policy.
                    </p>
                  </form>
                </div>

                {/* ── RIGHT COLUMN: Order Summary & Cart Items ── */}
                <div style={{ position: 'sticky', top: '24px' }}>
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    padding: '24px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                  }}>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingBottom: '14px',
                      borderBottom: '1px solid #F1F5F9',
                      marginBottom: '16px',
                    }}>
                      <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        Order Summary ({cartCount} {cartCount === 1 ? 'item' : 'items'})
                      </h2>
                      <Link href="/" style={{ fontSize: '0.8rem', color: '#D32F2F', fontWeight: 700, textDecoration: 'none' }}>
                        + Add More
                      </Link>
                    </div>

                    {/* Free shipping bar indicator */}
                    <div style={{
                      backgroundColor: '#F8FAFC',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      border: '1px solid #E2E8F0',
                      marginBottom: '18px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#0F172A', fontWeight: 600, marginBottom: '6px' }}>
                        <Truck size={16} color="#D32F2F" />
                        {freeShippingRemaining > 0 ? (
                          <span>Add <strong>Tk {freeShippingRemaining.toLocaleString()}</strong> more for FREE shipping</span>
                        ) : (
                          <span style={{ color: '#15803D', fontWeight: 700 }}>You have unlocked FREE Nationwide Delivery!</span>
                        )}
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${freeShippingPercent}%`,
                          height: '100%',
                          backgroundColor: freeShippingPercent === 100 ? '#15803D' : '#D32F2F',
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                    </div>

                    {/* Items List */}
                    <div style={{
                      maxHeight: '340px',
                      overflowY: 'auto',
                      paddingRight: '4px',
                      marginBottom: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                    }}>
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            gap: '12px',
                            paddingBottom: '14px',
                            borderBottom: '1px solid #F1F5F9',
                            alignItems: 'center',
                          }}
                        >
                          {/* Image */}
                          <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '10px',
                            backgroundColor: '#F8FAFC',
                            position: 'relative',
                            overflow: 'hidden',
                            flexShrink: 0,
                            border: '1px solid #E2E8F0',
                          }}>
                            {(() => {
                              const itemColorway = item.product.colorVariants?.find(
                                (cv) => cv.color.toLowerCase() === item.selectedColor.toLowerCase()
                              );
                              const itemImage = itemColorway?.images?.[0] || item.product.images[0];
                              return (
                                <Image
                                  src={itemImage}
                                  alt={`${item.product.name} - ${item.selectedColor}`}
                                  fill
                                  unoptimized
                                  style={{ objectFit: 'contain', padding: '4px' }}
                                />
                              );
                            })()}
                          </div>

                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: '0.875rem',
                              fontWeight: 700,
                              color: '#0F172A',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}>
                              {item.product.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', gap: '8px', margin: '2px 0 6px' }}>
                              <span>Size: <strong style={{ color: '#0F172A' }}>{item.selectedSize}</strong></span>
                              <span>•</span>
                              <span>Color: <strong style={{ color: '#0F172A' }}>{item.selectedColor}</strong></span>
                            </div>

                            {/* Quantity Controls */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                border: '1px solid #E2E8F0',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                backgroundColor: '#FFFFFF',
                              }}>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                  style={{
                                    width: '26px',
                                    height: '26px',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#475569',
                                  }}
                                  aria-label="Decrease quantity"
                                >
                                  <Minus size={12} />
                                </button>
                                <span style={{ width: '28px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  style={{
                                    width: '26px',
                                    height: '26px',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#475569',
                                  }}
                                  aria-label="Increase quantity"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeFromCart(item.id)}
                                style={{
                                  border: 'none',
                                  background: 'none',
                                  color: '#94A3B8',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                                aria-label="Remove item"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          {/* Item Price */}
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                              Tk {(item.product.price * item.quantity).toLocaleString()}
                            </div>
                            {item.quantity > 1 && (
                              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                                Tk {item.product.price.toLocaleString()} each
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Promo Code Input */}
                    <div style={{ marginBottom: '18px' }}>
                      {appliedCoupon ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: '#DCFCE7',
                          border: '1px solid #BBF7D0',
                          borderRadius: '8px',
                          padding: '10px 14px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Tag size={15} color="#15803D" />
                            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#15803D' }}>
                              Coupon &ldquo;{appliedCoupon}&rdquo; Applied (-Tk {discountAmount.toLocaleString()})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={removeCoupon}
                            style={{
                              border: 'none',
                              background: 'none',
                              color: '#B91C1C',
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
                          <input
                            type="text"
                            placeholder="Discount code (e.g. ZAP10)"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            style={{
                              ...inputStyle,
                              flex: 1,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              fontSize: '0.8rem',
                            }}
                          />
                          <button
                            type="submit"
                            className="btn btn-secondary"
                            style={{
                              padding: '8px 18px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            Apply
                          </button>
                        </form>
                      )}
                      {couponError && (
                        <div style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '6px' }}>
                          {couponError}
                        </div>
                      )}
                    </div>

                    {/* Cost Breakdown */}
                    <div style={{
                      borderTop: '1px solid #E2E8F0',
                      paddingTop: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      fontSize: '0.875rem',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                        <span>Subtotal:</span>
                        <strong style={{ color: '#0F172A' }}>Tk {cartSubtotal.toLocaleString()}</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                        <span>Nationwide Delivery:</span>
                        <span>
                          {deliveryFee === 0 ? (
                            <strong style={{ color: '#15803D' }}>FREE</strong>
                          ) : (
                            <strong style={{ color: '#0F172A' }}>Tk {deliveryFee}</strong>
                          )}
                        </span>
                      </div>

                      {discountAmount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803D' }}>
                          <span>Discount Applied:</span>
                          <strong>-Tk {discountAmount.toLocaleString()}</strong>
                        </div>
                      )}

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        borderTop: '1.5px solid #E2E8F0',
                        paddingTop: '12px',
                        marginTop: '4px',
                        fontSize: '1.15rem',
                        fontWeight: 900,
                        color: '#0F172A',
                      }}>
                        <span>Total Payable:</span>
                        <span style={{ color: '#D32F2F', fontSize: '1.4rem' }}>
                          Tk {finalTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Trust Assurances */}
                    <div style={{
                      marginTop: '20px',
                      paddingTop: '16px',
                      borderTop: '1px solid #F1F5F9',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#475569' }}>
                        <RotateCcw size={16} color="#D32F2F" />
                        <span><strong>7-Day Size Exchange:</strong> Free replacement if size doesn&apos;t fit</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#475569' }}>
                        <ShieldCheck size={16} color="#15803D" />
                        <span><strong>100% Original:</strong> Authentic leather & certified performance</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#475569' }}>
                        <Clock size={16} color="#2563EB" />
                        <span><strong>Fast Dispatch:</strong> Sent within 24h from Tongi central warehouse</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />

      {/* Global Drawers & Modals */}
      <CartDrawer />
      <WishlistDrawer />
      <TrackOrderModal />
      <SizeGuideModal />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast-dot" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#334155',
  display: 'block',
  marginBottom: '6px',
  letterSpacing: '0.04em',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '8px',
  border: '1.5px solid #CBD5E1',
  backgroundColor: '#FFFFFF',
  fontSize: '0.9rem',
  color: '#0F172A',
  outline: 'none',
  transition: 'border-color 0.15s ease',
};

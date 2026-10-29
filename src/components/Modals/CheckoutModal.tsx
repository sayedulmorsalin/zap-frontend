'use client';

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  MapPin 
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Order } from '../../types/admin';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    freeShippingThreshold,
    appliedCoupon,
    discountAmount,
    clearCart,
    showToast,
    addOrder,
    deliveryLocation,
    setDeliveryLocation,
    deliveryFeeInsideDhaka,
    deliveryFeeOutsideDhaka,
    storeSettings,
  } = useShop();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [division, setDivision] = useState(deliveryLocation === 'outside_dhaka' ? 'Chittagong' : 'Dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'card'>('cod');
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  if (!isCheckoutOpen) return null;

  const isInsideDhaka = division === 'Dhaka' || deliveryLocation === 'inside_dhaka';
  const baseDeliveryFee = isInsideDhaka ? deliveryFeeInsideDhaka : deliveryFeeOutsideDhaka;
  const deliveryFee = cartSubtotal >= freeShippingThreshold || cart.length === 0 ? 0 : baseDeliveryFee;
  const finalTotal = Math.max(0, cartSubtotal + deliveryFee - discountAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const generatedOrder = `ZAP-BD-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderNumber(generatedOrder);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: generatedOrder,
      customerName: fullName || 'Valued Shopper',
      customerEmail: 'customer@zapbd.com',
      customerPhone: phone || '+880 1700 000000',
      shippingAddress: address || 'Metropolitan Dhaka',
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
      paymentMethod,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      courierName: 'Steadfast Express',
      trackingNumber: `SF-BD-${Math.floor(1000000 + Math.random() * 9000000)}`,
      estimatedDelivery: isInsideDhaka ? '24 - 48 Hours' : '2 - 4 Business Days',
      notes: `Order placed online via ZAP Storefront with ${paymentMethod.toUpperCase()}`,
    };

    addOrder(newOrder);
    setIsSuccess(true);
    clearCart();
    showToast(`Order ${generatedOrder} confirmed! Added to order processing.`);
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setIsSuccess(false);
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div
        className="animate-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          maxWidth: '720px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          padding: '30px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        <button
          onClick={handleClose}
          aria-label="Close Checkout"
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
            zIndex: 10,
          }}
        >
          <X size={18} />
        </button>

        {isSuccess ? (
          /* Success Screen */
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              backgroundColor: '#DCFCE7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <CheckCircle2 size={44} color="#15803D" />
            </div>

            <div className="zap-badge" style={{ marginBottom: '12px' }}>
              <span>ORDER CONFIRMED</span>
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
              Thank You for Your Order!
            </h2>

            <p style={{ color: '#64748B', fontSize: '0.95rem', marginBottom: '24px' }}>
              Your order has been placed successfully and sent to our {storeSettings?.centralWarehouse ? storeSettings.centralWarehouse.split(',')[0] : 'central fulfillment hub'} for dispatch.
            </p>

            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '20px',
              maxWidth: '440px',
              margin: '0 auto 28px',
              textAlign: 'left',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748B' }}>Order Number:</span>
                <strong style={{ color: '#D32F2F' }}>{orderNumber}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748B' }}>Customer Name:</span>
                <strong style={{ color: '#0F172A' }}>{fullName || 'Valued Customer'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748B' }}>Delivery City:</span>
                <strong style={{ color: '#0F172A' }}>{division}, Bangladesh</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748B' }}>Payment Mode:</span>
                <strong style={{ color: '#0F172A' }}>
                  {paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : paymentMethod === 'bkash' ? 'bKash / Nagad' : 'Card'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', borderTop: '1px solid #E2E8F0', paddingTop: '8px', marginTop: '4px' }}>
                <span style={{ fontWeight: 800, color: '#0F172A' }}>Total Payable:</span>
                <strong style={{ color: '#D32F2F' }}>Tk {finalTotal.toLocaleString()}</strong>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '24px' }}>
              An SMS with order details and tracking link has been sent to <strong>{phone || 'your mobile'}</strong>.
            </p>

            <button
              onClick={handleClose}
              className="btn btn-primary"
              style={{ padding: '12px 30px' }}
            >
              Continue Exploring Footwear
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <div>
            <div style={{ marginBottom: '24px' }}>
              <div className="zap-badge" style={{ marginBottom: '8px' }}>
                <span>SECURE CHECKOUT</span>
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A' }}>
                Fast Shipping & Payment
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
                Fast delivery across all 64 districts in Bangladesh with 7-day store exchange guarantee.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                {/* Contact & Address Section */}
                <div style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '20px',
                }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={18} color="#D32F2F" />
                    <span>Delivery Address</span>
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={labelStyle}>FULL NAME *</label>
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
                      <label style={labelStyle}>MOBILE NUMBER (+880) *</label>
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

                  <div style={{ marginBottom: '14px' }}>
                    <label style={labelStyle}>STREET ADDRESS / HOUSE & ROAD *</label>
                    <input
                      type="text"
                      required
                      placeholder="House #12, Road #4, Block C, Banani"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={labelStyle}>DIVISION / REGION *</label>
                      <select
                        value={division}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDivision(val);
                          setDeliveryLocation(val === 'Dhaka' ? 'inside_dhaka' : 'outside_dhaka');
                        }}
                        style={inputStyle}
                      >
                        <option value="Dhaka">Dhaka (Inside Dhaka • ৳{deliveryFeeInsideDhaka})</option>
                        <option value="Chittagong">Chittagong (Outside Dhaka • ৳{deliveryFeeOutsideDhaka})</option>
                        <option value="Sylhet">Sylhet (Outside Dhaka • ৳{deliveryFeeOutsideDhaka})</option>
                        <option value="Rajshahi">Rajshahi (Outside Dhaka • ৳{deliveryFeeOutsideDhaka})</option>
                        <option value="Khulna">Khulna (Outside Dhaka • ৳{deliveryFeeOutsideDhaka})</option>
                        <option value="Barisal">Barisal (Outside Dhaka • ৳{deliveryFeeOutsideDhaka})</option>
                        <option value="Rangpur">Rangpur (Outside Dhaka • ৳{deliveryFeeOutsideDhaka})</option>
                        <option value="Mymensingh">Mymensingh (Outside Dhaka • ৳{deliveryFeeOutsideDhaka})</option>
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle}>POSTAL CODE</label>
                      <input
                        type="text"
                        placeholder="1213"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '20px',
                }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CreditCard size={18} color="#D32F2F" />
                    <span>Select Payment Option</span>
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* COD Option */}
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: paymentMethod === 'cod' ? '2px solid #D32F2F' : '1px solid #CBD5E1',
                      backgroundColor: paymentMethod === 'cod' ? '#FFEBEE' : '#FFFFFF',
                      cursor: 'pointer',
                    }}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                      />
                      <Banknote size={20} color="#D32F2F" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
                          Cash on Delivery (COD)
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          Inspect the footwear upon doorstep arrival before paying cash.
                        </div>
                      </div>
                    </label>

                    {/* bKash Option */}
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: paymentMethod === 'bkash' ? '2px solid #D32F2F' : '1px solid #CBD5E1',
                      backgroundColor: paymentMethod === 'bkash' ? '#FFEBEE' : '#FFFFFF',
                      cursor: 'pointer',
                    }}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'bkash'}
                        onChange={() => setPaymentMethod('bkash')}
                      />
                      <Smartphone size={20} color="#E11D48" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
                          bKash / Nagad Mobile Banking
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          Seamless QR payment with instant transaction confirmation.
                        </div>
                      </div>
                    </label>

                    {/* Card Option */}
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: paymentMethod === 'card' ? '2px solid #D32F2F' : '1px solid #CBD5E1',
                      backgroundColor: paymentMethod === 'card' ? '#FFEBEE' : '#FFFFFF',
                      cursor: 'pointer',
                    }}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                      />
                      <CreditCard size={20} color="#2563EB" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
                          Credit / Debit Card (Visa / Mastercard / Amex)
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          Secure SSLCommerz payment gateway.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Summary Table */}
                <div style={{
                  padding: '16px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ color: '#64748B' }}>Items ({cart.length}):</span>
                    <span style={{ fontWeight: 700 }}>Tk {cartSubtotal.toLocaleString()}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ color: '#64748B' }}>Delivery ({isInsideDhaka ? 'Inside Dhaka' : 'Outside Dhaka'}):</span>
                    <span>{deliveryFee === 0 ? <strong style={{ color: '#15803D' }}>FREE</strong> : `Tk ${deliveryFee}`}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', color: '#15803D' }}>
                      <span>Discount ({appliedCoupon}):</span>
                      <span style={{ fontWeight: 700 }}>-Tk {discountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    borderTop: '1.5px solid #E2E8F0',
                    paddingTop: '10px',
                    marginTop: '6px',
                    color: '#0F172A',
                  }}>
                    <span>Total Amount Payable:</span>
                    <span style={{ color: '#D32F2F' }}>Tk {finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Submit Order Button */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    padding: '15px',
                    fontSize: '1rem',
                    fontWeight: 800,
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>Confirm Order (Tk {finalTotal.toLocaleString()})</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.72rem',
  fontWeight: 700,
  color: '#475569',
  display: 'block',
  marginBottom: '5px',
  letterSpacing: '0.04em',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #CBD5E1',
  backgroundColor: '#FFFFFF',
  fontSize: '0.875rem',
  color: '#0F172A',
  outline: 'none',
};

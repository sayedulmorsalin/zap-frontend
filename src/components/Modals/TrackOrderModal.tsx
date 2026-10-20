'use client';

import React, { useState } from 'react';
import { X, Search, CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Order, OrderStatus } from '../../types/admin';

export const TrackOrderModal: React.FC = () => {
  const { isTrackOrderOpen, setIsTrackOrderOpen, orders } = useShop();
  const [orderQuery, setOrderQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);

  if (!isTrackOrderOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = orderQuery.trim().toUpperCase();
    if (!query) return;

    setHasSearched(true);
    const matched = orders.find(
      (o) =>
        o.orderNumber.toUpperCase() === query ||
        o.customerPhone.includes(query) ||
        o.id === query
    );
    setFoundOrder(matched || null);
  };

  const getStatusStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return 0;
      case 'CONFIRMED': return 1;
      case 'PROCESSING': return 2;
      case 'SHIPPED': return 3;
      case 'DELIVERED': return 4;
      case 'CANCELLED': return -1;
      default: return 1;
    }
  };

  const currentStep = foundOrder ? getStatusStepIndex(foundOrder.status) : 2;

  const steps = [
    { 
      title: 'Order Placed & Verified', 
      desc: 'Order received and payment verification completed', 
      done: currentStep >= 0 
    },
    { 
      title: 'Confirmed by Atelier', 
      desc: 'Quality inspection and verification complete', 
      done: currentStep >= 1 
    },
    { 
      title: 'Packed & Dispatched to Courier', 
      desc: `${foundOrder?.courierName || 'Steadfast Express'} Logistics Hub, Dhaka`, 
      done: currentStep >= 2 
    },
    { 
      title: 'In Transit / Out for Delivery', 
      desc: `Tracking: ${foundOrder?.trackingNumber || 'SF-BD-8901234'} • Handed to courier agent`, 
      done: currentStep >= 3 
    },
    { 
      title: 'Delivered to Doorstep', 
      desc: 'Package delivered and signed by recipient', 
      done: currentStep >= 4 
    },
  ];

  const getStatusBadgeColor = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED': return { bg: '#DCFCE7', text: '#15803D' };
      case 'SHIPPED': return { bg: '#E0F2FE', text: '#0369A1' };
      case 'PROCESSING': return { bg: '#FEF3C7', text: '#B45309' };
      case 'CONFIRMED': return { bg: '#EDE9FE', text: '#6D28D9' };
      case 'CANCELLED': return { bg: '#FEE2E2', text: '#B91C1C' };
      default: return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsTrackOrderOpen(false)}>
      <div
        className="animate-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          maxWidth: '580px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        <button
          onClick={() => setIsTrackOrderOpen(false)}
          aria-label="Close Order Tracker"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B',
          }}
        >
          <X size={18} />
        </button>

        <div style={{ marginBottom: '20px' }}>
          <div className="zap-badge" style={{ marginBottom: '8px' }}>
            <span>LIVE TRACKING</span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A' }}>
            Track Your Footwear Order
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.85rem' }}>
            Enter your order number (e.g. <code>ZAP-BD-749102</code>) or mobile phone to see real-time dispatch status.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={18}
              color="#94A3B8"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="e.g. ZAP-BD-749102 or 01711489201"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 38px',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>
            Track
          </button>
        </form>

        {hasSearched && (
          <div>
            {foundOrder ? (
              <div style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '20px',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid #E2E8F0',
                }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>ORDER NUMBER:</span>
                    <div style={{ fontWeight: 800, color: '#D32F2F', fontSize: '1.05rem' }}>
                      {foundOrder.orderNumber}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                      Recipient: <strong>{foundOrder.customerName}</strong> ({foundOrder.city})
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      backgroundColor: getStatusBadgeColor(foundOrder.status).bg,
                      color: getStatusBadgeColor(foundOrder.status).text,
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      display: 'inline-block',
                    }}>
                      {foundOrder.status}
                    </span>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                      ৳ {foundOrder.total.toLocaleString()} • {foundOrder.paymentMethod.toUpperCase()}
                    </div>
                  </div>
                </div>

                {foundOrder.courierName && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: '#FFFFFF',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    marginBottom: '16px',
                    fontSize: '0.82rem',
                    color: '#334155',
                  }}>
                    <Truck size={18} color="#D32F2F" />
                    <div>
                      Courier: <strong>{foundOrder.courierName}</strong> | Tracking ID: <strong>{foundOrder.trackingNumber || 'N/A'}</strong>
                    </div>
                  </div>
                )}

                {/* Timeline Steps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                  {steps.map((st, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px' }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}>
                        <div style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          backgroundColor: st.done ? '#D32F2F' : '#E2E8F0',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}>
                          {st.done ? <CheckCircle2 size={16} /> : i + 1}
                        </div>
                        {i < steps.length - 1 && (
                          <div style={{
                            width: '2px',
                            flex: 1,
                            minHeight: '22px',
                            backgroundColor: st.done ? '#D32F2F' : '#E2E8F0',
                            margin: '3px 0',
                          }} />
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: st.done ? '#0F172A' : '#94A3B8',
                          }}>
                            {st.title}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                          {st.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '24px',
                backgroundColor: '#FEF2F2',
                borderRadius: '12px',
                border: '1px solid #FEE2E2',
                color: '#991B1B',
              }}>
                <AlertCircle size={28} style={{ margin: '0 auto 8px', display: 'block' }} />
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>No matching order found</div>
                <p style={{ fontSize: '0.82rem', color: '#B91C1C', marginTop: '4px' }}>
                  Please check your order number or phone number. Sample: <code>ZAP-BD-749102</code>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { Truck, RotateCcw, ShieldCheck, CreditCard } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const ValueProps: React.FC = () => {
  const { storeSettings } = useShop();

  const perks = [
    {
      icon: <Truck size={24} color="#D32F2F" />,
      title: 'Free Delivery',
      desc: `On all orders above Tk ${(storeSettings?.freeShippingThreshold ?? 2500).toLocaleString()} nationwide`,
    },
    {
      icon: <RotateCcw size={24} color="#D32F2F" />,
      title: '7 Days Easy Exchange',
      desc: 'In any of our flagship stores or via express courier',
    },
    {
      icon: <ShieldCheck size={24} color="#D32F2F" />,
      title: '100% Original Guarantee',
      desc: 'Authentic footwear direct from ZAP Atelier & certified partners',
    },
    {
      icon: <CreditCard size={24} color="#D32F2F" />,
      title: 'Cash on Delivery & bKash',
      desc: 'Inspect shoe at doorstep before payment',
    },
  ];

  return (
    <section className="footer-value-props" style={{
      backgroundColor: '#F8FAFC',
      padding: '32px 0',
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div className="container">
        <div className="value-props-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
        }}>
          {perks.map((p, idx) => (
            <div
              key={idx}
              className="value-prop-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = '#D32F2F';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                backgroundColor: '#FFEBEE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {p.icon}
              </div>
              <div>
                <h4 style={{
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  marginBottom: '2px',
                }}>
                  {p.title}
                </h4>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#64748B',
                  lineHeight: 1.35,
                }}>
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

'use client';

import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Phone, Search, MapPin } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const AnnouncementBar: React.FC = () => {
  const { setIsTrackOrderOpen, storeSettings } = useShop();

  return (
    <div style={{
      backgroundColor: '#111827',
      color: '#E5E7EB',
      fontSize: '0.8rem',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '7px 0',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        {/* Left: Value Perks ticker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
          {storeSettings?.announcementTicker ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#EF4444', fontWeight: 800 }}>⚡</span>
              <span style={{ fontWeight: 600, color: '#F3F4F6' }}>{storeSettings.announcementTicker}</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={14} color="#EF4444" />
              <span><strong>FREE Delivery</strong> across BD on orders over Tk {(storeSettings?.freeShippingThreshold ?? 2500).toLocaleString()}</span>
            </div>
          )}
          {storeSettings?.announcementTicker && (
            <div style={{ display: 'none', alignItems: 'center', gap: '6px' }} className="announcement-desktop-item">
              <Truck size={14} color="#EF4444" />
              <span><strong>FREE Delivery</strong> over Tk {(storeSettings?.freeShippingThreshold ?? 2500).toLocaleString()}</span>
            </div>
          )}
          <div style={{ display: 'none', alignItems: 'center', gap: '6px' }} className="announcement-desktop-item">
            <RotateCcw size={14} color="#EF4444" />
            <span>7 Days Hassle-Free Exchange</span>
          </div>
          <div style={{ display: 'none', alignItems: 'center', gap: '6px' }} className="announcement-desktop-item">
            <ShieldCheck size={14} color="#22C55E" />
            <span>100% Genuine Footwear</span>
          </div>
        </div>

        {/* Right: Quick Utility Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setIsTrackOrderOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#F9FAFB',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 500,
            }}
          >
            <Search size={13} color="#D32F2F" />
            <span>Track Order</span>
          </button>

          <a
            href={`tel:${(storeSettings?.supportPhone || '+8809666777222').replace(/[^0-9+]/g, '')}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              color: '#D1D5DB',
              textDecoration: 'none',
              fontSize: '0.78rem',
            }}
          >
            <Phone size={13} color="#9CA3AF" />
            <span>Hotline: <strong>{storeSettings?.supportPhone || '+880 9666 777 222'}</strong></span>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9CA3AF', fontSize: '0.78rem' }}>
            <MapPin size={13} color="#D32F2F" />
            <span>260+ Stores in BD</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 900px) {
          .announcement-desktop-item {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};

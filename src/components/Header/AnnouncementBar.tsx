'use client';

import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Phone, Search, MapPin } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const AnnouncementBar: React.FC = () => {
  const { setIsTrackOrderOpen, storeSettings } = useShop();

  return (
    <div style={{
      backgroundColor: '#0F172A',
      color: '#E2E8F0',
      fontSize: '0.78rem',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '7px 0',
      minHeight: '34px',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}>
        {/* Left: Value Perks ticker */}
        <div className="announcement-left" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          width: '100%',
        }}>
          {storeSettings?.announcementTicker ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.76rem',
              letterSpacing: '0.02em',
            }} className="announcement-main-text">
              <span style={{ color: '#EF4444', fontWeight: 800 }}>⚡</span>
              <span style={{ fontWeight: 600, color: '#F8FAFC' }}>{storeSettings.announcementTicker}</span>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.76rem',
            }} className="announcement-main-text">
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

        {/* Right: Quick Utility Links (Desktop Only) */}
        <div className="announcement-right" style={{ display: 'none', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
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
        @media (min-width: 992px) {
          .announcement-right {
            display: flex !important;
          }
          .announcement-desktop-item {
            display: flex !important;
          }
          .announcement-left {
            width: auto !important;
          }
        }
        @media (max-width: 991px) {
          .announcement-left {
            justify-content: center !important;
            text-align: center !important;
            min-width: 0 !important;
            max-width: 100% !important;
            overflow: hidden !important;
          }
          .announcement-main-text {
            justify-content: center !important;
            text-align: center !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
          }
          .announcement-main-text span {
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            min-width: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

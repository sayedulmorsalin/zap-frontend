'use client';

import React, { useState } from 'react';
import { 
  Save, 
  Truck, 
  Megaphone, 
  Building2 
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { StoreSettings } from '../../types/admin';

export const StoreSettingsManager: React.FC = () => {
  const { storeSettings, updateStoreSettings } = useShop();

  const [formData, setFormData] = useState<StoreSettings>({
    ...storeSettings,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(formData);
  };

  return (
    <div style={{ maxWidth: '820px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
          Global Store Controls & Policies
        </h3>
        <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, marginTop: '2px' }}>
          Configure customer care channels, dispatch rules, shipping fees, and live announcement banners
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Card 1: Storefront Identity & Care Hotline */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '24px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
        }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} color="#D32F2F" />
            <span>Store Identity & Customer Care</span>
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                Store Official Title
              </label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="admin-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                Support Hotline Phone
              </label>
              <input
                type="text"
                value={formData.supportPhone}
                onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                className="admin-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                Official Care Email
              </label>
              <input
                type="email"
                value={formData.supportEmail}
                onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                className="admin-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                Central Dispatch Warehouse
              </label>
              <input
                type="text"
                value={formData.centralWarehouse}
                onChange={(e) => setFormData({ ...formData, centralWarehouse: e.target.value })}
                className="admin-input"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Logistics & Free Shipping Policies */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '24px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
        }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={18} color="#D32F2F" />
            <span>Shipping & Logistics Rules</span>
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                Free Delivery Threshold (BDT ৳)
              </label>
              <input
                type="number"
                value={formData.freeShippingThreshold}
                onChange={(e) => setFormData({ ...formData, freeShippingThreshold: Number(e.target.value) })}
                className="admin-input"
              />
              <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginTop: '4px' }}>
                Orders above this amount qualify for zero delivery fee automatically
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                Standard Delivery Charge (BDT ৳)
              </label>
              <input
                type="number"
                value={formData.standardShippingFee}
                onChange={(e) => setFormData({ ...formData, standardShippingFee: Number(e.target.value) })}
                className="admin-input"
              />
              <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginTop: '4px' }}>
                Default shipping rate applied when subtotal is below the threshold
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Live Announcement Bar Ticker */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '24px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
        }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Megaphone size={18} color="#D32F2F" />
            <span>Top Bar Announcement & Promotion Ticker</span>
          </h4>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
              Ticker Headline
            </label>
            <textarea
              rows={2}
              value={formData.announcementTicker}
              onChange={(e) => setFormData({ ...formData, announcementTicker: e.target.value })}
              className="admin-input"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Live Preview */}
          <div style={{ marginTop: '16px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '6px' }}>
              LIVE TICKER PREVIEW:
            </span>
            <div style={{
              backgroundColor: '#0A0A0C',
              color: '#FFFFFF',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ color: '#D32F2F' }}>⚡</span>
              <span style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {formData.announcementTicker}
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px' }}>
            <Save size={16} />
            <span>Save Store Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

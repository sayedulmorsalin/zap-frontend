'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  RotateCcw, 
  ExternalLink, 
  Menu 
} from 'lucide-react';
import { AdminTab } from '../../types/admin';
import { useShop } from '../../context/ShopContext';

interface AdminHeaderProps {
  currentTab: AdminTab;
  toggleSidebar: () => void;
  setCurrentTab: (tab: AdminTab) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentTab,
  toggleSidebar,
  setCurrentTab,
}) => {
  const { orders, resetToDefaults, apiStatus, apiInfo, refreshFromApi } = useShop();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshFromApi();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const tabTitles: Record<AdminTab, { title: string; subtitle: string }> = {
    dashboard: { title: 'Executive Overview', subtitle: 'Live sales metrics, order pipeline, and catalog health' },
    products: { title: 'Footwear Catalog Manager', subtitle: 'Add, update pricing, manage stock, and organize collections' },
    orders: { title: 'Orders & Dispatches', subtitle: 'Live customer orders, shipping status, and logistics' },
    brands: { title: 'Curated Brands & Categories', subtitle: 'Organize brand portfolio and category taxonomy' },
    coupons: { title: 'Coupons & Campaign Promos', subtitle: 'Create discount codes, flash sales, and customer perks' },
    customers: { title: 'Shoppers & Privilege Club', subtitle: 'Customer directory, lifetime values, and VIP status' },
    settings: { title: 'Store Settings & Controls', subtitle: 'Hotlines, warehouse dispatch rules, and announcement tickers' },
  };

  const activeTabMeta = tabTitles[currentTab];

  const handleReset = () => {
    resetToDefaults();
    setShowConfirmReset(false);
  };

  return (
    <header className="admin-header">
      {/* Left: Mobile Toggle & Tab Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={toggleSidebar}
          aria-label="Toggle Navigation"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            color: '#0F172A',
          }}
          className="admin-mobile-toggle"
        >
          <Menu size={22} />
        </button>

        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
            {activeTabMeta.title}
          </h1>
          <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, marginTop: '2px' }}>
            {activeTabMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Backend API Indicator */}
        <button
          onClick={handleRefresh}
          title={apiInfo ? `Database: ${apiInfo.database} (Port ${apiInfo.port}) - Click to sync` : 'Backend API Status - Click to sync'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: apiStatus === 'connected' ? '#EFF6FF' : '#FEF3C7',
            color: apiStatus === 'connected' ? '#1D4ED8' : '#B45309',
            border: `1px solid ${apiStatus === 'connected' ? '#BFDBFE' : '#FDE68A'}`,
            fontSize: '0.74rem',
            fontWeight: 700,
            padding: '5px 10px',
            borderRadius: '20px',
            cursor: 'pointer',
            opacity: isRefreshing ? 0.6 : 1,
            transition: 'all 0.15s ease',
          }}
        >
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: apiStatus === 'connected' ? '#2563EB' : '#D97706',
            display: 'inline-block',
            boxShadow: apiStatus === 'connected' ? '0 0 0 2px rgba(37, 99, 235, 0.25)' : 'none',
            animation: apiStatus === 'connected' ? 'pulse 2s infinite' : 'none',
          }} />
          <span>
            {isRefreshing 
              ? 'SYNCING...' 
              : apiStatus === 'connected' 
              ? 'API: POSTGRESQL CONNECTED' 
              : apiStatus === 'checking' 
              ? 'CONNECTING API...' 
              : 'API: OFFLINE'}
          </span>
        </button>

        {/* Live Storefront Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#DCFCE7',
          color: '#15803D',
          fontSize: '0.74rem',
          fontWeight: 700,
          padding: '5px 10px',
          borderRadius: '20px',
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#16A34A',
            display: 'inline-block',
            boxShadow: '0 0 0 2px rgba(22, 163, 74, 0.25)',
          }} />
          <span>STORE LIVE</span>
        </div>

        {/* View Store Button */}
        <Link
          href="/"
          target="_blank"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            fontSize: '0.8rem',
            fontWeight: 700,
            padding: '8px 14px',
            borderRadius: '8px',
            textDecoration: 'none',
            transition: 'background-color 0.15s ease',
          }}
        >
          <span>Storefront</span>
          <ExternalLink size={14} />
        </Link>

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#334155',
              position: 'relative',
            }}
          >
            <Bell size={18} />
            {orders.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: '#D32F2F',
                color: '#FFFFFF',
                fontSize: '0.65rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #FFFFFF',
              }}>
                {orders.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '46px',
              right: 0,
              width: '320px',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
              zIndex: 50,
              padding: '16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A' }}>Recent Orders</span>
                <span style={{ fontSize: '0.72rem', color: '#D32F2F', fontWeight: 700 }}>{orders.length} Total</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '260px', overflowY: 'auto' }}>
                {orders.slice(0, 5).map((o) => (
                  <div 
                    key={o.id} 
                    onClick={() => {
                      setCurrentTab('orders');
                      setShowNotifications(false);
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: '#F8FAFC',
                      cursor: 'pointer',
                      border: '1px solid #F1F5F9',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>
                      <span>{o.orderNumber}</span>
                      <span style={{ color: '#D32F2F' }}>৳ {o.total.toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                      {o.customerName} • {o.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Factory Reset Button */}
        <button
          onClick={() => setShowConfirmReset(true)}
          title="Reset to Demo Defaults"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#F1F5F9',
            border: '1px solid #E2E8F0',
            color: '#475569',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={14} />
          <span>Reset Demo</span>
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showConfirmReset && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '420px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Reset to Initial Demo State?
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '20px' }}>
              This will re-populate all products, initial demo orders, coupons, and factory store settings from source data.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="btn btn-primary btn-sm"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

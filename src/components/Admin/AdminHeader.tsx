'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bell, 
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
  const { orders, apiStatus, apiInfo, refreshFromApi } = useShop();
  const [showNotifications, setShowNotifications] = useState(false);
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
    banners: { title: 'Banners & Hero Showcase', subtitle: 'Manage homepage hero carousel slides and call-to-actions' },
    brands: { title: 'Curated Brands & Categories', subtitle: 'Organize brand portfolio and category taxonomy' },

    coupons: { title: 'Coupons & Campaign Promos', subtitle: 'Create discount codes, flash sales, and customer perks' },
    customers: { title: 'Shoppers & Privilege Club', subtitle: 'Customer directory, lifetime values, and VIP status' },
    settings: { title: 'Store Settings & Controls', subtitle: 'Hotlines, warehouse dispatch rules, and announcement tickers' },
  };

  const activeTabMeta = tabTitles[currentTab];

  return (
    <header className="admin-header">
      {/* Left: Mobile Toggle & Tab Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <button
          onClick={toggleSidebar}
          aria-label="Toggle Navigation Menu"
          className="admin-mobile-toggle"
        >
          <Menu size={22} />
        </button>

        <div className="admin-header-title-box">
          <h1 className="admin-header-title">
            {activeTabMeta.title}
          </h1>
          <p className="admin-header-subtitle">
            {activeTabMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="admin-header-actions">
        {/* Backend API Indicator */}
        <button
          onClick={handleRefresh}
          title={apiInfo ? `Database: ${apiInfo.database} (Port ${apiInfo.port}) - Click to sync` : 'Backend API Status - Click to sync'}
          className="admin-header-db-pill"
          style={{
            backgroundColor: apiStatus === 'connected' ? '#EFF6FF' : apiStatus === 'db_disconnected' ? '#FEF2F2' : '#FEF3C7',
            color: apiStatus === 'connected' ? '#1D4ED8' : apiStatus === 'db_disconnected' ? '#DC2626' : '#B45309',
            border: `1px solid ${apiStatus === 'connected' ? '#BFDBFE' : apiStatus === 'db_disconnected' ? '#FECACA' : '#FDE68A'}`,
            opacity: isRefreshing ? 0.6 : 1,
          }}
        >
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: apiStatus === 'connected' ? '#2563EB' : apiStatus === 'db_disconnected' ? '#DC2626' : '#D97706',
            display: 'inline-block',
            flexShrink: 0,
            boxShadow: apiStatus === 'connected' ? '0 0 0 2px rgba(37, 99, 235, 0.25)' : 'none',
            animation: apiStatus === 'connected' ? 'pulse 2s infinite' : 'none',
          }} />
          <span className="admin-header-db-text">
            {isRefreshing 
              ? 'SYNCING...' 
              : apiStatus === 'connected' 
              ? 'POSTGRESQL' 
              : apiStatus === 'db_disconnected'
              ? 'NO DB'
              : apiStatus === 'checking' 
              ? 'CONNECTING' 
              : 'OFFLINE'}
          </span>
        </button>

        {/* Live Storefront Indicator (hidden on small mobile to conserve space) */}
        <div className="admin-header-store-live">
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: '#16A34A',
            display: 'inline-block',
            flexShrink: 0,
            boxShadow: '0 0 0 2px rgba(22, 163, 74, 0.25)',
          }} />
          <span>STORE LIVE</span>
        </div>

        {/* View Store Button */}
        <Link
          href="/"
          target="_blank"
          title="View Live Storefront"
          className="admin-header-store-btn"
        >
          <span className="admin-header-store-btn-text">Store</span>
          <ExternalLink size={14} />
        </Link>

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="admin-header-icon-btn"
            style={{
              position: 'relative',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#334155',
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
      </div>
    </header>
  );
};

'use client';

import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Layers, 
  Tag, 
  Users, 
  Settings, 
  ExternalLink,
  Shield,
  ChevronRight,
  LogOut,
  Image as ImageIcon
} from 'lucide-react';
import { AdminTab } from '../../types/admin';
import { useShop } from '../../context/ShopContext';

interface AdminSidebarProps {
  currentTab: AdminTab;
  setCurrentTab: (tab: AdminTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onLogout?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpen,
  onLogout,
}) => {
  const { orders, products, coupons, heroSlides, promoBanners } = useShop();

  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'PROCESSING'
  ).length;

  const totalBannersCount = (heroSlides?.length || 0) + (promoBanners?.length || 0);

  const navItems = [
    { id: 'dashboard' as AdminTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'products' as AdminTab, label: 'Products & Shoes', icon: Package, badge: products.length },
    { id: 'orders' as AdminTab, label: 'Orders & Dispatches', icon: ShoppingBag, badge: pendingOrdersCount, badgeColor: '#D32F2F' },
    { id: 'banners' as AdminTab, label: 'Banners & Hero', icon: ImageIcon, badge: totalBannersCount },
    { id: 'brands' as AdminTab, label: 'Brands & Lines', icon: Layers },
    { id: 'coupons' as AdminTab, label: 'Coupons & Promos', icon: Tag, badge: coupons.filter(c => c.isActive).length },
    { id: 'customers' as AdminTab, label: 'Shoppers & VIPs', icon: Users },
    { id: 'settings' as AdminTab, label: 'Store Controls', icon: Settings },
  ];


  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Badge */}
      <div className="admin-brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #B91C1C 0%, #DC2626 100%)',
            color: '#FFFFFF',
            fontWeight: 900,
            fontSize: '1.15rem',
            padding: '4px 10px',
            borderRadius: '6px',
            letterSpacing: '0.04em',
            boxShadow: '0 2px 10px rgba(220, 38, 38, 0.4)',
          }}>
            ZAP
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.02em' }}>
              EXECUTIVE
            </div>
            <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.08em' }}>
              MANAGEMENT CONSOLE
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="admin-nav">
        <div style={{ 
          fontSize: '0.68rem', 
          fontWeight: 800, 
          color: '#64748B', 
          letterSpacing: '0.08em', 
          textTransform: 'uppercase',
          padding: '8px 14px 4px',
        }}>
          Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span style={{
                  backgroundColor: item.badgeColor || '#334155',
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div style={{ 
          fontSize: '0.68rem', 
          fontWeight: 800, 
          color: '#64748B', 
          letterSpacing: '0.08em', 
          textTransform: 'uppercase',
          padding: '16px 14px 4px',
        }}>
          Public Interface
        </div>

        <Link
          href="/"
          className="admin-nav-item"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ExternalLink size={18} />
            <span>View Live Store</span>
          </div>
          <ChevronRight size={14} color="#64748B" />
        </Link>
      </nav>

      {/* Admin Profile Footprint */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: '#0F172A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#D32F2F',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.85rem',
            flexShrink: 0,
          }}>
            <Shield size={16} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Store Superadmin
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
              Private Console
            </div>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            title="Lock Console / Sign Out"
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
};

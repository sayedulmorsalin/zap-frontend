'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Image as ImageIcon, 
  Menu 
} from 'lucide-react';
import { AdminTab } from '../../types/admin';
import { useShop } from '../../context/ShopContext';

interface AdminBottomNavProps {
  currentTab: AdminTab;
  setCurrentTab: (tab: AdminTab) => void;
  onOpenSidebar: () => void;
  isSidebarOpen: boolean;
}

export const AdminBottomNav: React.FC<AdminBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  onOpenSidebar,
  isSidebarOpen,
}) => {
  const { orders, products, heroSlides } = useShop();

  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'PROCESSING'
  ).length;

  const totalBannersCount = heroSlides?.length || 0;

  const mainTabs = [
    { id: 'dashboard' as AdminTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'products' as AdminTab, label: 'Shoes', icon: Package, badge: products.length },
    { id: 'orders' as AdminTab, label: 'Orders', icon: ShoppingBag, badge: pendingOrdersCount, badgeColor: '#D32F2F' },
    { id: 'banners' as AdminTab, label: 'Banners', icon: ImageIcon, badge: totalBannersCount },
  ];

  const isMoreActive = !mainTabs.some((t) => t.id === currentTab);

  return (
    <nav className="admin-bottom-nav">
      {mainTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id && !isSidebarOpen;
        return (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`admin-bottom-nav-item ${isActive ? 'active' : ''}`}
            aria-label={tab.label}
          >
            <div className="admin-bottom-nav-icon-wrap">
              <Icon size={20} />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className="admin-bottom-nav-badge"
                  style={{ backgroundColor: tab.badgeColor || '#475569' }}
                >
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </div>
            <span className="admin-bottom-nav-label">{tab.label}</span>
          </button>
        );
      })}

      {/* Menu / More Button */}
      <button
        onClick={onOpenSidebar}
        className={`admin-bottom-nav-item ${isSidebarOpen || isMoreActive ? 'active' : ''}`}
        aria-label="More Menu"
      >
        <div className="admin-bottom-nav-icon-wrap">
          <Menu size={20} />
          {isMoreActive && (
            <span
              className="admin-bottom-nav-badge"
              style={{ backgroundColor: '#D32F2F' }}
            >
              •
            </span>
          )}
        </div>
        <span className="admin-bottom-nav-label">
          {isMoreActive ? 'More...' : 'Menu'}
        </span>
      </button>
    </nav>
  );
};

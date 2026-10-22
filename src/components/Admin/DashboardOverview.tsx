'use client';

import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  Users, 
  ArrowUpRight, 
  Clock, 
  Truck, 
  CheckCircle2, 
  Plus,
  Tag,
  ChevronRight,
  Database,
  Activity,
  Image as ImageIcon,
  Phone
} from 'lucide-react';

import { useShop } from '../../context/ShopContext';
import { AdminTab, OrderStatus } from '../../types/admin';

interface DashboardOverviewProps {
  setCurrentTab: (tab: AdminTab) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ setCurrentTab }) => {
  const { orders, products, customers, updateOrderStatus, apiStatus, apiInfo, refreshFromApi } = useShop();

  const totalRevenue = orders.reduce((sum, ord) => sum + ord.total, 0);
  const totalOrdersCount = orders.length;
  const inStockProducts = products.filter((p) => p.inStock).length;
  const pendingOrders = orders.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'PROCESSING');

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="status-pill delivered"><CheckCircle2 size={12} /> Delivered</span>;
      case 'SHIPPED':
        return <span className="status-pill shipped"><Truck size={12} /> Shipped</span>;
      case 'PROCESSING':
        return <span className="status-pill processing"><Clock size={12} /> Processing</span>;
      case 'CONFIRMED':
        return <span className="status-pill confirmed">Confirmed</span>;
      case 'CANCELLED':
        return <span className="status-pill cancelled">Cancelled</span>;
      default:
        return <span className="status-pill pending">Pending</span>;
    }
  };

  // Dynamic daily revenue calculated from actual orders
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dayName = daysOfWeek[d.getDay()];
    const dateStr = d.toISOString().slice(0, 10);
    const dayOrders = orders.filter((o) => o.createdAt && o.createdAt.slice(0, 10) === dateStr);
    const amount = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    return { day: dayName, amount, dateStr };
  });

  const maxAmount = Math.max(...last7Days.map((d) => d.amount), 1);
  const weeklySales = last7Days.map((d) => ({
    day: d.day,
    amount: d.amount,
    height: d.amount > 0 ? `${Math.round((d.amount / maxAmount) * 80) + 20}%` : '6%',
  }));
  const weeklyTotal = last7Days.reduce((sum, d) => sum + d.amount, 0);

  // Dynamic category distribution from actual catalog
  const categoryCounts = products.reduce((acc, p) => {
    const cat = p.categoryName || p.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryEntries = Object.entries(categoryCounts).map(([cat, count]) => ({
    name: cat,
    count,
    percent: products.length > 0 ? Math.round((count / products.length) * 100) : 0,
  }));

  return (
    <div>
      {/* Backend Infrastructure Live Status Banner */}
      <div className="admin-db-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: apiStatus === 'connected' ? 'rgba(34, 197, 94, 0.15)' : apiStatus === 'db_disconnected' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)',
            color: apiStatus === 'connected' ? '#4ADE80' : apiStatus === 'db_disconnected' ? '#F87171' : '#FACC15',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Database size={20} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>
                PostgreSQL & REST API
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: apiStatus === 'connected' ? '#166534' : apiStatus === 'db_disconnected' ? '#991B1B' : '#854D0E',
                color: apiStatus === 'connected' ? '#BBF7D0' : apiStatus === 'db_disconnected' ? '#FECACA' : '#FEF08A',
                letterSpacing: '0.02em',
              }}>
                {apiStatus === 'connected' 
                  ? 'LIVE & SYNCHRONIZED' 
                  : apiStatus === 'db_disconnected'
                  ? 'DB DISCONNECTED'
                  : apiStatus === 'checking' 
                  ? 'CONNECTING...' 
                  : 'API OFFLINE'}
              </span>
            </div>
            {apiInfo?.error ? (
              <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: '#FCA5A5', wordBreak: 'break-word' }}>
                Prisma Error: {apiInfo.error}
              </p>
            ) : apiStatus === 'offline' ? (
              <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: '#FDE047' }}>
                Backend API unreachable. Ensure Dokploy API container is active.
              </p>
            ) : (
              <p style={{ margin: '3px 0 0', fontSize: '0.74rem', color: '#94A3B8', wordBreak: 'break-word' }}>
                Database: <code style={{ color: '#E2E8F0' }}>{apiInfo?.database || 'shoeshop_db'}</code> &bull; Port: 3001
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => refreshFromApi()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              width: '100%',
              transition: 'background-color 0.15s ease',
            }}
          >
            <Activity size={14} />
            <span>Sync Live DB</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {/* Total Revenue */}
        <div className="kpi-card">
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B' }}>TOTAL REVENUE</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', marginTop: '6px' }}>
              ৳ {totalRevenue.toLocaleString()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#16A34A', fontWeight: 700, marginTop: '8px' }}>
              <ArrowUpRight size={14} />
              <span>+18.4% from last month</span>
            </div>
          </div>
          <div className="kpi-icon-wrap" style={{ backgroundColor: '#FEF2F2', color: '#D32F2F' }}>
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Total Orders */}
        <div className="kpi-card">
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B' }}>TOTAL ORDERS</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', marginTop: '6px' }}>
              {totalOrdersCount}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#D97706', fontWeight: 700, marginTop: '8px' }}>
              <Clock size={14} />
              <span>{pendingOrders.length} pending dispatch</span>
            </div>
          </div>
          <div className="kpi-icon-wrap" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
            <ShoppingBag size={24} />
          </div>
        </div>

        {/* Active Products */}
        <div className="kpi-card">
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B' }}>FOOTWEAR CATALOG</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', marginTop: '6px' }}>
              {products.length}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#16A34A', fontWeight: 700, marginTop: '8px' }}>
              <CheckCircle2 size={14} />
              <span>{inStockProducts} styles in stock</span>
            </div>
          </div>
          <div className="kpi-icon-wrap" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
            <Package size={24} />
          </div>
        </div>

        {/* Customers */}
        <div className="kpi-card">
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B' }}>REGISTERED SHOPPERS</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', marginTop: '6px' }}>
              {customers.length}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#6366F1', fontWeight: 700, marginTop: '8px' }}>
              <Users size={14} />
              <span>{customers.filter(c => c.status === 'vip').length} Privilege Club VIPs</span>
            </div>
          </div>
          <div className="kpi-icon-wrap" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* Middle Row: Sales Chart & Category Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Sales Chart */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Weekly Sales Volume (BDT)
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, marginTop: '2px' }}>
                Atelier dispatches over the last 7 calendar days
              </p>
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#D32F2F' }}>
              ৳ {weeklyTotal.toLocaleString()} Weekly
            </span>
          </div>

          {/* Bar Chart Container */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingTop: '20px', borderBottom: '1px solid #F1F5F9' }}>
            {weeklySales.map((bar, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94A3B8' }}>
                  {(bar.amount / 1000).toFixed(1)}k
                </span>
                <div style={{
                  width: '32px',
                  height: bar.height,
                  background: idx === 4 ? 'linear-gradient(180deg, #D32F2F 0%, #B91C1C 100%)' : '#E2E8F0',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.4s ease, background 0.2s ease',
                  cursor: 'pointer',
                }} 
                title={`${bar.day}: ৳ ${bar.amount.toLocaleString()}`}
                />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: idx === 4 ? '#D32F2F' : '#64748B' }}>
                  {bar.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown & Quick Actions */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0, marginBottom: '16px' }}>
              Category Distribution
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {categoryEntries.length > 0 ? (
                categoryEntries.slice(0, 4).map((entry, idx) => {
                  const colors = ['#D32F2F', '#0284C7', '#D97706', '#16A34A', '#9333EA'];
                  const color = colors[idx % colors.length];
                  return (
                    <div key={entry.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                        <span style={{ color: '#0F172A' }}>{entry.name}</span>
                        <span style={{ color }}>{entry.percent}% ({entry.count} {entry.count === 1 ? 'item' : 'items'})</span>
                      </div>
                      <div style={{ height: '7px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${entry.percent}%`, height: '100%', backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '10px 0' }}>
                  No footwear categorized yet. Add products to see distribution.
                </p>
              )}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid #F1F5F9',
          }}>
            <button
              onClick={() => setCurrentTab('products')}
              className="btn btn-primary btn-sm"
              style={{ flex: 1 }}
            >
              <Plus size={14} />
              <span>Add Product</span>
            </button>
            <button
              onClick={() => setCurrentTab('coupons')}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
            >
              <Tag size={14} />
              <span>Promos</span>
            </button>
            <button
              onClick={() => setCurrentTab('banners')}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
            >
              <ImageIcon size={14} />
              <span>Banners</span>
            </button>
          </div>

        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="admin-table-container">
        <div className="admin-table-header">
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Recent Order Dispatches
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, marginTop: '2px' }}>
              Manage status and track consignments across all divisions
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('orders')}
            className="btn btn-secondary btn-sm"
          >
            <span>View All Orders</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Desktop View */}
        <div className="admin-desktop-table-view" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Destination</th>
                <th>Total (BDT)</th>
                <th>Status</th>
                <th>Quick Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((ord) => (
                <tr key={ord.id}>
                  <td style={{ fontWeight: 800, color: '#D32F2F' }}>
                    {ord.orderNumber}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{ord.customerName}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{ord.customerPhone}</div>
                  </td>
                  <td>
                    {ord.items.length} {ord.items.length === 1 ? 'pair' : 'pairs'}
                  </td>
                  <td>
                    {ord.city}
                  </td>
                  <td style={{ fontWeight: 800 }}>
                    ৳ {ord.total.toLocaleString()}
                  </td>
                  <td>
                    {getStatusBadge(ord.status)}
                  </td>
                  <td>
                    <select
                      value={ord.status}
                      onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        backgroundColor: '#FFFFFF',
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#94A3B8' }}>
                    No customer orders yet. Live orders will stream here automatically.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="admin-mobile-cards-view" style={{ padding: '12px' }}>
          {orders.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '24px 12px',
              backgroundColor: '#F8FAFC',
              borderRadius: '10px',
              color: '#64748B',
              fontSize: '0.82rem',
            }}>
              No customer orders yet. Live orders will appear here automatically.
            </div>
          ) : (
            orders.slice(0, 5).map((ord) => (
              <div key={ord.id} className="admin-item-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontWeight: 800, color: '#D32F2F', fontSize: '0.85rem' }}>
                      {ord.orderNumber}
                    </span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                      {ord.customerName}
                    </div>
                  </div>
                  <div>{getStatusBadge(ord.status)}</div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.78rem',
                  color: '#64748B',
                  marginBottom: '10px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #F1F5F9',
                }}>
                  <span>{ord.items.length} {ord.items.length === 1 ? 'pair' : 'pairs'} &bull; {ord.city}</span>
                  <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>
                    ৳ {ord.total.toLocaleString()}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {ord.customerPhone && (
                    <a
                      href={`tel:${ord.customerPhone}`}
                      style={{
                        flex: '0 0 auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#ECFDF5',
                        color: '#059669',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        border: '1px solid #A7F3D0',
                      }}
                    >
                      <Phone size={13} />
                      <span>Call</span>
                    </a>
                  )}

                  <select
                    value={ord.status}
                    onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                    style={{
                      flex: 1,
                      padding: '7px 8px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

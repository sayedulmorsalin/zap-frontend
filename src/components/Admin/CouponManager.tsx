'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Tag, 
  X 
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Coupon } from '../../types/admin';

export const CouponManager: React.FC = () => {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useShop();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: '',
    discountPercent: 15,
    minSpend: 2000,
    isActive: true,
    expiresAt: '2026-12-31',
    description: '',
  });

  const handleToggleActive = (coupon: Coupon) => {
    updateCoupon({ ...coupon, isActive: !coupon.isActive });
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code?.trim()) return;

    addCoupon({
      id: `c-${Date.now()}`,
      code: newCoupon.code.trim().toUpperCase(),
      discountPercent: Number(newCoupon.discountPercent) || 10,
      minSpend: Number(newCoupon.minSpend) || 1000,
      isActive: true,
      usedCount: 0,
      expiresAt: newCoupon.expiresAt || '2026-12-31',
      description: newCoupon.description || `${newCoupon.discountPercent}% Off promotional code`,
    });

    setIsAddOpen(false);
    setNewCoupon({
      code: '',
      discountPercent: 15,
      minSpend: 2000,
      isActive: true,
      expiresAt: '2026-12-31',
      description: '',
    });
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Active Promotional Coupons ({coupons.length})
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, marginTop: '2px' }}>
            Coupons configured here are immediately redeemable by customers in the Cart drawer & checkout
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="btn btn-primary"
          style={{ width: '100%', maxWidth: '100%', justifyContent: 'center', padding: '10px 16px' }}
        >
          <Plus size={16} />
          <span>Create New Promo Code</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="admin-table-container">
        {/* Desktop View */}
        <div className="admin-desktop-table-view" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Discount</th>
                <th>Minimum Order</th>
                <th>Usage Count</th>
                <th>Expiration</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Tag size={16} color="#D32F2F" />
                      <div>
                        <span style={{
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          color: '#0F172A',
                          backgroundColor: '#F1F5F9',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: '1px solid #E2E8F0',
                        }}>
                          {c.code}
                        </span>
                        <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '3px' }}>
                          {c.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: '#16A34A', fontSize: '0.9rem' }}>
                      {c.discountPercent}% OFF
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    ৳ {c.minSpend.toLocaleString()}
                  </td>
                  <td>
                    <span style={{
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}>
                      {c.usedCount} redemptions
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    {c.expiresAt}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleActive(c)}
                      style={{
                        backgroundColor: c.isActive ? '#DCFCE7' : '#F1F5F9',
                        color: c.isActive ? '#15803D' : '#64748B',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      {c.isActive ? 'ACTIVE' : 'DISABLED'}
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => deleteCoupon(c.id)}
                      style={{
                        backgroundColor: '#FEE2E2',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 8px',
                        cursor: 'pointer',
                        color: '#DC2626',
                      }}
                      title="Delete Coupon"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="admin-mobile-cards-view" style={{ padding: '12px' }}>
          {coupons.map((c) => (
            <div key={c.id} className="admin-item-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag size={16} color="#D32F2F" />
                  <span style={{
                    fontFamily: 'monospace',
                    fontWeight: 900,
                    fontSize: '1rem',
                    color: '#0F172A',
                    backgroundColor: '#F1F5F9',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}>
                    {c.code}
                  </span>
                </div>
                <span style={{ fontWeight: 900, color: '#16A34A', fontSize: '1rem' }}>
                  {c.discountPercent}% OFF
                </span>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                {c.description}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '8px',
                borderTop: '1px solid #F1F5F9',
                fontSize: '0.75rem',
              }}>
                <div>
                  <span style={{ color: '#64748B' }}>Min: </span>
                  <strong>৳ {c.minSpend.toLocaleString()}</strong>
                  <span style={{ color: '#94A3B8', marginLeft: '4px' }}>• {c.expiresAt}</span>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => handleToggleActive(c)}
                    style={{
                      backgroundColor: c.isActive ? '#DCFCE7' : '#F1F5F9',
                      color: c.isActive ? '#15803D' : '#64748B',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '20px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {c.isActive ? 'ACTIVE' : 'DISABLED'}
                  </button>

                  <button
                    onClick={() => deleteCoupon(c.id)}
                    style={{
                      backgroundColor: '#FEE2E2',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 8px',
                      cursor: 'pointer',
                      color: '#DC2626',
                    }}
                    title="Delete Coupon"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Coupon Modal */}
      {isAddOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '480px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Create New Promotional Code
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  Coupon Code (Uppercase) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH25"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="admin-input"
                />
              </div>

              <div className="admin-grid-2col">
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                    Discount Percentage (%) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={90}
                    value={newCoupon.discountPercent}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountPercent: Number(e.target.value) })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                    Minimum Order (BDT ৳) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newCoupon.minSpend}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minSpend: Number(e.target.value) })}
                    className="admin-input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={newCoupon.expiresAt}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  Description / Customer Facing Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. 25% Off Mid-Season Special"
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Activate Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

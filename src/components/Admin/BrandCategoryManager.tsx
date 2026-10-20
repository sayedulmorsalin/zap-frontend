'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  X 
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { BrandInfo } from '../../types/product';

export const BrandCategoryManager: React.FC = () => {
  const { brands, addBrand, deleteBrand, products } = useShop();

  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  const [newBrand, setNewBrand] = useState<BrandInfo>({
    id: '',
    name: '',
    slug: '',
    tagline: '',
    description: '',
    logoText: '',
    badgeColor: '#D32F2F',
    accentColor: '#9A0007',
  });

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand.name.trim()) return;

    const slug = newBrand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    addBrand({
      ...newBrand,
      id: `brand-${Date.now()}`,
      slug,
      logoText: newBrand.logoText || newBrand.name.toUpperCase(),
    });
    setIsAddBrandOpen(false);
    setNewBrand({
      id: '',
      name: '',
      slug: '',
      tagline: '',
      description: '',
      logoText: '',
      badgeColor: '#D32F2F',
      accentColor: '#9A0007',
    });
  };

  const categories = [
    { id: 'formal', name: 'Formal Shoes', count: products.filter(p => p.category === 'formal').length },
    { id: 'sneakers', name: 'Athletic & Runners', count: products.filter(p => p.category === 'sneakers').length },
    { id: 'sandals', name: 'Leather Sandals & Chappal', count: products.filter(p => p.category === 'sandals').length },
    { id: 'casual', name: 'Casual Loafers & Slip-Ons', count: products.filter(p => p.category === 'casual').length },
    { id: 'boots', name: 'Heritage Boots', count: products.filter(p => p.category === 'boots').length },
    { id: 'heels', name: 'Ladies Heels & Pumps', count: products.filter(p => p.category === 'heels').length },
  ];

  return (
    <div>
      {/* Brands Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Curated Brands Portfolio ({brands.length} Labels)
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, marginTop: '2px' }}>
            Control brand labels, badges, and taglines displayed across the storefront
          </p>
        </div>
        <button
          onClick={() => setIsAddBrandOpen(true)}
          className="btn btn-primary btn-sm"
        >
          <Plus size={16} />
          <span>Add New Brand</span>
        </button>
      </div>

      {/* Brands Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px',
        marginBottom: '36px',
      }}>
        {brands.map((b) => {
          const productCount = products.filter(p => p.brand.toLowerCase() === b.name.toLowerCase()).length;
          return (
            <div
              key={b.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{
                    backgroundColor: b.badgeColor || '#09090B',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    letterSpacing: '0.04em',
                  }}>
                    {b.logoText || b.name}
                  </div>
                  <button
                    onClick={() => deleteBrand(b.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#DC2626',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                    title="Remove Brand"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                  {b.name}
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#D32F2F', marginBottom: '8px' }}>
                  {b.tagline}
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.4, margin: 0 }}>
                  {b.description}
                </p>
              </div>

              <div style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: '#64748B',
                fontWeight: 600,
              }}>
                <span>Catalog Inventory:</span>
                <span style={{ fontWeight: 800, color: '#0F172A' }}>
                  {productCount} {productCount === 1 ? 'Product' : 'Products'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Categories Taxonomy Section */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0, marginBottom: '6px' }}>
          Store Taxonomy & Categories
        </h3>
        <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, marginBottom: '16px' }}>
          Categories used for live filtering, story bubbles, and catalog navigation
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '12px',
        }}>
          {categories.map((c) => (
            <div
              key={c.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A' }}>
                  {c.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                  ID: {c.id}
                </div>
              </div>
              <span style={{
                backgroundColor: '#F1F5F9',
                color: '#475569',
                fontWeight: 800,
                fontSize: '0.75rem',
                padding: '4px 8px',
                borderRadius: '6px',
              }}>
                {c.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Brand Modal */}
      {isAddBrandOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '520px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Register New Brand
              </h3>
              <button
                onClick={() => setIsAddBrandOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ZAP Atelier Studio"
                  value={newBrand.name}
                  onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  Tagline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bespoke Artisan Shoes & Pure Leather"
                  value={newBrand.tagline}
                  onChange={(e) => setNewBrand({ ...newBrand, tagline: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  Logo / Badge Text
                </label>
                <input
                  type="text"
                  placeholder="e.g. ZAP ATELIER"
                  value={newBrand.logoText}
                  onChange={(e) => setNewBrand({ ...newBrand, logoText: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  Badge Color
                </label>
                <input
                  type="color"
                  value={newBrand.badgeColor}
                  onChange={(e) => setNewBrand({ ...newBrand, badgeColor: e.target.value })}
                  style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #CBD5E1', cursor: 'pointer' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  Brand Description
                </label>
                <textarea
                  rows={2}
                  value={newBrand.description}
                  onChange={(e) => setNewBrand({ ...newBrand, description: e.target.value })}
                  className="admin-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddBrandOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Add Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

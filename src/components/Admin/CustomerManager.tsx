'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Star, 
  X,
  Award
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Customer } from '../../types/admin';

export const CustomerManager: React.FC = () => {
  const { customers, addCustomer, deleteCustomer } = useShop();

  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '+880 1',
    city: 'Dhaka',
    division: 'Dhaka',
    status: 'active',
  });

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name?.trim()) return;

    addCustomer({
      id: `cust-${Date.now()}`,
      name: newCustomer.name,
      email: newCustomer.email || `${newCustomer.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      phone: newCustomer.phone || '+880 1700 000000',
      city: newCustomer.city || 'Dhaka',
      division: newCustomer.division || 'Dhaka',
      totalOrders: 0,
      totalSpent: 0,
      loyaltyPoints: 0,
      status: (newCustomer.status as 'active' | 'vip' | 'blocked') || 'active',
      joinedDate: new Date().toISOString().split('T')[0],
    });

    setIsAddOpen(false);
    setNewCustomer({
      name: '',
      email: '',
      phone: '+880 1',
      city: 'Dhaka',
      division: 'Dhaka',
      status: 'active',
    });
  };

  return (
    <div>
      {/* Top Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{ position: 'relative', minWidth: '280px', flex: 1, maxWidth: '420px' }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search shoppers by name, phone, email, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input"
            style={{ paddingLeft: '36px' }}
          />
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="btn btn-primary btn-sm"
        >
          <Plus size={16} />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Customers Table */}
      <div className="admin-table-container">
        <div className="admin-table-header">
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Shoppers Directory ({filteredCustomers.length})
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, marginTop: '2px' }}>
              ZAP Privilege Club accounts, lifetime purchase values, and loyalty points
            </p>
          </div>
        </div>

        {/* Desktop View */}
        <div className="admin-desktop-table-view" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact Info</th>
                <th>Location</th>
                <th>Orders</th>
                <th>Lifetime Spend (BDT)</th>
                <th>Loyalty Points</th>
                <th>Club Tier</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((cust) => (
                <tr key={cust.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: cust.status === 'vip' ? '#FEF3C7' : '#F1F5F9',
                        color: cust.status === 'vip' ? '#B45309' : '#0F172A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                      }}>
                        {cust.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: '#0F172A' }}>
                          {cust.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                          Member since: {cust.joinedDate}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                      {cust.phone}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                      {cust.email}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                      {cust.city}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                      {cust.division}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700 }}>
                      {cust.totalOrders} {cust.totalOrders === 1 ? 'order' : 'orders'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: '#D32F2F', fontSize: '0.9rem' }}>
                      ৳ {cust.totalSpent.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800, color: '#D97706' }}>
                      <Award size={14} />
                      <span>{cust.loyaltyPoints} pts</span>
                    </div>
                  </td>
                  <td>
                    {cust.status === 'vip' ? (
                      <span style={{
                        backgroundColor: '#FEF3C7',
                        color: '#B45309',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        <Star size={12} fill="#B45309" />
                        <span>PLATINUM VIP</span>
                      </span>
                    ) : (
                      <span style={{
                        backgroundColor: '#F1F5F9',
                        color: '#475569',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                      }}>
                        MEMBER
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => deleteCustomer(cust.id)}
                      style={{
                        backgroundColor: '#FEE2E2',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 8px',
                        cursor: 'pointer',
                        color: '#DC2626',
                      }}
                      title="Remove Customer Record"
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
          {filteredCustomers.map((cust) => (
            <div key={cust.id} className="admin-item-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: cust.status === 'vip' ? '#FEF3C7' : '#F1F5F9',
                    color: cust.status === 'vip' ? '#B45309' : '#0F172A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                  }}>
                    {cust.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>
                      {cust.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                      {cust.city}, {cust.division}
                    </div>
                  </div>
                </div>

                {cust.status === 'vip' ? (
                  <span style={{
                    backgroundColor: '#FEF3C7',
                    color: '#B45309',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}>
                    <Star size={11} fill="#B45309" /> VIP
                  </span>
                ) : (
                  <span style={{
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}>
                    MEMBER
                  </span>
                )}
              </div>

              <div style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                padding: '8px 10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.75rem',
              }}>
                <div>
                  <span style={{ color: '#64748B' }}>Total: </span>
                  <strong>৳ {cust.totalSpent.toLocaleString()}</strong> ({cust.totalOrders} orders)
                </div>
                <div style={{ color: '#D97706', fontWeight: 700 }}>
                  {cust.loyaltyPoints} pts
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '6px',
                borderTop: '1px solid #F1F5F9',
              }}>
                <a
                  href={`tel:${cust.phone}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#DCFCE7',
                    color: '#15803D',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                  }}
                >
                  <span>{cust.phone}</span>
                </a>

                <button
                  onClick={() => deleteCustomer(cust.id)}
                  style={{
                    backgroundColor: '#FEE2E2',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 8px',
                    cursor: 'pointer',
                    color: '#DC2626',
                  }}
                  title="Remove Customer Record"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '480px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Register Customer Account
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asif Mahmud"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  Mobile Phone *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+880 1711 000000"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="shopper@gmail.com"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div className="admin-grid-2col">
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                    City / Area
                  </label>
                  <input
                    type="text"
                    placeholder="Gulshan, Dhaka"
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                    Club Tier
                  </label>
                  <select
                    value={newCustomer.status}
                    onChange={(e) => setNewCustomer({ ...newCustomer, status: e.target.value as 'active' | 'vip' })}
                    className="admin-input"
                  >
                    <option value="active">Standard Member</option>
                    <option value="vip">Platinum VIP</option>
                  </select>
                </div>
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
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Search, 
  Truck, 
  FileText, 
  Trash2, 
  X, 
  Phone, 
  Printer
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Order, OrderStatus } from '../../types/admin';

export const OrderManager: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder } = useShop();

  const [activeStatusTab, setActiveStatusTab] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  // Dispatch Edit State
  const [courierInput, setCourierInput] = useState('');
  const [trackingInput, setTrackingInput] = useState('');

  const statusTabs = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  const filteredOrders = orders.filter((o) => {
    const matchesTab = activeStatusTab === 'ALL' || o.status === activeStatusTab;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search) ||
      o.city.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleOpenInvoice = (order: Order) => {
    setSelectedOrder(order);
    setCourierInput(order.courierName || 'Steadfast Express');
    setTrackingInput(order.trackingNumber || `SF-BD-${Math.floor(1000000 + Math.random() * 9000000)}`);
  };

  const handleUpdateCourier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    updateOrderStatus(
      selectedOrder.id,
      selectedOrder.status,
      courierInput,
      trackingInput
    );
    setSelectedOrder({
      ...selectedOrder,
      courierName: courierInput,
      trackingNumber: trackingInput,
    });
  };

  return (
    <div>
      {/* Status Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '20px',
      }}>
        {statusTabs.map((tab) => {
          const count = tab === 'ALL' ? orders.length : orders.filter(o => o.status === tab).length;
          const isActive = activeStatusTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveStatusTab(tab)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: isActive ? '#D32F2F' : '#E2E8F0',
                backgroundColor: isActive ? '#D32F2F' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#475569',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab}</span>
              <span style={{
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : '#F1F5F9',
                color: isActive ? '#FFFFFF' : '#64748B',
                padding: '1px 6px',
                borderRadius: '10px',
                fontSize: '0.72rem',
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '20px', maxWidth: '420px', position: 'relative' }}>
        <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Search by order ID, customer name, phone, or district..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-input"
          style={{ paddingLeft: '36px' }}
        />
      </div>

      {/* Orders Table */}
      <div className="admin-table-container">
        <div className="admin-table-header">
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Orders Pipeline ({filteredOrders.length} Orders)
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, marginTop: '2px' }}>
              Real-time synchronization with customer order tracker and logistics dispatch
            </p>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="admin-desktop-table-view" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Shipping Destination</th>
                <th>Payment</th>
                <th>Items</th>
                <th>Total (BDT)</th>
                <th>Live Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((ord) => (
                <tr key={ord.id}>
                  <td>
                    <div style={{ fontWeight: 800, color: '#D32F2F', fontSize: '0.88rem' }}>
                      {ord.orderNumber}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                      {new Date(ord.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.85rem' }}>
                      {ord.customerName}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                      {ord.customerPhone}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1E293B' }}>
                      {ord.city}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ord.shippingAddress}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      backgroundColor: ord.paymentMethod === 'bkash' ? '#FDF2F8' : ord.paymentMethod === 'card' ? '#EFF6FF' : '#F8FAFC',
                      color: ord.paymentMethod === 'bkash' ? '#BE185D' : ord.paymentMethod === 'card' ? '#1D4ED8' : '#334155',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                    }}>
                      {ord.paymentMethod}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: ord.paymentStatus === 'PAID' ? '#16A34A' : '#D97706', fontWeight: 700, marginTop: '2px' }}>
                      {ord.paymentStatus}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700 }}>
                      {ord.items.length} {ord.items.length === 1 ? 'pair' : 'pairs'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>
                      ৳ {ord.total.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <select
                      value={ord.status}
                      onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                      style={{
                        padding: '6px 10px',
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
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenInvoice(ord)}
                        style={{
                          backgroundColor: '#F1F5F9',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#0F172A',
                        }}
                      >
                        <FileText size={14} />
                        <span>Invoice</span>
                      </button>
                      <button
                        onClick={() => setDeletingOrderId(ord.id)}
                        style={{
                          backgroundColor: '#FEE2E2',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          cursor: 'pointer',
                          color: '#DC2626',
                        }}
                        title="Remove Order Record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Orders Cards View */}
        <div className="admin-mobile-cards-view" style={{ padding: '12px' }}>
          {filteredOrders.map((ord) => (
            <div key={ord.id} className="admin-item-card">
              {/* Header: Order Number, Date, Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div>
                  <div style={{ fontWeight: 900, color: '#D32F2F', fontSize: '0.95rem' }}>
                    {ord.orderNumber}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
                    {new Date(ord.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <span style={{
                  display: 'inline-block',
                  backgroundColor: ord.paymentMethod === 'bkash' ? '#FDF2F8' : ord.paymentMethod === 'card' ? '#EFF6FF' : '#F8FAFC',
                  color: ord.paymentMethod === 'bkash' ? '#BE185D' : ord.paymentMethod === 'card' ? '#1D4ED8' : '#334155',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                }}>
                  {ord.paymentMethod} • {ord.paymentStatus}
                </span>
              </div>

              {/* Customer Info & Direct Call Button */}
              <div style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                padding: '10px 12px',
                border: '1px solid #F1F5F9',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>
                    {ord.customerName}
                  </div>
                  <a
                    href={`tel:${ord.customerPhone}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#DCFCE7',
                      color: '#15803D',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textDecoration: 'none',
                    }}
                  >
                    <Phone size={12} />
                    <span>Call</span>
                  </a>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '3px' }}>
                  {ord.shippingAddress}, {ord.city}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '3px' }}>
                  {ord.items.length} {ord.items.length === 1 ? 'pair' : 'pairs'} ordered
                </div>
              </div>

              {/* Bottom: Total & Quick Status Dropdown */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '8px',
                borderTop: '1px solid #F1F5F9',
                gap: '8px',
                flexWrap: 'wrap',
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>TOTAL AMOUNT</div>
                  <div style={{ fontWeight: 900, color: '#0F172A', fontSize: '1.05rem' }}>
                    ৳ {ord.total.toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <select
                    value={ord.status}
                    onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.75rem',
                      fontWeight: 800,
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

                  <button
                    onClick={() => handleOpenInvoice(ord)}
                    style={{
                      backgroundColor: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      padding: '6px 8px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#0F172A',
                    }}
                  >
                    <FileText size={13} />
                    <span>Invoice</span>
                  </button>

                  <button
                    onClick={() => setDeletingOrderId(ord.id)}
                    style={{
                      backgroundColor: '#FEE2E2',
                      border: '1px solid #FECACA',
                      borderRadius: '6px',
                      padding: '6px 8px',
                      cursor: 'pointer',
                      color: '#DC2626',
                    }}
                    title="Delete Order"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice & Dispatch Modal */}
      {selectedOrder && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '640px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800 }}>ZAP LOGISTICS DISPATCH</span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#D32F2F', margin: 0 }}>
                  Invoice: {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Customer Details Box */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              border: '1px solid #E2E8F0',
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>RECIPIENT</div>
                <div style={{ fontWeight: 800, color: '#0F172A' }}>{selectedOrder.customerName}</div>
                <div style={{ fontSize: '0.8rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <Phone size={13} /> <span>{selectedOrder.customerPhone}</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>SHIPPING DESTINATION</div>
                <div style={{ fontSize: '0.82rem', color: '#0F172A', fontWeight: 600 }}>{selectedOrder.shippingAddress}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{selectedOrder.city}, {selectedOrder.division} Division</div>
              </div>
            </div>

            {/* Item Line Items */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
                Order Line Items
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedOrder.items.map((it) => (
                  <div
                    key={it.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#F8FAFC', flexShrink: 0 }}>
                        <Image
                          src={it.product.images[0]}
                          alt={it.product.name}
                          width={40}
                          height={40}
                          unoptimized
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A' }}>
                          {it.product.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          Size: {it.size} • Color: {it.color} • Qty: {it.quantity}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>
                      ৳ {it.totalPrice.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Breakdown */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '10px',
              padding: '14px',
              border: '1px solid #E2E8F0',
              marginBottom: '20px',
              fontSize: '0.82rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#64748B' }}>
                <span>Subtotal:</span>
                <span>৳ {selectedOrder.subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#64748B' }}>
                <span>Standard Delivery:</span>
                <span>{selectedOrder.shippingCost === 0 ? 'FREE' : `৳ ${selectedOrder.shippingCost}`}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#16A34A', fontWeight: 700 }}>
                  <span>Promotional Discount:</span>
                  <span>- ৳ {selectedOrder.discount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #E2E8F0', fontWeight: 900, color: '#0F172A', fontSize: '1rem' }}>
                <span>Grand Total:</span>
                <span style={{ color: '#D32F2F' }}>৳ {selectedOrder.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Courier & Tracking Assignment */}
            <form onSubmit={handleUpdateCourier} style={{
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
            }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={16} color="#D32F2F" />
                <span>Logistics & Courier Assignment</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                    Courier Service
                  </label>
                  <select
                    value={courierInput}
                    onChange={(e) => setCourierInput(e.target.value)}
                    className="admin-input"
                  >
                    <option value="Steadfast Express">Steadfast Express</option>
                    <option value="Pathao Courier">Pathao Courier</option>
                    <option value="Paperfly SmartLogistics">Paperfly SmartLogistics</option>
                    <option value="RedX Logistics">RedX Logistics</option>
                    <option value="SA Paribahan">SA Paribahan</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                    Consignment / Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    className="admin-input"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                Update Courier & Tracking Info
              </button>
            </form>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-secondary btn-sm"
              >
                <Printer size={14} />
                <span>Print Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="btn btn-primary btn-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingOrderId && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '420px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Delete Order Record?
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '20px' }}>
              This will remove the order consignment from the database. Customers will no longer be able to track this order ID.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setDeletingOrderId(null)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteOrder(deletingOrderId);
                  setDeletingOrderId(null);
                }}
                className="btn btn-primary btn-sm"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

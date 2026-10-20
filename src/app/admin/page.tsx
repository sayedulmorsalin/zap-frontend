'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, KeyRound, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import './admin.css';
import { AdminTab } from '../../types/admin';
import { AdminSidebar } from '../../components/Admin/AdminSidebar';
import { AdminHeader } from '../../components/Admin/AdminHeader';
import { DashboardOverview } from '../../components/Admin/DashboardOverview';
import { ProductManager } from '../../components/Admin/ProductManager';
import { OrderManager } from '../../components/Admin/OrderManager';
import { BrandCategoryManager } from '../../components/Admin/BrandCategoryManager';
import { CouponManager } from '../../components/Admin/CouponManager';
import { CustomerManager } from '../../components/Admin/CustomerManager';
import { StoreSettingsManager } from '../../components/Admin/StoreSettingsManager';
import { useShop } from '../../context/ShopContext';

export default function AdminPage() {
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem('zap_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [passkeyInput, setPasskeyInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { toastMessage, showToast } = useShop();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passkeyInput.trim();

    // Default passkeys: "admin" or "zap@admin2026"
    if (clean === 'admin' || clean === 'zap@admin2026' || clean === 'zap123') {
      try {
        sessionStorage.setItem('zap_admin_auth', 'true');
      } catch {}
      setIsAuthenticated(true);
      setErrorMessage('');
      showToast('Welcome, Executive Administrator.');
    } else {
      setErrorMessage('Access Denied: Invalid Security Passkey.');
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('zap_admin_auth');
    } catch {}
    setIsAuthenticated(false);
    setPasskeyInput('');
    showToast('Admin console locked.');
  };

  // If not authenticated, render private obsidian gate
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#09090B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle Background Glow */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '500px',
          backgroundColor: 'rgba(211, 47, 47, 0.08)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }} />

        <div style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#121217',
          border: '1px solid #27272A',
          borderRadius: '20px',
          padding: '36px 32px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
          position: 'relative',
          zIndex: 10,
        }}>
          {/* Top Shield Emblem */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #B91C1C 0%, #DC2626 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 24px rgba(220, 38, 38, 0.35)',
            }}>
              <Shield size={28} />
            </div>
            <div style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#EF4444',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}>
              RESTRICTED EXECUTIVE ACCESS
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
              ZAP Management Console
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '6px', margin: 0 }}>
              Enter your administrative passkey to access store controls.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '6px' }}>
                Admin Passkey
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={16} color="#71717A" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Enter security passkey..."
                  value={passkeyInput}
                  onChange={(e) => {
                    setPasskeyInput(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 38px',
                    borderRadius: '10px',
                    border: errorMessage ? '1.5px solid #EF4444' : '1px solid #3F3F46',
                    backgroundColor: '#18181B',
                    color: '#FFFFFF',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                  }}
                />
              </div>
            </div>

            {errorMessage && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#EF4444',
                fontSize: '0.78rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}>
                <AlertCircle size={14} />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span>Authenticate & Enter</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Footer return to store */}
          <div style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #27272A',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#94A3B8',
                fontSize: '0.78rem',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'color 0.15s ease',
              }}
            >
              <ArrowLeft size={14} />
              <span>Return to Store</span>
            </Link>

            <span style={{ fontSize: '0.7rem', color: '#52525B' }}>
              Passkey: <code>admin</code>
            </span>
          </div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardOverview setCurrentTab={setCurrentTab} />;
      case 'products':
        return <ProductManager />;
      case 'orders':
        return <OrderManager />;
      case 'brands':
        return <BrandCategoryManager />;
      case 'coupons':
        return <CouponManager />;
      case 'customers':
        return <CustomerManager />;
      case 'settings':
        return <StoreSettingsManager />;
      default:
        return <DashboardOverview setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="admin-layout">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#09090B',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 700,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid #27272A',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar */}
      <AdminSidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="admin-content">
        <AdminHeader
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="admin-main">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Lock,
  Unlock,
  RefreshCw,
  LogOut,
  Fingerprint,
  CheckCircle2,
} from 'lucide-react';
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
import { BannerManager } from '../../components/Admin/BannerManager';
import { StoreSettingsManager } from '../../components/Admin/StoreSettingsManager';
import { SecurityManager } from '../../components/Admin/SecurityManager';
import { AdminBottomNav } from '../../components/Admin/AdminBottomNav';
import { useShop } from '../../context/ShopContext';

type AuthStage = 'checking' | 'passkey' | 'pin' | 'authenticated';

export default function AdminPage() {
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authStage, setAuthStage] = useState<AuthStage>('checking');

  // Login credentials
  const [passkeyInput, setPasskeyInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [unlockPinInput, setUnlockPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rate-limiting / lockout state
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutSecondsRemaining, setLockoutSecondsRemaining] = useState(0);

  // Inactivity & Console Lock state
  const [isConsoleLocked, setIsConsoleLocked] = useState(false);
  const [inactivityTimeoutMinutes, setInactivityTimeoutMinutes] = useState(15);
  const [sessionRemainingSeconds, setSessionRemainingSeconds] = useState(28800);
  const lastActivityRef = useRef<number>(Date.now());

  const { toastMessage, showToast } = useShop();

  // 1. Initial Session Verification against Server
  const verifyCurrentSession = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/auth/status');
      const data = await res.json();

      if (data.locked) {
        setIsLockedOut(true);
        setLockoutSecondsRemaining(data.lockoutRemainingSeconds || 900);
      }

      if (data.authenticated) {
        setAuthStage('authenticated');
        if (data.expiresInSeconds) {
          setSessionRemainingSeconds(data.expiresInSeconds);
        }
      } else if (data.requiresPin) {
        setAuthStage('pin');
      } else {
        setAuthStage('passkey');
      }
    } catch {
      setAuthStage('passkey');
    }
  }, []);

  useEffect(() => {
    verifyCurrentSession();
  }, [verifyCurrentSession]);

  // 2. Lockout Countdown Timer
  useEffect(() => {
    if (!isLockedOut || lockoutSecondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setLockoutSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsLockedOut(false);
          setErrorMessage('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLockedOut, lockoutSecondsRemaining]);

  // 3. User Activity Listener for Auto-Lock
  useEffect(() => {
    if (authStage !== 'authenticated' || isConsoleLocked) return;

    const resetIdleTimer = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    events.forEach((evt) => window.addEventListener(evt, resetIdleTimer, { passive: true }));

    const checkInterval = setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;
      const thresholdMs = inactivityTimeoutMinutes * 60 * 1000;
      if (idleMs >= thresholdMs) {
        setIsConsoleLocked(true);
        showToast('Console auto-locked due to inactivity.');
      }
    }, 5000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, resetIdleTimer));
      clearInterval(checkInterval);
    };
  }, [authStage, isConsoleLocked, inactivityTimeoutMinutes, showToast]);

  // Step 1: Submit Master Passkey
  const handlePasskeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isLockedOut) return;

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: passkeyInput.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAuthStage('pin');
        setPasskeyInput('');
        setErrorMessage('');
      } else {
        if (data.locked) {
          setIsLockedOut(true);
          setLockoutSecondsRemaining(data.lockoutRemainingSeconds || 900);
        }
        setErrorMessage(data.error || 'Access Denied: Invalid Administrative Passkey.');
      }
    } catch {
      setErrorMessage('Security service unreachable. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Submit 6-digit Security PIN
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isLockedOut) return;

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAuthStage('authenticated');
        setPinInput('');
        setErrorMessage('');
        lastActivityRef.current = Date.now();
        showToast('Executive Console Authenticated.');
      } else {
        if (data.requiresLogin) {
          setAuthStage('passkey');
        }
        if (data.locked) {
          setIsLockedOut(true);
          setLockoutSecondsRemaining(data.lockoutRemainingSeconds || 900);
        }
        setErrorMessage(data.error || 'Access Denied: Invalid 6-Digit Security PIN.');
      }
    } catch {
      setErrorMessage('Security verification failure. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Unlock from Console Lock Screen
  const handleQuickUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: unlockPinInput.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsConsoleLocked(false);
        setUnlockPinInput('');
        setErrorMessage('');
        lastActivityRef.current = Date.now();
        showToast('Console unlocked.');
      } else {
        // If session was destroyed, prompt full login
        if (data.requiresLogin) {
          setIsConsoleLocked(false);
          setAuthStage('passkey');
          setErrorMessage('Session expired. Please re-authenticate.');
        } else {
          setErrorMessage(data.error || 'Invalid PIN.');
        }
      }
    } catch {
      setErrorMessage('Unlock verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Full Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch {}

    setAuthStage('passkey');
    setIsConsoleLocked(false);
    setPasskeyInput('');
    setPinInput('');
    setUnlockPinInput('');
    setErrorMessage('');
    showToast('Admin console secured and locked.');
  };

  // Manual Quick Lock
  const handleManualLock = () => {
    setIsConsoleLocked(true);
    setUnlockPinInput('');
    setErrorMessage('');
    showToast('Admin console locked.');
  };

  const formatLockoutTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading Screen
  if (authStage === 'checking') {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#09090B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #B91C1C 0%, #DC2626 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(220, 38, 38, 0.35)',
          }}>
            <Shield size={24} />
          </div>
          <div style={{ color: '#94A3B8', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.08em' }}>
            VERIFYING CRYPTOGRAPHIC ENVIRONMENT...
          </div>
        </div>
      </div>
    );
  }

  // --- Step 1: Master Passkey Obsidian Gate ---
  if (authStage === 'passkey') {
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
        {/* Glow */}
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
          {/* Header */}
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
              HIGH-SECURITY EXECUTIVE GATE (1 OF 2)
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
              ZAP Management Console
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '6px', margin: 0 }}>
              Enter your master administrative passkey to initiate verification.
            </p>
          </div>

          {/* Rate-Limit Lockout Banner */}
          {isLockedOut && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '6px',
            }}>
              <ShieldAlert size={28} color="#EF4444" />
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#EF4444' }}>
                SECURITY LOCKOUT ACTIVE
              </div>
              <p style={{ fontSize: '0.75rem', color: '#FCA5A5', margin: 0 }}>
                Too many incorrect attempts. Brute-force shield triggered.
              </p>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#FFFFFF',
                marginTop: '4px',
                backgroundColor: '#18181B',
                padding: '4px 14px',
                borderRadius: '8px',
                border: '1px solid #3F3F46',
              }}>
                {formatLockoutTime(lockoutSecondsRemaining)}
              </div>
            </div>
          )}

          {/* Passkey Form */}
          <form onSubmit={handlePasskeySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '6px' }}>
                Master Passkey
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={16} color="#71717A" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  autoFocus
                  disabled={isLockedOut || isSubmitting}
                  placeholder="Enter administrative passkey..."
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
                    opacity: isLockedOut ? 0.6 : 1,
                  }}
                />
              </div>
            </div>

            {errorMessage && !isLockedOut && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#EF4444',
                fontSize: '0.78rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isLockedOut || !passkeyInput.trim()}
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
                opacity: isSubmitting || isLockedOut ? 0.6 : 1,
                cursor: isSubmitting || isLockedOut ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={16} className="spin" />
                  <span>Validating Passkey...</span>
                </>
              ) : (
                <>
                  <span>Continue to 2FA PIN</span>
                  <ArrowRight size={16} />
                </>
              )}
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
              }}
            >
              <ArrowLeft size={14} />
              <span>Return to Store</span>
            </Link>

            <span style={{ fontSize: '0.7rem', color: '#52525B', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} color="#16A34A" />
              <span>TLS / SHA-256 Protected</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // --- Step 2: 6-Digit Security PIN (2FA Layer) ---
  if (authStage === 'pin') {
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
          backgroundColor: 'rgba(22, 163, 74, 0.08)',
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
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #15803D 0%, #16A34A 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 24px rgba(22, 163, 74, 0.35)',
            }}>
              <Fingerprint size={28} />
            </div>
            <div style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#22C55E',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}>
              SECOND FACTOR VERIFICATION (2 OF 2)
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
              6-Digit Security PIN
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '6px', margin: 0 }}>
              Passkey verified. Enter your executive 6-digit PIN to unlock console access.
            </p>
          </div>

          {/* Rate-Limit Lockout Banner */}
          {isLockedOut && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '6px',
            }}>
              <ShieldAlert size={28} color="#EF4444" />
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#EF4444' }}>
                SECURITY LOCKOUT ACTIVE
              </div>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#FFFFFF',
                marginTop: '4px',
              }}>
                {formatLockoutTime(lockoutSecondsRemaining)}
              </div>
            </div>
          )}

          {/* PIN Form */}
          <form onSubmit={handlePinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '8px', textAlign: 'center' }}>
                Enter 6-Digit PIN
              </label>

              <input
                type="password"
                maxLength={6}
                autoFocus
                required
                disabled={isLockedOut || isSubmitting}
                placeholder="••••••"
                value={pinInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setPinInput(val);
                  if (errorMessage) setErrorMessage('');
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: errorMessage ? '1.5px solid #EF4444' : '1px solid #3F3F46',
                  backgroundColor: '#18181B',
                  color: '#FFFFFF',
                  fontSize: '1.5rem',
                  letterSpacing: '0.35em',
                  textAlign: 'center',
                  outline: 'none',
                }}
              />
            </div>

            {errorMessage && !isLockedOut && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#EF4444',
                fontSize: '0.78rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isLockedOut || pinInput.length !== 6}
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
                opacity: isSubmitting || isLockedOut || pinInput.length !== 6 ? 0.6 : 1,
                cursor: isSubmitting || isLockedOut || pinInput.length !== 6 ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={16} className="spin" />
                  <span>Verifying PIN...</span>
                </>
              ) : (
                <>
                  <Unlock size={16} />
                  <span>Authorize &amp; Open Console</span>
                </>
              )}
            </button>
          </form>

          {/* Back to passkey option */}
          <div style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #27272A',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <button
              type="button"
              onClick={() => {
                setAuthStage('passkey');
                setErrorMessage('');
              }}
              style={{
                background: 'none',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#94A3B8',
                fontSize: '0.78rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Passkey</span>
            </button>

            <span style={{ fontSize: '0.7rem', color: '#52525B' }}>
              Dual-Factor Active
            </span>
          </div>
        </div>
      </div>
    );
  }

  // --- Active Tab Renderer ---
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardOverview setCurrentTab={setCurrentTab} />;
      case 'products':
        return <ProductManager />;
      case 'orders':
        return <OrderManager />;
      case 'banners':
        return <BannerManager />;
      case 'brands':
        return <BrandCategoryManager />;
      case 'coupons':
        return <CouponManager />;
      case 'customers':
        return <CustomerManager />;
      case 'settings':
        return <StoreSettingsManager />;
      case 'security':
        return (
          <SecurityManager
            onManualLock={handleManualLock}
            onLogout={handleLogout}
            sessionRemainingSeconds={sessionRemainingSeconds}
            inactivityTimeoutMinutes={inactivityTimeoutMinutes}
            setInactivityTimeoutMinutes={setInactivityTimeoutMinutes}
          />
        );
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

      {/* --- Inactivity / Manual Quick Lock Screen Overlay --- */}
      {isConsoleLocked && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(9, 9, 11, 0.94)',
          backdropFilter: 'blur(16px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '400px',
            backgroundColor: '#121217',
            border: '1px solid #27272A',
            borderRadius: '20px',
            padding: '36px 30px',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8)',
            textAlign: 'center',
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              backgroundColor: '#18181B',
              border: '1px solid #3F3F46',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#EF4444',
            }}>
              <Lock size={26} />
            </div>

            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#EF4444', letterSpacing: '0.1em' }}>
              SECURITY SCREEN
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#FFFFFF', margin: '4px 0 6px' }}>
              Console Locked
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0 0 20px' }}>
              Enter your 6-digit Security PIN to immediately unlock and resume your session.
            </p>

            <form onSubmit={handleQuickUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="password"
                maxLength={6}
                autoFocus
                required
                disabled={isSubmitting}
                placeholder="••••••"
                value={unlockPinInput}
                onChange={(e) => {
                  setUnlockPinInput(e.target.value.replace(/\D/g, ''));
                  if (errorMessage) setErrorMessage('');
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: errorMessage ? '1.5px solid #EF4444' : '1px solid #3F3F46',
                  backgroundColor: '#18181B',
                  color: '#FFFFFF',
                  fontSize: '1.4rem',
                  letterSpacing: '0.3em',
                  textAlign: 'center',
                  outline: 'none',
                }}
              />

              {errorMessage && (
                <div style={{ color: '#EF4444', fontSize: '0.75rem', fontWeight: 600 }}>
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || unlockPinInput.length !== 6}
                className="btn btn-primary"
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {isSubmitting ? <RefreshCw size={16} className="spin" /> : <Unlock size={16} />}
                <span>Unlock Console</span>
              </button>
            </form>

            <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #27272A' }}>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#71717A',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#71717A')}
              >
                <LogOut size={14} />
                <span>Or Sign Out Completely</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close menu backdrop"
        />
      )}

      {/* Sidebar */}
      <AdminSidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setIsSidebarOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={handleLogout}
        onManualLock={handleManualLock}
      />

      {/* Main Content Area */}
      <div className="admin-content">
        <AdminHeader
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onManualLock={handleManualLock}
        />

        <main className="admin-main">
          {renderTabContent()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <AdminBottomNav
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setIsSidebarOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
    </div>
  );
}

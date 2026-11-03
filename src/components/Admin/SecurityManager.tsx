'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  KeyRound,
  Clock,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  UserCheck,
  Server,
  Zap,
} from 'lucide-react';
import { AuditLogEntry } from '../../lib/adminSecurity';

interface SecurityManagerProps {
  onManualLock: () => void;
  onLogout: () => void;
  sessionRemainingSeconds?: number;
  inactivityTimeoutMinutes: number;
  setInactivityTimeoutMinutes: (mins: number) => void;
}

export const SecurityManager: React.FC<SecurityManagerProps> = ({
  onManualLock,
  onLogout,
  sessionRemainingSeconds = 28800,
  inactivityTimeoutMinutes,
  setInactivityTimeoutMinutes,
}) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'ALERT' | 'WARNING' | 'SUCCESS'>('ALL');

  // Change credentials state
  const [currentPasskey, setCurrentPasskey] = useState('');
  const [newPasskey, setNewPasskey] = useState('');
  const [newPin, setNewPin] = useState('');
  const [showCurrentPasskey, setShowCurrentPasskey] = useState(false);
  const [showNewPasskey, setShowNewPasskey] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [updatingCreds, setUpdatingCreds] = useState(false);
  const [credMessage, setCredMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Live session countdown
  const [secondsLeft, setSecondsLeft] = useState(sessionRemainingSeconds);

  useEffect(() => {
    setSecondsLeft(sessionRemainingSeconds);
  }, [sessionRemainingSeconds]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSeconds = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const remainingSec = sec % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${remainingSec.toString().padStart(2, '0')}`;
  };

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/admin/auth/audit');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.logs)) {
          setLogs(json.logs);
        }
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredMessage(null);

    if (!currentPasskey) {
      setCredMessage({ type: 'error', text: 'Please enter your current passkey to authorize changes.' });
      return;
    }

    if (!newPasskey && !newPin) {
      setCredMessage({ type: 'error', text: 'Please enter a new Passkey or 6-digit PIN to update.' });
      return;
    }

    if (newPasskey && newPasskey.trim().length < 8) {
      setCredMessage({ type: 'error', text: 'New Passkey must be at least 8 characters long.' });
      return;
    }

    if (newPin && !/^\d{6}$/.test(newPin.trim())) {
      setCredMessage({ type: 'error', text: 'Security PIN must be exactly 6 numeric digits (0-9).' });
      return;
    }

    setUpdatingCreds(true);
    try {
      const res = await fetch('/api/admin/auth/update-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPasskey,
          newPasskey: newPasskey.trim() || undefined,
          newPin: newPin.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setCredMessage({ type: 'success', text: json.message || 'Credentials updated successfully!' });
        setCurrentPasskey('');
        setNewPasskey('');
        setNewPin('');
        fetchLogs();
      } else {
        setCredMessage({ type: 'error', text: json.error || 'Failed to update credentials.' });
      }
    } catch {
      setCredMessage({ type: 'error', text: 'Network or server error while updating credentials.' });
    } finally {
      setUpdatingCreds(false);
    }
  };

  const handleExportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `zap-security-audit-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredLogs = logs.filter((log) => {
    if (filterType === 'ALL') return true;
    return log.status === filterType;
  });

  return (
    <div style={{ maxWidth: '1100px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Executive Security Status Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #09090B 0%, #18181B 100%)',
        border: '1px solid #27272A',
        borderRadius: '16px',
        padding: '24px 28px',
        color: '#FFFFFF',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '200px',
          height: '200px',
          backgroundColor: 'rgba(220, 38, 38, 0.08)',
          borderRadius: '50%',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)',
            }}>
              <ShieldCheck size={30} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  backgroundColor: '#166534',
                  color: '#86EFAC',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                }}>
                  SECURITY RATING: A+ MAXIMUM
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>• Server-Side Enforced</span>
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                High-Security Administration Shield
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#A1A1AA', margin: '4px 0 0' }}>
                Dual-layer passkey &amp; PIN authentication, constant-time cryptography, and brute-force mitigation active.
              </p>
            </div>
          </div>

          {/* Quick Lock & Terminate Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onManualLock}
              className="btn"
              style={{
                backgroundColor: '#27272A',
                color: '#F4F4F5',
                border: '1px solid #3F3F46',
                padding: '10px 16px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <Lock size={15} />
              <span>Lock Console Now</span>
            </button>

            <button
              onClick={onLogout}
              className="btn"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#EF4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '10px 16px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <span>Force Global Logout</span>
            </button>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid #27272A',
        }}>
          <div style={{ backgroundColor: '#18181B', padding: '12px 14px', borderRadius: '10px', border: '1px solid #27272A' }}>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>SESSION ENCRYPTION</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#4ADE80', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} />
              <span>HMAC-SHA256 Signed</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#18181B', padding: '12px 14px', borderRadius: '10px', border: '1px solid #27272A' }}>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>MULTI-FACTOR GATE</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#4ADE80', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} />
              <span>Passkey + 6-Digit PIN</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#18181B', padding: '12px 14px', borderRadius: '10px', border: '1px solid #27272A' }}>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>BRUTE-FORCE MITIGATION</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#4ADE80', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} />
              <span>5 Tries / 15m Lockout</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#18181B', padding: '12px 14px', borderRadius: '10px', border: '1px solid #27272A' }}>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>SESSION TIMEOUT</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#38BDF8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} />
              <span>{formatSeconds(secondsLeft)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Credential Management & Policy Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Update Credentials Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '24px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={18} color="#D32F2F" />
            <span>Update Security Passkeys</span>
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 16px' }}>
            Change your Master Administrative Passkey or 6-digit Security PIN. Requires current passkey for authorization.
          </p>

          {credMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '0.8rem',
              fontWeight: 600,
              backgroundColor: credMessage.type === 'success' ? '#F0FDF4' : '#FEF2F2',
              color: credMessage.type === 'success' ? '#15803D' : '#DC2626',
              border: `1px solid ${credMessage.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
            }}>
              {credMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span>{credMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Current Passkey (Required)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPasskey ? 'text' : 'password'}
                  required
                  placeholder="Enter current admin passkey"
                  value={currentPasskey}
                  onChange={(e) => setCurrentPasskey(e.target.value)}
                  className="admin-input"
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPasskey(!showCurrentPasskey)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  {showCurrentPasskey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                New Master Passkey (Min 8 chars, leave blank to keep unchanged)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPasskey ? 'text' : 'password'}
                  placeholder="Enter strong new passkey..."
                  value={newPasskey}
                  onChange={(e) => setNewPasskey(e.target.value)}
                  className="admin-input"
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPasskey(!showNewPasskey)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  {showNewPasskey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                New 6-Digit 2FA Security PIN (Leave blank to keep unchanged)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPin ? 'text' : 'password'}
                  maxLength={6}
                  placeholder="e.g. 849201"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="admin-input"
                  style={{ paddingRight: '40px', letterSpacing: '0.15em', fontWeight: 800 }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPin(!showNewPin)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  {showNewPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingCreds}
              className="btn btn-primary"
              style={{
                marginTop: '6px',
                padding: '10px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {updatingCreds ? <RefreshCw size={16} className="spin" /> : <Lock size={16} />}
              <span>Save &amp; Apply Security Credentials</span>
            </button>
          </form>
        </div>

        {/* Security Policies & Controls Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '24px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#D32F2F" />
              <span>Inactivity Auto-Lock Duration</span>
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 16px' }}>
              Automatically lock the executive console when no keyboard or mouse activity is detected, protecting the console from unauthorized physical access.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
              {[5, 15, 30, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setInactivityTimeoutMinutes(mins)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: inactivityTimeoutMinutes === mins ? '2px solid #D32F2F' : '1px solid #E2E8F0',
                    backgroundColor: inactivityTimeoutMinutes === mins ? '#FEF2F2' : '#F8FAFC',
                    color: inactivityTimeoutMinutes === mins ? '#991B1B' : '#334155',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '2px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{mins} Minutes</span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 500, color: '#64748B' }}>
                    {mins === 5 ? 'Ultra High (Storefront)' : mins === 15 ? 'Recommended (Standard)' : mins === 30 ? 'Extended' : 'Maximum'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div style={{
            backgroundColor: '#F8FAFC',
            borderRadius: '10px',
            padding: '14px',
            border: '1px solid #E2E8F0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
              <Server size={14} color="#64748B" />
              <span>Environment Security Variables</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', lineHeight: '1.4' }}>
              Production deployments can override secrets via server env variables:
              <code> ADMIN_PANEL_SECRET</code>, <code>ADMIN_SECURITY_PIN</code>, and <code>ADMIN_SESSION_SECRET</code>.
            </div>
          </div>
        </div>
      </div>

      {/* 3. Security Audit Log Section */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '24px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} color="#D32F2F" />
              <span>Live Security &amp; Access Audit Trail</span>
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '4px 0 0' }}>
              Real-time server log of authentication attempts, rate limit blocks, and administrative actions.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Filter buttons */}
            <div style={{ display: 'flex', backgroundColor: '#F1F5F9', borderRadius: '8px', padding: '3px' }}>
              {(['ALL', 'SUCCESS', 'WARNING', 'ALERT'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterType(filter)}
                  style={{
                    border: 'none',
                    backgroundColor: filterType === filter ? '#FFFFFF' : 'transparent',
                    color: filterType === filter ? '#0F172A' : '#64748B',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    boxShadow: filterType === filter ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>

            <button
              onClick={fetchLogs}
              disabled={loadingLogs}
              title="Refresh Audit Trail"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={13} className={loadingLogs ? 'spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportLogs}
              title="Export Log as JSON"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              <Download size={13} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Audit Log Table */}
        <div style={{ overflowX: 'auto', border: '1px solid #F1F5F9', borderRadius: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', fontSize: '0.72rem' }}>EVENT</th>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', fontSize: '0.72rem' }}>STATUS</th>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', fontSize: '0.72rem' }}>DETAILS</th>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', fontSize: '0.72rem' }}>IP ADDRESS</th>
                <th style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', fontSize: '0.72rem' }}>TIMESTAMP</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>
                    No audit records match the current filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const statusColors = {
                    SUCCESS: { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' },
                    WARNING: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
                    ALERT: { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' },
                  }[log.status] || { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };

                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap' }}>
                        <code>{log.event}</code>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          backgroundColor: statusColors.bg,
                          color: statusColors.text,
                          border: `1px solid ${statusColors.border}`,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                        }}>
                          {log.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#334155', maxWidth: '340px' }}>
                        {log.details}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#64748B', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {log.ip}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#64748B', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • {new Date(log.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


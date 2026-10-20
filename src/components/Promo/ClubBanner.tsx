'use client';

import React from 'react';
import { Gift, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const ClubBanner: React.FC = () => {
  const { showToast } = useShop();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('🎉 Welcome to ZAP Club! Tk 500 Welcome Voucher credited.');
  };

  return (
    <section style={{
      backgroundColor: '#111827',
      color: '#FFFFFF',
      padding: '50px 0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative Gradient Glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '20%',
        transform: 'translate(-50%, -50%)',
        width: '450px',
        height: '450px',
        background: 'radial-gradient(circle, rgba(211, 47, 47, 0.25) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '36px',
          alignItems: 'center',
        }}>
          {/* Left Text */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(211, 47, 47, 0.2)',
              border: '1px solid rgba(211, 47, 47, 0.4)',
              color: '#FCA5A5',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              marginBottom: '14px',
            }}>
              <Award size={14} color="#EF4444" />
              <span>ZAP PRIVILEGE CLUB</span>
            </div>

            <h2 style={{
              fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              fontStyle: 'italic',
              marginBottom: '12px',
            }}>
              STEP INTO EXCLUSIVE PRIVILEGES
            </h2>

            <p style={{
              color: '#94A3B8',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              marginBottom: '20px',
            }}>
              Join over 500,000 discerning footwear enthusiasts across Bangladesh. Earn reward points with every step, unlock VIP private drops, and receive an instant birthday voucher.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#22C55E" />
                <span style={{ fontSize: '0.825rem', color: '#E2E8F0' }}>1 Point per Tk 100 Spent</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Gift size={16} color="#F59E0B" />
                <span style={{ fontSize: '0.825rem', color: '#E2E8F0' }}>Tk 500 Birthday Gift</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#EC4899" />
                <span style={{ fontSize: '0.825rem', color: '#E2E8F0' }}>VIP Early Eid Sale Access</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#22C55E" />
                <span style={{ fontSize: '0.825rem', color: '#E2E8F0' }}>Free Lifetime Store Returns</span>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div style={{
            backgroundColor: '#1F2937',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid #374151',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>
              Join ZAP Club Today
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#9CA3AF', marginBottom: '20px' }}>
              Enter your mobile number to activate instant membership and claim Tk 500 coupon.
            </p>

            <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '6px' }}>
                  FULL NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Ahmed"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #4B5563',
                    backgroundColor: '#111827',
                    color: '#FFFFFF',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '6px' }}>
                  MOBILE NUMBER (+880)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="017XXXXXXXX"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #4B5563',
                    backgroundColor: '#111827',
                    color: '#FFFFFF',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '13px',
                  fontSize: '0.925rem',
                }}
              >
                Claim Tk 500 & Join Club
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

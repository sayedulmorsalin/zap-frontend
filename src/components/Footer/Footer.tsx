'use client';

import React from 'react';
import { 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const Footer: React.FC = () => {
  const { 
    setSelectedCategory, 
    setSelectedBrand, 
    setSelectedGender, 
    setIsTrackOrderOpen, 
    setIsSizeGuideOpen
  } = useShop();

  const scrollToCatalog = () => {
    const catalogElem = document.getElementById('product-catalog');
    if (catalogElem) catalogElem.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer style={{
      backgroundColor: '#0F172A',
      color: '#FFFFFF',
      borderTop: '1px solid #1E293B',
      marginTop: 'auto',
    }}>


      {/* Main Footer Links Columns */}
      <div style={{ padding: '60px 0 40px' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '40px',
          }}>
            {/* Col 1: About ZAP Footwear */}
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                background: 'linear-gradient(135deg, #09090B 0%, #18181B 100%)',
                border: '1px solid #27272A',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '1.5rem',
                letterSpacing: '0.04em',
                padding: '3px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
              }}>
                <span>ZAP</span>
                <span style={{ color: '#E11D48', fontSize: '1.5rem', lineHeight: 1 }}>.</span>
              </div>
              <p style={{
                color: '#94A3B8',
                fontSize: '0.825rem',
                lineHeight: 1.6,
                marginBottom: '20px',
              }}>
                The premier contemporary footwear destination in Bangladesh. Curating mastercrafted genuine leather oxfords, engineered kinetic athletic runners, and ergonomic everyday comfort silhouettes.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem', color: '#CBD5E1' }}>
                  <Phone size={15} color="#EF4444" />
                  <span>Hotline: <strong>09666-200300</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem', color: '#CBD5E1' }}>
                  <Clock size={15} color="#94A3B8" />
                  <span>9:00 AM &ndash; 10:00 PM (Daily)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem', color: '#CBD5E1' }}>
                  <MapPin size={15} color="#EF4444" />
                  <span>Tongi Industrial Area, Gazipur, BD</span>
                </div>
              </div>
            </div>

            {/* Col 2: Customer Care */}
            <div>
              <h4 style={footerColHeading}>CUSTOMER CARE</h4>
              <ul style={footerListStyle}>
                <li>
                  <button onClick={() => setIsTrackOrderOpen(true)} style={footerLinkBtn}>
                    Track Your Order
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsSizeGuideOpen(true)} style={footerLinkBtn}>
                    ZAP Footwear Sizing Guide
                  </button>
                </li>
                <li>
                  <a href="#product-catalog" onClick={scrollToCatalog} style={footerLinkStyle}>
                    7 Days Store Exchange Policy
                  </a>
                </li>
                <li>
                  <span style={footerLinkStyle}>
                    Store Locator (260+ Outlets)
                  </span>
                </li>
                <li>
                  <span style={footerLinkStyle}>
                    Warranty & Shoe Care Tips
                  </span>
                </li>
                <li>
                  <span style={footerLinkStyle}>
                    Cash on Delivery Terms
                  </span>
                </li>
              </ul>
            </div>

            {/* Col 3: Footwear Categories */}
            <div>
              <h4 style={footerColHeading}>FOOTWEAR CATEGORIES</h4>
              <ul style={footerListStyle}>
                <li>
                  <button onClick={() => { setSelectedCategory('formal'); setSelectedGender('MEN'); scrollToCatalog(); }} style={footerLinkBtn}>
                    Men&apos;s Leather Formal Shoes
                  </button>
                </li>
                <li>
                  <button onClick={() => { setSelectedBrand('power'); scrollToCatalog(); }} style={footerLinkBtn}>
                    Power Velocity Athletic Runners
                  </button>
                </li>
                <li>
                  <button onClick={() => { setSelectedBrand('hush-puppies'); scrollToCatalog(); }} style={footerLinkBtn}>
                    Hush Puppies Executive Comfort
                  </button>
                </li>
                <li>
                  <button onClick={() => { setSelectedCategory('heels'); setSelectedGender('WOMEN'); scrollToCatalog(); }} style={footerLinkBtn}>
                    Marie Claire Parisian Heels
                  </button>
                </li>
                <li>
                  <button onClick={() => { setSelectedBrand('north-star'); scrollToCatalog(); }} style={footerLinkBtn}>
                    North Star Canvas Sneakers
                  </button>
                </li>
                <li>
                  <button onClick={() => { setSelectedBrand('zap-comfit'); scrollToCatalog(); }} style={footerLinkBtn}>
                    ZAP Comfit Ergonomic Walkers
                  </button>
                </li>
                <li>
                  <button onClick={() => { setSelectedBrand('bubblegummers'); scrollToCatalog(); }} style={footerLinkBtn}>
                    Bubblegummers Scented Kids Shoes
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Payment Partners & Security */}
            <div>
              <h4 style={footerColHeading}>PAYMENT PARTNERS & TRUST</h4>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.5, marginBottom: '16px' }}>
                We support all major payment methods in Bangladesh with instant SMS order verification.
              </p>

              {/* Payment Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                {['bKash', 'Nagad', 'Visa', 'Mastercard', 'AMEX', 'Cash on Delivery'].map((m) => (
                  <span
                    key={m}
                    style={{
                      backgroundColor: '#1E293B',
                      border: '1px solid #334155',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#E2E8F0',
                    }}
                  >
                    {m}
                  </span>
                ))}
              </div>

              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <ShieldCheck size={24} color="#22C55E" />
                <div style={{ fontSize: '0.72rem', color: '#CBD5E1' }}>
                  <strong>256-Bit SSL Encryption</strong>
                  <div>Safe, verified and secure checkout</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright & Disclaimer Bar */}
      <div style={{
        borderTop: '1px solid #1E293B',
        padding: '20px 0',
        backgroundColor: '#090D16',
        fontSize: '0.78rem',
        color: '#64748B',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            &copy; 2026 <strong>ZAP Footwear Bangladesh Ltd.</strong> All Rights Reserved. Mastercrafted in Dhaka.
          </div>

          <div style={{ display: 'flex', gap: '18px' }}>
            <span style={{ color: '#94A3B8' }}>Privacy Policy</span>
            <span style={{ color: '#94A3B8' }}>Terms of Service</span>
            <span style={{ color: '#94A3B8' }}>Store Directory</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const footerColHeading: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: 800,
  letterSpacing: '0.08em',
  color: '#FFFFFF',
  marginBottom: '16px',
};

const footerListStyle: React.CSSProperties = {
  listStyle: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const footerLinkBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#94A3B8',
  fontSize: '0.825rem',
  cursor: 'pointer',
  textAlign: 'left',
  padding: 0,
  transition: 'color 0.15s ease',
};

const footerLinkStyle: React.CSSProperties = {
  color: '#94A3B8',
  fontSize: '0.825rem',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'color 0.15s ease',
};

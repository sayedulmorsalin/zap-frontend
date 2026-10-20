'use client';

import React from 'react';
import { X, Ruler } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const SizeGuideModal: React.FC = () => {
  const { isSizeGuideOpen, setIsSizeGuideOpen } = useShop();

  if (!isSizeGuideOpen) return null;

  const sizeChart = [
    { eu: '36', uk: '3.5', us: '4.5', cm: '23.0 cm', inch: '9.06"' },
    { eu: '37', uk: '4.0', us: '5.0', cm: '23.5 cm', inch: '9.25"' },
    { eu: '38', uk: '5.0', us: '6.0', cm: '24.0 cm', inch: '9.45"' },
    { eu: '39', uk: '6.0', us: '7.0', cm: '24.8 cm', inch: '9.76"' },
    { eu: '40', uk: '6.5', us: '7.5', cm: '25.5 cm', inch: '10.04"' },
    { eu: '41', uk: '7.5', us: '8.5', cm: '26.2 cm', inch: '10.31"' },
    { eu: '42', uk: '8.0', us: '9.0', cm: '26.8 cm', inch: '10.55"' },
    { eu: '43', uk: '9.0', us: '10.0', cm: '27.5 cm', inch: '10.83"' },
    { eu: '44', uk: '9.5', us: '10.5', cm: '28.2 cm', inch: '11.10"' },
    { eu: '45', uk: '10.5', us: '11.5', cm: '29.0 cm', inch: '11.42"' },
  ];

  return (
    <div className="modal-backdrop" onClick={() => setIsSizeGuideOpen(false)}>
      <div
        className="animate-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          maxWidth: '640px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        <button
          onClick={() => setIsSizeGuideOpen(false)}
          aria-label="Close Size Guide"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B',
          }}
        >
          <X size={18} />
        </button>

        <div style={{ marginBottom: '20px' }}>
          <div className="zap-badge" style={{ marginBottom: '8px' }}>
            <span>FOOTWEAR SIZING</span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ruler size={22} color="#D32F2F" />
            <span>ZAP Footwear Sizing Guide</span>
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.85rem' }}>
            Bangladesh and EU standards. If in between sizes, we recommend choosing one size up.
          </p>
        </div>

        {/* Table */}
        <div style={{
          overflowX: 'auto',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          marginBottom: '24px',
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'center',
            fontSize: '0.85rem',
          }}>
            <thead>
              <tr style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>EU / BD</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>UK</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>US</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Foot Length (CM)</th>
                <th style={{ padding: '10px 12px', fontWeight: 700 }}>Inches</th>
              </tr>
            </thead>
            <tbody>
              {sizeChart.map((row, idx) => (
                <tr
                  key={row.eu}
                  style={{
                    backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                    borderBottom: '1px solid #E2E8F0',
                  }}
                >
                  <td style={{ padding: '10px 12px', fontWeight: 800, color: '#D32F2F' }}>
                    {row.eu}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#334155' }}>{row.uk}</td>
                  <td style={{ padding: '10px 12px', color: '#334155' }}>{row.us}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0F172A' }}>{row.cm}</td>
                  <td style={{ padding: '10px 12px', color: '#64748B' }}>{row.inch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* How to Measure Info */}
        <div style={{
          backgroundColor: '#FFEBEE',
          borderRadius: '12px',
          border: '1px solid #FFCDD2',
          padding: '16px',
        }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#9A0007', marginBottom: '6px' }}>
            How to Measure Your Foot Length:
          </h4>
          <ol style={{ fontSize: '0.8rem', color: '#B71C1C', paddingLeft: '18px', lineHeight: 1.5 }}>
            <li>Place a sheet of paper on a hard floor against a wall.</li>
            <li>Stand on the paper with your heel firmly touching the wall.</li>
            <li>Mark the tip of your longest toe with a pencil.</li>
            <li>Measure the distance from the edge of the paper to the mark in centimeters.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import NextImage from 'next/image';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  UploadCloud, 
  Loader2, 
  Sparkles, 
  Zap, 
  Image as ImageIcon, 
  Check, 
  RotateCcw, 
  ShieldCheck,
  ArrowRight,
  X
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { HeroSlide, BannerTargetType } from '../../types/banner';
import { uploadApiFiles } from '../../services/api';
import { RichTextEditor } from './RichTextEditor';
import { FormattedText } from '../Common/FormattedText';

const PRESET_ACCENT_COLORS = [
  { name: 'Zap Crimson', hex: '#D32F2F' },
  { name: 'Velocity Rose', hex: '#E11D48' },
  { name: 'Royal Purple', hex: '#9333EA' },
  { name: 'Executive Amber', hex: '#B45309' },
  { name: 'Pacific Blue', hex: '#2563EB' },
  { name: 'Emerald Peak', hex: '#059669' },
  { name: 'Cyber Cyan', hex: '#0891B2' },
  { name: 'Obsidian Slate', hex: '#475569' },
];

const PRESET_IMAGES = [
  { label: 'Zap Master Leather Oxford', url: '/images/hero-banner.jpg' },
  { label: 'Power Velocity Nitro Runner (Red)', url: '/images/shoe-power-runner.jpg' },
  { label: 'Hush Puppies Executive Leather', url: '/images/shoe-leather-formal.jpg' },
  { label: 'Marie Claire Parisian Stiletto Heels', url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80' },
  { label: 'Sneakers Neon Runner (Unsplash)', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80' },
  { label: 'Urban Leather Loafers (Unsplash)', url: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=800&q=80' },
];

export const BannerManager: React.FC = () => {
  const { 
    heroSlides, 
    addHeroSlide, 
    updateHeroSlide, 
    deleteHeroSlide, 
    reorderHeroSlides,
    resetBannersToDefaults,
    brands
  } = useShop();

  const [activeTab, setActiveTab] = useState<'hero' | 'restore'>('hero');

  // Hero Slide Modal state
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [editingHeroSlide, setEditingHeroSlide] = useState<HeroSlide | null>(null);
  const [heroForm, setHeroForm] = useState<HeroSlide>({
    id: '',
    tag: '',
    headline: '',
    subheadline: '',
    description: '',
    image: '/images/hero-banner.jpg',
    badgeText: 'CRAFTED EXCELLENCE',
    badgeSubtext: '100% Certified ZAP Quality',
    ctaText: 'SHOP SNEAKERS',
    ctaTargetType: 'brand',
    ctaTargetValue: 'power',
    secondaryCtaText: 'VIEW RUNNING GEAR',
    secondaryCtaTargetType: 'category',
    secondaryCtaTargetValue: 'sneakers',
    accentColor: '#D32F2F',
    isActive: true,
    order: 1,
  });

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);

  // ── Open Hero Modal for New Slide ──
  const handleOpenNewHero = () => {
    setEditingHeroSlide(null);
    setHeroForm({
      id: `hero-${Date.now()}`,
      tag: 'NEW RELEASE 2026',
      headline: 'AERO STRIKE HYBRID',
      subheadline: 'ENGINEERED SPEED & ENDURANCE',
      description: 'Ultralight performance footbed with carbon-infused rebound plate for high tempo marathon training.',
      image: '/images/shoe-power-runner.jpg',
      badgeText: 'CRAFTED EXCELLENCE',
      badgeSubtext: '100% Certified ZAP Quality',
      ctaText: 'SHOP COLLECTION',
      ctaTargetType: 'brand',
      ctaTargetValue: 'power',
      secondaryCtaText: 'EXPLORE STYLES',
      secondaryCtaTargetType: 'all',
      secondaryCtaTargetValue: 'all',
      accentColor: '#D32F2F',
      isActive: true,
      order: (heroSlides?.length || 0) + 1,
    });
    setIsHeroModalOpen(true);
  };

  // ── Open Hero Modal for Edit ──
  const handleOpenEditHero = (slide: HeroSlide) => {
    setEditingHeroSlide(slide);
    setHeroForm({ ...slide });
    setIsHeroModalOpen(true);
  };

  // ── Save Hero Slide ──
  const handleSaveHero = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroForm.headline.trim()) return;

    if (editingHeroSlide) {
      updateHeroSlide(heroForm);
    } else {
      addHeroSlide(heroForm);
    }
    setIsHeroModalOpen(false);
  };

  // ── Move Hero Slide Up/Down ──
  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const newSlides = [...heroSlides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    // Re-assign order indices
    const updated = newSlides.map((s, idx) => ({ ...s, order: idx + 1 }));
    reorderHeroSlides(updated);
  };

  // ── Handle Image Upload (SeaweedFS with FileReader fallback) ──
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      // 1. Try uploading to backend API storage (SeaweedFS S3 or server disk)
      const res = await uploadApiFiles([file], 'BANNER');
      if (res.success && res.data && res.data[0]?.url) {
        setHeroForm((prev) => ({ ...prev, image: res.data![0].url }));
        setIsUploadingImage(false);
        return;
      }
    } catch (err) {
      console.warn('[Banner Image Upload API]:', err);
    }

    // 2. Base64 fallback (guarantees upload works locally or offline)
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setHeroForm((prev) => ({ ...prev, image: result }));
      setIsUploadingImage(false);
    };
    reader.onerror = () => {
      setIsUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Tab Switcher Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        backgroundColor: '#FFFFFF',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('hero')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: activeTab === 'hero' ? '#0F172A' : '#F1F5F9',
              color: activeTab === 'hero' ? '#FFFFFF' : '#475569',
              transition: 'all 0.15s ease',
            }}
          >
            <ImageIcon size={16} />
            <span>Hero Slider Banners</span>
            <span style={{
              backgroundColor: activeTab === 'hero' ? '#D32F2F' : '#E2E8F0',
              color: activeTab === 'hero' ? '#FFFFFF' : '#0F172A',
              padding: '2px 7px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 800,
            }}>
              {heroSlides.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('restore')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: activeTab === 'restore' ? '#0F172A' : '#F1F5F9',
              color: activeTab === 'restore' ? '#FFFFFF' : '#475569',
              transition: 'all 0.15s ease',
            }}
          >
            <RotateCcw size={16} />
            <span>Factory Presets</span>
          </button>
        </div>

        <div>
          {activeTab === 'hero' && (
            <button
              onClick={handleOpenNewHero}
              className="btn btn-primary btn-sm"
              style={{ backgroundColor: '#D32F2F', borderColor: '#D32F2F' }}
            >
              <Plus size={16} />
              <span>Add New Hero Slide</span>
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: HERO SLIDER CAROUSEL MANAGEMENT
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'hero' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Active Homepage Carousel Slides ({heroSlides.filter(s => s.isActive).length}/{heroSlides.length} Live)
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '4px 0 0' }}>
                  Slides rotate automatically on the storefront hero section. Drag or use arrows to adjust sequence.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {heroSlides.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                  <ImageIcon size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontWeight: 600 }}>No hero slides configured.</p>
                  <button onClick={handleOpenNewHero} className="btn btn-primary btn-sm" style={{ marginTop: '10px' }}>
                    <Plus size={14} />
                    <span>Create First Slide</span>
                  </button>
                </div>
              ) : (
                heroSlides.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className="admin-banner-row"
                    style={{
                      borderBottom: idx < heroSlides.length - 1 ? '1px solid #F1F5F9' : 'none',
                      backgroundColor: slide.isActive ? '#FFFFFF' : '#F8FAFC',
                      opacity: slide.isActive ? 1 : 0.65,
                      transition: 'background-color 0.15s ease',
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* Top Row on Mobile: Order & Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', minWidth: '120px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {/* Order Badge */}
                        <div style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '6px',
                          backgroundColor: '#0F172A',
                          color: '#FFFFFF',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          #{idx + 1}
                        </div>

                        {/* Reorder Arrows */}
                        <div style={{ display: 'flex', gap: '2px' }}>
                          <button
                            onClick={() => handleMoveSlide(idx, 'up')}
                            disabled={idx === 0}
                            style={{
                              background: '#F1F5F9',
                              border: '1px solid #E2E8F0',
                              borderRadius: '4px',
                              cursor: idx === 0 ? 'not-allowed' : 'pointer',
                              color: idx === 0 ? '#CBD5E1' : '#64748B',
                              padding: '3px 5px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Move Slide Up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => handleMoveSlide(idx, 'down')}
                            disabled={idx === heroSlides.length - 1}
                            style={{
                              background: '#F1F5F9',
                              border: '1px solid #E2E8F0',
                              borderRadius: '4px',
                              cursor: idx === heroSlides.length - 1 ? 'not-allowed' : 'pointer',
                              color: idx === heroSlides.length - 1 ? '#CBD5E1' : '#64748B',
                              padding: '3px 5px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Move Slide Down"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '999px',
                        backgroundColor: slide.isActive ? '#DCFCE7' : '#F1F5F9',
                        color: slide.isActive ? '#15803D' : '#64748B',
                      }}>
                        {slide.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </div>

                    {/* Thumbnail */}
                    <div style={{
                      position: 'relative',
                      width: '100px',
                      height: '64px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#0F172A',
                      border: '1px solid #E2E8F0',
                      flexShrink: 0,
                    }}>
                      <NextImage
                        src={slide.image || '/images/hero-banner.jpg'}
                        alt={slide.headline}
                        fill
                        unoptimized
                        style={{ objectFit: 'cover' }}
                      />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: '180px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{
                          backgroundColor: slide.accentColor || '#D32F2F',
                          color: '#FFFFFF',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}>
                          {slide.tag || 'PROMOTION'}
                        </span>
                        <h4 style={{
                          fontSize: '0.95rem',
                          fontWeight: 800,
                          color: '#0F172A',
                          margin: 0,
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                        }}>
                          {slide.headline}
                        </h4>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '4px' }}>
                        {slide.subheadline}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.72rem', color: '#94A3B8' }}>
                        <span>
                          <strong style={{ color: '#475569' }}>CTA:</strong> {slide.ctaText} → {slide.ctaTargetType}: {slide.ctaTargetValue}
                        </span>
                        {slide.secondaryCtaText && (
                          <span>
                            • <strong style={{ color: '#475569' }}>Secondary:</strong> {slide.secondaryCtaText}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <button
                        onClick={() => updateHeroSlide({ ...slide, isActive: !slide.isActive })}
                        style={{
                          backgroundColor: '#F1F5F9',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          padding: '8px',
                          cursor: 'pointer',
                          color: slide.isActive ? '#64748B' : '#059669',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title={slide.isActive ? 'Deactivate Slide' : 'Activate Slide'}
                      >
                        {slide.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>

                      <button
                        onClick={() => handleOpenEditHero(slide)}
                        style={{
                          backgroundColor: '#F1F5F9',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          color: '#0F172A',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                        }}
                        title="Edit Slide Content & Visuals"
                      >
                        <Edit3 size={15} />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => deleteHeroSlide(slide.id)}
                        style={{
                          backgroundColor: '#FEE2E2',
                          border: '1px solid #FECACA',
                          borderRadius: '6px',
                          padding: '8px',
                          cursor: 'pointer',
                          color: '#DC2626',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Delete Slide"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}


      {/* ─────────────────────────────────────────────────────────────
          TAB 3: FACTORY RESTORE & QUICK ACTIONS
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'restore' && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '28px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          maxWidth: '700px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <RotateCcw size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Reset Banners to Original Design
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0' }}>
                Reverts all Hero Slider slides back to the default showcase layout.
              </p>
            </div>
          </div>

          <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
            This will reinstate the default 3 Hero Slides: <strong>MASTER YOUR STRIDE (Zap Atelier)</strong>, <strong>VELOCITY RUN NITRO (Power Athletics)</strong>, and <strong>EXECUTIVE ZERO-G (Hush Puppies)</strong>.
          </p>

          {showConfirmRestore ? (
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#991B1B' }}>
                Are you sure you want to reset all banners?
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    resetBannersToDefaults();
                    setShowConfirmRestore(false);
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: '#DC2626', borderColor: '#DC2626' }}
                >
                  Yes, Restore
                </button>
                <button
                  onClick={() => setShowConfirmRestore(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmRestore(true)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#DC2626' }}
            >
              <RotateCcw size={16} />
              <span>Restore Factory Showcase Banners</span>
            </button>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          HERO SLIDE EDIT / ADD MODAL
      ────────────────────────────────────────────────────────────── */}
      {isHeroModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '820px', padding: 0 }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                  {editingHeroSlide ? 'Edit Hero Slide' : 'Add New Hero Slide'}
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '2px 0 0' }}>
                  Configure typography, showcase imagery, target links, and accent styling
                </p>
              </div>
              <button
                onClick={() => setIsHeroModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveHero} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* ── LIVE INTERACTIVE MINI PREVIEW ── */}
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                    Live Slide Preview
                  </label>
                  <div style={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    padding: '20px',
                    color: '#FFFFFF',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '16px',
                    alignItems: 'center',
                  }}>
                    {/* Background Glow */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '60%',
                      height: '100%',
                      background: `radial-gradient(circle at 70% 50%, ${heroForm.accentColor ? heroForm.accentColor + '40' : 'rgba(211,47,47,0.25)'} 0%, transparent 70%)`,
                      pointerEvents: 'none',
                    }} />

                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '3px 8px',
                        borderRadius: '999px',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        color: '#FCA5A5',
                        marginBottom: '8px',
                      }}>
                        <ShieldCheck size={11} color={heroForm.accentColor || '#D32F2F'} />
                        <span>{heroForm.tag || 'TAG BADGE'}</span>
                      </div>
                      <h4 style={{
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        fontStyle: 'italic',
                        lineHeight: 1.1,
                        margin: '0 0 4px',
                        textTransform: 'uppercase',
                      }}>
                        <FormattedText text={heroForm.headline || 'HEADLINE'} />
                      </h4>
                      <h5 style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#E2E8F0',
                        margin: '0 0 8px',
                      }}>
                        <FormattedText text={heroForm.subheadline || 'SUBHEADLINE'} />
                      </h5>
                      <p style={{
                        fontSize: '0.72rem',
                        color: '#94A3B8',
                        margin: '0 0 12px',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        <FormattedText text={heroForm.description || 'Slide description paragraph goes here...'} />
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          backgroundColor: heroForm.accentColor || '#D32F2F',
                          color: '#FFFFFF',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          {heroForm.ctaText}
                          <ArrowRight size={12} />
                        </span>
                        {heroForm.secondaryCtaText && (
                          <span style={{
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            color: '#FFFFFF',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}>
                            {heroForm.secondaryCtaText}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Preview Image */}
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '16/10',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}>
                      <NextImage
                        src={heroForm.image || '/images/hero-banner.jpg'}
                        alt="Preview"
                        fill
                        unoptimized
                        style={{ objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: '6px',
                        right: '6px',
                        backgroundColor: 'rgba(15,23,42,0.85)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.6rem',
                        color: '#FFFFFF',
                      }}>
                        <div style={{ fontWeight: 800, color: '#F87171' }}>{heroForm.badgeSubtext}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── FORM FIELDS ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                      Badge Tag (Top Capsule)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={heroForm.tag}
                      onChange={(e) => setHeroForm({ ...heroForm, tag: e.target.value })}
                      placeholder="e.g. POWER ATHLETICS or ZAP ATELIER"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                      Accent Glow & Button Color
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="color"
                        value={heroForm.accentColor}
                        onChange={(e) => setHeroForm({ ...heroForm, accentColor: e.target.value })}
                        style={{ width: '40px', height: '38px', borderRadius: '6px', border: '1px solid #CBD5E1', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        className="form-input"
                        value={heroForm.accentColor}
                        onChange={(e) => setHeroForm({ ...heroForm, accentColor: e.target.value })}
                        style={{ flex: 1 }}
                      />
                    </div>
                    {/* Preset Swatches */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                      {PRESET_ACCENT_COLORS.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setHeroForm({ ...heroForm, accentColor: c.hex })}
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: c.hex,
                            border: heroForm.accentColor === c.hex ? '2px solid #0F172A' : '1px solid #CBD5E1',
                            cursor: 'pointer',
                          }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <RichTextEditor
                    label="Main Headline (Uppercase)"
                    value={heroForm.headline}
                    onChange={(val) => setHeroForm({ ...heroForm, headline: val })}
                    placeholder="e.g. VELOCITY RUN NITRO"
                    required
                    multiline={false}
                    hint="Highlight key words with bold, accent colors, or size changes."
                  />

                  <RichTextEditor
                    label="Subheadline"
                    value={heroForm.subheadline}
                    onChange={(val) => setHeroForm({ ...heroForm, subheadline: val })}
                    placeholder="e.g. UNLEASH YOUR FASTEST PACE"
                    required
                    multiline={false}
                    hint="Style subheadline with italics or colors."
                  />
                </div>

                <RichTextEditor
                  label="Description Text"
                  value={heroForm.description}
                  onChange={(val) => setHeroForm({ ...heroForm, description: val })}
                  placeholder="Describe shoe features, kinetics, material craft, or event..."
                  required
                  rows={2}
                  multiline={true}
                  hint="Full styling supported: bold words, font sizes, text color, and highlights."
                />

                {/* Image Selection & Upload */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', display: 'block' }}>
                    Shoe Showcase Image
                  </label>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={heroForm.image}
                      onChange={(e) => setHeroForm({ ...heroForm, image: e.target.value })}
                      placeholder="Image URL or local path (/images/...)"
                      style={{ flex: 1 }}
                      required
                    />
                    
                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 16px',
                        borderRadius: '6px',
                        backgroundColor: '#0F172A',
                        color: '#FFFFFF',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isUploadingImage ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  {/* Preset Quick Picker */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>Quick Presets:</span>
                    {PRESET_IMAGES.slice(0, 4).map((p) => (
                      <button
                        key={p.url}
                        type="button"
                        onClick={() => setHeroForm({ ...heroForm, image: p.url })}
                        style={{
                          fontSize: '0.7rem',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: heroForm.image === p.url ? '1px solid #0F172A' : '1px solid #CBD5E1',
                          backgroundColor: heroForm.image === p.url ? '#0F172A' : '#FFFFFF',
                          color: heroForm.image === p.url ? '#FFFFFF' : '#334155',
                          cursor: 'pointer',
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Floating Badge on Image */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                      Floating Badge Top Text
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={heroForm.badgeText || ''}
                      onChange={(e) => setHeroForm({ ...heroForm, badgeText: e.target.value })}
                      placeholder="e.g. CRAFTED EXCELLENCE"
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                      Floating Badge Subtext
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={heroForm.badgeSubtext || ''}
                      onChange={(e) => setHeroForm({ ...heroForm, badgeSubtext: e.target.value })}
                      placeholder="e.g. 100% Certified ZAP Quality"
                    />
                  </div>
                </div>

                {/* Call-to-Action 1 (Primary) */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: '0 0 12px', color: '#0F172A' }}>
                    Primary CTA Button Action
                  </h4>
                  <div className="admin-grid-3col">
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Button Text</label>
                      <input
                        type="text"
                        className="form-input"
                        value={heroForm.ctaText}
                        onChange={(e) => setHeroForm({ ...heroForm, ctaText: e.target.value })}
                        placeholder="e.g. SHOP POWER SNEAKERS"
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Destination Type</label>
                      <select
                        className="form-input"
                        value={heroForm.ctaTargetType}
                        onChange={(e) => setHeroForm({ ...heroForm, ctaTargetType: e.target.value as BannerTargetType })}
                      >
                        <option value="brand">Brand Filter</option>
                        <option value="category">Category Filter</option>
                        <option value="gender">Gender Collection</option>
                        <option value="all">Entire Catalog</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Destination Target</label>
                      {heroForm.ctaTargetType === 'brand' && (
                        <select
                          className="form-input"
                          value={heroForm.ctaTargetValue}
                          onChange={(e) => setHeroForm({ ...heroForm, ctaTargetValue: e.target.value })}
                        >
                          <option value="all">All Brands</option>
                          <option value="power">Power</option>
                          <option value="hush-puppies">Hush Puppies</option>
                          <option value="marie-claire">Marie Claire</option>
                          <option value="bata-comfit">Bata Comfit</option>
                          <option value="north-star">North Star</option>
                          {brands.map(b => (
                            <option key={b.id} value={b.slug}>{b.name}</option>
                          ))}
                        </select>
                      )}
                      {heroForm.ctaTargetType === 'category' && (
                        <select
                          className="form-input"
                          value={heroForm.ctaTargetValue}
                          onChange={(e) => setHeroForm({ ...heroForm, ctaTargetValue: e.target.value })}
                        >
                          <option value="all">All Categories</option>
                          <option value="sneakers">Sneakers / Runners</option>
                          <option value="formal">Formal Leather</option>
                          <option value="sandals">Sandals</option>
                          <option value="casual">Casual Loafers</option>
                          <option value="heels">Ladies Heels</option>
                          <option value="boots">Heritage Boots</option>
                        </select>
                      )}
                      {heroForm.ctaTargetType === 'gender' && (
                        <select
                          className="form-input"
                          value={heroForm.ctaTargetValue}
                          onChange={(e) => setHeroForm({ ...heroForm, ctaTargetValue: e.target.value })}
                        >
                          <option value="MEN">Men's Footwear</option>
                          <option value="WOMEN">Women's Footwear</option>
                          <option value="KIDS">Kids Collection</option>
                          <option value="ALL">All Genders</option>
                        </select>
                      )}
                      {heroForm.ctaTargetType === 'all' && (
                        <input type="text" className="form-input" value="all" disabled />
                      )}
                    </div>
                  </div>
                </div>

                {/* Call-to-Action 2 (Secondary) */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: '0 0 12px', color: '#0F172A' }}>
                    Secondary CTA Button Action (Optional)
                  </h4>
                  <div className="admin-grid-3col">
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Button Text</label>
                      <input
                        type="text"
                        className="form-input"
                        value={heroForm.secondaryCtaText}
                        onChange={(e) => setHeroForm({ ...heroForm, secondaryCtaText: e.target.value })}
                        placeholder="e.g. VIEW RUNNING GEAR"
                      />
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Destination Type</label>
                      <select
                        className="form-input"
                        value={heroForm.secondaryCtaTargetType}
                        onChange={(e) => setHeroForm({ ...heroForm, secondaryCtaTargetType: e.target.value as BannerTargetType })}
                      >
                        <option value="category">Category Filter</option>
                        <option value="brand">Brand Filter</option>
                        <option value="gender">Gender Collection</option>
                        <option value="all">Entire Catalog</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Destination Target</label>
                      {heroForm.secondaryCtaTargetType === 'category' && (
                        <select
                          className="form-input"
                          value={heroForm.secondaryCtaTargetValue}
                          onChange={(e) => setHeroForm({ ...heroForm, secondaryCtaTargetValue: e.target.value })}
                        >
                          <option value="all">All Categories</option>
                          <option value="sneakers">Sneakers / Runners</option>
                          <option value="formal">Formal Leather</option>
                          <option value="sandals">Sandals</option>
                          <option value="casual">Casual Loafers</option>
                          <option value="heels">Ladies Heels</option>
                        </select>
                      )}
                      {heroForm.secondaryCtaTargetType === 'brand' && (
                        <select
                          className="form-input"
                          value={heroForm.secondaryCtaTargetValue}
                          onChange={(e) => setHeroForm({ ...heroForm, secondaryCtaTargetValue: e.target.value })}
                        >
                          <option value="all">All Brands</option>
                          <option value="power">Power</option>
                          <option value="hush-puppies">Hush Puppies</option>
                          <option value="marie-claire">Marie Claire</option>
                          <option value="bata-comfit">Bata Comfit</option>
                        </select>
                      )}
                      {heroForm.secondaryCtaTargetType === 'gender' && (
                        <select
                          className="form-input"
                          value={heroForm.secondaryCtaTargetValue}
                          onChange={(e) => setHeroForm({ ...heroForm, secondaryCtaTargetValue: e.target.value })}
                        >
                          <option value="WOMEN">Women's Footwear</option>
                          <option value="MEN">Men's Footwear</option>
                          <option value="KIDS">Kids Collection</option>
                        </select>
                      )}
                      {heroForm.secondaryCtaTargetType === 'all' && (
                        <input type="text" className="form-input" value="all" disabled />
                      )}
                    </div>
                  </div>
                </div>

                {/* Active Toggle & Sequence */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={heroForm.isActive}
                      onChange={(e) => setHeroForm({ ...heroForm, isActive: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                      Publish Immediately to Storefront Carousel
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
              }}>
                <button
                  type="button"
                  onClick={() => setIsHeroModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: heroForm.accentColor || '#D32F2F', borderColor: heroForm.accentColor || '#D32F2F' }}
                >
                  <Check size={16} />
                  <span>{editingHeroSlide ? 'Save Slide Updates' : 'Add Slide to Carousel'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

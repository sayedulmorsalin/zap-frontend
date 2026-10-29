'use client';

import React, { useState, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Palette, 
  Type, 
  Highlighter, 
  RotateCcw, 
  Eye, 
  Edit3, 
  Sparkles,
  Smile
} from 'lucide-react';
import { FormattedText } from '../Common/FormattedText';

export interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  hint?: string;
  className?: string;
}

const PRESET_COLORS = [
  { name: 'Crimson Red', hex: '#D32F2F' },
  { name: 'Rose Luxury', hex: '#E11D48' },
  { name: 'Deep Black', hex: '#09090B' },
  { name: 'Royal Blue', hex: '#2563EB' },
  { name: 'Sky Cyan', hex: '#0284C7' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Gold / Amber', hex: '#D97706' },
  { name: 'Purple Luxe', hex: '#7C3AED' },
  { name: 'Slate Gray', hex: '#64748B' },
];

const PRESET_HIGHLIGHTS = [
  { name: 'Yellow Glow', bg: '#FEF08A', color: '#854D0E' },
  { name: 'Rose Tint', bg: '#FFE4E6', color: '#9F1239' },
  { name: 'Green Mint', bg: '#DCFCE7', color: '#166534' },
  { name: 'Blue Soft', bg: '#DBEAFE', color: '#1E40AF' },
  { name: 'Dark Tag', bg: '#18181B', color: '#FFFFFF' },
];

const FONT_SIZES = [
  { label: 'Small (85%)', value: '0.85em' },
  { label: 'Normal (100%)', value: '1em' },
  { label: 'Medium (115%)', value: '1.15em' },
  { label: 'Large (135%)', value: '1.35em' },
  { label: 'Extra Large (160%)', value: '1.6em' },
  { label: 'Huge (190%)', value: '1.9em' },
];

const QUICK_EMOJIS = ['⚡', '🔥', '💎', '🚚', '🎁', '✨', '✓', '⭐', '👟', '👑'];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 3,
  required = false,
  hint,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#D32F2F');

  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getTarget = (): HTMLInputElement | HTMLTextAreaElement | null => {
    return multiline ? textareaRef.current : inputRef.current;
  };

  /**
   * Wraps selected text with an open and close tag, or inserts a sample placeholder.
   */
  const wrapSelection = (openTag: string, closeTag: string, defaultText = 'styled text') => {
    const el = getTarget();
    if (!el) {
      onChange(`${value}${openTag}${defaultText}${closeTag}`);
      return;
    }

    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const selected = value.substring(start, end);

    const replacement = selected.length > 0
      ? `${openTag}${selected}${closeTag}`
      : `${openTag}${defaultText}${closeTag}`;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      el.focus();
      const newCursorStart = start + openTag.length;
      const newCursorEnd = newCursorStart + (selected.length > 0 ? selected.length : defaultText.length);
      el.setSelectionRange(newCursorStart, newCursorEnd);
    }, 50);
  };

  // Formatting actions
  const applyBold = () => wrapSelection('<b>', '</b>', 'bold text');
  const applyItalic = () => wrapSelection('<i>', '</i>', 'italic text');
  const applyUnderline = () => wrapSelection('<u>', '</u>', 'underlined text');
  const applyStrike = () => wrapSelection('<s>', '</s>', 'strikethrough text');

  const applyColor = (colorHex: string) => {
    wrapSelection(`<span style="color: ${colorHex}">`, '</span>', 'colored text');
    setShowColorPicker(false);
  };

  const applyHighlight = (bg: string, color: string) => {
    wrapSelection(
      `<span style="background-color: ${bg}; color: ${color}; padding: 1px 6px; border-radius: 4px; font-weight: 600">`,
      '</span>',
      'highlighted text'
    );
    setShowHighlightPicker(false);
  };

  const applyFontSize = (sizeVal: string) => {
    wrapSelection(`<span style="font-size: ${sizeVal}">`, '</span>', 'resized text');
    setShowSizePicker(false);
  };

  const insertEmoji = (emoji: string) => {
    const el = getTarget();
    if (!el) {
      onChange(`${value}${emoji} `);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const newValue = value.substring(0, start) + emoji + ' ' + value.substring(end);
    onChange(newValue);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + emoji.length + 1, start + emoji.length + 1);
    }, 50);
    setShowEmojiPicker(false);
  };

  const clearFormatting = () => {
    const el = getTarget();
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? value.length;

    if (start === end) {
      // Clear all tags in entire value
      const stripped = value.replace(/<[^>]*>/g, '');
      onChange(stripped);
      return;
    }

    const selected = value.substring(start, end);
    const cleaned = selected.replace(/<[^>]*>/g, '');
    const newValue = value.substring(0, start) + cleaned + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start, start + cleaned.length);
    }, 50);
  };

  return (
    <div style={{ marginBottom: '14px' }} className={className}>
      {/* Header bar: Label + Edit/Preview tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '6px',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        {label && (
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>{label}</span>
            {required && <span style={{ color: '#E11D48' }}>*</span>}
          </label>
        )}

        <div style={{
          display: 'inline-flex',
          backgroundColor: '#F1F5F9',
          borderRadius: '6px',
          padding: '2px',
          border: '1px solid #E2E8F0',
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'edit' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'edit' ? '#0F172A' : '#64748B',
              boxShadow: activeTab === 'edit' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <Edit3 size={12} />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'preview' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'preview' ? '#D32F2F' : '#64748B',
              boxShadow: activeTab === 'preview' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <Eye size={12} />
            <span>Live Preview</span>
          </button>
        </div>
      </div>

      {/* Editor Box */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1.5px solid #CBD5E1',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        transition: 'border-color 0.15s ease',
      }}>
        {/* Formatting Toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '6px 10px',
          backgroundColor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          flexWrap: 'wrap',
          position: 'relative',
        }}>
          {/* Bold */}
          <button
            type="button"
            onClick={applyBold}
            title="Bold (<b>...</b>)"
            style={toolbarBtnStyle}
          >
            <Bold size={14} />
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={applyItalic}
            title="Italic (<i>...</i>)"
            style={toolbarBtnStyle}
          >
            <Italic size={14} />
          </button>

          {/* Underline */}
          <button
            type="button"
            onClick={applyUnderline}
            title="Underline (<u>...</u>)"
            style={toolbarBtnStyle}
          >
            <Underline size={14} />
          </button>

          {/* Strikethrough */}
          <button
            type="button"
            onClick={applyStrike}
            title="Strikethrough (<s>...</s>)"
            style={toolbarBtnStyle}
          >
            <Strikethrough size={14} />
          </button>

          <div style={toolbarDividerStyle} />

          {/* Font Size Menu */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                setShowSizePicker(!showSizePicker);
                setShowColorPicker(false);
                setShowHighlightPicker(false);
                setShowEmojiPicker(false);
              }}
              title="Change Font Size"
              style={{
                ...toolbarBtnStyle,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              <Type size={14} />
              <span>Size</span>
            </button>

            {showSizePicker && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                zIndex: 100,
                padding: '4px 0',
                minWidth: '150px',
              }}>
                {FONT_SIZES.map((sz) => (
                  <button
                    key={sz.value}
                    type="button"
                    onClick={() => applyFontSize(sz.value)}
                    style={{
                      width: '100%',
                      padding: '6px 12px',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'block',
                      color: '#1E293B',
                      transition: 'background 0.12s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {sz.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Text Color Picker */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowSizePicker(false);
                setShowHighlightPicker(false);
                setShowEmojiPicker(false);
              }}
              title="Text Color"
              style={{
                ...toolbarBtnStyle,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              <Palette size={14} color="#D32F2F" />
              <span>Color</span>
            </button>

            {showColorPicker && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                zIndex: 100,
                padding: '10px',
                width: '180px',
              }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Preset Colors
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '10px' }}>
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      title={c.name}
                      onClick={() => applyColor(c.hex)}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        backgroundColor: c.hex,
                        border: '1.5px solid rgba(0,0,0,0.15)',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'transform 0.1s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  ))}
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    style={{ width: '28px', height: '26px', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                  />
                  <button
                    type="button"
                    onClick={() => applyColor(customColor)}
                    style={{
                      flex: 1,
                      padding: '4px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: '#0F172A',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Apply Hex
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Highlight / Background */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                setShowHighlightPicker(!showHighlightPicker);
                setShowSizePicker(false);
                setShowColorPicker(false);
                setShowEmojiPicker(false);
              }}
              title="Highlight Background"
              style={{
                ...toolbarBtnStyle,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              <Highlighter size={14} color="#D97706" />
              <span>Highlight</span>
            </button>

            {showHighlightPicker && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                zIndex: 100,
                padding: '8px',
                width: '170px',
              }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Highlight Styles
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {PRESET_HIGHLIGHTS.map((h) => (
                    <button
                      key={h.name}
                      type="button"
                      onClick={() => applyHighlight(h.bg, h.color)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid rgba(0,0,0,0.06)',
                        backgroundColor: h.bg,
                        color: h.color,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {h.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Emoji Picker */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowSizePicker(false);
                setShowColorPicker(false);
                setShowHighlightPicker(false);
              }}
              title="Insert Emojis"
              style={toolbarBtnStyle}
            >
              <Smile size={14} />
            </button>

            {showEmojiPicker && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                zIndex: 100,
                padding: '8px',
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '4px',
                width: '160px',
              }}>
                {QUICK_EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => insertEmoji(em)}
                    style={{
                      fontSize: '1rem',
                      background: 'none',
                      border: '1px solid #F1F5F9',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={toolbarDividerStyle} />

          {/* Clear Formatting */}
          <button
            type="button"
            onClick={clearFormatting}
            title="Clear formatting on selection (or all)"
            style={{
              ...toolbarBtnStyle,
              marginLeft: 'auto',
              color: '#94A3B8',
            }}
          >
            <RotateCcw size={13} />
            <span style={{ fontSize: '0.7rem' }}>Clear</span>
          </button>
        </div>

        {/* Input area or Live Preview */}
        {activeTab === 'edit' ? (
          <div>
            {multiline ? (
              <textarea
                ref={textareaRef}
                rows={rows}
                value={value}
                required={required}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.88rem',
                  color: '#0F172A',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  lineHeight: 1.6,
                }}
              />
            ) : (
              <input
                ref={inputRef}
                type="text"
                value={value}
                required={required}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.92rem',
                  color: '#0F172A',
                  fontFamily: 'inherit',
                  fontWeight: 500,
                }}
              />
            )}
          </div>
        ) : (
          <div style={{
            padding: '14px 16px',
            minHeight: multiline ? '90px' : '46px',
            backgroundColor: '#F8FAFC',
            fontSize: multiline ? '0.92rem' : '1.1rem',
            lineHeight: 1.6,
            color: '#0F172A',
          }}>
            {value.trim() ? (
              <FormattedText text={value} />
            ) : (
              <span style={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '0.85rem' }}>
                Preview will appear here when you enter text...
              </span>
            )}
          </div>
        )}
      </div>

      {/* Helpful Live Visual Preview Bar underneath when in edit mode */}
      {activeTab === 'edit' && value.trim() && /<[a-z][\s\S]*>/i.test(value) && (
        <div style={{
          marginTop: '6px',
          padding: '6px 10px',
          backgroundColor: '#F8FAFC',
          borderRadius: '6px',
          border: '1px dashed #CBD5E1',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.82rem',
        }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>
            Live Storefront Look:
          </span>
          <div style={{ color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <FormattedText text={value} />
          </div>
        </div>
      )}

      {hint && (
        <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px', fontWeight: 500 }}>
          {hint}
        </div>
      )}
    </div>
  );
};

const toolbarBtnStyle: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: '5px',
  padding: '4px 7px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: '#334155',
  transition: 'all 0.15s ease',
};

const toolbarDividerStyle: React.CSSProperties = {
  width: '1px',
  height: '18px',
  backgroundColor: '#E2E8F0',
  margin: '0 3px',
};

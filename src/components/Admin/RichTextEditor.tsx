'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Code,
  Edit3, 
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
  // Mode: 'visual' (WYSIWYG preview directly editable) vs 'code' (raw HTML)
  const [mode, setMode] = useState<'visual' | 'code'>('visual');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#D32F2F');

  const contentRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const lastHtmlRef = useRef<string>(value || '');

  // Keep contentEditable innerHTML in sync with value prop when updated from outside
  useEffect(() => {
    if (contentRef.current && mode === 'visual') {
      const currentInner = contentRef.current.innerHTML;
      if (value !== lastHtmlRef.current && value !== currentInner) {
        contentRef.current.innerHTML = value || '';
        lastHtmlRef.current = value || '';
      }
    }
  }, [value, mode]);

  // Save selection before clicking toolbar items
  const saveSelection = useCallback(() => {
    if (typeof window === 'undefined') return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && contentRef.current?.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  // Restore saved selection
  const restoreSelection = useCallback(() => {
    if (typeof window === 'undefined' || !contentRef.current) return;
    contentRef.current.focus();
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
  }, []);

  // Sync contentEditable changes to parent
  const handleContentInput = () => {
    if (!contentRef.current) return;
    let html = contentRef.current.innerHTML;
    // Normalize empty content
    if (html === '<br>' || html === '<p><br></p>' || html.trim() === '') {
      html = '';
    }
    lastHtmlRef.current = html;
    onChange(html);
    saveSelection();
  };

  /**
   * Apply visual formatting by wrapping selection with styled span or tag
   */
  const applyStyleToSelection = (styles: Record<string, string>, defaultText = 'styled text') => {
    if (mode === 'code') {
      // In code mode, insert raw tag
      const styleString = Object.entries(styles)
        .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
        .join('; ');
      insertRawTag(`<span style="${styleString}">`, '</span>', defaultText);
      return;
    }

    restoreSelection();
    const editor = contentRef.current;
    if (!editor) return;

    const sel = window.getSelection();
    const range = (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode))
      ? sel.getRangeAt(0)
      : null;

    const span = document.createElement('span');
    Object.assign(span.style, styles);

    if (!range || range.collapsed) {
      // No selection: insert styled sample text
      span.textContent = defaultText;
      if (range) {
        range.insertNode(span);
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        sel?.removeAllRanges();
        sel?.addRange(newRange);
      } else {
        editor.appendChild(span);
      }
    } else {
      // Wrap selected text directly
      try {
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        sel?.removeAllRanges();
        sel?.addRange(newRange);
      } catch {
        span.textContent = range.toString() || defaultText;
        range.deleteContents();
        range.insertNode(span);
      }
    }

    handleContentInput();
  };

  /**
   * Apply semantic inline tags (<b>, <i>, <u>, <s>) visually in contentEditable
   */
  const applyInlineTag = (tag: 'b' | 'i' | 'u' | 's', defaultText = 'styled text') => {
    if (mode === 'code') {
      insertRawTag(`<${tag}>`, `</${tag}>`, defaultText);
      return;
    }

    restoreSelection();
    const editor = contentRef.current;
    if (!editor) return;

    const sel = window.getSelection();
    const range = (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode))
      ? sel.getRangeAt(0)
      : null;

    // Use document.execCommand for native visual toggling where supported
    const cmdMap: Record<string, string> = {
      b: 'bold',
      i: 'italic',
      u: 'underline',
      s: 'strikeThrough',
    };

    if (range && !range.collapsed && cmdMap[tag]) {
      try {
        const success = document.execCommand(cmdMap[tag], false);
        if (success) {
          handleContentInput();
          return;
        }
      } catch {
        // Fallback to DOM element wrapping
      }
    }

    // DOM wrapping fallback
    const el = document.createElement(tag);
    if (!range || range.collapsed) {
      el.textContent = defaultText;
      if (range) {
        range.insertNode(el);
        const newRange = document.createRange();
        newRange.selectNodeContents(el);
        sel?.removeAllRanges();
        sel?.addRange(newRange);
      } else {
        editor.appendChild(el);
      }
    } else {
      try {
        const fragment = range.extractContents();
        el.appendChild(fragment);
        range.insertNode(el);
        const newRange = document.createRange();
        newRange.selectNodeContents(el);
        sel?.removeAllRanges();
        sel?.addRange(newRange);
      } catch {
        el.textContent = range.toString();
        range.deleteContents();
        range.insertNode(el);
      }
    }

    handleContentInput();
  };

  /**
   * Fallback for raw HTML insertion when in Code tab
   */
  const insertRawTag = (openTag: string, closeTag: string, defaultText = 'styled text') => {
    const el = textareaRef.current;
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
    }, 40);
  };

  const applyBold = () => applyInlineTag('b', 'bold text');
  const applyItalic = () => applyInlineTag('i', 'italic text');
  const applyUnderline = () => applyInlineTag('u', 'underlined text');
  const applyStrike = () => applyInlineTag('s', 'strikethrough text');

  const applyColor = (colorHex: string) => {
    applyStyleToSelection({ color: colorHex }, 'colored text');
    setShowColorPicker(false);
  };

  const applyHighlight = (bg: string, textColor: string) => {
    applyStyleToSelection({
      backgroundColor: bg,
      color: textColor,
      padding: '2px 6px',
      borderRadius: '4px',
      fontWeight: '600',
    }, 'highlighted text');
    setShowHighlightPicker(false);
  };

  const applyFontSize = (sizeVal: string) => {
    applyStyleToSelection({ fontSize: sizeVal }, 'resized text');
    setShowSizePicker(false);
  };

  const insertEmoji = (emoji: string) => {
    if (mode === 'code') {
      const el = textareaRef.current;
      if (!el) {
        onChange(`${value}${emoji} `);
        return;
      }
      const start = el.selectionStart ?? value.length;
      const end = el.selectionEnd ?? value.length;
      const newValue = value.substring(0, start) + emoji + ' ' + value.substring(end);
      onChange(newValue);
      setShowEmojiPicker(false);
      return;
    }

    restoreSelection();
    const editor = contentRef.current;
    if (!editor) return;

    const sel = window.getSelection();
    const range = (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode))
      ? sel.getRangeAt(0)
      : null;

    const textNode = document.createTextNode(emoji + ' ');
    if (range) {
      range.deleteContents();
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(range);
    } else {
      editor.appendChild(textNode);
    }

    setShowEmojiPicker(false);
    handleContentInput();
  };

  const clearFormatting = () => {
    if (mode === 'code') {
      const stripped = value.replace(/<[^>]*>/g, '');
      onChange(stripped);
      return;
    }

    restoreSelection();
    const editor = contentRef.current;
    if (!editor) return;

    const sel = window.getSelection();
    const range = (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode))
      ? sel.getRangeAt(0)
      : null;

    if (!range || range.collapsed) {
      // Clear all tags in whole editor
      const plainText = editor.innerText || editor.textContent || '';
      editor.innerText = plainText;
    } else {
      try {
        document.execCommand('removeFormat', false);
      } catch {
        const plain = range.toString();
        range.deleteContents();
        range.insertNode(document.createTextNode(plain));
      }
    }

    handleContentInput();
  };

  const isValueEmpty = !value || value.trim() === '' || value === '<br>' || value === '<p><br></p>';

  return (
    <div style={{ marginBottom: '14px' }} className={className}>
      {/* Header bar: Label + Visual Preview / HTML Code tabs */}
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

        {/* View Mode Toggle: Visual (Default live preview) vs Code (Raw HTML) */}
        <div style={{
          display: 'inline-flex',
          backgroundColor: '#F1F5F9',
          borderRadius: '6px',
          padding: '2px',
          border: '1px solid #E2E8F0',
        }}>
          <button
            type="button"
            onClick={() => setMode('visual')}
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
              backgroundColor: mode === 'visual' ? '#FFFFFF' : 'transparent',
              color: mode === 'visual' ? '#0F172A' : '#64748B',
              boxShadow: mode === 'visual' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <Eye size={12} color={mode === 'visual' ? '#D32F2F' : '#64748B'} />
            <span>Visual Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('code')}
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
              backgroundColor: mode === 'code' ? '#FFFFFF' : 'transparent',
              color: mode === 'code' ? '#0F172A' : '#64748B',
              boxShadow: mode === 'code' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <Code size={12} />
            <span>HTML Code</span>
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
        position: 'relative',
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
            onMouseDown={(e) => e.preventDefault()}
            onClick={applyBold}
            title="Make Selection Bold"
            style={toolbarBtnStyle}
          >
            <Bold size={14} />
          </button>

          {/* Italic */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={applyItalic}
            title="Make Selection Italic"
            style={toolbarBtnStyle}
          >
            <Italic size={14} />
          </button>

          {/* Underline */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={applyUnderline}
            title="Underline Selection"
            style={toolbarBtnStyle}
          >
            <Underline size={14} />
          </button>

          {/* Strikethrough */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={applyStrike}
            title="Strikethrough Selection"
            style={toolbarBtnStyle}
          >
            <Strikethrough size={14} />
          </button>

          <div style={toolbarDividerStyle} />

          {/* Font Size Menu */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
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
                padding: '6px',
                width: '180px',
              }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Choose Font Size
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {FONT_SIZES.map((sz) => (
                    <button
                      key={sz.value}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyFontSize(sz.value)}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: sz.value,
                        color: '#0F172A',
                        fontWeight: 600,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Text Color Picker */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowSizePicker(false);
                setShowHighlightPicker(false);
                setShowEmojiPicker(false);
              }}
              title="Apply Text Color"
              style={{
                ...toolbarBtnStyle,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Palette size={14} color="#D32F2F" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Color</span>
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
                width: '210px',
              }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Preset Colors
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '10px' }}>
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyColor(c.hex)}
                      title={c.name}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: c.hex,
                        border: '2px solid #FFFFFF',
                        boxShadow: '0 0 0 1px #CBD5E1',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    style={{ width: '32px', height: '28px', borderRadius: '4px', border: 'none', cursor: 'pointer', padding: 0 }}
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyColor(customColor)}
                    style={{
                      flex: 1,
                      padding: '4px 8px',
                      backgroundColor: '#0F172A',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Apply Hex
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Highlight Badge Picker */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setShowHighlightPicker(!showHighlightPicker);
                setShowColorPicker(false);
                setShowSizePicker(false);
                setShowEmojiPicker(false);
              }}
              title="Highlight Text with Badge"
              style={toolbarBtnStyle}
            >
              <Highlighter size={14} color="#D97706" />
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
                width: '180px',
              }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Highlight Backgrounds
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {PRESET_HIGHLIGHTS.map((h) => (
                    <button
                      key={h.name}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyHighlight(h.bg, h.color)}
                      style={{
                        padding: '5px 8px',
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
              onMouseDown={(e) => e.preventDefault()}
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
                    onMouseDown={(e) => e.preventDefault()}
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
            onMouseDown={(e) => e.preventDefault()}
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

        {/* Editor Area */}
        {mode === 'visual' ? (
          <div style={{ position: 'relative', width: '100%' }}>
            {/* Overlay Placeholder when empty */}
            {isValueEmpty && (
              <div
                onClick={() => contentRef.current?.focus()}
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '12px',
                  right: '12px',
                  color: '#94A3B8',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  fontSize: multiline ? '0.88rem' : '0.92rem',
                  lineHeight: 1.6,
                  fontFamily: 'inherit',
                  whiteSpace: multiline ? 'pre-wrap' : 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {placeholder || 'Click here to start typing...'}
              </div>
            )}

            {/* WYSIWYG Editable Visual Preview Container */}
            <div
              ref={contentRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleContentInput}
              onKeyUp={saveSelection}
              onMouseUp={saveSelection}
              onSelect={saveSelection}
              onTouchEnd={saveSelection}
              onKeyDown={(e) => {
                if (!multiline && e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                outline: 'none',
                fontSize: multiline ? '0.88rem' : '0.92rem',
                color: '#0F172A',
                fontFamily: 'inherit',
                minHeight: multiline ? `${Math.max(80, rows * 24)}px` : '42px',
                lineHeight: 1.6,
                whiteSpace: multiline ? 'pre-wrap' : 'normal',
                wordBreak: 'break-word',
              }}
            />
          </div>
        ) : (
          /* HTML Code Mode: Direct Raw HTML editing */
          <textarea
            ref={textareaRef}
            rows={rows || 3}
            value={value}
            required={required}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: 'none',
              outline: 'none',
              fontSize: '0.85rem',
              color: '#0F172A',
              fontFamily: 'monospace',
              resize: 'vertical',
              lineHeight: 1.5,
              backgroundColor: '#FAFAFA',
            }}
          />
        )}
      </div>

      {/* Helpful Live Visual Preview Bar underneath when formatting is applied */}
      {value.trim() && /<[a-z][\s\S]*>/i.test(value) && (
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

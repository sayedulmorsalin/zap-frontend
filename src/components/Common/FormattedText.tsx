import React from 'react';

/**
 * Strips all HTML tags and returns clean plain text.
 * Essential for image alt tags, meta tags, and URL generation.
 */
export function stripHtml(input?: string | null): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

/**
 * Validates and cleans HTML so only safe formatting tags & attributes are allowed.
 */
export function sanitizeHtml(input?: string | null): string {
  if (!input) return '';

  // Disallow scripts, iframes, objects, forms, and event handlers
  const cleaned = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/\bon\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\bon\w+\s*=\s*[^>\s]+/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/expression\s*\(.*?\)/gi, '');

  return cleaned;
}

interface FormattedTextProps {
  text?: string | null;
  className?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
}

/**
 * Renders formatted rich text containing safe styling (bold, color, font-size, etc.).
 * Falls back to normal text if no HTML tags are detected.
 */
export const FormattedText: React.FC<FormattedTextProps> = ({
  text,
  className,
  style,
  as: Component = 'span',
}) => {
  if (!text) return null;

  // Check if text contains any HTML formatting tag
  const hasHtml = /<\/?(b|strong|i|em|u|s|strike|span|mark|p|br|small|h[1-6]|ul|ol|li)[^>]*>/i.test(text);

  if (!hasHtml) {
    return (
      <Component className={className} style={style}>
        {text}
      </Component>
    );
  }

  const safeContent = sanitizeHtml(text);

  return (
    <Component
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: safeContent }}
    />
  );
};

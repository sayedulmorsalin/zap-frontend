import type { NextRequest } from 'next/server';

export interface RateLimitTier {
  name: string;
  limit: number;      // Maximum requests in the window
  windowMs: number;   // Window size in milliseconds
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;      // Unix timestamp in seconds
  retryAfter?: number; // Seconds to wait
  tierName: string;
}

interface WindowRecord {
  prevCount: number;
  currCount: number;
  windowStart: number;
}

// In-memory sliding window store
const windowStore = new Map<string, WindowRecord>();

// Predefined security tiers
export const RATE_LIMIT_TIERS: Record<string, RateLimitTier> = {
  // Sensitive admin authentication
  AUTH: {
    name: 'auth',
    limit: 20,
    windowMs: 60 * 1000, // 20 requests per minute
  },
  // Sensitive customer operations (orders, checkout, search)
  MUTATION: {
    name: 'mutation',
    limit: 40,
    windowMs: 60 * 1000, // 40 requests per minute
  },
  // Storefront catalog & general browsing
  STOREFRONT: {
    name: 'storefront',
    limit: 120,
    windowMs: 60 * 1000, // 120 requests per minute
  },
};

/**
 * Extracts the real client IP address from proxy headers.
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    // Leftmost address is the original client IP
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp) return firstIp;
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp && realIp.trim()) return realIp.trim();

  const cfIp = req.headers.get('cf-connecting-ip'); // Cloudflare
  if (cfIp && cfIp.trim()) return cfIp.trim();

  return '127.0.0.1';
}

/**
 * Determines which rate limit tier applies to a given pathname.
 */
export function getTierForPath(pathname: string): RateLimitTier {
  // Tier 1: Authentication endpoints (Login, verify PIN, resend PIN)
  if (pathname.startsWith('/api/admin/auth')) {
    return RATE_LIMIT_TIERS.AUTH;
  }

  // Tier 2: Checkout & Sensitive Data Mutations
  if (
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/api/orders') ||
    pathname.includes('/track')
  ) {
    return RATE_LIMIT_TIERS.MUTATION;
  }

  // Tier 3: General Storefront & Dynamic Pages
  return RATE_LIMIT_TIERS.STOREFRONT;
}

/**
 * Executes a sliding-window rate limit check for the client request.
 */
export function applyRateLimit(req: NextRequest): RateLimitResult {
  const ip = getClientIp(req);
  const pathname = req.nextUrl.pathname;
  const tier = getTierForPath(pathname);

  // In development mode, allow localhost and private LAN IP requests so testing and hot reload never triggers 429
  const isDevExempt =
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === 'localhost' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.') ||
    ip.startsWith('172.17.') ||
    ip.startsWith('172.18.') ||
    ip.startsWith('172.19.') ||
    ip.startsWith('172.20.') ||
    ip.startsWith('172.21.') ||
    ip.startsWith('172.22.') ||
    ip.startsWith('172.23.') ||
    ip.startsWith('172.24.') ||
    ip.startsWith('172.25.') ||
    ip.startsWith('172.26.') ||
    ip.startsWith('172.27.') ||
    ip.startsWith('172.28.') ||
    ip.startsWith('172.29.') ||
    ip.startsWith('172.30.') ||
    ip.startsWith('172.31.') ||
    ip.startsWith('::ffff:192.168.') ||
    ip.startsWith('::ffff:10.') ||
    ip.startsWith('::ffff:127.0.0.1');

  if (process.env.NODE_ENV !== 'production' && isDevExempt) {
    return {
      allowed: true,
      limit: 10000,
      remaining: 9999,
      reset: Math.floor((Date.now() + tier.windowMs) / 1000),
      tierName: `${tier.name}-dev`,
    };
  }

  // Check optional whitelist from environment
  const whitelistEnv = process.env.RATE_LIMIT_WHITELIST_IPS;
  if (whitelistEnv) {
    const whitelisted = whitelistEnv.split(',').map((s) => s.trim());
    if (whitelisted.includes(ip)) {
      return {
        allowed: true,
        limit: tier.limit,
        remaining: tier.limit,
        reset: Math.floor((Date.now() + tier.windowMs) / 1000),
        tierName: `${tier.name}-whitelisted`,
      };
    }
  }

  const key = `${tier.name}:${ip}`;
  const now = Date.now();
  let record = windowStore.get(key);

  if (!record) {
    record = {
      prevCount: 0,
      currCount: 1,
      windowStart: now,
    };
    windowStore.set(key, record);

    return {
      allowed: true,
      limit: tier.limit,
      remaining: tier.limit - 1,
      reset: Math.floor((now + tier.windowMs) / 1000),
      tierName: tier.name,
    };
  }

  const timeSinceWindowStart = now - record.windowStart;

  // If a full window duration has passed, rotate window
  if (timeSinceWindowStart >= tier.windowMs) {
    const windowsPassed = Math.floor(timeSinceWindowStart / tier.windowMs);
    if (windowsPassed === 1) {
      record.prevCount = record.currCount;
    } else {
      record.prevCount = 0;
    }
    record.currCount = 1;
    record.windowStart = now;
    windowStore.set(key, record);

    return {
      allowed: true,
      limit: tier.limit,
      remaining: tier.limit - 1,
      reset: Math.floor((now + tier.windowMs) / 1000),
      tierName: tier.name,
    };
  }

  // Calculate sliding window rate:
  // prevCount weighted by fraction of window remaining + currCount
  const weight = (tier.windowMs - timeSinceWindowStart) / tier.windowMs;
  const estimatedCount = Math.floor(record.prevCount * weight) + record.currCount + 1;

  record.currCount += 1;
  windowStore.set(key, record);

  const resetTimeSec = Math.ceil((record.windowStart + tier.windowMs) / 1000);
  const remaining = Math.max(0, tier.limit - estimatedCount);
  const allowed = estimatedCount <= tier.limit;

  const retryAfter = allowed
    ? undefined
    : Math.max(1, Math.ceil((record.windowStart + tier.windowMs - now) / 1000));

  return {
    allowed,
    limit: tier.limit,
    remaining,
    reset: resetTimeSec,
    retryAfter,
    tierName: tier.name,
  };
}

// Periodic cleanup of stale IP records every 5 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of windowStore.entries()) {
      if (now - record.windowStart > 10 * 60 * 1000) {
        windowStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}


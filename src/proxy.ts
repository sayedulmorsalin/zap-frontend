import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { applyRateLimit } from './lib/rateLimiter';

function generateRateLimitHtml(retryAfter: number, pathname: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>429 Too Many Requests - ZAP Footwear</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #09090B;
      color: #F4F4F5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      max-width: 480px;
      width: 100%;
      background: #121217;
      border: 1px solid #27272A;
      border-radius: 20px;
      padding: 40px 32px;
      text-align: center;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8);
      position: relative;
    }
    .badge {
      display: inline-block;
      background: rgba(239, 68, 68, 0.15);
      color: #EF4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 4px 12px;
      border-radius: 20px;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 26px;
      font-weight: 900;
      color: #FFFFFF;
      margin-bottom: 10px;
    }
    p {
      color: #94A3B8;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .timer-box {
      background: #18181B;
      border: 1px solid #27272A;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .timer-count {
      font-family: monospace;
      font-size: 32px;
      font-weight: 900;
      color: #EF4444;
    }
    .timer-label {
      font-size: 12px;
      color: #71717A;
      margin-top: 4px;
      font-weight: 600;
    }
    .btn {
      display: inline-block;
      background: #27272A;
      color: #FFFFFF;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      padding: 12px 24px;
      border-radius: 10px;
      transition: background 0.2s ease;
    }
    .btn:hover { background: #3F3F46; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Shield Protection Active</div>
    <h1>Too Many Requests</h1>
    <p>Our automated security shield detected an unusually high volume of requests from your network. Please wait a brief moment while the request limit resets.</p>
    
    <div class="timer-box">
      <div id="countdown" class="timer-count">${retryAfter}</div>
      <div class="timer-label">SECONDS UNTIL COOLDOWN RESETS</div>
    </div>

    <a href="${pathname}" class="btn" id="retryBtn">Retry Now</a>
  </div>

  <script>
    let timeLeft = ${retryAfter};
    const countEl = document.getElementById('countdown');
    const timer = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(timer);
        window.location.reload();
      } else {
        countEl.textContent = timeLeft;
      }
    }, 1000);
  </script>
</body>
</html>`;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Sliding Window Rate Limiting Check
  const rateLimit = applyRateLimit(request);

  // If rate limit exceeded, return HTTP 429
  if (!rateLimit.allowed) {
    const retryAfter = rateLimit.retryAfter || 30;

    // Check if client expects JSON (API or fetch)
    const isApi = pathname.startsWith('/api') || request.headers.get('accept')?.includes('application/json');

    if (isApi) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. You are sending requests too quickly. Please slow down.',
          retryAfter,
          tier: rateLimit.tierName,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimit.reset),
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    // Return HTML 429 page for web browsers
    return new NextResponse(generateRateLimitHtml(retryAfter, pathname), {
      status: 429,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(rateLimit.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(rateLimit.reset),
        'Cache-Control': 'no-store',
      },
    });
  }

  // 2. Normal Request Handling with Security & RateLimit Headers
  const response = NextResponse.next();

  // Rate Limiting Headers (IETF draft standard)
  response.headers.set('X-RateLimit-Limit', String(rateLimit.limit));
  response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
  response.headers.set('X-RateLimit-Reset', String(rateLimit.reset));

  // High-Security Global HTTP Headers (OWASP)
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Enforce no-cache on sensitive administrative API endpoints
  if (pathname.startsWith('/api/admin') || pathname.startsWith('/admin')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static build files)
     * - _next/image (image optimization files)
     * - favicon.ico, static images, fonts
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2)$).*)',
  ],
};

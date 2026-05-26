import { NextRequest } from 'next/server';

type RateLimitRecord = {
  count: number;
  resetTime: number;
};

// Memory store: map of Key (IP + Endpoint) -> Record
const store = new Map<string, RateLimitRecord>();
const highRiskIps = new Set<string>();
const blockedIps = new Set<string>();

const CLEANUP_INTERVAL = 1000 * 60 * 5; // 5 minutes
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, record] of store.entries()) {
    if (now > record.resetTime) {
      store.delete(key);
    }
  }
}

/**
 * Check rate limit for a given key.
 * @param key Unique key for the rate limit (e.g. "search:192.168.1.1")
 * @param limit Max requests allowed in the window
 * @param windowMs Time window in milliseconds
 * @returns true if allowed, false if limit exceeded
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  cleanup();
  
  // If globally blocked, reject immediately
  if (blockedIps.has(key)) return false;

  const now = Date.now();
  const record = store.get(key);

  if (!record || now > record.resetTime) {
    store.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}

/**
 * Checks if User-Agent matches known bots or malicious agents
 */
export function isMaliciousBot(userAgent: string | null): boolean {
  if (!userAgent) return true; // Block empty UA

  const ua = userAgent.toLowerCase();
  
  // Normal bots might be ok for SEO, but not for API downloads
  // The user requested blocking: curl, wget, python, scrapy, headless, bot, crawler, spider
  const blockedKeywords = [
    'curl', 'wget', 'python', 'scrapy', 'headless', 'bot', 'crawler', 'spider'
  ];

  // Allow Googlebot explicitly if needed, but since this is for DL/API, we might block it anyway.
  // The requirement says: "ただしGooglebot等の正規クローラはrobots.txtとSEO影響を見て慎重に扱ってください。"
  // We will allow normal googlebot for generic routes, but Download API should NOT be crawled anyway.
  
  // Check blocked
  return blockedKeywords.some(keyword => ua.includes(keyword));
}

/**
 * Flag an IP as high risk (e.g., hit a honeypot)
 */
export function flagHighRiskIp(ipHash: string) {
  highRiskIps.add(ipHash);
}

/**
 * Get stats for dashboard
 */
export function getSecurityStats() {
  let activeBlocks = 0;
  const now = Date.now();
  
  for (const record of store.values()) {
    // We can't perfectly know limits without parsing keys, but we just return map size
  }

  return {
    activeSessions: store.size,
    highRiskIpsCount: highRiskIps.size,
    blockedIpsCount: blockedIps.size
  };
}

/**
 * Helper to get IP from request
 */
export function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
}

/**
 * Helper to get UA from request
 */
export function getUa(req: NextRequest): string {
  return req.headers.get('user-agent') || '';
}

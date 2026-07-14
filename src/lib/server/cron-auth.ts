import crypto from 'node:crypto';
import { NextResponse } from 'next/server';

export function verifyCronRequest(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    console.error('[AUTH ERROR] CRON_SECRET is not configured in the environment.');
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Server authentication is not configured." },
        { status: 503 }
      ),
    };
  }

  const authorization = request.headers.get("authorization");
  const prefix = "Bearer ";

  if (!authorization || !authorization.startsWith(prefix)) {
    console.warn('[AUTH ERROR] Missing or invalid Authorization header format.');
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      ),
    };
  }

  const supplied = authorization.slice(prefix.length);

  try {
    const suppliedBuffer = Buffer.from(supplied);
    const secretBuffer = Buffer.from(secret);

    if (
      suppliedBuffer.length !== secretBuffer.length ||
      !crypto.timingSafeEqual(suppliedBuffer, secretBuffer)
    ) {
      console.warn('[AUTH ERROR] Token mismatch.');
      return {
        ok: false,
        response: NextResponse.json(
          { success: false, error: "Unauthorized." },
          { status: 401 }
        ),
      };
    }
  } catch (err) {
    console.error('[AUTH ERROR] Error during token verification:', err);
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      ),
    };
  }

  return { ok: true };
}

export function verifyAdminRequest(request: Request) {
  const adminSecret = process.env.ADMIN_API_SECRET;
  const dStrategyKey = process.env.D_STRATEGY_KEY;

  if (!adminSecret && !dStrategyKey) {
    console.error('[AUTH ERROR] ADMIN_API_SECRET and D_STRATEGY_KEY are not configured.');
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Server authentication is not configured." },
        { status: 503 }
      ),
    };
  }

  // 1. Check Cookies
  const cookieHeader = request.headers.get('cookie') || '';
  const cookiesArr = cookieHeader.split(';').map(c => c.trim());
  const dStrategyCookie = cookiesArr.find(c => c.startsWith('D_STRATEGY_KEY='));
  if (dStrategyCookie && dStrategyKey) {
    const cookieVal = dStrategyCookie.split('=')[1];
    if (cookieVal === dStrategyKey) {
      return { ok: true };
    }
  }

  // 2. Check Headers
  const authorization = request.headers.get("authorization") || request.headers.get("x-admin-token") || request.headers.get("x-agent-token");
  const prefix = "Bearer ";
  const supplied = authorization?.startsWith(prefix) ? authorization.slice(prefix.length) : authorization;

  if (!supplied) {
    console.warn('[AUTH ERROR] Missing authorization token for Admin API.');
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      ),
    };
  }

  try {
    const suppliedBuffer = Buffer.from(supplied);
    const secretBuffer = adminSecret ? Buffer.from(adminSecret) : Buffer.from('');
    const strategyBuffer = dStrategyKey ? Buffer.from(dStrategyKey) : Buffer.from('');

    const matchAdmin = adminSecret && suppliedBuffer.length === secretBuffer.length && crypto.timingSafeEqual(suppliedBuffer, secretBuffer);
    const matchStrategy = dStrategyKey && suppliedBuffer.length === strategyBuffer.length && crypto.timingSafeEqual(suppliedBuffer, strategyBuffer);

    if (!matchAdmin && !matchStrategy) {
      console.warn('[AUTH ERROR] Admin Token mismatch.');
      return {
        ok: false,
        response: NextResponse.json(
          { success: false, error: "Unauthorized." },
          { status: 401 }
        ),
      };
    }
  } catch (err) {
    console.error('[AUTH ERROR] Error during Admin token verification:', err);
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      ),
    };
  }

  return { ok: true };
}

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
  const secret = process.env.ADMIN_API_SECRET;

  if (!secret) {
    console.error('[AUTH ERROR] ADMIN_API_SECRET is not configured in the environment.');
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Server authentication is not configured." },
        { status: 503 }
      ),
    };
  }

  const authorization = request.headers.get("authorization") || request.headers.get("x-admin-token") || request.headers.get("x-agent-token");
  
  // Accept Bearer format or raw token
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
    const secretBuffer = Buffer.from(secret);

    if (
      suppliedBuffer.length !== secretBuffer.length ||
      !crypto.timingSafeEqual(suppliedBuffer, secretBuffer)
    ) {
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

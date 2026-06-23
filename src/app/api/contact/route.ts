import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create the client if we have a URL, prevents build-time errors
const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseKey) : null;

// In-memory simple rate limit (IP -> Timestamp)
const rateLimitCache = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 message per minute per IP

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    
    // 1. Rate Limiting Check
    const lastRequest = rateLimitCache.get(ip);
    const now = Date.now();
    if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW_MS) {
      return NextResponse.json({ error: 'Please wait a minute before sending another message.' }, { status: 429 });
    }

    const body = await req.json();
    const { name, email, message, _honeypot } = body;

    // 2. Honeypot Check (Spam prevention)
    if (_honeypot && _honeypot.length > 0) {
      // Silently accept but drop for bots filling invisible fields
      rateLimitCache.set(ip, now);
      return NextResponse.json({ success: true, message: 'Message sent successfully.' });
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, Email, and Message are required.' }, { status: 400 });
    }

    // 3. Save to Supabase (assuming table contact_messages exists)
    // If the table doesn't exist, it will fail gracefully.
    if (supabase) {
      const { error: dbError } = await supabase.from('contact_messages').insert([{
        name,
        email,
        message,
        ip_address: ip
      }]);

      if (dbError) {
        console.error("[Contact API] Supabase Insert Error:", dbError);
        // We still return success to the user so they don't panic if our DB is down,
        // but we log it for the admin.
      }
    } else {
      console.warn("[Contact API] Supabase client not initialized, skipping DB insert.");
    }

    // 4. Webhook Notification (Optional, if DISCORD_WEBHOOK_URL is set)
    const webhookUrl = process.env.CONTACT_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `**New Contact Message**\n**Name:** ${name}\n**Email:** ${email}\n**Message:**\n${message}`
          })
        });
      } catch (webhookErr) {
        console.error("[Contact API] Webhook notification failed:", webhookErr);
      }
    }

    rateLimitCache.set(ip, now);
    return NextResponse.json({ success: true, message: 'Message sent successfully.' });

  } catch (err: any) {
    console.error('[Contact API] Error processing request:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

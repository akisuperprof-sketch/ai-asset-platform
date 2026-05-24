import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { key } = await request.json();
    const serverKey = process.env.D_STRATEGY_KEY;

    if (!serverKey) {
      return NextResponse.json(
        { ok: false, error: 'SERVER_KEY_NOT_CONFIGURED' },
        { status: 500 }
      );
    }

    if (key === serverKey) {
      (await cookies()).set('d_strategy_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/admin',
        maxAge: 60 * 60 * 24 // 1 day
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { ok: false, error: 'INVALID_KEY' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'BAD_REQUEST' },
      { status: 400 }
    );
  }
}

export async function GET() {
  const session = (await cookies()).get('d_strategy_session');
  if (session?.value === 'authenticated') {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}

export async function DELETE() {
  (await cookies()).delete('d_strategy_session');
  return NextResponse.json({ ok: true });
}

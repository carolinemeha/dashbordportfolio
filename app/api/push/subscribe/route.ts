import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, JWT_COOKIE } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  const token = cookies().get(JWT_COOKIE)?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 });
  }

  let body: { endpoint?: string; keys?: Record<string, string>; locale?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const endpoint = String(body.endpoint || '').trim();
  if (!endpoint) {
    return NextResponse.json({ ok: false, reason: 'endpoint' }, { status: 400 });
  }

  const keys = { ...(body.keys || {}), source: 'admin' };

  const { error } = await supabaseAdmin.from('push_subscriptions').upsert(
    {
      endpoint,
      keys,
      locale: body.locale === 'en' ? 'en' : 'fr',
    },
    { onConflict: 'endpoint' }
  );

  if (error) {
    console.warn('[admin/push/subscribe]', error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

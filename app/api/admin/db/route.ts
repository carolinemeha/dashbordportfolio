import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, JWT_COOKIE } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { runAdminDataOp } from '@/lib/admin-data-ops';
import {
  adminApiMsgs,
  getAdminLocaleFromServerCookies,
  localizeAdminDataOpMessage,
} from '@/lib/admin-api-i18n';

export async function POST(req: Request) {
  const apiLocale = getAdminLocaleFromServerCookies();
  const msg = adminApiMsgs(apiLocale);
  const token = cookies().get(JWT_COOKIE)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: msg.notAuthenticated }, { status: 401 });
  }

  let body: { op?: string; args?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: msg.invalidJson }, { status: 400 });
  }
  if (!body?.op || typeof body.op !== 'string') {
    return NextResponse.json({ error: msg.opRequired }, { status: 400 });
  }

  try {
    const data = await runAdminDataOp(supabaseAdmin, body.op, body.args ?? {});
    return NextResponse.json({ data });
  } catch (e: unknown) {
    const raw = e instanceof Error ? e.message : msg.serverError;
    const localized = localizeAdminDataOpMessage(apiLocale, raw);
    console.error('[api/admin/db]', body.op, e);
    return NextResponse.json({ error: localized }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/require-admin-api';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  if (!(await requireAdminApi())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { data } = await supabaseAdmin
    .from('platform_availability')
    .select('status, response_minutes')
    .eq('id', 1)
    .maybeSingle();

  return NextResponse.json({
    status: data?.status ?? 'available',
    response_minutes: data?.response_minutes ?? 45,
  });
}

export async function PATCH(req: Request) {
  if (!(await requireAdminApi())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: { status?: string; response_minutes?: number } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const patch: Record<string, unknown> = { id: 1, updated_at: new Date().toISOString() };
  if (['available', 'busy', 'on_mission'].includes(body.status ?? '')) {
    patch.status = body.status;
  }
  if (typeof body.response_minutes === 'number') {
    patch.response_minutes = body.response_minutes;
  }

  const { error } = await supabaseAdmin.from('platform_availability').upsert(patch);

  if (error) {
    console.warn('[platform/availability]', error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

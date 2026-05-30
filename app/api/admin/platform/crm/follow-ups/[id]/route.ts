import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/require-admin-api';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdminApi())) {
    return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 });
  }

  const id = params?.id;
  let body: { status?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const status = ['done', 'skipped', 'pending'].includes(body.status ?? '')
    ? body.status
    : null;
  if (!status) return NextResponse.json({ ok: false }, { status: 400 });

  const patch: Record<string, unknown> = { status };
  if (status === 'done') patch.completed_at = new Date().toISOString();

  const { error } = await supabaseAdmin.from('crm_follow_ups').update(patch).eq('id', id);

  if (error) {
    console.warn('[admin/crm/follow-up patch]', error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

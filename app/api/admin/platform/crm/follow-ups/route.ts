import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/require-admin-api';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: Request) {
  if (!(await requireAdminApi())) {
    return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 });
  }

  const status = new URL(req.url).searchParams.get('status') || 'pending';

  const { data, error } = await supabaseAdmin
    .from('crm_follow_ups')
    .select(
      'id, contact_id, due_at, channel, status, note, auto_generated, crm_contacts(email, full_name, pipeline_stage)'
    )
    .eq('status', status)
    .order('due_at', { ascending: true })
    .limit(60);

  if (error) {
    console.warn('[admin/crm/follow-ups]', error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true, followUps: data || [] });
}

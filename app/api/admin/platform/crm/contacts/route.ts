import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/require-admin-api';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: Request) {
  if (!(await requireAdminApi())) {
    return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 });
  }

  const stage = new URL(req.url).searchParams.get('stage');
  let query = supabaseAdmin
    .from('crm_contacts')
    .select(
      'id, email, full_name, phone, company, source, pipeline_stage, locale, last_touch_at, created_at'
    )
    .order('last_touch_at', { ascending: false })
    .limit(80);

  if (stage) query = query.eq('pipeline_stage', stage);

  const { data, error } = await query;

  if (error) {
    console.warn('[admin/crm/contacts]', error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true, contacts: data || [] });
}

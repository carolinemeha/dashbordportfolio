import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/require-admin-api';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: Request) {
  if (!(await requireAdminApi())) {
    return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 });
  }

  const email = new URL(req.url).searchParams.get('email')?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ ok: false, reason: 'email' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('client_projects')
    .select('title, phase, progress_percent, access_token, updated_at')
    .eq('client_email', email)
    .order('updated_at', { ascending: false })
    .limit(20);

  if (error) {
    console.warn('[admin/crm/projects]', error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true, projects: data || [] });
}

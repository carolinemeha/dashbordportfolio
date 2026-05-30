import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/require-admin-api';
import { supabaseAdmin } from '@/lib/supabase-admin';

const STAGES = new Set(['lead', 'qualified', 'proposal', 'won', 'lost']);

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdminApi())) {
    return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 });
  }

  const id = params?.id;
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });

  let body: { pipelineStage?: string; note?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const toStage = body.pipelineStage;
  if (!toStage || !STAGES.has(toStage)) {
    return NextResponse.json({ ok: false, reason: 'stage' }, { status: 400 });
  }

  const { data: row } = await supabaseAdmin
    .from('crm_contacts')
    .select('pipeline_stage')
    .eq('id', id)
    .maybeSingle();

  const { error: upErr } = await supabaseAdmin
    .from('crm_contacts')
    .update({ pipeline_stage: toStage, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (upErr) {
    console.warn('[admin/crm/stage]', upErr.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  await supabaseAdmin.from('crm_pipeline_events').insert({
    contact_id: id,
    from_stage: row?.pipeline_stage ?? null,
    to_stage: toStage,
    note: body.note || null,
  });

  return NextResponse.json({ ok: true });
}

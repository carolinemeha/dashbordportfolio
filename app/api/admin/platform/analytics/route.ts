import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/require-admin-api';
import { fetchAnalyticsSummary } from '@/lib/platform/analytics-summary';

export async function GET() {
  if (!(await requireAdminApi())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const summary = await fetchAnalyticsSummary();
  return NextResponse.json(summary);
}

import { supabaseAdmin } from '@/lib/supabase-admin';

function tally(rows: { [key: string]: unknown }[] | null, key: string) {
  const m: Record<string, number> = {};
  for (const r of rows || []) {
    const v = r?.[key];
    if (!v) continue;
    const k = String(v);
    m[k] = (m[k] || 0) + 1;
  }
  return Object.entries(m)
    .sort((a, b) => b[1] - a[1])
    .map(([k, count]) => ({ key: k, count }));
}

export type AnalyticsSummary = {
  configured: boolean;
  liveVisitors: number;
  pageViews7d: number;
  sessions7d: number;
  topCountries: { key: string; count: number }[];
  topTech: { key: string; count: number }[];
  topProject: { id: string; title: string } | null;
};

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  const empty: AnalyticsSummary = {
    configured: false,
    liveVisitors: 0,
    pageViews7d: 0,
    sessions7d: 0,
    topCountries: [],
    topTech: [],
    topProject: null,
  };

  try {
    const now = Date.now();
    const liveSince = new Date(now - 2 * 60 * 1000).toISOString();
    const day7 = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
    const day30 = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { count: liveVisitors = 0 } = await supabaseAdmin
      .from('visitor_presence')
      .select('*', { count: 'exact', head: true })
      .gte('last_seen', liveSince);

    const { data: presenceRows } = await supabaseAdmin
      .from('visitor_presence')
      .select('country_code')
      .gte('last_seen', day7);

    const { data: viewRows } = await supabaseAdmin
      .from('page_views')
      .select('country')
      .gte('created_at', day7)
      .not('country', 'is', null);

    const mergedCountries = tally(
      [
        ...(presenceRows || []).map((r) => ({ country_code: r.country_code })),
        ...(viewRows || []).map((r) => ({ country: r.country, country_code: r.country })),
      ],
      'country_code'
    ).slice(0, 8);

    const { data: techRows } = await supabaseAdmin
      .from('tech_impressions')
      .select('tech_name')
      .gte('created_at', day30);

    const topTech = tally(techRows, 'tech_name').slice(0, 10);

    const { count: pageViews7d = 0 } = await supabaseAdmin
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', day7);

    const { count: sessions7d = 0 } = await supabaseAdmin
      .from('visitor_presence')
      .select('*', { count: 'exact', head: true })
      .gte('last_seen', day7);

    const { data: projRows } = await supabaseAdmin
      .from('project_impressions')
      .select('project_id')
      .gte('created_at', day30);

    const topPid = tally(projRows, 'project_id')[0]?.key ?? null;

    let topProject: AnalyticsSummary['topProject'] = null;
    if (topPid) {
      const { data: proj } = await supabaseAdmin
        .from('projects')
        .select('id,title')
        .eq('id', topPid)
        .maybeSingle();
      topProject = {
        id: proj?.id ?? topPid,
        title: proj?.title ?? '—',
      };
    }

    return {
      configured: true,
      liveVisitors: liveVisitors ?? 0,
      pageViews7d: pageViews7d ?? 0,
      sessions7d: sessions7d ?? 0,
      topCountries: mergedCountries,
      topTech,
      topProject,
    };
  } catch (e) {
    console.warn('[platform/analytics]', e);
    return empty;
  }
}

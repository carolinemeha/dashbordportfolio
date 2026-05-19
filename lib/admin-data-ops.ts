import type { SupabaseClient } from '@supabase/supabase-js';
import { fromDbJson, primaryForLegacyColumn } from './locale-text';

const ADMIN_CONSOLE_SETTINGS_ID = '00000000-0000-0000-0000-000000000002';

function dashActivityText(
  json: unknown,
  legacy: string | null | undefined
): string {
  return primaryForLegacyColumn(fromDbJson(json, legacy), 'fr');
}

type ActivityEntry = {
  id: string;
  type: string;
  subtitle: string;
  date: string;
};

function uniqIp(rows: { ip_hash: string | null }[] | null | undefined): number {
  const s = new Set<string>();
  for (const v of rows || []) {
    if (v.ip_hash != null && v.ip_hash !== '') s.add(v.ip_hash);
  }
  return s.size;
}

export async function runAdminDataOp(
  client: SupabaseClient,
  op: string,
  args: unknown
): Promise<unknown> {
  const a = (args ?? {}) as Record<string, unknown>;

  switch (op) {
    case 'projects.list': {
      const { data, error } = await client
        .from('projects')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
    case 'projects.get': {
      const id = String(a.id ?? '');
      const { data, error } = await client
        .from('projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    case 'projects.create': {
      const { data, error } = await client
        .from('projects')
        .insert(a.payload as Record<string, unknown>)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    case 'projects.update': {
      const id = String(a.id ?? '');
      const { data, error } = await client
        .from('projects')
        .update(a.payload as Record<string, unknown>)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    case 'projects.delete': {
      const id = String(a.id ?? '');
      const { error } = await client.from('projects').delete().eq('id', id);
      return !error;
    }

    case 'experiences.list': {
      const { data, error } = await client
        .from('experiences')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
    case 'experiences.get': {
      const id = String(a.id ?? '');
      const { data, error } = await client
        .from('experiences')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    case 'experiences.create': {
      const { data, error } = await client
        .from('experiences')
        .insert(a.payload as Record<string, unknown>)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    case 'experiences.update': {
      const id = String(a.id ?? '');
      const { data, error } = await client
        .from('experiences')
        .update(a.payload as Record<string, unknown>)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    case 'experiences.delete': {
      const id = String(a.id ?? '');
      const { error } = await client.from('experiences').delete().eq('id', id);
      return !error;
    }

    case 'skills.list': {
      const { data, error } = await client
        .from('skills')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data ?? [];
    }
    case 'skills.create': {
      const { data, error } = await client
        .from('skills')
        .insert(a.payload as Record<string, unknown>)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    case 'skills.update': {
      const id = String(a.id ?? '');
      const { data, error } = await client
        .from('skills')
        .update(a.payload as Record<string, unknown>)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    case 'skills.delete': {
      const id = String(a.id ?? '');
      const { error } = await client.from('skills').delete().eq('id', id);
      return !error;
    }

    case 'services.list': {
      const { data, error } = await client
        .from('services')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data ?? [];
    }
    case 'services.get': {
      const id = String(a.id ?? '');
      const { data, error } = await client
        .from('services')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    case 'services.create': {
      const { data, error } = await client
        .from('services')
        .insert(a.payload as Record<string, unknown>)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    case 'services.update': {
      const id = String(a.id ?? '');
      const { data, error } = await client
        .from('services')
        .update(a.payload as Record<string, unknown>)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    case 'services.delete': {
      const id = String(a.id ?? '');
      const { error } = await client.from('services').delete().eq('id', id);
      return !error;
    }

    case 'about.get': {
      const { data, error } = await client
        .from('about')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    case 'about.upsert': {
      const payload = a.payload as Record<string, unknown>;
      const { data: existing } = await client
        .from('about')
        .select('id')
        .limit(1)
        .maybeSingle();
      if (existing?.id) {
        const { data, error } = await client
          .from('about')
          .update(payload)
          .eq('id', existing.id as string)
          .select()
          .maybeSingle();
        if (error) throw error;
        return data;
      }
      const { data, error } = await client
        .from('about')
        .insert(payload)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    }

    case 'education.list': {
      const { data, error } = await client
        .from('education')
        .select('*')
        .order('duration', { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
    case 'education.get': {
      const id = String(a.id ?? '');
      const { data, error } = await client
        .from('education')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    case 'education.create': {
      const { data, error } = await client
        .from('education')
        .insert(a.payload as Record<string, unknown>)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    case 'education.update': {
      const id = String(a.id ?? '');
      const { data, error } = await client
        .from('education')
        .update(a.payload as Record<string, unknown>)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    case 'education.delete': {
      const id = String(a.id ?? '');
      const { error } = await client.from('education').delete().eq('id', id);
      return !error;
    }

    case 'testimonials.list': {
      const { data, error } = await client
        .from('testimonials')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
    case 'testimonials.get': {
      const id = String(a.id ?? '');
      const { data, error } = await client
        .from('testimonials')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    case 'testimonials.create': {
      const { data, error } = await client
        .from('testimonials')
        .insert(a.payload as Record<string, unknown>)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    case 'testimonials.update': {
      const id = String(a.id ?? '');
      const { data, error } = await client
        .from('testimonials')
        .update(a.payload as Record<string, unknown>)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    case 'testimonials.delete': {
      const id = String(a.id ?? '');
      const { error } = await client.from('testimonials').delete().eq('id', id);
      return !error;
    }

    case 'certifications.list': {
      const { data, error } = await client
        .from('certifications')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
    case 'certifications.get': {
      const id = String(a.id ?? '');
      const { data, error } = await client
        .from('certifications')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    case 'certifications.create': {
      const { data, error } = await client
        .from('certifications')
        .insert(a.payload as Record<string, unknown>)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    case 'certifications.update': {
      const id = String(a.id ?? '');
      const { data, error } = await client
        .from('certifications')
        .update(a.payload as Record<string, unknown>)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    case 'certifications.delete': {
      const id = String(a.id ?? '');
      const { error } = await client.from('certifications').delete().eq('id', id);
      return !error;
    }

    case 'contact_messages.list': {
      const { data, error } = await client
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
    case 'contact_messages.update': {
      const id = String(a.id ?? '');
      const { data, error } = await client
        .from('contact_messages')
        .update(a.payload as Record<string, unknown>)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    case 'contact_messages.delete': {
      const id = String(a.id ?? '');
      const { error } = await client.from('contact_messages').delete().eq('id', id);
      return !error;
    }

    case 'cv_info.get': {
      const { data, error } = await client
        .from('cv_info')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    case 'cv_info.upsert': {
      const { data, error } = await client
        .from('cv_info')
        .upsert(a.payload as Record<string, unknown>)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    case 'cv_info.delete_all': {
      const { error } = await client
        .from('cv_info')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      return !error;
    }

    case 'admin_console_settings.get': {
      const { data, error } = await client
        .from('admin_console_settings')
        .select('*')
        .eq('id', ADMIN_CONSOLE_SETTINGS_ID)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    case 'admin_console_settings.upsert': {
      const { error } = await client
        .from('admin_console_settings')
        .upsert(a.payload as Record<string, unknown>);
      if (error) throw error;
      return true;
    }

    case 'dashboard.stats': {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoIso = weekAgo.toISOString();

      const [
        viewsTotalRes,
        viewsWeekRes,
        visitorsAllRes,
        visitorsWeekRes,
        downloadsTotalRes,
        downloadsWeekRes,
        latestProject,
        latestSkill,
        latestMsg,
        latestExp,
        latestEdu,
        latestTesti,
        latestService,
      ] = await Promise.all([
        client.from('page_views').select('*', { count: 'exact', head: true }),
        client
          .from('page_views')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', weekAgoIso),
        client.from('page_views').select('ip_hash'),
        client
          .from('page_views')
          .select('ip_hash')
          .gte('created_at', weekAgoIso),
        client.from('cv_downloads').select('*', { count: 'exact', head: true }),
        client
          .from('cv_downloads')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', weekAgoIso),
        client
          .from('projects')
          .select('id, title, created_at, title_i18n')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        client
          .from('skills')
          .select('id, name, created_at, updated_at, name_i18n')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        client
          .from('contact_messages')
          .select('id, subject, created_at')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        client
          .from('experiences')
          .select(
            'id, company, position, created_at, company_i18n, position_i18n'
          )
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        client
          .from('education')
          .select(
            'id, institution, degree, created_at, institution_i18n, degree_i18n'
          )
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        client
          .from('testimonials')
          .select('id, name, created_at, name_i18n')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        client
          .from('services')
          .select('id, title, created_at, title_i18n')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const activity: ActivityEntry[] = [];

      if (latestProject.data?.created_at) {
        const lp = latestProject.data as Record<string, unknown>;
        activity.push({
          id: latestProject.data.id as string,
          type: 'project',
          subtitle: dashActivityText(lp.title_i18n, lp.title as string | null),
          date: latestProject.data.created_at as string,
        });
      }

      if (latestSkill.data) {
        const ls = latestSkill.data;
        const d = ls.updated_at || ls.created_at;
        if (d) {
          const row = ls as Record<string, unknown>;
          activity.push({
            id: ls.id,
            type: 'skill',
            subtitle: dashActivityText(row.name_i18n, row.name as string | null),
            date: d as string,
          });
        }
      }

      if (latestMsg.data?.created_at) {
        activity.push({
          id: latestMsg.data.id,
          type: 'message',
          subtitle: String(latestMsg.data.subject ?? '').trim(),
          date: latestMsg.data.created_at,
        });
      }

      if (latestExp.data?.created_at) {
        const le = latestExp.data as Record<string, unknown>;
        activity.push({
          id: latestExp.data.id,
          type: 'experience',
          subtitle: `${dashActivityText(le.position_i18n, le.position as string | null)} — ${dashActivityText(le.company_i18n, le.company as string | null)}`,
          date: latestExp.data.created_at as string,
        });
      }

      if (latestEdu.data?.created_at) {
        const ldu = latestEdu.data as Record<string, unknown>;
        activity.push({
          id: latestEdu.data.id,
          type: 'education',
          subtitle: `${dashActivityText(ldu.degree_i18n, ldu.degree as string | null)} — ${dashActivityText(ldu.institution_i18n, ldu.institution as string | null)}`,
          date: latestEdu.data.created_at as string,
        });
      }

      if (latestTesti.data?.created_at) {
        const lt = latestTesti.data as Record<string, unknown>;
        activity.push({
          id: latestTesti.data.id,
          type: 'testimonial',
          subtitle: dashActivityText(lt.name_i18n, lt.name as string | null),
          date: latestTesti.data.created_at as string,
        });
      }

      if (latestService.data?.created_at) {
        const lsv = latestService.data as Record<string, unknown>;
        activity.push({
          id: latestService.data.id,
          type: 'service',
          subtitle: dashActivityText(lsv.title_i18n, lsv.title as string | null),
          date: latestService.data.created_at as string,
        });
      }

      const recentActivity = activity
        .filter((e) => e.date && !Number.isNaN(new Date(e.date).getTime()))
        .sort(
          (x, y) => new Date(y.date).getTime() - new Date(x.date).getTime()
        )
        .slice(0, 8);

      return {
        totalViews: viewsTotalRes.count ?? 0,
        viewsThisWeek: viewsWeekRes.count ?? 0,
        uniqueVisitors: uniqIp(
          visitorsAllRes.data as { ip_hash: string | null }[]
        ),
        uniqueVisitorsThisWeek: uniqIp(
          visitorsWeekRes.data as { ip_hash: string | null }[]
        ),
        cvDownloads: downloadsTotalRes.count ?? 0,
        cvDownloadsThisWeek: downloadsWeekRes.count ?? 0,
        recentActivity,
      };
    }

    default:
      throw new Error(`Opération inconnue: ${op}`);
  }
}

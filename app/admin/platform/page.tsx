'use client';

import { useCallback, useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminPageToolbar } from '@/components/admin/AdminPageToolbar';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';
import { toast } from 'sonner';
import {
  BarChart3,
  Users,
  Globe2,
  Radio,
  Globe,
  Layers,
  Loader2,
  Bell,
  RefreshCcw,
} from 'lucide-react';
import type { AnalyticsSummary } from '@/lib/platform/analytics-summary';

const STAGES = ['lead', 'qualified', 'proposal', 'won', 'lost'] as const;

function barWidth(count: number, max: number) {
  if (!max) return '0%';
  return `${Math.max(8, Math.round((count / max) * 100))}%`;
}

export default function AdminPlatformPage() {
  const { t } = useAdminI18n();
  const vitrineUrl = (process.env.NEXT_PUBLIC_VITRINE_URL || 'http://localhost:3000').replace(
    /\/$/,
    ''
  );

  const [tab, setTab] = useState('analytics');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  const [contacts, setContacts] = useState<Record<string, unknown>[]>([]);
  const [followUps, setFollowUps] = useState<Record<string, unknown>[]>([]);
  const [projectsByEmail, setProjectsByEmail] = useState<Record<string, unknown[]>>({});
  const [loadingCrm, setLoadingCrm] = useState(false);

  const [status, setStatus] = useState('available');
  const [responseMin, setResponseMin] = useState(45);
  const [loadingGlobal, setLoadingGlobal] = useState(false);

  const loadAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch('/api/admin/platform/analytics', { credentials: 'include' });
      if (res.ok) setAnalytics(await res.json());
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  const loadCrm = useCallback(async () => {
    setLoadingCrm(true);
    try {
      const [cRes, fRes] = await Promise.all([
        fetch('/api/admin/platform/crm/contacts', { credentials: 'include' }),
        fetch('/api/admin/platform/crm/follow-ups?status=pending', {
          credentials: 'include',
        }),
      ]);
      if (cRes.ok) {
        const cData = await cRes.json();
        const list = cData.contacts || [];
        setContacts(list);
        await Promise.all(
          list.slice(0, 12).map(async (c: { email?: string }) => {
            if (!c.email) return;
            const pRes = await fetch(
              `/api/admin/platform/crm/projects?email=${encodeURIComponent(c.email)}`,
              { credentials: 'include' }
            );
            if (pRes.ok) {
              const pData = await pRes.json();
              setProjectsByEmail((prev) => ({
                ...prev,
                [c.email as string]: pData.projects || [],
              }));
            }
          })
        );
      }
      if (fRes.ok) {
        const fData = await fRes.json();
        setFollowUps(fData.followUps || []);
      }
    } catch {
      toast.error(t('platform.crm.loadError'));
    } finally {
      setLoadingCrm(false);
    }
  }, [t]);

  const loadGlobal = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/platform/availability', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.status) setStatus(data.status);
        if (data.response_minutes) setResponseMin(data.response_minutes);
      }
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    void loadAnalytics();
    void loadGlobal();
  }, [loadAnalytics, loadGlobal]);

  useEffect(() => {
    if (tab === 'crm') void loadCrm();
  }, [tab, loadCrm]);

  async function saveGlobal() {
    setLoadingGlobal(true);
    try {
      const res = await fetch('/api/admin/platform/availability', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, response_minutes: Number(responseMin) }),
      });
      if (res.ok) toast.success(t('platform.global.saved'));
      else toast.error(t('platform.global.error'));
    } finally {
      setLoadingGlobal(false);
    }
  }

  async function updateStage(contactId: string, pipelineStage: string) {
    const res = await fetch(`/api/admin/platform/crm/contacts/${contactId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pipelineStage }),
    });
    if (res.ok) {
      toast.success(t('platform.crm.stageUpdated'));
      void loadCrm();
    }
  }

  async function completeFollowUp(id: string) {
    const res = await fetch(`/api/admin/platform/crm/follow-ups/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    });
    if (res.ok) void loadCrm();
  }

  const topCountries = analytics?.topCountries || [];
  const topTech = analytics?.topTech || [];
  const maxCountry = Math.max(...topCountries.map((r) => r.count), 0);
  const maxTech = Math.max(...topTech.map((r) => r.count), 0);

  return (
    <div className="space-y-6">
      <AdminPageToolbar
        title={t('nav.platform.heading')}
        description={t('nav.platform.description')}
      />

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="grid w-full max-w-xl grid-cols-3">
          <TabsTrigger value="analytics" className="gap-1.5">
            <BarChart3 className="h-4 w-4" />
            {t('platform.tabs.analytics')}
          </TabsTrigger>
          <TabsTrigger value="crm" className="gap-1.5">
            <Users className="h-4 w-4" />
            {t('platform.tabs.crm')}
          </TabsTrigger>
          <TabsTrigger value="global" className="gap-1.5">
            <Globe className="h-4 w-4" />
            {t('platform.tabs.global')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadAnalytics()}
              disabled={loadingAnalytics}
            >
              {loadingAnalytics ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4 mr-2" />
              )}
              {t('platform.refresh')}
            </Button>
          </div>
          {loadingAnalytics && !analytics ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{t('platform.analytics.lead')}</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    icon: Radio,
                    label: t('platform.analytics.liveVisitors'),
                    value: analytics?.liveVisitors ?? 0,
                  },
                  {
                    label: t('platform.analytics.pageViews7d'),
                    value: analytics?.pageViews7d ?? 0,
                  },
                  {
                    label: t('platform.analytics.sessions7d'),
                    value: analytics?.sessions7d ?? 0,
                  },
                  {
                    label: t('platform.analytics.topProject'),
                    value: analytics?.topProject?.title ?? '—',
                    text: true,
                  },
                ].map((m) => {
                  const Icon = 'icon' in m ? m.icon : null;
                  return (
                    <Card key={m.label}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          {Icon ? <Icon className="h-4 w-4 text-emerald-500" /> : null}
                          {m.label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p
                          className={
                            m.text ? 'text-sm font-medium' : 'text-2xl font-bold tabular-nums'
                          }
                        >
                          {m.value}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Globe2 className="h-4 w-4" />
                      {t('platform.analytics.countries')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {topCountries.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {t('platform.analytics.noData')}
                      </p>
                    ) : (
                      topCountries.map((row) => (
                        <div key={row.key}>
                          <div className="flex justify-between text-xs mb-1">
                            <span>{row.key}</span>
                            <span>{row.count}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: barWidth(row.count, maxCountry || 1) }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      {t('platform.analytics.technologies')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {topTech.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {t('platform.analytics.noData')}
                      </p>
                    ) : (
                      topTech.map((row) => (
                        <div key={row.key}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="truncate">{row.key}</span>
                            <span>{row.count}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-violet-500 rounded-full"
                              style={{ width: barWidth(row.count, maxTech || 1) }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="crm" className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('platform.crm.lead')}</p>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadCrm()}
              disabled={loadingCrm}
            >
              {loadingCrm ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4 mr-2" />
              )}
              {t('platform.refresh')}
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('platform.crm.contacts')} ({contacts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[28rem] overflow-y-auto">
              {contacts.length === 0 && (
                <p className="text-sm text-muted-foreground">{t('platform.crm.empty')}</p>
              )}
              {contacts.map((c) => {
                const email = String(c.email || '');
                const projects = (projectsByEmail[email] || []) as {
                  title?: string;
                  phase?: string;
                  access_token?: string;
                }[];
                return (
                  <div
                    key={String(c.id)}
                    className="rounded-lg border p-3 text-sm space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{String(c.full_name || c.email)}</p>
                        <p className="text-xs text-muted-foreground">
                          {String(c.source)} ·{' '}
                          {new Date(String(c.last_touch_at)).toLocaleDateString()}
                        </p>
                      </div>
                      <Select
                        value={String(c.pipeline_stage)}
                        onValueChange={(v) => void updateStage(String(c.id), v)}
                      >
                        <SelectTrigger className="w-[140px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STAGES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {t(`platform.crm.stages.${s}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {projects.length > 0 && (
                      <ul className="text-xs space-y-1 border-t pt-2">
                        {projects.map((p) => (
                          <li key={p.access_token} className="flex justify-between gap-2">
                            <span className="truncate">{p.title}</span>
                            <a
                              href={`${vitrineUrl}/fr/hub?token=${encodeURIComponent(p.access_token || '')}#portal`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline shrink-0"
                            >
                              {p.phase}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" />
                {t('platform.crm.followUps')} ({followUps.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {followUps.map((f) => {
                const contact = f.crm_contacts as { full_name?: string; email?: string };
                return (
                  <div
                    key={String(f.id)}
                    className="flex items-center justify-between gap-2 rounded-lg bg-muted/30 p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{contact?.full_name || contact?.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(String(f.due_at)).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void completeFollowUp(String(f.id))}
                    >
                      {t('platform.crm.done')}
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="global" className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('platform.global.lead')}</p>
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-base">{t('platform.global.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t('platform.global.statusLabel')}</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">{t('platform.global.available')}</SelectItem>
                    <SelectItem value="busy">{t('platform.global.busy')}</SelectItem>
                    <SelectItem value="on_mission">{t('platform.global.mission')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">{t('platform.global.responseLabel')}</label>
                <Input
                  type="number"
                  min={5}
                  max={480}
                  value={responseMin}
                  onChange={(e) => setResponseMin(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <Button type="button" onClick={() => void saveGlobal()} disabled={loadingGlobal}>
                {loadingGlobal ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {t('platform.global.save')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { dataService, NewsletterSubscriber } from '@/lib/data';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';
import { Mail, Trash2, UserMinus, UserCheck, Download, Inbox } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

type FilterStatus = 'all' | 'active' | 'unsubscribed';

export default function NewsletterAdminPage() {
  const { t, dateLocale } = useAdminI18n();
  const [rows, setRows] = useState<NewsletterSubscriber[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    const data = await dataService.getNewsletterSubscribers();
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => {
    void reload();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return rows;
    return rows.filter((r) => r.status === filter);
  }, [rows, filter]);

  const activeCount = rows.filter((r) => r.status === 'active').length;

  const exportCsv = () => {
    const active = rows.filter((r) => r.status === 'active');
    if (!active.length) {
      toast.message(t('pages.newsletter.exportEmpty'));
      return;
    }
    const header = 'email,locale,source,subscribed_at';
    const lines = active.map(
      (r) =>
        `"${r.email.replace(/"/g, '""')}",${r.locale},${r.source},"${r.subscribedAt}"`
    );
    const blob = new Blob([[header, ...lines].join('\n')], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-active-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('pages.newsletter.exportDone'));
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirm.deleteSubscriber'))) return;
    const ok = await dataService.deleteNewsletterSubscriber(id);
    if (ok) {
      toast.success(t('pages.newsletter.deleted'));
      await reload();
    }
  };

  const toggleStatus = async (row: NewsletterSubscriber) => {
    const next = row.status === 'active' ? 'unsubscribed' : 'active';
    const updated = await dataService.updateNewsletterSubscriber(row.id, { status: next });
    if (updated) {
      toast.success(
        next === 'active'
          ? t('pages.newsletter.reactivated')
          : t('pages.newsletter.unsubscribed')
      );
      await reload();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Mail className="h-3 w-3" />
            {t('pages.newsletter.total', { count: String(rows.length) })}
          </Badge>
          <Badge className="gap-1">
            {t('pages.newsletter.active', { count: String(activeCount) })}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as FilterStatus)}>
            <SelectTrigger className="w-[180px] rounded-xl bg-secondary/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('pages.newsletter.filterAll')}</SelectItem>
              <SelectItem value="active">{t('pages.newsletter.filterActive')}</SelectItem>
              <SelectItem value="unsubscribed">
                {t('pages.newsletter.filterUnsub')}
              </SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" className="rounded-xl gap-2" onClick={exportCsv}>
            <Download className="h-4 w-4" />
            {t('pages.newsletter.exportCsv')}
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : filtered.length === 0 ? (
        <Card className="glass-card border-dashed border-2 border-border/50">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Inbox className="h-12 w-12 text-primary/50 mb-4" />
            <h3 className="text-lg font-semibold">{t('pages.newsletter.emptyTitle')}</h3>
            <p className="text-sm text-muted-foreground max-w-md mt-2">
              {t('pages.newsletter.emptyDesc')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-card border-border/50 overflow-hidden">
          <CardHeader className="border-b border-border/40 bg-secondary/20 py-3">
            <CardTitle className="text-base">{t('pages.newsletter.listTitle')}</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border/40">
                  <th className="p-3 font-medium">{t('pages.newsletter.colEmail')}</th>
                  <th className="p-3 font-medium">{t('pages.newsletter.colStatus')}</th>
                  <th className="p-3 font-medium hidden md:table-cell">
                    {t('pages.newsletter.colSource')}
                  </th>
                  <th className="p-3 font-medium hidden sm:table-cell">
                    {t('pages.newsletter.colLocale')}
                  </th>
                  <th className="p-3 font-medium hidden lg:table-cell">
                    {t('pages.newsletter.colDate')}
                  </th>
                  <th className="p-3 font-medium text-right">{t('pages.newsletter.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <motion.tr
                    key={row.id}
                    layout
                    initial={false}
                    className="border-b border-border/30 hover:bg-secondary/20"
                  >
                    <td className="p-3 font-medium break-all">{row.email}</td>
                    <td className="p-3">
                      <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>
                        {row.status === 'active'
                          ? t('pages.newsletter.statusActive')
                          : t('pages.newsletter.statusUnsub')}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell">{row.source}</td>
                    <td className="p-3 uppercase text-xs hidden sm:table-cell">{row.locale}</td>
                    <td className="p-3 text-muted-foreground text-xs hidden lg:table-cell">
                      {row.subscribedAt
                        ? new Date(row.subscribedAt).toLocaleString(dateLocale)
                        : '—'}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          title={
                            row.status === 'active'
                              ? t('pages.newsletter.unsubAction')
                              : t('pages.newsletter.reactivateAction')
                          }
                          onClick={() => void toggleStatus(row)}
                        >
                          {row.status === 'active' ? (
                            <UserMinus className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() => void handleDelete(row.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

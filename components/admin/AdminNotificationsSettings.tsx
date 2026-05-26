'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Loader2, Mail, Radio, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminPreferences } from '@/components/admin/AdminPreferenceProvider';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';
import {
  patchAdminPreferences,
  type AdminNotificationEventKey,
  type AdminNotificationPrefs,
} from '@/lib/admin-preferences';
import { getVapidPublicKey, urlBase64ToUint8Array } from '@/lib/vapid-client';

type StatusResponse = {
  mailConfigured: boolean;
  mailToAdminMasked: string | null;
  vapidPublicConfigured: boolean;
  vapidServerHint?: string;
};

const EVENT_KEYS: AdminNotificationEventKey[] = [
  'contact',
  'testimonial',
  'quote',
  'booking',
  'newsletter',
];

function mergeNotifications(
  cur: AdminNotificationPrefs,
  patch: Partial<AdminNotificationPrefs> & {
    events?: Partial<AdminNotificationPrefs['events']>;
  }
): AdminNotificationPrefs {
  return {
    ...cur,
    ...patch,
    events: {
      ...cur.events,
      ...(patch.events || {}),
    },
  };
}

export function AdminNotificationsSettings() {
  const { prefs } = useAdminPreferences();
  const { t, locale } = useAdminI18n();
  const n = prefs.notifications;
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [pushLoading, setPushLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    'default'
  );
  const vapidPublic = getVapidPublicKey();

  const loadStatus = useCallback(() => {
    fetch('/api/notifications/status', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: StatusResponse | null) => setStatus(data))
      .catch(() => setStatus(null));
  }, []);

  useEffect(() => {
    loadStatus();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    } else {
      setPermission('unsupported');
    }
  }, [loadStatus]);

  async function enablePush() {
    if (!('Notification' in window)) {
      toast.error(t('settings.notifications.unsupported'));
      return;
    }
    setPushLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') {
        toast.error(t('settings.notifications.denied'));
        return;
      }

      let endpoint = `browser://admin-${typeof window !== 'undefined' ? window.location.host : 'local'}`;
      const keys: Record<string, string> = {};

      if ('serviceWorker' in navigator && vapidPublic) {
        const reg = await navigator.serviceWorker.register('/sw.js').catch(() => null);
        await reg?.ready;
        if (reg?.pushManager) {
          try {
            let sub = await reg.pushManager.getSubscription();
            if (!sub) {
              sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublic),
              });
            }
            if (sub) {
              endpoint = sub.endpoint;
              const p256 = sub.getKey('p256dh');
              const auth = sub.getKey('auth');
              if (p256) {
                keys.p256dh = btoa(String.fromCharCode(...new Uint8Array(p256)));
              }
              if (auth) {
                keys.auth = btoa(String.fromCharCode(...new Uint8Array(auth)));
              }
            }
          } catch (e) {
            console.warn('[admin push]', e);
          }
        }
      }

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint, keys, locale }),
      });

      if (res.ok) {
        toast.success(t('settings.notifications.pushEnabled'));
        try {
          new Notification(t('settings.notifications.testTitle'), {
            body: t('settings.notifications.testBody'),
          });
        } catch {
          /* ignore */
        }
      } else {
        toast.error(t('settings.notifications.pushFailed'));
      }
    } catch {
      toast.error(t('settings.notifications.pushError'));
    } finally {
      setPushLoading(false);
    }
  }

  const setGlobal = (
    key: keyof Pick<AdminNotificationPrefs, 'emailEnabled' | 'pushEnabled' | 'realtimeEnabled'>,
    value: boolean
  ) => {
    patchAdminPreferences({
      notifications: mergeNotifications(n, { [key]: value }),
    });
    toast.success(t('settings.notifications.saved'));
  };

  const setEventChannel = (
    event: AdminNotificationEventKey,
    channel: 'email' | 'push' | 'realtime',
    value: boolean
  ) => {
    patchAdminPreferences({
      notifications: mergeNotifications(n, {
        events: {
          [event]: { ...n.events[event], [channel]: value },
        },
      }),
    });
    toast.success(t('settings.notifications.saved'));
  };

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="border-b border-border/40 bg-secondary/20">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          {t('settings.notifications.title')}
        </CardTitle>
        <CardDescription>{t('settings.notifications.description')}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-8">
        <div className="flex flex-wrap gap-2">
          <Badge variant={status?.mailConfigured ? 'default' : 'secondary'} className="gap-1">
            <Mail className="h-3 w-3" />
            {status?.mailConfigured
              ? t('settings.notifications.mailOk')
              : t('settings.notifications.mailMissing')}
          </Badge>
          {status?.mailToAdminMasked ? (
            <Badge variant="outline">{status.mailToAdminMasked}</Badge>
          ) : null}
          <Badge
            variant={status?.vapidPublicConfigured ? 'default' : 'secondary'}
            className="gap-1"
          >
            <Smartphone className="h-3 w-3" />
            {status?.vapidPublicConfigured
              ? t('settings.notifications.vapidOk')
              : t('settings.notifications.vapidMissing')}
          </Badge>
        </div>
        {status?.vapidServerHint ? (
          <p className="text-xs text-muted-foreground">{status.vapidServerHint}</p>
        ) : null}

        <div className="space-y-4">
          <h3 className="text-sm font-semibold">{t('settings.notifications.globalTitle')}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-secondary/10 px-4 py-3">
              <div className="min-w-0">
                <Label className="text-sm font-medium">{t('settings.notifications.emailGlobal')}</Label>
                <p className="text-xs text-muted-foreground">
                  {t('settings.notifications.emailGlobalDesc')}
                </p>
              </div>
              <Switch
                checked={n.emailEnabled}
                onCheckedChange={(v) => setGlobal('emailEnabled', v)}
              />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-secondary/10 px-4 py-3">
              <div className="min-w-0">
                <Label className="text-sm font-medium">{t('settings.notifications.pushGlobal')}</Label>
                <p className="text-xs text-muted-foreground">
                  {t('settings.notifications.pushGlobalDesc')}
                </p>
              </div>
              <Switch
                checked={n.pushEnabled}
                onCheckedChange={(v) => setGlobal('pushEnabled', v)}
              />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-secondary/10 px-4 py-3">
              <div className="min-w-0">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Radio className="h-3.5 w-3.5" />
                  {t('settings.notifications.realtimeGlobal')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t('settings.notifications.realtimeGlobalDesc')}
                </p>
              </div>
              <Switch
                checked={n.realtimeEnabled}
                onCheckedChange={(v) => setGlobal('realtimeEnabled', v)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 overflow-x-auto">
          <h3 className="text-sm font-semibold">{t('settings.notifications.eventsTitle')}</h3>
          <table className="w-full min-w-[520px] text-sm border-collapse">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border/50">
                <th className="py-2 pr-4 font-medium">{t('settings.notifications.colEvent')}</th>
                <th className="py-2 px-2 font-medium text-center">{t('settings.notifications.colEmail')}</th>
                <th className="py-2 px-2 font-medium text-center">{t('settings.notifications.colPush')}</th>
                <th className="py-2 pl-2 font-medium text-center">{t('settings.notifications.colRealtime')}</th>
              </tr>
            </thead>
            <tbody>
              {EVENT_KEYS.map((ev) => (
                <tr key={ev} className="border-b border-border/30">
                  <td className="py-3 pr-4 font-medium">{t(`settings.notifications.event.${ev}`)}</td>
                  <td className="py-3 px-2 text-center">
                    <Switch
                      checked={n.events[ev].email}
                      onCheckedChange={(v) => setEventChannel(ev, 'email', v)}
                      aria-label={`${ev} email`}
                    />
                  </td>
                  <td className="py-3 px-2 text-center">
                    <Switch
                      checked={n.events[ev].push}
                      onCheckedChange={(v) => setEventChannel(ev, 'push', v)}
                      aria-label={`${ev} push`}
                    />
                  </td>
                  <td className="py-3 pl-2 text-center">
                    <Switch
                      checked={n.events[ev].realtime}
                      onCheckedChange={(v) => setEventChannel(ev, 'realtime', v)}
                      aria-label={`${ev} realtime`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-muted-foreground">{t('settings.notifications.contactNote')}</p>
        </div>

        <div className="rounded-xl border border-border/50 bg-secondary/10 p-4 space-y-3">
          <h3 className="text-sm font-semibold">{t('settings.notifications.browserTitle')}</h3>
          <p className="text-xs text-muted-foreground">{t('settings.notifications.browserDesc')}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={() => void enablePush()}
              disabled={pushLoading || permission === 'denied' || !n.pushEnabled}
              className="rounded-xl gap-2"
            >
              {pushLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
              {t('settings.notifications.enablePush')}
            </Button>
            {permission === 'denied' && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <BellOff className="h-3 w-3" />
                {t('settings.notifications.deniedHint')}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

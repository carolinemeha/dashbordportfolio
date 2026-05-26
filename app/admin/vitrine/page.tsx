'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminPageToolbar } from '@/components/admin/AdminPageToolbar';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';
import {
  vitrineCmsService,
  type PlatformAvailability,
  type PlatformChangelog,
  type PlatformRoadmapItem,
  type VitrineNotification,
} from '@/lib/vitrine-cms';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function VitrineExtrasPage() {
  const { t } = useAdminI18n();
  const [notifications, setNotifications] = useState<VitrineNotification[]>([]);
  const [changelog, setChangelog] = useState<PlatformChangelog[]>([]);
  const [roadmap, setRoadmap] = useState<PlatformRoadmapItem[]>([]);
  const [availability, setAvailability] = useState<PlatformAvailability | null>(null);

  const [notifForm, setNotifForm] = useState({
    type: 'info',
    titleFr: '',
    titleEn: '',
    bodyFr: '',
    bodyEn: '',
    link: '',
    published: true,
  });

  const reload = async () => {
    const [n, c, r, a] = await Promise.all([
      vitrineCmsService.getNotifications(),
      vitrineCmsService.getChangelog(),
      vitrineCmsService.getRoadmap(),
      vitrineCmsService.getAvailability(),
    ]);
    setNotifications(n);
    setChangelog(c);
    setRoadmap(r);
    setAvailability(
      a ?? {
        status: 'available',
        responseMinutes: 45,
        timezone: 'Africa/Porto-Novo',
        cityFr: 'Cotonou',
        cityEn: 'Cotonou',
        workStartHour: 9,
        workEndHour: 18,
        workDays: [1, 2, 3, 4, 5],
      }
    );
  };

  useEffect(() => {
    void reload();
  }, []);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground max-w-2xl">
        {t('nav.vitrine.description')} — alimente <strong>/platform</strong>, le widget
        disponibilité et le Lab (notifications).
      </p>

      <Tabs defaultValue="availability">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="availability">Disponibilité</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="changelog">Changelog</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="availability" className="mt-4">
          {availability && (
            <Card>
              <CardHeader>
                <CardTitle>Barre live (vitrine)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Statut</Label>
                  <Select
                    value={availability.status}
                    onValueChange={(v) =>
                      setAvailability({
                        ...availability,
                        status: v as PlatformAvailability['status'],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Disponible</SelectItem>
                      <SelectItem value="busy">Occupée</SelectItem>
                      <SelectItem value="on_mission">En mission</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Délai réponse (min)</Label>
                  <Input
                    type="number"
                    value={availability.responseMinutes}
                    onChange={(e) =>
                      setAvailability({
                        ...availability,
                        responseMinutes: Number(e.target.value) || 45,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Ville FR</Label>
                  <Input
                    value={availability.cityFr}
                    onChange={(e) => setAvailability({ ...availability, cityFr: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Fuseau</Label>
                  <Input
                    value={availability.timezone}
                    onChange={(e) => setAvailability({ ...availability, timezone: e.target.value })}
                  />
                </div>
                <Button
                  className="sm:col-span-2"
                  onClick={async () => {
                    const ok = await vitrineCmsService.saveAvailability(availability);
                    toast[ok ? 'success' : 'error'](ok ? t('forms.shared.save') : t('forms.shared.saveError'));
                  }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nouvelle notification</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Input
                placeholder="Titre FR"
                value={notifForm.titleFr}
                onChange={(e) => setNotifForm({ ...notifForm, titleFr: e.target.value })}
              />
              <Input
                placeholder="Titre EN"
                value={notifForm.titleEn}
                onChange={(e) => setNotifForm({ ...notifForm, titleEn: e.target.value })}
              />
              <Textarea
                placeholder="Corps FR"
                value={notifForm.bodyFr}
                onChange={(e) => setNotifForm({ ...notifForm, bodyFr: e.target.value })}
              />
              <AdminPageToolbar>
                <Button
                  onClick={async () => {
                    const created = await vitrineCmsService.createNotification(notifForm);
                    if (created) {
                      toast.success('Notification créée');
                      setNotifForm({
                        type: 'info',
                        titleFr: '',
                        titleEn: '',
                        bodyFr: '',
                        bodyEn: '',
                        link: '',
                        published: true,
                      });
                      await reload();
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Publier
                </Button>
              </AdminPageToolbar>
            </CardContent>
          </Card>
          {notifications.map((n) => (
            <Card key={n.id}>
              <CardContent className="py-4 flex justify-between gap-4">
                <div>
                  <p className="font-medium">{n.titleFr}</p>
                  <p className="text-sm text-muted-foreground">{n.bodyFr}</p>
                </div>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={async () => {
                    if (await vitrineCmsService.deleteNotification(n.id)) await reload();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="changelog" className="mt-4 space-y-4">
          <AdminPageToolbar>
            <Button
              onClick={async () => {
                const v = window.prompt('Version (ex. 2.1.0)', '2.1.0');
                if (!v) return;
                await vitrineCmsService.createChangelog({
                  version: v,
                  releasedAt: new Date().toISOString().slice(0, 10),
                  tagFr: 'Release',
                  tagEn: 'Release',
                  itemsFr: ['Nouvelle fonctionnalité'],
                  itemsEn: ['New feature'],
                  published: true,
                  sortOrder: changelog.length,
                });
                await reload();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Version
            </Button>
          </AdminPageToolbar>
          {changelog.map((c) => (
            <Card key={c.id}>
              <CardContent className="py-3 flex justify-between">
                <span>
                  <strong>{c.version}</strong> — {c.tagFr}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={async () => {
                    if (await vitrineCmsService.deleteChangelog(c.id)) await reload();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="roadmap" className="mt-4 space-y-4">
          <AdminPageToolbar>
            <Button
              onClick={async () => {
                const slug = window.prompt('Slug roadmap', `item-${Date.now()}`);
                if (!slug) return;
                await vitrineCmsService.createRoadmapItem({
                  slug,
                  status: 'planned',
                  quarterFr: 'T3 2026',
                  quarterEn: 'Q3 2026',
                  titleFr: 'Nouvelle entrée',
                  titleEn: 'New entry',
                  descriptionFr: '',
                  descriptionEn: '',
                  published: true,
                  sortOrder: roadmap.length,
                });
                await reload();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Entrée roadmap
            </Button>
          </AdminPageToolbar>
          {roadmap.map((r) => (
            <Card key={r.id}>
              <CardContent className="py-3 flex justify-between">
                <span>
                  {r.titleFr} <em className="text-muted-foreground">({r.status})</em>
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={async () => {
                    if (await vitrineCmsService.deleteRoadmapItem(r.id)) await reload();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

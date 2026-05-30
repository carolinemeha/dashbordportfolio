'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { AdminPageToolbar } from '@/components/admin/AdminPageToolbar';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';
import BlogCoverField from '@/components/admin/BlogCoverField';
import { vitrineCmsService, type BlogPost } from '@/lib/vitrine-cms';
import { resolveVitrineAssetUrl } from '@/lib/vitrine-url';
import { Plus, Edit, Trash2, Newspaper } from 'lucide-react';
import { toast } from 'sonner';

const emptyPost = (): Omit<BlogPost, 'id'> => ({
  slug: '',
  titleFr: '',
  titleEn: '',
  excerptFr: '',
  excerptEn: '',
  contentFr: '',
  contentEn: '',
  tags: [],
  coverImage: '',
  published: true,
  publishedAt: new Date().toISOString(),
});

export default function BlogAdminPage() {
  const { t } = useAdminI18n();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(emptyPost());

  const reload = async () => setPosts(await vitrineCmsService.getBlogPosts());

  useEffect(() => {
    void reload();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm(emptyPost());
    setOpen(true);
  };

  const openEdit = (p: BlogPost) => {
    setEditing(p);
    const { id: _id, ...rest } = p;
    setForm(rest);
    setOpen(true);
  };

  const save = async () => {
    if (!form.slug.trim() || !form.titleFr.trim()) {
      toast.error('Slug et titre FR requis');
      return;
    }
    const payload = { ...form, tags: form.tags };
    if (editing) {
      const updated = await vitrineCmsService.updateBlogPost(editing.id, payload);
      if (!updated) {
        toast.error(t('forms.shared.saveError'));
        return;
      }
    } else {
      const created = await vitrineCmsService.createBlogPost(payload);
      if (!created) {
        toast.error(t('forms.shared.saveError'));
        return;
      }
    }
    toast.success(t('forms.shared.save'));
    setOpen(false);
    await reload();
  };

  const remove = async (id: string) => {
    if (!confirm('Supprimer cet article ?')) return;
    if (await vitrineCmsService.deleteBlogPost(id)) {
      toast.success('Article supprimé');
      await reload();
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageToolbar>
        <Button onClick={openNew} className="rounded-xl">
          <Plus className="h-4 w-4 mr-2" />
          Nouvel article
        </Button>
      </AdminPageToolbar>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Aucun article — ils apparaîtront sur <strong>/blog</strong> de la vitrine.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {posts.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              {p.coverImage ? (
                <div className="aspect-[1200/630] w-full border-b border-border/50 bg-muted/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveVitrineAssetUrl(p.coverImage)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="min-w-0">
                  <CardTitle className="text-lg leading-snug">{p.titleFr}</CardTitle>
                  <p className="text-sm text-muted-foreground truncate">/blog/{p.slug}</p>
                  {p.coverImage ? (
                    <p className="mt-1 text-[10px] font-mono text-muted-foreground truncate">
                      {p.coverImage}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-amber-600">Sans couverture</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                  <Badge variant={p.published ? 'default' : 'secondary'}>
                    {p.published ? 'Publié' : 'Brouillon'}
                  </Badge>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" onClick={() => openEdit(p)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => remove(p.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5" />
              {editing ? 'Modifier l’article' : 'Nouvel article'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Slug (URL)</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="mon-article"
                />
              </div>
              <div className="flex items-end gap-2 pb-1">
                <Switch
                  checked={form.published}
                  onCheckedChange={(v) => setForm({ ...form, published: v })}
                />
                <Label>Publié sur la vitrine</Label>
              </div>
            </div>

            <BlogCoverField
              value={form.coverImage}
              onChange={(coverImage) => setForm({ ...form, coverImage })}
              slug={form.slug}
              label={t('forms.project.coverImage')}
              uploadSuccessMessage={t('imageUpload.coverSuccess')}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Titre FR</Label>
                <Input value={form.titleFr} onChange={(e) => setForm({ ...form, titleFr: e.target.value })} />
              </div>
              <div>
                <Label>Titre EN</Label>
                <Input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Extrait FR</Label>
                <Textarea
                  value={form.excerptFr}
                  onChange={(e) => setForm({ ...form, excerptFr: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label>Extrait EN</Label>
                <Textarea
                  value={form.excerptEn}
                  onChange={(e) => setForm({ ...form, excerptEn: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <div>
              <Label>Contenu FR (Markdown)</Label>
              <Textarea
                value={form.contentFr}
                onChange={(e) => setForm({ ...form, contentFr: e.target.value })}
                rows={6}
              />
            </div>
            <div>
              <Label>Contenu EN (Markdown)</Label>
              <Textarea
                value={form.contentEn}
                onChange={(e) => setForm({ ...form, contentEn: e.target.value })}
                rows={6}
              />
            </div>
            <div>
              <Label>Tags (séparés par des virgules)</Label>
              <Input
                value={form.tags.join(', ')}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tags: e.target.value.split(',').map((x) => x.trim()).filter(Boolean),
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('forms.shared.cancel')}
            </Button>
            <Button onClick={save}>{t('forms.shared.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

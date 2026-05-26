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
import { vitrineCmsService, type BlogPost } from '@/lib/vitrine-cms';
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
    const tags = form.tags;
    const payload = { ...form, tags };
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
        <div className="grid gap-4">
          {posts.map((p) => (
            <Card key={p.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">{p.titleFr}</CardTitle>
                  <p className="text-sm text-muted-foreground">/blog/{p.slug}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Badge variant={p.published ? 'default' : 'secondary'}>
                    {p.published ? 'Publié' : 'Brouillon'}
                  </Badge>
                  <Button size="icon" variant="outline" onClick={() => openEdit(p)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => remove(p.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5" />
              {editing ? 'Modifier l’article' : 'Nouvel article'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Slug (URL)</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="mon-article"
                />
              </div>
              <div className="flex items-end gap-2">
                <Switch
                  checked={form.published}
                  onCheckedChange={(v) => setForm({ ...form, published: v })}
                />
                <Label>Publié sur la vitrine</Label>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Titre FR</Label>
                <Input value={form.titleFr} onChange={(e) => setForm({ ...form, titleFr: e.target.value })} />
              </div>
              <div>
                <Label>Titre EN</Label>
                <Input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Extrait FR</Label>
              <Textarea value={form.excerptFr} onChange={(e) => setForm({ ...form, excerptFr: e.target.value })} rows={2} />
            </div>
            <div>
              <Label>Contenu FR (Markdown)</Label>
              <Textarea value={form.contentFr} onChange={(e) => setForm({ ...form, contentFr: e.target.value })} rows={6} />
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

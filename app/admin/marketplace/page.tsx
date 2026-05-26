'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { AdminPageToolbar } from '@/components/admin/AdminPageToolbar';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';
import { vitrineCmsService, type MarketplaceProduct } from '@/lib/vitrine-cms';
import { Plus, Edit, Trash2, Store } from 'lucide-react';
import { toast } from 'sonner';

const emptyProduct = (): Omit<MarketplaceProduct, 'id'> => ({
  slug: '',
  category: 'kit',
  titleFr: '',
  titleEn: '',
  descriptionFr: '',
  descriptionEn: '',
  priceCents: 0,
  currency: 'EUR',
  previewUrl: '',
  ctaUrl: '',
  published: true,
  sortOrder: 0,
});

export default function MarketplaceAdminPage() {
  const { t } = useAdminI18n();
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MarketplaceProduct | null>(null);
  const [form, setForm] = useState(emptyProduct());

  const reload = async () => setProducts(await vitrineCmsService.getMarketplaceProducts());

  useEffect(() => {
    void reload();
  }, []);

  const save = async () => {
    if (!form.slug.trim() || !form.titleFr.trim()) {
      toast.error('Slug et titre FR requis');
      return;
    }
    if (editing) {
      const updated = await vitrineCmsService.updateMarketplaceProduct(editing.id, form);
      if (!updated) {
        toast.error(t('forms.shared.saveError'));
        return;
      }
    } else {
      const created = await vitrineCmsService.createMarketplaceProduct(form);
      if (!created) {
        toast.error(t('forms.shared.saveError'));
        return;
      }
    }
    toast.success(t('forms.shared.save'));
    setOpen(false);
    await reload();
  };

  return (
    <div className="space-y-6">
      <AdminPageToolbar>
        <Button
          className="rounded-xl"
          onClick={() => {
            setEditing(null);
            setForm(emptyProduct());
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau produit
        </Button>
      </AdminPageToolbar>

      <div className="grid gap-4 md:grid-cols-2">
        {products.map((p) => (
          <Card key={p.id}>
            <CardHeader className="flex flex-row justify-between gap-2">
              <div>
                <CardTitle className="text-base">{p.titleFr}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {p.category} · {(p.priceCents / 100).toFixed(0)} {p.currency}
                </p>
              </div>
              <div className="flex gap-1">
                <Badge variant={p.published ? 'default' : 'secondary'}>
                  {p.published ? 'Publié' : 'Masqué'}
                </Badge>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    setEditing(p);
                    const { id: _id, ...rest } = p;
                    setForm(rest);
                    setOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={async () => {
                    if (!confirm('Supprimer ce produit ?')) return;
                    if (await vitrineCmsService.deleteMarketplaceProduct(p.id)) await reload();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Produit marketplace
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div>
                <Label>Catégorie</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm({ ...form, category: v as MarketplaceProduct['category'] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kit">Kit</SelectItem>
                    <SelectItem value="template">Template</SelectItem>
                    <SelectItem value="component">Composant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Input
              placeholder="Titre FR"
              value={form.titleFr}
              onChange={(e) => setForm({ ...form, titleFr: e.target.value })}
            />
            <Input
              placeholder="Titre EN"
              value={form.titleEn}
              onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
            />
            <Textarea
              placeholder="Description FR"
              value={form.descriptionFr}
              onChange={(e) => setForm({ ...form, descriptionFr: e.target.value })}
              rows={3}
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>Prix (centimes)</Label>
                <Input
                  type="number"
                  value={form.priceCents}
                  onChange={(e) => setForm({ ...form, priceCents: Number(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Devise</Label>
                <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
              </div>
              <div>
                <Label>Ordre</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })}
                />
              </div>
            </div>
            <Input
              placeholder="URL CTA (mailto ou lien)"
              value={form.ctaUrl}
              onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
              <Label>Visible sur /marketplace</Label>
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

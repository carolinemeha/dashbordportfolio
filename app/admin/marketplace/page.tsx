'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminPageToolbar } from '@/components/admin/AdminPageToolbar';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';
import MarketplaceProductForm, {
  emptyMarketplaceProduct,
  type MarketplaceFormState,
} from '@/components/admin/MarketplaceProductForm';
import { vitrineCmsService, type MarketplaceProduct } from '@/lib/vitrine-cms';
import { formatPriceFromCents, getCategoryFormConfig } from '@/lib/marketplace-product-admin';
import { resolveVitrineAssetUrl } from '@/lib/vitrine-url';
import { Plus, Edit, Trash2, Store, Star, ExternalLink, Copy, PackageCheck } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_BADGE: Record<MarketplaceProduct['category'], string> = {
  kit: 'Kit',
  template: 'Template',
  component: 'Composant',
};

export default function MarketplaceAdminPage() {
  const { t } = useAdminI18n();
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MarketplaceProduct | null>(null);
  const [form, setForm] = useState<MarketplaceFormState>(emptyMarketplaceProduct());
  const [saving, setSaving] = useState(false);

  const reload = async () => setProducts(await vitrineCmsService.getMarketplaceProducts());

  useEffect(() => {
    void reload();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm(emptyMarketplaceProduct());
    setOpen(true);
  };

  const openEdit = (p: MarketplaceProduct) => {
    setEditing(p);
    const { id: _id, ...rest } = p;
    setForm(rest);
    setOpen(true);
  };

  const save = async () => {
    if (!form.titleFr.trim()) {
      toast.error(t('forms.marketplace.validationTitle'));
      return;
    }
    if (!form.slug.trim() && !form.titleFr.trim()) {
      toast.error(t('forms.marketplace.validationSlug'));
      return;
    }

    const catCfg = getCategoryFormConfig(form.category);
    if (catCfg.requireDelivery && !form.deliveryUrl.trim()) {
      toast.error(t('forms.marketplace.validationDelivery'));
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await vitrineCmsService.updateMarketplaceProduct(editing.id, form);
      } else {
        await vitrineCmsService.createMarketplaceProduct(form);
      }
      toast.success(t('forms.shared.save'));
      setOpen(false);
      await reload();
    } catch (e) {
      const detail = e instanceof Error ? e.message : '';
      toast.error(
        detail
          ? t('forms.shared.saveErrorDetail', { detail })
          : t('forms.shared.saveError')
      );
    } finally {
      setSaving(false);
    }
  };

  const copyDeliveryUrl = async (url: string) => {
    if (!url.trim()) {
      toast.error(t('forms.marketplace.deliveryMissing'));
      return;
    }
    try {
      await navigator.clipboard.writeText(url.trim());
      toast.success(t('forms.marketplace.deliveryCopied'));
    } catch {
      toast.error(t('forms.shared.saveError'));
    }
  };

  const remove = async (id: string) => {
    if (!confirm(t('forms.marketplace.confirmDelete'))) return;
    if (await vitrineCmsService.deleteMarketplaceProduct(id)) {
      toast.success(t('forms.marketplace.deleted'));
      await reload();
    } else {
      toast.error(t('forms.shared.saveError'));
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageToolbar>
        <Button className="rounded-xl" onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" />
          {t('forms.marketplace.newProduct')}
        </Button>
      </AdminPageToolbar>

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t('forms.marketplace.empty')}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {products.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              {p.previewUrl ? (
                <div className="aspect-video w-full border-b border-border/50 bg-muted/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      p.previewUrl.startsWith('http')
                        ? p.previewUrl
                        : resolveVitrineAssetUrl(p.previewUrl)
                    }
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base leading-snug">{p.titleFr}</CardTitle>
                    {p.isFeatured ? (
                      <Badge variant="outline" className="gap-1 text-amber-600 border-amber-500/40">
                        <Star className="h-3 w-3 fill-current" />
                        {t('forms.marketplace.featuredShort')}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate">/marketplace · {p.slug}</p>
                  <p className="text-sm text-muted-foreground">
                    {CATEGORY_BADGE[p.category]} · {formatPriceFromCents(p.priceCents, p.currency)} ·{' '}
                    {t('forms.marketplace.orderLabel', { n: p.sortOrder })}
                  </p>
                  <p className="text-xs flex items-center gap-1.5">
                    <PackageCheck
                      className={`h-3.5 w-3.5 shrink-0 ${p.deliveryUrl ? 'text-green-600' : 'text-muted-foreground'}`}
                    />
                    <span className={p.deliveryUrl ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'}>
                      {p.deliveryUrl
                        ? t('forms.marketplace.deliveryConfigured')
                        : t('forms.marketplace.deliveryMissing')}
                    </span>
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Badge variant={p.published ? 'default' : 'secondary'}>
                    {p.published ? t('forms.marketplace.statusPublished') : t('forms.marketplace.statusHidden')}
                  </Badge>
                  <div className="flex gap-1">
                    {p.deliveryUrl ? (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          title={t('forms.marketplace.deliveryCopy')}
                          onClick={() => copyDeliveryUrl(p.deliveryUrl)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" asChild>
                          <a href={p.deliveryUrl} target="_blank" rel="noopener noreferrer" title={t('forms.marketplace.deliveryOpen')}>
                            <PackageCheck className="h-4 w-4 text-green-600" />
                          </a>
                        </Button>
                      </>
                    ) : null}
                    {p.ctaUrl ? (
                      <Button size="icon" variant="ghost" asChild>
                        <a href={p.ctaUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    ) : null}
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
              <Store className="h-5 w-5" />
              {editing ? t('forms.marketplace.titleEdit') : t('forms.marketplace.titleNew')}
            </DialogTitle>
            <DialogDescription>{t('forms.marketplace.desc')}</DialogDescription>
          </DialogHeader>

          <MarketplaceProductForm form={form} onChange={setForm} />

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              {t('forms.shared.cancel')}
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? t('forms.shared.saving') : t('forms.shared.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

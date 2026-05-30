'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { LocaleTextFieldGroup } from '@/components/admin/LocaleTextFieldGroup';
import { BilingualFormHint } from '@/components/admin/BilingualFormHint';
import ImageUpload from '@/components/admin/ImageUpload';
import { useAdminI18n } from '@/components/admin/AdminI18nProvider';
import type { MarketplaceProduct } from '@/lib/vitrine-cms';
import {
  buildMarketplaceMailto,
  formatPriceFromCents,
  getCategoryFormConfig,
  patchOnCategoryChange,
  slugifyMarketplace,
  type MarketplaceCategory,
  type MarketplaceFormState,
} from '@/lib/marketplace-product-admin';
import type { LocaleText } from '@/lib/locale-text';
import { cn } from '@/lib/utils';
import { Star, Link2, PackageCheck, Copy, Palette, Code2, Layers } from 'lucide-react';
import { toast } from 'sonner';

export type { MarketplaceFormState };

type Props = {
  form: MarketplaceFormState;
  onChange: (next: MarketplaceFormState) => void;
};

const CATEGORY_OPTIONS: {
  value: MarketplaceCategory;
  icon: typeof Palette;
  labelKey: 'catKit' | 'catTemplate' | 'catComponent';
}[] = [
  { value: 'kit', icon: Palette, labelKey: 'catKit' },
  { value: 'template', icon: Code2, labelKey: 'catTemplate' },
  { value: 'component', icon: Layers, labelKey: 'catComponent' },
];

function titlesFromForm(form: MarketplaceFormState): LocaleText {
  return { fr: form.titleFr, en: form.titleEn };
}

function descriptionsFromForm(form: MarketplaceFormState): LocaleText {
  return { fr: form.descriptionFr, en: form.descriptionEn };
}

function categoryI18nKey(category: MarketplaceCategory, field: string) {
  return `forms.marketplace.byCategory.${category}.${field}`;
}

export default function MarketplaceProductForm({ form, onChange }: Props) {
  const { t } = useAdminI18n();
  const cfg = getCategoryFormConfig(form.category);
  const priceLabel = formatPriceFromCents(form.priceCents, form.currency);
  const catHint = t(categoryI18nKey(form.category, 'hint'));
  const catIncluded = t(categoryI18nKey(form.category, 'included'));

  const patch = (partial: Partial<MarketplaceFormState>) => onChange({ ...form, ...partial });

  const setCategory = (next: MarketplaceCategory) => {
    onChange(patchOnCategoryChange(form, next));
  };

  return (
    <div className="grid gap-5">
      <BilingualFormHint />

      {/* Catégorie en premier — pilote le reste du formulaire */}
      <div className="space-y-3">
        <Label>{t('forms.marketplace.category')}</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {CATEGORY_OPTIONS.map(({ value, icon: Icon, labelKey }) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategory(value)}
              className={cn(
                'flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-colors',
                form.category === value
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/40'
                  : 'border-border/60 bg-muted/20 hover:border-primary/30'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5',
                  form.category === value ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <span className="text-sm font-semibold">{t(`forms.marketplace.${labelKey}`)}</span>
            </button>
          ))}
        </div>
        <div
          className={cn(
            'rounded-xl border px-4 py-3 text-sm leading-relaxed',
            form.category === 'kit' && 'border-blue-500/30 bg-blue-500/5',
            form.category === 'template' && 'border-emerald-500/30 bg-emerald-500/5',
            form.category === 'component' && 'border-orange-500/30 bg-orange-500/5'
          )}
        >
          <p className="text-foreground">{catHint}</p>
          <p className="mt-2 text-xs text-muted-foreground">{catIncluded}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mp-slug">
          {t('forms.marketplace.slug')} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="mp-slug"
          value={form.slug}
          onChange={(e) => patch({ slug: e.target.value })}
          placeholder={t(categoryI18nKey(form.category, 'slugPlaceholder'))}
          className="font-mono text-sm bg-secondary/30"
        />
        {form.titleFr && !form.slug ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => patch({ slug: slugifyMarketplace(form.titleFr) })}
          >
            {t('forms.marketplace.slugFromTitle')}
          </Button>
        ) : null}
      </div>

      <LocaleTextFieldGroup
        label={
          <>
            {t('forms.marketplace.title')} <span className="text-destructive">*</span>
          </>
        }
        value={titlesFromForm(form)}
        onChange={(v) => patch({ titleFr: v.fr, titleEn: v.en })}
        requiredFr
        inputIdPrefix="mp-title"
        placeholderFr={t(categoryI18nKey(form.category, 'titlePh'))}
        placeholderEn={t(categoryI18nKey(form.category, 'titlePhEn'))}
      />

      <LocaleTextFieldGroup
        label={t('forms.marketplace.description')}
        value={descriptionsFromForm(form)}
        onChange={(v) => patch({ descriptionFr: v.fr, descriptionEn: v.en })}
        multiline
        inputIdPrefix="mp-desc"
        placeholderFr={t(categoryI18nKey(form.category, 'descPh'))}
        placeholderEn={t(categoryI18nKey(form.category, 'descPhEn'))}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2 sm:col-span-1">
          <Label htmlFor="mp-price">{t('forms.marketplace.priceCents')}</Label>
          <Input
            id="mp-price"
            type="number"
            min={0}
            step={1}
            value={form.priceCents}
            onChange={(e) => patch({ priceCents: Number(e.target.value) || 0 })}
          />
          <p className="text-xs text-muted-foreground">
            {t('forms.marketplace.pricePreview', { price: priceLabel })}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="mp-currency">{t('forms.marketplace.currency')}</Label>
          <Input
            id="mp-currency"
            value={form.currency}
            onChange={(e) => patch({ currency: e.target.value.toUpperCase() })}
            placeholder="EUR"
            maxLength={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mp-order">{t('forms.marketplace.sortOrder')}</Label>
          <Input
            id="mp-order"
            type="number"
            min={0}
            value={form.sortOrder}
            onChange={(e) => patch({ sortOrder: Number(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-border/50 bg-muted/20 p-4">
        <Label className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-muted-foreground" />
          {t('forms.marketplace.ctaUrl')}
        </Label>
        <p className="text-xs text-muted-foreground">{t('forms.marketplace.ctaHelp')}</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={form.ctaUrl}
            onChange={(e) => patch({ ctaUrl: e.target.value })}
            placeholder="mailto:contact@…?subject=Marketplace%20…"
            className="font-mono text-xs bg-secondary/30"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() =>
              patch({
                ctaUrl: buildMarketplaceMailto(form.slug, form.titleFr || form.titleEn),
              })
            }
          >
            {t('forms.marketplace.ctaGenerate')}
          </Button>
        </div>
      </div>

      {cfg.showDelivery ? (
        <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <Label className="flex items-center gap-2 text-foreground">
            <PackageCheck className="h-4 w-4 text-amber-600" />
            {t('forms.marketplace.deliveryUrl')}
            {cfg.requireDelivery ? <span className="text-destructive">*</span> : null}
          </Label>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t(categoryI18nKey(form.category, 'deliveryHelp'))}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={form.deliveryUrl}
              onChange={(e) => patch({ deliveryUrl: e.target.value })}
              placeholder={t(categoryI18nKey(form.category, 'deliveryPlaceholder'))}
              className="font-mono text-xs bg-secondary/30"
              type="url"
              autoComplete="off"
            />
            {form.deliveryUrl.trim() ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 gap-1"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(form.deliveryUrl.trim());
                    toast.success(t('forms.marketplace.deliveryCopied'));
                  } catch {
                    toast.error(t('forms.shared.saveError'));
                  }
                }}
              >
                <Copy className="h-4 w-4" />
                {t('forms.marketplace.deliveryCopy')}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {cfg.showPreview ? (
        <div className="space-y-3 rounded-xl border border-border/50 bg-muted/20 p-4">
          <Label>{t('forms.marketplace.previewUrl')}</Label>
          <p className="text-xs text-muted-foreground">
            {t(categoryI18nKey(form.category, 'previewHelp'))}
          </p>
          <ImageUpload
            value={form.previewUrl}
            onChange={(previewUrl) => patch({ previewUrl })}
            path={`marketplace/${form.category}`}
            bucket="portfolio"
            successMessage={t('imageUpload.defaultSuccess')}
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/40 p-4">
        <div className="flex items-center gap-3">
          <Switch
            checked={form.published}
            onCheckedChange={(published) => patch({ published })}
          />
          <Label className="cursor-pointer">{t('forms.marketplace.published')}</Label>
        </div>
        {cfg.showFeatured ? (
          <div className="flex items-center gap-3">
            <Switch
              checked={form.isFeatured}
              onCheckedChange={(isFeatured) => patch({ isFeatured })}
            />
            <Label className="flex cursor-pointer items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              {t('forms.marketplace.featured')}
            </Label>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function emptyMarketplaceProduct(): MarketplaceFormState {
  return {
    slug: '',
    category: 'kit',
    titleFr: '',
    titleEn: '',
    descriptionFr: '',
    descriptionEn: '',
    priceCents: 14900,
    currency: 'EUR',
    previewUrl: '',
    ctaUrl: '',
    deliveryUrl: '',
    published: true,
    sortOrder: 0,
    isFeatured: false,
  };
}

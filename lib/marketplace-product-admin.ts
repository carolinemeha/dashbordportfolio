import type { MarketplaceProduct } from '@/lib/vitrine-cms';

export type MarketplaceCategory = MarketplaceProduct['category'];

export type MarketplaceFormState = Omit<MarketplaceProduct, 'id'>;

export type MarketplaceCategoryFormConfig = {
  showDelivery: boolean;
  showPreview: boolean;
  showFeatured: boolean;
  requireDelivery: boolean;
  suggestPriceCents: number;
  slugExample: string;
};

export const MARKETPLACE_CATEGORY_FORM: Record<
  MarketplaceCategory,
  MarketplaceCategoryFormConfig
> = {
  kit: {
    showDelivery: true,
    showPreview: true,
    showFeatured: true,
    requireDelivery: true,
    suggestPriceCents: 14900,
    slugExample: 'glass-ui-kit-premium',
  },
  template: {
    showDelivery: true,
    showPreview: true,
    showFeatured: false,
    requireDelivery: true,
    suggestPriceCents: 24900,
    slugExample: 'hub-starter-next',
  },
  component: {
    showDelivery: true,
    showPreview: true,
    showFeatured: false,
    requireDelivery: false,
    suggestPriceCents: 4900,
    slugExample: 'smart-cursor-add-on',
  },
};

export function getCategoryFormConfig(
  category: MarketplaceCategory
): MarketplaceCategoryFormConfig {
  return MARKETPLACE_CATEGORY_FORM[category] ?? MARKETPLACE_CATEGORY_FORM.kit;
}

/** Ajuste prix suggéré et badge « populaire » quand on change de catégorie. */
export function patchOnCategoryChange(
  current: MarketplaceFormState,
  nextCategory: MarketplaceCategory
): MarketplaceFormState {
  const cfg = getCategoryFormConfig(nextCategory);
  return {
    ...current,
    category: nextCategory,
    priceCents: current.priceCents === 0 ? cfg.suggestPriceCents : current.priceCents,
    isFeatured: cfg.showFeatured ? current.isFeatured : false,
  };
}

export function slugifyMarketplace(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getMarketplaceContactEmail() {
  return (
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTACT_EMAIL?.trim() ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
    'contact@carolinemeha.com'
  );
}

export function buildMarketplaceMailto(slug: string, title: string) {
  const email = getMarketplaceContactEmail();
  const subject = encodeURIComponent(`Marketplace — ${title.trim() || slug.trim() || 'produit'}`);
  return `mailto:${email}?subject=${subject}`;
}

/** Valeurs prêtes pour Supabase (title_en NOT NULL, etc.). */
export function normalizeMarketplaceProduct(
  p: Omit<MarketplaceProduct, 'id'> | Partial<MarketplaceProduct>
): Omit<MarketplaceProduct, 'id'> {
  const titleFr = String(p.titleFr ?? '').trim();
  const titleEn = String(p.titleEn ?? '').trim() || titleFr;
  const slug = slugifyMarketplace(String(p.slug ?? '')) || slugifyMarketplace(titleFr);
  const cat = String(p.category ?? 'kit');
  const category =
    cat === 'template' || cat === 'component' ? cat : ('kit' as MarketplaceProduct['category']);

  return {
    slug,
    category,
    titleFr,
    titleEn,
    descriptionFr: String(p.descriptionFr ?? '').trim(),
    descriptionEn: String(p.descriptionEn ?? '').trim(),
    priceCents: Math.max(0, Math.round(Number(p.priceCents) || 0)),
    currency: (String(p.currency ?? 'EUR').trim() || 'EUR').toUpperCase(),
    previewUrl: String(p.previewUrl ?? '').trim(),
    ctaUrl: String(p.ctaUrl ?? '').trim(),
    deliveryUrl: String(p.deliveryUrl ?? '').trim(),
    published: p.published !== false,
    sortOrder: Math.max(0, Math.round(Number(p.sortOrder) || 0)),
    isFeatured: Boolean(p.isFeatured),
  };
}

export function formatPriceFromCents(cents: number, currency = 'EUR') {
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

import { adminRpc } from './admin-rpc';
import { runAdminDataOp } from './admin-data-ops';

const IS_BROWSER = typeof window !== 'undefined';

async function adminOp<T>(op: string, args: unknown, mapFn: (raw: unknown) => T): Promise<T> {
  let raw: unknown;
  if (IS_BROWSER) {
    raw = await adminRpc<unknown>(op, args);
  } else {
    const { supabaseAdmin } = await import('./supabase-admin');
    raw = await runAdminDataOp(supabaseAdmin, op, args);
  }
  return mapFn(raw);
}

function log(op: string, err: unknown) {
  console.error(`[vitrineCms:${op}]`, err);
}

export type BlogPost = {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string;
  excerptFr: string;
  excerptEn: string;
  contentFr: string;
  contentEn: string;
  tags: string[];
  coverImage: string;
  published: boolean;
  publishedAt: string;
};

export type MarketplaceProduct = {
  id: string;
  slug: string;
  category: 'kit' | 'template' | 'component';
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  priceCents: number;
  currency: string;
  previewUrl: string;
  ctaUrl: string;
  published: boolean;
  sortOrder: number;
};

export type VitrineNotification = {
  id: string;
  type: string;
  titleFr: string;
  titleEn: string;
  bodyFr: string;
  bodyEn: string;
  link: string;
  published: boolean;
};

export type PlatformChangelog = {
  id: string;
  version: string;
  releasedAt: string;
  tagFr: string;
  tagEn: string;
  itemsFr: string[];
  itemsEn: string[];
  published: boolean;
  sortOrder: number;
};

export type PlatformRoadmapItem = {
  id: string;
  slug: string;
  status: 'done' | 'in_progress' | 'planned' | 'exploring';
  quarterFr: string;
  quarterEn: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  published: boolean;
  sortOrder: number;
};

export type PlatformAvailability = {
  status: 'available' | 'busy' | 'on_mission';
  responseMinutes: number;
  timezone: string;
  cityFr: string;
  cityEn: string;
  workStartHour: number;
  workEndHour: number;
  workDays: number[];
};

function mapBlogRow(row: Record<string, unknown>): BlogPost {
  return {
    id: String(row.id ?? ''),
    slug: String(row.slug ?? ''),
    titleFr: String(row.title_fr ?? ''),
    titleEn: String(row.title_en ?? ''),
    excerptFr: String(row.excerpt_fr ?? ''),
    excerptEn: String(row.excerpt_en ?? ''),
    contentFr: String(row.content_fr ?? ''),
    contentEn: String(row.content_en ?? ''),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    coverImage: row.cover_image != null ? String(row.cover_image) : '',
    published: Boolean(row.published ?? true),
    publishedAt: row.published_at != null ? String(row.published_at) : '',
  };
}

function blogToPayload(p: Partial<BlogPost>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (p.slug !== undefined) out.slug = p.slug.trim();
  if (p.titleFr !== undefined) out.title_fr = p.titleFr.trim();
  if (p.titleEn !== undefined) out.title_en = p.titleEn.trim();
  if (p.excerptFr !== undefined) out.excerpt_fr = p.excerptFr.trim();
  if (p.excerptEn !== undefined) out.excerpt_en = p.excerptEn.trim();
  if (p.contentFr !== undefined) out.content_fr = p.contentFr;
  if (p.contentEn !== undefined) out.content_en = p.contentEn;
  if (p.tags !== undefined) out.tags = p.tags;
  if (p.coverImage !== undefined) out.cover_image = p.coverImage.trim() || null;
  if (p.published !== undefined) out.published = p.published;
  if (p.publishedAt !== undefined) out.published_at = p.publishedAt || new Date().toISOString();
  return out;
}

function mapMarketplaceRow(row: Record<string, unknown>): MarketplaceProduct {
  const cat = String(row.category ?? 'kit');
  const category =
    cat === 'template' || cat === 'component' ? cat : 'kit';
  return {
    id: String(row.id ?? ''),
    slug: String(row.slug ?? ''),
    category,
    titleFr: String(row.title_fr ?? ''),
    titleEn: String(row.title_en ?? ''),
    descriptionFr: String(row.description_fr ?? ''),
    descriptionEn: String(row.description_en ?? ''),
    priceCents: Number(row.price_cents) || 0,
    currency: String(row.currency ?? 'EUR'),
    previewUrl: row.preview_url != null ? String(row.preview_url) : '',
    ctaUrl: row.cta_url != null ? String(row.cta_url) : '',
    published: Boolean(row.published ?? true),
    sortOrder: Number(row.sort_order) || 0,
  };
}

function marketplaceToPayload(p: Partial<MarketplaceProduct>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (p.slug !== undefined) out.slug = p.slug.trim();
  if (p.category !== undefined) out.category = p.category;
  if (p.titleFr !== undefined) out.title_fr = p.titleFr.trim();
  if (p.titleEn !== undefined) out.title_en = p.titleEn.trim();
  if (p.descriptionFr !== undefined) out.description_fr = p.descriptionFr.trim();
  if (p.descriptionEn !== undefined) out.description_en = p.descriptionEn.trim();
  if (p.priceCents !== undefined) out.price_cents = p.priceCents;
  if (p.currency !== undefined) out.currency = p.currency.trim() || 'EUR';
  if (p.previewUrl !== undefined) out.preview_url = p.previewUrl.trim() || null;
  if (p.ctaUrl !== undefined) out.cta_url = p.ctaUrl.trim() || null;
  if (p.published !== undefined) out.published = p.published;
  if (p.sortOrder !== undefined) out.sort_order = p.sortOrder;
  return out;
}

function mapNotificationRow(row: Record<string, unknown>): VitrineNotification {
  return {
    id: String(row.id ?? ''),
    type: String(row.type ?? 'info'),
    titleFr: String(row.title_fr ?? ''),
    titleEn: String(row.title_en ?? ''),
    bodyFr: String(row.body_fr ?? ''),
    bodyEn: String(row.body_en ?? ''),
    link: row.link != null ? String(row.link) : '',
    published: Boolean(row.published ?? true),
  };
}

function notificationToPayload(n: Partial<VitrineNotification>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (n.type !== undefined) out.type = n.type.trim() || 'info';
  if (n.titleFr !== undefined) out.title_fr = n.titleFr.trim();
  if (n.titleEn !== undefined) out.title_en = n.titleEn.trim();
  if (n.bodyFr !== undefined) out.body_fr = n.bodyFr.trim();
  if (n.bodyEn !== undefined) out.body_en = n.bodyEn.trim();
  if (n.link !== undefined) out.link = n.link.trim() || null;
  if (n.published !== undefined) out.published = n.published;
  return out;
}

function parseItemsJson(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((x) => String(x ?? '').trim()).filter(Boolean);
}

function mapChangelogRow(row: Record<string, unknown>): PlatformChangelog {
  return {
    id: String(row.id ?? ''),
    version: String(row.version ?? ''),
    releasedAt: row.released_at != null ? String(row.released_at).slice(0, 10) : '',
    tagFr: String(row.tag_fr ?? ''),
    tagEn: String(row.tag_en ?? ''),
    itemsFr: parseItemsJson(row.items_fr),
    itemsEn: parseItemsJson(row.items_en),
    published: Boolean(row.published ?? true),
    sortOrder: Number(row.sort_order) || 0,
  };
}

function changelogToPayload(c: Partial<PlatformChangelog>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (c.version !== undefined) out.version = c.version.trim();
  if (c.releasedAt !== undefined) out.released_at = c.releasedAt || new Date().toISOString().slice(0, 10);
  if (c.tagFr !== undefined) out.tag_fr = c.tagFr.trim();
  if (c.tagEn !== undefined) out.tag_en = c.tagEn.trim();
  if (c.itemsFr !== undefined) out.items_fr = c.itemsFr;
  if (c.itemsEn !== undefined) out.items_en = c.itemsEn;
  if (c.published !== undefined) out.published = c.published;
  if (c.sortOrder !== undefined) out.sort_order = c.sortOrder;
  return out;
}

function mapRoadmapRow(row: Record<string, unknown>): PlatformRoadmapItem {
  const st = String(row.status ?? 'planned');
  const status =
    st === 'done' || st === 'in_progress' || st === 'exploring' ? st : 'planned';
  return {
    id: String(row.id ?? ''),
    slug: String(row.slug ?? ''),
    status,
    quarterFr: String(row.quarter_fr ?? ''),
    quarterEn: String(row.quarter_en ?? ''),
    titleFr: String(row.title_fr ?? ''),
    titleEn: String(row.title_en ?? ''),
    descriptionFr: String(row.description_fr ?? ''),
    descriptionEn: String(row.description_en ?? ''),
    published: Boolean(row.published ?? true),
    sortOrder: Number(row.sort_order) || 0,
  };
}

function roadmapToPayload(r: Partial<PlatformRoadmapItem>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (r.slug !== undefined) out.slug = r.slug.trim();
  if (r.status !== undefined) out.status = r.status;
  if (r.quarterFr !== undefined) out.quarter_fr = r.quarterFr.trim();
  if (r.quarterEn !== undefined) out.quarter_en = r.quarterEn.trim();
  if (r.titleFr !== undefined) out.title_fr = r.titleFr.trim();
  if (r.titleEn !== undefined) out.title_en = r.titleEn.trim();
  if (r.descriptionFr !== undefined) out.description_fr = r.descriptionFr.trim();
  if (r.descriptionEn !== undefined) out.description_en = r.descriptionEn.trim();
  if (r.published !== undefined) out.published = r.published;
  if (r.sortOrder !== undefined) out.sort_order = r.sortOrder;
  return out;
}

function mapAvailabilityRow(row: Record<string, unknown>): PlatformAvailability {
  const days = Array.isArray(row.work_days)
    ? (row.work_days as number[]).filter((d) => typeof d === 'number')
    : [1, 2, 3, 4, 5];
  const st = String(row.status ?? 'available');
  const status =
    st === 'busy' || st === 'on_mission' ? st : 'available';
  return {
    status,
    responseMinutes: Number(row.response_minutes) || 45,
    timezone: String(row.timezone ?? 'Africa/Porto-Novo'),
    cityFr: String(row.city_fr ?? ''),
    cityEn: String(row.city_en ?? ''),
    workStartHour: Number(row.work_start_hour) || 9,
    workEndHour: Number(row.work_end_hour) || 18,
    workDays: days,
  };
}

export const vitrineCmsService = {
  async getBlogPosts(): Promise<BlogPost[]> {
    try {
      return await adminOp('blog_posts.list', {}, (raw) =>
        ((raw as Record<string, unknown>[]) ?? []).map(mapBlogRow)
      );
    } catch (e) {
      log('getBlogPosts', e);
      return [];
    }
  },
  async createBlogPost(post: Omit<BlogPost, 'id'>): Promise<BlogPost | null> {
    try {
      return await adminOp('blog_posts.create', { payload: blogToPayload(post) }, (raw) =>
        raw ? mapBlogRow(raw as Record<string, unknown>) : null
      );
    } catch (e) {
      log('createBlogPost', e);
      return null;
    }
  },
  async updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
    try {
      const payload = blogToPayload(updates);
      if (!Object.keys(payload).length) return null;
      return await adminOp('blog_posts.update', { id, payload }, (raw) =>
        raw ? mapBlogRow(raw as Record<string, unknown>) : null
      );
    } catch (e) {
      log('updateBlogPost', e);
      return null;
    }
  },
  async deleteBlogPost(id: string): Promise<boolean> {
    try {
      return await adminOp('blog_posts.delete', { id }, (raw) => Boolean(raw));
    } catch {
      return false;
    }
  },

  async getMarketplaceProducts(): Promise<MarketplaceProduct[]> {
    try {
      return await adminOp('marketplace_products.list', {}, (raw) =>
        ((raw as Record<string, unknown>[]) ?? []).map(mapMarketplaceRow)
      );
    } catch (e) {
      log('getMarketplaceProducts', e);
      return [];
    }
  },
  async createMarketplaceProduct(
    product: Omit<MarketplaceProduct, 'id'>
  ): Promise<MarketplaceProduct | null> {
    try {
      return await adminOp(
        'marketplace_products.create',
        { payload: marketplaceToPayload(product) },
        (raw) => (raw ? mapMarketplaceRow(raw as Record<string, unknown>) : null)
      );
    } catch (e) {
      log('createMarketplaceProduct', e);
      return null;
    }
  },
  async updateMarketplaceProduct(
    id: string,
    updates: Partial<MarketplaceProduct>
  ): Promise<MarketplaceProduct | null> {
    try {
      const payload = marketplaceToPayload(updates);
      if (!Object.keys(payload).length) return null;
      return await adminOp('marketplace_products.update', { id, payload }, (raw) =>
        raw ? mapMarketplaceRow(raw as Record<string, unknown>) : null
      );
    } catch (e) {
      log('updateMarketplaceProduct', e);
      return null;
    }
  },
  async deleteMarketplaceProduct(id: string): Promise<boolean> {
    try {
      return await adminOp('marketplace_products.delete', { id }, (raw) => Boolean(raw));
    } catch {
      return false;
    }
  },

  async getNotifications(): Promise<VitrineNotification[]> {
    try {
      return await adminOp('realtime_notifications.list', {}, (raw) =>
        ((raw as Record<string, unknown>[]) ?? []).map(mapNotificationRow)
      );
    } catch (e) {
      log('getNotifications', e);
      return [];
    }
  },
  async createNotification(
    n: Omit<VitrineNotification, 'id'>
  ): Promise<VitrineNotification | null> {
    try {
      return await adminOp(
        'realtime_notifications.create',
        { payload: notificationToPayload(n) },
        (raw) => (raw ? mapNotificationRow(raw as Record<string, unknown>) : null)
      );
    } catch (e) {
      log('createNotification', e);
      return null;
    }
  },
  async deleteNotification(id: string): Promise<boolean> {
    try {
      return await adminOp('realtime_notifications.delete', { id }, (raw) => Boolean(raw));
    } catch {
      return false;
    }
  },

  async getChangelog(): Promise<PlatformChangelog[]> {
    try {
      return await adminOp('platform_changelog.list', {}, (raw) =>
        ((raw as Record<string, unknown>[]) ?? []).map(mapChangelogRow)
      );
    } catch (e) {
      log('getChangelog', e);
      return [];
    }
  },
  async createChangelog(
    c: Omit<PlatformChangelog, 'id'>
  ): Promise<PlatformChangelog | null> {
    try {
      return await adminOp(
        'platform_changelog.create',
        { payload: changelogToPayload(c) },
        (raw) => (raw ? mapChangelogRow(raw as Record<string, unknown>) : null)
      );
    } catch (e) {
      log('createChangelog', e);
      return null;
    }
  },
  async deleteChangelog(id: string): Promise<boolean> {
    try {
      return await adminOp('platform_changelog.delete', { id }, (raw) => Boolean(raw));
    } catch {
      return false;
    }
  },

  async getRoadmap(): Promise<PlatformRoadmapItem[]> {
    try {
      return await adminOp('platform_roadmap.list', {}, (raw) =>
        ((raw as Record<string, unknown>[]) ?? []).map(mapRoadmapRow)
      );
    } catch (e) {
      log('getRoadmap', e);
      return [];
    }
  },
  async createRoadmapItem(
    r: Omit<PlatformRoadmapItem, 'id'>
  ): Promise<PlatformRoadmapItem | null> {
    try {
      return await adminOp(
        'platform_roadmap.create',
        { payload: roadmapToPayload(r) },
        (raw) => (raw ? mapRoadmapRow(raw as Record<string, unknown>) : null)
      );
    } catch (e) {
      log('createRoadmapItem', e);
      return null;
    }
  },
  async deleteRoadmapItem(id: string): Promise<boolean> {
    try {
      return await adminOp('platform_roadmap.delete', { id }, (raw) => Boolean(raw));
    } catch {
      return false;
    }
  },

  async getAvailability(): Promise<PlatformAvailability | null> {
    try {
      return await adminOp('platform_availability.get', {}, (raw) =>
        raw ? mapAvailabilityRow(raw as Record<string, unknown>) : null
      );
    } catch (e) {
      log('getAvailability', e);
      return null;
    }
  },
  async saveAvailability(a: PlatformAvailability): Promise<boolean> {
    try {
      return await adminOp(
        'platform_availability.upsert',
        {
          payload: {
            id: 1,
            status: a.status,
            response_minutes: a.responseMinutes,
            timezone: a.timezone,
            city_fr: a.cityFr,
            city_en: a.cityEn,
            work_start_hour: a.workStartHour,
            work_end_hour: a.workEndHour,
            work_days: a.workDays,
            updated_at: new Date().toISOString(),
          },
        },
        (raw) => Boolean(raw)
      );
    } catch (e) {
      log('saveAvailability', e);
      return false;
    }
  },
};

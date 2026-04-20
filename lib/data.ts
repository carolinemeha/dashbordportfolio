import { supabase } from './supabase';

function logSupabase(op: string, err: unknown) {
  console.error(`[dataService:${op}]`, err);
}
import {
  normalizeAdminPreferences,
  type AdminPreferencesV1,
} from './admin-preferences';
import type { LocaleText } from './locale-text';
import {
  fromDbJson,
  localeTextArrayFromDb,
  localeTextArrayToDb,
  primaryForLegacyColumn,
  toDbJson,
} from './locale-text';

/** Ligne unique des préférences console (à créer en base si absente). */
const ADMIN_CONSOLE_SETTINGS_ID = '00000000-0000-0000-0000-000000000002';

function preferencesExtraFromPrefs(prefs: AdminPreferencesV1): Record<string, unknown> {
  return {
    density: prefs.density,
    headerBanner: prefs.headerBanner,
    showRouteCrumb: prefs.showRouteCrumb,
    headerMinimal: prefs.headerMinimal,
    dashboardDateStyle: prefs.dashboardDateStyle,
    dashboardAutoRefresh: prefs.dashboardAutoRefresh,
    locale: prefs.locale,
  };
}

function parsePreferencesExtra(raw: unknown): Partial<AdminPreferencesV1> {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const e = raw as Record<string, unknown>;
  const out: Partial<AdminPreferencesV1> = {};
  if (e.density === 'compact' || e.density === 'comfortable')
    out.density = e.density;
  if (typeof e.headerBanner === 'string') out.headerBanner = e.headerBanner;
  if (typeof e.showRouteCrumb === 'boolean') out.showRouteCrumb = e.showRouteCrumb;
  if (typeof e.headerMinimal === 'boolean') out.headerMinimal = e.headerMinimal;
  if (e.dashboardDateStyle === 'absolute' || e.dashboardDateStyle === 'relative')
    out.dashboardDateStyle = e.dashboardDateStyle;
  if (typeof e.dashboardAutoRefresh === 'boolean')
    out.dashboardAutoRefresh = e.dashboardAutoRefresh;
  if (e.locale === 'fr' || e.locale === 'en') out.locale = e.locale;
  return out;
}

// Mock data store for demo purposes
// In production, replace with actual database operations

export interface Project {
  id: string;
  titleI18n: LocaleText;
  descriptionI18n: LocaleText;
  image: string;
  demo?: string;
  github?: string;
  technologies: string[];
  /** Slugs alignés sur la page Work : frontend | fullstack | ui-ux | design | logo */
  category: string;
  /** completed | in-progress | planned — mêmes valeurs que le filtre du front */
  status: string;
  date: string;
  featured?: boolean;
}

function dashActivityText(
  json: unknown,
  legacy: string | null | undefined
): string {
  return primaryForLegacyColumn(fromDbJson(json, legacy), 'fr');
}

function mapProjectRow(row: Record<string, unknown>): Project {
  const titleI18n = fromDbJson(row.title_i18n, row.title as string | null);
  const descriptionI18n = fromDbJson(
    row.description_i18n,
    row.description as string | null
  );
  return {
    id: String(row.id ?? ''),
    titleI18n,
    descriptionI18n,
    image: String(row.image ?? ''),
    demo:
      row.demo != null
        ? String(row.demo)
        : row.demo_url != null
          ? String(row.demo_url)
          : undefined,
    github:
      row.github != null
        ? String(row.github)
        : row.github_url != null
          ? String(row.github_url)
          : undefined,
    technologies: Array.isArray(row.technologies)
      ? (row.technologies as string[])
      : [],
    category: String(row.category ?? 'fullstack'),
    status: String(row.status ?? 'completed'),
    date: String(row.date ?? ''),
    featured: Boolean(row.featured),
  };
}

export function projectInsertPayload(project: Omit<Project, 'id'>) {
  const demo = project.demo?.trim() || null;
  const github = project.github?.trim() || null;
  return {
    title: primaryForLegacyColumn(project.titleI18n, 'fr'),
    description: primaryForLegacyColumn(project.descriptionI18n, 'fr'),
    title_i18n: toDbJson(project.titleI18n),
    description_i18n: toDbJson(project.descriptionI18n),
    image: project.image?.trim() || null,
    demo_url: demo,
    github_url: github,
    technologies: project.technologies,
    category: project.category,
    status: project.status,
    date: project.date,
    featured: project.featured ?? false,
  };
}

function projectUpdatePayload(updates: Partial<Project>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (updates.titleI18n !== undefined) {
    out.title_i18n = toDbJson(updates.titleI18n);
    out.title = primaryForLegacyColumn(updates.titleI18n, 'fr');
  }
  if (updates.descriptionI18n !== undefined) {
    out.description_i18n = toDbJson(updates.descriptionI18n);
    out.description = primaryForLegacyColumn(updates.descriptionI18n, 'fr');
  }
  if (updates.image !== undefined) out.image = updates.image?.trim() || null;
  if (updates.demo !== undefined) out.demo_url = updates.demo?.trim() || null;
  if (updates.github !== undefined) out.github_url = updates.github?.trim() || null;
  if (updates.technologies !== undefined) out.technologies = updates.technologies;
  if (updates.category !== undefined) out.category = updates.category;
  if (updates.status !== undefined) out.status = updates.status;
  if (updates.date !== undefined) out.date = updates.date;
  if (updates.featured !== undefined) out.featured = updates.featured;
  return out;
}

export interface Experience {
  id: string;
  companyI18n: LocaleText;
  positionI18n: LocaleText;
  locationI18n: LocaleText;
  durationI18n: LocaleText;
  achievementsI18n: LocaleText[];
  skills: string[];
}

function mapExperienceRow(row: Record<string, unknown>): Experience {
  return {
    id: String(row.id ?? ''),
    companyI18n: fromDbJson(row.company_i18n, row.company as string | null),
    positionI18n: fromDbJson(row.position_i18n, row.position as string | null),
    locationI18n: fromDbJson(row.location_i18n, row.location as string | null),
    durationI18n: fromDbJson(row.duration_i18n, row.duration as string | null),
    achievementsI18n: localeTextArrayFromDb(
      row.achievements_i18n,
      row.achievements as string[] | null
    ),
    skills: Array.isArray(row.skills) ? (row.skills as string[]) : [],
  };
}

export function experienceToDbPayload(e: Partial<Experience>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (e.companyI18n !== undefined) {
    out.company_i18n = toDbJson(e.companyI18n);
    out.company = primaryForLegacyColumn(e.companyI18n, 'fr');
  }
  if (e.positionI18n !== undefined) {
    out.position_i18n = toDbJson(e.positionI18n);
    out.position = primaryForLegacyColumn(e.positionI18n, 'fr');
  }
  if (e.locationI18n !== undefined) {
    out.location_i18n = toDbJson(e.locationI18n);
    out.location = primaryForLegacyColumn(e.locationI18n, 'fr') || null;
  }
  if (e.durationI18n !== undefined) {
    out.duration_i18n = toDbJson(e.durationI18n);
    out.duration = primaryForLegacyColumn(e.durationI18n, 'fr');
  }
  if (e.achievementsI18n !== undefined) {
    out.achievements_i18n = localeTextArrayToDb(e.achievementsI18n);
    out.achievements = e.achievementsI18n.map((a) => primaryForLegacyColumn(a, 'fr'));
  }
  if (e.skills !== undefined) out.skills = e.skills;
  return out;
}

export interface Skill {
  id: string;
  nameI18n: LocaleText;
  /** Conservé en base pour compatibilité ; plus affiché dans l’admin. */
  level: number;
  category: 'Frontend' | 'Backend' | 'Mobile' | 'Design' | 'Commerce' | 'Autres';
  /** Nom d’export react-icons (ex. FaHtml5, SiNextdotjs) — voir `lib/skill-icons.tsx`. */
  iconName?: string;
}

function mapSkillFromRow(row: Record<string, unknown>): Skill {
  const cat = row.category as string | undefined;
  const valid: Skill['category'][] = [
    'Frontend',
    'Backend',
    'Mobile',
    'Design',
    'Commerce',
    'Autres',
  ];
  return {
    id: String(row.id),
    nameI18n: fromDbJson(row.name_i18n, row.name as string | null),
    level: typeof row.level === 'number' ? row.level : 0,
    category: (cat && valid.includes(cat as Skill['category'])
      ? cat
      : 'Frontend') as Skill['category'],
    iconName:
      typeof row.icon_name === 'string' && row.icon_name ? row.icon_name : '',
  };
}

export function skillToDbPayload(skill: Partial<Skill>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (skill.nameI18n !== undefined) {
    out.name_i18n = toDbJson(skill.nameI18n);
    out.name = primaryForLegacyColumn(skill.nameI18n, 'fr');
  }
  if (skill.level !== undefined) out.level = skill.level;
  if (skill.category !== undefined) out.category = skill.category;
  if (skill.iconName !== undefined) out.icon_name = skill.iconName?.trim() || null;
  return out;
}

export interface Service {
  id: string;
  titleI18n: LocaleText;
  descriptionI18n: LocaleText;
  icon?: string;
  iconName?: string;
  category: string;
  featuresI18n: LocaleText[];
  technologies?: Array<{icon?: string; name: string}>;
  pricing?: {
    basic?: string;
    standard?: string;
    premium?: string;
  };
}

export interface Certification {
  id: string;
  titleI18n: LocaleText;
  issuerI18n: LocaleText;
  date: string;
  credential?: string;
}

export interface AboutInfo {
  nameI18n: LocaleText;
  titleI18n: LocaleText;
  bioI18n: LocaleText;
  avatar: string;
  rolesI18n: LocaleText[];
  locationI18n: LocaleText;
  timezoneI18n: LocaleText;
  availableStatusI18n: LocaleText;
  email: string;
  phone: string;
  experienceI18n: LocaleText;
  nationalityI18n: LocaleText;
  shopUrl?: string;
  freelanceStatusI18n: LocaleText;
  languagesI18n: LocaleText;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
  cvUrl?: string;
  heroBadgeI18n: LocaleText;
  homeAvailableTitleI18n: LocaleText;
  homeAvailableSubtitleI18n: LocaleText;
  homeStatYears?: number;
  homeStatProjects?: number;
  homeStatClients?: number;
  homeStatSatisfaction?: number;
  whatsappUrl?: string;
  telegramUrl?: string;
}

export interface Education {
  id: string;
  institutionI18n: LocaleText;
  degreeI18n: LocaleText;
  durationI18n: LocaleText;
  coursesI18n: LocaleText[];
}

export interface Testimonial {
  id: string;
  nameI18n: LocaleText;
  roleI18n: LocaleText;
  contentI18n: LocaleText;
  avatar: string;
  rating?: number;
  date?: string;
}

/**
 * Évite les 404 : un src comme "caleb.jpg" est résolu en /admin/caleb.jpg depuis l’admin.
 * On ne garde que les URLs absolues, data: ou chemins absolus sous / (hors anciens /assets/testi/).
 */
export function normalizeTestimonialAvatarUrl(avatar: string | null | undefined): string {
  if (avatar == null) return '';
  const t = String(avatar).trim();
  if (!t) return '';
  const lower = t.toLowerCase();
  if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('//')) return t;
  if (lower.startsWith('data:')) return t;
  if (t.startsWith('/')) {
    if (/^\/assets\/testi\//i.test(t)) return '';
    return t;
  }
  return '';
}

export interface ContactMessage {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  service?: string;
  budget?: string;
  locale?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
}

function mapContactRow(row: Record<string, unknown>): ContactMessage {
  const st = row.status;
  const status: ContactMessage['status'] =
    st === 'read' || st === 'replied' ? st : 'new';
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    firstName:
      row.first_name != null && row.first_name !== ''
        ? String(row.first_name)
        : undefined,
    lastName:
      row.last_name != null && row.last_name !== ''
        ? String(row.last_name)
        : undefined,
    email: String(row.email ?? ''),
    phone:
      row.phone != null && row.phone !== '' ? String(row.phone) : undefined,
    service:
      row.service != null && row.service !== ''
        ? String(row.service)
        : undefined,
    budget:
      row.budget != null && row.budget !== '' ? String(row.budget) : undefined,
    locale:
      row.locale != null && row.locale !== '' ? String(row.locale) : undefined,
    subject: String(row.subject ?? ''),
    message: String(row.message ?? ''),
    status,
    createdAt: String(row.created_at ?? ''),
  };
}

function mapEducationRow(row: Record<string, unknown>): Education {
  return {
    id: String(row.id ?? ''),
    institutionI18n: fromDbJson(
      row.institution_i18n,
      row.institution as string | null
    ),
    degreeI18n: fromDbJson(row.degree_i18n, row.degree as string | null),
    durationI18n: fromDbJson(row.duration_i18n, row.duration as string | null),
    coursesI18n: localeTextArrayFromDb(
      row.courses_i18n,
      row.courses as string[] | null
    ),
  };
}

export function educationToDbPayload(e: Partial<Education>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (e.institutionI18n !== undefined) {
    out.institution_i18n = toDbJson(e.institutionI18n);
    out.institution = primaryForLegacyColumn(e.institutionI18n, 'fr');
  }
  if (e.degreeI18n !== undefined) {
    out.degree_i18n = toDbJson(e.degreeI18n);
    out.degree = primaryForLegacyColumn(e.degreeI18n, 'fr');
  }
  if (e.durationI18n !== undefined) {
    out.duration_i18n = toDbJson(e.durationI18n);
    out.duration = primaryForLegacyColumn(e.durationI18n, 'fr');
  }
  if (e.coursesI18n !== undefined) {
    out.courses_i18n = localeTextArrayToDb(e.coursesI18n);
    out.courses = e.coursesI18n.map((c) => primaryForLegacyColumn(c, 'fr'));
  }
  return out;
}

function mapTestimonialRow(row: Record<string, unknown>): Testimonial {
  return {
    id: String(row.id ?? ''),
    nameI18n: fromDbJson(row.name_i18n, row.name as string | null),
    roleI18n: fromDbJson(row.role_i18n, row.role as string | null),
    contentI18n: fromDbJson(row.content_i18n, row.content as string | null),
    avatar: normalizeTestimonialAvatarUrl(row.avatar as string | null),
    rating:
      typeof row.rating === 'number' ? row.rating : undefined,
    date: row.date != null ? String(row.date) : undefined,
  };
}

export function testimonialToDbPayload(t: Partial<Testimonial>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (t.nameI18n !== undefined) {
    out.name_i18n = toDbJson(t.nameI18n);
    out.name = primaryForLegacyColumn(t.nameI18n, 'fr');
  }
  if (t.roleI18n !== undefined) {
    out.role_i18n = toDbJson(t.roleI18n);
    out.role = primaryForLegacyColumn(t.roleI18n, 'fr');
  }
  if (t.contentI18n !== undefined) {
    out.content_i18n = toDbJson(t.contentI18n);
    out.content = primaryForLegacyColumn(t.contentI18n, 'fr');
  }
  if (t.avatar !== undefined) out.avatar = t.avatar;
  if (t.rating !== undefined) out.rating = t.rating;
  if (t.date !== undefined) out.date = t.date;
  return out;
}

function mapCertificationRow(row: Record<string, unknown>): Certification {
  return {
    id: String(row.id ?? ''),
    titleI18n: fromDbJson(row.title_i18n, row.title as string | null),
    issuerI18n: fromDbJson(row.issuer_i18n, row.issuer as string | null),
    date: String(row.date ?? ''),
    credential:
      row.credential != null ? String(row.credential) : undefined,
  };
}

export function certificationToDbPayload(c: Partial<Certification>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (c.titleI18n !== undefined) {
    out.title_i18n = toDbJson(c.titleI18n);
    out.title = primaryForLegacyColumn(c.titleI18n, 'fr');
  }
  if (c.issuerI18n !== undefined) {
    out.issuer_i18n = toDbJson(c.issuerI18n);
    out.issuer = primaryForLegacyColumn(c.issuerI18n, 'fr');
  }
  if (c.date !== undefined) out.date = c.date;
  if (c.credential !== undefined) out.credential = c.credential;
  return out;
}

function mapServiceRow(row: Record<string, unknown>): Service {
  const technologiesRaw = row.technologies;
  const technologies = Array.isArray(technologiesRaw)
    ? (technologiesRaw as string[]).map((t: string) => {
        try {
          return JSON.parse(t);
        } catch {
          return { name: t };
        }
      })
    : [];
  return {
    id: String(row.id ?? ''),
    titleI18n: fromDbJson(row.title_i18n, row.title as string | null),
    descriptionI18n: fromDbJson(
      row.description_i18n,
      row.description as string | null
    ),
    iconName:
      typeof row.icon_name === 'string' && row.icon_name
        ? row.icon_name
        : undefined,
    category: String(row.category ?? ''),
    featuresI18n: localeTextArrayFromDb(
      row.features_i18n,
      row.features as string[] | null
    ),
    technologies,
    pricing:
      row.pricing != null && typeof row.pricing === 'object'
        ? (row.pricing as Service['pricing'])
        : undefined,
  };
}

export function serviceToDbPayload(s: Partial<Service>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (s.titleI18n !== undefined) {
    out.title_i18n = toDbJson(s.titleI18n);
    out.title = primaryForLegacyColumn(s.titleI18n, 'fr');
  }
  if (s.descriptionI18n !== undefined) {
    out.description_i18n = toDbJson(s.descriptionI18n);
    out.description = primaryForLegacyColumn(s.descriptionI18n, 'fr');
  }
  if (s.featuresI18n !== undefined) {
    out.features_i18n = localeTextArrayToDb(s.featuresI18n);
    out.features = s.featuresI18n.map((f) => primaryForLegacyColumn(f, 'fr'));
  }
  if (s.category !== undefined) out.category = s.category;
  if (s.iconName !== undefined) out.icon_name = s.iconName?.trim() || null;
  if (s.pricing !== undefined) out.pricing = s.pricing;
  if (s.technologies !== undefined) {
    out.technologies = s.technologies.map((t) =>
      typeof t === 'string' ? t : JSON.stringify(t)
    );
  }
  return out;
}

function mapAboutRowToInfo(data: Record<string, unknown>): AboutInfo {
  const rolesLegacy = Array.isArray(data.roles) ? (data.roles as string[]) : [];
  return {
    nameI18n: fromDbJson(data.name_i18n, data.name as string | null),
    titleI18n: fromDbJson(data.title_i18n, data.title as string | null),
    bioI18n: fromDbJson(data.bio_i18n, data.bio as string | null),
    avatar: String(data.avatar ?? ''),
    rolesI18n: localeTextArrayFromDb(data.roles_i18n, rolesLegacy),
    locationI18n: fromDbJson(data.location_i18n, data.location as string | null),
    timezoneI18n: fromDbJson(data.timezone_i18n, data.timezone as string | null),
    availableStatusI18n: fromDbJson(
      data.available_status_i18n,
      data.available_status as string | null
    ),
    email: String(data.email ?? ''),
    phone: String(data.phone ?? ''),
    experienceI18n: fromDbJson(
      data.experience_i18n,
      data.experience as string | null
    ),
    nationalityI18n: fromDbJson(
      data.nationality_i18n,
      data.nationality as string | null
    ),
    shopUrl: data.shop_url != null ? String(data.shop_url) : undefined,
    freelanceStatusI18n: fromDbJson(
      data.freelance_status_i18n,
      data.freelance_status as string | null
    ),
    languagesI18n: fromDbJson(
      data.languages_i18n,
      data.languages as string | null
    ),
    website: data.website != null ? String(data.website) : undefined,
    github: data.github != null ? String(data.github) : undefined,
    linkedin: data.linkedin != null ? String(data.linkedin) : undefined,
    twitter: data.twitter != null ? String(data.twitter) : undefined,
    youtube: data.youtube != null ? String(data.youtube) : undefined,
    cvUrl: data.cv_url != null ? String(data.cv_url) : undefined,
    heroBadgeI18n: fromDbJson(
      data.hero_badge_i18n,
      data.hero_badge as string | null
    ),
    homeAvailableTitleI18n: fromDbJson(
      data.home_available_title_i18n,
      data.home_available_title as string | null
    ),
    homeAvailableSubtitleI18n: fromDbJson(
      data.home_available_subtitle_i18n,
      data.home_available_subtitle as string | null
    ),
    homeStatYears:
      typeof data.home_stat_years === 'number' ? data.home_stat_years : undefined,
    homeStatProjects:
      typeof data.home_stat_projects === 'number'
        ? data.home_stat_projects
        : undefined,
    homeStatClients:
      typeof data.home_stat_clients === 'number'
        ? data.home_stat_clients
        : undefined,
    homeStatSatisfaction:
      typeof data.home_stat_satisfaction === 'number'
        ? data.home_stat_satisfaction
        : undefined,
    whatsappUrl: data.whatsapp_url != null ? String(data.whatsapp_url) : '',
    telegramUrl: data.telegram_url != null ? String(data.telegram_url) : '',
  };
}

export function aboutInfoToDbPayload(updates: Partial<AboutInfo>): Record<string, unknown> {
  const fieldMap: [keyof AboutInfo, string, string][] = [
    ['nameI18n', 'name_i18n', 'name'],
    ['titleI18n', 'title_i18n', 'title'],
    ['bioI18n', 'bio_i18n', 'bio'],
    ['locationI18n', 'location_i18n', 'location'],
    ['experienceI18n', 'experience_i18n', 'experience'],
    ['nationalityI18n', 'nationality_i18n', 'nationality'],
    ['freelanceStatusI18n', 'freelance_status_i18n', 'freelance_status'],
    ['languagesI18n', 'languages_i18n', 'languages'],
    ['availableStatusI18n', 'available_status_i18n', 'available_status'],
    ['timezoneI18n', 'timezone_i18n', 'timezone'],
    ['heroBadgeI18n', 'hero_badge_i18n', 'hero_badge'],
    ['homeAvailableTitleI18n', 'home_available_title_i18n', 'home_available_title'],
    [
      'homeAvailableSubtitleI18n',
      'home_available_subtitle_i18n',
      'home_available_subtitle',
    ],
  ];
  const out: Record<string, unknown> = {};
  for (const [key, jsonCol, legacyCol] of fieldMap) {
    const v = updates[key];
    if (v !== undefined && v !== null && typeof v === 'object' && 'fr' in v) {
      out[jsonCol] = toDbJson(v as LocaleText);
      out[legacyCol] = primaryForLegacyColumn(v as LocaleText, 'fr');
    }
  }
  if (updates.rolesI18n !== undefined) {
    out.roles_i18n = localeTextArrayToDb(updates.rolesI18n);
    out.roles = updates.rolesI18n.map((r) => primaryForLegacyColumn(r, 'fr'));
  }
  const passthrough: [keyof AboutInfo, string][] = [
    ['avatar', 'avatar'],
    ['email', 'email'],
    ['phone', 'phone'],
    ['website', 'website'],
    ['github', 'github'],
    ['linkedin', 'linkedin'],
    ['twitter', 'twitter'],
    ['youtube', 'youtube'],
    ['cvUrl', 'cv_url'],
    ['shopUrl', 'shop_url'],
    ['homeStatYears', 'home_stat_years'],
    ['homeStatProjects', 'home_stat_projects'],
    ['homeStatClients', 'home_stat_clients'],
    ['homeStatSatisfaction', 'home_stat_satisfaction'],
    ['whatsappUrl', 'whatsapp_url'],
    ['telegramUrl', 'telegram_url'],
  ];
  for (const [k, col] of passthrough) {
    if (updates[k] !== undefined) out[col] = updates[k];
  }
  return out;
}

export interface CVInfo {
  fileName: string;
  uploadDate: string;
  fileSize: string;
  url?: string;
}

export interface ActivityEntry {
  id: string;
  type: 'project' | 'skill' | 'message' | 'experience' | 'education' | 'testimonial' | 'service';
  /** Donnée brute ; le libellé de ligne est traduit côté UI selon `type`. */
  subtitle: string;
  date: string;
}

export interface DashboardStats {
  /** Vues enregistrées (toutes périodes) */
  totalViews: number;
  /** Vues sur les 7 derniers jours */
  viewsThisWeek: number;
  uniqueVisitors: number;
  uniqueVisitorsThisWeek: number;
  cvDownloads: number;
  cvDownloadsThisWeek: number;
  recentActivity: ActivityEntry[];
}

// Mock data
const rawProjects: Record<string, unknown>[] = [
  { id: '1', title: "Application mobile", description: "Maquette d'application mobile d'envoie de colis entre partenaires et clients.", image: "/assets/work/moc.png", category: "ui-ux", technologies: ["Figma"], demo: "", status: "in-progress", date: "2025-03", featured: true },
  { id: '2', title: "Application web", description: "Tableau de bord administratif complet pour la gestion des utilisateurs, des données et des statistiques.", image: "/assets/work/Admin1.png", category: "fullstack", technologies: ["Laravel", "Bootstrap", "JavaScript", "PHP"], github: "", demo: "", status: "completed", date: "2023-06" },
  { id: '3', title: "Application web", description: "Plateforme web moderne pour la commande et la livraison de repas. Interface utilisateur intuitive avec système de panier et paiement en ligne.", image: "/assets/work/n1.png", category: "frontend", technologies: ["Next.js", "Tailwind.css"], github: "", demo: "", status: "completed", date: "2023-06" },
  { id: '4', title: "Authentification Firebase", description: "Système d'authentification sécurisé avec Firebase. Gestion des utilisateurs, connexion sociale et récupération de mot de passe.", image: "/assets/work/n.png", category: "fullstack", technologies: ["Next.js", "Tailwind.css", "Firebase"], github: "", demo: "", status: "completed", date: "2024-05" },
  { id: '5', title: "Interface d'authentification", description: "Design moderne d'une interface de connexion et d'inscription. Focus sur l'expérience utilisateur et l'accessibilité.", image: "/assets/work/f.png", category: "ui-ux", technologies: ["Figma"], demo: "", status: "completed", date: "2024-03" },
  { id: '6', title: "Portfolio Design", description: "Conception d'interfaces pour portfolio professionnel. Design épuré mettant en valeur les projets et compétences.", image: "/assets/work/a.png", category: "ui-ux", technologies: ["Adobe XD"], demo: "", status: "completed", date: "2024-03" },
  { id: '7', title: "Application web", description: "Application web d'envoie de colis entre partenaires et clients.", image: "/assets/work/kemaxan.png", category: "fullstack", technologies: ["Reactjs", "TailwindCss", "Nodejs", "Postgresql"], github: "", demo: "", status: "in-progress", date: "2025-03" },
  { id: '8', title: "Blog Design", description: "Conception d'interface pour un blog moderne. Mise en page optimisée pour la lecture et le partage de contenu.", image: "/assets/work/a1.png", category: "ui-ux", technologies: ["Adobe XD"], demo: "", status: "completed", date: "2024-02" },
  { id: '9', title: "Étiquette Chips Bananes", description: "Design d'étiquette pour produit alimentaire. Création d'une identité visuelle attractive et informative.", image: "/assets/work/s.png", category: "design", technologies: ["Photoshop"], status: "completed", date: "2024-05" },
  { id: '10', title: "Logo Style Delice", description: "Création d'identité visuelle pour une structure. Design de logo moderne et mémorable.", image: "/assets/work/l.png", category: "logo", technologies: ["Canva"], status: "completed", date: "2024-06" },
  { id: '11', title: "Affiche Chips Banane", description: "Design d'affiche publicitaire pour la vente de chips de banane. Mise en page attractive et informative.", image: "/assets/work/a3.png", category: "design", technologies: ["Photoshop"], status: "completed", date: "2024-05" },
  { id: '12', title: "Affiche publicitaire", description: "Affiche publicitaire de la canette beninoise.", image: "/assets/work/mockup.png", category: "design", technologies: ["Photoshop"], status: "completed", date: "2025-05" },
  { id: '13', title: "Pack Ravitaillement", description: "Design d'affiche pour pack de ravitaillement. Mise en valeur des produits et des offres.", image: "/assets/work/p.png", category: "design", technologies: ["Canva"], status: "completed", date: "2024-07" },
  { id: '14', title: "Prêt à Porter", description: "Design d'affiche pour collection de prêt à porter. Mise en scène élégante des vêtements.", image: "/assets/work/m.png", category: "design", technologies: ["Photoshop"], status: "completed", date: "2021-09" },
  { id: '15', title: "Affiche Publicitaire", description: "Création d'affiche publicitaire. Design impactant et message clair.", image: "/assets/work/b.png", category: "design", technologies: ["Canva"], status: "completed", date: "2025-03" },
  { id: '16', title: "Application web", description: "Application web d'envoie de colis entre partenaires et clients.", image: "/assets/work/kemaxan1.png", category: "fullstack", technologies: ["Reactjs", "TailwindCss", "Nodejs", "Postgresql"], github: "", demo: "", status: "in-progress", date: "2025-07" },
  { id: '17', title: "Application web", description: "Application web d'envoie de colis entre partenaires et clients.", image: "/assets/work/kemaxan2.png", category: "fullstack", technologies: ["Reactjs", "TailwindCss", "Nodejs", "Postgresql"], github: "", demo: "", status: "in-progress", date: "2025-07" },
  { id: '18', title: "Application web", description: "Site e-commerce multivendeur.", image: "/assets/work/ahi-market.png", category: "fullstack", technologies: ["NextJs", "TailwindCss", "Nodejs", "firebase"], github: "", demo: "https://ahi.market", status: "in-progress", date: "2025-07" },
  { id: '19', title: "Application web", description: "Design d'interface pour le systeme de marketing digital", image: "/assets/work/reseau-arbre-genealogique.png", category: "ui-ux", technologies: ["Figma"], github: "", demo: "", status: "completed", date: "2024-07" },
  { id: '20', title: "Application web", description: "Application web d'envoie de colis entre partenaires et clients.", image: "/assets/work/kemasan.png", category: "fullstack", technologies: ["Reactjs", "TailwindCss", "Nodejs", "Postgresql"], github: "", demo: "", status: "in-progress", date: "2025-07" },
  { id: '21', title: "Application web", description: "Site e-commerce multivendeur.", image: "/assets/work/ahi-mobile.png", category: "fullstack", technologies: ["NextJs", "TailwindCss", "Nodejs", "Firibase"], github: "", demo: "https://ahi.market", status: "in-progress", date: "2025-07" },
  { id: "22", title: "Africa Digital Bridge", description: "Plateforme web pour offre d'emploi et recrutement.", image: "/assets/work/digtalbridge.png", category: "fullstack", technologies: ["React", "vite", "supabase", "PostgreSQL", "TailwindCss"], github: "", demo: "https://africadigitalbridge.com/", status: "completed", date: "2026-02" },
  { id: "23", title: "Espace Snif", description: "Système d'Information Géographique des Services Financiers du Bénin.", image: "/assets/work/esnif.png", category: "frontend", technologies: ["Angular", "CSS", "HTML"], github: "", demo: "https://espacesnif.iwajutech.com/", status: "completed", date: "2026-02" },
  { id: "24", title: "Appel d'offre", description: "Gestion des marchés publics et des appels d'offre.", image: "/assets/work/ao.png", category: "frontend", technologies: ["Angular", "CSS", "HTML"], github: "", demo: "https://appelsoffre.iwajutech.com/", status: "completed", date: "2025-11" },
  { id: "25", title: "ESP Snif", description: "Système d'Information Géographique des Services Financiers du Bénin .", image: "/assets/work/espsnif.png", category: "frontend", technologies: ["Angular", "CSS", "HTML"], github: "", demo: "https://espacesnif.iwajutech.com/", status: "completed", date: "2026-02" },
  { id: "26", title: "Générateur de mot de passe", description: "Outil pour générer des mots de passe sécurisés.", image: "/assets/work/motdepasse.png", category: "ui-ux", technologies: ["React", "Tailwind CSS", "vite"], github: "", demo: "https://generateurmotdepasse.iwajutech.com/", status: "completed", date: "2026-03" },
  { id: "27", title: "Snif", description: "Écrans Snif liés à l’écosystème Espace SNIF.", image: "/assets/work/snif.png", category: "frontend", technologies: ["Angular", "CSS", "HTML"], github: "", demo: "https://espacesnif.iwajutech.com/", status: "completed", date: "2026-02" },
  { id: "28", title: "SP Snif", description: "Interface  Espace Snif pour la supervision ou les opérations.", image: "/assets/work/spsnif.png", category: "frontend", technologies: ["Angular", "CSS", "HTML"], github: "", demo: "https://espacesnif.iwajutech.com/", status: "completed", date: "2026-02" },
  { id: "29", title: "UDA — module A", description: "Application UDA Organisation : module A.", image: "/assets/work/uda.png", category: "frontend", technologies: ["Angular", "CSS", "HTML"], github: "", demo: "https://app.udaorganisation.org/", status: "completed", date: "2026-01" },
  { id: "30", title: "UDA — module Auth", description: "Application UDA Organisation ", image: "/assets/work/udal.png", category: "frontend", technologies: ["Angular", "CSS", "HTML"], github: "", demo: "https://app.udaorganisation.org/", status: "completed", date: "2026-01" },
  { id: "31", title: "UDA — module Mission", description: "Application UDA Organisation", image: "/assets/work/udam.png", category: "frontend", technologies: ["Angular", "CSS", "HTML"], github: "", demo: "https://app.udaorganisation.org/", status: "completed", date: "2026-01" },
  { id: "32", title: "UDA — module Taches", description: "Application UDA Organisation", image: "/assets/work/udat.png", category: "frontend", technologies: ["Angular", "CSS", "HTML"], github: "", demo: "https://app.udaorganisation.org/", status: "completed", date: "2026-01" },
  { id: "33", title: "Visuel de bienvenue en decembre", description: "Visuel de bienvenue en decembre", image: "/assets/work/bienvenue.png", category: "design", technologies: ["Photoshop"], status: "completed", date: "2025-12" },
  { id: "34", title: "Visuel de Noel", description: "Visuel de Noel", image: "/assets/work/noelenfamille.png", category: "design", technologies: ["Photoshop"], status: "completed", date: "2025-12" },
  { id: "35", title: "Visuel de Nouvelle an", description: "Visuel de Nouvelle an", image: "/assets/work/voeux.png", category: "design", technologies: ["Canva"], status: "completed", date: "2025-12" }
];

export let projects: Project[] = rawProjects.map((o) => {
  const row = o as Record<string, unknown>;
  const title = String(row.title ?? '');
  const description = String(row.description ?? '');
  const { title: _t, description: _d, ...rest } = row;
  return {
    ...rest,
    titleI18n: { fr: title, en: '' },
    descriptionI18n: { fr: description, en: '' },
  } as Project;
});

const rawExperiences: Record<string, unknown>[] = [
  {
    id: "1",
    company: "IWAJUTECH",
    position: "Développement Fullstack & Design UX/UI",
    duration: "2025 - 2026",
    achievements: [
      "Conception et déploiement d'architectures web modernes",
      "Optimisation de l'expérience utilisateur et des performances",
      "Pilotage technique de projets digitaux complexes",
      "Conception et création de visuels et d'identités visuelles",
    ],
    skills: ["Angular", "TypeScript", "React", "Tailwind CSS", "Laravel", "Photoshop", "Canva", "Postman", "Jira", "Trello"],
  },
  {
    id: "2",
    company: "IMUXT SARL.",
    position: "UX/UI Designer, Développement web et mobile",
    duration: "2025",
    achievements: [
      "Conception d'interfaces utilisateur innovantes",
      "Développement d'applications fullstack",
    ],
    skills: ["React", "Node.js", "Taillwindcs", "TypeScript", "React Native", "Figma"],
  },
  {
    id: "3",
    company: "DIDAVIE SA.",
    position: "Développement web",
    duration: "2024 - Présent",
    achievements: ["Création de sites vitrines et e-commerce", "Optimisation des performances"],
    skills: ["TaillWindcss", "TypeScript", "NextJs"],
  },
  {
    id: "4",
    company: "DIDAVIE SA.",
    position: "UX/UI Designer",
    duration: "2023-2024",
    achievements: ["Design système complet", "Prototypage interactif"],
    skills: ["Figma", "Adobe XD", "Prototypage"],
  },
  {
    id: "5",
    company: "CASE&CO",
    position: "Développement web et mobile",
    duration: "2023",
    achievements: ["Application mobile cross-platform", "Intégration API REST"],
    skills: ["Flutter", "Bootstrap", "Laravel", "MySQL"],
  },
  {
    id: "6",
    company: "IWAJUTECH",
    position: "Wireframe, cahier de charge, modélisation",
    duration: "2022",
    achievements: ["Documentation technique", "Maquettes fonctionnelles"],
    skills: ["Wireframing", "UML", "Conception"],
  },
  {
    id: "7",
    company: "IWAJUTECH",
    position: "Développement web",
    duration: "2021",
    achievements: ["Sites vitrines responsive", "Formulaires dynamiques"],
    skills: ["Bootstrap", "PHP", "jQuery"],
  },
];

export let experiences: Experience[] = rawExperiences.map((o) => {
  const row = o as Record<string, unknown>;
  const company = String(row.company ?? '');
  const position = String(row.position ?? '');
  const duration = String(row.duration ?? '');
  const achievements = Array.isArray(row.achievements)
    ? (row.achievements as string[])
    : [];
  const skills = Array.isArray(row.skills) ? (row.skills as string[]) : [];
  const {
    company: _c,
    position: _p,
    duration: _d,
    achievements: _a,
    skills: _s,
    ...rest
  } = row;
  return {
    ...rest,
    companyI18n: { fr: company, en: '' },
    positionI18n: { fr: position, en: '' },
    locationI18n: { fr: '', en: '' },
    durationI18n: { fr: duration, en: '' },
    achievementsI18n: achievements.map((s) => ({ fr: s, en: '' })),
    skills,
  } as Experience;
});

const rawSkills: Record<string, unknown>[] = [
  // Frontend
  { id: "1", name: "HTML5", level: 95, category: "Frontend" },
  { id: "2", name: "CSS3", level: 90, category: "Frontend" },
  { id: "3", name: "JavaScript", level: 85, category: "Frontend" },
  { id: "4", name: "React", level: 80, category: "Frontend" },
  { id: "5", name: "Next.js", level: 75, category: "Frontend" },
  { id: "6", name: "Tailwind CSS", level: 85, category: "Frontend" },
  { id: "7", name: "Angular", level: 80, category: "Frontend" },
  { id: "8", name: "Bootstrap", level: 80, category: "Frontend" },
  // Backend
  { id: "9", name: "Node.js", level: 75, category: "Backend" },
  { id: "10", name: "Laravel", level: 70, category: "Backend" },
  { id: "11", name: "MySQL", level: 65, category: "Backend" },
  // Mobile
  { id: "12", name: "React Native", level: 70, category: "Mobile" },
  // Design
  { id: "13", name: "Figma", level: 85, category: "Design" },
  { id: "14", name: "Adobe XD", level: 75, category: "Design" },
  { id: "15", name: "Photoshop", level: 70, category: "Design" },
  { id: "16", name: "Canva", level: 80, category: "Design" },
  // Commerce
  { id: "17", name: "Marketing Digital", level: 85, category: "Commerce" },
  { id: "18", name: "Stratégie Commerciale", level: 80, category: "Commerce" },
  { id: "19", name: "Gestion Client", level: 90, category: "Commerce" },
  { id: "20", name: "Communication BC", level: 85, category: "Commerce" },
  // Autres
  { id: "21", name: "TypeScript", level: 70, category: "Autres" },
  { id: "22", name: "GitHub", level: 75, category: "Autres" },
  { id: "23", name: "WordPress", level: 65, category: "Autres" },
];

export let skills: Skill[] = rawSkills.map((o) => {
  const row = o as Record<string, unknown>;
  const name = String(row.name ?? '');
  const { name: _n, ...rest } = row;
  return {
    ...rest,
    nameI18n: { fr: name, en: '' },
  } as Skill;
});

const rawServices: Record<string, unknown>[] = [
  {
    id: "1",
    title: "Développement Web",
    description: "Création de sites web modernes et responsifs avec les dernières technologies web.",
    features: ["Sites web responsifs", "Applications web modernes", "Intégration de designs", "Optimisation des performances"],
    category: "web",
    iconName: "FaCode",
    technologies: [
      { name: "Next.js" }, { name: "React" }, { name: "Node.js" }, { name: "HTML5" }, { name: "CSS3" }, { name: "Bootstrap" }, { name: "Typescript" }, { name: "JavaScript" }, { name: "TailwindCss" }
    ],
    pricing: { basic: "À partir de 1500€", standard: "À partir de 3000€", premium: "Sur devis" },
  },
  {
    id: "2",
    title: "Design UI/UX",
    description: "Conception d'interfaces utilisateur intuitives et esthétiques.",
    features: ["Design d'interface moderne", "Expérience utilisateur optimisée", "Prototypage interactif", "Tests utilisateurs"],
    category: "design",
    iconName: "SiFigma",
    technologies: [
      { name: "Figma" }, { name: "Adobe XD" }
    ],
    pricing: { basic: "À partir de 1000€", standard: "À partir de 2000€", premium: "Sur devis" },
  },
  {
    id: "3",
    title: "Développement Mobile",
    description: "Développement d'applications mobiles natives et cross-platform.",
    features: ["Applications iOS et Android", "Applications cross-platform", "Performance optimale", "Interface native"],
    category: "mobile",
    iconName: "FaMobile",
    technologies: [
      { name: "React Native" }, { name: "Typescript" }, { name: "JavaScript" }, { name: "TailwindCss" }, { name: "Node.js" }
    ],
    pricing: { basic: "À partir de 2500€", standard: "À partir de 5000€", premium: "Sur devis" },
  },
  {
    id: "4",
    title: "Design Graphique",
    description: "Création de visuels professionnels et de supports de communication.",
    features: ["Logos et identité visuelle", "Supports de communication", "Design de marque", "Charts graphiques"],
    category: "design",
    iconName: "SiAdobephotoshop",
    technologies: [
      { name: "Photoshop" }, { name: "Illustrator" }, { name: "Canva" }
    ],
    pricing: { basic: "À partir de 800€", standard: "À partir de 1500€", premium: "Sur devis" },
  },
  {
    id: "5",
    title: "SEO & Analytics",
    description: "Optimisation pour les moteurs de recherche et analyse de données.",
    features: ["Audit SEO complet", "Optimisation technique", "Analyse Google Analytics", "Reporting mensuel"],
    category: "marketing",
    iconName: "FaChartLine",
    technologies: [
      { name: "SEO Tools" }, { name: "Analytics" }
    ],
    pricing: { basic: "À partir de 500€/mois", standard: "À partir de 1000€/mois", premium: "Sur devis" },
  },
  {
    id: "6",
    title: "Services Backend (Web)",
    description: "Développement d'API et solutions serveur performantes pour le web.",
    features: ["API REST/GraphQL", "Bases de données", "Authentification sécurisée", "Microservices"],
    category: "web",
    iconName: "FaServer",
    technologies: [
      { name: "Node.js" }, { name: "MongoDB" }, { name: "Firebase" }, { name: "Laravel" }
    ],
    pricing: { basic: "À partir de 2000€", standard: "À partir de 4000€", premium: "Sur devis" },
  },
  {
    id: "7",
    title: "Services Backend (Mobile)",
    description: "Infrastructures et APIs haute performance pour applications mobiles.",
    features: ["API REST/GraphQL", "Bases de données NoSQL", "Authentification Firebase", "Postgresql"],
    category: "mobile",
    iconName: "FaServer",
    technologies: [
       { name: "Node.js" }, { name: "MongoDB" }, { name: "Firebase" }, { name: "Postgresql" }
    ],
    pricing: { basic: "À partir de 2000€", standard: "À partir de 4000€", premium: "Sur devis" },
  },
];

export let services: Service[] = rawServices.map((o) => {
  const row = o as Record<string, unknown>;
  const title = String(row.title ?? '');
  const description = String(row.description ?? '');
  const features = Array.isArray(row.features)
    ? (row.features as string[])
    : [];
  const {
    title: _t,
    description: _d,
    features: _f,
    ...rest
  } = row;
  return {
    ...rest,
    titleI18n: { fr: title, en: '' },
    descriptionI18n: { fr: description, en: '' },
    featuresI18n: features.map((s) => ({ fr: s, en: '' })),
  } as Service;
});

const rawCertifications: Record<string, unknown>[] = [
  { id: '1', title: 'Certification UX/UI Avancé', issuer: 'Figma', date: '2023', credential: 'VF-123456' },
  { id: '2', title: 'Développement Fullstack JavaScript', issuer: 'OpenClassrooms', date: '2022', credential: 'OC-789012' },
  { id: '3', title: 'Attestation de confection de sac en canevas', issuer: 'Formation Artisanale', date: '2025', credential: '' },
  { id: '4', title: 'Attestation de confection de sac (avec et sans carton) et accessoires', issuer: 'Formation Artisanale', date: '2025', credential: '' }
];

export let certifications: Certification[] = rawCertifications.map((o) => {
  const row = o as Record<string, unknown>;
  const title = String(row.title ?? '');
  const issuer = String(row.issuer ?? '');
  const { title: _t, issuer: _i, ...rest } = row;
  return {
    ...rest,
    titleI18n: { fr: title, en: '' },
    issuerI18n: { fr: issuer, en: '' },
  } as Certification;
});

export let aboutInfo: AboutInfo = {
  nameI18n: { fr: 'Gbènami Caroline MEHA', en: '' },
  titleI18n: { fr: 'Développeur Fullstack & Design UX/UI', en: '' },
  bioI18n: {
    fr: "Professionnelle polyvalente alliant expertise technique, vision commerciale et transmission de savoir. Experte autodidacte en design graphique et UX/UI design, je possède également un solide bagage en Marketing Communication et Commerce. Je conçois des visuels publicitaires percutants et des interfaces utilisateur intuitives, tout en apportant une dimension stratégique à chaque projet. Par ailleurs, je transmets mon expertise en tant que formatrice spécialisée dans la confection de sacs et d'accessoires artisanaux, alliant créativité et rigueur technique. Passionnée par le développement web et mobile, je transforme les besoins complexes en solutions digitales performantes.",
    en: '',
  },
  avatar: '/assets/avatar.jpeg',
  locationI18n: { fr: 'Bénin', en: '' },
  email: 'caroline.meha1@gmail.com',
  phone: '(+229) 01 95 23 21 83 / 01 96 29 05 28',
  experienceI18n: { fr: '8+ Ans', en: '' },
  nationalityI18n: { fr: 'Béninoise', en: '' },
  shopUrl: 'https://gcmuniverse.vercel.app/',
  freelanceStatusI18n: { fr: 'Disponible', en: '' },
  languagesI18n: { fr: 'Fon, Français, Anglais', en: '' },
  github: 'https://github.com/carolinemeha',
  linkedin: 'https://linkedin.com/in/caroline-meha',
  twitter: 'https://x.com/CarolineMeha',
  youtube: 'https://www.youtube.com/@carolinemeha',
  website: 'https://caroline-ten.vercel.app/',
  rolesI18n: [
    { fr: 'Développeur Fullstack', en: '' },
    { fr: 'UI/UX Designer', en: '' },
    { fr: 'Formatrice Artisanale', en: '' },
  ],
  timezoneI18n: { fr: 'UTC+1 (WAT)', en: '' },
  availableStatusI18n: { fr: 'Disponible pour de nouveaux projets', en: '' },
  cvUrl: '/assets/CV.pdf',
  heroBadgeI18n: { fr: 'Caroline Meha', en: '' },
  homeAvailableTitleI18n: { fr: 'Disponible', en: '' },
  homeAvailableSubtitleI18n: { fr: 'Pour de nouveaux projets', en: '' },
  homeStatYears: 8,
  homeStatProjects: 15,
  homeStatClients: 12,
  homeStatSatisfaction: 100,
  whatsappUrl: 'https://wa.me/2290196290528',
  telegramUrl: 'https://t.me/carolinemeha',
};

const rawEducation: Record<string, unknown>[] = [
  {
    id: "1",
    institution: "Formation Artisanale",
    degree: "Attestation de confection de sac en canevas",
    duration: "2025",
    courses: ["Travail du canevas", "Techniques de couture", "Design durable"],
  },
  {
    id: "2",
    institution: "Formation Artisanale",
    degree: "Attestation de confection de sac (avec et sans carton) et accessoires",
    duration: "2025",
    courses: ["Design d'accessoires", "Techniques de confection", "Matériaux mixtes"],
  },
  {
    id: "3",
    institution: "Ecole Supérieur Faucon (ESF)",
    degree: "Licence professionnelle en Système Informatique et Logiciel (SIL)",
    duration: "2020-2023",
    courses: ["Algorithmique", "Bases de données", "Développement web", "Développement mobile", "Réseau"],
  },
  {
    id: "4",
    institution: "Institut Supérieur de Management (ISM ADONAÏ)",
    degree: "Licence1 en Marketing Communication et commerce (MCC)",
    duration: "2019-2020",
    courses: ["Communication digitale", "Stratégie marketing"],
  },
  {
    id: "5",
    institution: "Collège d'Enseignement Général de TANGBO DJEVIE",
    degree: "Baccalauréat (BAC D)",
    duration: "2018-2019",
    courses: ["Mathématiques", "Sciences de la vie"],
  },
  {
    id: "6",
    institution: "First Informatique",
    degree: "Attestation de fin de formation en opération de saisie",
    duration: "2008-2009",
    courses: ["Bureautique", "Saisie rapide"],
  },
];

export let education: Education[] = rawEducation.map((o) => {
  const row = o as Record<string, unknown>;
  const institution = String(row.institution ?? '');
  const degree = String(row.degree ?? '');
  const duration = String(row.duration ?? '');
  const courses = Array.isArray(row.courses) ? (row.courses as string[]) : [];
  const {
    institution: _i,
    degree: _d,
    duration: _du,
    courses: _c,
    ...rest
  } = row;
  return {
    ...rest,
    institutionI18n: { fr: institution, en: '' },
    degreeI18n: { fr: degree, en: '' },
    durationI18n: { fr: duration, en: '' },
    coursesI18n: courses.map((s) => ({ fr: s, en: '' })),
  } as Education;
});

const rawTestimonials: Record<string, unknown>[] = [
  {
    id: "1",
    name: "Client A",
    role: "CEO, Entreprise X",
    content: "Caroline a transformé notre vision en une interface exceptionnelle qui a dépassé nos attentes.",
    avatar: "/assets/avatars/avatar.jpeg"
  },
  {
    id: "2",
    name: "Client B",
    role: "Directeur Technique, Startup Y",
    content: "Un travail remarquable sur l'optimisation des performances de notre application mobile.",
    avatar: "/assets/avatars/avatar.jpeg"
  },
  {
    id: "3",
    name: "Caleb AHOUANDJINOU",
    role: "Propriétaire AHIMARKET",
    content: "Une collaboration exceptionnelle. Caroline a su capturer l'essence de notre marque et créer une plateforme e-commerce intuitive et performante.",
    avatar: ''
  },
  {
    id: "4",
    name: "Fréjuis AHOUANMENOU",
    role: "CEO IWAJUTECH",
    content: "Caroline est une développeuse talentueuse et rigoureuse. Son expertise en UI/UX fait toute la différence sur nos projets complexes.",
    avatar: ''
  }
];

export let testimonials: Testimonial[] = rawTestimonials.map((o) => {
  const row = o as Record<string, unknown>;
  const name = String(row.name ?? '');
  const role = String(row.role ?? '');
  const content = String(row.content ?? '');
  const avatar = normalizeTestimonialAvatarUrl(row.avatar as string | null);
  const { name: _n, role: _r, content: _c, avatar: _a, ...rest } = row;
  return {
    ...rest,
    nameI18n: { fr: name, en: '' },
    roleI18n: { fr: role, en: '' },
    contentI18n: { fr: content, en: '' },
    avatar,
  } as Testimonial;
});

let contactMessages: ContactMessage[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    subject: 'Project Inquiry',
    message: 'I would like to discuss a potential project...',
    status: 'new',
    createdAt: '2024-01-20T10:00:00Z'
  }
];

let cvInfo: CVInfo | null = {
  fileName: 'john_doe_cv.pdf',
  uploadDate: '2024-01-10',
  fileSize: '1.2 MB'
};


export const dataService = {
  // Projects
  async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
    
    return data.map((p) => mapProjectRow(p as Record<string, unknown>));
  },

  async getProject(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error || !data) return null;
    return mapProjectRow(data as Record<string, unknown>);
  },

  async createProject(project: Omit<Project, 'id'>): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .insert(projectInsertPayload(project))
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error creating project:', error);
      return null;
    }
    return data ? mapProjectRow(data as Record<string, unknown>) : null;
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    const mappedUpdates = projectUpdatePayload(updates);
    if (Object.keys(mappedUpdates).length === 0) {
      return this.getProject(id);
    }

    const { data, error } = await supabase
      .from('projects')
      .update(mappedUpdates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating project:', error);
      return null;
    }
    return data ? mapProjectRow(data as Record<string, unknown>) : null;
  },

  async deleteProject(id: string): Promise<boolean> {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    return !error;
  },

  // Experiences
  async getExperiences(): Promise<Experience[]> {
    const { data, error } = await supabase.from('experiences').select('*').order('created_at', { ascending: false });
    return error || !data ? [] : data.map((row) => mapExperienceRow(row as Record<string, unknown>));
  },

  async getExperience(id: string): Promise<Experience | null> {
    const { data, error } = await supabase.from('experiences').select('*').eq('id', id).maybeSingle();
    if (error || !data) return null;
    return mapExperienceRow(data as Record<string, unknown>);
  },

  async createExperience(experience: Omit<Experience, 'id'>): Promise<Experience | null> {
    const payload = experienceToDbPayload(experience);
    const { data, error } = await supabase.from('experiences').insert(payload).select().maybeSingle();
    if (error) {
      logSupabase('createExperience', error);
      return null;
    }
    if (!data) return null;
    return mapExperienceRow(data as Record<string, unknown>);
  },

  async updateExperience(id: string, updates: Partial<Experience>): Promise<Experience | null> {
    const payload = experienceToDbPayload(updates);
    if (Object.keys(payload).length === 0) return this.getExperience(id);
    const { data, error } = await supabase.from('experiences').update(payload).eq('id', id).select().maybeSingle();
    if (error) {
      logSupabase('updateExperience', error);
      return null;
    }
    if (!data) return null;
    return mapExperienceRow(data as Record<string, unknown>);
  },

  async deleteExperience(id: string): Promise<boolean> {
    const { error } = await supabase.from('experiences').delete().eq('id', id);
    return !error;
  },

  // Skills
  async getSkills(): Promise<Skill[]> {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('name', { ascending: true });
      if (error || !data || data.length === 0) {
        return skills.map((s) => ({
          ...s,
          iconName: s.iconName ?? '',
        }));
      }
      return data.map((row) => mapSkillFromRow(row as Record<string, unknown>));
    } catch (e) {
      return skills.map((s) => ({
        ...s,
        iconName: s.iconName ?? '',
      }));
    }
  },

  async createSkill(skill: Omit<Skill, 'id'>): Promise<Skill | null> {
    const { data, error } = await supabase
      .from('skills')
      .insert({
        ...skillToDbPayload(skill),
        level: skill.level ?? 0,
        category: skill.category,
        icon_name: skill.iconName?.trim() || null,
      })
      .select()
      .maybeSingle();
    if (error) {
      logSupabase('createSkill', error);
      return null;
    }
    return data ? mapSkillFromRow(data as Record<string, unknown>) : null;
  },

  async updateSkill(id: string, updates: Partial<Skill>): Promise<Skill | null> {
    const payload = skillToDbPayload(updates);
    const { data, error } = await supabase
      .from('skills')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) {
      logSupabase('updateSkill', error);
      return null;
    }
    return data ? mapSkillFromRow(data as Record<string, unknown>) : null;
  },

  async deleteSkill(id: string): Promise<boolean> {
    const { error } = await supabase.from('skills').delete().eq('id', id);
    return !error;
  },

  // Services
  async getServices(): Promise<Service[]> {
    const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: true });
    if (error || !data) return [];
    return data.map((row) => mapServiceRow(row as Record<string, unknown>));
  },

  async createService(service: Omit<Service, 'id'>): Promise<Service | null> {
    const { data, error } = await supabase
      .from('services')
      .insert({
        ...serviceToDbPayload(service),
        pricing: service.pricing,
      })
      .select()
      .maybeSingle();
    if (error) {
      console.error('Erreur createService:', error);
      return null;
    }
    return data ? mapServiceRow(data as Record<string, unknown>) : null;
  },

  async updateService(id: string, updates: Partial<Service>): Promise<Service | null> {
    const mappedUpdates = serviceToDbPayload(updates);
    if (updates.technologies) {
      mappedUpdates.technologies = updates.technologies.map((t) =>
        typeof t === 'string' ? t : JSON.stringify(t)
      );
    }
    if (updates.iconName !== undefined) {
      mappedUpdates.icon_name = updates.iconName?.trim() || null;
    }
    if (Object.keys(mappedUpdates).length === 0) {
      const cur = await supabase.from('services').select('*').eq('id', id).maybeSingle();
      return cur.data ? mapServiceRow(cur.data as Record<string, unknown>) : null;
    }
    const { data, error } = await supabase
      .from('services')
      .update(mappedUpdates)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) {
      console.error('Erreur updateService:', error);
      return null;
    }
    return data ? mapServiceRow(data as Record<string, unknown>) : null;
  },

  async deleteService(id: string): Promise<boolean> {
    const { error } = await supabase.from('services').delete().eq('id', id);
    return !error;
  },

  // About info
  async getAboutInfo(): Promise<AboutInfo | null> {
    try {
      const { data, error } = await supabase.from('about').select('*').limit(1).maybeSingle();
      
      if (error) {
        console.error('getAboutInfo error:', error);
        return aboutInfo;
      }

      if (!data) {
        return aboutInfo; // mock values if DB is empty
      }

      const mapped = mapAboutRowToInfo(data as Record<string, unknown>);
      const asInt = (v: unknown): number | undefined => {
        if (v == null) return undefined;
        if (typeof v === 'number' && !Number.isNaN(v)) return v;
        const n = parseInt(String(v), 10);
        return Number.isNaN(n) ? undefined : n;
      };
      return {
        ...mapped,
        homeStatYears: asInt(data.home_stat_years) ?? mapped.homeStatYears,
        homeStatProjects: asInt(data.home_stat_projects) ?? mapped.homeStatProjects,
        homeStatClients: asInt(data.home_stat_clients) ?? mapped.homeStatClients,
        homeStatSatisfaction:
          asInt(data.home_stat_satisfaction) ?? mapped.homeStatSatisfaction,
      };
    } catch (e) {
      console.error('Unexpected error in getAboutInfo:', e);
      return aboutInfo;
    }
  },

  async updateAboutInfo(updates: Partial<AboutInfo>): Promise<AboutInfo | null> {
    const dbPayload = aboutInfoToDbPayload(updates);
    dbPayload.updated_at = new Date().toISOString();

    // Check if a row already exists (about is a singleton table)
    const { data: existing } = await supabase.from('about').select('id').limit(1).maybeSingle();

    let data: any, error: any;

    if (existing?.id) {
      // UPDATE existing row by its UUID
      ({ data, error } = await supabase
        .from('about')
        .update(dbPayload)
        .eq('id', existing.id)
        .select()
        .maybeSingle());
    } else {
      // INSERT first row
      ({ data, error } = await supabase
        .from('about')
        .insert(dbPayload)
        .select()
        .maybeSingle());
    }

    if (error) {
      console.error('updateAboutInfo error:', error);
      return null;
    }

    if (!data) return null;
    const mapped = mapAboutRowToInfo(data as Record<string, unknown>);
    const asInt = (v: unknown): number | undefined => {
      if (v == null) return undefined;
      if (typeof v === 'number' && !Number.isNaN(v)) return v;
      const n = parseInt(String(v), 10);
      return Number.isNaN(n) ? undefined : n;
    };
    return {
      ...mapped,
      homeStatYears: asInt(data.home_stat_years) ?? mapped.homeStatYears,
      homeStatProjects: asInt(data.home_stat_projects) ?? mapped.homeStatProjects,
      homeStatClients: asInt(data.home_stat_clients) ?? mapped.homeStatClients,
      homeStatSatisfaction:
        asInt(data.home_stat_satisfaction) ?? mapped.homeStatSatisfaction,
    };
  },

  // Education
  async getEducation(): Promise<Education[]> {
    const { data, error } = await supabase.from('education').select('*').order('duration', { ascending: false });
    return error || !data
      ? []
      : data.map((row) => mapEducationRow(row as Record<string, unknown>));
  },

  async createEducation(education: Omit<Education, 'id'>): Promise<Education | null> {
    const { data, error } = await supabase
      .from('education')
      .insert(educationToDbPayload(education))
      .select()
      .maybeSingle();
    if (error) {
      logSupabase('createEducation', error);
      return null;
    }
    if (!data) return null;
    return mapEducationRow(data as Record<string, unknown>);
  },

  async updateEducation(id: string, updates: Partial<Education>): Promise<Education | null> {
    const payload = educationToDbPayload(updates);
    if (Object.keys(payload).length === 0) {
      const cur = await supabase.from('education').select('*').eq('id', id).maybeSingle();
      return cur.data ? mapEducationRow(cur.data as Record<string, unknown>) : null;
    }
    const { data, error } = await supabase
      .from('education')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) {
      logSupabase('updateEducation', error);
      return null;
    }
    if (!data) return null;
    return mapEducationRow(data as Record<string, unknown>);
  },

  async deleteEducation(id: string): Promise<boolean> {
    const { error } = await supabase.from('education').delete().eq('id', id);
    return !error;
  },

  // Testimonials
  async getTestimonials(): Promise<Testimonial[]> {
    const { data, error } = await supabase.from('testimonials').select('*').order('date', { ascending: false });
    if (error || !data) return [];
    return data.map((row) => mapTestimonialRow(row as Record<string, unknown>));
  },

  async createTestimonial(testimonial: Omit<Testimonial, 'id'>): Promise<Testimonial | null> {
    const payload = testimonialToDbPayload({
      ...testimonial,
      avatar: normalizeTestimonialAvatarUrl(testimonial.avatar),
    });
    const { data, error } = await supabase.from('testimonials').insert(payload).select().maybeSingle();
    if (error) {
      logSupabase('createTestimonial', error);
      return null;
    }
    if (!data) return null;
    return mapTestimonialRow(data as Record<string, unknown>);
  },

  async updateTestimonial(id: string, updates: Partial<Testimonial>): Promise<Testimonial | null> {
    const payload = testimonialToDbPayload(updates);
    if ('avatar' in updates && updates.avatar !== undefined) {
      payload.avatar = normalizeTestimonialAvatarUrl(updates.avatar);
    }
    if (Object.keys(payload).length === 0) {
      const cur = await supabase.from('testimonials').select('*').eq('id', id).maybeSingle();
      return cur.data ? mapTestimonialRow(cur.data as Record<string, unknown>) : null;
    }
    const { data, error } = await supabase.from('testimonials').update(payload).eq('id', id).select().maybeSingle();
    if (error) {
      logSupabase('updateTestimonial', error);
      return null;
    }
    if (!data) return null;
    return mapTestimonialRow(data as Record<string, unknown>);
  },

  async deleteTestimonial(id: string): Promise<boolean> {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    return !error;
  },

  // Certifications
  async getCertifications(): Promise<Certification[]> {
    const { data, error } = await supabase.from('certifications').select('*').order('date', { ascending: false });
    return error || !data
      ? []
      : data.map((row) => mapCertificationRow(row as Record<string, unknown>));
  },

  async createCertification(cert: Omit<Certification, 'id'>): Promise<Certification | null> {
    const { data, error } = await supabase
      .from('certifications')
      .insert(certificationToDbPayload(cert))
      .select()
      .maybeSingle();
    if (error) {
      logSupabase('createCertification', error);
      return null;
    }
    if (!data) return null;
    return mapCertificationRow(data as Record<string, unknown>);
  },

  async updateCertification(id: string, updates: Partial<Certification>): Promise<Certification | null> {
    const payload = certificationToDbPayload(updates);
    if (Object.keys(payload).length === 0) {
      const cur = await supabase.from('certifications').select('*').eq('id', id).maybeSingle();
      return cur.data ? mapCertificationRow(cur.data as Record<string, unknown>) : null;
    }
    const { data, error } = await supabase
      .from('certifications')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) {
      logSupabase('updateCertification', error);
      return null;
    }
    if (!data) return null;
    return mapCertificationRow(data as Record<string, unknown>);
  },

  async deleteCertification(id: string): Promise<boolean> {
    const { error } = await supabase.from('certifications').delete().eq('id', id);
    return !error;
  },

  // Contact messages
  async getContactMessages(): Promise<ContactMessage[]> {
    const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map((m) => mapContactRow(m as Record<string, unknown>));
  },

  async updateContactMessage(id: string, updates: Partial<ContactMessage>): Promise<ContactMessage | null> {
    const payload: Record<string, unknown> = {};
    if (updates.status !== undefined) payload.status = updates.status;
    const { data, error } = await supabase.from('contact_messages').update(payload).eq('id', id).select().maybeSingle();
    if (error) return null;
    return mapContactRow(data as Record<string, unknown>);
  },

  async deleteContactMessage(id: string): Promise<boolean> {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    return !error;
  },

  // CV
  async getCVInfo(): Promise<CVInfo | null> {
    const { data, error } = await supabase.from('cv_info').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (error) return null;
    return {
      fileName: data.file_name,
      uploadDate: data.upload_date,
      fileSize: data.file_size,
      url: data.url
    };
  },

  async updateCV(newCVInfo: CVInfo): Promise<CVInfo | null> {
    const { data, error } = await supabase.from('cv_info').upsert({
      file_name: newCVInfo.fileName,
      upload_date: newCVInfo.uploadDate,
      file_size: newCVInfo.fileSize,
      url: newCVInfo.url
    }).select().maybeSingle();
    if (error) return null;
    return {
      fileName: data.file_name,
      uploadDate: data.upload_date,
      fileSize: data.file_size,
      url: data.url
    };
  },

  async deleteCV(): Promise<boolean> {
    const { error } = await supabase.from('cv_info').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    return !error;
  },

  /** Préférences console persistées (Supabase). */
  async getConsoleSettings(): Promise<AdminPreferencesV1 | null> {
    const { data, error } = await supabase
      .from('admin_console_settings')
      .select('*')
      .eq('id', ADMIN_CONSOLE_SETTINGS_ID)
      .maybeSingle();
    if (error || !data) return null;
    const row = data as Record<string, unknown>;
    const extra = parsePreferencesExtra(row.preferences_extra);
    return normalizeAdminPreferences({
      v: 1,
      brand: {
        line1: String(row.sidebar_line1 ?? 'Console').slice(0, 28),
        line2: String(row.sidebar_line2 ?? 'Portfolio').slice(0, 36),
        logoUrl: String(row.sidebar_logo_url ?? '').trim().slice(0, 2048),
      },
      sidebarCompact: Boolean(row.sidebar_compact),
      reduceMotion: Boolean(row.reduce_motion),
      landingPath: String(row.landing_path ?? '/admin/dashboard'),
      publicSiteUrl: String(row.public_site_url ?? '').slice(0, 512),
      ...extra,
    });
  },

  async upsertConsoleSettings(prefs: AdminPreferencesV1): Promise<boolean> {
    const row = {
      id: ADMIN_CONSOLE_SETTINGS_ID,
      public_site_url: prefs.publicSiteUrl,
      sidebar_line1: prefs.brand.line1,
      sidebar_line2: prefs.brand.line2,
      sidebar_logo_url: prefs.brand.logoUrl?.trim() || '',
      landing_path: prefs.landingPath,
      sidebar_compact: prefs.sidebarCompact,
      reduce_motion: prefs.reduceMotion,
      preferences_extra: preferencesExtraFromPrefs(prefs),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('admin_console_settings').upsert(row);
    if (error) {
      console.error('upsertConsoleSettings:', error);
      return false;
    }
    return true;
  },

  // Dashboard & Analytics
  async getDashboardStats(): Promise<DashboardStats> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoIso = weekAgo.toISOString();

    const [
      viewsTotalRes,
      viewsWeekRes,
      visitorsAllRes,
      visitorsWeekRes,
      downloadsTotalRes,
      downloadsWeekRes,
    ] = await Promise.all([
      supabase.from('page_views').select('*', { count: 'exact', head: true }),
      supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgoIso),
      supabase.from('page_views').select('ip_hash'),
      supabase.from('page_views').select('ip_hash').gte('created_at', weekAgoIso),
      supabase.from('cv_downloads').select('*', { count: 'exact', head: true }),
      supabase
        .from('cv_downloads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgoIso),
    ]);

    const uniq = (rows: { ip_hash: string | null }[] | null | undefined) => {
      const s = new Set<string>();
      for (const v of rows || []) {
        if (v.ip_hash != null && v.ip_hash !== '') s.add(v.ip_hash);
      }
      return s.size;
    };

    return {
      totalViews: viewsTotalRes.count ?? 0,
      viewsThisWeek: viewsWeekRes.count ?? 0,
      uniqueVisitors: uniq(visitorsAllRes.data as { ip_hash: string | null }[]),
      uniqueVisitorsThisWeek: uniq(visitorsWeekRes.data as { ip_hash: string | null }[]),
      cvDownloads: downloadsTotalRes.count ?? 0,
      cvDownloadsThisWeek: downloadsWeekRes.count ?? 0,
      recentActivity: await this.getRecentActivity(),
    };
  },

  async getRecentActivity(): Promise<ActivityEntry[]> {
    const activity: ActivityEntry[] = [];

    const [
      { data: latestProject },
      { data: latestSkill },
      { data: latestMsg },
      { data: latestExp },
      { data: latestEdu },
      { data: latestTesti },
      { data: latestService },
    ] = await Promise.all([
      supabase
        .from('projects')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('skills')
        .select('id, name, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('contact_messages')
        .select('id, subject, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('experiences')
        .select('id, company, position, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('education')
        .select('id, institution, degree, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('testimonials')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('services')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (latestProject?.created_at) {
      const lp = latestProject as Record<string, unknown>;
      activity.push({
        id: latestProject.id,
        type: 'project',
        subtitle: dashActivityText(lp.title_i18n, lp.title as string | null),
        date: latestProject.created_at,
      });
    }

    if (latestSkill) {
      const d = latestSkill.updated_at || latestSkill.created_at;
      if (d) {
        const ls = latestSkill as Record<string, unknown>;
        activity.push({
          id: latestSkill.id,
          type: 'skill',
          subtitle: dashActivityText(ls.name_i18n, ls.name as string | null),
          date: d,
        });
      }
    }

    if (latestMsg?.created_at) {
      activity.push({
        id: latestMsg.id,
        type: 'message',
        subtitle: latestMsg.subject?.trim() || '',
        date: latestMsg.created_at,
      });
    }

    if (latestExp?.created_at) {
      const le = latestExp as Record<string, unknown>;
      activity.push({
        id: latestExp.id,
        type: 'experience',
        subtitle: `${dashActivityText(le.position_i18n, le.position as string | null)} — ${dashActivityText(le.company_i18n, le.company as string | null)}`,
        date: latestExp.created_at,
      });
    }

    if (latestEdu?.created_at) {
      const ldu = latestEdu as Record<string, unknown>;
      activity.push({
        id: latestEdu.id,
        type: 'education',
        subtitle: `${dashActivityText(ldu.degree_i18n, ldu.degree as string | null)} — ${dashActivityText(ldu.institution_i18n, ldu.institution as string | null)}`,
        date: latestEdu.created_at,
      });
    }

    if (latestTesti?.created_at) {
      const lt = latestTesti as Record<string, unknown>;
      activity.push({
        id: latestTesti.id,
        type: 'testimonial',
        subtitle: dashActivityText(lt.name_i18n, lt.name as string | null),
        date: latestTesti.created_at,
      });
    }

    if (latestService?.created_at) {
      const lsv = latestService as Record<string, unknown>;
      activity.push({
        id: latestService.id,
        type: 'service',
        subtitle: dashActivityText(lsv.title_i18n, lsv.title as string | null),
        date: latestService.created_at,
      });
    }

    return activity
      .filter((a) => a.date && !Number.isNaN(new Date(a.date).getTime()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  }
};
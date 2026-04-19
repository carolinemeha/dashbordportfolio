import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  FolderOpen,
  Briefcase,
  Wrench,
  Settings,
  User,
  FileText,
  GraduationCap,
  MessageSquare,
  Mail,
  Award,
  SlidersHorizontal,
} from 'lucide-react';

/** Aligné sur le frontend (next-intl) : `fr` et `en` uniquement. */
export const ADMIN_DEFAULT_LANDING = '/admin/dashboard';

export type AdminNavDef = {
  id: string;
  href: string;
  icon: LucideIcon;
};

export const ADMIN_NAV_DEFS: AdminNavDef[] = [
  { id: 'dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { id: 'projects', href: '/admin/projects', icon: FolderOpen },
  { id: 'experiences', href: '/admin/experiences', icon: Briefcase },
  { id: 'skills', href: '/admin/skills', icon: Wrench },
  { id: 'services', href: '/admin/services', icon: Settings },
  { id: 'about', href: '/admin/about', icon: User },
  { id: 'cv', href: '/admin/cv', icon: FileText },
  { id: 'education', href: '/admin/education', icon: GraduationCap },
  { id: 'certifications', href: '/admin/certifications', icon: Award },
  { id: 'testimonials', href: '/admin/testimonials', icon: MessageSquare },
  { id: 'contact', href: '/admin/contact', icon: Mail },
  { id: 'settings', href: '/admin/settings', icon: SlidersHorizontal },
];

export type AdminNavItem = {
  id: string;
  name: string;
  heading: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export function getAllowedLandingHrefs(): string[] {
  const s = new Set<string>();
  s.add(ADMIN_DEFAULT_LANDING);
  ADMIN_NAV_DEFS.forEach((n) => s.add(n.href));
  return Array.from(s);
}

/** @param t fonction `t` du contexte i18n admin (clés `nav.<id>.name|heading|description`). */
export function buildAdminNavigation(t: (key: string) => string): AdminNavItem[] {
  return ADMIN_NAV_DEFS.map((d) => ({
    id: d.id,
    href: d.href,
    icon: d.icon,
    name: t(`nav.${d.id}.name`),
    heading: t(`nav.${d.id}.heading`),
    description: t(`nav.${d.id}.description`),
  }));
}

export function getLandingPageOptions(
  t: (key: string) => string
): { href: string; label: string }[] {
  const items = buildAdminNavigation(t);
  return getAllowedLandingHrefs().map((href) => ({
    href,
    label: items.find((n) => n.href === href)?.name ?? href,
  }));
}

export function getAdminPageMeta(
  pathname: string,
  t: (key: string) => string
): AdminNavItem | null {
  return buildAdminNavigation(t).find((n) => n.href === pathname) ?? null;
}

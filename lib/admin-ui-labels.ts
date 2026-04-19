/** Libellés UI pour valeurs stockées en base (catégories, clés). */

const SKILL_CAT_TO_KEY: Record<string, string> = {
  Frontend: 'frontend',
  Backend: 'backend',
  Mobile: 'mobile',
  Design: 'design',
  Commerce: 'commerce',
  Autres: 'other',
};

export function skillCategoryLabel(
  category: string,
  t: (key: string) => string
): string {
  const k = SKILL_CAT_TO_KEY[category];
  return k ? t(`forms.skill.categories.${k}`) : category;
}

const PROJECT_CAT_KEYS: Record<string, string> = {
  frontend: 'frontend',
  fullstack: 'fullstack',
  'ui-ux': 'uiUx',
  design: 'design',
  logo: 'logo',
};

export function projectCategoryLabel(
  category: string,
  t: (key: string) => string
): string {
  const k = PROJECT_CAT_KEYS[category];
  return k ? t(`pages.projects.categories.${k}`) : category;
}

const CONTACT_SERVICE_KEYS: Record<string, string> = {
  web: 'web',
  mobile: 'mobile',
  design: 'design',
  graphisme: 'graphisme',
  other: 'other',
};

export function contactServiceLabel(
  key: string | undefined,
  t: (key: string) => string
): string {
  if (!key) return '—';
  const k = CONTACT_SERVICE_KEYS[key];
  return k ? t(`pages.contact.services.${k}`) : key;
}

const SERVICE_FORM_CATEGORY_KEYS: Record<string, string> = {
  web: 'web',
  design: 'design',
  mobile: 'mobile',
  marketing: 'marketing',
  'web & mobile': 'webMobile',
};

export function serviceFormCategoryLabel(
  value: string,
  t: (key: string) => string
): string {
  const k = SERVICE_FORM_CATEGORY_KEYS[value];
  return k ? t(`forms.service.selectCategory.${k}`) : value;
}

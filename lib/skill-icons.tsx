/**
 * Icônes compétences (react-icons) — alignées CV + logos tech manquants.
 * Clé en base : nom d’export (ex. SiFirebase).
 */
import type { IconType } from 'react-icons';
import {
  FaHtml5,
  FaCss3,
  FaJs,
  FaReact,
  FaBootstrap,
  FaNodeJs,
  FaLaravel,
  FaFigma,
  FaGithub,
  FaChartLine,
  FaHandshake,
  FaUsers,
  FaBullhorn,
  FaCode,
} from 'react-icons/fa';
import {
  SiNextdotjs,
  SiTailwindcss,
  SiTypescript,
  SiMysql,
  SiAdobe,
  SiWordpress,
  SiCanva,
  SiAngular,
  SiFirebase,
  SiMongodb,
  SiSupabase,
  SiAdobexd,
  SiAdobeillustrator,
} from 'react-icons/si';
import { DiPhotoshop } from 'react-icons/di';
import { TbBrandReactNative } from 'react-icons/tb';

/** Map nom d’export → composant. */
export const SKILL_REACT_ICON_MAP: Record<string, IconType> = {
  FaHtml5,
  FaCss3,
  FaJs,
  FaReact,
  SiNextdotjs,
  SiTailwindcss,
  SiAngular,
  FaBootstrap,
  FaNodeJs,
  FaLaravel,
  SiMysql,
  SiFirebase,
  SiMongodb,
  SiSupabase,
  TbBrandReactNative,
  FaFigma,
  SiAdobe,
  SiAdobexd,
  DiPhotoshop,
  SiAdobeillustrator,
  SiCanva,
  FaChartLine,
  FaHandshake,
  FaUsers,
  FaBullhorn,
  SiTypescript,
  FaGithub,
  SiWordpress,
  FaCode,
};

/** Ordre du sélecteur (Frontend → Autres + BaaS / design pro). */
export const SKILL_ICON_OPTIONS: { key: string; label: string }[] = [
  { key: 'FaHtml5', label: 'HTML5' },
  { key: 'FaCss3', label: 'CSS3' },
  { key: 'FaJs', label: 'JavaScript' },
  { key: 'FaReact', label: 'React' },
  { key: 'SiNextdotjs', label: 'Next.js' },
  { key: 'SiTailwindcss', label: 'Tailwind CSS' },
  { key: 'SiAngular', label: 'Angular' },
  { key: 'FaBootstrap', label: 'Bootstrap' },
  { key: 'FaNodeJs', label: 'Node.js' },
  { key: 'FaLaravel', label: 'Laravel' },
  { key: 'SiMysql', label: 'MySQL' },
  { key: 'SiMongodb', label: 'MongoDB' },
  { key: 'SiFirebase', label: 'Firebase' },
  { key: 'SiSupabase', label: 'Supabase' },
  { key: 'TbBrandReactNative', label: 'React Native' },
  { key: 'FaFigma', label: 'Figma' },
  { key: 'SiAdobexd', label: 'Adobe XD' },
  { key: 'SiAdobe', label: 'Adobe (générique)' },
  { key: 'DiPhotoshop', label: 'Photoshop' },
  { key: 'SiAdobeillustrator', label: 'Illustrator' },
  { key: 'SiCanva', label: 'Canva' },
  { key: 'FaChartLine', label: 'Marketing / stats' },
  { key: 'FaHandshake', label: 'Partenariat / stratégie' },
  { key: 'FaUsers', label: 'Clients / équipe' },
  { key: 'FaBullhorn', label: 'Communication' },
  { key: 'SiTypescript', label: 'TypeScript' },
  { key: 'FaGithub', label: 'GitHub' },
  { key: 'SiWordpress', label: 'WordPress' },
  { key: 'FaCode', label: 'Code (générique)' },
];

/** Normalise pour matcher sans accents. */
function norm(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Si `icon_name` est vide en base, déduit une icône à partir du libellé affiché
 * (ex. « Marketing Digital » → FaChartLine).
 */
export function inferSkillIconKeyFromName(name: string): string | null {
  const n = norm(name);
  if (!n) return null;

  if (n.includes('react native')) return 'TbBrandReactNative';
  if (n.includes('firebase')) return 'SiFirebase';
  if (n.includes('mongodb') || n.includes('mongo db')) return 'SiMongodb';
  if (n.includes('supabase')) return 'SiSupabase';

  if (n.includes('illustrator')) return 'SiAdobeillustrator';
  if (n.includes('adobe xd') || n === 'xd') return 'SiAdobexd';
  if (n.includes('photoshop')) return 'DiPhotoshop';

  if (n.includes('marketing digital')) return 'FaChartLine';
  if (n.includes('strategie commerciale')) return 'FaHandshake';
  if (n.includes('gestion client')) return 'FaUsers';
  if (n.includes('communication')) return 'FaBullhorn';

  if (n.includes('typescript')) return 'SiTypescript';
  if (n.includes('wordpress')) return 'SiWordpress';
  if (n.includes('github')) return 'FaGithub';

  if (n.includes('next.js') || n.includes('nextjs')) return 'SiNextdotjs';
  if (n.includes('tailwind')) return 'SiTailwindcss';
  if (n.includes('angular')) return 'SiAngular';
  if (n.includes('bootstrap')) return 'FaBootstrap';
  if (n.includes('laravel')) return 'FaLaravel';
  if (n.includes('mysql')) return 'SiMysql';
  if (n.includes('node')) return 'FaNodeJs';

  if (n.includes('html5') || n === 'html') return 'FaHtml5';
  if (n.includes('css3') || n === 'css') return 'FaCss3';
  if (n.includes('javascript') || n === 'js') return 'FaJs';
  if (n.includes('react')) return 'FaReact';
  if (n.includes('figma')) return 'FaFigma';
  if (n.includes('canva')) return 'SiCanva';

  return null;
}

/** @deprecated alias — utiliser getSkillReactIcon */
export function getSkillIconComponent(
  iconKey?: string | null,
  skillName?: string | null
): IconType {
  return getSkillReactIcon(iconKey, skillName);
}

/** Anciennes valeurs Lucide → react-icons. */
const LEGACY_ICON_ALIASES: Record<string, string> = {
  Code2: 'FaCode',
  Github: 'FaGithub',
  Database: 'SiMysql',
  Smartphone: 'TbBrandReactNative',
  Palette: 'FaFigma',
  ShoppingCart: 'SiWordpress',
};

export function getSkillReactIcon(
  iconKey?: string | null,
  skillName?: string | null
): IconType {
  const key = iconKey?.trim();
  if (key && key in SKILL_REACT_ICON_MAP) {
    return SKILL_REACT_ICON_MAP[key];
  }
  if (key && key in LEGACY_ICON_ALIASES) {
    const mapped = LEGACY_ICON_ALIASES[key];
    return SKILL_REACT_ICON_MAP[mapped] ?? FaCode;
  }
  if (skillName) {
    const inferred = inferSkillIconKeyFromName(skillName);
    if (inferred && inferred in SKILL_REACT_ICON_MAP) {
      return SKILL_REACT_ICON_MAP[inferred];
    }
  }
  return FaCode;
}

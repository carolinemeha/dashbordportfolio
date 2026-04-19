import { supabase } from './supabase';
import {
  normalizeAdminPreferences,
  type AdminPreferencesV1,
} from './admin-preferences';

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
  title: string;
  description: string;
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

function projectInsertPayload(project: Omit<Project, 'id'>) {
  const demo = project.demo?.trim() || null;
  const github = project.github?.trim() || null;
  return {
    title: project.title,
    description: project.description,
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
  if (updates.title !== undefined) out.title = updates.title;
  if (updates.description !== undefined) out.description = updates.description;
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
  company: string;
  position: string;
  location?: string;
  duration: string;
  achievements: string[];
  skills: string[];
}

export interface Skill {
  id: string;
  name: string;
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
    name: String(row.name ?? ''),
    level: typeof row.level === 'number' ? row.level : 0,
    category: (cat && valid.includes(cat as Skill['category'])
      ? cat
      : 'Frontend') as Skill['category'],
    iconName:
      typeof row.icon_name === 'string' && row.icon_name ? row.icon_name : '',
  };
}

function skillToDbPayload(skill: Partial<Skill>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (skill.name !== undefined) out.name = skill.name;
  if (skill.level !== undefined) out.level = skill.level;
  if (skill.category !== undefined) out.category = skill.category;
  if (skill.iconName !== undefined) out.icon_name = skill.iconName?.trim() || null;
  return out;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon?: string;
  iconName?: string;
  category: string;
  features: string[];
  technologies?: Array<{icon?: string; name: string}>;
  pricing?: {
    basic?: string;
    standard?: string;
    premium?: string;
  };
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credential?: string;
}

export interface AboutInfo {
  name: string;
  title: string;
  bio: string;
  avatar: string;
  roles?: string[];
  location: string;
  timezone?: string;
  availableStatus?: string;
  email: string;
  phone: string;
  experience?: string;
  nationality?: string;
  shopUrl?: string;
  freelanceStatus?: string;
  languages?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
  cvUrl?: string;
  /** Pastille au-dessus du titre (page d’accueil vitrine) */
  heroBadge?: string;
  /** Ligne « Disponible » sur l’accueil */
  homeAvailableTitle?: string;
  /** Sous-ligne sous la disponibilité */
  homeAvailableSubtitle?: string;
  homeStatYears?: number;
  homeStatProjects?: number;
  homeStatClients?: number;
  homeStatSatisfaction?: number;
  whatsappUrl?: string;
  telegramUrl?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  duration: string;
  courses: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
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
export let projects: Project[] = [
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

export let experiences: Experience[] = [
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

export let skills: Skill[] = [
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

export let services: Service[] = [
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

export let certifications: Certification[] = [
  { id: '1', title: 'Certification UX/UI Avancé', issuer: 'Figma', date: '2023', credential: 'VF-123456' },
  { id: '2', title: 'Développement Fullstack JavaScript', issuer: 'OpenClassrooms', date: '2022', credential: 'OC-789012' },
  { id: '3', title: 'Attestation de confection de sac en canevas', issuer: 'Formation Artisanale', date: '2025', credential: '' },
  { id: '4', title: 'Attestation de confection de sac (avec et sans carton) et accessoires', issuer: 'Formation Artisanale', date: '2025', credential: '' }
];

export let aboutInfo: AboutInfo = {
  name: "Gbènami Caroline MEHA",
  title: "Développeur Fullstack & Design UX/UI",
  bio: "Professionnelle polyvalente alliant expertise technique, vision commerciale et transmission de savoir. Experte autodidacte en design graphique et UX/UI design, je possède également un solide bagage en Marketing Communication et Commerce. Je conçois des visuels publicitaires percutants et des interfaces utilisateur intuitives, tout en apportant une dimension stratégique à chaque projet. Par ailleurs, je transmets mon expertise en tant que formatrice spécialisée dans la confection de sacs et d'accessoires artisanaux, alliant créativité et rigueur technique. Passionnée par le développement web et mobile, je transforme les besoins complexes en solutions digitales performantes.",
  avatar: "/assets/avatar.jpeg",
  location: "Bénin",
  email: "caroline.meha1@gmail.com",
  phone: "(+229) 01 95 23 21 83 / 01 96 29 05 28",
  experience: "8+ Ans",
  nationality: "Béninoise",
  shopUrl: "https://gcmuniverse.vercel.app/",
  freelanceStatus: "Disponible",
  languages: "Fon, Français, Anglais",
  github: "https://github.com/carolinemeha",
  linkedin: "https://linkedin.com/in/caroline-meha",
  twitter: "https://x.com/CarolineMeha",
  youtube: "https://www.youtube.com/@carolinemeha",
  website: "https://caroline-ten.vercel.app/",
  roles: ["Développeur Fullstack", "UI/UX Designer", "Formatrice Artisanale"],
  timezone: "UTC+1 (WAT)",
  availableStatus: "Disponible pour de nouveaux projets",
  cvUrl: "/assets/CV.pdf",
  heroBadge: "Caroline Meha",
  homeAvailableTitle: "Disponible",
  homeAvailableSubtitle: "Pour de nouveaux projets",
  homeStatYears: 8,
  homeStatProjects: 15,
  homeStatClients: 12,
  homeStatSatisfaction: 100,
  whatsappUrl: "https://wa.me/2290196290528",
  telegramUrl: "https://t.me/carolinemeha",
};

export let education: Education[] = [
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

export let testimonials: Testimonial[] = [
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
    
    return data.map(p => ({
      ...p,
      demo: p.demo_url,
      github: p.github_url
    }));
  },

  async getProject(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) return null;
    return { ...data, demo: data.demo_url, github: data.github_url };
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
    return { ...data, demo: data.demo_url, github: data.github_url };
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
    return { ...data, demo: data.demo_url, github: data.github_url };
  },

  async deleteProject(id: string): Promise<boolean> {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    return !error;
  },

  // Experiences
  async getExperiences(): Promise<Experience[]> {
    const { data, error } = await supabase.from('experiences').select('*').order('created_at', { ascending: false });
    return error ? [] : data;
  },

  async getExperience(id: string): Promise<Experience | null> {
    const { data, error } = await supabase.from('experiences').select('*').eq('id', id).maybeSingle();
    if (error) return null;
    return data;
  },

  async createExperience(experience: Omit<Experience, 'id'>): Promise<Experience | null> {
    const { data, error } = await supabase.from('experiences').insert(experience).select().maybeSingle();
    if (error) return null;
    return data;
  },

  async updateExperience(id: string, updates: Partial<Experience>): Promise<Experience | null> {
    const { data, error } = await supabase.from('experiences').update(updates).eq('id', id).select().maybeSingle();
    if (error) return null;
    return data;
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
        name: skill.name,
        level: skill.level ?? 0,
        category: skill.category,
        icon_name: skill.iconName?.trim() || null,
      })
      .select()
      .maybeSingle();
    if (error) return null;
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
    if (error) return null;
    return data ? mapSkillFromRow(data as Record<string, unknown>) : null;
  },

  async deleteSkill(id: string): Promise<boolean> {
    const { error } = await supabase.from('skills').delete().eq('id', id);
    return !error;
  },

  // Services
  async getServices(): Promise<Service[]> {
    const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: true });
    if (error) return [];
    return data.map(s => ({
      ...s,
      iconName: s.icon_name,
      technologies: (s.technologies || []).map((t: string) => {
        try {
          return JSON.parse(t);
        } catch (e) {
          return { name: t };
        }
      })
    }));
  },

  async createService(service: Omit<Service, 'id'>): Promise<Service | null> {
    const { data, error } = await supabase.from('services').insert({
      title: service.title,
      description: service.description,
      features: service.features,
      pricing: service.pricing,
      category: service.category,
      icon_name: service.iconName,
      technologies: (service.technologies || []).map(t => typeof t === 'string' ? t : JSON.stringify(t))
    }).select().maybeSingle();
    if (error) {
      console.error('Erreur createService:', error);
      return null;
    }
    return { 
      ...data, 
      iconName: data.icon_name,
      technologies: (data.technologies || []).map((t: string) => {
        try {
          return JSON.parse(t);
        } catch (e) {
          return { name: t };
        }
      })
    };
  },

  async updateService(id: string, updates: Partial<Service>): Promise<Service | null> {
    const mappedUpdates: any = { ...updates };
    if (mappedUpdates.iconName !== undefined) {
      mappedUpdates.icon_name = mappedUpdates.iconName;
      delete mappedUpdates.iconName;
    }
    if (updates.technologies) {
      mappedUpdates.technologies = updates.technologies.map(t => typeof t === 'string' ? t : JSON.stringify(t));
    }

    const { data, error } = await supabase.from('services').update(mappedUpdates).eq('id', id).select().maybeSingle();
    if (error) {
      console.error('Erreur updateService:', error);
      return null;
    }
    return { 
      ...data, 
      iconName: data.icon_name,
      technologies: (data.technologies || []).map((t: string) => {
        try {
          return JSON.parse(t);
        } catch (e) {
          return { name: t };
        }
      })
    };
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

      const asInt = (v: unknown): number | undefined => {
        if (v == null) return undefined;
        if (typeof v === 'number' && !Number.isNaN(v)) return v;
        const n = parseInt(String(v), 10);
        return Number.isNaN(n) ? undefined : n;
      };

      return {
        ...data,
        shopUrl: data.shop_url,
        freelanceStatus: data.freelance_status,
        availableStatus: data.available_status,
        cvUrl: data.cv_url,
        languages: data.languages,
        nationality: data.nationality,
        roles: data.roles || [],
        timezone: data.timezone,
        heroBadge:
          data.hero_badge != null && String(data.hero_badge).trim() !== ''
            ? String(data.hero_badge).trim()
            : '',
        homeAvailableTitle:
          data.home_available_title != null &&
          String(data.home_available_title).trim() !== ''
            ? String(data.home_available_title).trim()
            : '',
        homeAvailableSubtitle:
          data.home_available_subtitle != null &&
          String(data.home_available_subtitle).trim() !== ''
            ? String(data.home_available_subtitle).trim()
            : '',
        homeStatYears: asInt(data.home_stat_years),
        homeStatProjects: asInt(data.home_stat_projects),
        homeStatClients: asInt(data.home_stat_clients),
        homeStatSatisfaction: asInt(data.home_stat_satisfaction),
        whatsappUrl: data.whatsapp_url ?? '',
        telegramUrl: data.telegram_url ?? '',
      };
    } catch (e) {
      console.error('Unexpected error in getAboutInfo:', e);
      return aboutInfo;
    }
  },

  async updateAboutInfo(updates: Partial<AboutInfo>): Promise<AboutInfo | null> {
    const {
      shopUrl,
      freelanceStatus,
      availableStatus,
      cvUrl,
      heroBadge,
      homeAvailableTitle,
      homeAvailableSubtitle,
      homeStatYears,
      homeStatProjects,
      homeStatClients,
      homeStatSatisfaction,
      whatsappUrl,
      telegramUrl,
      ...rest
    } = updates;
    const dbPayload: Record<string, unknown> = { ...rest };
    if (shopUrl !== undefined) dbPayload.shop_url = shopUrl;
    if (freelanceStatus !== undefined) dbPayload.freelance_status = freelanceStatus;
    if (availableStatus !== undefined) dbPayload.available_status = availableStatus;
    if (cvUrl !== undefined) dbPayload.cv_url = cvUrl;
    if (heroBadge !== undefined) dbPayload.hero_badge = heroBadge?.trim() || null;
    if (homeAvailableTitle !== undefined)
      dbPayload.home_available_title = homeAvailableTitle?.trim() || null;
    if (homeAvailableSubtitle !== undefined)
      dbPayload.home_available_subtitle = homeAvailableSubtitle?.trim() || null;
    if (homeStatYears !== undefined) dbPayload.home_stat_years = homeStatYears;
    if (homeStatProjects !== undefined)
      dbPayload.home_stat_projects = homeStatProjects;
    if (homeStatClients !== undefined)
      dbPayload.home_stat_clients = homeStatClients;
    if (homeStatSatisfaction !== undefined)
      dbPayload.home_stat_satisfaction = homeStatSatisfaction;
    if (whatsappUrl !== undefined)
      dbPayload.whatsapp_url = whatsappUrl?.trim() || null;
    if (telegramUrl !== undefined)
      dbPayload.telegram_url = telegramUrl?.trim() || null;
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

    return {
      ...data,
      shopUrl: data.shop_url,
      freelanceStatus: data.freelance_status,
      availableStatus: data.available_status,
      cvUrl: data.cv_url,
      heroBadge: data.hero_badge ?? '',
      homeAvailableTitle: data.home_available_title ?? '',
      homeAvailableSubtitle: data.home_available_subtitle ?? '',
      homeStatYears:
        typeof data.home_stat_years === 'number'
          ? data.home_stat_years
          : undefined,
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
      whatsappUrl: data.whatsapp_url ?? '',
      telegramUrl: data.telegram_url ?? '',
    };
  },

  // Education
  async getEducation(): Promise<Education[]> {
    const { data, error } = await supabase.from('education').select('*').order('duration', { ascending: false });
    return error ? [] : data;
  },

  async createEducation(education: Omit<Education, 'id'>): Promise<Education | null> {
    const { data, error } = await supabase.from('education').insert(education).select().maybeSingle();
    if (error) return null;
    return data;
  },

  async updateEducation(id: string, updates: Partial<Education>): Promise<Education | null> {
    const { data, error } = await supabase.from('education').update(updates).eq('id', id).select().maybeSingle();
    if (error) return null;
    return data;
  },

  async deleteEducation(id: string): Promise<boolean> {
    const { error } = await supabase.from('education').delete().eq('id', id);
    return !error;
  },

  // Testimonials
  async getTestimonials(): Promise<Testimonial[]> {
    const { data, error } = await supabase.from('testimonials').select('*').order('date', { ascending: false });
    if (error || !data) return [];
    return data.map((row) => ({
      ...row,
      avatar: normalizeTestimonialAvatarUrl(row.avatar),
    }));
  },

  async createTestimonial(testimonial: Omit<Testimonial, 'id'>): Promise<Testimonial | null> {
    const payload = {
      ...testimonial,
      avatar: normalizeTestimonialAvatarUrl(testimonial.avatar),
    };
    const { data, error } = await supabase.from('testimonials').insert(payload).select().maybeSingle();
    if (error) return null;
    return data
      ? { ...data, avatar: normalizeTestimonialAvatarUrl(data.avatar) }
      : null;
  },

  async updateTestimonial(id: string, updates: Partial<Testimonial>): Promise<Testimonial | null> {
    const payload = { ...updates };
    if ('avatar' in payload && payload.avatar !== undefined) {
      payload.avatar = normalizeTestimonialAvatarUrl(payload.avatar);
    }
    const { data, error } = await supabase.from('testimonials').update(payload).eq('id', id).select().maybeSingle();
    if (error) return null;
    return data
      ? { ...data, avatar: normalizeTestimonialAvatarUrl(data.avatar) }
      : null;
  },

  async deleteTestimonial(id: string): Promise<boolean> {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    return !error;
  },

  // Certifications
  async getCertifications(): Promise<Certification[]> {
    const { data, error } = await supabase.from('certifications').select('*').order('date', { ascending: false });
    return error ? [] : data;
  },

  async createCertification(cert: Omit<Certification, 'id'>): Promise<Certification | null> {
    const { data, error } = await supabase.from('certifications').insert(cert).select().maybeSingle();
    if (error) return null;
    return data;
  },

  async updateCertification(id: string, updates: Partial<Certification>): Promise<Certification | null> {
    const { data, error } = await supabase.from('certifications').update(updates).eq('id', id).select().maybeSingle();
    if (error) return null;
    return data;
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
      activity.push({
        id: latestProject.id,
        type: 'project',
        subtitle: latestProject.title,
        date: latestProject.created_at,
      });
    }

    if (latestSkill) {
      const d = latestSkill.updated_at || latestSkill.created_at;
      if (d) {
        activity.push({
          id: latestSkill.id,
          type: 'skill',
          subtitle: latestSkill.name,
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
      activity.push({
        id: latestExp.id,
        type: 'experience',
        subtitle: `${latestExp.position} — ${latestExp.company}`,
        date: latestExp.created_at,
      });
    }

    if (latestEdu?.created_at) {
      activity.push({
        id: latestEdu.id,
        type: 'education',
        subtitle: `${latestEdu.degree} — ${latestEdu.institution}`,
        date: latestEdu.created_at,
      });
    }

    if (latestTesti?.created_at) {
      activity.push({
        id: latestTesti.id,
        type: 'testimonial',
        subtitle: latestTesti.name,
        date: latestTesti.created_at,
      });
    }

    if (latestService?.created_at) {
      activity.push({
        id: latestService.id,
        type: 'service',
        subtitle: latestService.title,
        date: latestService.created_at,
      });
    }

    return activity
      .filter((a) => a.date && !Number.isNaN(new Date(a.date).getTime()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  }
};
import { Code, Languages, Users, Wrench, Layout, Server } from 'lucide-react';

export const categories = [
  {
    value: 'Frontend',
    label: 'Frontend',
    icon: Layout
  },
  {
    value: 'Backend',
    label: 'Backend',
    icon: Server
  },
  {
    value: 'Tools',
    label: 'Outils',
    icon: Wrench
  },
  {
    value: 'Design',
    label: 'Design',
    icon: Code // Ou une icône plus appropriée pour le design
  }
] as const;

export const levels = [
  {
    value: 'beginner',
    label: 'Débutant'
  },
  {
    value: 'intermediate',
    label: 'Intermédiaire'
  },
  {
    value: 'advanced',
    label: 'Avancé'
  },
  {
    value: 'expert',
    label: 'Expert'
  }
] as const;
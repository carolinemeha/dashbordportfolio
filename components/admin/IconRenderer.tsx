'use client';

import * as FaIcons from 'react-icons/fa';
import * as SiIcons from 'react-icons/si';
import { LucideIcon, Zap } from 'lucide-react';

interface IconRendererProps {
  iconName?: string;
  className?: string;
  fallback?: any;
}

export default function IconRenderer({ iconName, className, fallback: Fallback = Zap }: IconRendererProps) {
  if (!iconName) return <Fallback className={className} />;

  let name = iconName.trim();

  // Correction intelligente du préfixe si manquant
  if (!name.toLowerCase().startsWith('fa') && !name.toLowerCase().startsWith('si')) {
    // On met en majuscule la première lettre
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    
    // On teste Si d'abord
    if ((SiIcons as any)['Si' + capitalized]) {
      name = 'Si' + capitalized;
    } else if ((FaIcons as any)['Fa' + capitalized]) {
      name = 'Fa' + capitalized;
    } else {
      name = 'Si' + capitalized; // Fallback par défaut
    }
  } else {
    // Si l'utilisateur met "sisupabase", on corrige la casse en "SiSupabase"
    if (name.toLowerCase().startsWith('si') && name.charAt(0) !== 'S') {
      name = 'Si' + name.charAt(2).toUpperCase() + name.slice(3);
    } else if (name.toLowerCase().startsWith('fa') && name.charAt(0) !== 'F') {
      name = 'Fa' + name.charAt(2).toUpperCase() + name.slice(3);
    }
  }

  // Try to find in SimpleIcons
  if (name.startsWith('Si') && (SiIcons as any)[name]) {
    const Icon = (SiIcons as any)[name];
    return <Icon className={className} />;
  }

  // Try to find in FontAwesome
  if (name.startsWith('Fa') && (FaIcons as any)[name]) {
    const Icon = (FaIcons as any)[name];
    return <Icon className={className} />;
  }

  return <Fallback className={className} />;
}

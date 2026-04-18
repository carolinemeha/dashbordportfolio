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

  // Try to find in FontAwesome
  if (iconName.startsWith('Fa') && (FaIcons as any)[iconName]) {
    const Icon = (FaIcons as any)[iconName];
    return <Icon className={className} />;
  }

  // Try to find in SimpleIcons
  if (iconName.startsWith('Si') && (SiIcons as any)[iconName]) {
    const Icon = (SiIcons as any)[iconName];
    return <Icon className={className} />;
  }

  return <Fallback className={className} />;
}

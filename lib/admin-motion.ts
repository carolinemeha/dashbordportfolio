import type { Variants } from 'framer-motion';

/**
 * Variantes sans opacity:0 en « hidden » : si l’hydratation Framer échoue
 * (chunks /_next 404, etc.), le contenu reste lisible au lieu d’un écran vide.
 * Utiliser initial={false} sur le motion parent pour sauter l’entrée au premier rendu.
 */
export const adminStaggerContainer: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

/** Élément de liste sans sortie animée */
export const adminStaggerItem: Variants = {
  hidden: { opacity: 1, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 26 },
  },
};

/** Élément avec sortie (AnimatePresence) */
export const adminStaggerItemExit: Variants = {
  hidden: { opacity: 1, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 26 },
  },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2 } },
};

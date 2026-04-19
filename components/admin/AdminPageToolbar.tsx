'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type AdminPageToolbarProps = {
  children?: React.ReactNode;
  className?: string;
};

/**
 * Barre d’actions sous l’en-tête global (titre + description viennent du Header).
 */
export function AdminPageToolbar({ children, className }: AdminPageToolbarProps) {
  if (children == null) return null;

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pb-6',
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-stretch sm:justify-end gap-2 w-full sm:w-auto">
        {children}
      </div>
    </motion.div>
  );
}

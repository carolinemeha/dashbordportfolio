'use client';

import { getStoredUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Menu, UserCircle } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { motion } from 'framer-motion';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const user = getStoredUser();

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-10 glass border-b border-border/50 shadow-sm w-full"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="md:hidden mr-2 text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h2 className="hidden sm:block text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Administration
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {user && (
              <div className="flex items-center pl-4 border-l border-border/50">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center mr-3 border border-primary/20">
                  <UserCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="hidden sm:flex flex-col items-start leading-none">
                  <span className="text-sm font-medium text-foreground">{user.name}</span>
                  <span className="text-xs text-muted-foreground mt-1">Administrateur</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
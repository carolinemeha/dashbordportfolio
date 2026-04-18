'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  LogOut
} from 'lucide-react';
import { removeUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Projets', href: '/admin/projects', icon: FolderOpen },
  { name: 'Expériences', href: '/admin/experiences', icon: Briefcase },
  { name: 'Compétences', href: '/admin/skills', icon: Wrench },
  { name: 'Services', href: '/admin/services', icon: Settings },
  { name: 'À propos', href: '/admin/about', icon: User },
  { name: 'CV', href: '/admin/cv', icon: FileText },
  { name: 'Éducation', href: '/admin/education', icon: GraduationCap },
  { name: 'Témoignages', href: '/admin/testimonials', icon: MessageSquare },
  { name: 'Messages', href: '/admin/contact', icon: Mail },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    removeUser();
    window.location.href = '/admin/login';
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20">
      <div className="flex-1 flex flex-col min-h-0 glass-card rounded-none border-y-0 border-l-0">
        <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto no-scrollbar">
          <div className="flex items-center flex-shrink-0 px-6 mb-6">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center mr-3">
               <Settings className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Admin
            </h1>
          </div>
          <nav className="flex-1 px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary/10 rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <item.icon 
                    className={`mr-3 h-5 w-5 flex-shrink-0 z-10 transition-colors duration-200 ${
                      isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                    }`} 
                  />
                  <span className="z-10">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-border/50 p-4">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Déconnexion
          </Button>
        </div>
      </div>
    </div>
  );
}
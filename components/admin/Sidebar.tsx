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
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 bg-gray-800">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-white">Portfolio Admin</h1>
          </div>
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </div>
    </div>
  );
}
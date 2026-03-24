'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, FolderOpen, Briefcase, Wrench,
  Settings, User, FileText, GraduationCap,
  MessageSquare, Mail, LogOut, ChevronRight
} from 'lucide-react'
import { removeUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

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
  { name: 'Messages', href: '/admin/contact', icon: Mail, badge: 0 },
]

export default function Sidebar() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  const handleLogout = () => {
    removeUser()
    window.location.href = '/admin/login'
  }

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-background"
    >
      <div className="flex-1 flex flex-col min-h-0">
        {/* Logo */}
        <div className="px-6 py-5 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <motion.div
                key={item.name}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-all",
                    isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary/20'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <div className="flex items-center">
                    <item.icon className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                      isActive 
                        ? 'text-primary' 
                        : 'text-muted-foreground group-hover:text-accent-foreground'
                    )} />
                    {item.name}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary dark:bg-primary/30">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className={cn(
                      "h-4 w-4 transition-all",
                      isActive 
                        ? 'text-primary' 
                        : 'text-transparent group-hover:text-muted-foreground'
                    )} />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* Footer avec déconnexion */}
        <div className="mt-auto px-3 py-4 border-t border-border space-y-2">
  <Button
    variant="ghost"
    size="sm"
    className="w-full justify-start text-muted-foreground hover:text-foreground"
    asChild
  >
    <Link href="/admin/settings" className="flex items-center gap-2">
      <Settings className="h-4 w-4" />
      Paramètres
    </Link>
  </Button>

  <Button
    onClick={handleLogout}
    variant="ghost"
    size="sm"
    className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
  >
    <LogOut className="h-4 w-4 mr-2" />
    Déconnexion
  </Button>
</div>
      </div>
    </motion.div>
  )
}
'use client'

import { getStoredUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Menu, User, Bell, Search, HelpCircle } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

interface User {
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'editor'
}

interface HeaderProps {
  onMenuClick?: () => void
  className?: string
  notificationCount?: number
}

export default function Header({ 
  onMenuClick, 
  className,
  notificationCount = 0
}: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const user = getStoredUser()
  const pathname = usePathname()

  // Mapping des routes aux titres
  const routeTitles = {
    dashboard: 'Tableau de bord',
    projects: 'Projets',
    education: 'Formation',
    experiences: 'Expériences',
    services: 'Services',
    skills: 'Compétences',
    about: 'À Propos',
    cv: 'CV',
    testimonials: 'Témoignages',
    settings: 'Paramètres',
    messages: 'Messages',
    analytics: 'Analytiques'
  }

  const getPageTitle = () => {
    const routeKey = Object.keys(routeTitles).find(key => 
      pathname.includes(key)
    )
    return routeKey ? routeTitles[routeKey as keyof typeof routeTitles] : 'Administration'
  }

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
      className
    )}>
      <div className="container flex h-16 items-center px-4">
        {/* Bouton menu mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Titre principal avec breadcrumbs */}
        <div className="flex flex-1 items-center gap-2">
          <h1 className="text-lg font-semibold md:text-xl text-foreground">
            {getPageTitle()}
          </h1>
          <nav className="hidden md:flex items-center text-sm text-muted-foreground">
            <span className="mx-2">/</span>
            <Link href="/admin/dashboard" className="hover:text-primary">
              Dashboard
            </Link>
          </nav>
        </div>

        {/* Contrôles côté droit */}
        <div className="flex items-center gap-3">
          {/* Barre de recherche */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-10 w-[200px] lg:w-[300px] bg-background"
            />
          </div>

          {/* Bouton recherche mobile */}
          <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-foreground">
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground">
                {notificationCount}
              </span>
            )}
          </Button>

          {/* Aide */}
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" asChild>
            <Link href="/admin/help">
              <HelpCircle className="h-5 w-5" />
            </Link>
          </Button>

          {/* Thème */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          
          {/* Profil utilisateur */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-background border-border"
              >
                <DropdownMenuItem className="flex flex-col items-start hover:bg-muted">
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-muted">
                  <Link href="/admin/profile" className="w-full text-foreground">
                    Mon profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-muted">
                  <Link href="/admin/settings" className="w-full text-foreground">
                    Paramètres
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive hover:bg-muted"
                  onClick={() => {
                    // Logique de déconnexion
                    window.location.href = '/admin/login'
                  }}
                >
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/login">Se connecter</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dataService, Project } from '@/lib/data';
import { 
  FolderOpen, Briefcase, Wrench, Mail, Clock, TrendingUp, Eye, Users,
  Plus, Edit, MessageCircle, ArrowRight, Calendar, FileText, PieChart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from 'next-themes';

interface DashboardStats {
  projects: number;
  experiences: number;
  skills: number;
  messages: number;
  newMessages: number;
  completion: number;
}

interface Activity {
  type: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  date: string;
}

interface Metric {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  chart?: boolean;
}

interface StatCard {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  link: string;
  color: string;
  bgColor: string;
  trend?: string;
  badge?: string | null;
}

const chartData = [
  { name: 'Jan', uv: 4000 },
  { name: 'Fév', uv: 3000 },
  { name: 'Mar', uv: 5000 },
  { name: 'Avr', uv: 2780 },
  { name: 'Mai', uv: 1890 },
  { name: 'Juin', uv: 2390 },
];

const trafficData = [
  { name: 'Jan', direct: 4000, social: 2400, search: 2400 },
  { name: 'Fév', direct: 3000, social: 1398, search: 2210 },
  { name: 'Mar', direct: 2000, social: 9800, search: 2290 },
  { name: 'Avr', direct: 2780, social: 3908, search: 2000 },
  { name: 'Mai', direct: 1890, social: 4800, search: 2181 },
  { name: 'Juin', direct: 2390, social: 3800, search: 2500 },
];

const activities: Activity[] = [
  {
    type: 'Projet ajouté',
    title: 'E-commerce Platform',
    icon: Plus,
    iconColor: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    date: '2024-03-15'
  },
  {
    type: 'Compétence mise à jour',
    title: 'React (niveau 5)',
    icon: Edit,
    iconColor: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
    date: '2024-03-10'
  },
  {
    type: 'Nouveau message',
    title: 'Demande de projet',
    icon: MessageCircle,
    iconColor: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
    date: '2024-03-12'
  }
];

const metrics: Metric[] = [
  {
    title: 'Vues cette semaine',
    value: '1,234',
    change: '+12%',
    icon: Eye,
    color: 'text-blue-500',
    chart: true
  },
  {
    title: 'Téléchargements CV',
    value: '56',
    change: '+5%',
    icon: FileText,
    color: 'text-green-500'
  },
  {
    title: 'Visiteurs uniques',
    value: '892',
    change: '+8%',
    icon: Users,
    color: 'text-purple-500'
  }
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-4 rounded-lg shadow-lg">
        <p className="font-bold">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="flex items-center" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { theme } = useTheme();
  
const [stats, setStats] = useState({
  projects: 0,
  experiences: 0,
  skills: 0,
  messages: 0,
  newMessages: 0,
  completion: 0
});
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [projects, experiences, skills, messages] = await Promise.all([
        dataService.getProjects(),
        dataService.getExperiences(),
        dataService.getSkills(), // Maintenant disponible
        dataService.getContactMessages()
      ]);

      const newMessages = messages.filter(m => m.status === 'new');
      
      setStats({
        projects: projects.length,
        experiences: experiences.length,
        skills: skills.length,
        messages: messages.length,
        newMessages: newMessages.length,
        completion: calculateCompletion(projects, experiences, skills)
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  loadData();
}, []);

  function calculateCompletion(projects: Project[], experiences: any[], skills: any[]): number {
    const totalItems = projects.length + experiences.length + (skills?.length || 0);
    if (totalItems === 0) return 0;
    
    const completedItems = 
      projects.filter(p => p.status === 'published').length + 
      experiences.length + 
      (skills?.length || 0);
      
    return Math.round((completedItems / totalItems) * 100);
  }

  const statCards: StatCard[] = useMemo(() => [
    {
      title: 'Projets',
      value: stats.projects,
      icon: FolderOpen,
      link: '/admin/projects',
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      trend: stats.projects > 0 ? 'up' : undefined
    },
    {
      title: 'Expériences',
      value: stats.experiences,
      icon: Briefcase,
      link: '/admin/experiences',
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      title: 'Compétences',
      value: stats.skills,
      icon: Wrench,
      link: '/admin/skills',
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      title: 'Messages',
      value: stats.messages,
      icon: Mail,
      link: '/admin/messages',
      color: stats.newMessages > 0 ? 'text-red-500' : 'text-gray-500',
      bgColor: stats.newMessages > 0 
        ? 'bg-red-100 dark:bg-red-900/30' 
        : 'bg-gray-100 dark:bg-gray-800',
      badge: stats.newMessages > 0 ? `${stats.newMessages} nouveau(x)` : null
    }
  ], [stats]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-6">
            <p className="text-red-600 dark:text-red-300">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4 text-red-600 dark:text-red-300"
              onClick={() => window.location.reload()}
            >
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 dark:bg-background">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight"
          >
            Tableau de bord
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </motion.p>
        </div>

        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
          >
            Vue d'ensemble
          </Button>
          <Button 
            variant={activeTab === 'analytics' ? 'default' : 'outline'}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </Button>
        </div>
      </div>

      {/* Completion Progress */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-border/20 bg-background">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Complétion du portfolio</h3>
                <p className="text-sm text-muted-foreground">
                  {stats.completion}% complet - {stats.completion < 80 ? 'Peut être amélioré' : 'Excellent travail!'}
                </p>
              </div>
              <Progress value={stats.completion} className="h-2 md:w-1/2" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="border-border/20 hover:border-primary/20 transition-colors group bg-background">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    {stat.badge && (
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300">
                        {stat.badge}
                      </span>
                    )}
                    {stat.trend && (
                      <span className="text-xs text-green-500 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" /> +12%
                      </span>
                    )}
                  </div>
                  <div className={cn(
                    "p-3 rounded-lg group-hover:bg-primary/10 transition-colors",
                    stat.bgColor
                  )}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-4 px-0 text-muted-foreground hover:text-primary group"
                  asChild
                >
                  <Link href={stat.link} className="flex items-center gap-1">
                    Voir détails
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="border-border/20 lg:col-span-2 bg-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4 group"
                >
                  <div className={cn(
                    "p-2 rounded-full mt-1 flex-shrink-0 group-hover:scale-110 transition-transform",
                    activity.iconColor
                  )}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.type}</p>
                    <p className="text-sm text-muted-foreground">{activity.title}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(new Date(activity.date), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Site Metrics */}
        <Card className="border-border/20 bg-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Statistiques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {metrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <metric.icon className={cn("h-5 w-5", metric.color)} />
                    <span className="text-sm font-medium">{metric.title}</span>
                  </div>
                  <span className={cn(
                    "text-sm font-medium",
                    metric.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
                  )}>{metric.change}</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className={cn(
                    "text-2xl font-bold",
                    metric.color
                  )}>{metric.value}</span>
                  {metric.chart && (
                    <div className="h-10 w-20">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <Line 
                            type="monotone" 
                            dataKey="uv" 
                            stroke="#3b82f6" 
                            strokeWidth={2} 
                            dot={false} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      {activeTab === 'analytics' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          <Card className="border-border/20 bg-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Sources de trafic
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trafficData}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#888888"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#888888"
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="direct" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      dot={false} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="social" 
                      stroke="#8b5cf6" 
                      strokeWidth={2} 
                      dot={false} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="search" 
                      stroke="#10b981" 
                      strokeWidth={2} 
                      dot={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/20 bg-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Activité mensuelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#888888"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#888888"
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="uv" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
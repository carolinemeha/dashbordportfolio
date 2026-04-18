'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dataService } from '@/lib/data';
import { 
  FolderOpen, 
  Briefcase, 
  Wrench, 
  Settings, 
  GraduationCap, 
  MessageSquare, 
  Mail,
  TrendingUp,
  Users,
  Eye,
  Clock,
  Plus,
  Edit,
  MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function DashboardPage() {
  const [stats, setStats] = useState({
    projects: 0,
    experiences: 0,
    skills: 0,
    services: 0,
    education: 0,
    testimonials: 0,
    messages: 0,
    newMessages: 0
  });

  useEffect(() => {
    // Load stats
    const projects = dataService.getProjects();
    const experiences = dataService.getExperiences();
    const skills = dataService.getSkills();
    const services = dataService.getServices();
    const education = dataService.getEducation();
    const testimonials = dataService.getTestimonials();
    const messages = dataService.getContactMessages();
    const newMessages = messages.filter(m => m.status === 'new');

    setStats({
      projects: projects.length,
      experiences: experiences.length,
      skills: skills.length,
      services: services.length,
      education: education.length,
      testimonials: testimonials.length,
      messages: messages.length,
      newMessages: newMessages.length
    });
  }, []);

  const statCards = [
    {
      title: 'Projets',
      value: stats.projects,
      icon: FolderOpen,
      description: 'Projets portfolio',
      color: 'text-blue-500',
      bgIcon: 'bg-blue-500/10'
    },
    {
      title: 'Expériences',
      value: stats.experiences,
      icon: Briefcase,
      description: 'Expériences professionnelles',
      color: 'text-emerald-500',
      bgIcon: 'bg-emerald-500/10'
    },
    {
      title: 'Compétences',
      value: stats.skills,
      icon: Wrench,
      description: 'Compétences techniques',
      color: 'text-violet-500',
      bgIcon: 'bg-violet-500/10'
    },
    {
      title: 'Services',
      value: stats.services,
      icon: Settings,
      description: 'Services proposés',
      color: 'text-orange-500',
      bgIcon: 'bg-orange-500/10'
    },
    {
      title: 'Éducation',
      value: stats.education,
      icon: GraduationCap,
      description: 'Formations et diplômes',
      color: 'text-indigo-500',
      bgIcon: 'bg-indigo-500/10'
    },
    {
      title: 'Témoignages',
      value: stats.testimonials,
      icon: MessageSquare,
      description: 'Avis clients',
      color: 'text-pink-500',
      bgIcon: 'bg-pink-500/10'
    },
    {
      title: 'Messages',
      value: stats.messages,
      icon: Mail,
      description: `${stats.newMessages} nouveau(x)`,
      color: stats.newMessages > 0 ? 'text-rose-500' : 'text-gray-500',
      bgIcon: stats.newMessages > 0 ? 'bg-rose-500/10' : 'bg-gray-500/10'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent"
        >
          Vue d'ensemble
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-2 text-sm text-muted-foreground"
        >
          Bienvenue sur votre tableau de bord
        </motion.p>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {statCards.map((stat, index) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="glass-card border-none hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-xl ${stat.bgIcon}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Activity & Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-blue-500" />
              Activité récente
            </CardTitle>
            <CardDescription>
              Dernières modifications apportées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-blue-500/10 rounded-full">
                  <Plus className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Projet ajouté</p>
                  <p className="text-sm text-muted-foreground">E-commerce Platform</p>
                  <p className="text-xs text-muted-foreground/50 mt-1">
                    {formatDistanceToNow(new Date('2024-03-15'), { addSuffix: true, locale: fr })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-emerald-500/10 rounded-full">
                  <Edit className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Compétence mise à jour</p>
                  <p className="text-sm text-muted-foreground">React (niveau 5)</p>
                  <p className="text-xs text-muted-foreground/50 mt-1">
                    {formatDistanceToNow(new Date('2024-03-10'), { addSuffix: true, locale: fr })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-violet-500/10 rounded-full">
                  <MessageCircle className="h-4 w-4 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Nouveau message</p>
                  <p className="text-sm text-muted-foreground">Demande de projet</p>
                  <p className="text-xs text-muted-foreground/50 mt-1">
                    {formatDistanceToNow(new Date('2024-03-12'), { addSuffix: true, locale: fr })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Performances
            </CardTitle>
            <CardDescription>
              Statistiques d'engagement (démo)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="group flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/60 transition-colors rounded-xl border border-border/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform">
                    <Eye className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Vues cette semaine</span>
                </div>
                <span className="text-lg font-bold text-blue-500">1,234</span>
              </div>
              <div className="group flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/60 transition-colors rounded-xl border border-border/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform">
                     <TrendingUp className="h-5 w-5 text-emerald-500" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Téléchargements CV</span>
                </div>
                <span className="text-lg font-bold text-emerald-500">56</span>
              </div>
              <div className="group flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/60 transition-colors rounded-xl border border-border/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-500/10 rounded-lg group-hover:scale-110 transition-transform">
                    <Users className="h-5 w-5 text-violet-500" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Visiteurs uniques</span>
                </div>
                <span className="text-lg font-bold text-violet-500">892</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
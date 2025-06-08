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
      color: 'text-blue-600'
    },
    {
      title: 'Expériences',
      value: stats.experiences,
      icon: Briefcase,
      description: 'Expériences professionnelles',
      color: 'text-green-600'
    },
    {
      title: 'Compétences',
      value: stats.skills,
      icon: Wrench,
      description: 'Compétences techniques',
      color: 'text-purple-600'
    },
    {
      title: 'Services',
      value: stats.services,
      icon: Settings,
      description: 'Services proposés',
      color: 'text-orange-600'
    },
    {
      title: 'Éducation',
      value: stats.education,
      icon: GraduationCap,
      description: 'Formations et diplômes',
      color: 'text-indigo-600'
    },
    {
      title: 'Témoignages',
      value: stats.testimonials,
      icon: MessageSquare,
      description: 'Avis clients',
      color: 'text-pink-600'
    },
    {
      title: 'Messages',
      value: stats.messages,
      icon: Mail,
      description: `${stats.newMessages} nouveau(x)`,
      color: stats.newMessages > 0 ? 'text-red-600' : 'text-gray-600'
    }
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-2 text-sm text-gray-700">
          Vue d'ensemble de votre portfolio et de son contenu
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Activité récente
            </CardTitle>
            <CardDescription>
              Dernières modifications apportées à votre portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Plus className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Projet ajouté</p>
                  <p className="text-sm text-gray-500">E-commerce Platform</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date('2024-03-15'), { addSuffix: true, locale: fr })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-100 rounded-full">
                  <Edit className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Compétence mise à jour</p>
                  <p className="text-sm text-gray-500">React (niveau 5)</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date('2024-03-10'), { addSuffix: true, locale: fr })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-100 rounded-full">
                  <MessageCircle className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Nouveau message</p>
                  <p className="text-sm text-gray-500">Demande de projet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date('2024-03-12'), { addSuffix: true, locale: fr })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Statistiques du site
            </CardTitle>
            <CardDescription>
              Performances et engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium">Vues cette semaine</span>
                </div>
                <span className="text-lg font-bold text-blue-600">1,234</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">Téléchargements CV</span>
                </div>
                <span className="text-lg font-bold text-green-600">56</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium">Visiteurs uniques</span>
                </div>
                <span className="text-lg font-bold text-purple-600">892</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
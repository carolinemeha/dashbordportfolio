'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { dataService, Skill, SkillCategory } from '@/lib/data';
import { Plus, Edit, Trash2, Wrench, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import SkillForm from '@/components/admin/SkillForm';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import * as LucideIcons from 'lucide-react';

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | undefined>(); 
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [sortConfig, setSortConfig] = useState<{ key: keyof Skill; direction: 'asc' | 'desc' }>({
    key: 'name',
    direction: 'asc',
  });

  const groupedSkills = filteredSkills.reduce((acc, skill) => {
  if (!acc[skill.category]) {
    acc[skill.category] = [];
  }
  acc[skill.category].push(skill);
  return acc;
}, {} as Record<string, Skill[]>);

  const firstCategory = Object.keys(groupedSkills)[0] as SkillCategory || "Frontend";
  
  useEffect(() => {
    const loadedSkills = dataService.getSkills();
    setSkills(loadedSkills);
    setFilteredSkills(loadedSkills);
    
    const categories = [...new Set(loadedSkills.map(skill => skill.category))];
    const initialExpandedState = categories.reduce((acc, category) => {
      acc[category] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setExpandedCategories(initialExpandedState);
  }, []);

  useEffect(() => {
    let result = skills;
    
    if (searchTerm) {
      result = result.filter(skill =>
        skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    result = [...result].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      // Handle number comparison for level
      if (sortConfig.key === 'level') {
        return sortConfig.direction === 'asc' 
          ? (a.level - b.level)
          : (b.level - a.level);
      }
      
      // String comparison for other fields
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredSkills(result);
  }, [skills, searchTerm, sortConfig]);

  const handleCreate = (skillData: Omit<Skill, 'id'>) => {
    try {
      const newSkill = dataService.createSkill(skillData);
      setSkills(dataService.getSkills());
      setIsFormOpen(false);
      toast({
        title: 'Succès',
        description: 'Compétence ajoutée avec succès',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Échec de l\'ajout de la compétence',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = (id: string, updates: Partial<Skill>) => {
    try {
      dataService.updateSkill(id, updates);
      setSkills(dataService.getSkills());
      setEditingSkill(undefined);
      setIsFormOpen(false);
      toast({
        title: 'Succès',
        description: 'Compétence mise à jour avec succès',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Échec de la mise à jour de la compétence',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette compétence ?')) {
      try {
        dataService.deleteSkill(id);
        setSkills(dataService.getSkills());
        toast({
          title: 'Succès',
          description: 'Compétence supprimée avec succès',
          variant: 'default',
        });
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Échec de la suppression de la compétence',
          variant: 'destructive',
        });
      }
    }
  };

  const openEditForm = (skill: Skill) => {
  setEditingSkill(skill);
  setIsFormOpen(true);
};

const closeForm = () => {
  setIsFormOpen(false);
  setEditingSkill(undefined);
};


  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const requestSort = (key: keyof Skill) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // const groupedSkills = filteredSkills.reduce((acc, skill) => {
  //   if (!acc[skill.category]) {
  //     acc[skill.category] = [];
  //   }
  //   acc[skill.category].push(skill);
  //   return acc;
  // }, {} as Record<string, Skill[]>);

  const getLevelString = (level: number): string => {
    if (level <= 1) return 'beginner';
    if (level <= 2) return 'intermediate';
    if (level <= 3) return 'advanced';
    return 'expert';
  };

  const getLevelColor = (level: number): string => {
    if (level <= 1) return 'bg-blue-500';
    if (level <= 2) return 'bg-green-500';
    if (level <= 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getLevelValue = (level: number): number => {
    return level;
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Gestion des Compétences</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Organisez et gérez vos compétences techniques et professionnelles
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une compétence..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <X 
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer"
                onClick={() => setSearchTerm('')}
              />
            )}
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>

      {filteredSkills.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Wrench className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'Aucun résultat' : 'Aucune compétence'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-center">
              {searchTerm 
                ? 'Aucune compétence ne correspond à votre recherche'
                : 'Commencez par ajouter vos premières compétences'}
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une compétence
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {filteredSkills.length} compétence{filteredSkills.length > 1 ? 's' : ''} trouvée{filteredSkills.length > 1 ? 's' : ''}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                  Trier par: {sortConfig.key === 'name' ? 'Nom' : sortConfig.key === 'level' ? 'Niveau' : 'Catégorie'} 
                  {sortConfig.direction === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => requestSort('name')}>
                  Nom {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => requestSort('level')}>
                  Niveau {sortConfig.key === 'level' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => requestSort('category')}>
                  Catégorie {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <Card key={category} className="overflow-hidden">
              <CardHeader 
                className="bg-gray-50 dark:bg-gray-800 p-4 cursor-pointer" 
                onClick={() => toggleCategory(category)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {expandedCategories[category] ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronUp className="h-5 w-5" />
                    )}
                    <span className="capitalize">{category}</span>
                    <Badge variant="secondary" className="ml-2">
                      {categorySkills.length}
                    </Badge>
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFormOpen(true);
                      setEditingSkill(undefined);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
              </CardHeader>
              
              {expandedCategories[category] && (
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {categorySkills.map((skill) => (
                      <div
                        key={skill.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            {skill.icon && (
                              <div className="flex items-center justify-center h-8 w-8 rounded-md bg-gray-100 dark:bg-gray-700">
                                <DynamicIcon name={skill.icon} className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                              </div>
                            )}
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {skill.name}
                            </h4>
                          </div>
                          
                          {skill.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 sm:mb-0">
                              {skill.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="w-full sm:w-48 flex-shrink-0 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {getLevelString(skill.level)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {getLevelValue(skill.level)}/5
                            </Badge>
                          </div>
                          <Progress 
                            value={getLevelValue(skill.level) * 20} 
                            className={cn('h-2', getLevelColor(skill.level))}
                          />
                          
                          <div className="flex justify-end gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditForm(skill)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(skill.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {isFormOpen && (
        <SkillForm
          skill={editingSkill} 
          onSave={editingSkill ? 
            (updates) => handleUpdate(editingSkill.id, updates) : 
            handleCreate
          }
          onCancel={closeForm}
          defaultCategory={firstCategory}
        />
      )}
    </div>
  );
}

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = LucideIcons[name as keyof typeof LucideIcons] as React.ComponentType<React.SVGProps<SVGSVGElement>>;
  
  if (!IconComponent) {
    console.warn(`Icon ${name} not found`);
    return null;
  }

  return <IconComponent className={className} />;
}
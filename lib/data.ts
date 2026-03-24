// Mock data store for demo purposes
// In production, replace with actual database operations

export interface Project {
  status: 'draft' | 'published' | 'archived' | 'completed';
  id: string;
  title: string;
  description: string;
  image: string;
  liveUrl?: string;
  githubUrl?: string;
  technologies: string[];
  featured: boolean;
  createdAt: string;
}

export interface Experience {
  languages?: string[];
  position?: string; 
  current: boolean;
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  skills: string[];
}

export type SkillCategory = "Frontend" | "Backend" | "Tools" | "Design" | "Technical" | "Soft" | "Language" | "Tool";

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: number;
  description: string;
  icon: string;
}

export interface Service {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  icon: string;
  features: string[];
  isFeatured: boolean;
  displayOrder: number;
  category: string; 
  createdAt?: string;
  updatedAt?: string;
  
}

export interface AboutInfo {
  name: string;
  title: string;
  bio: string;
  photo: string;
  location: string;
  email: string;
  phone: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
}

export interface Education {
  achievements: boolean;
  id: string;
  degree: string;
  school: string;
  year: string;
  description: string;
  grade?: string;
  startDate: string;
  endDate?: string;
  location?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  content: string;
  avatar: string;
  rating: number;
  date: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
}

export interface CVInfo {
  fileName: string;
  fileSize: string;
  uploadDate: string;
  fileUrl: string;
  version: number;
  educations: Education[];
  experiences: Experience[];
  skills: Skill[];
  projects: Project[];
  services: Service[];
  testimonials: Testimonial[];
  aboutInfo: AboutInfo;
}

// Initial mock data
const initialProjects: Project[] = [
  {
    id: '1',
    title: 'E-commerce Platform',
    description: 'Full-stack e-commerce solution with React and Node.js',
    image: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=800',
    liveUrl: 'https://example.com',
    githubUrl: 'https://github.com/example',
    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    featured: true,
    createdAt: '2024-01-15',
    status: 'completed'
  }
];

const initialExperiences: Experience[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    startDate: '2022-01-01',
    endDate: '2024-01-01',
    description: 'Leading frontend development team and implementing modern React applications.',
    skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Stripe'],
    languages: [],
    position: '',
    current: false
  }
];

const initialSkills: Skill[] = [
  { 
    id: '1', 
    name: 'React', 
    level: 5, 
    category: 'Frontend',
    description: 'Advanced React with hooks and context API',
    icon: 'react-icon'
  },
  { 
    id: '2', 
    name: 'TypeScript', 
    level: 4, 
    category: 'Frontend',
    description: 'Strongly typed JavaScript for better code quality',
    icon: 'typescript-icon'
  },
  { 
    id: '3', 
    name: 'Node.js', 
    level: 4, 
    category: 'Backend',
    description: 'Building scalable server-side applications',
    icon: 'nodejs-icon'
  }
];

const initialEducation: Education[] = [
  {
    id: '1',
    degree: 'Bachelor of Computer Science',
    school: 'Stanford University',
    year: '2019',
    description: 'Specialized in software engineering and artificial intelligence.',
    grade: '3.8 GPA',
    startDate: '2015-09-01',
    endDate: '2019-06-15',
    location: 'Stanford, CA',
    achievements: false
  }
];

const initialTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    position: 'Product Manager',
    company: 'TechStart Inc.',
    content: 'Excellent developer with great attention to detail.',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 5,
    date: '2024-05-20'
  }
];

const initialServices: Service[] = [
  {
    id: '1',
    title: 'Développement Web',
    shortDescription: 'Solutions web sur mesure pour votre entreprise',
    description: 'Création de sites web et applications performantes avec les dernières technologies frontend et backend.',
    icon: 'Code',
    features: [
      'Développement React/Next.js',
      'Applications responsive',
      'Optimisation SEO',
      'Intégration API'
    ],
    isFeatured: true,
    displayOrder: 1,
    category: "web",
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Conseil Technique',
    shortDescription: 'Expertise pour vos projets technologiques',
    description: 'Audit et recommandations pour améliorer vos systèmes existants ou planifier de nouveaux projets.',
    icon: 'Settings',
    features: [
      'Audit de code',
      'Architecture système',
      'Optimisation des performances',
      'Planification technique'
    ],
    isFeatured: false,
    displayOrder: 2,
     category: "web", 
    createdAt: '2024-01-05',
    updatedAt: '2024-01-10'
  }
];

const initialAboutInfo: AboutInfo = {
  name: 'John Doe',
  title: 'Full Stack Developer',
  bio: 'Passionate full-stack developer with 5+ years of experience...',
  photo: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400',
  location: 'San Francisco, CA',
  email: 'john@portfolio.com',
  phone: '+1 (555) 123-4567',
  website: 'https://johndoe.com',
  github: 'https://github.com/johndoe',
  linkedin: 'https://linkedin.com/in/johndoe',
  twitter: 'https://twitter.com/johndoe'
};

// CRUD operations
export const dataService = {
  // Initialize data if empty
   refreshServices: function() {
    const cvData = this.getCVInfo();
    return cvData?.services || [];
  },
  
  initializeData(): void {
    const defaultAboutInfo: AboutInfo = {
      name: 'John Doe',
      title: 'Full Stack Developer',
      bio: 'Passionate developer with experience in...',
      photo: '',
      location: '',
      email: '',
      phone: '',
    };

    if (!this.getCVInfo()) {
      this.updateCV({
        fileName: 'john_doe_cv.pdf',
        fileSize: '1.2 MB',
        uploadDate: new Date().toISOString(),
        fileUrl: '',
        version: 1,
        educations: initialEducation,
        experiences: initialExperiences,
        skills: initialSkills,
        projects: initialProjects,
        services: initialServices,
        testimonials: initialTestimonials,
        aboutInfo: initialAboutInfo || defaultAboutInfo
      });
    }
  },

  // CV Operations
 getCVInfo(): CVInfo | null {
    const cvData = localStorage.getItem('cvData');
    return cvData ? JSON.parse(cvData) : null;
  },

  getCVVersions(): CVInfo[] {
    const versions = localStorage.getItem('cvVersions');
    return versions ? JSON.parse(versions) : [];
  },

  async updateCV(cv: Partial<CVInfo>): Promise<void> {
    const currentCV = this.getCVInfo() || {} as CVInfo;
    const updatedCV = { ...currentCV, ...cv };

    // Save previous version
    if (currentCV.version) {
      const versions = this.getCVVersions();
      versions.push(currentCV);
      localStorage.setItem('cvVersions', JSON.stringify(versions.slice(-5)));
    }

    // Update current CV
    localStorage.setItem('cvData', JSON.stringify(updatedCV));
  },

  deleteCV(): void {
    localStorage.removeItem('cvData');
  },

  // Service Operations - New CRUD methods
 
  getServices(): Service[] {
    const cvData = this.getCVInfo(); 
    return cvData?.services || [];
  },

 createService(serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Service {
  const cvData = this.getCVInfo();
  if (!cvData) throw new Error('CV data not initialized');

  const newService: Service = {
    ...serviceData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updatedServices = [...(cvData.services || []), newService];
  this.updateCV({ services: updatedServices });
  return newService; 
},

  updateService(id: string, updates: Partial<Omit<Service, 'id'>>): void {
    const cvData = this.getCVInfo();
    if (!cvData) return;

    const updatedServices = (cvData.services || []).map(service => 
      service.id === id ? { 
        ...service, 
        ...updates, 
        updatedAt: new Date().toISOString() 
      } : service
    );
    this.updateCV({ services: updatedServices });
  },

  deleteService(id: string): void {
    const cvData = this.getCVInfo();
    if (!cvData) return;

    const updatedServices = (cvData.services || []).filter(service => service.id !== id);
    this.updateCV({ services: updatedServices });
  },

  reorderServices(newOrder: Service[]): void {
    const cvData = this.getCVInfo();
    if (!cvData) return;

    // Update displayOrder based on new array position
    const reorderedServices = newOrder.map((service, index) => ({
      ...service,
      displayOrder: index
    }));

    this.updateCV({ services: reorderedServices });
  },

  // Education Operations
  getEducations(): Education[] {
    const cvData = this.getCVInfo();
    return cvData?.educations || [];
  },

  addEducation(education: Omit<Education, 'id'>): Education {
    const cvData = this.getCVInfo();
    if (!cvData) throw new Error('CV data not initialized');

    const newEducation: Education = {
      ...education,
      id: Date.now().toString()
    };

    const updatedEducations = [...cvData.educations, newEducation];
    this.updateCV({ educations: updatedEducations });
    return newEducation;
  },

  updateEducation(id: string, updates: Partial<Education>): void {
    const cvData = this.getCVInfo();
    if (!cvData) return;

    const updatedEducations = cvData.educations.map(edu => 
      edu.id === id ? { ...edu, ...updates } : edu
    );
    this.updateCV({ educations: updatedEducations });
  },

  deleteEducation(id: string): void {
    const cvData = this.getCVInfo();
    if (!cvData) return;

    const updatedEducations = cvData.educations.filter(edu => edu.id !== id);
    this.updateCV({ educations: updatedEducations });
  },

  // Experience Operations
  getExperiences(): Experience[] {
    const cvData = this.getCVInfo();
    return cvData?.experiences || [];
  },

  createExperience(experience: Omit<Experience, 'id'>): Experience {
    const cvData = this.getCVInfo();
    if (!cvData) throw new Error('CV data not initialized');

    const newExperience: Experience = {
      ...experience,
      id: Date.now().toString(),
      languages: experience.languages || [],
      position: experience.position || '',
      current: experience.current || false
    };

    const updatedExperiences = [...cvData.experiences, newExperience];
    this.updateCV({ experiences: updatedExperiences });
    return newExperience;
  },

  updateExperience(id: string, updates: Partial<Experience>): void {
    const cvData = this.getCVInfo();
    if (!cvData) return;

    const updatedExperiences = cvData.experiences.map(exp => 
      exp.id === id ? { ...exp, ...updates } : exp
    );
    this.updateCV({ experiences: updatedExperiences });
  },

  deleteExperience(id: string): void {
    const cvData = this.getCVInfo();
    if (!cvData) return;

    const updatedExperiences = cvData.experiences.filter(exp => exp.id !== id);
    this.updateCV({ experiences: updatedExperiences });
  },

  // Skill Operations
  getSkills(): Skill[] {
    const cvData = this.getCVInfo();
    return cvData?.skills || [];
  },

  createSkill(skillData: Omit<Skill, 'id'>): Skill {
    const cvData = this.getCVInfo();
    if (!cvData) throw new Error('CV data not initialized');

    const newSkill: Skill = {
      ...skillData,
      id: Date.now().toString(),
      description: skillData.description || '',
      icon: skillData.icon || ''
    };

    const updatedSkills = [...cvData.skills, newSkill];
    this.updateCV({ skills: updatedSkills });
    return newSkill;
  },

  updateSkill(id: string, updates: Partial<Skill>): void {
    const cvData = this.getCVInfo();
    if (!cvData) return;

    const updatedSkills = cvData.skills.map(skill => 
      skill.id === id ? { ...skill, ...updates } : skill
    );
    this.updateCV({ skills: updatedSkills });
  },

  deleteSkill(id: string): void {
    const cvData = this.getCVInfo();
    if (!cvData) return;

    const updatedSkills = cvData.skills.filter(skill => skill.id !== id);
    this.updateCV({ skills: updatedSkills });
  },

  // Project Operations
  getProjects(): Project[] {
    const cvData = this.getCVInfo();
    return cvData?.projects || [];
  },

  createProject(projectData: Omit<Project, 'id'>): Project {
    const cvData = this.getCVInfo();
    if (!cvData) throw new Error('CV data not initialized');

    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: projectData.createdAt || new Date().toISOString()
    };

    const updatedProjects = [...cvData.projects, newProject];
    this.updateCV({ projects: updatedProjects });
    return newProject;
  },

  updateProject(id: string, updates: Partial<Project>): void {
    const cvData = this.getCVInfo();
    if (!cvData) return;

    const updatedProjects = cvData.projects.map(proj => 
      proj.id === id ? { ...proj, ...updates } : proj
    );
    this.updateCV({ projects: updatedProjects });
  },

  deleteProject(id: string): void {
    const cvData = this.getCVInfo();
    if (!cvData) return;

    const updatedProjects = cvData.projects.filter(proj => proj.id !== id);
    this.updateCV({ projects: updatedProjects });
  },

  // Contact Messages Operations
  getContactMessages(): ContactMessage[] {
    const messages = localStorage.getItem('contactMessages');
    return messages ? JSON.parse(messages) : [];
  },

  addContactMessage(message: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>): ContactMessage {
    const messages = this.getContactMessages();
    const newMessage: ContactMessage = {
      ...message,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'new'
    };
    localStorage.setItem('contactMessages', JSON.stringify([...messages, newMessage]));
    return newMessage;
  },

  updateContactMessage(id: string, updates: Partial<ContactMessage>): void {
    const messages = this.getContactMessages();
    const updatedMessages = messages.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    );
    localStorage.setItem('contactMessages', JSON.stringify(updatedMessages));
  }
};

// Initialize data on first load
dataService.initializeData();
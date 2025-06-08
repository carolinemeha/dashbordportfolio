// Mock data store for demo purposes
// In production, replace with actual database operations

export interface Project {
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
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  skills: string[];
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 1-5
  category: 'Frontend' | 'Backend' | 'Tools' | 'Design';
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
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
  uploadDate: string;
  fileSize: string;
}

// Mock data
let projects: Project[] = [
  {
    id: '1',
    title: 'E-commerce Platform',
    description: 'Full-stack e-commerce solution with React and Node.js',
    image: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=800',
    liveUrl: 'https://example.com',
    githubUrl: 'https://github.com/example',
    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    featured: true,
    createdAt: '2024-01-15'
  }
];

let experiences: Experience[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    startDate: '2022-01-01',
    endDate: '2024-01-01',
    description: 'Leading frontend development team and implementing modern React applications.',
    skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Stripe']
  }
];

let skills: Skill[] = [
  { id: '1', name: 'React', level: 5, category: 'Frontend' },
  { id: '2', name: 'TypeScript', level: 4, category: 'Frontend' },
  { id: '3', name: 'Node.js', level: 4, category: 'Backend' }
];

let services: Service[] = [
  {
    id: '1',
    title: 'Web Development',
    description: 'Custom web applications using modern technologies',
    icon: 'Code',
    features: ['React', 'Node.js', 'MongoDB', 'Stripe']
  }
];

let aboutInfo: AboutInfo = {
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

let education: Education[] = [
  {
    id: '1',
    degree: 'Bachelor of Computer Science',
    school: 'Stanford University',
    year: '2019',
    description: 'Specialized in software engineering and artificial intelligence.',
    grade: '3.8 GPA',
    startDate: '2015-09-01',
    endDate: '2019-06-15',
    location: 'Stanford, CA'
  }
];

let testimonials: Testimonial[] = [
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

let contactMessages: ContactMessage[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    subject: 'Project Inquiry',
    message: 'I would like to discuss a potential project...',
    status: 'new',
    createdAt: '2024-01-20T10:00:00Z'
  }
];

let cvInfo: CVInfo | null = {
  fileName: 'john_doe_cv.pdf',
  uploadDate: '2024-01-10',
  fileSize: '1.2 MB'
};

// CRUD operations
export const dataService = {
  // Projects
  getProjects: () => projects,
  getProject: (id: string) => projects.find(p => p.id === id),
  createProject: (project: Omit<Project, 'id'>) => {
    const newProject = { ...project, id: Date.now().toString() };
    projects.push(newProject);
    return newProject;
  },
  updateProject: (id: string, updates: Partial<Project>) => {
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updates };
      return projects[index];
    }
    return null;
  },
  deleteProject: (id: string) => {
    projects = projects.filter(p => p.id !== id);
  },

  // Experiences
  getExperiences: () => experiences,
  getExperience: (id: string) => experiences.find(e => e.id === id),
  createExperience: (experience: Omit<Experience, 'id'>) => {
    const newExperience = { ...experience, id: Date.now().toString() };
    experiences.push(newExperience);
    return newExperience;
  },
  updateExperience: (id: string, updates: Partial<Experience>) => {
    const index = experiences.findIndex(e => e.id === id);
    if (index !== -1) {
      experiences[index] = { ...experiences[index], ...updates };
      return experiences[index];
    }
    return null;
  },
  deleteExperience: (id: string) => {
    experiences = experiences.filter(e => e.id !== id);
  },

  // Skills
  getSkills: () => skills,
  getSkill: (id: string) => skills.find(s => s.id === id),
  createSkill: (skill: Omit<Skill, 'id'>) => {
    const newSkill = { ...skill, id: Date.now().toString() };
    skills.push(newSkill);
    return newSkill;
  },
  updateSkill: (id: string, updates: Partial<Skill>) => {
    const index = skills.findIndex(s => s.id === id);
    if (index !== -1) {
      skills[index] = { ...skills[index], ...updates };
      return skills[index];
    }
    return null;
  },
  deleteSkill: (id: string) => {
    skills = skills.filter(s => s.id !== id);
  },

  // Services
  getServices: () => services,
  getService: (id: string) => services.find(s => s.id === id),
  createService: (service: Omit<Service, 'id'>) => {
    const newService = { ...service, id: Date.now().toString() };
    services.push(newService);
    return newService;
  },
  updateService: (id: string, updates: Partial<Service>) => {
    const index = services.findIndex(s => s.id === id);
    if (index !== -1) {
      services[index] = { ...services[index], ...updates };
      return services[index];
    }
    return null;
  },
  deleteService: (id: string) => {
    services = services.filter(s => s.id !== id);
  },

  // About
  getAboutInfo: () => aboutInfo,
  updateAboutInfo: (updates: Partial<AboutInfo>) => {
    aboutInfo = { ...aboutInfo, ...updates };
    return aboutInfo;
  },

  // Education
  getEducation: () => education,
  getEducationItem: (id: string) => education.find(e => e.id === id),
  createEducation: (item: Omit<Education, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    education.push(newItem);
    return newItem;
  },
  updateEducation: (id: string, updates: Partial<Education>) => {
    const index = education.findIndex(e => e.id === id);
    if (index !== -1) {
      education[index] = { ...education[index], ...updates };
      return education[index];
    }
    return null;
  },
  deleteEducation: (id: string) => {
    education = education.filter(e => e.id !== id);
  },

  // Testimonials
  getTestimonials: () => testimonials,
  getTestimonial: (id: string) => testimonials.find(t => t.id === id),
  createTestimonial: (testimonial: Omit<Testimonial, 'id'>) => {
    const newTestimonial = { ...testimonial, id: Date.now().toString() };
    testimonials.push(newTestimonial);
    return newTestimonial;
  },
  updateTestimonial: (id: string, updates: Partial<Testimonial>) => {
    const index = testimonials.findIndex(t => t.id === id);
    if (index !== -1) {
      testimonials[index] = { ...testimonials[index], ...updates };
      return testimonials[index];
    }
    return null;
  },
  deleteTestimonial: (id: string) => {
    testimonials = testimonials.filter(t => t.id !== id);
  },

  // Contact Messages
  getContactMessages: () => contactMessages,
  getContactMessage: (id: string) => contactMessages.find(m => m.id === id),
  updateMessageStatus: (id: string, status: ContactMessage['status']) => {
    const index = contactMessages.findIndex(m => m.id === id);
    if (index !== -1) {
      contactMessages[index] = { ...contactMessages[index], status };
      return contactMessages[index];
    }
    return null;
  },
  deleteContactMessage: (id: string) => {
    contactMessages = contactMessages.filter(m => m.id !== id);
  },

  // CV
  getCVInfo: () => cvInfo,
  updateCV: (newCVInfo: CVInfo) => {
    cvInfo = newCVInfo;
    return cvInfo;
  },
  deleteCV: () => {
    cvInfo = null;
  }
};
import { supabaseAdmin as supabase } from './supabaseAdmin';
import { 
  projects as mockProjects, 
  experiences as mockExperiences, 
  education as mockEducation, 
  skills as mockSkills, 
  services as mockServices, 
  testimonials as mockTestimonials, 
  certifications as mockCertifications, 
  aboutInfo as mockAbout
} from './data';

export async function seedDatabase() {
  console.log('Starting migration to Supabase...');

  const tablesToClean = [
    'services', 
    'projects', 
    'experiences', 
    'education', 
    'skills', 
    'testimonials', 
    'certifications',
    'about',
    'cv_info'
  ];

  console.log('Cleaning existing data...');
  for (const table of tablesToClean) {
    const { error } = await supabase
      .from(table)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
    if (error) console.error(`Error cleaning table ${table}:`, error);
  }

  // 1. About (Utilisation d'un ID constant pour éviter les doublons)
  const ABOUT_ID = '00000000-0000-0000-0000-000000000001';
  const { error: aboutError } = await supabase
    .from('about')
    .upsert({
      id: ABOUT_ID,
      name: mockAbout.name,
      title: mockAbout.title,
      bio: mockAbout.bio,
      avatar: mockAbout.avatar,
      location: mockAbout.location,
      email: mockAbout.email,
      phone: mockAbout.phone,
      experience: mockAbout.experience,
      nationality: mockAbout.nationality,
      shop_url: mockAbout.shopUrl,
      freelance_status: mockAbout.freelanceStatus,
      languages: mockAbout.languages,
      github: mockAbout.github,
      linkedin: mockAbout.linkedin,
      twitter: mockAbout.twitter,
      youtube: mockAbout.youtube,
      website: mockAbout.website,
      roles: mockAbout.roles,
      timezone: mockAbout.timezone,
      available_status: mockAbout.availableStatus,
      cv_url: mockAbout.cvUrl,
      hero_badge: mockAbout.heroBadge ?? null,
      home_available_title: mockAbout.homeAvailableTitle ?? null,
      home_available_subtitle: mockAbout.homeAvailableSubtitle ?? null,
      home_stat_years: mockAbout.homeStatYears ?? 8,
      home_stat_projects: mockAbout.homeStatProjects ?? 15,
      home_stat_clients: mockAbout.homeStatClients ?? 12,
      home_stat_satisfaction: mockAbout.homeStatSatisfaction ?? 100,
      whatsapp_url: mockAbout.whatsappUrl ?? null,
      telegram_url: mockAbout.telegramUrl ?? null,
    });
  if (aboutError) console.error('Error seeding about:', aboutError);

  // 2. Projects
  const { error: projectsError } = await supabase
    .from('projects')
    .insert(mockProjects.map(p => ({
      title: p.title,
      description: p.description,
      image: p.image,
      demo_url: p.demo,
      github_url: p.github,
      technologies: p.technologies,
      category: p.category,
      status: p.status,
      date: p.date,
      featured: p.featured
    })));
  if (projectsError) console.error('Error seeding projects:', projectsError);

  // 3. Experiences
  const { error: expError } = await supabase
    .from('experiences')
    .insert(mockExperiences.map(e => ({
      company: e.company,
      position: e.position,
      duration: e.duration,
      achievements: e.achievements,
      skills: e.skills
    })));
  if (expError) console.error('Error seeding experiences:', expError);

  // 4. Education
  const { error: eduError } = await supabase
    .from('education')
    .insert(mockEducation.map(e => ({
      institution: e.institution,
      degree: e.degree,
      duration: e.duration,
      courses: e.courses
    })));
  if (eduError) console.error('Error seeding education:', eduError);

  // 5. Skills
  const { error: skillsError } = await supabase
    .from('skills')
    .insert(mockSkills.map(s => ({
      name: s.name,
      level: s.level,
      category: s.category,
      icon_name: s.iconName?.trim() || null,
    })));
  if (skillsError) console.error('Error seeding skills:', skillsError);

  // 6. Services
  const { error: servicesError } = await supabase
    .from('services')
    .insert(mockServices.map(s => ({
      title: s.title,
      description: s.description,
      features: s.features,
      pricing: s.pricing,
      category: s.category,
      icon_name: s.iconName,
      technologies: s.technologies
    })));
  if (servicesError) console.error('Error seeding services:', servicesError);

  // 7. Testimonials
  const { error: testiError } = await supabase
    .from('testimonials')
    .insert(mockTestimonials.map(t => ({
      name: t.name,
      role: t.role,
      content: t.content,
      avatar: t.avatar,
      date: t.date
    })));
  if (testiError) console.error('Error seeding testimonials:', testiError);

  // 8. Certifications
  const { error: certError } = await supabase
    .from('certifications')
    .insert(mockCertifications.map(c => ({
      title: c.title,
      issuer: c.issuer,
      date: c.date,
      credential: c.credential
    })));
  if (certError) console.error('Error seeding certifications:', certError);

  // 9. Analytics (Initial Data)
  console.log('Seeding analytics sample data...');
  const sampleViews = Array.from({ length: 50 }, (_, i) => ({
    ip_hash: `user_hash_${Math.floor(Math.random() * 20)}`, // 20 unique users
    page_path: '/',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'
  }));

  const { error: viewsErr } = await supabase.from('page_views').insert(sampleViews);
  if (viewsErr) console.error('Error seeding views:', viewsErr);

  const sampleDownloads = Array.from({ length: 12 }, () => ({}));
  const { error: dlErr } = await supabase.from('cv_downloads').insert(sampleDownloads);
  if (dlErr) console.error('Error seeding downloads:', dlErr);

  // 10. CV Info
  console.log('Seeding CV info...');
  const { error: cvErr } = await supabase.from('cv_info').upsert({
    file_name: 'CV_Gbènami_Caroline_MEHA.pdf',
    upload_date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
    file_size: '1.2 MB',
    url: '/assets/CV.pdf'
  });
  if (cvErr) console.error('Error seeding CV info:', cvErr);

  console.log('Migration finished !');
}

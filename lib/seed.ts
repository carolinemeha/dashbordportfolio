import { supabaseAdmin as supabase } from './supabaseAdmin';
import {
  projects as mockProjects,
  experiences as mockExperiences,
  education as mockEducation,
  skills as mockSkills,
  services as mockServices,
  testimonials as mockTestimonials,
  certifications as mockCertifications,
  aboutInfo as mockAbout,
  projectInsertPayload,
  experienceToDbPayload,
  educationToDbPayload,
  skillToDbPayload,
  serviceToDbPayload,
  testimonialToDbPayload,
  certificationToDbPayload,
  aboutInfoToDbPayload,
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
    'cv_info',
  ];

  console.log('Cleaning existing data...');
  for (const table of tablesToClean) {
    const { error } = await supabase
      .from(table)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) console.error(`Error cleaning table ${table}:`, error);
  }

  const ABOUT_ID = '00000000-0000-0000-0000-000000000001';
  const { error: aboutError } = await supabase.from('about').upsert({
    id: ABOUT_ID,
    ...aboutInfoToDbPayload(mockAbout),
  });
  if (aboutError) console.error('Error seeding about:', aboutError);

  const { error: projectsError } = await supabase
    .from('projects')
    .insert(
      mockProjects.map(({ id: _id, ...p }) => projectInsertPayload(p))
    );
  if (projectsError) console.error('Error seeding projects:', projectsError);

  const { error: expError } = await supabase
    .from('experiences')
    .insert(
      mockExperiences.map(({ id: _id, ...e }) => ({
        ...experienceToDbPayload(e),
      }))
    );
  if (expError) console.error('Error seeding experiences:', expError);

  const { error: eduError } = await supabase
    .from('education')
    .insert(
      mockEducation.map(({ id: _id, ...ed }) => educationToDbPayload(ed))
    );
  if (eduError) console.error('Error seeding education:', eduError);

  const { error: skillsError } = await supabase.from('skills').insert(
    mockSkills.map(({ id: _id, ...s }) => ({
      ...skillToDbPayload(s),
      level: s.level ?? 0,
      category: s.category,
      icon_name: s.iconName?.trim() || null,
    }))
  );
  if (skillsError) console.error('Error seeding skills:', skillsError);

  const { error: servicesError } = await supabase
    .from('services')
    .insert(
      mockServices.map(({ id: _id, ...s }) => ({
        ...serviceToDbPayload(s),
        pricing: s.pricing,
      }))
    );
  if (servicesError) console.error('Error seeding services:', servicesError);

  const { error: testiError } = await supabase
    .from('testimonials')
    .insert(
      mockTestimonials.map(({ id: _id, ...t }) => ({
        ...testimonialToDbPayload(t),
        date: t.date,
      }))
    );
  if (testiError) console.error('Error seeding testimonials:', testiError);

  const { error: certError } = await supabase
    .from('certifications')
    .insert(
      mockCertifications.map(({ id: _id, ...c }) => certificationToDbPayload(c))
    );
  if (certError) console.error('Error seeding certifications:', certError);

  console.log('Seeding analytics sample data...');
  const sampleViews = Array.from({ length: 50 }, (_, i) => ({
    ip_hash: `user_hash_${Math.floor(Math.random() * 20)}`,
    page_path: '/',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
  }));

  const { error: viewsErr } = await supabase.from('page_views').insert(sampleViews);
  if (viewsErr) console.error('Error seeding views:', viewsErr);

  const sampleDownloads = Array.from({ length: 12 }, () => ({}));
  const { error: dlErr } = await supabase.from('cv_downloads').insert(sampleDownloads);
  if (dlErr) console.error('Error seeding downloads:', dlErr);

  console.log('Seeding CV info...');
  const { error: cvErr } = await supabase.from('cv_info').upsert({
    file_name: 'CV_Gbènami_Caroline_MEHA.pdf',
    upload_date: new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
    file_size: '1.2 MB',
    url: '/assets/CV.pdf',
  });
  if (cvErr) console.error('Error seeding CV info:', cvErr);

  console.log('Migration finished !');
}

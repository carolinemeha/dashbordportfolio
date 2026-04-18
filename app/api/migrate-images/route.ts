import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import fs from 'fs';
import path from 'path';

// Dossier source des images (le dossier public/assets de l'ancien projet)
const SOURCE_DIR = path.join(process.cwd(), '..', 'Myporfolio', 'public', 'assets');
const BUCKET_NAME = 'portfolio';

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

export async function POST() {
  try {
    console.log('--- Démarrage de la migration des images ---');
    
    // 1. Créer le bucket portfolio s'il n'existe pas
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const portfolioBucket = buckets?.find(b => b.name === BUCKET_NAME);
    
    if (!portfolioBucket) {
      console.log('Création du bucket portfolio...');
      const { error: bucketError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf'],
        fileSizeLimit: 10485760 // 10MB
      });
      if (bucketError) throw bucketError;
    }

    // 2. Récupérer tous les fichiers locaux
    if (!fs.existsSync(SOURCE_DIR)) {
      return NextResponse.json({ error: `Dossier source introuvable : ${SOURCE_DIR}` }, { status: 404 });
    }

    const allFiles = await getAllFiles(SOURCE_DIR);
    const results = [];
    const urlMap: Record<string, string> = {};

    // 3. Uploader chaque fichier
    for (const filePath of allFiles) {
      const relativePath = path.relative(SOURCE_DIR, filePath).replace(/\\/g, '/');
      const storagePath = `assets/${relativePath}`;
      const fileBuffer = fs.readFileSync(filePath);
      
      const contentType = filePath.endsWith('.svg') ? 'image/svg+xml' : 
                          filePath.endsWith('.png') ? 'image/png' :
                          filePath.endsWith('.jpeg') || filePath.endsWith('.jpg') ? 'image/jpeg' :
                          filePath.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream';

      console.log(`Uploading ${storagePath}...`);
      
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(storagePath, fileBuffer, {
          contentType,
          upsert: true
        });

      if (uploadError) {
        console.error(`Erreur upload ${storagePath}:`, uploadError);
        continue;
      }

      // Générer l'URL publique
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath);
      
      const oldPath = `/assets/${relativePath}`;
      urlMap[oldPath] = publicUrl;
      results.push({ oldPath, newUrl: publicUrl });
    }

    // 4. Mettre à jour la base de données
    
    // Mettre à jour ABOUT (avatar)
    const { data: aboutData } = await supabaseAdmin.from('about').select('*');
    for (const row of aboutData || []) {
      if (row.avatar && urlMap[row.avatar]) {
        await supabaseAdmin.from('about').update({ avatar: urlMap[row.avatar] }).eq('id', row.id);
      }
    }

    // Mettre à jour PROJECTS (image)
    const { data: projectsData } = await supabaseAdmin.from('projects').select('*');
    for (const row of projectsData || []) {
      if (row.image && urlMap[row.image]) {
        await supabaseAdmin.from('projects').update({ image: urlMap[row.image] }).eq('id', row.id);
      }
    }

    // Mettre à jour TESTIMONIALS (avatar)
    const { data: testimonialsData } = await supabaseAdmin.from('testimonials').select('*');
    for (const row of testimonialsData || []) {
      if (row.avatar && urlMap[row.avatar]) {
        await supabaseAdmin.from('testimonials').update({ avatar: urlMap[row.avatar] }).eq('id', row.id);
      }
    }

    // Mettre à jour SKILLS (si icons) - optionnel selon structure
    
    return NextResponse.json({ 
      success: true, 
      filesMigrated: results.length,
      mapping: results 
    });

  } catch (error: any) {
    console.error('Erreur migration images:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

const { createClient } = require('@supabase/supabase-js');

// Load env vars from the file content since I can't easily use dotenv here without install
const supabaseUrl = "https://fhxgwdwxewtrbrfgicct.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoeGd3ZHd4ZXd0cmJyZmdpY2N0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjUwODkwMywiZXhwIjoyMDkyMDg0OTAzfQ.ryD6daiQioCfemoxJvOav02bRVwl7Pnx6xDDRv6LbwY";

const supabase = createClient(supabaseUrl, supabaseKey);

const iconMap = {
  "Next.js": "SiNextdotjs",
  "React": "SiReact",
  "Node.js": "SiNodedotjs",
  "HTML5": "SiHtml5",
  "CSS3": "SiCss3",
  "Bootstrap": "SiBootstrap",
  "Typescript": "SiTypescript",
  "JavaScript": "SiJavascript",
  "TailwindCss": "SiTailwindcss",
  "Figma": "SiFigma",
  "Adobe XD": "SiAdobexd",
  "React Native": "SiReact",
  "Photoshop": "SiAdobephotoshop",
  "Illustrator": "SiAdobeillustrator",
  "Canva": "SiCanva",
  "SEO Tools": "FaSearch",
  "Analytics": "FaChartLine",
  "MongoDB": "FaDatabase",
  "Firebase": "FaFire",
  "Laravel": "FaLaravel",
  "Postgresql": "SiPostgresql"
};

async function migrate() {
  console.log("Démarrage de la migration des icônes de services...");
  
  const { data: services, error } = await supabase.from('services').select('*');
  
  if (error) {
    console.error("Erreur lors de la récupération des services:", error);
    return;
  }

  if (!services || services.length === 0) {
    console.log("Aucun service trouvé à migrer.");
    return;
  }

  for (const service of services) {
    let hasChanges = false;
    const updatedTechs = (service.technologies || []).map(t => {
      let name = "";
      let icon = "";
      let currentIcon = "";

      // 1. Extraire les données selon le format (objet ou chaîne JSON)
      if (typeof t === 'object' && t !== null) {
        name = t.name || "";
        currentIcon = t.icon || "";
      } else {
        try {
          const obj = JSON.parse(t);
          if (obj && typeof obj === 'object') {
            name = obj.name || "";
            currentIcon = obj.icon || "";
          }
        } catch (e) {
          name = String(t).trim();
        }
      }

      // 2. Si on a un nom mais pas d'icône (ou si on veut forcer la mise à jour)
      if (name && !currentIcon) {
        icon = iconMap[name] || "";
        if (icon) {
          hasChanges = true;
          console.log(`- Migration de "${name}" -> icône "${icon}"`);
          return JSON.stringify({ name, icon });
        }
      }

      // Retourner l'original (en string JSON) s'il a déjà une icône, ou l'objet tel quel
      return typeof t === 'string' ? t : JSON.stringify(t);
    });

    if (hasChanges) {
      const { error: updateError } = await supabase
        .from('services')
        .update({ technologies: updatedTechs })
        .eq('id', service.id);
      
      if (updateError) {
        console.error(`Erreur lors de la mise à jour du service ${service.title}:`, updateError);
      } else {
        console.log(`✅ Service "${service.title}" mis à jour.`);
      }
    } else {
      console.log(`ℹ️ Service "${service.title}" déjà à jour.`);
    }
  }
  
  console.log("Migration terminée.");
}

migrate().catch(console.error);

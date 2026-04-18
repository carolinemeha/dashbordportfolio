const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fhxgwdwxewtrbrfgicct.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoeGd3ZHd4ZXd0cmJyZmdpY2N0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjUwODkwMywiZXhwIjoyMDkyMDg0OTAzfQ.ryD6daiQioCfemoxJvOav02bRVwl7Pnx6xDDRv6LbwY";

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: services, error } = await supabase.from('services').select('id, title, technologies');
  if (error) {
    console.error(error);
    return;
  }

  console.log("Données actuelles des services :");
  services.forEach(s => {
    console.log(`\n--- Service: ${s.title} ---`);
    console.log("Technologies:", s.technologies);
  });
}

check();

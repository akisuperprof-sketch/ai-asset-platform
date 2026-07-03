import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminClient = createClient(supabaseUrl, supabaseKey);

const keywordData = [
  { kw: "business strategy", cat: "business" }, { kw: "business meeting", cat: "business" }, { kw: "handshake", cat: "business" }, { kw: "business presentation", cat: "business" }, { kw: "office building", cat: "business" },
  { kw: "red arrow", cat: "icon" }, { kw: "blue arrow", cat: "icon" }, { kw: "curved arrow", cat: "icon" }, { kw: "double arrow", cat: "icon" }, { kw: "rising arrow", cat: "icon" },
  { kw: "green check mark", cat: "icon" }, { kw: "blue check mark", cat: "icon" }, { kw: "circle check mark", cat: "icon" }, { kw: "3d check mark", cat: "icon" }, { kw: "hand drawn check mark", cat: "icon" },
  { kw: "simple speech bubble", cat: "icon" }, { kw: "thought bubble", cat: "icon" }, { kw: "exclamation speech bubble", cat: "icon" }, { kw: "question speech bubble", cat: "icon" }, { kw: "comic speech bubble", cat: "icon" },
  { kw: "cute kitten", cat: "animal" }, { kw: "sleeping cat", cat: "animal" }, { kw: "black cat silhouette", cat: "animal" }, { kw: "white cat", cat: "animal" }, { kw: "orange tabby cat", cat: "animal" },
  { kw: "golden retriever puppy", cat: "animal" }, { kw: "running dog", cat: "animal" }, { kw: "dog paw print", cat: "animal" }, { kw: "bulldog", cat: "animal" }, { kw: "poodle", cat: "animal" },
  { kw: "male office worker", cat: "people" }, { kw: "female office worker", cat: "people" }, { kw: "team of office workers", cat: "people" }, { kw: "tired office worker", cat: "people" }, { kw: "happy office worker", cat: "people" },
  { kw: "modern laptop", cat: "object" }, { kw: "open laptop", cat: "object" }, { kw: "laptop with blank screen", cat: "object" }, { kw: "silver laptop", cat: "object" }, { kw: "black laptop", cat: "object" },
  { kw: "modern smartphone", cat: "object" }, { kw: "smartphone with blank screen", cat: "object" }, { kw: "hand holding smartphone", cat: "object" }, { kw: "ringing smartphone", cat: "object" }, { kw: "broken smartphone", cat: "object" },
  { kw: "stack of money", cat: "object" }, { kw: "flying money", cat: "object" }, { kw: "gold coin", cat: "object" }, { kw: "wallet with money", cat: "object" }, { kw: "money bag", cat: "object" }
];

async function insertJobs() {
  const { data: existingJobs } = await adminClient.from('generation_jobs').select('keyword');
  const existingJobWords = new Set(existingJobs?.map(j => j.keyword));
  
  const validJobs = [];
  for (const item of keywordData) {
    if (!existingJobWords.has(item.kw)) {
      validJobs.push({
        keyword: item.kw,
        prompt: `generate a high quality, transparent background image of ${item.kw}`,
        category: item.cat,
        status: 'queued',
        provider: 'GOOGLE_NANO_BANANA',
        metadata: { source: 'operation_zero_50_run' }
      });
    }
  }

  console.log(`Inserting ${validJobs.length} jobs...`);
  if (validJobs.length > 0) {
    const { error } = await adminClient.from('generation_jobs').insert(validJobs);
    if (error) console.error("Insert failed:", error);
    else console.log("Successfully inserted jobs.");
  }
}

insertJobs();

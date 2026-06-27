const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.from('assets').select('id, title, status, qa_metadata, generated_prompt').order('created_at', { ascending: false }).limit(3);
  console.log(JSON.stringify(data, null, 2));
}
run();

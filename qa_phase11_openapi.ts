import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
async function main() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
    headers: { 'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY! }
  });
  const data = await res.json();
  const tables = Object.keys(data.definitions || {});
  console.log("Tables in OpenAPI:", tables.filter(t => t.includes('growth') || t.includes('ceo') || t.includes('index') || t.includes('revenue')));
}
main().catch(console.error);

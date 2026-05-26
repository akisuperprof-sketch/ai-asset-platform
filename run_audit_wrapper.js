require('dotenv').config({ path: '.env.local.prod' });
process.env.NEXT_PUBLIC_SITE_URL = 'https://assetninja.jp';
require('child_process').execSync('npx tsx scripts/run_vision_audit.ts --status approved --limit 10 --dry-run true --force', { stdio: 'inherit' });

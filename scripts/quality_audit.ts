import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runQualityAudit() {
  console.log('--- AssetNinja Quality Audit (All Approved Assets) ---');

  // Fetch all approved assets
  const { data: assets, error } = await supabase
    .from('assets')
    .select('id, title, description, image_url, published_at, tags, alt_text, faq, internal_links')
    .eq('review_status', 'approved');

  if (error) {
    console.error('Error fetching assets:', error);
    process.exit(1);
  }

  if (!assets || assets.length === 0) {
    console.log('No assets found.');
    return;
  }

  console.log(`Successfully fetched ${assets.length} assets. Running checks...`);

  let scoreSum = 0;
  let perfectAssets = 0;
  let failedAssets = 0;

  for (const asset of assets) {
    let score = 100;
    const issues = [];

    // Title Check
    if (!asset.title || asset.title.length <= 15) {
      score -= 10;
      issues.push('Title too short (<= 15) or missing');
    }

    // Description Check
    if (!asset.description || asset.description.length <= 50) {
      score -= 10;
      issues.push('Description too short (<= 50) or missing');
    }

    // Tag Check
    if (!asset.tags || asset.tags.length < 5) {
      score -= 10;
      issues.push('Insufficient tags (needs 5+)');
    }

    // Alt Text Check
    if (!asset.alt_text) {
      score -= 10;
      issues.push('Missing alt_text');
    }

    // FAQ Check
    if (!asset.faq) {
      score -= 10;
      issues.push('Missing FAQ schema');
    }

    // Internal Links Check
    if (!asset.internal_links || asset.internal_links.length === 0) {
      score -= 10;
      issues.push('Missing internal links');
    }

    if (score === 100) {
      perfectAssets++;
    } else {
      failedAssets++;
    }

    scoreSum += score;
  }

  const averageScore = scoreSum / assets.length;

  const report = `
# Quality Audit Report
**Date:** ${new Date().toISOString()}
**Sample Size:** ${assets.length} Assets

## Results
- **Average Quality Score:** ${averageScore.toFixed(2)} / 100
- **Perfect Assets:** ${perfectAssets}
- **Assets with Issues:** ${failedAssets}

## Next Steps
- Verify Google Index Queue processing.
- Monitor Search Console for actual CTR and Impressions.
  `;

  fs.writeFileSync('quality_report.md', report.trim());
  console.log('Audit completed. Report saved to quality_report.md');
}

runQualityAudit();

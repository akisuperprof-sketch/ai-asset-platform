const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function audit() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: allAssets, error } = await supabase.from('assets').select('*');
  if (error) {
    console.error(error);
    process.exit(1);
  }

  const total = allAssets.length;
  let approved = 0, pending = 0, rejected = 0, unknownStatus = 0;
  let hasImage = 0, missingImage = 0;
  let publicDisplayable = 0;

  for (const asset of allAssets) {
    if (asset.review_status === 'approved') approved++;
    else if (asset.review_status === 'pending') pending++;
    else if (asset.review_status === 'rejected') rejected++;
    else unknownStatus++;

    if (asset.image_url) hasImage++;
    else missingImage++;

    if (asset.review_status === 'approved' && asset.image_url) {
      publicDisplayable++;
    }
  }

  console.log('--- Asset Audit ---');
  console.log('Total:', total);
  console.log('Status:');
  console.log('  Approved:', approved);
  console.log('  Pending:', pending);
  console.log('  Rejected:', rejected);
  console.log('  Unknown:', unknownStatus);
  console.log('Images:');
  console.log('  Has URL:', hasImage);
  console.log('  Missing URL:', missingImage);
  console.log('Displayable (Approved + Has URL):', publicDisplayable);
}

audit();

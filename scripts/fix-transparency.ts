import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { checkTransparency } from './check-transparency';

const premiumDir = path.join(process.cwd(), 'public', 'assets', 'premium');
const tempDir = path.join(process.cwd(), 'temp_raw');
const tempOutDir = path.join(process.cwd(), 'temp_transparent');

async function fixTransparency() {
  console.log("🚀 Starting Transparency Fix Pipeline...");
  
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  if (!fs.existsSync(tempOutDir)) fs.mkdirSync(tempOutDir, { recursive: true });

  const files = fs.readdirSync(premiumDir).filter(f => f.endsWith('.png'));
  const toProcess: string[] = [];

  // Identify files needing fix
  for (const file of files) {
    const res = await checkTransparency(path.join(premiumDir, file));
    if (!res.isPassed) {
      toProcess.push(file);
      // Move to temp for processing
      fs.renameSync(path.join(premiumDir, file), path.join(tempDir, file));
    }
  }

  console.log(`\nFound ${toProcess.length} files needing transparency fix.\n`);

  if (toProcess.length === 0) {
    console.log("✨ All files are already perfectly transparent.");
    return;
  }

  // Create temporary python script for processing to avoid paths issues
  const pyScriptPath = path.join(process.cwd(), 'run_rembg_temp.py');
  const pyScript = `
import os
from rembg import remove, new_session

input_dir = '${tempDir}'
output_dir = '${tempOutDir}'
session = new_session("u2net")

for filename in os.listdir(input_dir):
    if filename.endswith('.png'):
        input_path = os.path.join(input_dir, filename)
        output_path = os.path.join(output_dir, filename)
        try:
            with open(input_path, 'rb') as i:
                input_data = i.read()
                output_data = remove(
                    input_data, 
                    session=session,
                    alpha_matting=True,
                    alpha_matting_foreground_threshold=240,
                    alpha_matting_background_threshold=10,
                    alpha_matting_erode_size=10
                )
                with open(output_path, 'wb') as o:
                    o.write(output_data)
        except Exception as e:
            print(f"Error on {filename}: {e}")
`;

  fs.writeFileSync(pyScriptPath, pyScript, 'utf8');

  console.log("⏳ Running AI Background Removal (rembg). This may take a while...");
  try {
    execSync('python3 run_rembg_temp.py', { stdio: 'inherit' });
  } catch (error) {
    console.error("❌ Python rembg script failed:", error);
  } finally {
    if (fs.existsSync(pyScriptPath)) fs.unlinkSync(pyScriptPath);
  }

  console.log("\n🧪 Running final quality checks on processed images...");
  
  let successCount = 0;
  let failCount = 0;

  for (const file of toProcess) {
    const outPath = path.join(tempOutDir, file);
    if (!fs.existsSync(outPath)) {
      console.error(`❌ Failed to process: ${file} (Output not found)`);
      // Restore original if failed
      fs.renameSync(path.join(tempDir, file), path.join(premiumDir, file));
      failCount++;
      continue;
    }

    const res = await checkTransparency(outPath);
    if (res.isPassed) {
      // Move to final premium folder
      fs.renameSync(outPath, path.join(premiumDir, file));
      console.log(`✅ FIXED: ${file} (Trans: ${(res.transparentRatio*100).toFixed(1)}%, White: ${(res.whiteRatio*100).toFixed(1)}%)`);
      successCount++;
    } else {
      console.log(`❌ STILL FAILED: ${file} - ${res.reason}`);
      // Keep original in premium folder, mark as rejected or delete it based on policy.
      // We'll restore the original so it's not lost, but ideally it should be removed.
      fs.renameSync(path.join(tempDir, file), path.join(premiumDir, file));
      failCount++;
    }
  }

  // Cleanup temp dirs
  fs.rmSync(tempDir, { recursive: true, force: true });
  fs.rmSync(tempOutDir, { recursive: true, force: true });

  console.log(`\n✨ Repair Pipeline Complete. SUCCESS: ${successCount} | STILL FAILING: ${failCount}`);
}

if (require.main === module) {
  fixTransparency().catch(console.error);
}

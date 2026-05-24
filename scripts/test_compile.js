const { execSync } = require('child_process');
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  execSync('npm run build', { stdio: 'inherit' });
  console.log("SUCCESS");
} catch (e) {
  console.error("FAILED");
}

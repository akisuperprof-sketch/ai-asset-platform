import fs from 'fs';
import path from 'path';
import motionRules from './rules/motion-rules.json';

const FORBIDDEN_COLORS = ['bg-red', 'bg-blue', 'bg-green', 'bg-purple', 'bg-emerald', 'bg-rose', 'bg-cyan', 'bg-ai-gradient', 'bg-ai-cyan'];
const FORBIDDEN_SHADOWS = ['shadow-glow'];

export interface AuditResult {
  file: string;
  violations: string[];
}

export function runDesignAudit(dirPath: string): AuditResult[] {
  const results: AuditResult[] = [];
  
  function walkDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        walkDir(fullPath);
      } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const violations: string[] = [];
        
        FORBIDDEN_COLORS.forEach(color => {
          if (content.includes(color)) violations.push(`Forbidden color: ${color}`);
        });
        
        FORBIDDEN_SHADOWS.forEach(shadow => {
          if (content.includes(shadow)) violations.push(`Forbidden shadow: ${shadow}`);
        });

        motionRules.forbidden_classes.forEach(motion => {
          if (content.includes(motion)) violations.push(`Forbidden motion: ${motion}`);
        });

        if (violations.length > 0) {
          results.push({ file: fullPath, violations });
        }
      }
    }
  }

  walkDir(dirPath);
  return results;
}

if (require.main === module) {
  const targetDir = path.resolve(__dirname, '../../src');
  const audit = runDesignAudit(targetDir);
  console.log('Design Audit Results:', JSON.stringify(audit, null, 2));
}

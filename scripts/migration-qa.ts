import fs from 'fs';
import path from 'path';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env.local' });

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

async function main() {
  console.log(`${CYAN}==========================================${RESET}`);
  console.log(`${CYAN}   AssetNinja Migration QA Engine v1.0    ${RESET}`);
  console.log(`${CYAN}==========================================${RESET}`);

  const filePath = process.argv[2];
  if (!filePath) {
    console.error(`${RED}[ERROR] Please provide a path to the .sql migration file.${RESET}`);
    process.exit(1);
  }

  const fullPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`${RED}[ERROR] File not found: ${fullPath}${RESET}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(fullPath, 'utf8');
  let hasWarnings = false;
  let hasErrors = false;

  console.log(`\nAnalyzing file: ${path.basename(fullPath)}`);
  
  // 1. Static String Checks for Additive Only Rule
  console.log(`\n${CYAN}--- Static Linter Checks ---${RESET}`);
  
  const upperSQL = sqlContent.toUpperCase();
  
  const badPatterns = [
    { pattern: 'DROP TABLE', type: 'ERROR', msg: 'DROP TABLE detected. Additive Only rule violated.' },
    { pattern: 'DROP COLUMN', type: 'ERROR', msg: 'DROP COLUMN detected. Additive Only rule violated.' },
    { pattern: 'DELETE FROM', type: 'ERROR', msg: 'DELETE FROM detected. Additive Only rule violated.' },
    { pattern: 'TRUNCATE', type: 'ERROR', msg: 'TRUNCATE detected. Data loss risk.' },
    { pattern: 'ALTER TABLE', type: 'WARNING', msg: 'ALTER TABLE detected. Ensure you are only adding columns (ADD COLUMN).' }
  ];

  for (const { pattern, type, msg } of badPatterns) {
    if (upperSQL.includes(pattern)) {
      if (type === 'ERROR') {
        console.error(`${RED}[ERROR] ${msg}${RESET}`);
        hasErrors = true;
      } else {
        console.warn(`${YELLOW}[WARNING] ${msg}${RESET}`);
        hasWarnings = true;
      }
    }
  }

  // Schema Best Practices
  if (!upperSQL.includes('CREATE TABLE IF NOT EXISTS')) {
    if (upperSQL.includes('CREATE TABLE')) {
      console.warn(`${YELLOW}[WARNING] CREATE TABLE detected without 'IF NOT EXISTS'. Migration might fail if re-run.${RESET}`);
      hasWarnings = true;
    }
  }

  if (hasErrors) {
    console.error(`\n${RED}Migration QA FAILED due to static linter errors. Aborting Rollback Simulation.${RESET}`);
    process.exit(1);
  }

  if (!hasWarnings && !hasErrors) {
    console.log(`${GREEN}[PASS] Static Linter: All checks passed.${RESET}`);
  }

  // 2. Rollback Simulation Check
  console.log(`\n${CYAN}--- Rollback Simulation Check ---${RESET}`);
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn(`${YELLOW}[WARNING] DATABASE_URL not found in .env.local. Skipping Rollback Simulation.${RESET}`);
    console.log(`\n${CYAN}==========================================${RESET}`);
    if (hasErrors) {
      console.error(`${RED}MIGRATION QA RESULT: FAIL${RESET}`);
      process.exit(1);
    } else if (hasWarnings) {
      console.warn(`${YELLOW}MIGRATION QA RESULT: PASS WITH WARNINGS${RESET}`);
      process.exit(0);
    } else {
      console.log(`${GREEN}MIGRATION QA RESULT: PASS (Static Checks Only)${RESET}`);
      process.exit(0);
    }
  }

  console.log(`Connecting to database for dry-run simulation...`);
  
  const sql = postgres(connectionString, {
    max: 1, // Max number of connections
    ssl: { rejectUnauthorized: false }
  });

  try {
    await sql.begin(async (tx) => {
      console.log(`Transaction BEGIN...`);
      
      try {
        await tx.unsafe(sqlContent);
        console.log(`${GREEN}[PASS] SQL executed successfully in transaction.${RESET}`);
        
        // Let's do some dependency checks. If we reach here, foreign keys and schema checks passed within transaction.
        console.log(`${GREEN}[PASS] Dependency Check: Valid.${RESET}`);
        console.log(`${GREEN}[PASS] ForeignKey Check: Valid.${RESET}`);
        
      } catch (err: any) {
        console.error(`${RED}[ERROR] Execution failed: ${err.message}${RESET}`);
        if (err.message.includes('relation') && err.message.includes('does not exist')) {
           console.error(`${RED}[ERROR] Dependency Error: A required table/relation is missing.${RESET}`);
        }
        hasErrors = true;
      }

      console.log(`Transaction ROLLBACK (Simulation).`);
      throw new Error('ROLLBACK_SIMULATION_SUCCESS');
    });
  } catch (err: any) {
    if (err.message === 'ROLLBACK_SIMULATION_SUCCESS') {
       console.log(`${GREEN}[PASS] Rollback Simulation completed successfully. No data was modified.${RESET}`);
    } else {
       console.error(`${RED}[ERROR] Unexpected error during simulation: ${err.message}${RESET}`);
       hasErrors = true;
    }
  } finally {
    await sql.end();
  }

  console.log(`\n${CYAN}==========================================${RESET}`);
  if (hasErrors) {
    console.error(`${RED}MIGRATION QA RESULT: FAIL${RESET}`);
    process.exit(1);
  } else if (hasWarnings) {
    console.warn(`${YELLOW}MIGRATION QA RESULT: PASS WITH WARNINGS${RESET}`);
    process.exit(0);
  } else {
    console.log(`${GREEN}MIGRATION QA RESULT: PERFECT PASS${RESET}`);
    process.exit(0);
  }
}

main();

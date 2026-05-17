import { loadEnv } from "../lib/env";

console.log("🔍 Checking environment variables...");
loadEnv(true);
console.log("\n✨ All required environment variables are set correctly.");
process.exit(0);

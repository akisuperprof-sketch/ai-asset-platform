import dotenv from "dotenv";
import path from "path";
import fs from "fs";

/**
 * Loads environment variables securely.
 * Prioritizes .env.local, then falls back to .env.vercel
 */
export function loadEnv(requireValidation: boolean = true) {
  const localPath = path.resolve(process.cwd(), ".env.local");
  const vercelPath = path.resolve(process.cwd(), ".env.vercel");

  if (fs.existsSync(localPath)) {
    dotenv.config({ path: localPath });
    // If we loaded .env.local but it only has VERCEL_OIDC_TOKEN, warn the user
    if (process.env.VERCEL_OIDC_TOKEN && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.warn("⚠️ 警告: .env.local が vercel env pull で上書きされた可能性があります！ (VERCEL_OIDC_TOKEN のみ検出)");
    }
  } else if (fs.existsSync(vercelPath)) {
    dotenv.config({ path: vercelPath });
  }

  if (requireValidation) {
    const REQUIRED_KEYS = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "SUPABASE_STORAGE_BUCKET"
    ];

    const missing: string[] = [];
    REQUIRED_KEYS.forEach((key) => {
      const val = process.env[key];
      if (!val || val.trim() === "") {
        missing.push(key);
      }
    });

    if (missing.length > 0) {
      console.error("❌ MISSING Environment Variables: " + missing.join(", "));
      console.error("\nPlease check your .env.local or .env.vercel file.");
      process.exit(1);
    }
  }
}

// In standard Next.js client/server code, process.env is usually injected at build time 
// or available at runtime. This script loader is primarily for our Node.js scripts in `src/scripts/`.

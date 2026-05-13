import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function listBuckets() {
  const { adminClient } = await import("../lib/supabase");

  if (!adminClient) {
    console.error("❌ adminClient is null");
    return;
  }

  const { data, error } = await adminClient.storage.listBuckets();

  if (error) {
    console.error("❌ List buckets error:", error.message);
  } else {
    console.log("📂 Available Buckets:", data.map(b => b.name));
  }
}

listBuckets();

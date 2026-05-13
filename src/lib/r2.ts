import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { adminClient } from "./supabase";

/**
 * SUKASHI ストレージ・抽象化レイヤー
 * 初期は Supabase Storage を使用し、将来的に R2 への切り替えを可能にします。
 */

const r2Endpoint = process.env.R2_ENDPOINT || "";
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID || "";
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
const r2BucketName = process.env.R2_BUCKET_NAME || "";
const expiresStr = process.env.DOWNLOAD_URL_EXPIRES_IN || "3600";
const expiresIn = parseInt(expiresStr, 10);

const supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET || "sukashi-assets";

// R2 クライアント (将来用/オプション)
const r2Client = new S3Client({
  region: "auto",
  endpoint: r2Endpoint,
  credentials: {
    accessKeyId: r2AccessKeyId,
    secretAccessKey: r2SecretAccessKey,
  },
});

/**
 * 素材のダウンロード用署名付きURLを生成する
 */
export async function getDownloadUrl(key: string) {
  // 1. R2 が設定されている場合は R2 を優先 (将来のスケール用)
  if (r2AccessKeyId && r2Endpoint && r2BucketName) {
    try {
      const command = new GetObjectCommand({
        Bucket: r2BucketName,
        Key: key,
      });
      return await getSignedUrl(r2Client, command, { expiresIn });
    } catch (error) {
      console.error("R2 Error (getDownloadUrl):", error);
      // R2 失敗時はフォールバックせずエラーを投げる (設定があるのに失敗したため)
      throw new Error("Failed to generate R2 storage link");
    }
  }

  // 2. R2 が未設定の場合は Supabase Storage を使用 (初期MVP)
  if (adminClient) {
    try {
      const { data, error } = await adminClient.storage
        .from(supabaseBucket)
        .createSignedUrl(key, expiresIn);

      if (error) throw error;
      if (data?.signedUrl) return data.signedUrl;
    } catch (error) {
      console.error("Supabase Storage Error (getDownloadUrl):", error);
    }
  }

  // 3. すべて失敗した場合はダミー画像を返す (開発用フォールバック)
  console.warn("Storage credentials missing or error occurred, using fallback URL.");
  return `https://dummyimage.com/1000x1000/000/fff.png&text=Storage+Fallback+URL`;
}

/**
 * ストレージ内にファイルが存在するか確認する
 */
export async function checkFileExists(key: string): Promise<boolean> {
  // R2 優先チェック
  if (r2AccessKeyId && r2Endpoint && r2BucketName) {
    try {
      const { S3Client, HeadObjectCommand } = await import("@aws-sdk/client-s3");
      const command = new HeadObjectCommand({ Bucket: r2BucketName, Key: key });
      await r2Client.send(command);
      return true;
    } catch {
      return false;
    }
  }

  // Supabase Storage チェック
  if (adminClient) {
    try {
      const { data, error } = await adminClient.storage
        .from(supabaseBucket)
        .list(pathDir(key), { search: pathBase(key) });
      
      if (error) return false;
      return data.some(f => f.name === pathBase(key));
    } catch {
      return false;
    }
  }

  return false;
}

// 簡易パスユーティリティ
function pathDir(fullPath: string) {
  const parts = fullPath.split('/');
  return parts.length > 1 ? parts.slice(0, -1).join('/') : '';
}
function pathBase(fullPath: string) {
  const parts = fullPath.split('/');
  return parts[parts.length - 1];
}

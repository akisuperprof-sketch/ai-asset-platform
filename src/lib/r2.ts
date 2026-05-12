import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2Endpoint = process.env.R2_ENDPOINT || "";
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID || "";
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
const r2BucketName = process.env.R2_BUCKET_NAME || "";
const expiresStr = process.env.DOWNLOAD_URL_EXPIRES_IN || "3600";
const expiresIn = parseInt(expiresStr, 10);

const r2Client = new S3Client({
  region: "auto",
  endpoint: r2Endpoint,
  credentials: {
    accessKeyId: r2AccessKeyId,
    secretAccessKey: r2SecretAccessKey,
  },
});

export async function getDownloadUrl(key: string) {
  if (!r2AccessKeyId || !r2Endpoint || !r2BucketName) {
    // Fallback or development mock
    console.warn("R2 credentials missing, using fallback URL.");
    return `https://dummyimage.com/1000x1000/000/fff.png&text=R2+Mock+Download`;
  }

  try {
    const command = new GetObjectCommand({
      Bucket: r2BucketName,
      Key: key,
    });

    return await getSignedUrl(r2Client, command, { expiresIn });
  } catch (error) {
    console.error("R2 Error (getDownloadUrl):", error);
    throw new Error("Failed to generate storage link");
  }
}

import { S3Client } from "@aws-sdk/client-s3";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

if (!accountId || !accessKeyId || !secretAccessKey) {
  throw new Error("Missing Cloudflare R2 credentials.");
}

const R2 = new S3Client({
  region: "auto",
  endpoint: `https://<CLOUDFLARE_ACCOUNT_ID>.r2.cloudflarestorage.com`.replace(
    "<CLOUDFLARE_ACCOUNT_ID>",
    accountId
  ),
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export default R2;

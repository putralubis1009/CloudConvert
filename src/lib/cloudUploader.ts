/**
 * Cloud Storage Uploader — S3-Compatible API with High-Speed Concurrent Multi-Upload
 * Supports: Cloudflare R2, Amazon S3, DigitalOcean Spaces, Backblaze B2, MinIO, etc.
 */

import { S3Client, PutObjectCommand, ListBucketsCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { appendJobLog, updateJobProgress } from "./progressStore";

export interface CloudStorageConfig {
  provider: "r2" | "s3" | "spaces" | "b2" | "minio" | "custom";
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  basePath: string;
}

export interface UploadProgress {
  totalFiles: number;
  uploadedFiles: number;
  currentFile: string;
  percent: number;
  totalBytes: number;
  uploadedBytes: number;
}

export interface UploadResult {
  success: boolean;
  uploadedFiles: number;
  totalFiles: number;
  totalBytes: number;
  errors: string[];
  urls: string[];
}

function createS3Client(config: CloudStorageConfig): S3Client {
  return new S3Client({
    endpoint: config.endpoint,
    region: config.region || "auto",
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: config.provider === "minio",
  });
}

export async function testCloudConnection(config: CloudStorageConfig): Promise<{ success: boolean; message: string }> {
  try {
    const client = createS3Client(config);
    await client.send(new ListBucketsCommand({}));
    return { success: true, message: `Berhasil terhubung ke ${config.provider.toUpperCase()} — bucket "${config.bucket}" siap digunakan.` };
  } catch (err: any) {
    return { success: false, message: `Gagal: ${err.message || "Koneksi ditolak. Periksa endpoint, access key, dan secret key."}` };
  }
}

function collectFiles(dir: string, baseDir: string): { relativePath: string; absolutePath: string; size: number }[] {
  const results: { relativePath: string; absolutePath: string; size: number }[] = [];

  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath, baseDir));
    } else {
      const stat = fs.statSync(fullPath);
      results.push({
        relativePath: path.relative(baseDir, fullPath).replace(/\\/g, "/"),
        absolutePath: fullPath,
        size: stat.size,
      });
    }
  }

  return results;
}

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".m3u8": return "application/vnd.apple.mpegurl";
    case ".ts": return "video/mp2t";
    case ".mp4": return "video/mp4";
    case ".webm": return "video/webm";
    case ".mp3": return "audio/mpeg";
    case ".json": return "application/json";
    default: return "application/octet-stream";
  }
}

/**
 * Concurrent Worker Pool for Ultra-Fast Parallel Uploads
 */
async function runConcurrentPool<T>(
  items: T[],
  concurrency: number,
  task: (item: T) => Promise<void>
): Promise<void> {
  let index = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (index < items.length) {
      const current = items[index++];
      await task(current);
    }
  });
  await Promise.all(workers);
}

/**
 * Upload an entire folder to S3-compatible cloud storage with Parallel Concurrency
 */
export async function uploadFolderToS3(
  localFolder: string,
  config: CloudStorageConfig,
  jobId?: string,
  onProgress?: (progress: UploadProgress) => void,
  concurrency: number = 8,
  deleteLocalAfterUpload: boolean = false
): Promise<UploadResult> {
  const client = createS3Client(config);
  const files = collectFiles(localFolder, localFolder);
  const totalFiles = files.length;
  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
  let uploadedFiles = 0;
  let uploadedBytes = 0;
  const errors: string[] = [];
  const urls: string[] = [];

  if (jobId) {
    appendJobLog(jobId, "─".repeat(50));
    appendJobLog(jobId, `[Cloud] Multi-Stream Parallel Upload (${concurrency}x concurrent streams) dimulai ke ${config.provider.toUpperCase()}`);
    appendJobLog(jobId, `[Cloud] Bucket: ${config.bucket} | Path: ${config.basePath || "/"}`);
    appendJobLog(jobId, `[Cloud] Total: ${totalFiles} file | ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
    updateJobProgress(jobId, {
      uploadStatus: "uploading",
      uploadPercent: 0,
      uploadedFiles: 0,
      totalUploadFiles: totalFiles,
      currentPhase: `Mengunggah (${concurrency}x parallel)...`,
    });
  }

  const folderName = path.basename(localFolder);
  const includeFolderName = folderName && !folderName.startsWith("job_") && !folderName.startsWith("hls_") && folderName !== "hls";

  await runConcurrentPool(files, concurrency, async (file) => {
    const cleanRelPath = file.relativePath.replace(/^\/+/, "");
    const prefix = config.basePath ? config.basePath.replace(/\/+$/, "").replace(/^\/+/, "") : "";

    let key = "";
    if (prefix && includeFolderName) {
      key = `${prefix}/${folderName}/${cleanRelPath}`;
    } else if (prefix) {
      key = `${prefix}/${cleanRelPath}`;
    } else if (includeFolderName) {
      key = `${folderName}/${cleanRelPath}`;
    } else {
      key = cleanRelPath;
    }

    try {
      const fileBuffer = fs.readFileSync(file.absolutePath);

      await client.send(new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: getMimeType(file.relativePath),
      }));

      uploadedFiles++;
      uploadedBytes += file.size;
      const percent = Math.min(100, Math.round((uploadedFiles / totalFiles) * 100));

      urls.push(key);

      if (jobId) {
        appendJobLog(jobId, `[Upload] ✓ ${key} (${(file.size / 1024).toFixed(1)} KB) [${uploadedFiles}/${totalFiles}]`);
        updateJobProgress(jobId, {
          uploadPercent: percent,
          uploadedFiles,
          currentPhase: `Mengunggah ke ${config.provider.toUpperCase()} (${uploadedFiles}/${totalFiles} file)...`,
        });
      }

      if (onProgress) {
        onProgress({
          totalFiles,
          uploadedFiles,
          currentFile: key,
          percent,
          totalBytes,
          uploadedBytes,
        });
      }
    } catch (err: any) {
      const errMsg = `Gagal upload ${file.relativePath}: ${err.message}`;
      errors.push(errMsg);
      if (jobId) {
        appendJobLog(jobId, `[Upload] ✗ ${errMsg}`);
      }
    }
  });

  const success = errors.length === 0;

  if (jobId) {
    if (success) {
      appendJobLog(jobId, `[Cloud] ✅ Upload selesai 100%! ${uploadedFiles}/${totalFiles} file berhasil tersimpan di Bucket '${config.bucket}'.`);
    } else {
      appendJobLog(jobId, `[Cloud] ⚠️ Upload selesai dengan ${errors.length} error.`);
    }
    updateJobProgress(jobId, {
      uploadStatus: success ? "done" : "error",
      uploadPercent: 100,
      uploadedFiles,
      status: success ? "done" : "error",
      percentOverall: 100,
      currentPhase: success ? "Render & Upload Berhasil Selesai!" : "Upload Gagal",
    });
  }

  if (success && deleteLocalAfterUpload) {
    try {
      if (fs.existsSync(localFolder)) {
        fs.rmSync(localFolder, { recursive: true, force: true });
        const parentDir = path.dirname(localFolder);
        if (
          parentDir.includes("hls_temp_jobs") ||
          parentDir.includes("hls_converter_temp") ||
          parentDir.includes("novastack_hls_temp") ||
          parentDir.includes("temp_jobs")
        ) {
          try {
            fs.rmSync(parentDir, { recursive: true, force: true });
          } catch {}
        }
        if (jobId) {
          appendJobLog(jobId, `[System 🧹] File sementara di PC otomatis dibersihkan (0 MB tersisa di disk PC).`);
        }
      }
    } catch (cleanErr: any) {
      console.error("Cleanup error:", cleanErr);
    }
  }

  return { success, uploadedFiles, totalFiles, totalBytes: uploadedBytes, errors, urls };
}

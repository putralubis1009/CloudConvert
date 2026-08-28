import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import os from "os";
import { MOCK_VIDEOS_LIST } from "@/data/mockVideos";
import {
  PROFILE_DEFINITIONS,
  type Resolution,
  type SegmentDuration,
} from "@/lib/transcodeEngine";
import { createJobWorkspace, saveTempFile } from "@/lib/tempStorage";
import {
  runRealFfmpegHls,
  runMultiQualityHls,
  type OutputFormat,
  type PerformanceProfile,
  type HardwareAccel,
} from "@/lib/ffmpegRunner";
import { createJobProgress, updateJobProgress } from "@/lib/progressStore";
import { uploadFolderToS3, type CloudStorageConfig } from "@/lib/cloudUploader";

interface HlsConversionResult {
  jobId: string;
  status: "completed" | "processing" | "failed";
  createdAt: string;
  renderMode: "single" | "multi";
  outputFormat: OutputFormat;
  video: {
    originalName: string;
    originalSizeBytes: number;
    durationSec: number;
  };
  config: {
    resolution: Resolution;
    resolutions?: string[];
    segmentDuration: SegmentDuration;
    bitrateKbps: number;
  };
  output: {
    m3u8Filename: string;
    zipFilename: string;
    m3u8Content: string;
    totalSegments: number;
    estimatedTotalSizeBytes: number;
    outputFolder: string;
    segments: Array<{
      index: number;
      filename: string;
      durationSec: number;
      sizeBytes: number;
    }>;
    downloadLinks: {
      zip: string;
      m3u8: string;
      sampleTs: string;
    };
  };
}

// In-memory Jobs Storage
const jobsStore = new Map<string, HlsConversionResult>();

// ─── POST /api/convert ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let filename = "video.mp4";
    let fileSizeBytes = 25 * 1024 * 1024;
    let durationSec = 120;
    let resolution: Resolution = "1080p";
    let resolutions: Resolution[] = [];
    let segmentDuration: SegmentDuration = 10;
    let outputFormat: OutputFormat = "hls";
    let fileBuffer: Buffer | null = null;
    let outDir: string | null = null;
    let renderMode: "single" | "multi" = "single";
    let performanceProfile: PerformanceProfile = "medium";
    let hardwareAccel: HardwareAccel = "auto";
    let cloudConfig: CloudStorageConfig | null = null;
    let isCloudMode = false;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const mockId = formData.get("mockId") as string | null;
      const res = formData.get("resolution") as Resolution | null;
      const seg = formData.get("segmentDuration") as string | null;
      const resolsRaw = formData.get("resolutions") as string | null;
      const modeRaw = formData.get("renderMode") as string | null;
      const formatRaw = formData.get("outputFormat") as OutputFormat | null;
      const perfRaw = formData.get("performanceProfile") as PerformanceProfile | null;
      const hwRaw = formData.get("hardwareAccel") as HardwareAccel | null;
      const cloudRaw = formData.get("cloudConfig") as string | null;
      const cloudModeRaw = formData.get("isCloudMode") as string | null;
      if (cloudModeRaw === "true") isCloudMode = true;
      outDir = formData.get("outputFolder") as string | null;

      if (modeRaw === "multi") renderMode = "multi";
      if (formatRaw && ["hls", "mp4", "webm", "mp3"].includes(formatRaw)) outputFormat = formatRaw;
      if (perfRaw && ["low", "medium", "high"].includes(perfRaw)) performanceProfile = perfRaw;
      if (hwRaw) hardwareAccel = hwRaw;
      if (cloudRaw) {
        try { cloudConfig = JSON.parse(cloudRaw); isCloudMode = true; } catch {}
      }

      // Parse multi resolutions
      if (resolsRaw) {
        try {
          resolutions = JSON.parse(resolsRaw);
        } catch {}
      }

      if (res && PROFILE_DEFINITIONS[res]) resolution = res;
      if (seg) {
        const sNum = parseInt(seg, 10);
        if (sNum === 5 || sNum === 10 || sNum === 15) segmentDuration = sNum as SegmentDuration;
      }
      if (outDir && !isCloudMode) {
        try {
          if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        } catch (e) {}
      }

      if (file) {
        filename = file.name;
        fileSizeBytes = file.size;
        const arrayBuf = await file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuf);
      } else if (mockId) {
        const mockItem = MOCK_VIDEOS_LIST.find((m) => m.id === mockId);
        if (mockItem) {
          filename = mockItem.name;
          fileSizeBytes = mockItem.sizeMB * 1024 * 1024;
          durationSec = mockItem.durationSec;
        }
      }
    } else {
      const body = await req.json();
      if (body.filename) filename = body.filename;
      if (body.fileSizeBytes) fileSizeBytes = body.fileSizeBytes;
      if (body.durationSec) durationSec = body.durationSec;
      if (body.isCloudMode) isCloudMode = true;
      if (body.resolution && PROFILE_DEFINITIONS[body.resolution as Resolution]) {
        resolution = body.resolution as Resolution;
      }
      if (body.outputFormat && ["hls", "mp4", "webm", "mp3"].includes(body.outputFormat)) {
        outputFormat = body.outputFormat;
      }
      if (body.segmentDuration) {
        const s = Number(body.segmentDuration);
        if (s === 5 || s === 10 || s === 15) segmentDuration = s as SegmentDuration;
      }
    }

    const jobId = `job_hls_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const safeSlug = filename.replace(/\.[a-zA-Z0-9]+$/i, "").replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
    const m3u8Filename = `${safeSlug}_${resolution}.m3u8`;
    const zipFilename = `${safeSlug}_${resolution}_seg${segmentDuration}s.zip`;

    const workspace = createJobWorkspace(jobId);

    // ── UNIFIED FOLDER CREATION ──
    const folderSuffix = outputFormat === "hls" ? "HLS" : outputFormat.toUpperCase();
    const unifiedFolderName = `${safeSlug}_${folderSuffix}`;

    let baseOutputDirectory = "";
    if (isCloudMode) {
      // Isolate strictly in temp directory away from user's personal video folder!
      const tempDir = path.join(os.tmpdir(), "hls_converter_temp", jobId);
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      baseOutputDirectory = tempDir;
    } else {
      baseOutputDirectory = outDir || workspace.dirPath;
    }

    const outputDir = path.join(baseOutputDirectory, unifiedFolderName);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // ── MULTI-QUALITY MODE ──
    if (renderMode === "multi" && fileBuffer && resolutions.length > 0) {
      createJobProgress(jobId, "multi", resolutions.length);

      const inputPath = saveTempFile(jobId, "input.mp4", fileBuffer);

      // Run async — don't await here, let polling handle it
      runMultiQualityHls({
        inputFilePath: inputPath,
        outputDirectory: outputDir,
        resolutions,
        segmentDuration,
        outputFormat,
        performanceProfile,
        hardwareAccel,
        jobId,
      }).then(async (result) => {
        if (result.success && cloudConfig) {
          updateJobProgress(jobId, {
            currentPhase: `Mengunggah ke ${cloudConfig.provider.toUpperCase()}...`,
            uploadStatus: "uploading",
          });
          try {
            await uploadFolderToS3(outputDir, cloudConfig, jobId, undefined, 8, isCloudMode);
          } catch (e) {}
        } else {
          updateJobProgress(jobId, {
            status: result.success ? "done" : "error",
            percentOverall: result.success ? 100 : 0,
            currentPhase: result.success ? "Selesai!" : "Gagal",
            error: result.success ? undefined : result.error,
          });
        }
      }).catch((err) => {
        updateJobProgress(jobId, {
          status: "error",
          currentPhase: "Error",
          error: String(err),
        });
      });

      // Return immediately with jobId for polling
      return NextResponse.json({
        success: true,
        async: true,
        jobId,
        renderMode: "multi",
        outputDir,
      });
    }

    // ── SINGLE MODE ──
    if (fileBuffer) {
      createJobProgress(jobId, "single", 1);

      const inputPath = saveTempFile(jobId, "input.mp4", fileBuffer);

      // Run async — let polling handle progress & completion
      runRealFfmpegHls({
        inputFilePath: inputPath,
        outputDirectory: outputDir,
        resolution,
        segmentDuration,
        outputFormat,
        performanceProfile,
        hardwareAccel,
        jobId,
      }).then(async (realResult) => {
        if (realResult.success && cloudConfig) {
          updateJobProgress(jobId, {
            currentPhase: `Mengunggah ke ${cloudConfig.provider.toUpperCase()}...`,
            uploadStatus: "uploading",
          });
          try {
            await uploadFolderToS3(outputDir, cloudConfig, jobId, undefined, 8, isCloudMode);
          } catch (e) {}
        } else {
          updateJobProgress(jobId, {
            status: realResult.success ? "done" : "error",
            percentOverall: 100,
            percentCurrent: 100,
            currentPhase: realResult.success ? "Selesai!" : "Gagal",
            error: realResult.error,
          });
        }
      }).catch((err) => {
        updateJobProgress(jobId, {
          status: "error",
          currentPhase: "Error",
          error: String(err),
        });
      });

      return NextResponse.json({
        success: true,
        async: true,
        jobId,
        renderMode: "single",
        outputDir,
      });
    }

    const totalSegs = Math.ceil(durationSec / segmentDuration);
    const totalSize = Math.round(fileSizeBytes * 0.85);

    const conversionResult: HlsConversionResult = {
      jobId,
      status: "completed",
      createdAt: new Date().toISOString(),
      renderMode,
      outputFormat,
      video: { originalName: filename, originalSizeBytes: fileSizeBytes, durationSec },
      config: {
        resolution,
        segmentDuration,
        bitrateKbps: PROFILE_DEFINITIONS[resolution]?.bitrateKbps || 2800,
      },
      output: {
        m3u8Filename,
        zipFilename,
        m3u8Content: `#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-STREAM-INF:BANDWIDTH=2800000\n${resolution}/index.m3u8`,
        totalSegments: totalSegs,
        estimatedTotalSizeBytes: totalSize,
        outputFolder: outputDir,
        segments: Array.from({ length: totalSegs }).map((_, i) => ({
          index: i,
          filename: `chunk_${String(i).padStart(3, "0")}.ts`,
          durationSec: segmentDuration,
          sizeBytes: Math.round(totalSize / totalSegs),
        })),
        downloadLinks: {
          zip: `/api/download?jobId=${jobId}&type=zip&filename=${encodeURIComponent(filename)}&resolution=${resolution}&segmentDuration=${segmentDuration}&segmentCount=${totalSegs}`,
          m3u8: `/api/download?jobId=${jobId}&type=m3u8&filename=${encodeURIComponent(filename)}&resolution=${resolution}&segmentDuration=${segmentDuration}&segmentCount=${totalSegs}`,
          sampleTs: `/api/download?jobId=${jobId}&type=ts`,
        },
      },
    };

    jobsStore.set(jobId, conversionResult);

    return NextResponse.json({ success: true, data: conversionResult });
  } catch (error: unknown) {
    console.error("Error in /api/convert:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan pada server saat memproses konversi." },
      { status: 500 }
    );
  }
}

function getJobProgressSafe(jobId: string): number {
  try {
    const { getJobProgress } = require("@/lib/progressStore");
    return getJobProgress(jobId)?.percentOverall || 0;
  } catch {
    return 0;
  }
}

// ─── GET /api/convert ─────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({
      success: true,
      message: "HLS Conversion API Backend is healthy and ready.",
      supportedResolutions: Object.keys(PROFILE_DEFINITIONS),
      supportedSegmentDurations: [5, 10, 15],
    });
  }

  const job = jobsStore.get(jobId);
  if (!job) {
    return NextResponse.json(
      { success: false, error: "Job konversi tidak ditemukan." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: job });
}

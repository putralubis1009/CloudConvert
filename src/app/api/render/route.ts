import { NextRequest, NextResponse } from "next/server";
import { MOCK_VIDEOS_LIST } from "@/data/mockVideos";

// ─── Types ─────────────────────────────────────────────────────────────────────
type Resolution = "144p" | "240p" | "360p" | "480p" | "720p" | "1080p";
type SegmentDuration = 5 | 10 | 15;
type QualityPreset = "economy" | "balanced" | "ultra";

interface RenderJobRequest {
  sourceVideoName: string;
  sourceDurationSec: number;
  sourceResolution: string;
  isAdaptiveLadder: boolean;
  selectedResolution: Resolution;
  activeLadderVariants: Resolution[];
  segmentDuration: SegmentDuration;
  qualityPreset: QualityPreset;
  outputFolderPath: string;
  createSubfolder: boolean;
  subfolderName: string;
}

interface RenderStageProgress {
  stage: "demuxing" | "transcoding" | "segmenting" | "packaging" | "completed";
  percent: number;
  message: string;
}

interface RenderJobRecord {
  jobId: string;
  status: "queued" | "rendering" | "completed" | "failed";
  progress: number;
  currentStage: RenderStageProgress;
  createdAt: string;
  request: RenderJobRequest;
  output: {
    targetDirectory: string;
    masterM3u8: string;
    totalTsSegments: number;
    generatedFfmpegCommand: string;
    downloadZipUrl: string;
    downloadM3u8Url: string;
  };
}

// ─── In-memory Render Store ───────────────────────────────────────────────────
const renderJobs = new Map<string, RenderJobRecord>();

// ─── Preset Configs ────────────────────────────────────────────────────────────
const PRESET_CRF: Record<QualityPreset, number> = {
  economy: 28,
  balanced: 23,
  ultra: 18,
};

const RES_BITRATES: Record<Resolution, { width: number; height: number; bitrate: string }> = {
  "144p": { width: 256, height: 144, bitrate: "250k" },
  "240p": { width: 426, height: 240, bitrate: "500k" },
  "360p": { width: 640, height: 360, bitrate: "800k" },
  "480p": { width: 854, height: 480, bitrate: "1400k" },
  "720p": { width: 1280, height: 720, bitrate: "2800k" },
  "1080p": { width: 1920, height: 1080, bitrate: "5000k" },
};

function buildFfmpegCommand(req: RenderJobRequest): string {
  const crf = PRESET_CRF[req.qualityPreset] || 23;
  const segTime = req.segmentDuration;
  const outputDir = req.createSubfolder
    ? `${req.outputFolderPath}\\${req.subfolderName}`
    : req.outputFolderPath;

  if (req.isAdaptiveLadder && req.activeLadderVariants.length > 0) {
    // Multi-variant HLS FFmpeg command
    return `ffmpeg -i input.mp4 -preset fast -crf ${crf} -g 60 -sc_threshold 0 -hls_time ${segTime} -hls_playlist_type vod -master_pl_name master.m3u8 "${outputDir}\\stream_%v.m3u8"`;
  }

  // Single variant HLS command
  const spec = RES_BITRATES[req.selectedResolution] || RES_BITRATES["720p"];
  return `ffmpeg -i "${req.sourceVideoName}" -vf scale=${spec.width}:${spec.height} -c:v libx264 -crf ${crf} -b:v ${spec.bitrate} -c:a aac -b:a 128k -f hls -hls_time ${segTime} -hls_playlist_type vod -hls_segment_filename "${outputDir}\\segment_%03d.ts" "${outputDir}\\output.m3u8"`;
}

// ─── POST /api/render ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body: Partial<RenderJobRequest> = await req.json();

    const requestPayload: RenderJobRequest = {
      sourceVideoName: body.sourceVideoName || "sample_video.mp4",
      sourceDurationSec: body.sourceDurationSec || 120,
      sourceResolution: body.sourceResolution || "1080p",
      isAdaptiveLadder: Boolean(body.isAdaptiveLadder),
      selectedResolution: body.selectedResolution || "720p",
      activeLadderVariants: body.activeLadderVariants || ["480p", "720p", "1080p"],
      segmentDuration: body.segmentDuration || 10,
      qualityPreset: body.qualityPreset || "balanced",
      outputFolderPath: body.outputFolderPath || "C:\\Users\\User\\Videos\\HLS_Output",
      createSubfolder: body.createSubfolder ?? true,
      subfolderName: body.subfolderName || "hls_transcode",
    };

    const jobId = `render_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const segmentCount = Math.max(1, Math.ceil(requestPayload.sourceDurationSec / requestPayload.segmentDuration));
    const targetDirectory = requestPayload.createSubfolder
      ? `${requestPayload.outputFolderPath}\\${requestPayload.subfolderName}`
      : requestPayload.outputFolderPath;

    const ffmpegCommand = buildFfmpegCommand(requestPayload);

    const newJob: RenderJobRecord = {
      jobId,
      status: "completed",
      progress: 100,
      currentStage: {
        stage: "completed",
        percent: 100,
        message: `Transcoding selesai: ${segmentCount} segmen .ts dan master.m3u8 berhasil dibuat.`,
      },
      createdAt: new Date().toISOString(),
      request: requestPayload,
      output: {
        targetDirectory,
        masterM3u8: "master.m3u8",
        totalTsSegments: segmentCount,
        generatedFfmpegCommand: ffmpegCommand,
        downloadZipUrl: `/api/download?jobId=${jobId}&type=zip&filename=${encodeURIComponent(requestPayload.sourceVideoName)}&resolution=${requestPayload.selectedResolution}&segmentDuration=${requestPayload.segmentDuration}&segmentCount=${segmentCount}`,
        downloadM3u8Url: `/api/download?jobId=${jobId}&type=m3u8&filename=${encodeURIComponent(requestPayload.sourceVideoName)}&resolution=${requestPayload.selectedResolution}&segmentDuration=${requestPayload.segmentDuration}&segmentCount=${segmentCount}`,
      },
    };

    renderJobs.set(jobId, newJob);

    return NextResponse.json({
      success: true,
      jobId,
      message: "Render job berhasil dibuat dan diproses.",
      data: newJob,
    });
  } catch (err: unknown) {
    console.error("Error in /api/render:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memproses render job pada server." },
      { status: 500 }
    );
  }
}

// ─── GET /api/render ──────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({
      success: true,
      message: "Render Video API is active and listening.",
      endpoints: {
        createJob: "POST /api/render",
        getJobStatus: "GET /api/render?jobId=<jobId>",
      },
      totalActiveJobs: renderJobs.size,
    });
  }

  const job = renderJobs.get(jobId);
  if (!job) {
    return NextResponse.json(
      { success: false, error: "Job render dengan ID tersebut tidak ditemukan." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: job,
  });
}

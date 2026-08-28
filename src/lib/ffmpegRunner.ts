import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { appendJobLog, updateJobProgress } from "./progressStore";

export type Resolution = "144p" | "240p" | "360p" | "480p" | "720p" | "1080p" | "1440p" | "2160p";
export type OutputFormat = "hls" | "mp4" | "webm" | "mp3";
export type PerformanceProfile = "low" | "medium" | "high";
export type HardwareAccel = "auto" | "cpu" | "nvenc" | "qsv" | "amf";

export interface RealTranscodeParams {
  inputFilePath: string;
  outputDirectory: string;
  resolution: Resolution;
  segmentDuration: number;
  outputFormat?: OutputFormat;
  performanceProfile?: PerformanceProfile;
  hardwareAccel?: HardwareAccel;
  jobId?: string;
  onProgress?: (percent: number, fps: number, speed: string) => void;
}

const activeProcesses = new Map<string, any>();

export function killJobProcess(jobId?: string): boolean {
  if (jobId) {
    const proc = activeProcesses.get(jobId);
    if (proc) {
      try {
        proc.kill("SIGKILL");
      } catch {}
      activeProcesses.delete(jobId);
      return true;
    }
    return false;
  } else {
    activeProcesses.forEach((proc) => {
      try {
        proc.kill("SIGKILL");
      } catch {}
    });
    activeProcesses.clear();
    return true;
  }
}

export interface MultiQualityParams {
  inputFilePath: string;
  outputDirectory: string;
  resolutions: Resolution[];
  segmentDuration: number;
  outputFormat?: OutputFormat;
  performanceProfile?: PerformanceProfile;
  hardwareAccel?: HardwareAccel;
  jobId: string;
}

export interface RealTranscodeResult {
  success: boolean;
  outputDir: string;
  masterPlaylistPath: string;
  variantPlaylistPath: string;
  segmentFiles: string[];
  totalSizeBytes: number;
  durationSec: number;
  error?: string;
}

export interface MultiQualityResult {
  success: boolean;
  outputDir: string;
  masterPlaylistPath: string;
  results: Array<{
    resolution: string;
    result: RealTranscodeResult;
  }>;
  totalSizeBytes: number;
  error?: string;
}

export const RESOLUTION_SPECS: Record<Resolution, { width: number; height: number; bitrate: string; bandwidth: number }> = {
  "2160p": { width: 3840, height: 2160, bitrate: "16000k", bandwidth: 16000000 },
  "1440p": { width: 2560, height: 1440, bitrate: "9000k",  bandwidth: 9000000  },
  "1080p": { width: 1920, height: 1080, bitrate: "5000k",  bandwidth: 5000000  },
  "720p":  { width: 1280, height: 720,   bitrate: "2800k",  bandwidth: 2800000  },
  "480p":  { width: 854,  height: 480,   bitrate: "1400k",  bandwidth: 1400000  },
  "360p":  { width: 640,  height: 360,   bitrate: "800k",   bandwidth: 800000   },
  "240p":  { width: 426,  height: 240,   bitrate: "400k",   bandwidth: 400000   },
  "144p":  { width: 256,  height: 144,   bitrate: "200k",   bandwidth: 200000   },
};

export function getHardwareParams(profile: PerformanceProfile = "medium", accel: HardwareAccel = "auto") {
  const totalCpus = os.cpus()?.length || 4;
  let threads = 0;
  let preset = "veryfast";
  let description = "";

  switch (profile) {
    case "low":
      threads = Math.max(1, Math.floor(totalCpus * 0.33));
      preset = "ultrafast";
      description = `Low / Hemat Daya (Dibatasi ${threads} Threads CPU)`;
      break;
    case "medium":
      threads = Math.max(2, Math.floor(totalCpus * 0.70));
      preset = "veryfast";
      description = `Medium / Seimbang (${threads} Threads CPU)`;
      break;
    case "high":
    default:
      threads = 0;
      preset = "veryfast"; // Optimal 3x speedup for 4K/2K encoding
      description = `High / Turbo (${totalCpus} Cores 100% Maksimal + Fast 4K Engine)`;
      break;
  }

  return { threads, preset, description, profile, accel, totalCpus };
}

export function findFfmpegPath(): string {
  const localAppData = process.env.LOCALAPPDATA || "C:\\Users\\TODAY TECH\\AppData\\Local";
  const wingetPackageDir = path.join(localAppData, "Microsoft", "WinGet", "Packages");

  const possiblePaths = [
    path.join(localAppData, "Microsoft", "WinGet", "Packages", "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe", "ffmpeg-9.0.1-full_build", "bin", "ffmpeg.exe"),
    path.join(localAppData, "Microsoft", "WinGet", "Links", "ffmpeg.exe"),
    "C:\\ffmpeg\\bin\\ffmpeg.exe",
    "C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe",
    "ffmpeg.exe",
    "ffmpeg",
  ];

  for (const p of possiblePaths) {
    try { if (fs.existsSync(p)) return p; } catch {}
  }

  try {
    if (fs.existsSync(wingetPackageDir)) {
      const pkgs = fs.readdirSync(wingetPackageDir);
      for (const pkg of pkgs) {
        if (pkg.toLowerCase().includes("ffmpeg")) {
          const binDir = path.join(wingetPackageDir, pkg);
          const subdirs = fs.readdirSync(binDir);
          for (const sub of subdirs) {
            const exeCandidate = path.join(binDir, sub, "bin", "ffmpeg.exe");
            if (fs.existsSync(exeCandidate)) return exeCandidate;
          }
        }
      }
    }
  } catch {}

  return "ffmpeg";
}

/**
 * Parse FFmpeg stderr for realtime progress.
 */
function parseFfmpegProgress(line: string): { timeSec: number; fps: number; speed: string } | null {
  const timeMatch = line.match(/time=(\d+):(\d+):(\d+\.?\d*)/);
  const fpsMatch = line.match(/fps=\s*([\d.]+)/);
  const speedMatch = line.match(/speed=\s*([\d.]+)x/);

  if (!timeMatch) return null;

  const h = parseInt(timeMatch[1]);
  const m = parseInt(timeMatch[2]);
  const s = parseFloat(timeMatch[3]);
  const timeSec = h * 3600 + m * 60 + s;
  const fps = fpsMatch ? parseFloat(fpsMatch[1]) : 0;
  const speed = speedMatch ? `${speedMatch[1]}x` : "?x";

  return { timeSec, fps, speed };
}

function formatEta(remainingSec: number): string {
  if (remainingSec <= 0 || !isFinite(remainingSec)) return "Sebentar lagi...";
  const m = Math.floor(remainingSec / 60);
  const s = Math.floor(remainingSec % 60);
  if (m > 0) return `~${m}m ${s}s`;
  return `~${s}s`;
}

/**
 * Get video duration in seconds using ffprobe or fallback safely
 */
function getVideoDuration(inputFilePath: string): Promise<number> {
  return new Promise((resolve) => {
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(120);
      }
    }, 2500);

    try {
      const ffprobe = findFfmpegPath().replace("ffmpeg.exe", "ffprobe.exe").replace(/ffmpeg$/, "ffprobe");
      const proc = spawn(ffprobe, [
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        inputFilePath,
      ], { shell: false, windowsHide: true });

      let out = "";
      proc.stdout.on("data", (d) => out += d.toString());
      proc.on("close", () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          const dur = parseFloat(out.trim());
          resolve(isNaN(dur) || dur <= 0 ? 120 : dur);
        }
      });
      proc.on("error", () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(120);
        }
      });
    } catch {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve(120);
      }
    }
  });
}

/**
 * Single-resolution transcode (supports HLS, MP4, WebM, MP3) with realtime progress
 */
export async function runRealFfmpegHls(params: RealTranscodeParams): Promise<RealTranscodeResult> {
  const {
    inputFilePath,
    outputDirectory,
    resolution,
    segmentDuration,
    outputFormat = "hls",
    performanceProfile = "medium",
    hardwareAccel = "auto",
    jobId,
    onProgress,
  } = params;

  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
  }

  const spec = RESOLUTION_SPECS[resolution] || RESOLUTION_SPECS["1080p"];
  const ffmpegBin = findFfmpegPath();
  const hw = getHardwareParams(performanceProfile, hardwareAccel);
  const videoDuration = await getVideoDuration(inputFilePath);

  if (jobId) {
    appendJobLog(jobId, `[Hardware] Mode: ${hw.description}`);
    appendJobLog(jobId, `[Format] Output Type: ${outputFormat.toUpperCase()}`);
  }

  let args: string[] = [];
  let targetOutputPath = "";
  let resDir = outputDirectory;

  if (outputFormat === "mp4") {
    targetOutputPath = path.join(outputDirectory, `output_${resolution}.mp4`);
    args = [
      "-y",
      "-i", inputFilePath,
      "-vf", `scale=${spec.width}:${spec.height}:force_original_aspect_ratio=decrease,pad=${spec.width}:${spec.height}:(ow-iw)/2:(oh-ih)/2`,
      "-c:v", "libx264",
      "-b:v", spec.bitrate,
      "-preset", hw.preset,
      "-c:a", "aac",
      "-b:a", "192k",
      "-movflags", "+faststart",
      targetOutputPath,
    ];
  } else if (outputFormat === "webm") {
    targetOutputPath = path.join(outputDirectory, `output_${resolution}.webm`);
    args = [
      "-y",
      "-i", inputFilePath,
      "-vf", `scale=${spec.width}:${spec.height}:force_original_aspect_ratio=decrease,pad=${spec.width}:${spec.height}:(ow-iw)/2:(oh-ih)/2`,
      "-c:v", "libvpx-vp9",
      "-b:v", spec.bitrate,
      "-c:a", "libopus",
      "-b:a", "128k",
      targetOutputPath,
    ];
  } else if (outputFormat === "mp3") {
    targetOutputPath = path.join(outputDirectory, `audio.mp3`);
    args = [
      "-y",
      "-i", inputFilePath,
      "-vn",
      "-c:a", "libmp3lame",
      "-b:a", "320k",
      targetOutputPath,
    ];
  } else {
    // Default: HLS
    resDir = path.join(outputDirectory, resolution);
    if (!fs.existsSync(resDir)) fs.mkdirSync(resDir, { recursive: true });

    targetOutputPath = path.join(resDir, "index.m3u8");
    const segmentPattern = path.join(resDir, "chunk_%03d.ts");

    args = [
      "-y",
      "-i", inputFilePath,
      "-vf", `scale=${spec.width}:${spec.height}:force_original_aspect_ratio=decrease,pad=${spec.width}:${spec.height}:(ow-iw)/2:(oh-ih)/2`,
      "-c:v", "libx264",
      "-b:v", spec.bitrate,
      "-maxrate", spec.bitrate,
      "-bufsize", `${parseInt(spec.bitrate) * 2}k`,
      "-preset", hw.preset,
    ];

    if (hw.threads > 0) args.push("-threads", String(hw.threads));

    args.push(
      "-g", String(segmentDuration * 30),
      "-sc_threshold", "0",
      "-c:a", "aac",
      "-b:a", "128k",
      "-ac", "2",
      "-hls_time", String(segmentDuration),
      "-hls_playlist_type", "vod",
      "-hls_segment_filename", segmentPattern,
      targetOutputPath
    );
  }

  if (outputFormat !== "hls" && hw.threads > 0) {
    args.splice(args.length - 1, 0, "-threads", String(hw.threads));
  }

  return new Promise((resolve) => {
    const proc = spawn(ffmpegBin, args, { shell: false, windowsHide: true });
    if (jobId) activeProcesses.set(jobId, proc);
    let stderr = "";

    proc.stderr.on("data", (data) => {
      const chunk = data.toString();
      stderr += chunk;

      for (const line of chunk.split("\n")) {
        const parsed = parseFfmpegProgress(line);
        if (parsed && videoDuration > 0) {
          const pct = Math.min(99, Math.round((parsed.timeSec / videoDuration) * 100));
          const remainSec = videoDuration > 0 && parsed.timeSec > 0
            ? (videoDuration - parsed.timeSec) / Math.max(0.1, parseFloat(parsed.speed) || 1)
            : 0;

          if (onProgress) onProgress(pct, parsed.fps, parsed.speed);

          if (jobId) {
            updateJobProgress(jobId, {
              percentCurrent: pct,
              percentOverall: pct,
              fps: parsed.fps,
              speed: parsed.speed,
              eta: formatEta(remainSec),
            });
          }
        }
      }
    });

    proc.on("close", (code) => {
      if (code === 0 && fs.existsSync(targetOutputPath)) {
        let masterPath = "";
        let segmentFiles: string[] = [];
        let totalSizeBytes = 0;

        if (outputFormat === "hls") {
          masterPath = path.join(outputDirectory, "master.m3u8");
          const masterContent = [
            "#EXTM3U",
            "#EXT-X-VERSION:3",
            `# Created by HLS Converter Engine`,
            "",
            `#EXT-X-STREAM-INF:BANDWIDTH=${spec.bandwidth},RESOLUTION=${spec.width}x${spec.height}`,
            `${resolution}/index.m3u8`,
            "",
          ].join("\n");
          fs.writeFileSync(masterPath, masterContent, "utf-8");

          const files = fs.readdirSync(resDir);
          segmentFiles = files.filter((f) => f.endsWith(".ts"));
          files.forEach((f) => { totalSizeBytes += fs.statSync(path.join(resDir, f)).size; });
        } else {
          totalSizeBytes = fs.statSync(targetOutputPath).size;
          segmentFiles = [path.basename(targetOutputPath)];
        }

        resolve({
          success: true,
          outputDir: outputDirectory,
          masterPlaylistPath: masterPath,
          variantPlaylistPath: targetOutputPath,
          segmentFiles,
          totalSizeBytes,
          durationSec: videoDuration,
        });
      } else {
        resolve({
          success: false,
          outputDir: outputDirectory,
          masterPlaylistPath: "",
          variantPlaylistPath: "",
          segmentFiles: [],
          totalSizeBytes: 0,
          durationSec: 0,
          error: stderr.slice(-500) || `FFmpeg exited with code ${code}`,
        });
      }
    });
  });
}

/**
 * Multi-quality ABR HLS transcode with 4K/2K resolution support & unified folder packaging
 */
export async function runMultiQualityHls(params: MultiQualityParams): Promise<MultiQualityResult> {
  const {
    inputFilePath,
    outputDirectory,
    resolutions,
    segmentDuration,
    performanceProfile = "medium",
    hardwareAccel = "auto",
    jobId,
  } = params;

  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
  }

  const ffmpegBin = findFfmpegPath();
  const hw = getHardwareParams(performanceProfile, hardwareAccel);
  const videoDuration = await getVideoDuration(inputFilePath);
  const results: Array<{ resolution: string; result: RealTranscodeResult }> = [];
  let totalSizeBytes = 0;

  appendJobLog(jobId, `[Engine] FFmpeg: ${ffmpegBin}`);
  appendJobLog(jobId, `[Hardware] Profil: ${hw.description}`);
  appendJobLog(jobId, `[Video] Durasi: ${videoDuration.toFixed(1)}s | Root Folder: ${outputDirectory}`);
  appendJobLog(jobId, `[Config] Resolusi: ${resolutions.join(", ")} | Segmen: ${segmentDuration}s`);
  appendJobLog(jobId, "─".repeat(50));

  for (let i = 0; i < resolutions.length; i++) {
    const resolution = resolutions[i];
    const spec = RESOLUTION_SPECS[resolution] || RESOLUTION_SPECS["1080p"];
    const resDir = path.join(outputDirectory, resolution);
    const phaseLabel = `Rendering ${resolution} (${i + 1}/${resolutions.length})`;

    if (!fs.existsSync(resDir)) fs.mkdirSync(resDir, { recursive: true });

    updateJobProgress(jobId, {
      currentResolution: resolution,
      currentPhase: phaseLabel,
      percentCurrent: 0,
    });
    appendJobLog(jobId, `[Start] ${phaseLabel} — ${spec.width}x${spec.height} @ ${spec.bitrate}`);

    const variantM3u8Path = path.join(resDir, "index.m3u8");
    const segmentPattern = path.join(resDir, "chunk_%03d.ts");

    const args = [
      "-y",
      "-i", inputFilePath,
      "-vf", `scale=${spec.width}:${spec.height}:force_original_aspect_ratio=decrease,pad=${spec.width}:${spec.height}:(ow-iw)/2:(oh-ih)/2`,
      "-c:v", "libx264",
      "-b:v", spec.bitrate,
      "-maxrate", spec.bitrate,
      "-bufsize", `${parseInt(spec.bitrate) * 2}k`,
      "-preset", hw.preset,
    ];

    if (hw.threads > 0) args.push("-threads", String(hw.threads));

    args.push(
      "-g", String(segmentDuration * 30),
      "-sc_threshold", "0",
      "-c:a", "aac",
      "-b:a", "128k",
      "-ac", "2",
      "-hls_time", String(segmentDuration),
      "-hls_playlist_type", "vod",
      "-hls_segment_filename", segmentPattern,
      variantM3u8Path
    );

    const resResult = await new Promise<RealTranscodeResult>((resolve) => {
      const proc = spawn(ffmpegBin, args, { shell: false, windowsHide: true });
      if (jobId) activeProcesses.set(jobId, proc);
      let stderr = "";

      proc.stderr.on("data", (data) => {
        const chunk = data.toString();
        stderr += chunk;

        for (const line of chunk.split("\n")) {
          const parsed = parseFfmpegProgress(line);
          if (parsed && videoDuration > 0) {
            const pctCurrent = Math.min(99, Math.round((parsed.timeSec / videoDuration) * 100));
            const pctOverall = Math.round(
              ((i / resolutions.length) + (pctCurrent / 100) / resolutions.length) * 100
            );
            const remainSec = parsed.timeSec > 0
              ? ((videoDuration - parsed.timeSec) / Math.max(0.1, parseFloat(parsed.speed) || 1))
                * (resolutions.length - i)
              : 0;

            updateJobProgress(jobId, {
              percentCurrent: pctCurrent,
              percentOverall: pctOverall,
              fps: parsed.fps,
              speed: parsed.speed,
              eta: formatEta(remainSec),
            });
          }
        }
      });

      proc.on("close", (code) => {
        if (code === 0 && fs.existsSync(variantM3u8Path)) {
          const files = fs.readdirSync(resDir);
          const segmentFiles = files.filter((f) => f.endsWith(".ts"));
          let sz = 0;
          files.forEach((f) => { sz += fs.statSync(path.join(resDir, f)).size; });

          appendJobLog(jobId, `[Done] ${resolution} — ${segmentFiles.length} segmen, ${(sz / 1024 / 1024).toFixed(2)} MB`);

          resolve({
            success: true,
            outputDir: resDir,
            masterPlaylistPath: "",
            variantPlaylistPath: variantM3u8Path,
            segmentFiles,
            totalSizeBytes: sz,
            durationSec: segmentFiles.length * segmentDuration,
          });
        } else {
          appendJobLog(jobId, `[Error] ${resolution} gagal — code ${code}`);
          resolve({
            success: false,
            outputDir: resDir,
            masterPlaylistPath: "",
            variantPlaylistPath: "",
            segmentFiles: [],
            totalSizeBytes: 0,
            durationSec: 0,
            error: stderr.slice(-300) || `FFmpeg exited with code ${code}`,
          });
        }
      });
    });

    results.push({ resolution, result: resResult });
    totalSizeBytes += resResult.totalSizeBytes;

    updateJobProgress(jobId, {
      completedResolutions: i + 1,
      percentOverall: Math.round(((i + 1) / resolutions.length) * 100),
      percentCurrent: 100,
    });
  }

  // Build ABR Master M3U8 inside the unified outputDirectory
  const masterPath = path.join(outputDirectory, "master.m3u8");
  const successResults = results.filter((r) => r.result.success);

  const masterLines = [
    "#EXTM3U",
    "#EXT-X-VERSION:3",
    `# Multi-Quality ABR — Generated by HLS Converter Engine`,
    `# Resolutions: ${resolutions.join(", ")}`,
    "",
  ];

  for (const { resolution } of successResults) {
    const spec = RESOLUTION_SPECS[resolution as Resolution] || RESOLUTION_SPECS["1080p"];
    masterLines.push(
      `#EXT-X-STREAM-INF:BANDWIDTH=${spec.bandwidth},RESOLUTION=${spec.width}x${spec.height},CODECS="avc1.64001f,mp4a.40.2"`
    );
    masterLines.push(`${resolution}/index.m3u8`);
  }
  masterLines.push("");

  fs.writeFileSync(masterPath, masterLines.join("\n"), "utf-8");
  appendJobLog(jobId, "─".repeat(50));
  appendJobLog(jobId, `[Master] master.m3u8 berhasil dibuat di folder induk`);
  appendJobLog(jobId, `[Total] Ukuran total: ${(totalSizeBytes / 1024 / 1024).toFixed(2)} MB`);
  appendJobLog(jobId, `[Ready] Seluruh folder '${path.basename(outputDirectory)}' siap digunakan / diunggah!`);

  return {
    success: successResults.length > 0,
    outputDir: outputDirectory,
    masterPlaylistPath: masterPath,
    results,
    totalSizeBytes,
  };
}

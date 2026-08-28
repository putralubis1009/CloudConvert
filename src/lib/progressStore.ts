/**
 * Global in-memory progress store for realtime FFmpeg job tracking.
 * Written by ffmpegRunner, read by /api/render/progress endpoint.
 */

export interface JobProgress {
  jobId: string;
  status: "idle" | "running" | "done" | "error";
  renderMode: "single" | "multi";
  currentResolution: string;
  currentPhase: string; // e.g. "Rendering 720p (2/3)..."
  percentOverall: number; // 0–100
  percentCurrent: number; // 0–100 for current resolution
  fps: number;
  speed: string; // e.g. "2.4x"
  eta: string; // human readable, e.g. "~1m 20s"
  totalResolutions: number;
  completedResolutions: number;
  logs: string[];
  error?: string;
  startedAt: number;
  updatedAt: number;
  // Cloud upload tracking
  uploadStatus?: "idle" | "uploading" | "done" | "error";
  uploadPercent?: number;
  uploadedFiles?: number;
  totalUploadFiles?: number;
}

// Singleton in-memory store
const progressStore = new Map<string, JobProgress>();

export function createJobProgress(jobId: string, renderMode: "single" | "multi", totalResolutions: number): JobProgress {
  const now = Date.now();
  const prog: JobProgress = {
    jobId,
    status: "running",
    renderMode,
    currentResolution: "",
    currentPhase: "Mempersiapkan...",
    percentOverall: 0,
    percentCurrent: 0,
    fps: 0,
    speed: "0x",
    eta: "Menghitung...",
    totalResolutions,
    completedResolutions: 0,
    logs: [`[System] Job ${jobId} dimulai`],
    startedAt: now,
    updatedAt: now,
  };
  progressStore.set(jobId, prog);
  return prog;
}

export function updateJobProgress(jobId: string, updates: Partial<JobProgress>): void {
  const existing = progressStore.get(jobId);
  if (existing) {
    progressStore.set(jobId, { ...existing, ...updates, updatedAt: Date.now() });
  }
}

export function appendJobLog(jobId: string, log: string): void {
  const existing = progressStore.get(jobId);
  if (existing) {
    existing.logs = [...existing.logs.slice(-50), log]; // keep last 50 logs
    existing.updatedAt = Date.now();
    progressStore.set(jobId, existing);
  }
}

export function getJobProgress(jobId: string): JobProgress | undefined {
  return progressStore.get(jobId);
}

export function deleteJobProgress(jobId: string): void {
  progressStore.delete(jobId);
}

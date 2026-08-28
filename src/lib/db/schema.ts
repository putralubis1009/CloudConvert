// Lightweight schema definition for render jobs (Zero storage overhead)

export interface RenderJobRecord {
  id: string;
  filename: string;
  sourceSize: string;
  resolutions: string[];
  segmentDuration: number;
  outputFolder: string;
  outputSize: string;
  tsSegmentsCount: number;
  status: "completed" | "processing" | "failed";
  progress: number;
  fps?: number;
  createdAt: string;
  completedAt?: string;
  masterM3u8Url?: string;
  zipDownloadUrl?: string;
}

export interface RenderFileRecord {
  id: string;
  jobId: string;
  fileType: "master_playlist" | "variant_playlist" | "ts_segment";
  resolution?: string;
  relativePath: string;
  fileSizeBytes: number;
  durationSeconds?: number;
}

export const DB_CONFIG = {
  driver: "memory-store",
  autoCleanupHours: 24,
  maxRecords: 50,
};

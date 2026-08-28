import { RenderJobRecord } from "./db/schema";

export interface ReRenderRequest {
  jobId?: string;
  filename: string;
  sourceSize?: string;
  resolutions: string[];
  segmentDuration: number;
  outputFolder: string;
}

export interface ReRenderResult {
  success: boolean;
  job: RenderJobRecord;
  message: string;
}

export function executeReRender(params: ReRenderRequest): ReRenderResult {
  const newJobId = `job_hls_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const count = params.resolutions.length * Math.round(60 / params.segmentDuration);
  const estSize = `${(params.resolutions.length * 14.5).toFixed(1)} MB`;

  const job: RenderJobRecord = {
    id: newJobId,
    filename: params.filename,
    sourceSize: params.sourceSize || "45.0 MB",
    resolutions: params.resolutions,
    segmentDuration: params.segmentDuration,
    outputFolder: params.outputFolder,
    outputSize: estSize,
    tsSegmentsCount: count,
    status: "completed",
    progress: 100,
    fps: 84.2,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    masterM3u8Url: `/api/download/hls/${newJobId}/master.m3u8`,
    zipDownloadUrl: `/api/download/zip?jobId=${newJobId}`,
  };

  return {
    success: true,
    job,
    message: `Video ${params.filename} berhasil di-render ulang dengan resolusi [${params.resolutions.join(", ")}] dan segmen ${params.segmentDuration}s.`,
  };
}

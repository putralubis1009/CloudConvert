export interface RenderHistoryItem {
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
  createdAt: string;
  completedAt?: string;
  fps: number;
  masterM3u8Url: string;
  zipDownloadUrl: string;
}

export const INITIAL_RENDER_HISTORY: RenderHistoryItem[] = [];


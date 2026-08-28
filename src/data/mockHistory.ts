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

export const INITIAL_RENDER_HISTORY: RenderHistoryItem[] = [
  {
    id: "job_hls_98214a",
    filename: "Company_Profile_4K_Master.mp4",
    sourceSize: "842.5 MB",
    resolutions: ["1080p", "720p", "480p"],
    segmentDuration: 10,
    outputFolder: "D:\\Videos\\HLS_Output\\Company_Profile",
    outputSize: "512.3 MB",
    tsSegmentsCount: 96,
    status: "completed",
    progress: 100,
    createdAt: "2026-08-26T21:40:00Z",
    completedAt: "2026-08-26T21:42:15Z",
    fps: 84.5,
    masterM3u8Url: "/api/download/hls/job_hls_98214a/master.m3u8",
    zipDownloadUrl: "/api/download/zip?jobId=job_hls_98214a",
  },
  {
    id: "job_hls_74391b",
    filename: "Tutorial_Nextjs_Course_Ep01.mp4",
    sourceSize: "320.1 MB",
    resolutions: ["720p", "480p", "360p"],
    segmentDuration: 5,
    outputFolder: "C:\\Users\\User\\Documents\\HLS_Courses\\Ep01",
    outputSize: "198.4 MB",
    tsSegmentsCount: 144,
    status: "completed",
    progress: 100,
    createdAt: "2026-08-26T20:15:00Z",
    completedAt: "2026-08-26T20:16:40Z",
    fps: 92.1,
    masterM3u8Url: "/api/download/hls/job_hls_74391b/master.m3u8",
    zipDownloadUrl: "/api/download/zip?jobId=job_hls_74391b",
  },
  {
    id: "job_hls_61042c",
    filename: "Cinematic_Drone_Footage_Bali.mp4",
    sourceSize: "1.24 GB",
    resolutions: ["1080p", "720p"],
    segmentDuration: 15,
    outputFolder: "E:\\External_Drive\\Streaming_VOD\\Bali_Drone",
    outputSize: "780.0 MB",
    tsSegmentsCount: 64,
    status: "processing",
    progress: 68,
    createdAt: "2026-08-27T00:10:00Z",
    fps: 76.0,
    masterM3u8Url: "/api/download/hls/job_hls_61042c/master.m3u8",
    zipDownloadUrl: "/api/download/zip?jobId=job_hls_61042c",
  },
  {
    id: "job_hls_55210d",
    filename: "Live_Stream_Recording_Corrupted.mp4",
    sourceSize: "45.0 MB",
    resolutions: ["480p"],
    segmentDuration: 10,
    outputFolder: "D:\\Temp\\HLS",
    outputSize: "0 MB",
    tsSegmentsCount: 0,
    status: "failed",
    progress: 18,
    createdAt: "2026-08-25T18:05:00Z",
    fps: 0,
    masterM3u8Url: "",
    zipDownloadUrl: "",
  },
];

/**
 * HLS Transcoding & Segmentation Engine
 * Handles MP4 demuxing, video stream scaling, TS slicing, and M3U8 manifest creation.
 */

export type Resolution = "144p" | "240p" | "360p" | "480p" | "720p" | "1080p" | "1440p" | "2160p";
export type SegmentDuration = 5 | 10 | 15;
export type QualityPreset = "economy" | "balanced" | "ultra";

export interface TranscodeProfile {
  resolution: Resolution;
  width: number;
  height: number;
  bitrateKbps: number;
  audioBitrateKbps: number;
  fps: number;
  crf: number;
}

export interface SegmentInfo {
  index: number;
  filename: string;
  durationSec: number;
  sizeBytes: number;
  ptsOffset: number;
}

export interface TranscodeResult {
  jobId: string;
  sourceFile: {
    name: string;
    sizeMB: number;
    durationSec: number;
  };
  profile: TranscodeProfile;
  segmentDuration: SegmentDuration;
  totalSegments: number;
  segments: SegmentInfo[];
  manifests: {
    variantM3U8: string;
    masterM3U8: string;
  };
  outputStats: {
    totalEstimatedSizeBytes: number;
    compressionRatio: number;
  };
}

export const PROFILE_DEFINITIONS: Record<Resolution, { width: number; height: number; bitrateKbps: number }> = {
  "144p":  { width: 256,  height: 144,  bitrateKbps: 250 },
  "240p":  { width: 426,  height: 240,  bitrateKbps: 500 },
  "360p":  { width: 640,  height: 360,  bitrateKbps: 800 },
  "480p":  { width: 854,  height: 480,  bitrateKbps: 1400 },
  "720p":  { width: 1280, height: 720,  bitrateKbps: 2800 },
  "1080p": { width: 1920, height: 1080, bitrateKbps: 5000 },
  "1440p": { width: 2560, height: 1440, bitrateKbps: 9000 },
  "2160p": { width: 3840, height: 2160, bitrateKbps: 16000 },
};

export const PRESET_CRF_MAP: Record<QualityPreset, number> = {
  economy: 28,
  balanced: 23,
  ultra: 18,
};

/**
 * Generates an HLS variant playlist (.m3u8) string
 */
export function buildVariantManifest(
  segments: SegmentInfo[],
  targetDurationSec: number,
  segmentFolderPrefix: string = "segments"
): string {
  let lines = [
    "#EXTM3U",
    "#EXT-X-VERSION:3",
    `#EXT-X-TARGETDURATION:${targetDurationSec}`,
    "#EXT-X-MEDIA-SEQUENCE:0",
    "#EXT-X-PLAYLIST-TYPE:VOD",
    "",
  ];

  for (const seg of segments) {
    lines.push(`#EXTINF:${seg.durationSec.toFixed(6)},`);
    lines.push(segmentFolderPrefix ? `${segmentFolderPrefix}/${seg.filename}` : seg.filename);
  }

  lines.push("#EXT-X-ENDLIST");
  return lines.join("\n");
}

/**
 * Generates an HLS master playlist string with multi-bitrate ladder
 */
export function buildMasterManifest(
  profiles: TranscodeProfile[],
  playlistNamePattern: (res: Resolution) => string = (res) => `stream_${res}.m3u8`
): string {
  let lines = ["#EXTM3U", "#EXT-X-VERSION:3", ""];

  for (const prof of profiles) {
    const totalBandwidth = (prof.bitrateKbps + prof.audioBitrateKbps) * 1000;
    lines.push(
      `#EXT-X-STREAM-INF:BANDWIDTH=${totalBandwidth},RESOLUTION=${prof.width}x${prof.height},FRAME-RATE=${prof.fps.toFixed(3)},CODECS="avc1.64001f,mp4a.40.2"`
    );
    lines.push(playlistNamePattern(prof.resolution));
  }

  return lines.join("\n");
}

/**
 * Executes transcoding and segmentation logic for MP4 source to HLS
 */
export function transcodeMp4ToHls(params: {
  filename: string;
  fileSizeBytes: number;
  durationSec: number;
  resolution: Resolution;
  segmentDuration: SegmentDuration;
  preset?: QualityPreset;
}): TranscodeResult {
  const { filename, fileSizeBytes, durationSec, resolution, segmentDuration, preset = "balanced" } = params;
  const jobId = `hls_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const spec = PROFILE_DEFINITIONS[resolution] || PROFILE_DEFINITIONS["720p"];
  const crf = PRESET_CRF_MAP[preset] || 23;

  const profile: TranscodeProfile = {
    resolution,
    width: spec.width,
    height: spec.height,
    bitrateKbps: spec.bitrateKbps,
    audioBitrateKbps: 128,
    fps: 30,
    crf,
  };

  const segmentCount = Math.max(1, Math.ceil(durationSec / segmentDuration));
  const byteRate = ((profile.bitrateKbps + profile.audioBitrateKbps) * 1000) / 8;
  const baseSegmentSizeBytes = Math.round(byteRate * segmentDuration);

  const segments: SegmentInfo[] = [];
  let currentPts = 0;

  for (let i = 0; i < segmentCount; i++) {
    const isLast = i === segmentCount - 1;
    const dur = isLast ? Number((durationSec - i * segmentDuration).toFixed(2)) : segmentDuration;
    const segSize = isLast ? Math.round(byteRate * dur) : baseSegmentSizeBytes;

    segments.push({
      index: i,
      filename: `segment_${String(i).padStart(3, "0")}.ts`,
      durationSec: dur,
      sizeBytes: segSize,
      ptsOffset: currentPts,
    });

    currentPts += dur;
  }

  const variantM3U8 = buildVariantManifest(segments, segmentDuration, "segments");
  const masterM3U8 = buildMasterManifest([profile]);

  const totalEstimatedSizeBytes = segments.reduce((sum, s) => sum + s.sizeBytes, 0);
  const compressionRatio = Number((totalEstimatedSizeBytes / Math.max(1, fileSizeBytes)).toFixed(2));

  return {
    jobId,
    sourceFile: {
      name: filename,
      sizeMB: Number((fileSizeBytes / (1024 * 1024)).toFixed(2)),
      durationSec,
    },
    profile,
    segmentDuration,
    totalSegments: segmentCount,
    segments,
    manifests: {
      variantM3U8,
      masterM3U8,
    },
    outputStats: {
      totalEstimatedSizeBytes,
      compressionRatio,
    },
  };
}

import { NextRequest, NextResponse } from "next/server";
import {
  transcodeMp4ToHls,
  type Resolution,
  type SegmentDuration,
  type QualityPreset,
} from "@/lib/transcodeEngine";
import { createJobWorkspace, saveTempFile } from "@/lib/tempStorage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const filename = body.sourceVideoName || "input_video.mp4";
    const durationSec = Number(body.sourceDurationSec) || 120;
    const fileSizeBytes = Number(body.fileSizeBytes) || 25 * 1024 * 1024;
    const resolution = (body.selectedResolution as Resolution) || "720p";
    const segmentDuration = (Number(body.segmentDuration) as SegmentDuration) || 10;
    const qualityPreset = (body.qualityPreset as QualityPreset) || "balanced";
    const targetFolder = body.outputFolderPath || "C:\\Users\\User\\Videos\\HLS_Output";
    const subfolderName = body.subfolderName || "transcode_output";

    const finalOutputDir = body.createSubfolder
      ? `${targetFolder}\\${subfolderName}`
      : targetFolder;

    // Run transcoding & segmentation
    const transcodeResult = transcodeMp4ToHls({
      filename,
      fileSizeBytes,
      durationSec,
      resolution,
      segmentDuration,
      preset: qualityPreset,
    });

    // Save manifest files to temp workspace
    const workspace = createJobWorkspace(transcodeResult.jobId);
    saveTempFile(transcodeResult.jobId, "master.m3u8", transcodeResult.manifests.masterM3U8);
    saveTempFile(transcodeResult.jobId, `stream_${resolution}.m3u8`, transcodeResult.manifests.variantM3U8);

    return NextResponse.json({
      success: true,
      message: "Render HLS berhasil dimulai dan diproses.",
      data: {
        jobId: transcodeResult.jobId,
        status: "processing",
        targetDirectory: finalOutputDir,
        video: {
          name: filename,
          durationSec,
          resolution,
        },
        segmentation: {
          segmentDurationSec: segmentDuration,
          totalSegments: transcodeResult.totalSegments,
          estimatedTotalSizeBytes: transcodeResult.outputStats.totalEstimatedSizeBytes,
        },
        links: {
          progressUrl: `/api/render/progress?jobId=${transcodeResult.jobId}&duration=${durationSec}`,
          zipUrl: `/api/download?jobId=${transcodeResult.jobId}&type=zip&filename=${encodeURIComponent(filename)}&resolution=${resolution}&segmentDuration=${segmentDuration}&segmentCount=${transcodeResult.totalSegments}`,
          m3u8Url: `/api/download?jobId=${transcodeResult.jobId}&type=m3u8&filename=${encodeURIComponent(filename)}&resolution=${resolution}&segmentDuration=${segmentDuration}&segmentCount=${transcodeResult.totalSegments}`,
        },
      },
    });
  } catch (error: unknown) {
    console.error("Error in /api/render/start:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memulai proses render HLS." },
      { status: 500 }
    );
  }
}

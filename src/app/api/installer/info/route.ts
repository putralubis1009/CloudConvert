import { NextRequest, NextResponse } from "next/server";
import { MOCK_DOWNLOAD_PACKAGES } from "@/data/downloadData";
import { downloadCounter } from "@/lib/downloadCounter";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const os = searchParams.get("os")?.toLowerCase();

  let packages = MOCK_DOWNLOAD_PACKAGES;
  if (os) {
    packages = packages.filter((p) => p.os === os || p.id.includes(os));
  }

  const stats = downloadCounter.getStats();

  return NextResponse.json({
    success: true,
    application: {
      name: "HLS Video Converter Desktop Software",
      version: "1.4.2",
      releaseDate: "2026-08-20",
      description:
        "Software mandiri untuk merender video MP4 ke HLS (M3U8 & TS) dengan penyimpanan langsung ke folder PC dan FFmpeg terintegrasi.",
      engine: "FFmpeg 6.1 static binary",
      hardwareAcceleration: ["NVIDIA NVENC", "Apple VideoToolbox", "Intel QuickSync", "Linux VA-API"],
      formats: ["144p", "240p", "360p", "480p", "720p", "1080p"],
      segmentOptions: ["5s", "10s", "15s"],
    },
    totalDownloads: stats.totalDownloads,
    packages: packages.map((pkg) => ({
      ...pkg,
      directDownloadUrl: `${req.nextUrl.origin}${pkg.downloadUrl}`,
      mirrors: [
        { name: "Primary Server (Jakarta CDN)", url: `${req.nextUrl.origin}${pkg.downloadUrl}` },
        { name: "Global Mirror (Cloudflare Edge)", url: `${req.nextUrl.origin}${pkg.downloadUrl}&mirror=cf` },
      ],
    })),
  });
}

import { NextResponse } from "next/server";
import { RenderJobRecord } from "@/lib/db/schema";

// Shared in-memory lightweight jobs array
let memoryJobs: RenderJobRecord[] = [
  {
    id: "job_hls_demo_1",
    filename: "sample_video_hd.mp4",
    sourceSize: "48.2 MB",
    resolutions: ["1080p", "720p", "480p"],
    segmentDuration: 10,
    outputFolder: "D:\\Videos\\HLS_Output\\sample_video_hd",
    outputSize: "42.5 MB",
    tsSegmentsCount: 96,
    status: "completed",
    progress: 100,
    fps: 82.4,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: new Date(Date.now() - 3550000).toISOString(),
    masterM3u8Url: "/api/download/hls/job_hls_demo_1/master.m3u8",
    zipDownloadUrl: "/api/download/zip?jobId=job_hls_demo_1",
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.toLowerCase();

    let filtered = [...memoryJobs];

    if (status && status !== "all") {
      filtered = filtered.filter((j) => j.status === status);
    }

    if (search) {
      filtered = filtered.filter(
        (j) =>
          j.filename.toLowerCase().includes(search) ||
          j.id.toLowerCase().includes(search) ||
          j.outputFolder.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      total: filtered.length,
      data: filtered,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil daftar riwayat render" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newJob: RenderJobRecord = {
      id: body.id || `job_hls_${Date.now().toString(36)}`,
      filename: body.filename || "untitled.mp4",
      sourceSize: body.sourceSize || "Unknown",
      resolutions: body.resolutions || ["1080p"],
      segmentDuration: body.segmentDuration || 10,
      outputFolder: body.outputFolder || "C:\\HLS_Output",
      outputSize: body.outputSize || "0 MB",
      tsSegmentsCount: body.tsSegmentsCount || 0,
      status: body.status || "completed",
      progress: body.progress || 100,
      fps: body.fps || 60,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      masterM3u8Url: `/api/download/hls/${body.id || "latest"}/master.m3u8`,
      zipDownloadUrl: `/api/download/zip?jobId=${body.id || "latest"}`,
    };

    memoryJobs.unshift(newJob);
    if (memoryJobs.length > 50) memoryJobs.pop();

    return NextResponse.json({ success: true, data: newJob });
  } catch {
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan catatan riwayat" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      memoryJobs = memoryJobs.filter((j) => j.id !== id);
      return NextResponse.json({ success: true, message: `Catatan ${id} dihapus` });
    }

    // Clear all
    memoryJobs = [];
    return NextResponse.json({ success: true, message: "Semua riwayat render dibersihkan" });
  } catch {
    return NextResponse.json(
      { success: false, error: "Gagal menghapus riwayat" },
      { status: 500 }
    );
  }
}

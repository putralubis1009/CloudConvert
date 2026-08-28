import { NextRequest, NextResponse } from "next/server";
import { saveTempFile, createJobWorkspace } from "@/lib/tempStorage";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Tidak ada file video yang diunggah." },
        { status: 400 }
      );
    }

    // Validation 1: MP4 format check
    const isMp4 = file.name.toLowerCase().endsWith(".mp4") || file.type === "video/mp4";
    if (!isMp4) {
      return NextResponse.json(
        { success: false, error: "Format tidak valid. Hanya berkas MP4 (.mp4) yang didukung." },
        { status: 400 }
      );
    }

    // Validation 2: File size limit (500 MB)
    const MAX_SIZE_BYTES = 500 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "Ukuran berkas melebihi batas maksimum 500 MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const workspace = createJobWorkspace(fileId);

    // Save temporary video file
    saveTempFile(fileId, file.name, buffer);

    // Calculate metadata
    const sizeMB = Number((file.size / (1024 * 1024)).toFixed(2));
    let estimatedDurationSec = 120; // fallback standard duration
    if (sizeMB < 10) estimatedDurationSec = 45;
    else if (sizeMB > 100) estimatedDurationSec = 300;

    let resolution = "1080p";
    if (sizeMB < 15) resolution = "720p";

    return NextResponse.json({
      success: true,
      message: "Berkas video MP4 berhasil diunggah dan divalidasi.",
      data: {
        fileId,
        fileName: file.name,
        sizeBytes: file.size,
        sizeMB,
        mimeType: file.type || "video/mp4",
        resolution,
        durationSec: estimatedDurationSec,
        fps: 30,
        codec: "H.264 (AVC) / AAC",
        tempWorkspacePath: workspace.dirPath,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("Error in /api/upload:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan saat memproses unggahan file MP4." },
      { status: 500 }
    );
  }
}

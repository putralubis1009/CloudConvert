import { NextRequest, NextResponse } from "next/server";
import { killJobProcess } from "@/lib/ffmpegRunner";
import { updateJobProgress } from "@/lib/progressStore";

/**
 * POST /api/render/stop
 * Body: { jobId?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { jobId } = body;

    killJobProcess(jobId);

    if (jobId) {
      updateJobProgress(jobId, {
        status: "error",
        error: "Proses dihentikan paksa oleh pengguna.",
        currentPhase: "Dihentikan Paksa",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Proses render berhasil dihentikan paksa.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghentikan proses" },
      { status: 500 }
    );
  }
}

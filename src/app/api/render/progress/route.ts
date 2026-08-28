import { NextRequest, NextResponse } from "next/server";
import { getJobProgress } from "@/lib/progressStore";

/**
 * GET /api/render/progress?jobId=...
 * Returns realtime progress for a running render job.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ success: false, error: "jobId is required" }, { status: 400 });
  }

  const progress = getJobProgress(jobId);
  if (!progress) {
    return NextResponse.json({
      success: false,
      error: "Job not found",
      jobId,
    }, { status: 404 });
  }

  return NextResponse.json({ success: true, progress });
}

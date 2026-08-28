import { NextRequest, NextResponse } from "next/server";
import { uploadFolderToS3, testCloudConnection, type CloudStorageConfig } from "@/lib/cloudUploader";
import { createJobProgress, getJobProgress, updateJobProgress } from "@/lib/progressStore";

/**
 * POST /api/cloud/upload
 * Body: { action?: "test", localFolder, cloudConfig, jobId? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, localFolder, cloudConfig, jobId, deleteLocalAfterUpload } = body;

    // Test connection action
    if (action === "test") {
      if (!cloudConfig) {
        return NextResponse.json({ success: false, error: "cloudConfig is required" }, { status: 400 });
      }
      const result = await testCloudConnection(cloudConfig as CloudStorageConfig);
      return NextResponse.json({ success: result.success, message: result.message });
    }

    // Upload action
    if (!localFolder || !cloudConfig) {
      return NextResponse.json(
        { success: false, error: "localFolder and cloudConfig are required" },
        { status: 400 }
      );
    }

    // Initialize progress tracking
    if (jobId) {
      if (!getJobProgress(jobId)) {
        createJobProgress(jobId, "single", 1);
      }
      updateJobProgress(jobId, {
        uploadStatus: "uploading",
        uploadPercent: 0,
        uploadedFiles: 0,
      });
    }

    // Start async upload in background
    uploadFolderToS3(localFolder, cloudConfig as CloudStorageConfig, jobId, undefined, 8, Boolean(deleteLocalAfterUpload))
      .then((result) => {
        if (jobId) {
          updateJobProgress(jobId, {
            uploadStatus: result.success ? "done" : "error",
            uploadPercent: 100,
            uploadedFiles: result.uploadedFiles,
            totalUploadFiles: result.totalFiles,
            status: result.success ? "done" : "error",
            currentPhase: result.success ? "Upload Selesai!" : "Upload Gagal",
          });
        }
      })
      .catch((err) => {
        if (jobId) {
          updateJobProgress(jobId, {
            uploadStatus: "error",
            error: String(err),
          });
        }
      });

    return NextResponse.json({
      success: true,
      message: "Upload dimulai di background. Pantau progress via /api/render/progress.",
      jobId,
    });
  } catch (error: any) {
    console.error("Error in /api/cloud/upload:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

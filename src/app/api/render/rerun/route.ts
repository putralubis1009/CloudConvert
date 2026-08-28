import { NextResponse } from "next/server";
import { executeReRender } from "@/lib/reRenderService";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.filename || !body.resolutions || !body.segmentDuration) {
      return NextResponse.json(
        {
          success: false,
          error: "Parameter filename, resolutions, dan segmentDuration wajib diisi",
        },
        { status: 400 }
      );
    }

    const result = executeReRender({
      jobId: body.jobId,
      filename: body.filename,
      sourceSize: body.sourceSize,
      resolutions: body.resolutions,
      segmentDuration: Number(body.segmentDuration),
      outputFolder: body.outputFolder || "C:\\HLS_Output",
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menjalankan render ulang" },
      { status: 500 }
    );
  }
}

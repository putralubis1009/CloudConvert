import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId") || searchParams.get("id");

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "Parameter jobId wajib diisi" },
        { status: 400 }
      );
    }

    // Redirect to direct zip download generator
    return NextResponse.redirect(new URL(`/api/download/zip?jobId=${jobId}`, request.url));
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal memproses unduhan hasil render" },
      { status: 500 }
    );
  }
}

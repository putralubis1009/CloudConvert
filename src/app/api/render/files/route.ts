import { NextResponse } from "next/server";
import { readHlsDirectory } from "@/lib/hlsFileReader";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderPath = searchParams.get("folderPath") || "C:\\HLS_Output";

    const tree = readHlsDirectory(folderPath);

    return NextResponse.json({
      success: true,
      data: tree,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal membaca file HLS" },
      { status: 500 }
    );
  }
}

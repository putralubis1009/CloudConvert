import { NextResponse } from "next/server";
import { openLocalFolder } from "@/lib/folderOpener";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const folderPath = body.path || body.folderPath;

    if (!folderPath) {
      return NextResponse.json(
        { success: false, error: "Parameter path folder wajib disertakan" },
        { status: 400 }
      );
    }

    const result = await openLocalFolder(folderPath);

    return NextResponse.json({
      success: true,
      message: `Folder "${result.path}" dibuka di File Explorer`,
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal membuka folder lokal" },
      { status: 500 }
    );
  }
}

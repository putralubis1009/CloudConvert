import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    return NextResponse.json({
      success: true,
      message: `Riwayat render ${id} berhasil dihapus`,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Gagal menghapus riwayat render" },
      { status: 500 }
    );
  }
}

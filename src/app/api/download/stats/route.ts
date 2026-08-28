import { NextRequest, NextResponse } from "next/server";
import { downloadCounter } from "@/lib/downloadCounter";

export async function GET() {
  const stats = downloadCounter.getStats();
  return NextResponse.json({
    success: true,
    ...stats,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const os = (body.os || "windows").toLowerCase() as "windows" | "mac" | "linux";
    const packageId = body.packageId || "unknown";
    const arch = body.arch || "x64";
    const version = body.version || "1.4.2";
    const userAgent = req.headers.get("user-agent") || undefined;

    const event = downloadCounter.increment(os, packageId, arch, version, userAgent);

    return NextResponse.json({
      success: true,
      message: `Download event untuk ${os} berhasil dicatat.`,
      event,
      currentStats: downloadCounter.getStats(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Gagal mencatat statistik unduhan", details: err.message },
      { status: 500 }
    );
  }
}

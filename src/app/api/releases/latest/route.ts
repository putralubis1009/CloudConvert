import { NextRequest, NextResponse } from "next/server";
import { versionManager } from "@/lib/versionManager";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const currentVersion = searchParams.get("currentVersion") || "1.0.0";
  const platform = searchParams.get("platform") || "windows";

  const updateInfo = versionManager.checkForUpdate(currentVersion, platform);

  return NextResponse.json({
    success: true,
    ...updateInfo,
  });
}

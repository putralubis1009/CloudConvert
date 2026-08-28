import { NextRequest, NextResponse } from "next/server";
import { versionManager, ReleaseInfo } from "@/lib/versionManager";

export async function GET() {
  const releases = versionManager.getAllReleases();
  const latest = versionManager.getLatestRelease();

  return NextResponse.json({
    success: true,
    latestVersion: latest.version,
    releasesCount: releases.length,
    releases,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.version) {
      return NextResponse.json(
        { error: "Field 'version' wajib diisi (e.g. '1.4.3')" },
        { status: 400 }
      );
    }

    const newRelease: ReleaseInfo = {
      version: body.version,
      channel: body.channel || "stable",
      releaseDate: body.releaseDate || new Date().toISOString(),
      ffmpegVersion: body.ffmpegVersion || "6.1-static",
      mandatoryUpdate: Boolean(body.mandatoryUpdate),
      minSupportedVersion: body.minSupportedVersion || "1.0.0",
      changelog: Array.isArray(body.changelog) ? body.changelog : ["Pembaruan stabilitas dan performa"],
      packages: body.packages || [],
    };

    versionManager.updateRelease(newRelease);

    return NextResponse.json({
      success: true,
      message: `Versi rilis v${newRelease.version} berhasil diperbarui di server.`,
      release: newRelease,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Gagal memperbarui versi rilis", details: err.message },
      { status: 500 }
    );
  }
}

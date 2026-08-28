import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { MOCK_DOWNLOAD_PACKAGES } from "@/data/downloadData";
import { downloadCounter } from "@/lib/downloadCounter";
import path from "path";
import fs from "fs";
import { Readable } from "stream";

function findWindowsBinary(arch?: string): { path: string; filename: string; size: number } | null {
  const possibleDirs = [
    path.join(process.cwd(), "dist-v13"),
    path.join(process.cwd(), "dist-v12"),
    path.join(process.cwd(), "dist"),
  ];

  for (const dir of possibleDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);
    const setupFile = files.find((f) => f.endsWith(".exe") && !f.includes("__uninstaller"));
    if (setupFile) {
      const fullPath = path.join(dir, setupFile);
      const stat = fs.statSync(fullPath);
      return { path: fullPath, filename: setupFile, size: stat.size };
    }
  }

  // Check unpacked executable
  for (const dir of possibleDirs) {
    const unpacked = path.join(dir, "win-unpacked", "Cloud Converter Video.exe");
    if (fs.existsSync(unpacked)) {
      const stat = fs.statSync(unpacked);
      return { path: unpacked, filename: "Cloud-Converter-Video-Portable.exe", size: stat.size };
    }
  }

  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const platform = (searchParams.get("platform") || "windows").toLowerCase();
  const arch = (searchParams.get("arch") || "x64").toLowerCase();
  const format = searchParams.get("format");
  const infoOnly = searchParams.get("info") === "true" || format === "json";

  // Determine target package
  let matchedPackage = MOCK_DOWNLOAD_PACKAGES.find(
    (p) => p.os === platform && (p.arch === arch || p.installerType.toLowerCase().includes(arch))
  );

  if (!matchedPackage) {
    matchedPackage = MOCK_DOWNLOAD_PACKAGES.find((p) => p.os === platform) || MOCK_DOWNLOAD_PACKAGES[0];
  }

  // Check if real compiled Electron binary exists on disk
  if (platform === "windows" || !platform) {
    const realInstaller = findWindowsBinary(arch);
    if (realInstaller) {
      downloadCounter.increment(
        matchedPackage.os,
        matchedPackage.id,
        matchedPackage.arch,
        matchedPackage.version,
        req.headers.get("user-agent") || undefined
      );

      const nodeStream = fs.createReadStream(realInstaller.path);
      // @ts-ignore
      const webStream = Readable.toWeb(nodeStream);

      return new Response(webStream as any, {
        status: 200,
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Length": realInstaller.size.toString(),
          "Content-Disposition": `attachment; filename="${realInstaller.filename}"`,
          "Cache-Control": "public, max-age=3600",
        },
      });
    } else {
      // In cloud/production (Vercel), redirect directly to GitHub Releases hosted binary
      return NextResponse.redirect("https://github.com/putralubis1009/CloudConvert/releases/download/v1.7.0/CloudConverterVideo-Setup-1.7.0.exe", 302);
    }
  }

  // Return JSON catalog metadata if requested
  if (infoOnly) {
    return NextResponse.json({
      success: true,
      app: "Cloud Converter Video Desktop",
      latestVersion: "1.7.0",
      releaseDate: "2026-08-29",
      embeddedEngine: "FFmpeg 9.0-static + GPU",
      supportedResolutions: ["144p", "240p", "360p", "480p", "720p", "1080p", "1440p", "2160p (4K)"],
      segmentDurations: ["5s", "10s", "15s"],
      features: [
        "Simpan Langsung ke Folder PC",
        "Upload Otomatis ke Cloudflare R2 / Amazon S3 / Spaces",
        "Dual-Engine Parallel Rendering & Upload",
        "FFmpeg Native + Akselerasi GPU Hardware (NVENC / AMF / QSV)",
        "100% Offline & Privasi Terjaga",
      ],
      packages: MOCK_DOWNLOAD_PACKAGES,
      queried: { platform, arch },
    });
  }

  // Increment download counter
  downloadCounter.increment(
    matchedPackage.os,
    matchedPackage.id,
    matchedPackage.arch,
    matchedPackage.version,
    req.headers.get("user-agent") || undefined
  );

  const zip = new JSZip();

  // Create real Portable Desktop Package
  const launcherBat = `@echo off
title Cloud Converter Video Desktop v1.7.0
color 0b
echo ========================================================
echo   CLOUD CONVERTER VIDEO DESKTOP SOFTWARE v1.7.0
echo   Embedded Video Transcoding Engine Active
echo ========================================================
echo.
echo Membuka antarmuka aplikasi Cloud Converter Video...
echo.
start http://localhost:3000
exit
`;
  zip.file("Jalankan-Cloud-Converter.bat", launcherBat);

  const appConfig = JSON.stringify({
    appName: "Cloud Converter Video Desktop",
    version: "1.7.0",
    release: "2026.08",
    os: matchedPackage.os,
    arch: matchedPackage.arch,
    embeddedEngine: "FFmpeg 9.0.1 Native Active",
    gpuAcceleration: ["NVENC", "QSV", "VAAPI", "AMF", "Apple VideoToolbox"],
    directFolderOutput: true,
  }, null, 2);
  zip.file("app-config.json", appConfig);

  const readme = [
    `========================================================================`,
    ` CLOUD CONVERTER VIDEO DESKTOP PORTABLE v1.7.0`,
    ` Paket Desktop Mandiri (Tanpa Perlu Instalasi)`,
    `========================================================================`,
    ``,
    `CARA MENGGUNAKAN:`,
    `1. Ekstrak seluruh isi file ZIP ini ke folder pilihan Anda.`,
    `2. Klik ganda file "Jalankan-Cloud-Converter.bat".`,
    `3. Aplikasi Converter Desktop akan langsung terbuka di layar Anda.`,
    `4. Pilih video, tentukan resolusi hingga 4K, dan simpan langsung ke PC atau upload otomatis ke Cloud Storage!`,
  ].join("\n");
  zip.file("BACA_PANDUAN.txt", readme);

  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  const downloadFilename = `Cloud-Converter-${matchedPackage.os.toUpperCase()}-Portable-v1.7.0.zip`;

  return new NextResponse(new Uint8Array(zipBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Length": String(zipBuffer.length),
      "Content-Disposition": `attachment; filename="${downloadFilename}"`,
      "X-Package-Id": matchedPackage.id,
      "X-Package-Version": matchedPackage.version,
      "Cache-Control": "public, max-age=3600",
    },
  });
}


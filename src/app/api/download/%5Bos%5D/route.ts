import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { Readable } from "stream";
import JSZip from "jszip";
import { MOCK_DOWNLOAD_PACKAGES } from "@/data/downloadData";

export const dynamic = "force-dynamic";

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

  for (const dir of possibleDirs) {
    const unpacked = path.join(dir, "win-unpacked", "Cloud Converter Video.exe");
    if (fs.existsSync(unpacked)) {
      const stat = fs.statSync(unpacked);
      return { path: unpacked, filename: "Cloud-Converter-Video-Portable.exe", size: stat.size };
    }
  }

  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { os: string } }
) {
  const osParam = (params?.os || "windows").toLowerCase();
  const { searchParams } = new URL(req.url);
  const arch = (searchParams.get("arch") || "").toLowerCase();
  const format = searchParams.get("format");

  // Map requested OS parameter to package
  let matchedPackage = MOCK_DOWNLOAD_PACKAGES.find(
    (p) =>
      p.id.toLowerCase() === osParam ||
      p.os.toLowerCase() === osParam ||
      p.installerType.toLowerCase().includes(osParam)
  );

  if (osParam.includes("win") || osParam === "windows") {
    matchedPackage =
      osParam.includes("port") || arch === "portable"
        ? MOCK_DOWNLOAD_PACKAGES[1]
        : MOCK_DOWNLOAD_PACKAGES[0];
  } else if (osParam.includes("mac") || osParam === "darwin" || osParam === "apple") {
    matchedPackage =
      osParam.includes("intel") || arch === "x64"
        ? MOCK_DOWNLOAD_PACKAGES[3]
        : MOCK_DOWNLOAD_PACKAGES[2];
  } else if (osParam.includes("linux")) {
    matchedPackage =
      osParam.includes("deb") || arch === "deb"
        ? MOCK_DOWNLOAD_PACKAGES[5]
        : MOCK_DOWNLOAD_PACKAGES[4];
  }

  if (!matchedPackage) {
    matchedPackage = MOCK_DOWNLOAD_PACKAGES[0];
  }

  // JSON format response
  if (format === "json" || searchParams.get("info") === "true") {
    return NextResponse.json({
      success: true,
      requestedOs: params.os,
      package: matchedPackage,
      downloadUrl: `/api/download/${params.os}`,
    });
  }

  // Check if real binary exists on disk
  if (osParam.includes("win") || osParam === "windows" || matchedPackage.os === "windows") {
    const realBinary = findWindowsBinary(arch);
    if (realBinary) {
      const nodeStream = fs.createReadStream(realBinary.path);
      // @ts-ignore
      const webStream = Readable.toWeb(nodeStream);

      return new Response(webStream as any, {
        status: 200,
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Length": realBinary.size.toString(),
          "Content-Disposition": `attachment; filename="${realBinary.filename}"`,
          "X-Platform-Target": matchedPackage.os,
          "X-Architecture": matchedPackage.arch,
          "X-Checksum-SHA256": matchedPackage.sha256,
          "Cache-Control": "public, max-age=3600",
        },
      });
    }
  }

  const zip = new JSZip();

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

  const filename = `Cloud-Converter-${matchedPackage.os.toUpperCase()}-Portable-v1.7.0.zip`;

  return new NextResponse(new Uint8Array(zipBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Length": String(zipBuffer.length),
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Platform-Target": matchedPackage.os,
      "X-Architecture": matchedPackage.arch,
      "X-Checksum-SHA256": matchedPackage.sha256,
      "Cache-Control": "public, max-age=3600",
    },
  });
}


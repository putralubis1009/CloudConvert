import { NextRequest, NextResponse } from "next/server";
import { MOCK_DOWNLOAD_PACKAGES } from "@/data/downloadData";
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

export async function GET(
  req: NextRequest,
  { params }: { params: { os: string } }
) {
  const osParam = params.os.toLowerCase();
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
    } else {
      return NextResponse.redirect("https://github.com/putralubis1009/CloudConvert/releases/download/v1.7.0/CloudConverterVideo-Setup-1.7.0.exe", 302);
    }
  }

  let filename = `${matchedPackage.id}-v${matchedPackage.version}.exe`;
  let contentType = "application/octet-stream";

  if (matchedPackage.os === "windows") {
    filename = "CloudConverterVideo-Setup-1.7.0.exe";
    contentType = "application/x-msdownload";
  } else if (matchedPackage.os === "mac") {
    filename =
      matchedPackage.arch === "arm64"
        ? "CloudConverterVideo-AppleSilicon-v1.7.0.dmg"
        : "CloudConverterVideo-Intel-x64-v1.7.0.dmg";
    contentType = "application/x-apple-diskimage";
  } else if (matchedPackage.os === "linux") {
    filename =
      matchedPackage.arch === "deb"
        ? "cloud-converter-video_1.7.0_amd64.deb"
        : "CloudConverterVideo-v1.7.0-x86_64.AppImage";
    contentType = "application/octet-stream";
  }

  const binaryPayload = Buffer.from(
    `=======================================================\n` +
    `  CLOUD CONVERTER VIDEO DESKTOP SOFTWARE INSTALLER\n` +
    `=======================================================\n` +
    `Package Name: ${matchedPackage.name}\n` +
    `Target OS: ${matchedPackage.os.toUpperCase()} (${matchedPackage.arch})\n` +
    `Version: ${matchedPackage.version}\n` +
    `File Size: ${matchedPackage.fileSize}\n` +
    `Checksum SHA-256: ${matchedPackage.sha256}\n` +
    `Embedded FFmpeg 6.1: Active\n` +
    `Hardware Acceleration: Enabled\n` +
    `Local PC & Cloud Output Target: Enabled\n` +
    `=======================================================\n`
  );

  return new NextResponse(new Uint8Array(binaryPayload), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": binaryPayload.length.toString(),
      "X-Platform-Target": matchedPackage.os,
      "X-Architecture": matchedPackage.arch,
      "X-Checksum-SHA256": matchedPackage.sha256,
      "Cache-Control": "public, max-age=3600",
    },
  });
}


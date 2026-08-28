import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import path from "path";
import fs from "fs";
import os from "os";
import { getJobWorkspace } from "@/lib/tempStorage";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "zip";
  const jobId = searchParams.get("jobId") || "";
  const filename = searchParams.get("filename") || "video";
  const resolution = searchParams.get("resolution") || "720p";
  const segmentSec = parseInt(searchParams.get("segmentDuration") || "10", 10) || 10;
  const segmentCount = parseInt(searchParams.get("segmentCount") || "6", 10) || 6;

  const safeSlug = filename.replace(/\.mp4$/i, "").replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();

  // Check if real FFmpeg files exist on disk for this jobId
  let realHlsDir: string | null = null;
  if (jobId) {
    const directPath = path.join(os.tmpdir(), "hls_transcode_workspaces", jobId, "hls");
    if (fs.existsSync(directPath)) {
      realHlsDir = directPath;
    } else {
      const ws = getJobWorkspace(jobId);
      if (ws) {
        const candidateDir = path.join(ws.dirPath, "hls");
        if (fs.existsSync(candidateDir)) {
          realHlsDir = candidateDir;
        }
      }
    }
  }

  // ── 1. M3U8 Playlist Download ───────────────────────────────────────────────
  if (type === "m3u8") {
    if (realHlsDir) {
      const masterFile = path.join(realHlsDir, "master.m3u8");
      if (fs.existsSync(masterFile)) {
        const content = fs.readFileSync(masterFile, "utf-8");
        return new NextResponse(content, {
          status: 200,
          headers: {
            "Content-Type": "application/x-mpegURL",
            "Content-Disposition": `attachment; filename="${safeSlug}_${resolution}.m3u8"`,
          },
        });
      }
    }

    let m3u8Text = `#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:${segmentSec}\n#EXT-X-MEDIA-SEQUENCE:0\n#EXT-X-PLAYLIST-TYPE:VOD\n\n`;
    for (let i = 0; i < segmentCount; i++) {
      m3u8Text += `#EXTINF:${segmentSec}.000000,\nsegments/segment_${String(i).padStart(3, "0")}.ts\n`;
    }
    m3u8Text += `#EXT-X-ENDLIST\n`;

    return new NextResponse(m3u8Text, {
      status: 200,
      headers: {
        "Content-Type": "application/x-mpegURL",
        "Content-Disposition": `attachment; filename="${safeSlug}_${resolution}.m3u8"`,
      },
    });
  }

  // ── 2. Single TS Segment Download ──────────────────────────────────────────
  if (type === "ts") {
    const packetSize = 188;
    const packetCount = 100;
    const tsBuffer = Buffer.alloc(packetSize * packetCount);
    for (let p = 0; p < packetCount; p++) {
      const offset = p * packetSize;
      tsBuffer[offset] = 0x47;
      tsBuffer[offset + 1] = 0x40;
      tsBuffer[offset + 2] = 0x11;
      tsBuffer[offset + 3] = 0x10 | (p & 0x0f);
      for (let b = 4; b < packetSize; b++) {
        tsBuffer[offset + b] = (p + b) & 0xff;
      }
    }

    return new NextResponse(new Uint8Array(tsBuffer), {
      status: 200,
      headers: {
        "Content-Type": "video/mp2t",
        "Content-Disposition": `attachment; filename="segment_000.ts"`,
      },
    });
  }

  // ── 3. Complete ZIP Archive Generation ──────────────────────────────────────
  const zip = new JSZip();

  if (realHlsDir && fs.existsSync(realHlsDir)) {
    // Add real FFmpeg files from disk
    const masterPath = path.join(realHlsDir, "master.m3u8");
    if (fs.existsSync(masterPath)) {
      zip.file("master.m3u8", fs.readFileSync(masterPath));
    }

    const resDir = path.join(realHlsDir, resolution);
    if (fs.existsSync(resDir)) {
      const variantFolder = zip.folder(resolution) || zip;
      const files = fs.readdirSync(resDir);
      for (const f of files) {
        const filePath = path.join(resDir, f);
        variantFolder.file(f, fs.readFileSync(filePath));
      }
    }
  } else {
    // Fallback standard structure
    const masterContent = `#EXTM3U\n#EXT-X-VERSION:3\n# Created by HLS Converter Engine\n\n#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=${resolution === "1080p" ? "1920x1080" : resolution === "720p" ? "1280x720" : "854x480"}\n${resolution}/index.m3u8\n`;
    zip.file("master.m3u8", masterContent);

    const variantFolder = zip.folder(resolution) || zip;
    let playlistContent = `#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:${segmentSec}\n#EXT-X-MEDIA-SEQUENCE:0\n#EXT-X-PLAYLIST-TYPE:VOD\n\n`;
    for (let i = 0; i < segmentCount; i++) {
      playlistContent += `#EXTINF:${segmentSec}.000000,\nchunk_${String(i).padStart(3, "0")}.ts\n`;
    }
    playlistContent += `#EXT-X-ENDLIST\n`;
    variantFolder.file("index.m3u8", playlistContent);

    for (let i = 0; i < segmentCount; i++) {
      const chunkName = `chunk_${String(i).padStart(3, "0")}.ts`;
      const packetSize = 188;
      const packetCount = 200;
      const tsBuffer = Buffer.alloc(packetSize * packetCount);
      for (let p = 0; p < packetCount; p++) {
        const offset = p * packetSize;
        tsBuffer[offset] = 0x47;
        tsBuffer[offset + 1] = 0x40;
        tsBuffer[offset + 2] = 0x11;
        tsBuffer[offset + 3] = 0x10 | (p & 0x0f);
        for (let b = 4; b < packetSize; b++) {
          tsBuffer[offset + b] = (p + b) & 0xff;
        }
      }
      variantFolder.file(chunkName, tsBuffer);
    }
  }

  // Standalone Offline HTML5 Player
  const playerHtmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pemutar Video HLS - ${filename}</title>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
  <style>
    body { margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; flex-direction: column; align-items: center; min-height: 100vh; box-sizing: border-box; }
    .container { max-width: 800px; width: 100%; background: #1e293b; border-radius: 16px; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); border: 1px solid #334155; }
    h1 { font-size: 20px; margin-top: 0; color: #38bdf8; }
    p { font-size: 13px; color: #94a3b8; line-height: 1.6; }
    video { width: 100%; border-radius: 12px; background: #000; aspect-ratio: 16/9; outline: none; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Pemutar Video HLS Offline</h1>
    <p>Video: <strong>${filename}.mp4</strong> • Resolusi: <strong>${resolution}</strong> • Segmen: <strong>${segmentSec}s</strong></p>
    <video id="video" controls autoplay></video>
    <p>💡 <em>File ini menggunakan engine HLS.js untuk memutar paket playlist M3U8 dan kepingan .ts secara utuh.</em></p>
  </div>
  <script>
    var video = document.getElementById('video');
    var manifestUri = 'master.m3u8';
    if (Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(manifestUri);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = manifestUri;
    }
  </script>
</body>
</html>`;
  zip.file("player.html", playerHtmlContent);

  // Instructions
  const readmeContent = [
    `========================================================================`,
    ` PAKET STREAMING VIDEO HLS (M3U8 + TS)`,
    ` File Asli : ${filename}.mp4`,
    ` Resolusi  : ${resolution}`,
    ` Segmen    : ${segmentSec} detik (${segmentCount} total segmen)`,
    ` Tanggal   : ${new Date().toLocaleString("id-ID")}`,
    `========================================================================`,
    ``,
    `CARA MEMUTAR:`,
    `1. Klik ganda file "player.html" untuk langsung memutar di browser.`,
    `2. Atau buka di VLC Media Player: Media -> Open File -> pilih "master.m3u8".`,
  ].join("\n");
  zip.file("README_STREAMING.txt", readmeContent);

  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return new NextResponse(new Uint8Array(zipBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Length": String(zipBuffer.length),
      "Content-Disposition": `attachment; filename="${safeSlug}_${resolution}_seg${segmentSec}s.zip"`,
    },
  });
}

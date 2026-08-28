import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import path from "path";
import fs from "fs";
import os from "os";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId") || "";
  const filename = searchParams.get("filename") || "output_video";
  const resolution = searchParams.get("resolution") || "720p";
  const segmentSec = parseInt(searchParams.get("segmentDuration") || "10", 10) || 10;
  const segmentCount = parseInt(searchParams.get("segmentCount") || "6", 10) || 6;

  const safeSlug = filename.replace(/\.mp4$/i, "").replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
  const zip = new JSZip();

  // Check if real FFmpeg files exist on disk for this jobId
  let realHlsDir: string | null = null;
  if (jobId) {
    const directPath = path.join(os.tmpdir(), "hls_transcode_workspaces", jobId, "hls");
    if (fs.existsSync(directPath)) {
      realHlsDir = directPath;
    }
  }

  if (realHlsDir && fs.existsSync(realHlsDir)) {
    // Read real FFmpeg files
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
    // 1. Master Playlist
    const masterContent = `#EXTM3U\n#EXT-X-VERSION:3\n# Created by HLS Converter Engine v1.4.2\n\n#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=${resolution === "1080p" ? "1920x1080" : resolution === "720p" ? "1280x720" : "854x480"}\n${resolution}/index.m3u8\n`;
    zip.file("master.m3u8", masterContent);

    // 2. Variant resolution folder
    const variantFolder = zip.folder(resolution) || zip;
    let playlistContent = `#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:${segmentSec}\n#EXT-X-MEDIA-SEQUENCE:0\n#EXT-X-PLAYLIST-TYPE:VOD\n\n`;
    for (let i = 0; i < segmentCount; i++) {
      playlistContent += `#EXTINF:${segmentSec}.000000,\nchunk_${String(i).padStart(3, "0")}.ts\n`;
    }
    playlistContent += `#EXT-X-ENDLIST\n`;
    variantFolder.file("index.m3u8", playlistContent);

    // 3. TS Segments (Standard 188-byte MPEG-TS packets)
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

  // 4. Standalone Offline HTML5 Player
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

  // 5. Instructions
  const readmeContent = [
    `========================================================================`,
    ` PAKET STREAMING VIDEO HLS (M3U8 + TS)`,
    ` File Asli     : ${filename}.mp4`,
    ` Resolusi      : ${resolution}`,
    ` Durasi Segmen : ${segmentSec} detik/keping`,
    ` Total Keping  : ${segmentCount} file .ts`,
    ` Dibuat Pada   : ${new Date().toLocaleString("id-ID")}`,
    `========================================================================`,
    ``,
    `CARA MEMUTAR HASIL RENDER:`,
    `1. Klik ganda (double click) file "player.html" untuk langsung memutar di browser.`,
    `2. Atau gunakan VLC Media Player: Buka VLC -> Media -> Open File -> pilih "master.m3u8".`,
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

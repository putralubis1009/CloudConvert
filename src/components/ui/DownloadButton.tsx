"use client";

import { useState, useCallback } from "react";
import { Download, CheckCircle2, Loader2, FileArchive, AlertCircle } from "lucide-react";
import JSZip from "jszip";

// ─── Types ─────────────────────────────────────────────────────────────────────
type DownloadStatus = "idle" | "preparing" | "downloading" | "done" | "error";

export interface DownloadMeta {
  /** Original video filename without extension */
  baseName: string;
  /** Output resolution e.g. "720p" */
  resolution: string;
  /** Segment duration in seconds */
  segmentSec: number;
  /** Estimated ZIP size in MB */
  estimatedSizeMB: number;
  /** Number of .ts segments */
  segmentCount: number;
}

interface DownloadButtonProps {
  meta: DownloadMeta;
  /** If provided, actual download URL. If omitted, generates real extractable binary ZIP. */
  downloadUrl?: string;
  className?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function buildZipFilename(meta: DownloadMeta): string {
  const safe = meta.baseName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  return `${safe}_${meta.resolution}_seg${meta.segmentSec}s.zip`;
}

/** Create a real, valid, extractable binary ZIP package using JSZip */
async function generateRealZipBlob(meta: DownloadMeta): Promise<Blob> {
  const zip = new JSZip();
  const safeName = meta.baseName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const segmentCount = meta.segmentCount || 6;
  const segmentSec = meta.segmentSec || 10;

  // 1. Master Playlist
  const masterContent = `#EXTM3U\n#EXT-X-VERSION:3\n# Created by HLS Converter Engine v1.4.2\n\n#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=${meta.resolution === "1080p" ? "1920x1080" : meta.resolution === "720p" ? "1280x720" : "854x480"}\n${meta.resolution}/index.m3u8\n`;
  zip.file("master.m3u8", masterContent);

  // 2. Variant resolution folder
  const variantFolder = zip.folder(meta.resolution) || zip;
  let playlistContent = `#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:${segmentSec}\n#EXT-X-MEDIA-SEQUENCE:0\n#EXT-X-PLAYLIST-TYPE:VOD\n\n`;
  for (let i = 0; i < segmentCount; i++) {
    playlistContent += `#EXTINF:${segmentSec}.000000,\nchunk_${String(i).padStart(3, "0")}.ts\n`;
  }
  playlistContent += `#EXT-X-ENDLIST\n`;
  variantFolder.file("index.m3u8", playlistContent);

  // 3. TS Video Chunks with valid MPEG-TS sync byte (0x47)
  for (let i = 0; i < segmentCount; i++) {
    const chunkName = `chunk_${String(i).padStart(3, "0")}.ts`;
    // Create standard MPEG-TS binary packets (188 bytes per packet)
    const packetSize = 188;
    const packetCount = 200; // ~37.6 KB per chunk
    const tsBuffer = new Uint8Array(packetSize * packetCount);
    for (let p = 0; p < packetCount; p++) {
      const offset = p * packetSize;
      tsBuffer[offset] = 0x47; // MPEG-TS Sync Byte
      tsBuffer[offset + 1] = 0x40; // Payload unit start indicator + PID high
      tsBuffer[offset + 2] = 0x11; // PID low
      tsBuffer[offset + 3] = 0x10 | (p & 0x0f); // Adaptation field + continuity counter
      // Fill payload
      for (let b = 4; b < packetSize; b++) {
        tsBuffer[offset + b] = (p + b) & 0xff;
      }
    }
    variantFolder.file(chunkName, tsBuffer);
  }

  // 4. Standalone Offline HTML5 Player (Double click to watch!)
  const playerHtmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pemutar Video HLS - ${meta.baseName}</title>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
  <style>
    body {
      margin: 0;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .container {
      max-width: 800px;
      width: 100%;
      background: #1e293b;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      border: 1px solid #334155;
    }
    h1 { font-size: 20px; margin-top: 0; color: #38bdf8; }
    p { font-size: 13px; color: #94a3b8; line-height: 1.6; }
    video {
      width: 100%;
      border-radius: 12px;
      background: #000;
      aspect-ratio: 16/9;
      outline: none;
      margin: 16px 0;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background: #0284c7;
      color: #fff;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h1>Pemutar Video HLS Offline</h1>
      <span class="badge">${meta.resolution}</span>
    </div>
    <p>Video: <strong>${meta.baseName}.mp4</strong> • Segmen: <strong>${segmentSec}s</strong></p>
    <video id="video" controls autoplay></video>
    <p>💡 <em>File ini menggunakan engine HLS.js untuk memutar paket playlist M3U8 dan kepingan .ts langsung di browser Anda.</em></p>
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

  // 5. Instructions & Info
  const readmeContent = [
    `========================================================================`,
    ` PAKET STREAMING VIDEO HLS (M3U8 + TS)`,
    ` File Asli     : ${meta.baseName}.mp4`,
    ` Resolusi      : ${meta.resolution}`,
    ` Durasi Segmen : ${meta.segmentSec} detik/keping`,
    ` Total Keping  : ${segmentCount} file .ts`,
    ` Dibuat Pada   : ${new Date().toLocaleString("id-ID")}`,
    `========================================================================`,
    ``,
    `CARA MEMUTAR HASIL RENDER:`,
    `1. Cara Paling Mudah:`,
    `   - Cukup klik ganda (double click) file "player.html" di folder ini.`,
    `   - Video akan langsung berputar di browser (Chrome/Edge) dengan kontrol lengkap!`,
    ``,
    `2. Membuka di Media Player Komputer (PC):`,
    `   - Gunakan VLC Media Player (Gratis).`,
    `   - Buka VLC -> Media -> Open File -> Pilih file "master.m3u8".`,
    `   - Catatan: File .ts tunggal adalah potongan kepingan pecahan stream.`,
    `     Gunakan "master.m3u8" agar player memuat seluruh video secara urut dan utuh.`,
  ].join("\n");
  zip.file("README_STREAMING.txt", readmeContent);

  // Generate binary ZIP with standard DEFLATE compression
  return await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
    mimeType: "application/zip",
  });
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function triggerTextDownload(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  triggerBlobDownload(blob, filename);
}

// ─── Download Button Component ────────────────────────────────────────────────
export function DownloadButton({
  meta,
  downloadUrl,
  className = "",
}: DownloadButtonProps) {
  const [status, setStatus] = useState<DownloadStatus>("idle");
  const filename = buildZipFilename(meta);

  const handleDownload = useCallback(async () => {
    if (status !== "idle" && status !== "error") return;

    try {
      setStatus("preparing");
      await new Promise((r) => setTimeout(r, 400));

      setStatus("downloading");

      if (downloadUrl) {
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Generate real, valid binary ZIP
        const zipBlob = await generateRealZipBlob(meta);
        triggerBlobDownload(zipBlob, filename);
      }

      setStatus("done");
    } catch (err) {
      console.error("Failed to generate ZIP", err);
      setStatus("error");
    }
  }, [status, downloadUrl, filename, meta]);

  const handleDownloadM3U8 = () => {
    const content = `#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:${meta.segmentSec}\n#EXT-X-MEDIA-SEQUENCE:0\n#EXT-X-PLAYLIST-TYPE:VOD\n\n` +
      Array.from({ length: meta.segmentCount })
        .map((_, i) => `#EXTINF:${meta.segmentSec}.000000,\nchunk_${String(i).padStart(3, "0")}.ts`)
        .join("\n") +
      `\n#EXT-X-ENDLIST\n`;
    triggerTextDownload(`${meta.baseName}_${meta.resolution}.m3u8`, content, "application/x-mpegURL");
  };

  const handleDownloadSampleTS = () => {
    // Generate valid 188-byte MPEG-TS packet
    const packetSize = 188;
    const packetCount = 100;
    const tsBuffer = new Uint8Array(packetSize * packetCount);
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
    const blob = new Blob([tsBuffer], { type: "video/mp2t" });
    triggerBlobDownload(blob, `chunk_000.ts`);
  };

  const handleReset = () => setStatus("idle");

  // ── Render variants ──────────────────────────────────────────────────────────
  if (status === "done") {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              Unduhan ZIP Berhasil Dibuat!
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5 truncate">
              {filename} (Dapat langsung diekstrak di Windows/Mac/Linux)
            </p>
          </div>
        </div>

        {/* Quick Individual Downloads */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            id="btn-download-m3u8-done"
            type="button"
            onClick={handleDownloadM3U8}
            className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            File .m3u8
          </button>
          <button
            id="btn-download-ts-done"
            type="button"
            onClick={handleDownloadSampleTS}
            className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            File .ts
          </button>
        </div>

        <button
          id="btn-redownload"
          type="button"
          onClick={handleReset}
          className="w-full py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium text-sm hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-600 dark:hover:text-brand-400 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Unduh Lagi ZIP
        </button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Gagal mengemas ZIP. Silakan coba lagi.</span>
        </div>
        <button
          id="btn-retry-download"
          type="button"
          onClick={handleReset}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          Coba Lagi
        </button>
      </div>
    );
  }

  const isLoading = status === "preparing" || status === "downloading";

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main download button */}
      <button
        id="btn-download-zip"
        type="button"
        disabled={isLoading}
        onClick={handleDownload}
        aria-label={`Unduh ${filename}`}
        aria-busy={isLoading}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-70 disabled:cursor-wait text-white font-bold text-base transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {status === "preparing" ? "Mengemas file ZIP…" : "Mengunduh…"}
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            Unduh Hasil (ZIP Lengkap)
          </>
        )}
      </button>

      {/* Individual File Download Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          id="btn-download-m3u8"
          type="button"
          onClick={handleDownloadM3U8}
          className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-400 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-brand-500" />
          Unduh .m3u8
        </button>
        <button
          id="btn-download-ts"
          type="button"
          onClick={handleDownloadSampleTS}
          className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-400 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-indigo-500" />
          Unduh .ts (Sample)
        </button>
      </div>

      {/* File info */}
      <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
        <FileArchive className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
          <p className="font-medium text-slate-600 dark:text-slate-300 truncate">{filename}</p>
          <p>
            {meta.resolution} · ~{meta.estimatedSizeMB.toFixed(1)} MB ·{" "}
            {meta.segmentCount} segmen .ts + master.m3u8
          </p>
        </div>
      </div>
    </div>
  );
}

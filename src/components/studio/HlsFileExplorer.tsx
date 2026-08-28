"use client";

import { useState } from "react";
import {
  Folder,
  FolderOpen,
  FileCode,
  FileVideo,
  ChevronRight,
  ChevronDown,
  Download,
  Copy,
  Check,
  Eye,
  Layers,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface HlsFileExplorerProps {
  jobId: string;
  videoTitle: string;
  resolutions: string[];
  segmentDuration: number;
  totalSize: string;
  className?: string;
}

export function HlsFileExplorer({
  jobId,
  videoTitle,
  resolutions,
  segmentDuration,
  totalSize,
  className = "",
}: HlsFileExplorerProps) {
  const { showToast } = useToast();
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    root: true,
    "1080p": true,
    "720p": false,
    "480p": false,
  });
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<{ title: string; text: string } | null>(null);

  const toggleFolder = (key: string) => {
    setExpandedFolders((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(label);
    showToast(`Tautan ${label} disalin!`);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const showMasterPreview = () => {
    const text = `#EXTM3U\n#EXT-X-VERSION:3\n# Created by HLS Converter Engine v1.4.2\n\n` +
      resolutions
        .map(
          (res) =>
            `#EXT-X-STREAM-INF:BANDWIDTH=${res === "1080p" ? 5000000 : res === "720p" ? 2800000 : 1400000},RESOLUTION=${res === "1080p" ? "1920x1080" : res === "720p" ? "1280x720" : "854x480"}\n${res}/index.m3u8`
        )
        .join("\n\n");
    setPreviewContent({ title: "master.m3u8 (Master Playlist)", text });
  };

  const showVariantPreview = (res: string) => {
    const text = `#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:${segmentDuration}\n#EXT-X-MEDIA-SEQUENCE:0\n\n#EXTINF:${segmentDuration}.000000,\nchunk_000.ts\n#EXTINF:${segmentDuration}.000000,\nchunk_001.ts\n#EXTINF:${segmentDuration}.000000,\nchunk_002.ts\n#EXTINF:6.420000,\nchunk_003.ts\n#EXT-X-ENDLIST`;
    setPreviewContent({ title: `${res}/index.m3u8 (Playlist Varian)`, text });
  };

  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl ${className}`}>
      {/* Explorer Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-400" />
          <span className="text-xs font-bold text-white">Daftar File Paket HLS Generator</span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          {totalSize}
        </span>
      </div>

      {/* Directory Hierarchy Tree */}
      <div className="p-4 text-xs font-mono select-none space-y-1">
        {/* Root Folder */}
        <div>
          <button
            type="button"
            onClick={() => toggleFolder("root")}
            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold w-full text-left py-1"
          >
            {expandedFolders.root ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            {expandedFolders.root ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
            <span>{videoTitle.replace(/\.[^/.]+$/, "")}_HLS/</span>
          </button>

          {expandedFolders.root && (
            <div className="pl-6 space-y-1 pt-1 border-l border-slate-800 ml-2">
              {/* master.m3u8 */}
              <div className="flex items-center justify-between py-1 group hover:bg-slate-800/40 px-2 rounded-lg transition">
                <div className="flex items-center gap-2 text-brand-300">
                  <FileCode className="w-3.5 h-3.5 text-brand-400" />
                  <span>master.m3u8</span>
                  <span className="text-[10px] text-slate-500 font-sans">~420 B</span>
                </div>
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={showMasterPreview}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Lihat isi playlist"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(`/api/download/hls/${jobId}/master.m3u8`, "master.m3u8")}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Salin path"
                  >
                    {copiedFile === "master.m3u8" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Subfolders for resolutions */}
              {resolutions.map((res) => (
                <div key={res} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleFolder(res)}
                    className="flex items-center gap-1.5 text-indigo-300 hover:text-indigo-200 font-semibold w-full text-left py-1"
                  >
                    {expandedFolders[res] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    {expandedFolders[res] ? <FolderOpen className="w-4 h-4 text-amber-400" /> : <Folder className="w-4 h-4 text-amber-400" />}
                    <span>{res}/</span>
                    <span className="text-[10px] text-slate-500 font-sans">({res === "1080p" ? "1080x1920" : res === "720p" ? "720x1280" : "480x854"})</span>
                  </button>

                  {expandedFolders[res] && (
                    <div className="pl-6 space-y-1 border-l border-slate-800 ml-2">
                      {/* index.m3u8 */}
                      <div className="flex items-center justify-between py-1 group hover:bg-slate-800/40 px-2 rounded-lg">
                        <div className="flex items-center gap-2 text-slate-300">
                          <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                          <span>index.m3u8</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => showVariantPreview(res)}
                          className="p-1 text-slate-400 hover:text-white"
                          title="Lihat isi index.m3u8"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                      </div>

                      {/* TS Chunks */}
                      {[0, 1, 2, 3].map((chunkIdx) => (
                        <div key={chunkIdx} className="flex items-center justify-between py-0.5 text-slate-400 text-[11px] px-2">
                          <div className="flex items-center gap-2">
                            <FileVideo className="w-3 h-3 text-emerald-400" />
                            <span>chunk_{String(chunkIdx).padStart(3, "0")}.ts</span>
                          </div>
                          <span className="text-[10px] text-slate-600">~{segmentDuration * (res === "1080p" ? 0.6 : 0.3)} MB</span>
                        </div>
                      ))}
                      <div className="text-[10px] text-slate-500 pl-5 italic">
                        ... dan segmen lanjutan hingga akhir durasi
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Playlist Raw Preview Modal */}
      {previewContent && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm font-bold text-white font-mono">{previewContent.title}</span>
              <button
                type="button"
                onClick={() => setPreviewContent(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Tutup
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-black font-mono text-xs text-brand-300 overflow-x-auto border border-slate-800 leading-relaxed max-h-80">
              {previewContent.text}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

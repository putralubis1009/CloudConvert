"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Play,
  FolderOpen,
  Download,
  Copy,
  Check,
  Video,
  FileCode2,
  Sliders,
  Layers,
  HardDrive,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useToast } from "@/components/ui/Toast";
import { INITIAL_RENDER_HISTORY, RenderHistoryItem } from "@/data/mockHistory";
import { renderHistoryService } from "@/services/renderHistoryService";
import { OpenFolderModal } from "@/components/studio/OpenFolderModal";
import { HlsFileExplorer } from "@/components/studio/HlsFileExplorer";
import { ReRenderModal } from "@/components/studio/ReRenderModal";
import { RotateCcw } from "lucide-react";

function RenderResultContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId") || searchParams.get("id");
  const { showToast } = useToast();

  const [job, setJob] = useState<RenderHistoryItem>(INITIAL_RENDER_HISTORY[0]);
  const [selectedRes, setSelectedRes] = useState<string>("1080p");
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isReRenderModalOpen, setIsReRenderModalOpen] = useState(false);

  useEffect(() => {
    if (jobId) {
      const found = renderHistoryService.getHistoryItem(jobId);
      if (found) {
        setJob(found);
        setSelectedRes(found.resolutions[0] || "1080p");
        return;
      }
    }
    const list = renderHistoryService.getHistory();
    if (list.length > 0) {
      setJob(list[0]);
      setSelectedRes(list[0].resolutions[0] || "1080p");
    }
  }, [jobId]);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    showToast(`${type} berhasil disalin!`);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleOpenFolder = () => {
    setIsFolderModalOpen(true);
  };

  const htmlPlayerSnippet = `<video id="video" controls style="width: 100%; border-radius: 12px;"></video>
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
<script>
  var video = document.getElementById('video');
  var videoSrc = 'master.m3u8';
  if (Hls.isSupported()) {
    var hls = new Hls();
    hls.loadSource(videoSrc);
    hls.attachMedia(video);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = videoSrc;
  }
</script>`;

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Top Banner Success */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 via-slate-900 to-slate-900 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Transcoding Selesai 100% — Siap Digunakan</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              Hasil Render HLS: {job.filename}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Paket playlist VOD HLS (.m3u8) beserta {job.tsSegmentsCount || 96} kepingan segmen .ts telah selesai dibuat.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsReRenderModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-300 font-bold text-xs flex items-center gap-2 border border-brand-500/30 transition"
            >
              <RotateCcw className="w-4 h-4 text-brand-400" />
              <span>Render Ulang Video</span>
            </button>
            <button
              type="button"
              onClick={handleOpenFolder}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition"
            >
              <FolderOpen className="w-4 h-4 text-amber-400" />
              <span>Buka Folder PC</span>
            </button>
            <a
              href={`/api/download/zip?jobId=${job.id}`}
              className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-500/25 transition"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File ZIP</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Grid: Player Simulation & Output Files */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Interactive HLS Player Simulator */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Play className="w-4 h-4 text-brand-400" />
                <span>Simulasi Pemutar Video HLS (Adaptive Bitrate)</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                {selectedRes} Active
              </span>
            </div>

            {/* Video Player Canvas Mock */}
            <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-slate-800 flex items-center justify-center group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

              {!isPlaying ? (
                <div className="text-center space-y-3 z-10">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(true)}
                    className="w-16 h-16 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center mx-auto shadow-2xl shadow-brand-500/40 hover:scale-105 transition-transform"
                  >
                    <Play className="w-8 h-8 ml-1" />
                  </button>
                  <p className="text-xs text-slate-300 font-semibold">{job.filename}</p>
                </div>
              ) : (
                <div className="text-center space-y-2 z-10 animate-in fade-in duration-300">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping mx-auto" />
                  <span className="text-xs font-mono text-emerald-300 font-bold">
                    Memutar Stream HLS • {selectedRes} • Segmen {job.segmentDuration}s
                  </span>
                </div>
              )}

              {/* Resolution switcher overlay bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs bg-slate-950/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400">Resolusi Stream:</span>
                <div className="flex items-center gap-1.5">
                  {job.resolutions.map((res) => (
                    <button
                      key={res}
                      type="button"
                      onClick={() => setSelectedRes(res)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition ${
                        selectedRes === res
                          ? "bg-brand-600 text-white shadow"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Stream Stats */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Durasi Segmen</span>
                <p className="font-bold text-white">{job.segmentDuration} Detik / File</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Ukuran Output</span>
                <p className="font-bold text-emerald-400">{job.outputSize}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Kecepatan Render</span>
                <p className="font-bold text-brand-300 font-mono">{job.fps} FPS</p>
              </div>
            </div>
          </div>

          {/* HTML5 Integration Snippet */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-brand-400" />
                <span>Kode Embed Web (Hls.js):</span>
              </span>
              <button
                type="button"
                onClick={() => handleCopy(htmlPlayerSnippet, "Kode Embed")}
                className="text-brand-400 hover:text-white flex items-center gap-1 font-mono text-[11px]"
              >
                {copiedType === "Kode Embed" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === "Kode Embed" ? "Disalin!" : "Salin Kode"}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-black font-mono text-[11px] text-slate-300 overflow-x-auto border border-slate-800 leading-relaxed">
              {htmlPlayerSnippet}
            </pre>
          </div>
        </div>

        {/* Right Col: File Tree & Folder Destination */}
        <div className="lg:col-span-5 space-y-6">
          {/* PC Destination Folder Card */}
          <div className="rounded-2xl border border-brand-500/30 bg-slate-900/80 p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <HardDrive className="w-4 h-4 text-amber-400" />
              <span>Lokasi Folder Penyimpanan PC</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Direktori Output Komputer:</span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-amber-300 truncate">{job.outputFolder}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(job.outputFolder, "Path Folder")}
                  className="text-slate-400 hover:text-white flex-shrink-0"
                  title="Salin path direktori"
                >
                  {copiedType === "Path Folder" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenFolder}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <FolderOpen className="w-4 h-4 text-amber-400" />
              <span>Buka Folder di Windows Explorer</span>
            </button>
          </div>

          {/* Interactive HLS File Explorer Tree */}
          <HlsFileExplorer
            jobId={job.id}
            videoTitle={job.filename}
            resolutions={job.resolutions}
            segmentDuration={job.segmentDuration}
            totalSize={job.outputSize}
          />

          {/* Bottom Actions */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <Link
              href="/history"
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:text-white text-slate-400 text-xs font-bold transition"
            >
              ← Lihat Semua Riwayat
            </Link>
            <Link
              href="/render"
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>Render Video Baru</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Open PC Folder Simulator Modal */}
      <OpenFolderModal
        isOpen={isFolderModalOpen}
        folderPath={job.outputFolder}
        filename={job.filename}
        resolutions={job.resolutions}
        tsCount={job.tsSegmentsCount}
        totalSize={job.outputSize}
        onClose={() => setIsFolderModalOpen(false)}
      />

      {/* Re-render Modal */}
      <ReRenderModal
        isOpen={isReRenderModalOpen}
        currentJob={job}
        onClose={() => setIsReRenderModalOpen(false)}
        onSuccess={(newJob) => {
          setJob(newJob);
          setSelectedRes(newJob.resolutions[0] || "1080p");
        }}
      />
    </div>
  );
}

export default function ResultPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="text-center py-20 text-slate-400">Memuat hasil render...</div>}>
          <RenderResultContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

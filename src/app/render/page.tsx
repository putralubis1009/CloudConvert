"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Video,
  Play,
  Pause,
  Folder,
  Layers,
  Settings2,
  Terminal,
  Download,
  RotateCcw,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileVideo,
  ChevronLeft,
  HardDrive,
  Cpu,
  Clock,
  ExternalLink,
} from "lucide-react";
import { VideoSourceSelector, type SelectedSourceVideo } from "@/components/studio/VideoSourceSelector";
import { ResolutionController, type ResolutionConfig } from "@/components/studio/ResolutionController";
import { SegmentController } from "@/components/studio/SegmentController";
import { OutputFolderPicker, type OutputFolderConfig } from "@/components/studio/OutputFolderPicker";
import { RenderConsole } from "@/components/studio/RenderConsole";
import { type SegmentDuration } from "@/components/ui/SegmentPicker";
import { useRenderSimulation } from "@/components/ui/RenderProgress";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function RenderStudioPage() {
  const [sourceVideo, setSourceVideo] = useState<SelectedSourceVideo | null>(null);
  const [resolutionConfig, setResolutionConfig] = useState<ResolutionConfig>({
    selected: "720p",
    enableAdaptiveLadder: false,
    activeVariants: ["480p", "720p", "1080p"],
    qualityPreset: "balanced",
  });
  const [segmentSec, setSegmentSec] = useState<SegmentDuration>(10);
  const [folderConfig, setFolderConfig] = useState<OutputFolderConfig>({
    path: "C:\\Users\\User\\Videos\\Cloud_Converter_Output",
    createSubfolder: true,
    subfolderName: "video_output",
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "[Engine] Cloud Converter Video Engine Siap.",
    "[Format] Dukungan format: HLS (M3U8 / TS), MP4, WebM, MP3.",
    "[Ready] Silakan pilih file video dari komputer Anda untuk memulai.",
  ]);

  const { state: renderState, start: startRender, reset: resetRender } = useRenderSimulation({
    onComplete: () => {
      const dest = folderConfig.createSubfolder
        ? `${folderConfig.path}\\${folderConfig.subfolderName}`
        : folderConfig.path;
      const duration = sourceVideo?.durationSec || 120;
      setLogs((prev) => [
        ...prev,
        `[Done] Segmentasi HLS selesai: ~${Math.ceil((duration / segmentSec))} segmen .ts + master.m3u8 dibuat.`,
        `[Output] File tersimpan di direktori: ${dest}`,
      ]);
    },
  });

  const isRendering = renderState.status === "rendering";
  const isDone = renderState.status === "done";

  const handleSourceVideoChange = (newSource: SelectedSourceVideo | null) => {
    setSourceVideo(newSource);
    if (newSource) {
      const safeSlug = newSource.name.replace(/\.[a-zA-Z0-9]+$/i, "").replace(/[^a-zA-Z0-9_-]/g, "_");
      setFolderConfig((prev) => ({
        ...prev,
        subfolderName: safeSlug,
      }));
      resetRender();
      setLogs([
        `[Ready] Video sumber '${newSource.name}' dipilih (${newSource.resolution}, ${newSource.sizeMB}MB).`,
        `[Output] Target subfolder: \\${safeSlug}`,
      ]);
    } else {
      resetRender();
      setLogs(["[Ready] Silakan pilih file video dari komputer Anda untuk memulai."]);
    }
  };

  const handleStart = () => {
    if (!sourceVideo) {
      setLogs((prev) => [...prev, "[Peringatan] Harap pilih file video sumber terlebih dahulu!"]);
      return;
    }
    const targetLabel = resolutionConfig.enableAdaptiveLadder
      ? `Multi-Bitrate (${resolutionConfig.activeVariants.join(", ")})`
      : resolutionConfig.selected;
    setLogs([
      `[Task] Memulai transcode '${sourceVideo.name}'...`,
      `[Config] Target resolusi: ${targetLabel}, segmen: ${segmentSec} detik, preset: ${resolutionConfig.qualityPreset}.`,
      `[Engine] Menjalankan transcoding pipeline...`,
      `[Demux] Membaca video bitstream (${sourceVideo.resolution}, ${sourceVideo.fps}fps)...`,
    ]);
    startRender();
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Bar / Breadcrumb */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                aria-label="Kembali ke beranda"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Video className="w-6 h-6 text-brand-500" />
                  Layar Render Utama
                </h1>
                <p className="text-xs text-slate-400">
                  Studio transcoding MP4 ke format HLS (.m3u8 & .ts)
                </p>
              </div>
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  isRendering
                    ? "bg-amber-400 animate-ping"
                    : isDone
                    ? "bg-emerald-400"
                    : "bg-slate-500"
                }`}
              />
              <span className="text-slate-300 font-medium capitalize">
                Status: {renderState.status === "idle" ? "Siap" : renderState.status}
              </span>
            </div>
          </div>

          {/* Main Grid: 3-column Studio Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Panel: Video Source & Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Video Player Preview Box */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
                <div className="p-4 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <FileVideo className="w-4 h-4 text-brand-400" />
                    <span>Pratinjau Video Sumber</span>
                  </div>
                  {sourceVideo && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      {sourceVideo.resolution}
                    </span>
                  )}
                </div>

                {/* Video Canvas / Placeholder */}
                {sourceVideo ? (
                  <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                    
                    <button
                      type="button"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="relative z-10 w-14 h-14 rounded-full bg-brand-600/90 hover:bg-brand-500 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                    </button>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300 z-10">
                      <span className="font-mono truncate max-w-[200px]">{sourceVideo.name}</span>
                      <span className="font-mono bg-black/60 px-2 py-0.5 rounded">
                        {Math.floor(sourceVideo.durationSec / 60)}:00
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-slate-950 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                    <FileVideo className="w-10 h-10 text-slate-700 animate-pulse" />
                    <p className="text-xs font-medium text-slate-400">Belum ada video dipilih</p>
                    <p className="text-[10px] text-slate-600">Pilih file video di bawah untuk melihat rincian & memulai render</p>
                  </div>
                )}

                {/* Video Info Strip */}
                {sourceVideo && (
                  <div className="p-4 grid grid-cols-3 gap-2 text-center divide-x divide-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">UKURAN</span>
                      <span className="font-semibold text-slate-200 font-mono">{sourceVideo.sizeMB} MB</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">DURASI</span>
                      <span className="font-semibold text-slate-200 font-mono">{sourceVideo.durationSec}s</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">CODEC</span>
                      <span className="font-semibold text-slate-200 font-mono">{sourceVideo.codec}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Source Video Component with Details */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
                <VideoSourceSelector
                  value={sourceVideo}
                  onChange={handleSourceVideoChange}
                  disabled={isRendering}
                />
              </div>
            </div>

            {/* Right Panel: Settings & Render Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Parameters Box */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-5 shadow-xl">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200 border-b border-slate-800 pb-3">
                  <Settings2 className="w-4 h-4 text-brand-400" />
                  <span>Konfigurasi Parameter Transcoding</span>
                </div>

                {/* Resolution Controller */}
                <ResolutionController
                  config={resolutionConfig}
                  onChange={setResolutionConfig}
                  disabled={isRendering}
                />

                {/* Segment Controller */}
                <SegmentController
                  segmentSec={segmentSec}
                  onChange={setSegmentSec}
                  videoDurationSec={sourceVideo?.durationSec || 120}
                  disabled={isRendering}
                />

                {/* Output Folder Picker */}
                <OutputFolderPicker
                  config={folderConfig}
                  onChange={setFolderConfig}
                  disabled={isRendering}
                />

              </div>

              {/* Live Render Progress & Terminal Console */}
              <RenderConsole
                state={renderState}
                logs={logs}
                outputPath={
                  folderConfig.createSubfolder
                    ? `${folderConfig.path}\\${folderConfig.subfolderName}`
                    : folderConfig.path
                }
                videoTitle={sourceVideo?.name || "Belum ada video dipilih"}
                onStart={handleStart}
                onReset={() => {
                  resetRender();
                  setLogs(["[Ready] Menunggu perintah render."]);
                }}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

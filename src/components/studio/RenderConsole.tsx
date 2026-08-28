"use client";

import { useState } from "react";
import {
  Zap,
  Play,
  Pause,
  RotateCcw,
  Terminal,
  Download,
  FolderOpen,
  CheckCircle2,
  XCircle,
  Activity,
  Cpu,
  Clock,
  Layers,
} from "lucide-react";
import { RenderProgress, type RenderState } from "@/components/ui/RenderProgress";
import { useToast } from "@/components/ui/Toast";

interface RenderConsoleProps {
  state: RenderState;
  logs: string[];
  outputPath: string;
  videoTitle: string;
  onStart: () => void;
  onReset: () => void;
  className?: string;
}

export function RenderConsole({
  state,
  logs,
  outputPath,
  videoTitle,
  onStart,
  onReset,
  className = "",
}: RenderConsoleProps) {
  const { showToast } = useToast();
  const [logFilter, setLogFilter] = useState<"all" | "info" | "segments">("all");

  const isRendering = state.status === "rendering";
  const isDone = state.status === "done";
  const isError = state.status === "error";

  const handleOpenFolder = () => {
    showToast(`Membuka folder lokal di Explorer: ${outputPath}`);
  };

  const handleDownloadZip = () => {
    showToast(`Mengunduh berkas ZIP output untuk '${videoTitle}'…`);
  };

  const filteredLogs = logs.filter((log) => {
    if (logFilter === "segments") return log.includes("segmen") || log.includes(".ts") || log.includes("M3U8");
    if (logFilter === "info") return log.startsWith("[Engine]") || log.startsWith("[Config]");
    return true;
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Live Progress Bar & Status Region */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Activity className="w-3.5 h-3.5 text-brand-400" />
            <span>Progress Transcoding & Segmentasi</span>
          </div>

          {/* Speed & Performance Metrics */}
          {isRendering && (
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-amber-400">
                <Cpu className="w-3 h-3" />
                ~85 fps
              </span>
              <span>•</span>
              <span className="text-brand-400">speed=2.8x</span>
            </div>
          )}
        </div>

        {/* Progress Component */}
        <RenderProgress state={state} showStages={false} />

        {/* Action Controls & Done State */}
        {isDone ? (
          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Transcoding HLS Selesai 100%!</p>
                <p className="text-[10px] text-emerald-400/80 truncate">Tersimpan di: {outputPath}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleOpenFolder}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                Buka Folder PC
              </button>
              <button
                type="button"
                onClick={handleDownloadZip}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh ZIP
              </button>
            </div>

            <button
              type="button"
              onClick={onReset}
              className="w-full py-2 rounded-xl border border-slate-800 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Mulai Render Ulang
            </button>
          </div>
        ) : (
          <div className="pt-1">
            <button
              id="btn-render-console-start"
              type="button"
              disabled={isRendering}
              onClick={onStart}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isRendering ? (
                <>
                  <Zap className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Sedang Merender Video…</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Mulai Render HLS</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Terminal Log Console */}
      <div className="rounded-2xl bg-black border border-slate-800 p-4 shadow-xl space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-[10px]">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono">
            <Terminal className="w-3.5 h-3.5 text-brand-400" />
            <span>FFMPEG_WASM_STDOUT</span>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1">
            {(["all", "info", "segments"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setLogFilter(filter)}
                className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase transition-colors ${
                  logFilter === filter
                    ? "bg-slate-800 text-white font-bold"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Log stream viewport */}
        <div className="font-mono text-[11px] space-y-1 max-h-44 overflow-y-auto pr-1">
          {filteredLogs.map((log, index) => {
            const isFinished = log.startsWith("[Done]");
            const isTask = log.startsWith("[Task]");
            const isEngine = log.startsWith("[Engine]");
            return (
              <p
                key={index}
                className={`leading-relaxed ${
                  isFinished
                    ? "text-emerald-400 font-bold"
                    : isTask
                    ? "text-brand-300 font-semibold"
                    : isEngine
                    ? "text-indigo-300"
                    : "text-slate-400"
                }`}
              >
                {log}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}

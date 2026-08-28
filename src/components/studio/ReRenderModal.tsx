"use client";

import { useState, useEffect } from "react";
import {
  RotateCcw,
  Sliders,
  Layers,
  HardDrive,
  Zap,
  CheckCircle2,
  Loader2,
  Terminal,
  X,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { RenderHistoryItem } from "@/data/mockHistory";
import { renderHistoryService } from "@/services/renderHistoryService";

interface ReRenderModalProps {
  isOpen: boolean;
  currentJob: RenderHistoryItem;
  onClose: () => void;
  onSuccess: (newJob: RenderHistoryItem) => void;
}

export function ReRenderModal({
  isOpen,
  currentJob,
  onClose,
  onSuccess,
}: ReRenderModalProps) {
  const { showToast } = useToast();
  const [selectedResolutions, setSelectedResolutions] = useState<string[]>(currentJob.resolutions);
  const [segmentDuration, setSegmentDuration] = useState<number>(currentJob.segmentDuration);
  const [outputFolder, setOutputFolder] = useState<string>(currentJob.outputFolder);

  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFps, setCurrentFps] = useState(78.5);
  const [logMessages, setLogMessages] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleResolution = (res: string) => {
    setSelectedResolutions((prev) =>
      prev.includes(res) ? (prev.length > 1 ? prev.filter((r) => r !== res) : prev) : [...prev, res]
    );
  };

  const startReRender = () => {
    setIsRendering(true);
    setProgress(5);
    setLogMessages(["[FFmpeg] Initializing encoder pipeline...", "[FFmpeg] Reading video input track (H.264 / AAC)..."]);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          finishReRender();
          return 100;
        }
        const next = Math.min(prev + Math.floor(Math.random() * 15) + 10, 100);
        setCurrentFps(Math.round((70 + Math.random() * 25) * 10) / 10);
        setLogMessages((old) => [
          ...old,
          `[FFmpeg] Transcoding chunk at ${next}%: ${selectedResolutions.join(", ")} | FPS: ${currentFps}`,
        ]);
        return next;
      });
    }, 450);
  };

  const finishReRender = () => {
    setTimeout(() => {
      setIsRendering(false);
      const newJob = renderHistoryService.addHistoryItem({
        filename: currentJob.filename,
        sourceSize: currentJob.sourceSize,
        resolutions: selectedResolutions,
        segmentDuration,
        outputFolder,
        outputSize: `${(parseFloat(currentJob.outputSize) * (selectedResolutions.length / currentJob.resolutions.length)).toFixed(1)} MB`,
        tsSegmentsCount: Math.round(96 * (selectedResolutions.length / currentJob.resolutions.length)),
        status: "completed",
        progress: 100,
        completedAt: new Date().toISOString(),
        fps: currentFps,
        masterM3u8Url: `/api/download/hls/job_re_${Date.now()}/master.m3u8`,
        zipDownloadUrl: `/api/download/zip?jobId=job_re_${Date.now()}`,
      });

      showToast(`Video "${currentJob.filename}" berhasil di-render ulang!`);
      onSuccess(newJob);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 text-brand-400 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Render Ulang Video</h3>
              <p className="text-xs text-slate-400">Atur parameter dan mulai render ulang dengan engine FFmpeg</p>
            </div>
          </div>
          {!isRendering && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {!isRendering ? (
          <div className="space-y-5 text-xs">
            {/* Resolutions */}
            <div className="space-y-2">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-brand-400" />
                Format Resolusi Target:
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {["144p", "240p", "360p", "480p", "720p", "1080p"].map((res) => {
                  const active = selectedResolutions.includes(res);
                  return (
                    <button
                      key={res}
                      type="button"
                      onClick={() => toggleResolution(res)}
                      className={`p-2 rounded-xl font-bold text-center transition ${
                        active
                          ? "bg-brand-600 text-white shadow-lg shadow-brand-500/25 border border-brand-400"
                          : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {res}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Segment Duration */}
            <div className="space-y-2">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                Durasi Segmen Keping (.ts):
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 15].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setSegmentDuration(sec)}
                    className={`p-3 rounded-xl font-bold text-center transition ${
                      segmentDuration === sec
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400"
                        : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {sec} Detik / File
                  </button>
                ))}
              </div>
            </div>

            {/* Output Folder Path */}
            <div className="space-y-2">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-amber-400" />
                Folder Penyimpanan PC:
              </span>
              <input
                type="text"
                value={outputFolder}
                onChange={(e) => setOutputFolder(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 font-mono text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={startReRender}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-500/25 transition flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Mulai Render Ulang</span>
              </button>
            </div>
          </div>
        ) : (
          /* Live Progress Console */
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                <span>Memproses Transcoding HLS ({progress}%)...</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold">{currentFps} FPS</span>
            </div>

            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="rounded-xl border border-slate-800 bg-black/80 p-3 h-36 overflow-y-auto font-mono text-[11px] text-slate-400 space-y-1">
              {logMessages.slice(-6).map((log, idx) => (
                <div key={idx} className="truncate">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

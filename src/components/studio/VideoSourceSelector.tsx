"use client";

import { useState, useRef, useId } from "react";
import {
  FileVideo,
  Upload,
  CheckCircle2,
  Clock,
  HardDrive,
  Film,
  Info,
  X,
  Plus,
} from "lucide-react";

export interface SelectedSourceVideo {
  name: string;
  sizeMB: number;
  durationSec: number;
  resolution: string;
  fps: number;
  codec: string;
  isMock: boolean;
  mockId?: string;
  realFile?: File;
}

interface VideoSourceSelectorProps {
  value: SelectedSourceVideo | null;
  onChange: (source: SelectedSourceVideo | null) => void;
  disabled?: boolean;
  className?: string;
}

export function VideoSourceSelector({
  value,
  onChange,
  disabled = false,
  className = "",
}: VideoSourceSelectorProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleRealFile = (file: File) => {
    const sizeMB = Number((file.size / (1024 * 1024)).toFixed(1));
    onChange({
      name: file.name,
      sizeMB,
      durationSec: 120, // default duration until transcode
      resolution: "1920×1080 (Otomatis)",
      fps: 30,
      codec: "H.264 / AAC",
      isMock: false,
      realFile: file,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleRealFile(file);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept="video/mp4,video/mkv,video/quicktime,video/webm,video/x-msvideo,.mp4,.mkv,.mov,.webm,.avi"
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleRealFile(f);
        }}
      />

      {!value ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`p-7 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
            isDragging
              ? "border-cyan-400 bg-cyan-950/30 scale-[1.01]"
              : "border-slate-800 hover:border-brand-500/60 bg-slate-950/60 hover:bg-slate-900/80"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500/20 to-cyan-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-200">
              Pilih atau Tarik File Video ke Sini
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Mendukung format MP4, MKV, MOV, WebM, AVI (Tanpa batasan ukuran)
            </p>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-semibold text-slate-300">
            <Plus className="w-3 h-3 text-cyan-400" />
            Pilih File Video
          </span>
        </div>
      ) : (
        /* Selected Video Details */
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 flex-shrink-0">
                <FileVideo className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{value.name}</p>
                <p className="text-[10px] text-slate-400">{value.sizeMB} MB · File Sumber Siap</p>
              </div>
            </div>

            {!disabled && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Ganti
                </button>
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Hapus pilihan file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs pt-1">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
              <span className="text-[9px] text-slate-500 block uppercase">Resolusi</span>
              <span className="font-semibold text-slate-200 text-[11px] font-mono">{value.resolution}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
              <span className="text-[9px] text-slate-500 block uppercase">Ukuran</span>
              <span className="font-semibold text-slate-200 text-[11px] font-mono">{value.sizeMB} MB</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
              <span className="text-[9px] text-slate-500 block uppercase">Format Codec</span>
              <span className="font-semibold text-slate-200 text-[11px] font-mono">{value.codec}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
              <span className="text-[9px] text-slate-500 block uppercase">Framerate</span>
              <span className="font-semibold text-slate-200 text-[11px] font-mono">{value.fps} fps</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


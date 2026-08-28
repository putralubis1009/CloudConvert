"use client";

import { useState, useRef, useId } from "react";
import {
  FileVideo,
  Upload,
  Layers,
  CheckCircle2,
  Clock,
  HardDrive,
  Film,
  Sparkles,
  Info,
} from "lucide-react";
import { MOCK_VIDEOS_LIST, type MockVideoItem } from "@/data/mockVideos";

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
  value: SelectedSourceVideo;
  onChange: (source: SelectedSourceVideo) => void;
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
  const [activeTab, setActiveTab] = useState<"catalog" | "upload">(
    value.isMock ? "catalog" : "upload"
  );

  const handleRealFile = (file: File) => {
    const sizeMB = Number((file.size / (1024 * 1024)).toFixed(1));
    onChange({
      name: file.name,
      sizeMB,
      durationSec: 180, // estimated default duration for user file
      resolution: "1920×1080 (Otomatis)",
      fps: 30,
      codec: "H.264 / AAC",
      isMock: false,
      realFile: file,
    });
  };

  const handleMockSelect = (mock: MockVideoItem) => {
    onChange({
      name: mock.name,
      sizeMB: mock.sizeMB,
      durationSec: mock.durationSec,
      resolution: mock.resolution,
      fps: mock.fps,
      codec: mock.codec,
      isMock: true,
      mockId: mock.id,
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tab Switcher */}
      <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setActiveTab("catalog")}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "catalog"
              ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Katalog Sample Video ({MOCK_VIDEOS_LIST.length})
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setActiveTab("upload")}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "upload"
              ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          Upload File Lokal MP4
        </button>
      </div>

      {/* Tab 1: Mock Catalog Picker */}
      {activeTab === "catalog" && (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {MOCK_VIDEOS_LIST.map((video) => {
            const isSelected = value.isMock && value.mockId === video.id;
            return (
              <button
                key={video.id}
                type="button"
                disabled={disabled}
                onClick={() => handleMockSelect(video)}
                className={`w-full p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-brand-500 bg-brand-950/40 text-brand-200 shadow-md shadow-brand-500/10"
                    : "border-slate-800 bg-slate-950/70 hover:border-slate-700 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileVideo className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-brand-400" : "text-slate-400"}`} />
                    <span className="font-semibold text-xs truncate">{video.label}</span>
                  </div>
                  {video.badge && (
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      {video.badge}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-[10px] text-slate-400">
                  <span>{video.resolution}</span>
                  <span>•</span>
                  <span>{video.sizeMB} MB</span>
                  <span>•</span>
                  <span>{video.durationSec} detik</span>
                  <span>•</span>
                  <span>{video.fps} fps</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Tab 2: Upload Real MP4 */}
      {activeTab === "upload" && (
        <div>
          <input
            ref={fileInputRef}
            id={inputId}
            type="file"
            accept="video/mp4,.mp4"
            className="sr-only"
            disabled={disabled}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleRealFile(f);
            }}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-brand-500 bg-slate-950/50 hover:bg-brand-950/20 transition-all text-center group cursor-pointer"
          >
            <Upload className="w-8 h-8 text-slate-500 group-hover:text-brand-400 mx-auto mb-2 transition-colors" />
            <p className="text-xs font-semibold text-slate-200">
              Klik untuk memilih file MP4 dari komputer
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              File diproses 100% lokal di browser pengguna (maks 500 MB)
            </p>
          </button>
        </div>
      )}

      {/* Active Selection Details Card */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-brand-400" />
            Rincian File Video Terpilih
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {value.isMock ? "Data Tiruan (Mock)" : "File Pengguna"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block uppercase">Resolusi</span>
            <span className="font-semibold text-slate-200 font-mono">{value.resolution}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block uppercase">Ukuran</span>
            <span className="font-semibold text-slate-200 font-mono">{value.sizeMB} MB</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block uppercase">Durasi</span>
            <span className="font-semibold text-slate-200 font-mono">{value.durationSec}s</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block uppercase">Codec / FPS</span>
            <span className="font-semibold text-slate-200 font-mono">{value.codec} · {value.fps}fps</span>
          </div>
        </div>
      </div>
    </div>
  );
}

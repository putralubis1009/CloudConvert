"use client";

import { useState } from "react";
import {
  FolderOpen,
  CheckCircle2,
  HardDrive,
  Copy,
  Check,
  ExternalLink,
  FileCode2,
  Layers,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface OpenFolderModalProps {
  isOpen: boolean;
  folderPath: string;
  filename: string;
  resolutions: string[];
  tsCount: number;
  totalSize: string;
  onClose: () => void;
}

export function OpenFolderModal({
  isOpen,
  folderPath,
  filename,
  resolutions,
  tsCount,
  totalSize,
  onClose,
}: OpenFolderModalProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyPath = () => {
    navigator.clipboard.writeText(folderPath);
    setCopied(true);
    showToast("Path folder PC berhasil disalin ke clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchExplorer = () => {
    showToast(`Membuka "${folderPath}" di File Explorer...`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Folder Output Komputer (PC)</h3>
              <p className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Status: Berhasil Disimpan di Harddisk Lokal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Path box */}
        <div className="space-y-2">
          <span className="text-xs text-slate-400 font-semibold">Lokasi Direktori Penyimpanan:</span>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
            <span className="font-mono text-xs text-amber-300 truncate">{folderPath}</span>
            <button
              type="button"
              onClick={handleCopyPath}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition flex-shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Disalin!" : "Salin Path"}</span>
            </button>
          </div>
        </div>

        {/* Mock File Explorer Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Daftar Berkas di Dalam Folder:</span>
            <span className="font-mono text-slate-500">{totalSize} • {tsCount || 96} file</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-black/60 p-4 max-h-48 overflow-y-auto space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-brand-300 pb-1 border-b border-slate-800/80">
              <span className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-brand-400" />
                master.m3u8
              </span>
              <span className="text-[10px] text-slate-500">Master Playlist VOD</span>
            </div>

            {resolutions.map((res) => (
              <div key={res} className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-indigo-300">
                  <span className="flex items-center gap-2">
                    <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                    {res}/
                  </span>
                  <span className="text-[10px] text-slate-500">Folder Resolusi {res}</span>
                </div>
                <div className="pl-6 text-slate-400 text-[11px]">
                  ├─ index.m3u8 (Playlist Varian)
                </div>
                <div className="pl-6 text-slate-500 text-[10px]">
                  └─ chunk_000.ts s/d chunk_032.ts (Segmen Video MPEG-TS)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleLaunchExplorer}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-500/25 transition flex items-center gap-2"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Buka di File Explorer</span>
          </button>
        </div>
      </div>
    </div>
  );
}

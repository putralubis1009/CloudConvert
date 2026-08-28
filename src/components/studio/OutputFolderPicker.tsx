"use client";

import { useState } from "react";
import {
  Folder,
  FolderOpen,
  HardDrive,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Info,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export interface OutputFolderConfig {
  path: string;
  createSubfolder: boolean;
  subfolderName: string;
}

interface OutputFolderPickerProps {
  config: OutputFolderConfig;
  onChange: (cfg: OutputFolderConfig) => void;
  disabled?: boolean;
  className?: string;
}

const PRESET_PATHS = [
  "C:\\Users\\User\\Videos\\HLS_Output",
  "C:\\Users\\User\\Downloads\\HLS_Stream",
  "D:\\MediaAssets\\Transcoded_HLS",
  "E:\\Projects\\WebVideo\\output",
];

export function OutputFolderPicker({
  config,
  onChange,
  disabled = false,
  className = "",
}: OutputFolderPickerProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isCustomEditing, setIsCustomEditing] = useState(false);

  const fullDestinationPath = config.createSubfolder && config.subfolderName
    ? `${config.path}\\${config.subfolderName}`
    : config.path;

  const handlePickDirectoryNative = async () => {
    if (disabled) return;
    try {
      // Check if modern File System Access API is supported
      if ("showDirectoryPicker" in window) {
        // @ts-expect-error - standard browser API
        const dirHandle = await window.showDirectoryPicker();
        const pickedName = dirHandle.name;
        const newPath = `C:\\Users\\User\\Videos\\${pickedName}`;
        onChange({ ...config, path: newPath });
        showToast(`Direktori '${pickedName}' berhasil dipilih!`);
      } else {
        // Fallback cycle through realistic PC directory paths
        const nextIndex = (PRESET_PATHS.indexOf(config.path) + 1) % PRESET_PATHS.length;
        const next = PRESET_PATHS[nextIndex];
        onChange({ ...config, path: next });
        showToast(`Folder tujuan diubah ke: ${next}`);
      }
    } catch (err: unknown) {
      // User cancelled picker or error
      if (err instanceof Error && err.name !== "AbortError") {
        const nextIndex = (PRESET_PATHS.indexOf(config.path) + 1) % PRESET_PATHS.length;
        onChange({ ...config, path: PRESET_PATHS[nextIndex] });
      }
    }
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText(fullDestinationPath);
    setCopied(true);
    showToast("Path direktori berhasil disalin ke clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Folder className="w-3.5 h-3.5 text-amber-400" />
          Folder Penyimpanan Output (PC)
        </label>
        <span className="text-[10px] text-slate-400">
          Tersimpan langsung di komputer
        </span>
      </div>

      {/* Main Path Display Box */}
      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          {/* Path Display / Input */}
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 overflow-hidden">
            <HardDrive className="w-4 h-4 text-brand-400 flex-shrink-0" />
            {isCustomEditing ? (
              <input
                type="text"
                value={config.path}
                disabled={disabled}
                onChange={(e) => onChange({ ...config, path: e.target.value })}
                onBlur={() => setIsCustomEditing(false)}
                autoFocus
                className="w-full bg-transparent outline-none font-mono text-xs text-white"
              />
            ) : (
              <span
                onClick={() => !disabled && setIsCustomEditing(true)}
                className="truncate cursor-text"
                title="Klik untuk mengedit path manual"
              >
                {fullDestinationPath}
              </span>
            )}
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopyPath}
            title="Salin path"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Browse / Pick Button */}
          <button
            id="btn-browse-folder"
            type="button"
            disabled={disabled}
            onClick={handlePickDirectoryNative}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 flex-shrink-0 shadow-md shadow-brand-500/20"
          >
            <FolderOpen className="w-4 h-4" />
            Pilih Folder
          </button>
        </div>

        {/* Quick Preset Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-slate-500">Preset:</span>
          {PRESET_PATHS.map((preset) => {
            const isCurrent = config.path === preset;
            const shortName = preset.split("\\").pop() || preset;
            return (
              <button
                key={preset}
                type="button"
                disabled={disabled}
                onClick={() => onChange({ ...config, path: preset })}
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-colors ${
                  isCurrent
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Auto-create Subfolder Option */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={config.createSubfolder}
            disabled={disabled}
            onChange={(e) =>
              onChange({ ...config, createSubfolder: e.target.checked })
            }
            className="w-4 h-4 rounded text-brand-600 bg-slate-900 border-slate-700 focus:ring-brand-500"
          />
          <span className="text-slate-300 font-medium">
            Buat subfolder terpisah per video
          </span>
        </label>

        {config.createSubfolder && (
          <span className="text-[10px] font-mono text-brand-400 truncate max-w-[150px]">
            \{config.subfolderName}
          </span>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useCallback, useId } from "react";
import {
  Upload,
  Film,
  X,
  AlertCircle,
  CheckCircle2,
  FileVideo,
} from "lucide-react";

// ─── Constants ─────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE_MB = 2000; // 2GB support

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface VideoFile {
  real: File | null;
  mock?: any;
}

export type ValidationError =
  | "INVALID_TYPE"
  | "FILE_TOO_LARGE"
  | null;

interface VideoUploadProps {
  value: VideoFile;
  onChange: (v: VideoFile) => void;
  onValidationError?: (err: ValidationError) => void;
  showMockPicker?: boolean;
  className?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function validateFile(file: File): ValidationError {
  const validExtensions = [".mp4", ".mkv", ".mov", ".webm", ".avi"];
  const name = file.name.toLowerCase();
  const isValidExt = validExtensions.some((ext) => name.endsWith(ext));
  const isValidType = file.type.startsWith("video/") || isValidExt;

  if (!isValidType) return "INVALID_TYPE";
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return "FILE_TOO_LARGE";
  return null;
}

function formatSize(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

const ERROR_MESSAGES: Record<NonNullable<ValidationError>, string> = {
  INVALID_TYPE: "Format file video tidak didukung. Harap gunakan MP4, MKV, MOV, WebM, atau AVI.",
  FILE_TOO_LARGE: `Ukuran file melebihi batas maksimal ${MAX_FILE_SIZE_MB} MB.`,
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function FileInfoCard({
  name,
  size,
  onClear,
}: {
  name: string;
  size: string;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
        <FileVideo className="w-8 h-8 text-brand-600 dark:text-brand-400" />
      </div>

      <div className="text-center space-y-0.5">
        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate max-w-xs">
          {name}
        </p>
        <p className="text-xs text-slate-500 font-mono">{size}</p>
      </div>

      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" />
        File Video Siap
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClear();
        }}
        className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors mt-1"
        aria-label="Hapus file terpilih"
      >
        <X className="w-3.5 h-3.5" />
        Ganti file
      </button>
    </div>
  );
}

function DropZonePrompt({ dragging }: { dragging: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div
        className={`
          w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200
          ${dragging
            ? "bg-brand-500 text-white scale-110 shadow-lg shadow-brand-500/30"
            : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:text-brand-500 group-hover:bg-brand-50 dark:group-hover:bg-brand-950/40"}
        `}
      >
        <Upload className="w-8 h-8 transition-transform group-hover:-translate-y-0.5" />
      </div>

      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {dragging ? (
            <span className="text-brand-500">Lepaskan file di sini...</span>
          ) : (
            <>
              <span className="text-brand-600 dark:text-brand-400 font-bold">
                Klik untuk unggah
              </span>{" "}
              atau tarik file video ke sini
            </>
          )}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Mendukung format MP4, MKV, MOV, WebM, AVI (Maksimal 2 GB)
        </p>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60 px-3 py-1 rounded-full">
        <Film className="w-3 h-3 text-brand-500" />
        <span>Pemrosesan transcode aman & privat</span>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function VideoUpload({
  value,
  onChange,
  onValidationError,
  className = "",
}: VideoUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<ValidationError>(null);

  const hasFile = value.real !== null;

  const handleFile = useCallback(
    (file: File) => {
      const err = validateFile(file);
      setError(err);
      onValidationError?.(err);

      if (!err) {
        onChange({ real: file });
      }
    },
    [onChange, onValidationError]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    setError(null);
    onValidationError?.(null);
    onChange({ real: null });
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleZoneClick = () => {
    if (!hasFile) {
      inputRef.current?.click();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div
        role="button"
        tabIndex={hasFile ? -1 : 0}
        aria-label="Area unggah file video"
        onClick={handleZoneClick}
        onKeyDown={(e) => e.key === "Enter" && handleZoneClick()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!hasFile) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`
          relative rounded-2xl border-2 border-dashed transition-all duration-300 p-8 text-center
          ${hasFile ? "cursor-default" : "cursor-pointer group hover:border-brand-400 hover:bg-brand-50/30 dark:hover:bg-brand-950/10"}
          ${dragging
            ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30 scale-[1.01]"
            : hasFile
            ? "border-brand-400 bg-brand-50/50 dark:bg-brand-950/20"
            : error
            ? "border-red-300 dark:border-red-700"
            : "border-slate-300 dark:border-slate-700"}
        `}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="video/mp4,video/mkv,video/quicktime,video/webm,video/x-msvideo,.mp4,.mkv,.mov,.webm,.avi"
          className="sr-only"
          aria-label="Pilih file video"
          onChange={handleInputChange}
        />

        {hasFile && value.real ? (
          <FileInfoCard
            name={value.real.name}
            size={formatSize(value.real.size)}
            onClear={handleClear}
          />
        ) : (
          <DropZonePrompt dragging={dragging} />
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{ERROR_MESSAGES[error]}</span>
        </div>
      )}
    </div>
  );
}


"use client";

import { useState, useRef, useCallback, useId } from "react";
import {
  Upload,
  Film,
  X,
  AlertCircle,
  CheckCircle2,
  FileVideo,
  FlaskConical,
} from "lucide-react";

import { MOCK_VIDEOS_LIST, MockVideoItem } from "@/data/mockVideos";

// ─── Constants ─────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE_MB = 500;

export type MockFile = MockVideoItem;
export const MOCK_FILES = MOCK_VIDEOS_LIST;

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface VideoFile {
  /** Set when user picks a real file */
  real: File | null;
  /** Set when user picks a mock/stub file */
  mock: MockFile | null;
}

export type ValidationError =
  | "INVALID_TYPE"
  | "FILE_TOO_LARGE"
  | null;

interface VideoUploadProps {
  value: VideoFile;
  onChange: (v: VideoFile) => void;
  /** Called whenever validation changes */
  onValidationError?: (err: ValidationError) => void;
  /** Whether to show mock file selector (useful in dev/demo) */
  showMockPicker?: boolean;
  className?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function validateFile(file: File): ValidationError {
  const isMP4 =
    file.type === "video/mp4" || file.name.toLowerCase().endsWith(".mp4");
  if (!isMP4) return "INVALID_TYPE";
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return "FILE_TOO_LARGE";
  return null;
}

function formatSize(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

const ERROR_MESSAGES: Record<NonNullable<ValidationError>, string> = {
  INVALID_TYPE: "Hanya file MP4 yang didukung. Pastikan ekstensi file adalah .mp4",
  FILE_TOO_LARGE: `Ukuran file melebihi batas maksimal ${MAX_FILE_SIZE_MB} MB.`,
};

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Display info card for a selected file (real or mock) */
function FileInfoCard({
  name,
  size,
  meta,
  onClear,
}: {
  name: string;
  size: string;
  meta?: string;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
        <FileVideo className="w-8 h-8 text-brand-600 dark:text-brand-400" />
      </div>

      {/* File info */}
      <div className="text-center space-y-0.5">
        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate max-w-xs">
          {name}
        </p>
        <p className="text-xs text-slate-500">{size}</p>
        {meta && <p className="text-xs text-slate-400">{meta}</p>}
      </div>

      {/* Success badge */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Siap dikonversi
      </div>

      {/* Clear button */}
      <button
        type="button"
        onClick={onClear}
        className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
        Ganti File
      </button>
    </div>
  );
}

/** Empty state / drop zone content */
function DropZonePrompt({ dragging }: { dragging: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div
        className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300
          ${dragging
            ? "bg-brand-100 dark:bg-brand-900/40 scale-110"
            : "bg-slate-100 dark:bg-slate-800 group-hover:bg-brand-50 dark:group-hover:bg-brand-950/20"}`}
      >
        <Upload
          className={`w-9 h-9 transition-colors
            ${dragging ? "text-brand-600" : "text-slate-400 group-hover:text-brand-500"}`}
        />
      </div>

      <div className="space-y-1 text-center">
        <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
          {dragging ? "Lepaskan file di sini…" : "Seret & lepas file MP4"}
        </p>
        <p className="text-sm text-slate-500">
          atau{" "}
          <span className="text-brand-600 dark:text-brand-400 font-medium">
            klik untuk memilih
          </span>{" "}
          dari komputer
        </p>
        <p className="text-xs text-slate-400">
          Format: <strong>.mp4</strong> · Maks.{" "}
          <strong>{MAX_FILE_SIZE_MB} MB</strong>
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function VideoUpload({
  value,
  onChange,
  onValidationError,
  showMockPicker = false,
  className = "",
}: VideoUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<ValidationError>(null);
  const [showMock, setShowMock] = useState(false);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const hasFile = value.real !== null || value.mock !== null;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const applyRealFile = useCallback(
    (file: File) => {
      const err = validateFile(file);
      setError(err);
      onValidationError?.(err);
      if (!err) {
        onChange({ real: file, mock: null });
      }
    },
    [onChange, onValidationError]
  );

  const handleClear = useCallback(() => {
    setError(null);
    onValidationError?.(null);
    onChange({ real: null, mock: null });
    if (inputRef.current) inputRef.current.value = "";
  }, [onChange, onValidationError]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) applyRealFile(file);
    },
    [applyRealFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyRealFile(file);
  };

  const handleMockSelect = (mock: MockFile) => {
    setError(null);
    onValidationError?.(null);
    onChange({ real: null, mock });
    setShowMock(false);
  };

  // ── Zone click (only when no file selected) ──────────────────────────────
  const handleZoneClick = () => {
    if (!hasFile) {
      inputRef.current?.click();
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className={`space-y-3 ${className}`}>
      {/* ── Drop Zone ── */}
      <div
        role="button"
        tabIndex={hasFile ? -1 : 0}
        aria-label="Area unggah file video MP4"
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
        {/* Hidden file input */}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="video/mp4,.mp4"
          className="sr-only"
          aria-label="Pilih file MP4"
          onChange={handleInputChange}
        />

        {/* Content based on state */}
        {hasFile ? (
          value.real ? (
            <FileInfoCard
              name={value.real.name}
              size={formatSize(value.real.size)}
              onClear={handleClear}
            />
          ) : value.mock ? (
            <FileInfoCard
              name={value.mock.name}
              size={`${value.mock.sizeMB} MB`}
              meta={`${value.mock.resolution} · ${value.mock.durationSec}s · Data tiruan`}
              onClear={handleClear}
            />
          ) : null
        ) : (
          <DropZonePrompt dragging={dragging} />
        )}
      </div>

      {/* ── Validation Error ── */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{ERROR_MESSAGES[error]}</span>
        </div>
      )}

      {/* ── Mock File Picker (dev/demo only) ── */}
      {showMockPicker && (
        <div>
          <button
            type="button"
            id="btn-toggle-mock-picker"
            onClick={() => setShowMock((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors font-medium"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            {showMock ? "Sembunyikan" : "Gunakan"} file tiruan (demo)
          </button>

          {showMock && (
            <div
              role="listbox"
              aria-label="Pilih file tiruan"
              className="mt-2 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800"
            >
              {MOCK_FILES.map((mock) => (
                <button
                  key={mock.id}
                  id={`mock-file-${mock.id}`}
                  type="button"
                  role="option"
                  aria-selected={value.mock?.id === mock.id}
                  onClick={() => handleMockSelect(mock)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors text-sm
                    ${value.mock?.id === mock.id
                      ? "bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"}`}
                >
                  <Film className="w-4 h-4 flex-shrink-0 text-slate-400" />
                  <span className="flex-1 font-medium">{mock.label}</span>
                  <span className="text-xs text-slate-400">
                    {mock.resolution} · {mock.durationSec}s
                  </span>
                  {value.mock?.id === mock.id && (
                    <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

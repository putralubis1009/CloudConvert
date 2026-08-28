"use client";

import { Clock, Layers, HardDrive, CheckCircle2 } from "lucide-react";

// ─── Types & Data ──────────────────────────────────────────────────────────────
export type SegmentDuration = 5 | 10 | 15;

export interface SegmentOption {
  value: SegmentDuration;
  label: string;
  /** Short description shown under the label */
  description: string;
  /** Approximate number of segments per 60 seconds of video (stub data) */
  segmentsPerMinute: number;
  /** Impact on bandwidth — stub label */
  bandwidthHint: "Rendah" | "Sedang" | "Tinggi";
  /** Suitability hint for use case */
  useCaseHint: string;
}

/** Stub data — values approximate typical HLS configs */
export const SEGMENT_OPTIONS: SegmentOption[] = [
  {
    value: 5,
    label: "5 detik",
    description: "Lebih banyak segmen, loading lebih halus",
    segmentsPerMinute: 12,
    bandwidthHint: "Tinggi",
    useCaseHint: "Cocok untuk streaming live atau koneksi tidak stabil",
  },
  {
    value: 10,
    label: "10 detik",
    description: "Keseimbangan ideal antara segmen & ukuran file",
    segmentsPerMinute: 6,
    bandwidthHint: "Sedang",
    useCaseHint: "Pilihan terbaik untuk VOD umum",
  },
  {
    value: 15,
    label: "15 detik",
    description: "Lebih sedikit segmen, file unduhan lebih besar",
    segmentsPerMinute: 4,
    bandwidthHint: "Rendah",
    useCaseHint: "Cocok untuk koneksi stabil & file besar",
  },
];

const BANDWIDTH_BADGE: Record<SegmentOption["bandwidthHint"], string> = {
  Rendah: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400",
  Sedang: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400",
  Tinggi: "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400",
};

// ─── Props ─────────────────────────────────────────────────────────────────────
interface SegmentPickerProps {
  value: SegmentDuration;
  onChange: (v: SegmentDuration) => void;
  /** Show detailed metadata rows (segments/min, bandwidth, use-case) */
  showDetail?: boolean;
  disabled?: boolean;
  className?: string;
}

// ─── Card Item ─────────────────────────────────────────────────────────────────
function SegmentCard({
  option,
  selected,
  disabled,
  showDetail,
  onClick,
}: {
  option: SegmentOption;
  selected: boolean;
  disabled: boolean;
  showDetail: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      id={`seg-option-${option.value}s`}
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={`
        relative flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all duration-200 w-full
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${selected
          ? "border-brand-500 bg-brand-50 dark:bg-brand-950/40 shadow-md shadow-brand-500/15"
          : "border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-slate-50 dark:hover:bg-slate-800/40"}
      `}
    >
      {/* Header row */}
      <div className="flex items-center justify-between w-full gap-2">
        <span className={`flex items-center gap-1.5 font-semibold text-sm
          ${selected ? "text-brand-700 dark:text-brand-300" : "text-slate-700 dark:text-slate-300"}`}>
          <Clock className="w-4 h-4 flex-shrink-0" />
          {option.label}
        </span>

        {/* Bandwidth badge */}
        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${BANDWIDTH_BADGE[option.bandwidthHint]}`}>
          {option.bandwidthHint}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        {option.description}
      </p>

      {/* Detail rows */}
      {showDetail && (
        <div className="w-full space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <Layers className="w-3 h-3 flex-shrink-0" />
            <span>~{option.segmentsPerMinute} segmen / menit</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <HardDrive className="w-3 h-3 flex-shrink-0" />
            <span>{option.useCaseHint}</span>
          </div>
        </div>
      )}

      {/* Selected indicator */}
      {selected && (
        <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-brand-500" />
      )}
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function SegmentPicker({
  value,
  onChange,
  showDetail = false,
  disabled = false,
  className = "",
}: SegmentPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Pilih durasi segmen"
      className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${className}`}
    >
      {SEGMENT_OPTIONS.map((option) => (
        <SegmentCard
          key={option.value}
          option={option}
          selected={value === option.value}
          disabled={disabled}
          showDetail={showDetail}
          onClick={() => onChange(option.value)}
        />
      ))}
    </div>
  );
}

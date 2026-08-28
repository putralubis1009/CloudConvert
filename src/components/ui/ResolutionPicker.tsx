"use client";

import { CheckCircle2 } from "lucide-react";

// ─── Types & Data ──────────────────────────────────────────────────────────────
export type Resolution = "144p" | "240p" | "360p" | "480p" | "720p" | "1080p";

export interface ResolutionOption {
  value: Resolution;
  label: string;
  /** E.g. "256×144" */
  dimension: string;
  /** Approximate output bitrate in kbps */
  bitrateKbps: number;
  badge?: string;
  badgeColor?: "brand" | "amber" | "emerald";
}

/** Stub data — bitrates are estimated defaults for HLS output */
export const RESOLUTION_OPTIONS: ResolutionOption[] = [
  {
    value: "144p",
    label: "144p",
    dimension: "256×144",
    bitrateKbps: 250,
    badge: "Hemat Data",
    badgeColor: "emerald",
  },
  {
    value: "240p",
    label: "240p",
    dimension: "426×240",
    bitrateKbps: 500,
  },
  {
    value: "360p",
    label: "360p",
    dimension: "640×360",
    bitrateKbps: 800,
  },
  {
    value: "480p",
    label: "480p",
    dimension: "854×480",
    bitrateKbps: 1400,
  },
  {
    value: "720p",
    label: "720p HD",
    dimension: "1280×720",
    bitrateKbps: 2800,
    badge: "Populer",
    badgeColor: "brand",
  },
  {
    value: "1080p",
    label: "1080p FHD",
    dimension: "1920×1080",
    bitrateKbps: 5000,
    badge: "Terbaik",
    badgeColor: "amber",
  },
];

// ─── Badge color map ───────────────────────────────────────────────────────────
const BADGE_CLASSES: Record<NonNullable<ResolutionOption["badgeColor"]>, string> = {
  brand: "bg-brand-600 text-white",
  amber: "bg-amber-500 text-white",
  emerald: "bg-emerald-600 text-white",
};

// ─── Format bitrate ─────────────────────────────────────────────────────────
function formatBitrate(kbps: number): string {
  if (kbps >= 1000) return `${(kbps / 1000).toFixed(1)} Mbps`;
  return `${kbps} kbps`;
}

// ─── Props ─────────────────────────────────────────────────────────────────────
interface ResolutionPickerProps {
  value: Resolution;
  onChange: (v: Resolution) => void;
  /** Visual layout — 'grid' (default) or 'list' */
  layout?: "grid" | "list";
  disabled?: boolean;
  className?: string;
}

// ─── Grid Item ─────────────────────────────────────────────────────────────────
function GridItem({
  option,
  selected,
  disabled,
  onClick,
}: {
  option: ResolutionOption;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const badgeClass = option.badgeColor
    ? BADGE_CLASSES[option.badgeColor]
    : "bg-brand-600 text-white";

  return (
    <button
      type="button"
      id={`res-option-${option.value}`}
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={`
        relative py-3 px-2 rounded-xl text-sm font-semibold border-2 transition-all duration-200 text-center
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${selected
          ? "border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 shadow-md shadow-brand-500/15"
          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50/30 dark:hover:bg-brand-950/10"}
      `}
    >
      {/* Badge */}
      {option.badge && (
        <span
          className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[9px] font-bold rounded-full whitespace-nowrap ${badgeClass}`}
        >
          {option.badge}
        </span>
      )}

      {/* Label */}
      <span className="block">{option.label}</span>

      {/* Bitrate hint */}
      <span
        className={`block text-[10px] font-normal mt-0.5
          ${selected ? "text-brand-500 dark:text-brand-400" : "text-slate-400 dark:text-slate-500"}`}
      >
        ~{formatBitrate(option.bitrateKbps)}
      </span>

      {/* Selected checkmark */}
      {selected && (
        <CheckCircle2 className="absolute top-1.5 right-1.5 w-3 h-3 text-brand-500" />
      )}
    </button>
  );
}

// ─── List Item ─────────────────────────────────────────────────────────────────
function ListItem({
  option,
  selected,
  disabled,
  onClick,
}: {
  option: ResolutionOption;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const badgeClass = option.badgeColor
    ? BADGE_CLASSES[option.badgeColor]
    : "bg-brand-600 text-white";

  return (
    <button
      type="button"
      id={`res-option-list-${option.value}`}
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 border-2 rounded-xl text-left transition-all duration-200
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${selected
          ? "border-brand-500 bg-brand-50 dark:bg-brand-950/40"
          : "border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-slate-50 dark:hover:bg-slate-800/40"}
      `}
    >
      {/* Radio dot */}
      <div
        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
          ${selected ? "border-brand-500 bg-brand-500" : "border-slate-300 dark:border-slate-600"}`}
      >
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>

      {/* Label + dimension */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-semibold text-sm ${selected ? "text-brand-700 dark:text-brand-300" : "text-slate-700 dark:text-slate-300"}`}>
            {option.label}
          </span>
          {option.badge && (
            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full ${badgeClass}`}>
              {option.badge}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {option.dimension} · ~{formatBitrate(option.bitrateKbps)}
        </span>
      </div>

      {/* Checkmark */}
      {selected && <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />}
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function ResolutionPicker({
  value,
  onChange,
  layout = "grid",
  disabled = false,
  className = "",
}: ResolutionPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Pilih resolusi output"
      className={className}
    >
      {layout === "grid" ? (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {RESOLUTION_OPTIONS.map((option) => (
            <GridItem
              key={option.value}
              option={option}
              selected={value === option.value}
              disabled={disabled}
              onClick={() => onChange(option.value)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {RESOLUTION_OPTIONS.map((option) => (
            <ListItem
              key={option.value}
              option={option}
              selected={value === option.value}
              disabled={disabled}
              onClick={() => onChange(option.value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

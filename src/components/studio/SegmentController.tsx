"use client";

import { useState } from "react";
import { Clock, Layers, Calculator, Info, LayoutGrid, ListFilter } from "lucide-react";
import {
  SegmentPicker,
  type SegmentDuration,
  SEGMENT_OPTIONS,
} from "@/components/ui/SegmentPicker";
import { SegmentDropdown } from "@/components/ui/SegmentDropdown";

interface SegmentControllerProps {
  segmentSec: SegmentDuration;
  onChange: (sec: SegmentDuration) => void;
  videoDurationSec: number;
  disabled?: boolean;
  className?: string;
}

export function SegmentController({
  segmentSec,
  onChange,
  videoDurationSec,
  disabled = false,
  className = "",
}: SegmentControllerProps) {
  const [viewMode, setViewMode] = useState<"dropdown" | "cards">("dropdown");
  const estimatedSegments = Math.ceil(videoDurationSec / segmentSec);
  const selectedOption = SEGMENT_OPTIONS.find((s) => s.value === segmentSec);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-400" />
            Durasi Potongan Segmen HLS (.ts)
          </label>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode("dropdown")}
              title="Tampilan Dropdown"
              className={`p-1 rounded text-[10px] ${
                viewMode === "dropdown" ? "bg-brand-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <ListFilter className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              title="Tampilan Kartu"
              className={`p-1 rounded text-[10px] ${
                viewMode === "cards" ? "bg-brand-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
            </button>
          </div>
        </div>

        <span className="text-[11px] font-mono text-brand-400 bg-brand-950/60 px-2 py-0.5 rounded border border-brand-500/20">
          Target: {segmentSec}s / slice
        </span>
      </div>

      {/* Preset Picker: Dropdown or Cards */}
      {viewMode === "dropdown" ? (
        <SegmentDropdown
          value={segmentSec}
          onChange={onChange}
          disabled={disabled}
        />
      ) : (
        <SegmentPicker
          value={segmentSec}
          onChange={onChange}
          showDetail
          disabled={disabled}
        />
      )}

      {/* Live Segment Calculator & Estimation Banner */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Calculator className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div>
            <span className="text-slate-300 font-semibold">Estimasi Output:</span>{" "}
            <span className="font-mono text-emerald-400 font-bold">~{estimatedSegments} berkas .ts</span>{" "}
            <span className="text-[10px] text-slate-500">
              (untuk durasi {videoDurationSec}s)
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-400">
          <Layers className="w-3 h-3 text-brand-400" />
          <span>+ 1 file playlist (.m3u8)</span>
        </div>
      </div>
    </div>
  );
}

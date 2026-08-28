"use client";

import { useState } from "react";
import { Layers, Sliders, CheckCircle2, Sparkles, LayoutGrid, ListFilter } from "lucide-react";
import {
  ResolutionPicker,
  type Resolution,
  RESOLUTION_OPTIONS,
} from "@/components/ui/ResolutionPicker";
import { ResolutionDropdown } from "@/components/ui/ResolutionDropdown";

export interface ResolutionConfig {
  selected: Resolution;
  enableAdaptiveLadder: boolean;
  activeVariants: Resolution[];
  qualityPreset: "economy" | "balanced" | "ultra";
  viewMode?: "dropdown" | "grid";
}

interface ResolutionControllerProps {
  config: ResolutionConfig;
  onChange: (config: ResolutionConfig) => void;
  disabled?: boolean;
  className?: string;
}

export function ResolutionController({
  config,
  onChange,
  disabled = false,
  className = "",
}: ResolutionControllerProps) {
  const [viewMode, setViewMode] = useState<"dropdown" | "grid">(config.viewMode || "dropdown");

  const toggleVariant = (res: Resolution) => {
    if (config.activeVariants.includes(res)) {
      if (config.activeVariants.length > 1) {
        onChange({
          ...config,
          activeVariants: config.activeVariants.filter((r) => r !== res),
        });
      }
    } else {
      onChange({
        ...config,
        activeVariants: [...config.activeVariants, res],
      });
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-brand-400" />
            Resolusi Output HLS
          </label>

          {/* View mode toggle (only in single-variant mode) */}
          {!config.enableAdaptiveLadder && (
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
                onClick={() => setViewMode("grid")}
                title="Tampilan Grid"
                className={`p-1 rounded text-[10px] ${
                  viewMode === "grid" ? "bg-brand-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <LayoutGrid className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
        
        {/* Toggle Multi-Bitrate Ladder */}
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            onChange({
              ...config,
              enableAdaptiveLadder: !config.enableAdaptiveLadder,
            })
          }
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 border ${
            config.enableAdaptiveLadder
              ? "bg-brand-500/20 text-brand-300 border-brand-500/40"
              : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-3 h-3" />
          {config.enableAdaptiveLadder ? "Mode Multi-Bitrate (ABR)" : "Mode Single-Variant"}
        </button>
      </div>

      {!config.enableAdaptiveLadder ? (
        /* Single Resolution Mode: Dropdown or Grid */
        viewMode === "dropdown" ? (
          <ResolutionDropdown
            value={config.selected}
            onChange={(res) => onChange({ ...config, selected: res })}
            disabled={disabled}
          />
        ) : (
          <ResolutionPicker
            value={config.selected}
            onChange={(res) => onChange({ ...config, selected: res })}
            disabled={disabled}
          />
        )
      ) : (
        /* Multi-Variant Ladder Selector */
        <div className="space-y-2">
          <p className="text-[11px] text-slate-400">
            Pilih resolusi yang akan dimasukkan ke dalam multi-bitrate <span className="font-mono text-brand-400">master.m3u8</span>:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {RESOLUTION_OPTIONS.map((opt) => {
              const active = config.activeVariants.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleVariant(opt.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    active
                      ? "border-brand-500 bg-brand-950/40 text-brand-200"
                      : "border-slate-800 bg-slate-950/60 text-slate-500 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{opt.label}</span>
                    {active && <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {opt.dimension} · ~{opt.bitrateKbps} kbps
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Preset Quality Selector */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          Preset Kompresi:
        </span>
        <div className="flex gap-1.5">
          {(["economy", "balanced", "ultra"] as const).map((preset) => (
            <button
              key={preset}
              type="button"
              disabled={disabled}
              onClick={() => onChange({ ...config, qualityPreset: preset })}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold capitalize transition-all ${
                config.qualityPreset === preset
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {preset === "economy" ? "Hemat" : preset === "balanced" ? "Seimbang" : "Ultra"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

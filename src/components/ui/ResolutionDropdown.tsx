"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Video, Sparkles, CheckCircle2 } from "lucide-react";
import {
  RESOLUTION_OPTIONS,
  type Resolution,
  type ResolutionOption,
} from "./ResolutionPicker";

interface ResolutionDropdownProps {
  value: Resolution;
  onChange: (res: Resolution) => void;
  disabled?: boolean;
  className?: string;
}

export function ResolutionDropdown({
  value,
  onChange,
  disabled = false,
  className = "",
}: ResolutionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption =
    RESOLUTION_OPTIONS.find((opt) => opt.value === value) ||
    RESOLUTION_OPTIONS[4]; // default 720p

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (res: Resolution) => {
    onChange(res);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        id="btn-resolution-dropdown"
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between p-3 rounded-xl border bg-slate-950 text-left transition-all ${
          isOpen
            ? "border-brand-500 ring-2 ring-brand-500/20 text-white"
            : "border-slate-800 hover:border-slate-700 text-slate-200"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-brand-600/20 text-brand-400 flex items-center justify-center flex-shrink-0 border border-brand-500/30">
            <Video className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-white">
                {selectedOption.label}
              </span>
              {selectedOption.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-brand-500/30 text-brand-300 border border-brand-500/40">
                  {selectedOption.badge}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {selectedOption.dimension} · Bitrate ~{selectedOption.bitrateKbps >= 1000 ? `${(selectedOption.bitrateKbps / 1000).toFixed(1)} Mbps` : `${selectedOption.bitrateKbps} kbps`}
            </p>
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-brand-400" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden divide-y divide-slate-800/80 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="p-2 bg-slate-950/80 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Pilih Resolusi Video Output
          </div>
          <div className="p-1.5 space-y-1 max-h-60 overflow-y-auto">
            {RESOLUTION_OPTIONS.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors text-xs ${
                    isSelected
                      ? "bg-brand-950/60 border border-brand-500/40 text-brand-200"
                      : "hover:bg-slate-800 text-slate-300 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                        isSelected
                          ? "bg-brand-600 text-white"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {option.value}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-200">
                          {option.label}
                        </span>
                        {option.badge && (
                          <span className="px-1.5 py-0.2 text-[8px] font-bold rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                            {option.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {option.dimension} (~{option.bitrateKbps} kbps)
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

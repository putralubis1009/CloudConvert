"use client";

import { useState } from "react";
import {
  Monitor,
  Laptop,
  Terminal,
  Cpu,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Zap,
} from "lucide-react";

interface RequirementSpec {
  os: string;
  osMin: string;
  osRec: string;
  cpuMin: string;
  cpuRec: string;
  ramMin: string;
  ramRec: string;
  diskMin: string;
  diskRec: string;
  gpuSupport: string;
}

const REQUIREMENTS_DATA: Record<"windows" | "mac" | "linux", RequirementSpec> = {
  windows: {
    os: "Windows",
    osMin: "Windows 10 64-bit (Build 19041+)",
    osRec: "Windows 11 64-bit (Terbaru)",
    cpuMin: "Intel Core i3 / AMD Ryzen 3 (Dual-core)",
    cpuRec: "Intel Core i5 / i7 Gen 8+ atau AMD Ryzen 5+",
    ramMin: "4 GB RAM",
    ramRec: "8 GB - 16 GB RAM DDR4/DDR5",
    diskMin: "300 MB ruang kosong untuk aplikasi",
    diskRec: "SSD dengan 10+ GB ruang untuk temp cache video",
    gpuSupport: "NVIDIA NVENC (GTX 900+), Intel QuickSync, AMD AMF",
  },
  mac: {
    os: "macOS",
    osMin: "macOS 11.0 Big Sur",
    osRec: "macOS 14 Sonoma atau macOS 15 Sequoia",
    cpuMin: "Intel Core i5 64-bit / Apple M1",
    cpuRec: "Apple M1 / M2 / M3 / M4 Series (Pro / Max)",
    ramMin: "8 GB Unified Memory",
    ramRec: "16 GB+ Unified Memory",
    diskMin: "350 MB ruang kosong",
    diskRec: "SSD Internal Mac berkecepatan tinggi",
    gpuSupport: "Hardware VideoToolbox H.264 / HEVC native encoder",
  },
  linux: {
    os: "Linux",
    osMin: "Ubuntu 20.04 LTS / Debian 11 / Fedora 36",
    osRec: "Ubuntu 24.04 LTS / Arch Linux / Fedora 40",
    cpuMin: "Dual-core x86_64 2.0 GHz",
    cpuRec: "Quad-core x86_64 3.0 GHz+",
    ramMin: "4 GB RAM",
    ramRec: "8 GB+ RAM",
    diskMin: "250 MB ruang kosong",
    diskRec: "NVMe / SATA SSD",
    gpuSupport: "VA-API, NVIDIA NVENC via proprietary drivers",
  },
};

interface SystemRequirementsProps {
  className?: string;
}

export function SystemRequirements({ className = "" }: SystemRequirementsProps) {
  const [activeOs, setActiveOs] = useState<"windows" | "mac" | "linux">("windows");
  const currentReq = REQUIREMENTS_DATA[activeOs];

  return (
    <section className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Persyaratan Sistem Operasi
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Pastikan perangkat komputer Anda memenuhi spesifikasi minimum untuk performa transcoding yang mulus.
        </p>
      </div>

      {/* OS Switcher Buttons */}
      <div className="flex justify-center gap-2">
        {[
          { key: "windows", label: "Windows", icon: Monitor },
          { key: "mac", label: "macOS (Apple)", icon: Laptop },
          { key: "linux", label: "Linux (All Distros)", icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeOs === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveOs(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-brand-600 text-white shadow-lg shadow-brand-500/25 border border-brand-400/40"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Comparison Specs Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Cpu className="w-4 h-4 text-brand-400" />
            <span>Spesifikasi untuk {currentReq.os}</span>
          </div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            64-bit Architecture
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 text-xs">
          {/* Minimum Requirements */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-300 font-bold border-b border-slate-800 pb-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Kebutuhan Minimum</span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Sistem Operasi</span>
                <span className="text-slate-300">{currentReq.osMin}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Prosesor (CPU)</span>
                <span className="text-slate-300">{currentReq.cpuMin}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Memori (RAM)</span>
                <span className="text-slate-300">{currentReq.ramMin}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Penyimpanan Harddisk</span>
                <span className="text-slate-300">{currentReq.diskMin}</span>
              </div>
            </div>
          </div>

          {/* Recommended Requirements */}
          <div className="p-6 space-y-4 bg-brand-950/20">
            <div className="flex items-center gap-2 text-brand-300 font-bold border-b border-slate-800 pb-2">
              <Zap className="w-4 h-4 text-brand-400" />
              <span>Direkomendasikan (Fast Transcoding)</span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-brand-400/80 uppercase font-semibold block">Sistem Operasi</span>
                <span className="text-white font-medium">{currentReq.osRec}</span>
              </div>
              <div>
                <span className="text-[10px] text-brand-400/80 uppercase font-semibold block">Prosesor (CPU)</span>
                <span className="text-white font-medium">{currentReq.cpuRec}</span>
              </div>
              <div>
                <span className="text-[10px] text-brand-400/80 uppercase font-semibold block">Memori (RAM)</span>
                <span className="text-white font-medium">{currentReq.ramRec}</span>
              </div>
              <div>
                <span className="text-[10px] text-brand-400/80 uppercase font-semibold block">Penyimpanan SSD</span>
                <span className="text-white font-medium">{currentReq.diskRec}</span>
              </div>
              <div>
                <span className="text-[10px] text-brand-400/80 uppercase font-semibold block">Hardware GPU</span>
                <span className="text-emerald-400 font-medium">{currentReq.gpuSupport}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Monitor,
  Laptop,
  Terminal,
  Download,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  HardDrive,
  Cpu,
  Layers,
} from "lucide-react";
import { AppDownloadButton } from "./AppDownloadButton";
import { MOCK_DOWNLOAD_PACKAGES, DownloadPackage } from "@/data/downloadData";

export function SmartDownloadBanner({
  onSelectManualTab,
}: {
  onSelectManualTab?: (os: "all" | "windows" | "mac" | "linux") => void;
}) {
  const [detectedOs, setDetectedOs] = useState<"windows" | "mac" | "linux">("windows");
  const [detectedPackage, setDetectedPackage] = useState<DownloadPackage>(MOCK_DOWNLOAD_PACKAGES[0]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const ua = window.navigator.userAgent.toLowerCase();
    const platform = window.navigator.platform?.toLowerCase() || "";

    if (ua.includes("mac") || platform.includes("mac")) {
      setDetectedOs("mac");
      // Check Apple Silicon
      const isAppleSilicon = ua.includes("arm") || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
      const pkg = MOCK_DOWNLOAD_PACKAGES.find((p) => p.id === (isAppleSilicon ? "mac-apple-silicon" : "mac-apple-silicon")) || MOCK_DOWNLOAD_PACKAGES[2];
      setDetectedPackage(pkg);
    } else if (ua.includes("linux") || platform.includes("linux")) {
      setDetectedOs("linux");
      const pkg = MOCK_DOWNLOAD_PACKAGES.find((p) => p.id === "linux-appimage") || MOCK_DOWNLOAD_PACKAGES[4];
      setDetectedPackage(pkg);
    } else {
      setDetectedOs("windows");
      const pkg = MOCK_DOWNLOAD_PACKAGES.find((p) => p.id === "win-installer") || MOCK_DOWNLOAD_PACKAGES[0];
      setDetectedPackage(pkg);
    }
  }, []);

  const getOsIcon = (os: "windows" | "mac" | "linux") => {
    switch (os) {
      case "windows":
        return Monitor;
      case "mac":
        return Laptop;
      case "linux":
        return Terminal;
    }
  };

  const Icon = getOsIcon(detectedOs);

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-brand-500/40 bg-gradient-to-b from-brand-950/50 via-slate-900 to-slate-900 p-6 sm:p-8 shadow-2xl shadow-brand-500/10">
      <div className="absolute top-0 right-0 w-72 h-72 bg-brand-600/10 blur-3xl pointer-events-none rounded-full" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center lg:text-left max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sistem Operasi Anda Terdeteksi Otomatis</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Unduh Cloud Converter Video untuk {detectedPackage.name}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Paket instalasi desktop terbaik dengan engine FFmpeg native, akselerasi GPU, dual-engine render & upload ke Cloudflare R2 / S3, dan penyimpanan langsung ke folder PC.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <Cpu className="w-4 h-4 text-brand-400" />
              {detectedPackage.arch.toUpperCase()} Architecture
            </span>
            <span className="flex items-center gap-1">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              {detectedPackage.fileSize}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              {detectedPackage.version}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-3">
          <AppDownloadButton
            platformId={detectedPackage.id}
            platformName={detectedPackage.name}
            fileSize={detectedPackage.fileSize}
            downloadUrl={detectedPackage.downloadUrl}
            sha256={detectedPackage.sha256}
            isPrimary={true}
          />

          <div className="text-center">
            <button
              type="button"
              onClick={() => onSelectManualTab && onSelectManualTab("all")}
              className="text-[11px] text-slate-400 hover:text-white underline underline-offset-4 transition"
            >
              Atau pilih versi untuk sistem operasi lain secara manual ↓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

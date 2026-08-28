"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface ReleasePackage {
  platform: string;
  arch: string;
  filename: string;
  fileSize: string;
  downloadUrl: string;
  sha256: string;
}

interface UpdateData {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseDate: string;
  mandatory?: boolean;
  changelog: string[];
  package?: ReleasePackage;
}

const CURRENT_APP_VERSION = "1.7.0";

export function UpdateNotifier({ manualCheckTrigger }: { manualCheckTrigger?: number }) {
  const [updateData, setUpdateData] = useState<UpdateData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const checkForUpdates = async (isManual = false) => {
    setIsChecking(true);
    setCheckMessage(null);

    try {
      // Get current version from Electron API if available
      let version = CURRENT_APP_VERSION;
      if (typeof window !== "undefined" && (window as any).electronAPI?.getAppVersion) {
        try {
          const v = await (window as any).electronAPI.getAppVersion();
          if (v) version = v;
        } catch {}
      }

      const res = await fetch(`/api/releases/latest?currentVersion=${version}&platform=windows`);
      if (!res.ok) throw new Error("Gagal mengambil data versi");
      const data: UpdateData = await res.json();

      setUpdateData(data);

      if (data.hasUpdate) {
        setIsOpen(true);
      } else if (isManual) {
        setCheckMessage(`Aplikasi Anda sudah versi terbaru (v${version}) ✓`);
        setTimeout(() => setCheckMessage(null), 4000);
      }
    } catch (err: any) {
      if (isManual) {
        setCheckMessage("Tidak dapat terhubung ke server update.");
        setTimeout(() => setCheckMessage(null), 4000);
      }
    } finally {
      setIsChecking(false);
    }
  };

  // Initial check on mount
  useEffect(() => {
    // Check after 2 seconds to not block initial render
    const timer = setTimeout(() => {
      checkForUpdates(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Manual trigger check
  useEffect(() => {
    if (manualCheckTrigger && manualCheckTrigger > 0) {
      checkForUpdates(true);
    }
  }, [manualCheckTrigger]);

  const handleDownloadUpdate = () => {
    const downloadUrl = updateData?.package?.downloadUrl || "/api/download/app?platform=windows&arch=x64";
    const link = document.createElement("a");
    link.href = downloadUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Toast Notification if checked manually and no update */}
      {checkMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div className="px-4 py-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{checkMessage}</span>
          </div>
        </div>
      )}

      {/* Floating Pill Banner when update is available and modal is closed */}
      {updateData?.hasUpdate && !isOpen && !dismissed && (
        <div className="fixed bottom-5 right-5 z-40 animate-fade-in">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white text-xs font-bold shadow-2xl shadow-violet-500/30 flex items-center gap-2.5 hover:scale-105 transition-all"
          >
            <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
            <span>Versi Baru v{updateData.latestVersion} Tersedia!</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20">Lihat</span>
          </button>
        </div>
      )}

      {/* Modern Glassmorphic Update Modal */}
      {isOpen && updateData?.hasUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0e111a] border border-violet-500/30 p-6 sm:p-7 text-slate-100 shadow-2xl shadow-violet-500/20 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/15 blur-3xl pointer-events-none rounded-full" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />

            {/* Header */}
            <div className="relative flex items-start justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-violet-500/30 flex-shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">Pembaruan Tersedia!</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono font-bold">
                      v{updateData.latestVersion}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Versi Anda saat ini: <strong className="text-slate-300 font-mono">v{updateData.currentVersion}</strong>
                  </p>
                </div>
              </div>

              {!updateData.mandatory && (
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Changelog Box */}
            <div className="relative mb-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 p-4 space-y-2.5 max-h-52 overflow-y-auto">
              <div className="text-[11px] font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Apa yang baru di versi {updateData.latestVersion}:
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {updateData.changelog.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-cyan-400 mt-0.5 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="relative flex items-center justify-end gap-3 pt-2">
              {!updateData.mandatory && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setDismissed(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold border border-slate-800 transition-colors"
                >
                  Ingatkan Nanti
                </button>
              )}

              <button
                type="button"
                onClick={handleDownloadUpdate}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-violet-500/25 flex items-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Perbarui Sekarang ({updateData.package?.fileSize || "178 MB"})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

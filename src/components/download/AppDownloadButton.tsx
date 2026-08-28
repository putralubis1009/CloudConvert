"use client";

import { useState } from "react";
import { Download, CheckCircle2, Loader2, ShieldCheck, Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface AppDownloadButtonProps {
  platformId: string;
  platformName: string;
  fileSize: string;
  downloadUrl: string;
  isPrimary?: boolean;
  sha256?: string;
  className?: string;
}

export function AppDownloadButton({
  platformId,
  platformName,
  fileSize,
  downloadUrl,
  isPrimary = false,
  sha256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  className = "",
}: AppDownloadButtonProps) {
  const { showToast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [copiedSha, setCopiedSha] = useState(false);

  const handleDownload = () => {
    if (downloading) return;
    setDownloading(true);
    showToast(`Mengunduh installer ${platformName} (${fileSize})...`);

    setTimeout(() => {
      // Trigger browser download via dynamic link
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `HLS-Converter-${platformId}-Setup.exe`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloading(false);
      setDownloaded(true);
      showToast(`Unduhan ${platformName} selesai!`);
    }, 1200);
  };

  const copyChecksum = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sha256);
    setCopiedSha(true);
    showToast("Checksum SHA-256 berhasil disalin ke clipboard.");
    setTimeout(() => setCopiedSha(false), 2500);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <button
        id={`btn-download-${platformId}`}
        type="button"
        disabled={downloading}
        onClick={handleDownload}
        className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
          downloaded
            ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
            : isPrimary
            ? "bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/25"
            : "bg-slate-800 hover:bg-slate-700 text-white"
        } disabled:opacity-75 disabled:cursor-wait`}
      >
        {downloading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Sedang Mengunduh ({fileSize})...</span>
          </>
        ) : downloaded ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Unduh Lagi ({fileSize})</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Unduh {platformName}</span>
          </>
        )}
      </button>

      {/* Checksum quick verify */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          SHA-256 Verifikasi
        </span>
        <button
          type="button"
          onClick={copyChecksum}
          className="hover:text-slate-300 flex items-center gap-1 font-mono text-[9px] transition-colors"
          title="Salin hash SHA-256"
        >
          {copiedSha ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
          <span>{sha256.substring(0, 10)}...</span>
        </button>
      </div>
    </div>
  );
}

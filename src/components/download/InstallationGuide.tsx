"use client";

import { useState } from "react";
import {
  Monitor,
  Laptop,
  Terminal,
  CheckCircle2,
  FolderOpen,
  ShieldCheck,
  HelpCircle,
  FileCheck,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface StepItem {
  step: number;
  title: string;
  description: string;
  hint?: string;
  code?: string;
}

const INSTALL_GUIDES: Record<"windows" | "mac" | "linux", { osName: string; steps: StepItem[] }> = {
  windows: {
    osName: "Windows",
    steps: [
      {
        step: 1,
        title: "Unduh Berkas Installer (.exe / .zip)",
        description:
          "Pilih tombol 'Unduh Windows 64-bit' di atas. Simpan file installer di folder Downloads komputer Anda.",
      },
      {
        step: 2,
        title: "Jalankan Setup Installer",
        description:
          "Klik ganda pada file `HLS-Converter-Setup-x64.exe`. Jika muncul jendela Windows SmartScreen ('Windows protected your PC'), klik 'More info' lalu pilih 'Run anyway'.",
        hint: "Aplikasi ini aman dan ditandatangani secara digital.",
      },
      {
        step: 3,
        title: "Selesaikan Pemasangan & Buka Software",
        description:
          "Ikuti instruksi wizard pemasangan. Icon shortcut HLS Converter akan otomatis muncul di Desktop dan Start Menu.",
      },
      {
        step: 4,
        title: "Siap Digunakan Tanpa Setup Tambahan",
        description:
          "Buka aplikasi, pilih file MP4, tentukan folder tujuan penyimpanan PC, dan klik 'Mulai Render HLS'!",
      },
    ],
  },
  mac: {
    osName: "macOS",
    steps: [
      {
        step: 1,
        title: "Unduh Berkas Disk Image (.dmg)",
        description:
          "Pilih tombol 'macOS Apple Silicon' (untuk Mac M1/M2/M3/M4) atau 'macOS Intel' sesuai tipe prosesor Mac Anda.",
      },
      {
        step: 2,
        title: "Buka Berkas .DMG & Drag ke Applications",
        description:
          "Buka file `.dmg` yang telah diunduh, lalu drag ikon **HLS Converter** ke folder **Applications**.",
      },
      {
        step: 3,
        title: "Izin Keamanan Gatekeeper (Pertama Kali)",
        description:
          "Jika muncul peringatan keamanan macOS, buka `System Settings` > `Privacy & Security` > klik `Open Anyway`.",
      },
      {
        step: 4,
        title: "Aplikasi Siap Digunakan",
        description:
          "Buka HLS Converter dari Launchpad atau Spotlight (`Cmd + Space`). Transcoding siap dijalankan dengan akselerasi Apple VideoToolbox.",
      },
    ],
  },
  linux: {
    osName: "Linux",
    steps: [
      {
        step: 1,
        title: "Unduh Paket AppImage atau .DEB",
        description:
          "Unduh file `.AppImage` (Universal untuk semua distro) atau `.deb` untuk distro Debian/Ubuntu.",
      },
      {
        step: 2,
        title: "Berikan Izin Eksekusi (Untuk AppImage)",
        description:
          "Buka terminal di folder unduhan dan jalankan perintah izin eksekusi:",
        code: "chmod +x HLS-Converter-*.AppImage && ./HLS-Converter-*.AppImage",
      },
      {
        step: 3,
        title: "Instalasi Paket .DEB (Opsional untuk Ubuntu/Debian)",
        description:
          "Jika menggunakan berkas .deb, pasang menggunakan perintah APT / dpkg:",
        code: "sudo dpkg -i hls-converter_1.4.2_amd64.deb",
      },
      {
        step: 4,
        title: "Buka Software dari Menu Aplikasi",
        description:
          "HLS Converter sekarang tersedia di application launcher distro Linux Anda.",
      },
    ],
  },
};

export function InstallationGuide({ className = "" }: { className?: string }) {
  const { showToast } = useToast();
  const [activeOs, setActiveOs] = useState<"windows" | "mac" | "linux">("windows");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const guide = INSTALL_GUIDES[activeOs];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast("Perintah terminal berhasil disalin!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Panduan Instalasi Langkah Demi Langkah
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Ikuti petunjuk pemasangan mudah untuk sistem operasi Anda.
        </p>
      </div>

      {/* OS Tab Selector */}
      <div className="flex justify-center gap-2">
        {[
          { key: "windows", label: "Panduan Windows", icon: Monitor },
          { key: "mac", label: "Panduan macOS", icon: Laptop },
          { key: "linux", label: "Panduan Linux", icon: Terminal },
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

      {/* Step by Step Timeline Cards */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {guide.steps.map((s) => (
            <div
              key={s.step}
              className="relative p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-lg bg-brand-600/30 text-brand-400 border border-brand-500/40 flex items-center justify-center font-bold text-xs">
                    {s.step}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-slate-600" />
                </div>
                <h3 className="font-bold text-sm text-white">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
                {s.hint && (
                  <p className="text-[11px] text-amber-400/90 italic bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    💡 {s.hint}
                  </p>
                )}
              </div>

              {s.code && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Terminal Command:</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(s.code!)}
                      className="hover:text-white flex items-center gap-1 font-mono text-[9px]"
                    >
                      {copiedCode === s.code ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode === s.code ? "Disalin!" : "Salin"}</span>
                    </button>
                  </div>
                  <pre className="p-2 rounded bg-black/80 font-mono text-[10px] text-brand-300 overflow-x-auto">
                    {s.code}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

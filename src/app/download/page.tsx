"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Download,
  Monitor,
  Laptop,
  CheckCircle2,
  HardDrive,
  Cpu,
  Zap,
  ShieldCheck,
  FolderOpen,
  Sliders,
  ChevronRight,
  ArrowDownCircle,
  FileCode2,
  Layers,
  Terminal,
  Clock,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useToast } from "@/components/ui/Toast";
import { AppFeaturesCards } from "@/components/download/AppFeaturesCards";
import { SystemRequirements } from "@/components/download/SystemRequirements";
import { AppDownloadButton } from "@/components/download/AppDownloadButton";
import { InstallationGuide } from "@/components/download/InstallationGuide";
import { TranscodeSpecsSection } from "@/components/download/TranscodeSpecsSection";
import { SmartDownloadBanner } from "@/components/download/SmartDownloadBanner";

interface PlatformDownload {
  id: string;
  name: string;
  os: string;
  icon: string;
  version: string;
  fileSize: string;
  installerType: string;
  downloadUrl: string;
  isPrimary?: boolean;
  notes: string;
}

const PLATFORM_DOWNLOADS: PlatformDownload[] = [
  {
    id: "windows-x64",
    name: "Windows 64-bit",
    os: "Windows 10 / 11",
    icon: "windows",
    version: "v1.7.0 (Stabil)",
    fileSize: "178 MB",
    installerType: "Setup Installer (.exe)",
    downloadUrl: "/api/download/app?platform=windows&arch=x64",
    isPrimary: true,
    notes: "Sudah termasuk FFmpeg native binary + GPU acceleration, tinggal klik & jalankan.",
  },
  {
    id: "windows-portable",
    name: "Windows Portable",
    os: "Windows 7 / 10 / 11",
    icon: "windows",
    version: "v1.7.0 (Portable)",
    fileSize: "178 MB",
    installerType: "Stand-alone (.exe)",
    downloadUrl: "/api/download/app?platform=windows&arch=portable",
    notes: "Tanpa perlu instalasi, bisa langsung dijalankan dari Flashdisk / Harddisk eksternal.",
  },
  {
    id: "macos-arm64",
    name: "macOS Apple Silicon",
    os: "macOS 12+ (M1 / M2 / M3 / M4)",
    icon: "mac",
    version: "v1.7.0 (Universal)",
    fileSize: "165 MB",
    installerType: "Disk Image (.dmg)",
    downloadUrl: "/api/download/app?platform=mac&arch=arm64",
    notes: "Dioptimalkan khusus dengan hardware acceleration VideoToolbox Apple Silicon.",
  },
  {
    id: "macos-intel",
    name: "macOS Intel x64",
    os: "macOS 10.15+",
    icon: "mac",
    version: "v1.7.0",
    fileSize: "172 MB",
    installerType: "Disk Image (.dmg)",
    downloadUrl: "/api/download/app?platform=mac&arch=x64",
    notes: "Kompatibel dengan semua perangkat Mac berbasis prosesor Intel.",
  },
  {
    id: "linux-appimage",
    name: "Linux Universal",
    os: "Ubuntu, Debian, Fedora, Arch",
    icon: "linux",
    version: "v1.7.0",
    fileSize: "175 MB",
    installerType: "AppImage (.AppImage)",
    downloadUrl: "/api/download/app?platform=linux&arch=appimage",
    notes: "Jalankan di semua distro Linux modern tanpa repot mengurus dependencies.",
  },
  {
    id: "linux-deb",
    name: "Debian / Ubuntu Package",
    os: "Ubuntu 20.04+, Debian 11+",
    icon: "linux",
    version: "v1.7.0",
    fileSize: "160 MB",
    installerType: "DEB Package (.deb)",
    downloadUrl: "/api/download/app?platform=linux&arch=deb",
    notes: "Instalasi native via APT / dpkg manager.",
  },
];

const SOFTWARE_FEATURES = [
  {
    icon: HardDrive,
    title: "Simpan Langsung ke Folder PC",
    description:
      "Bebas memilih folder tujuan penyimpanan di direktori komputer manapun (C:, D:, External SSD). File hasil langsung tersedia di File Explorer Anda.",
  },
  {
    icon: Zap,
    title: "Engine FFmpeg Native + GPU Acceleration",
    description:
      "Tidak perlu install FFmpeg atau tools terminal tambahan. Engine rendering berkecepatan tinggi dengan NVENC/AMF/QSV sudah tertanam langsung.",
  },
  {
    icon: Sliders,
    title: "Resolusi Lengkap (144p - 4K UHD)",
    description:
      "Mendukung konversi resolusi fleksibel: 144p, 240p, 360p, 480p, 720p HD, 1080p Full HD, 1440p 2K, hingga 2160p 4K UHD.",
  },
  {
    icon: Layers,
    title: "Auto Upload ke Cloud Storage",
    description:
      "Terintegrasi langsung dengan Cloudflare R2, Amazon S3, DigitalOcean Spaces, dan Backblaze B2 dengan dual-engine paralel rendering & upload.",
  },
  {
    icon: ShieldCheck,
    title: "100% Privasi & Mode Offline",
    description:
      "Dapat bekerja secara offline di komputer Anda. Dalam mode Cloud Storage, file lokal otomatis dibersihkan setelah selesai di-upload.",
  },
];

export default function DownloadAppPage() {
  const { showToast } = useToast();
  const [selectedFilter, setSelectedFilter] = useState<"all" | "windows" | "mac" | "linux">("all");

  const handleDownload = (item: PlatformDownload) => {
    showToast(`Memulai unduhan software Cloud Converter Video untuk ${item.name} (${item.fileSize})...`);
    
    const link = document.createElement("a");
    link.href = item.downloadUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredDownloads = PLATFORM_DOWNLOADS.filter((item) => {
    if (selectedFilter === "all") return true;
    return item.id.startsWith(selectedFilter);
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#080b14] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Aplikasi Desktop — Versi v1.7.0 Telah Rilis</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Unduh Software{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-400 to-cyan-400">
                Cloud Converter Video
              </span>{" "}
              untuk PC & Laptop
            </h1>

            <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
              Software transcoding video multi-resolusi hingga 4K UHD, convert ke HLS/MP4/WebM, dengan GPU acceleration native dan auto upload ke Cloudflare R2 / S3.
            </p>

            {/* Quick stats banner */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Tanpa Batasan Ukuran File</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>FFmpeg Native + GPU Acceleration</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Upload Otomatis ke Cloud Storage</span>
              </div>
            </div>
          </div>

          {/* Smart Auto-Detected OS Download Banner */}
          <SmartDownloadBanner onSelectManualTab={setSelectedFilter} />

          {/* OS Platform Tabs */}
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-2">
              {[
                { key: "all", label: "Semua Sistem Operasi" },
                { key: "windows", label: "Windows" },
                { key: "mac", label: "macOS" },
                { key: "linux", label: "Linux" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedFilter(tab.key as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedFilter === tab.key
                      ? "bg-brand-600 text-white shadow-lg shadow-brand-500/25"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Download Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDownloads.map((item) => (
                <div
                  key={item.id}
                  className={`relative rounded-2xl border p-6 flex flex-col justify-between transition-all hover:scale-[1.02] ${
                    item.isPrimary
                      ? "bg-gradient-to-b from-brand-950/40 via-slate-900 to-slate-900 border-brand-500/50 shadow-xl shadow-brand-500/10"
                      : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {item.isPrimary && (
                    <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-brand-500 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
                      Paling Populer
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400">
                        {item.icon === "windows" ? (
                          <Monitor className="w-6 h-6" />
                        ) : item.icon === "mac" ? (
                          <Laptop className="w-6 h-6" />
                        ) : (
                          <Terminal className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-white">{item.name}</h3>
                        <p className="text-xs text-slate-400">{item.os}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tipe Berkas:</span>
                        <span className="font-medium text-slate-300">{item.installerType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Ukuran:</span>
                        <span className="font-mono text-emerald-400 font-semibold">{item.fileSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Versi:</span>
                        <span className="font-medium text-slate-300">{item.version}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">{item.notes}</p>
                  </div>

                  <div className="pt-6">
                    <AppDownloadButton
                      platformId={item.id}
                      platformName={item.name}
                      fileSize={item.fileSize}
                      downloadUrl={item.downloadUrl}
                      isPrimary={item.isPrimary}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transcode Specifications Breakdown */}
          <TranscodeSpecsSection className="pt-8 border-t border-slate-800" />

          {/* Software Advantages / Feature Cards */}
          <AppFeaturesCards className="pt-8 border-t border-slate-800" />

          {/* System Requirements Section */}
          <SystemRequirements className="pt-8 border-t border-slate-800" />

          {/* Step by Step Installation Guide */}
          <InstallationGuide className="pt-8 border-t border-slate-800" />
        </div>
      </main>
      <Footer />
    </>
  );
}

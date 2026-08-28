"use client";

import {
  HardDrive,
  Zap,
  Sliders,
  Layers,
  ShieldCheck,
  Cpu,
  FolderSync,
  Clock,
  Sparkles,
  CheckCircle,
  FileCheck2,
} from "lucide-react";

export interface AppFeatureCardItem {
  id: string;
  icon: typeof HardDrive;
  tag: string;
  title: string;
  description: string;
  highlight: string;
  stats: string;
}

export const APP_FEATURE_CARDS: AppFeatureCardItem[] = [
  {
    id: "embedded-ffmpeg",
    icon: Zap,
    tag: "Engine Bawaan",
    title: "FFmpeg 6.1 Bawaan (Zero Setup)",
    description:
      "Engine transcoding FFmpeg static binary sudah ter-bundle di dalam installer. Tidak perlu setting PATH atau terminal.",
    highlight: "Langsung bisa dipakai setelah instalasi",
    stats: "100% Standalone",
  },
  {
    id: "pc-folder-direct",
    icon: HardDrive,
    tag: "Penyimpanan Langsung",
    title: "Pilih Folder PC Langsung",
    description:
      "Tentukan direktori tujuan penyimpanan di drive C:, D:, atau USB Drive. Berkas .m3u8 dan .ts tersimpan rapi.",
    highlight: "Terintegrasi dengan Windows File Explorer & Finder",
    stats: "Bebas Partisi",
  },
  {
    id: "multi-res",
    icon: Sliders,
    tag: "Format Fleksibel",
    title: "6 Pilihan Format Resolusi",
    description:
      "Dukungan resolusi lengkap: 144p, 240p, 360p, 480p, 720p HD, hingga 1080p Full HD dengan bitrate presets.",
    highlight: "Mendukung single & multi-bitrate ladder (ABR)",
    stats: "144p - 1080p",
  },
  {
    id: "segment-control",
    icon: Layers,
    tag: "Segmentasi Presisi",
    title: "Durasi Potongan Kepingan",
    description:
      "Pilihan durasi pemotongan 5, 10, atau 15 detik per keping file .ts sesuai kebutuhan latensi dan bandwidth web.",
    highlight: "Menghasilkan playlist master.m3u8 standar VOD",
    stats: "5s / 10s / 15s",
  },
  {
    id: "hardware-accel",
    icon: Cpu,
    tag: "Performa Maksimal",
    title: "Akselerasi GPU Hardware",
    description:
      "Memanfaatkan NVIDIA NVENC, Intel QuickSync, dan Apple VideoToolbox untuk rendering video hingga 10x lebih cepat.",
    highlight: "Hemat CPU dan render resolusi tinggi tanpa lag",
    stats: "Hingga 10x Cepat",
  },
  {
    id: "offline-privacy",
    icon: ShieldCheck,
    tag: "Privasi 100%",
    title: "100% Offline & Tanpa Kuota",
    description:
      "Tidak ada data video yang diunggah ke internet. Seluruh proses transcoding berjalan lokal di hardware Anda.",
    highlight: "Aman untuk video sensitif & tanpa batas ukuran",
    stats: "0 MB Kuota",
  },
];

interface AppFeaturesCardsProps {
  className?: string;
}

export function AppFeaturesCards({ className = "" }: AppFeaturesCardsProps) {
  return (
    <section className={`space-y-8 ${className}`}>
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fitur Lengkap Software Desktop</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Fitur Unggulan Software HLS Converter
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Solusi rendering mandiri berkecepatan tinggi tanpa kompromi pada kualitas video.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {APP_FEATURE_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="group relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between transition-all hover:border-brand-500/50 hover:bg-slate-900/90 shadow-xl"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700">
                    {card.stats}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                    {card.tag}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{card.highlight}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

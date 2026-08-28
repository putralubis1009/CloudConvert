"use client";

import { useState } from "react";
import {
  Layers,
  Sliders,
  Clock,
  Video,
  CheckCircle2,
  Cpu,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Zap,
} from "lucide-react";

export function TranscodeSpecsSection({ className = "" }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<"pipeline" | "resolution" | "segment">("pipeline");

  return (
    <section className={`space-y-8 ${className}`}>
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Layers className="w-3.5 h-3.5" />
          <span>Arsitektur & Spesifikasi Transcoding</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Fitur Inti: Transcoding MP4, Multi-Resolusi & Segmentasi
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Penjelasan mendalam tentang bagaimana engine mengonversi video MP4 ke HLS standar industri secara otomatis.
        </p>
      </div>

      {/* Feature Focus Navigation */}
      <div className="flex flex-wrap justify-center gap-2">
        {[
          { key: "pipeline", label: "1. Pipeline MP4 ke HLS (M3U8 & TS)", icon: Video },
          { key: "resolution", label: "2. 6 Format Resolusi (144p - 1080p)", icon: Sliders },
          { key: "segment", label: "3. Parameter Durasi Segmen (5s, 10s, 15s)", icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
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

      {/* Tab 1: Pipeline MP4 ke HLS */}
      {activeTab === "pipeline" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="text-brand-400 font-bold uppercase text-[10px]">Langkah 1</span>
              <h3 className="font-bold text-sm text-white">Demuxing MP4 Bitstream</h3>
              <p className="text-slate-400 leading-relaxed">
                Membaca track H.264/AVC dan AAC dari kontainer MP4 sumber secara efisien tanpa kehilangan sinkronisasi audio-video.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="text-brand-400 font-bold uppercase text-[10px]">Langkah 2</span>
              <h3 className="font-bold text-sm text-white">Segmentasi MPEG-TS (.ts)</h3>
              <p className="text-slate-400 leading-relaxed">
                Memotong aliran bitstream menjadi potongan file `.ts` kecil dengan header packet sync 0x47 dan keyframe (I-Frame) pada setiap awal chunk.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="text-brand-400 font-bold uppercase text-[10px]">Langkah 3</span>
              <h3 className="font-bold text-sm text-white">Pembuatan Manifest M3U8</h3>
              <p className="text-slate-400 leading-relaxed">
                Menghasilkan berkas playlist `.m3u8` standar Apple HLS VOD lengkap dengan tag `#EXTINF` durasi pecahan presisi tinggi.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 6 Format Resolusi */}
      {activeTab === "resolution" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-200">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-xs">
            {[
              { res: "144p", dim: "256x144", bit: "250 kbps", use: "Hemat Kuota Ekstrem" },
              { res: "240p", dim: "426x240", bit: "500 kbps", use: "Koneksi 2G / 3G Lemah" },
              { res: "360p", dim: "640x360", bit: "800 kbps", use: "Mobile Data Standar" },
              { res: "480p", dim: "854x480", bit: "1.4 Mbps", use: "SD Kualitas Bersih" },
              { res: "720p", dim: "1280x720", bit: "2.8 Mbps", use: "HD Berkualitas Tinggi" },
              { res: "1080p", dim: "1920x1080", bit: "5.0 Mbps", use: "FHD Ultra Tajam" },
            ].map((item) => (
              <div key={item.res} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <span className="font-extrabold text-brand-400 text-sm">{item.res}</span>
                <span className="text-[10px] text-slate-300 block font-mono">{item.dim}</span>
                <span className="text-[10px] text-emerald-400 block font-semibold">~{item.bit}</span>
                <p className="text-[9px] text-slate-500 pt-1">{item.use}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 italic">
            💡 Software juga mendukung pembuatan **Multi-Bitrate Ladder (ABR)** sehingga player video dapat otomatis berpindah resolusi sesuai kecepatan internet penonton.
          </p>
        </div>
      )}

      {/* Tab 3: Durasi Segmen */}
      {activeTab === "segment" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">5 Detik / Keping</span>
                <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 text-[10px] font-bold">Fast Seeking</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Sangat responsif untuk scrubbing video dan buffering awal instan. Sangat cocok untuk video berdurasi pendek hingga menengah.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-950/80 border border-brand-500/40 bg-brand-950/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">10 Detik (Standar Apple)</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Direkomendasikan</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Nilai standar rekomendasi Apple HLS. Keseimbangan terbaik antara ukuran file manifest, jumlah request HTTP, dan efisiensi caching CDN.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">15 Detik / Keping</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">Low Overhead</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Meminimalkan jumlah berkas segmen `.ts` untuk film atau video durasi panjang (1-3 jam) sehingga beban web server tetap ringan.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

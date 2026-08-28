"use client";

import Link from "next/link";
import {
  CloudUpload,
  Download,
  Zap,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Globe,
  Play,
  CheckCircle2,
} from "lucide-react";

const STATS = [
  { value: "4K UHD", label: "Resolusi Tertinggi" },
  { value: "8x", label: "Parallel Upload" },
  { value: "5+", label: "Cloud Provider" },
  { value: "2x", label: "Mesin Paralel" },
];

const FEATURE_PILLS = [
  { icon: Cpu, label: "GPU Acceleration", color: "from-violet-600/20 to-violet-500/10 border-violet-500/30 text-violet-300" },
  { icon: CloudUpload, label: "Auto Cloud Upload", color: "from-cyan-600/20 to-cyan-500/10 border-cyan-500/30 text-cyan-300" },
  { icon: Layers, label: "Multi-Resolusi ABR", color: "from-indigo-600/20 to-indigo-500/10 border-indigo-500/30 text-indigo-300" },
  { icon: Globe, label: "R2 / S3 / Spaces", color: "from-emerald-600/20 to-emerald-500/10 border-emerald-500/30 text-emerald-300" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[92vh] flex items-center bg-[#080b14]">
      {/* Animated floating orbs */}
      <div className="absolute top-[-10%] left-[15%] w-[500px] h-[500px] rounded-full bg-brand-600/10 blur-[120px] orb-float pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[10%] w-[400px] h-[400px] rounded-full bg-cyan-500/8 blur-[100px] orb-float pointer-events-none" style={{ animationDelay: "-4s" }} />
      <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full bg-purple-600/8 blur-[80px] orb-float pointer-events-none" style={{ animationDelay: "-8s" }} />

      {/* Dot grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top gradient fade */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#080b14] to-transparent pointer-events-none" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="text-center space-y-8 max-w-5xl mx-auto">

          {/* Live Badge */}
          <div className="reveal inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/80 border border-white/10 text-xs font-semibold shadow-xl backdrop-blur-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span className="bg-gradient-to-r from-brand-300 to-cyan-300 bg-clip-text text-transparent font-bold">
              Cloud Converter Video v1.7.0
            </span>
            <span className="w-px h-3 bg-slate-700" />
            <span className="text-slate-400">Desktop App · Dual-Engine Pipeline</span>
          </div>

          {/* Main Title */}
          <div className="reveal reveal-delay-1 space-y-5">
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight text-white leading-[1.05]">
              Render Video &{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent text-glow-brand">
                  Upload ke Cloud
                </span>
                {/* Underline glow */}
                <span className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-brand-500 via-purple-400 to-cyan-400 opacity-60 blur-[1px]" />
              </span>
              {" "}Otomatis
            </h1>
            <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Engine FFmpeg native dengan akselerasi GPU, render hingga{" "}
              <span className="text-white font-semibold">4K UHD multi-resolusi</span>, dan pipeline paralel yang mengupload ke{" "}
              <span className="text-cyan-400 font-semibold">Cloudflare R2 / Amazon S3</span>{" "}
              sambil render terus berjalan.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="reveal reveal-delay-2 flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/download"
              id="hero-btn-download"
              className="relative inline-flex items-center gap-3 px-8 py-4 rounded-xl text-white font-bold text-sm sm:text-base overflow-hidden group shadow-2xl shadow-brand-500/20"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 bg-size-200% animate-gradient-shift" />
              <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 ease-in-out" />
              <Download className="relative w-5 h-5" />
              <span className="relative">Unduh Software Desktop</span>
              <ArrowRight className="relative w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#konversi"
              id="hero-btn-convert"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm sm:text-base border border-white/10 hover:border-white/20 backdrop-blur-sm shadow-xl transition-all duration-200"
            >
              <Play className="w-4 h-4 text-cyan-400" />
              <span>Coba Online Gratis</span>
            </a>
          </div>

          {/* Stats Row */}
          <div className="reveal reveal-delay-3 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="group p-4 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-brand-500/30 hover:bg-slate-900/80 transition-all duration-300 text-center cursor-default"
              >
                <div className="text-2xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Feature Pills */}
          <div className="reveal reveal-delay-4 flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {FEATURE_PILLS.map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r border text-xs font-semibold backdrop-blur-sm ${color}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </div>
            ))}
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-900/80 border border-white/5 text-xs font-semibold text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Gratis & No Watermark
            </div>
          </div>

        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
    </section>
  );
}


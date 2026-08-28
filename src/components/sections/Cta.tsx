"use client";

import Link from "next/link";
import { Download, Cpu, HardDrive, CloudUpload, CheckCircle, ArrowRight, Star } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const BENEFITS = [
  {
    icon: HardDrive,
    color: "text-brand-400",
    title: "Simpan ke Folder PC",
    desc: "Pilih folder output di PC. Render multi-resolusi tersimpan rapi dalam sub-folder.",
  },
  {
    icon: Cpu,
    color: "text-violet-400",
    title: "Akselerasi GPU Native",
    desc: "NVENC, AMF, QSV — render 4K hingga 10x lebih cepat dari rendering biasa.",
  },
  {
    icon: CloudUpload,
    color: "text-cyan-400",
    title: "Upload Otomatis ke Cloud",
    desc: "Selesai render → otomatis upload ke R2/S3. 8 stream paralel, cepat & efisien.",
  },
];

export function Cta() {
  const { showToast } = useToast();

  return (
    <section id="desktop-app" className="py-24 bg-[#080b14] relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-brand-600/15 via-purple-500/10 to-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA Card */}
        <div className="relative rounded-3xl overflow-hidden border border-white/8">
          {/* Animated gradient card background */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, #0d1117 0%, #0f0c24 30%, #071018 60%, #0a1520 100%)",
            }}
          />
          {/* Moving gradient blobs */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-600/20 rounded-full blur-[80px] orb-float pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-600/15 rounded-full blur-[80px] orb-float pointer-events-none" style={{ animationDelay: "-5s" }} />
          {/* Dot grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          />

          <div className="relative z-10 p-8 sm:p-14 text-white">
            <div className="max-w-3xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-slate-300 mb-8">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                Software Desktop Gratis
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight mb-5">
                Render Video Besar?{" "}
                <span className="bg-gradient-to-r from-brand-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
                  Tanpa Batas, Tanpa Antre
                </span>
              </h2>

              <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
                Unduh <span className="font-semibold text-white">Cloud Converter Video</span> untuk desktop Windows. Engine FFmpeg native bawaan, akselerasi GPU, batch processing hingga 5 video paralel, dan upload otomatis ke cloud storage.
              </p>

              {/* Benefits grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
                {BENEFITS.map((b) => (
                  <div key={b.title} className="group p-5 rounded-2xl bg-white/3 border border-white/6 hover:bg-white/5 hover:border-white/10 transition-all duration-300">
                    <b.icon className={`w-6 h-6 ${b.color} mb-3`} />
                    <h4 className="font-bold text-sm text-white mb-1">{b.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{b.desc}</p>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap justify-center items-center gap-4">
                <Link
                  href="/download"
                  id="btn-download-win"
                  className="relative inline-flex items-center gap-2.5 px-7 py-4 rounded-xl text-white font-bold text-sm overflow-hidden group shadow-2xl shadow-brand-500/25"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-brand-600 to-indigo-600" />
                  <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700" />
                  <Download className="relative w-4 h-4" />
                  <span className="relative">Unduh untuk Windows</span>
                  <ArrowRight className="relative w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/download"
                  id="btn-download-other"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm border border-white/10 hover:border-white/20 transition-all duration-200"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Lihat Semua Platform
                </Link>
              </div>

              <p className="text-xs text-slate-600 mt-6">
                v1.7.0 · Gratis & Open Source · 64-bit · No Watermark
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

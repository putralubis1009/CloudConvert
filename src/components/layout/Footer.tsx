import Link from "next/link";
import { CloudUpload, ShieldCheck, Zap } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#060810] border-t border-white/5 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-brand-500 to-cyan-400 blur-md opacity-40" />
                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg">
                  <CloudUpload className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[15px] font-extrabold tracking-tight bg-gradient-to-r from-white via-brand-200 to-cyan-300 bg-clip-text text-transparent">
                  Cloud Converter Video
                </span>
                <span className="text-[10px] tracking-widest font-bold uppercase text-slate-600 -mt-0.5">
                  Video · HLS · Cloud
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Platform & Software Transcoding Video HLS modern bertenaga FFmpeg Native dengan akselerasi GPU dan integrasi multi-cloud storage otomatis.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5">
              Navigasi
            </p>
            <ul className="space-y-3 text-sm text-slate-500">
              {[
                { href: "/#konversi", label: "Konversi Online" },
                { href: "/render", label: "Render Studio" },
                { href: "/download", label: "Unduh Software Desktop" },
                { href: "/guide", label: "Panduan & Pemilihan Folder" },
                { href: "/history", label: "Riwayat Konversi" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-brand-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Info */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5">
              Spesifikasi Sistem
            </p>
            <ul className="space-y-3 text-sm text-slate-500">
              <li>Format: HLS (M3U8 / TS) · MP4 · WebM · MP3</li>
              <li>Resolusi: 144p – 4K UHD (2160p)</li>
              <li>Segmen: 5s / 10s / 15s VOD Adaptive</li>
              <li>Cloud: Cloudflare R2 · AWS S3 · Spaces · B2</li>
              <li>Engine: FFmpeg Native + GPU Accelerated</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {currentYear} Cloud Converter Video. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px]">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Privacy-First Architecture</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-cyan-400" /> High-Performance GPU Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

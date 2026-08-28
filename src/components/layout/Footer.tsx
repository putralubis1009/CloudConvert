import Link from "next/link";
import { CloudUpload, Heart, Github } from "lucide-react";

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
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Render video multi-resolusi hingga 4K, convert ke HLS/MP4/WebM, dan upload otomatis ke Cloudflare R2, Amazon S3, dan cloud storage lainnya.
            </p>
            <div className="flex items-center gap-4 text-slate-600">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-400 transition"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Col 2: Nav */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5">
              Navigasi
            </p>
            <ul className="space-y-3 text-sm text-slate-600">
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
              Spesifikasi
            </p>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>Format: HLS · MP4 · WebM · MP3</li>
              <li>Resolusi: 144p – 4K UHD</li>
              <li>Segmen: 5 / 10 / 15 detik</li>
              <li>Upload: R2 · S3 · Spaces · B2</li>
              <li>Engine: FFmpeg Native GPU</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-700 gap-4">
          <p>&copy; {currentYear} Cloud Converter Video. Dibuat untuk semua kreator & developer.</p>
          <p className="flex items-center gap-1.5">
            Dibuat dengan <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> penuh dedikasi.
          </p>
        </div>
      </div>
    </footer>
  );
}


import Link from "next/link";
import { CloudUpload, Download, Zap } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { MobileMenu } from "./MobileMenu";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <nav className="glass-nav bg-slate-950/75 border-b border-white/5 transition-colors">
        {/* Subtle animated gradient line at top */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              {/* Logo Icon with animated glow ring */}
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-brand-500 to-cloud-400 blur-md opacity-50 group-hover:opacity-80 transition-opacity duration-300" />
                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-cloud-400 flex items-center justify-center text-white shadow-lg">
                  <CloudUpload className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[15px] font-extrabold tracking-tight bg-gradient-to-r from-white via-brand-200 to-cloud-300 bg-clip-text text-transparent">
                  Cloud Converter
                </span>
                <span className="text-[10px] tracking-widest font-bold uppercase text-slate-500 -mt-0.5">
                  Video · HLS · Cloud
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              {[
                { href: "/#konversi", label: "Konversi" },
                { href: "/render", label: "Render Studio", badge: true },
                { href: "/#features", label: "Fitur" },
                { href: "/download", label: "Unduh App" },
                { href: "/guide", label: "Panduan" },
                { href: "/history", label: "Riwayat" },
                { href: "/#faq", label: "FAQ" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200 group flex items-center gap-1.5"
                >
                  {item.badge && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cloud-400 animate-pulse" />
                  )}
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-brand-500 to-cloud-400 group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-3">
              <ThemeToggle />
              <Link
                href="/download"
                id="nav-cta-download"
                className="relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white overflow-hidden group"
              >
                {/* Gradient background */}
                <span className="absolute inset-0 bg-gradient-to-r from-brand-600 to-cloud-500 opacity-90 group-hover:opacity-100 transition-opacity" />
                {/* Shimmer sweep */}
                <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-in-out" />
                <Download className="relative w-4 h-4" />
                <span className="relative">Unduh App</span>
              </Link>
            </div>

            {/* Mobile Actions */}
            <MobileMenu />
          </div>
        </div>
      </nav>
    </header>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Download } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [
  { href: "/#konversi", label: "Konversi Online" },
  { href: "/render", label: "Render Studio ⚡", highlight: true },
  { href: "/#features", label: "Fitur" },
  { href: "/download", label: "Unduh App" },
  { href: "/guide", label: "Panduan & Dokumentasi" },
  { href: "/history", label: "Riwayat Render" },
  { href: "/#faq", label: "FAQ" },
];

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 md:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Buka menu navigasi"
          aria-expanded={isOpen}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 z-50 border-t border-white/5 glass-nav bg-slate-950/95 px-4 pt-4 pb-6 space-y-1 shadow-2xl shadow-black/50">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                link.highlight
                  ? "text-brand-300 bg-brand-500/10 border border-brand-500/20 font-semibold"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3">
            <Link
              href="/download"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-brand-500/20 transition-all"
            >
              <Download className="w-4 h-4" />
              Unduh Cloud Converter Video
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

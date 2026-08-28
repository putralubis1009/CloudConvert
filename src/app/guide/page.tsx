"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  FolderOpen,
  Monitor,
  Laptop,
  Terminal,
  CheckCircle2,
  HardDrive,
  Sliders,
  Layers,
  Zap,
  Download,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Play,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useToast } from "@/components/ui/Toast";

export default function InstallationGuidePage() {
  const { showToast } = useToast();
  const [activeOs, setActiveOs] = useState<"windows" | "mac" | "linux">("windows");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    showToast(`${label} berhasil disalin ke clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold">
              <BookOpen className="w-4 h-4" />
              <span>Dokumentasi & Panduan Resmi</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Panduan Lengkap Instalasi & Pemilihan Folder PC
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Pelajari cara memasang software HLS Converter, memilih folder penyimpanan di harddisk komputer Anda,
              serta mengekspor video streaming berkualitas tinggi.
            </p>
          </div>

          {/* Quick Nav OS Tabs */}
          <div className="flex justify-center gap-2">
            {[
              { id: "windows", label: "Windows 10 / 11", icon: Monitor },
              { id: "mac", label: "macOS (Apple Silicon & Intel)", icon: Laptop },
              { id: "linux", label: "Linux (All Distros)", icon: Terminal },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeOs === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveOs(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
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

          {/* Section 1: Installation Steps */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6 shadow-xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <Download className="w-5 h-5 text-brand-400" />
              <span>Bagian 1: Langkah Instalasi Software di {activeOs === "windows" ? "Windows" : activeOs === "mac" ? "macOS" : "Linux"}</span>
            </h2>

            <div className="space-y-4">
              {activeOs === "windows" && (
                <>
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <h3 className="font-bold text-sm text-brand-300">1. Unduh Installer Windows</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Kunjungi halaman <Link href="/download" className="text-brand-400 underline font-semibold">Unduh Aplikasi</Link> dan pilih tombol <strong>Unduh Windows 64-bit (.exe)</strong> atau versi <strong>Portable (.zip)</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <h3 className="font-bold text-sm text-brand-300">2. Jalankan File Installer</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Klik dua kali pada file <code className="bg-slate-900 px-1.5 py-0.5 rounded text-brand-300">HLS-Converter-Setup-x64.exe</code>. Jika muncul notifikasi Windows SmartScreen, klik <strong>&quot;More info&quot;</strong> $\rightarrow$ <strong>&quot;Run anyway&quot;</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <h3 className="font-bold text-sm text-brand-300">3. Siap Digunakan Tanpa Dependencies Tambahan</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Engine FFmpeg 6.1 static binary sudah ter-bundle di dalam instalasi sehingga Anda tidak perlu repot melakukan instalasi FFmpeg terpisah atau mengatur Environment PATH.
                    </p>
                  </div>
                </>
              )}

              {activeOs === "mac" && (
                <>
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <h3 className="font-bold text-sm text-brand-300">1. Unduh Berkas .DMG</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Pilih varian <strong>Apple Silicon</strong> jika Anda menggunakan chip M1/M2/M3/M4, atau pilih <strong>macOS Intel</strong> untuk prosesor Intel.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <h3 className="font-bold text-sm text-brand-300">2. Drag ke Applications</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Buka berkas `.dmg` yang diunduh, lalu seret ikon <strong>HLS Converter</strong> ke folder <strong>Applications</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <h3 className="font-bold text-sm text-brand-300">3. Izin Keamanan Gatekeeper (Sekali Saja)</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Saat pertama kali membuka aplikasi, jika macOS memblokir, buka <strong>System Settings $\rightarrow$ Privacy & Security</strong>, scroll ke bawah dan klik <strong>&quot;Open Anyway&quot;</strong>.
                    </p>
                  </div>
                </>
              )}

              {activeOs === "linux" && (
                <>
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <h3 className="font-bold text-sm text-brand-300">1. Unduh AppImage atau Paket .DEB</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Unduh file `.AppImage` untuk kompatibilitas universal di semua distro Linux, atau `.deb` untuk Ubuntu/Debian.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <h3 className="font-bold text-sm text-brand-300">2. Jalankan Perintah Izin Terminal</h3>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Eksekusi di terminal:</span>
                      <button
                        type="button"
                        onClick={() => handleCopy("chmod +x HLS-Converter-*.AppImage && ./HLS-Converter-*.AppImage", "Command")}
                        className="text-brand-400 hover:text-white flex items-center gap-1 font-mono text-[10px]"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Salin</span>
                      </button>
                    </div>
                    <pre className="p-2.5 rounded-lg bg-black text-brand-300 font-mono text-xs overflow-x-auto">
                      chmod +x HLS-Converter-*.AppImage && ./HLS-Converter-*.AppImage
                    </pre>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 2: Folder Selection Guide */}
          <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-b from-brand-950/20 to-slate-900/80 p-6 sm:p-8 space-y-6 shadow-xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <FolderOpen className="w-5 h-5 text-amber-400" />
              <span>Bagian 2: Panduan Memilih Folder Penyimpanan Output di PC</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Salah satu keunggulan utama software ini adalah kemampuannya menulis hasil transcoding <strong>langsung ke folder manapun di PC Anda</strong> tanpa batasan sistem browser:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <h3 className="font-bold text-slate-200 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-brand-400" />
                  <span>1. Tombol &quot;Pilih Folder PC&quot;</span>
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Klik tombol <strong>&quot;Pilih Folder PC&quot;</strong> untuk membuka dialog direktori bawaan Windows Explorer atau macOS Finder. Anda bebas memilih folder di partisi C:, D:, atau Harddisk Eksternal.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <h3 className="font-bold text-slate-200 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span>2. Opsi Auto Subfolder</span>
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Aktifkan opsi <em>&quot;Buat subfolder otomatis berdasarkan nama video&quot;</em> agar file <code className="text-brand-300">.m3u8</code> dan puluhan file <code className="text-brand-300">.ts</code> tersusun rapi dalam folder tersendiri.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <h3 className="font-bold text-slate-200 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>3. Langsung Tersedia di PC</span>
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Begitu proses render selesai 100%, seluruh file sudah berada di lokasi penyimpanan Anda tanpa perlu men-download file ZIP tambahan dari browser.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <h3 className="font-bold text-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>4. Tombol &quot;Buka Folder PC&quot;</span>
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Setelah proses render selesai, klik tombol <strong>&quot;Buka Folder PC&quot;</strong> untuk langsung membuka folder tujuan tersebut di Windows File Explorer.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Web Player Integration Guide */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6 shadow-xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <Play className="w-5 h-5 text-emerald-400" />
              <span>Bagian 3: Cara Memasang Output HLS di Website Anda</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Setelah mendapatkan file <code className="text-brand-300">master.m3u8</code> dan folder segmen <code className="text-brand-300">.ts</code>, unggah ke hosting/CDN Anda dan gunakan kode pemutar HTML5 berikut:
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Kode Integrasi Hls.js (HTML & JavaScript):</span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
`<video id="video" controls style="width: 100%; max-width: 800px; border-radius: 12px;"></video>
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
<script>
  var video = document.getElementById('video');
  var videoSrc = 'master.m3u8'; // Ubah sesuai URL CDN Anda
  if (Hls.isSupported()) {
    var hls = new Hls();
    hls.loadSource(videoSrc);
    hls.attachMedia(video);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = videoSrc; // Safari native HLS
  }
</script>`,
                      "Kode HTML & Hls.js"
                    )
                  }
                  className="text-brand-400 hover:text-white flex items-center gap-1 font-mono text-[11px]"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Kode</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-black font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed border border-slate-800">
{`<video id="video" controls style="width: 100%; max-width: 800px; border-radius: 12px;"></video>
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
<script>
  var video = document.getElementById('video');
  var videoSrc = 'master.m3u8'; // Ubah sesuai URL CDN Anda
  if (Hls.isSupported()) {
    var hls = new Hls();
    hls.loadSource(videoSrc);
    hls.attachMedia(video);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = videoSrc; // Safari native HLS
  }
</script>`}
              </pre>
            </div>
          </div>

          {/* Bottom Action CTA */}
          <div className="text-center pt-4">
            <Link
              href="/download"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-brand-500/25 transition-all duration-200"
            >
              <Download className="w-5 h-5" />
              <span>Buka Halaman Unduh Software Desktop</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

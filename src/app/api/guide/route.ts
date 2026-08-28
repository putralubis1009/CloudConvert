import { NextRequest, NextResponse } from "next/server";

export interface GuideStep {
  step: number;
  title: string;
  description: string;
  hint?: string;
  command?: string;
}

export interface OsGuide {
  os: "windows" | "mac" | "linux";
  osName: string;
  architecture: string;
  steps: GuideStep[];
  troubleshooting: { issue: string; resolution: string }[];
}

const GUIDES_DATABASE: Record<string, OsGuide> = {
  windows: {
    os: "windows",
    osName: "Windows 10 / 11",
    architecture: "x64 64-bit",
    steps: [
      {
        step: 1,
        title: "Unduh Installer Windows (.exe atau Portable .zip)",
        description: "Pilih tombol unduh Windows 64-bit. Simpan di folder Downloads komputer Anda.",
      },
      {
        step: 2,
        title: "Jalankan Setup Installer",
        description: "Klik dua kali file HLS-Converter-Setup-x64.exe. Jika muncul Windows SmartScreen, klik 'More info' lalu 'Run anyway'.",
        hint: "Aplikasi ini aman dan ditandatangani secara digital.",
      },
      {
        step: 3,
        title: "Pilih Folder Output di PC",
        description: "Tentukan folder tujuan penyimpanan di direktori komputer Anda (C:, D:, atau Harddisk Eksternal).",
      },
      {
        step: 4,
        title: "Atur Format & Mulai Transcode",
        description: "Pilih resolusi (144p - 1080p) dan durasi segmen (5s, 10s, 15s), lalu klik Mulai Render.",
      },
    ],
    troubleshooting: [
      {
        issue: "Windows SmartScreen memblokir aplikasi",
        resolution: "Klik 'More Info' ('Informasi selengkapnya') kemudian pilih 'Run Anyway' ('Tetap jalankan').",
      },
      {
        issue: "Folder tujuan tidak bisa ditulis",
        resolution: "Pastikan folder tujuan memiliki izin tulis dan ruang penyimpanan harddisk mencukupi minimal 5 GB.",
      },
    ],
  },
  mac: {
    os: "mac",
    osName: "macOS (Apple Silicon & Intel)",
    architecture: "ARM64 & x86_64",
    steps: [
      {
        step: 1,
        title: "Unduh Berkas Apple Disk Image (.dmg)",
        description: "Pilih varian Apple Silicon (M1/M2/M3/M4) atau Intel sesuai tipe Mac Anda.",
      },
      {
        step: 2,
        title: "Seret ke Folder Applications",
        description: "Buka file .dmg yang telah diunduh, lalu drag ikon HLS Converter ke direktori /Applications.",
      },
      {
        step: 3,
        title: "Izin Keamanan Gatekeeper (Pertama Kali)",
        description: "Jika muncul notifikasi keamanan macOS, buka System Settings > Privacy & Security, lalu klik 'Open Anyway'.",
      },
      {
        step: 4,
        title: "Mulai Rendering dengan Akselerasi Apple VideoToolbox",
        description: "Pilih file MP4, tentukan folder tujuan di Finder, lalu mulai proses render.",
      },
    ],
    troubleshooting: [
      {
        issue: "Aplikasi tidak bisa dibuka karena developer tidak teridentifikasi",
        resolution: "Buka System Settings > Privacy & Security > klik 'Open Anyway' di bagian bawah.",
      },
    ],
  },
  linux: {
    os: "linux",
    osName: "Linux (Universal AppImage / Debian .deb)",
    architecture: "x86_64",
    steps: [
      {
        step: 1,
        title: "Unduh Berkas .AppImage atau .deb",
        description: "Unduh file AppImage untuk semua distro atau .deb untuk Ubuntu/Debian.",
      },
      {
        step: 2,
        title: "Berikan Izin Eksekusi di Terminal",
        description: "Buka terminal di lokasi berkas dan jalankan perintah izin eksekusi.",
        command: "chmod +x HLS-Converter-*.AppImage && ./HLS-Converter-*.AppImage",
      },
      {
        step: 3,
        title: "Pilih Folder Target PC",
        description: "Pilih direktori penyimpanan di partisi home atau mount point harddisk eksternal.",
      },
    ],
    troubleshooting: [
      {
        issue: "AppImage memerlukan libfuse2",
        resolution: "Jalankan 'sudo apt install libfuse2' pada Ubuntu 22.04+ atau distro turunan Debian.",
      },
    ],
  },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const os = searchParams.get("os")?.toLowerCase();

  if (os && GUIDES_DATABASE[os]) {
    return NextResponse.json({
      success: true,
      guide: GUIDES_DATABASE[os],
    });
  }

  return NextResponse.json({
    success: true,
    title: "Panduan Lengkap Software HLS Converter & Transcoding MP4",
    version: "1.4.2",
    guides: GUIDES_DATABASE,
    featuresGuide: {
      directPcFolder: {
        title: "Penyimpanan Langsung ke Folder PC",
        description:
          "Hasil render langsung ditulis ke partisi C:, D:, atau USB Drive lokal tanpa perlu download ulang via browser.",
      },
      resolutions: {
        title: "6 Pilihan Resolusi Transcoding",
        items: [
          { label: "144p", dimension: "256x144", bitrate: "250 kbps" },
          { label: "240p", dimension: "426x240", bitrate: "500 kbps" },
          { label: "360p", dimension: "640x360", bitrate: "800 kbps" },
          { label: "480p", dimension: "854x480", bitrate: "1.4 Mbps" },
          { label: "720p", dimension: "1280x720", bitrate: "2.8 Mbps" },
          { label: "1080p", dimension: "1920x1080", bitrate: "5.0 Mbps" },
        ],
      },
      segments: {
        title: "Pilihan Durasi Kepingan Segmen HLS",
        items: [
          { duration: 5, label: "5 Detik / Keping", recommendation: "Fast Seeking & Ultra Low Latency" },
          { duration: 10, label: "10 Detik / Keping", recommendation: "Standar Industri Apple HLS" },
          { duration: 15, label: "15 Detik / Keping", recommendation: "Low Overhead untuk Film Panjang" },
        ],
      },
    },
    webPlayerIntegration: {
      player: "Hls.js",
      snippet: `<video id="video" controls></video>\n<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>\n<script>\n  var video = document.getElementById('video');\n  if (Hls.isSupported()) {\n    var hls = new Hls();\n    hls.loadSource('master.m3u8');\n    hls.attachMedia(video);\n  }\n</script>`,
    },
  });
}

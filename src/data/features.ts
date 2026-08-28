import { FeatureItem } from "@/types";

export const featuresData: FeatureItem[] = [
  {
    id: "browser-convert",
    iconName: "Zap",
    title: "Render Langsung di Browser",
    description:
      "Memproses video menggunakan teknologi WebAssembly. Cepat, ringan, dan tidak menghabiskan kuota upload server.",
  },
  {
    id: "multi-res",
    iconName: "Palette",
    title: "Multi-Resolusi 144p - 1080p",
    description:
      "Dukung berbagai resolusi output dari 144p hemat data hingga 1080p Full HD jernih sesuai kebutuhan streaming Anda.",
  },
  {
    id: "custom-segments",
    iconName: "Code2",
    title: "Atur Durasi Segmen (TS)",
    description:
      "Pilih potongan segmen 5, 10, atau 15 detik per file .ts untuk streaming HLS yang mulus dan adaptif.",
  },
  {
    id: "privacy",
    iconName: "Search",
    title: "100% Privat & Aman",
    description:
      "Video Anda tetap berada di perangkat lokal Anda dan tidak pernah dikirim atau disimpan ke server mana pun.",
  },
  {
    id: "zip-output",
    iconName: "Smartphone",
    title: "Ekspor File ZIP Lengkap",
    description:
      "Hasil konversi mencakup file playlist master .m3u8 serta seluruh berkas segmen .ts yang siap dideploy.",
  },
  {
    id: "desktop-app",
    iconName: "MoonStar",
    title: "Aplikasi Desktop Tersedia",
    description:
      "Butuh konversi batch ukuran besar tanpa batas browser? Unduh aplikasi desktop mandiri kami untuk PC Anda.",
  },
];

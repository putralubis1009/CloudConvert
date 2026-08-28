import { FaqItem } from "@/types";

export const faqData: FaqItem[] = [
  {
    id: 1,
    question: "Apa itu HLS (HTTP Live Streaming)?",
    answer:
      "HLS adalah protokol streaming video adaptif yang membagi video MP4 menjadi segmen-segmen kecil (.ts) dan sebuah playlist master (.m3u8). Protokol ini memungkinkan pemutaran video cepat dan mulus di berbagai perangkat dan kondisi koneksi internet.",
  },
  {
    id: 2,
    question: "Apakah video saya aman dan tidak diunggah ke server?",
    answer:
      "Ya, 100% aman. Seluruh proses transcoding dan pemotongan segmen dijalankan langsung di dalam browser pengguna (Client-side) menggunakan WebAssembly, sehingga tidak ada file yang pernah terkirim ke server kami.",
  },
  {
    id: 3,
    question: "Berapa durasi segmen yang direkomendasikan?",
    answer:
      "Untuk video standar (VOD), durasi 10 detik adalah standar industri yang memberikan keseimbangan sempurna antara ukuran file dan kecepatan buffering. Pilih 5 detik untuk respon scrubbing lebih cepat, atau 15 detik untuk meminimalkan jumlah request HTTP.",
  },
  {
    id: 4,
    question: "Apa kelebihan aplikasi desktop dibandingkan web?",
    answer:
      "Aplikasi desktop kami berjalan secara native di komputer Anda tanpa batas memori browser, mendukung konversi batch banyak video sekaligus, dan memanfaatkan akselerasi hardware GPU untuk kecepatan render maksimal.",
  },
];

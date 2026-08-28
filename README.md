# NovaStack — Next.js Enterprise UI

Struktur arsitektur Next.js 14 modern berbasis **App Router**, **TypeScript**, **Tailwind CSS**, **Lucide Icons**, dan **next-themes**.

## 🚀 Cara Menjalankan

### 1. Mode Development
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

### 2. Build untuk Produksi
```bash
npm run build
npm start
```

## 📁 Struktur Direktori

```text
src/
├── app/
│   ├── globals.css          # Tailwind CSS + utility kustom
│   ├── layout.tsx           # Root layout, Google Fonts & SEO metadata
│   └── page.tsx             # Halaman utama (komposisi modul)
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx       # Navigasi utama + logo
│   │   ├── MobileMenu.tsx   # Menu responsif mobile
│   │   ├── ThemeToggle.tsx  # Toggle mode gelap/terang
│   │   └── Footer.tsx       # Footer & copyright
│   ├── sections/
│   │   ├── Hero.tsx         # Hero section & copy button
│   │   ├── Stats.tsx        # Counter angka animasi
│   │   ├── Features.tsx     # Grid fitur utama
│   │   ├── Showcase.tsx     # Interaktif ROI calculator
│   │   ├── Faq.tsx          # Accordion FAQ
│   │   └── Cta.tsx          # Form newsletter CTA
│   ├── ui/
│   │   ├── BackToTop.tsx    # Tombol scroll ke atas
│   │   └── Toast.tsx        # Toast notification context
│   └── providers/
│       └── ThemeProvider.tsx# Wrapper next-themes
├── data/
│   ├── features.ts          # Data cards fitur
│   ├── faq.ts               # Data pertanyaan FAQ
│   └── stats.ts             # Data angka statistik
└── types/
    └── index.ts             # Type definition TypeScript
```

import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Cloud Converter Video — Render, Convert & Upload Video ke Cloud",
  description:
    "Software desktop + web terbaik untuk render video multi-resolusi (144p – 4K), convert ke HLS/MP4/WebM, dan upload otomatis ke Cloudflare R2, Amazon S3, atau cloud storage lainnya. Engine FFmpeg native, GPU acceleration, dual-pipeline.",
  keywords: [
    "cloud converter video",
    "hls converter",
    "mp4 to hls",
    "video render desktop",
    "cloudflare r2 upload",
    "amazon s3 video upload",
    "ffmpeg desktop app",
    "4k video converter",
    "multi resolution render",
    "cloud video streaming",
  ],
  authors: [{ name: "Cloud Converter Video" }],
  openGraph: {
    type: "website",
    url: "https://cloudconvertervideo.app/",
    title: "Cloud Converter Video — Render & Upload Video ke Cloud Otomatis",
    description:
      "Render video multi-resolusi hingga 4K, convert ke HLS/MP4/WebM, dan upload otomatis ke cloud storage. Dual-engine pipeline: render + upload berjalan paralel.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1200&auto=format&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "Cloud Converter Video Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cloud Converter Video — Render & Upload Video ke Cloud",
    description:
      "Software render video + upload otomatis ke cloud storage. Engine FFmpeg native, GPU acceleration, hingga 4K.",
    images: [
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1200&auto=format&fit=crop&q=80",
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.variable} font-sans bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 antialiased selection:bg-brand-500 selection:text-white min-h-screen flex flex-col justify-between`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

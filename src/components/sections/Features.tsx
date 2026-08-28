import {
  Cpu,
  CloudUpload,
  Layers,
  Zap,
  Shield,
  SlidersHorizontal,
} from "lucide-react";

const FEATURES = [
  {
    id: "gpu",
    icon: Cpu,
    iconColor: "from-violet-500 to-purple-600",
    glowColor: "shadow-violet-500/20",
    badgeColor: "bg-violet-500/10 text-violet-300",
    badge: "Engine",
    title: "GPU & CPU Acceleration",
    description: "Engine FFmpeg native dengan hardware acceleration (NVENC/AMF/QSV). Render 4K hingga 10x lebih cepat dibanding software lain.",
  },
  {
    id: "cloud",
    icon: CloudUpload,
    iconColor: "from-cyan-500 to-blue-600",
    glowColor: "shadow-cyan-500/20",
    badgeColor: "bg-cyan-500/10 text-cyan-300",
    badge: "Cloud",
    title: "Auto Upload ke Cloud",
    description: "Selesai render, otomatis upload ke Cloudflare R2, Amazon S3, DigitalOcean Spaces, atau Backblaze B2. Tanpa manual.",
  },
  {
    id: "abr",
    icon: Layers,
    iconColor: "from-indigo-500 to-brand-600",
    glowColor: "shadow-indigo-500/20",
    badgeColor: "bg-indigo-500/10 text-indigo-300",
    badge: "ABR",
    title: "Multi-Resolusi dalam 1 Render",
    description: "Satu klik, hasilkan 144p, 480p, 720p, 1080p, 2K, 4K sekaligus. Folder terstruktur otomatis per resolusi.",
  },
  {
    id: "pipeline",
    icon: Zap,
    iconColor: "from-amber-500 to-orange-600",
    glowColor: "shadow-amber-500/20",
    badgeColor: "bg-amber-500/10 text-amber-300",
    badge: "Pipeline",
    title: "Dual-Engine Paralel",
    description: "Mesin Render dan Mesin Upload berjalan bersamaan. Saat Video 1 selesai render → langsung upload, Video 2 mulai render.",
  },
  {
    id: "security",
    icon: Shield,
    iconColor: "from-emerald-500 to-teal-600",
    glowColor: "shadow-emerald-500/20",
    badgeColor: "bg-emerald-500/10 text-emerald-300",
    badge: "Aman",
    title: "Privat & Offline-Ready",
    description: "Mode Cloud Storage: file sementara langsung dihapus usai upload. Mode PC: 100% offline, tidak ada data yang keluar.",
  },
  {
    id: "formats",
    icon: SlidersHorizontal,
    iconColor: "from-rose-500 to-pink-600",
    glowColor: "shadow-rose-500/20",
    badgeColor: "bg-rose-500/10 text-rose-300",
    badge: "Format",
    title: "Semua Format Output",
    description: "HLS (.m3u8 + .ts), MP4 H.264, WebM VP9, MP3 Audio. Segment duration 5/10/15 detik. Profil CPU Low/Medium/High.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 lg:py-32 bg-slate-950 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-brand-600/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-bold uppercase tracking-widest text-brand-400">
            Fitur Unggulan
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Satu App,{" "}
            <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">
              Semua Solusi
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            Dari render multi-resolusi hingga upload otomatis ke cloud — semua terintegrasi dalam satu software desktop yang ringan.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className={`group relative p-7 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-white/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${feature.glowColor} card-glow overflow-hidden`}
              >
                {/* Card shimmer on hover */}
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/3 to-transparent transition-transform duration-700 ease-in-out pointer-events-none" />

                {/* Icon with gradient */}
                <div className="flex items-start gap-4 mb-5">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.iconColor} flex items-center justify-center text-white shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                  <span className={`mt-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${feature.badgeColor}`}>
                    {feature.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-slate-300 transition-all">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {feature.description}
                </p>

                {/* Bottom gradient border on hover */}
                <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r ${feature.iconColor} opacity-0 group-hover:opacity-60 transition-opacity duration-300`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


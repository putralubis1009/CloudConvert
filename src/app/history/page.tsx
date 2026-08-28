"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  History,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderOpen,
  Download,
  Trash2,
  Search,
  Sliders,
  Filter,
  RefreshCw,
  Video,
  Play,
  FileCheck2,
  HardDrive,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useToast } from "@/components/ui/Toast";
import { RenderHistoryItem } from "@/data/mockHistory";
import { renderHistoryService } from "@/services/renderHistoryService";
import { DeleteConfirmModal } from "@/components/history/DeleteConfirmModal";

export default function HistoryPage() {
  const { showToast } = useToast();
  const [historyList, setHistoryList] = useState<RenderHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "processing" | "failed">("all");
  const [previewJob, setPreviewJob] = useState<RenderHistoryItem | null>(null);

  // Modal deletion states
  const [itemToDelete, setItemToDelete] = useState<RenderHistoryItem | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  const loadHistory = () => {
    setHistoryList(renderHistoryService.getHistory());
  };

  useEffect(() => {
    loadHistory();
    const handleUpdate = () => loadHistory();
    window.addEventListener("render-history-updated", handleUpdate);
    return () => window.removeEventListener("render-history-updated", handleUpdate);
  }, []);

  // Filtered items
  const filteredItems = useMemo(() => {
    return historyList.filter((item) => {
      const matchSearch =
        item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.outputFolder.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "all" || item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [historyList, searchTerm, statusFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = historyList.length;
    const completed = historyList.filter((h) => h.status === "completed").length;
    const processing = historyList.filter((h) => h.status === "processing").length;
    const failed = historyList.filter((h) => h.status === "failed").length;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 100;

    return { total, completed, processing, failed, successRate };
  }, [historyList]);

  const confirmDeleteItem = () => {
    if (!itemToDelete) return;
    renderHistoryService.deleteHistoryItem(itemToDelete.id);
    loadHistory();
    showToast(`Riwayat render "${itemToDelete.filename}" berhasil dihapus.`);
    setItemToDelete(null);
  };

  const confirmClearAll = () => {
    renderHistoryService.clearAll();
    loadHistory();
    showToast("Semua riwayat render telah dibersihkan.");
    setIsClearAllModalOpen(false);
  };

  const handleDownloadZip = (item: RenderHistoryItem) => {
    showToast(`Memulai unduhan paket ZIP untuk "${item.filename}"...`);
  };

  const handleOpenPcFolder = (folderPath: string) => {
    showToast(`Membuka folder PC: ${folderPath}`);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold">
                <History className="w-3.5 h-3.5" />
                <span>Riwayat Transcoding Lokal & Web</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Riwayat Render Video HLS
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Daftar rekaman proses konversi video MP4 ke HLS, resolusi yang diekspor, dan lokasi folder penyimpanan di PC.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/render"
                className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-500/20 transition flex items-center gap-1.5"
              >
                <Video className="w-4 h-4" />
                <span>Buka Layar Render Studio</span>
              </Link>
            </div>
          </div>

          {/* Metrics Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-500 uppercase font-bold">Total Pekerjaan</span>
              <p className="text-2xl font-extrabold text-white">{metrics.total}</p>
              <span className="text-[10px] text-slate-400">Proyek video terdaftar</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-500 uppercase font-bold">Berhasil Selesai</span>
              <p className="text-2xl font-extrabold text-emerald-400">{metrics.completed}</p>
              <span className="text-[10px] text-emerald-500 font-semibold">{metrics.successRate}% Success Rate</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-500 uppercase font-bold">Sedang Berjalan</span>
              <p className="text-2xl font-extrabold text-amber-400">{metrics.processing}</p>
              <span className="text-[10px] text-amber-500 font-semibold">Active Background Queue</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-500 uppercase font-bold">Gagal / Dibatalkan</span>
              <p className="text-2xl font-extrabold text-rose-400">{metrics.failed}</p>
              <span className="text-[10px] text-slate-400">Perlu render ulang</span>
            </div>
          </div>

          {/* Search, Filter & Actions Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama video, ID atau folder..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
              <div className="flex items-center gap-1">
                {(["all", "completed", "processing", "failed"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                      statusFilter === status
                        ? "bg-brand-600 text-white"
                        : "bg-slate-800/80 text-slate-400 hover:text-white"
                    }`}
                  >
                    {status === "all" ? "Semua" : status === "completed" ? "Selesai" : status === "processing" ? "Proses" : "Gagal"}
                  </button>
                ))}
              </div>

              {historyList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsClearAllModalOpen(true)}
                  className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800/60 transition"
                  title="Bersihkan Semua Riwayat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Render History Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-xl">
            {filteredItems.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <History className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-300">Tidak ada riwayat render</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Belum ada riwayat render yang cocok dengan filter pencarian Anda. Mulai render video pertama Anda sekarang!
                </p>
                <Link
                  href="/render"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
                >
                  <Video className="w-4 h-4" />
                  <span>Mulai Render HLS</span>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Video & Job ID</th>
                      <th className="p-4">Status & Progres</th>
                      <th className="p-4">Resolusi & Segmen</th>
                      <th className="p-4">Folder Output PC</th>
                      <th className="p-4">Ukuran & Segmen</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                        {/* Video Name */}
                        <td className="p-4 space-y-1 max-w-xs">
                          <div className="font-bold text-white truncate flex items-center gap-2">
                            <Video className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                            <span className="truncate">{item.filename}</span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2">
                            <span>ID: {item.id}</span>
                            <span>•</span>
                            <span>{item.sourceSize}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-4 space-y-1.5">
                          {item.status === "completed" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              Selesai (100%)
                            </span>
                          )}
                          {item.status === "processing" && (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                Memproses ({item.progress}%)
                              </span>
                              <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500" style={{ width: `${item.progress}%` }} />
                              </div>
                            </div>
                          )}
                          {item.status === "failed" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                              <AlertTriangle className="w-3 h-3" />
                              Gagal
                            </span>
                          )}
                          <span className="text-[9px] text-slate-500 block">
                            {new Date(item.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>

                        {/* Resolution & Segments */}
                        <td className="p-4 space-y-1.5">
                          <div className="flex flex-wrap gap-1">
                            {item.resolutions.map((r) => (
                              <span
                                key={r}
                                className="px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 text-[10px] font-bold font-mono"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            Durasi Keping: <strong className="text-slate-200">{item.segmentDuration} detik</strong>
                          </span>
                        </td>

                        {/* Output Folder PC */}
                        <td className="p-4 max-w-xs space-y-1">
                          <button
                            type="button"
                            onClick={() => handleOpenPcFolder(item.outputFolder)}
                            className="font-mono text-[11px] text-slate-300 hover:text-brand-300 transition truncate block text-left group flex items-center gap-1.5"
                            title={item.outputFolder}
                          >
                            <FolderOpen className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                            <span className="truncate">{item.outputFolder}</span>
                          </button>
                          <span className="text-[9px] text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Tersimpan di PC
                          </span>
                        </td>

                        {/* Output size & chunks */}
                        <td className="p-4 space-y-1">
                          <span className="font-bold text-white font-mono block">{item.outputSize}</span>
                          <span className="text-[10px] text-slate-400 block">
                            {item.tsSegmentsCount > 0 ? `${item.tsSegmentsCount} keping .ts` : "-"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                          {item.status === "completed" && (
                            <>
                              <a
                                href={item.zipDownloadUrl}
                                className="p-2 rounded-lg bg-slate-800 hover:bg-brand-600 text-slate-200 hover:text-white transition inline-block"
                                title="Unduh Paket ZIP HLS"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                              <button
                                type="button"
                                onClick={() => setPreviewJob(item)}
                                className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white transition"
                                title="Pratinjau Master M3U8"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => setItemToDelete(item)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition"
                            title="Hapus Rekaman"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Preview Master M3U8 Modal */}
          {previewJob && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
              <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Play className="w-4 h-4 text-brand-400" />
                    <span>Pratinjau Manifest HLS: {previewJob.filename}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewJob(null)}
                    className="text-slate-400 hover:text-white text-xs font-bold"
                  >
                    ✕ Tutup
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-slate-400">Konten Playlist Master M3U8 Generator:</span>
                  <pre className="p-4 rounded-xl bg-black font-mono text-xs text-brand-300 overflow-x-auto border border-slate-800 leading-relaxed">
{`#EXTM3U
#EXT-X-VERSION:3
# Created by HLS Converter Engine v1.4.2

${previewJob.resolutions
  .map(
    (res) =>
      `#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=${res === "1080p" ? "1920x1080" : res === "720p" ? "1280x720" : "854x480"}\n${res}/index.m3u8`
  )
  .join("\n\n")}`}
                  </pre>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Target: {previewJob.outputFolder}\\master.m3u8
                  </span>
                  <a
                    href={previewJob.zipDownloadUrl}
                    onClick={() => handleDownloadZip(previewJob)}
                    className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh ZIP</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Delete Single Item Modal */}
          <DeleteConfirmModal
            isOpen={Boolean(itemToDelete)}
            title="Hapus Riwayat Render Ini?"
            description="Tindakan ini akan menghapus catatan riwayat render dari daftar. File hasil render yang tersimpan di folder komputer Anda tidak akan terhapus."
            itemFilename={itemToDelete?.filename}
            onConfirm={confirmDeleteItem}
            onCancel={() => setItemToDelete(null)}
          />

          {/* Clear All Modal */}
          <DeleteConfirmModal
            isOpen={isClearAllModalOpen}
            title="Bersihkan Semua Riwayat Render?"
            description="Apakah Anda yakin ingin menghapus seluruh rekaman riwayat render? Tindakan ini tidak dapat dibatalkan."
            onConfirm={confirmClearAll}
            onCancel={() => setIsClearAllModalOpen(false)}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}

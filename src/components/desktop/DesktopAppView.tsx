"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Video,
  Play,
  Folder,
  Settings2,
  Terminal,
  CheckCircle2,
  FileVideo,
  Zap,
  Layers,
  RotateCcw,
  Moon,
  Sun,
  ExternalLink,
  AlertCircle,
  Cpu,
  Clock,
  Gauge,
  Activity,
  Flame,
  ShieldCheck,
  Cloud,
  CloudUpload,
  Wifi,
  Eye,
  EyeOff,
  Loader2,
  Film,
  Plus,
  Trash2,
  ListOrdered,
  Workflow,
  Square,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useTheme } from "next-themes";
import { UpdateNotifier } from "./UpdateNotifier";

type Resolution = "2160p" | "1440p" | "1080p" | "720p" | "480p" | "360p" | "240p" | "144p";
type OutputFormat = "hls" | "mp4" | "webm" | "mp3";
type RenderMode = "single" | "multi";
type PerformanceProfile = "low" | "medium" | "high";
type HardwareAccel = "auto" | "cpu";
type AppStatus = "idle" | "rendering" | "uploading" | "done" | "error" | "stopped";
type CloudProvider = "r2" | "s3" | "spaces" | "b2" | "minio" | "custom";

interface QueueItem {
  id: string;
  file: File;
  status: "pending" | "rendering" | "uploading" | "done" | "error" | "stopped";
  // Render Engine State
  renderJobId?: string;
  renderStatus: "pending" | "rendering" | "done" | "error" | "stopped";
  renderProgress: number;
  currentResolution?: string;
  resProgress?: number;
  outputDir?: string;
  // Upload Engine State
  uploadJobId?: string;
  uploadStatus: "idle" | "queued" | "uploading" | "done" | "error" | "stopped";
  uploadProgress: number;
  uploadedFiles?: number;
  totalUploadFiles?: number;
  currentUploadFile?: string;
  error?: string;
}

interface CloudConfig {
  provider: CloudProvider;
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  basePath: string;
}

const CLOUD_PROVIDERS: { id: CloudProvider; label: string; icon: string; defaultEndpoint: string; defaultRegion: string }[] = [
  { id: "r2",     label: "Cloudflare R2",       icon: "☁️", defaultEndpoint: "https://<account_id>.r2.cloudflarestorage.com", defaultRegion: "auto" },
  { id: "s3",     label: "Amazon S3",           icon: "🟠", defaultEndpoint: "https://s3.amazonaws.com",                      defaultRegion: "us-east-1" },
  { id: "spaces", label: "DigitalOcean Spaces", icon: "🔵", defaultEndpoint: "https://<region>.digitaloceanspaces.com",      defaultRegion: "nyc3" },
  { id: "b2",     label: "Backblaze B2",         icon: "🟢", defaultEndpoint: "https://s3.us-west-004.backblazeb2.com",       defaultRegion: "us-west-004" },
  { id: "minio",  label: "MinIO (Self-Host)",   icon: "🐳", defaultEndpoint: "http://localhost:9000",                        defaultRegion: "us-east-1" },
  { id: "custom", label: "Custom S3 API",       icon: "⚙️", defaultEndpoint: "",                                             defaultRegion: "" },
];

const OUTPUT_FORMATS: { id: OutputFormat; label: string; desc: string }[] = [
  { id: "hls",  label: "🎬 HLS Stream (.m3u8)", desc: "Adaptive Bitrate Streaming VOD" },
  { id: "mp4",  label: "📱 MP4 Video",          desc: "Standar H.264 Web-Optimized" },
  { id: "webm", label: "🌐 WebM Video",         desc: "VP9 Modern Web Streaming" },
  { id: "mp3",  label: "🔊 Audio MP3",          desc: "Ekstrak Audio Jernih 320k" },
];

const ALL_RESOLUTIONS: { id: Resolution; label: string; bitrate: string; desc: string }[] = [
  { id: "2160p", label: "4K UHD",   bitrate: "16 Mbps",  desc: "Ultra HD (3840x2160)" },
  { id: "1440p", label: "2K QHD",   bitrate: "9 Mbps",   desc: "Quad HD (2560x1440)" },
  { id: "1080p", label: "1080p FHD", bitrate: "5 Mbps",   desc: "Full HD (1920x1080)" },
  { id: "720p",  label: "720p HD",   bitrate: "2.8 Mbps", desc: "HD (1280x720)" },
  { id: "480p",  label: "480p SD",   bitrate: "1.4 Mbps", desc: "Standard (854x480)" },
  { id: "360p",  label: "360p",      bitrate: "800 Kbps", desc: "Low (640x360)" },
  { id: "240p",  label: "240p",      bitrate: "400 Kbps", desc: "Very Low (426x240)" },
  { id: "144p",  label: "144p",      bitrate: "200 Kbps", desc: "Minimal (256x144)" },
];

const PERF_PROFILES: { id: PerformanceProfile; label: string; sub: string; desc: string; icon: any; color: string }[] = [
  {
    id: "low",
    label: "Low (Hemat)",
    sub: "~30% Beban CPU",
    desc: "Sangat ringan & hemat daya. PC tetap lancar untuk multitasking/kerja/browsing.",
    icon: ShieldCheck,
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
  {
    id: "medium",
    label: "Medium (Seimbang)",
    sub: "~70% Beban CPU",
    desc: "Keseimbangan ideal antara kecepatan render dan stabilitas sistem (Disarankan).",
    icon: Activity,
    color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
  {
    id: "high",
    label: "High (Turbo)",
    sub: "100% Core Penuh",
    desc: "Memaksimalkan seluruh core CPU & akselerasi hardware untuk kecepatan render 4K tercepat.",
    icon: Flame,
    color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
  },
];

export function DesktopAppView() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // File Queue (Batch Processing)
  const [fileQueue, setFileQueue] = useState<QueueItem[]>([]);

  // Detailed Live Render State
  const [renderDetails, setRenderDetails] = useState<{
    active: boolean;
    videoName: string;
    overallPercent: number;
    currentResPercent: number;
    currentResolution: string;
    totalResolutions: number;
    completedResolutions: number;
    fps: number;
    speed: string;
    eta: string;
    phase: string;
  }>({
    active: false,
    videoName: "",
    overallPercent: 0,
    currentResPercent: 0,
    currentResolution: "",
    totalResolutions: 1,
    completedResolutions: 0,
    fps: 0,
    speed: "0x",
    eta: "",
    phase: "Standby",
  });

  // Detailed Live Upload State
  const [uploadDetails, setUploadDetails] = useState<{
    active: boolean;
    videoName: string;
    percent: number;
    uploadedFiles: number;
    totalFiles: number;
    currentFile: string;
  }>({
    active: false,
    videoName: "",
    percent: 0,
    uploadedFiles: 0,
    totalFiles: 0,
    currentFile: "",
  });

  // Output Format (HLS, MP4, WebM, MP3)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("hls");

  // Mode
  const [renderMode, setRenderMode] = useState<RenderMode>("single");

  // Single mode settings
  const [singleResolution, setSingleResolution] = useState<Resolution>("1080p");

  // Multi mode settings — checkbox selection
  const [multiResolutions, setMultiResolutions] = useState<Set<Resolution>>(new Set(["1080p", "720p", "480p"] as Resolution[]));

  // Hardware Performance & Usage
  const [performanceProfile, setPerformanceProfile] = useState<PerformanceProfile>("high");
  const [hardwareAccel, setHardwareAccel] = useState<HardwareAccel>("auto");

  // Shared settings
  const [segmentDuration, setSegmentDuration] = useState<number>(10);
  const [outputFolder, setOutputFolder] = useState<string>("C:\\Users\\TODAY TECH\\Videos");

  // Output Destination: "local" (PC) or "cloud" (R2 / S3 / API)
  const [outputDestination, setOutputDestination] = useState<"local" | "cloud">("local");

  // Cloud Storage
  const [cloudEnabled, setCloudEnabled] = useState(false);
  const [cloudConfig, setCloudConfig] = useState<CloudConfig>({
    provider: "r2",
    endpoint: "",
    region: "auto",
    bucket: "",
    accessKeyId: "",
    secretAccessKey: "",
    basePath: "",
  });
  const [cloudTestStatus, setCloudTestStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle");
  const [cloudTestMsg, setCloudTestMsg] = useState("");
  const [showSecretKey, setShowSecretKey] = useState(false);

  // Overall App Status
  const [status, setStatus] = useState<AppStatus>("idle");
  const [showLogs, setShowLogs] = useState(false);
  const [updateCheckTrigger, setUpdateCheckTrigger] = useState(0);

  // Logs
  const [logs, setLogs] = useState<string[]>([
    "[System] Cloud Converter Video v1.7.0 — Dual-Engine Pipeline Siap.",
    "[Ready] Masukkan satu atau banyak video ke dalam antrian untuk memulai.",
  ]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Refs for tracking queue states inside concurrent async workers
  const isPipelineRunning = useRef<boolean>(false);
  const currentRenderJobId = useRef<string | null>(null);
  const queueRef = useRef<QueueItem[]>([]);
  queueRef.current = fileQueue;

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("hls_cloud_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        setCloudConfig(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (mounted && cloudConfig.endpoint) {
      try {
        localStorage.setItem("hls_cloud_config", JSON.stringify(cloudConfig));
      } catch {}
    }
  }, [cloudConfig, mounted]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = useCallback((log: string) => {
    setLogs((prev) => [...prev.slice(-100), log]);
  }, []);

  const handleAddFiles = (e: any) => {
    const files: FileList = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: QueueItem[] = Array.from(files).map((f) => ({
      id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      file: f,
      status: "pending",
      renderStatus: "pending",
      renderProgress: 0,
      uploadStatus: "idle",
      uploadProgress: 0,
    }));

    setFileQueue((prev) => [...prev, ...newItems]);
    setStatus("idle");
    addLog(`[Queue] ${newItems.length} video ditambahkan ke antrian (Total: ${fileQueue.length + newItems.length} video).`);
  };

  const handleRemoveQueueItem = (id: string) => {
    setFileQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearQueue = () => {
    if (status === "rendering" || status === "uploading") return;
    setFileQueue([]);
    setStatus("idle");
    addLog("[Queue] Antrian video dibersihkan.");
  };

  const handleSelectFolder = async () => {
    if (typeof window !== "undefined" && (window as any).electronAPI?.selectFolder) {
      const folderPath = await (window as any).electronAPI.selectFolder();
      if (folderPath) {
        setOutputFolder(folderPath);
        addLog(`[Output] Folder tujuan: ${folderPath}`);
      }
    } else {
      const promptPath = prompt("Tentukan folder tujuan di PC:", outputFolder);
      if (promptPath) {
        setOutputFolder(promptPath);
        addLog(`[Output] Folder tujuan diubah ke: ${promptPath}`);
      }
    }
  };

  const handleOpenOutputFolder = async () => {
    if (typeof window !== "undefined" && (window as any).electronAPI?.openFolderInExplorer) {
      await (window as any).electronAPI.openFolderInExplorer(outputFolder);
    } else {
      try {
        await fetch("/api/folders/open", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderPath: outputFolder }),
        });
      } catch {}
    }
  };

  const toggleMultiResolution = (res: Resolution) => {
    setMultiResolutions((prev) => {
      const next = new Set(prev);
      if (next.has(res)) {
        if (next.size > 1) next.delete(res);
      } else {
        next.add(res);
      }
      return next;
    });
  };

  // ─── ACTION: HENTIKAN PAKSA (FORCE STOP) ──────────────────────────────────
  const handleForceStop = async () => {
    isPipelineRunning.current = false;
    setStatus("stopped");

    // Call backend to kill active FFmpeg child processes
    try {
      await fetch("/api/render/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: currentRenderJobId.current }),
      });
    } catch {}

    setRenderDetails({
      active: false,
      videoName: "",
      overallPercent: 0,
      currentResPercent: 0,
      currentResolution: "",
      totalResolutions: 1,
      completedResolutions: 0,
      fps: 0,
      speed: "0x",
      eta: "",
      phase: "Dihentikan",
    });

    setUploadDetails({
      active: false,
      videoName: "",
      percent: 0,
      uploadedFiles: 0,
      totalFiles: 0,
      currentFile: "",
    });

    setFileQueue((prev) =>
      prev.map((q) =>
        q.status === "rendering" || q.status === "uploading" || q.status === "pending"
          ? { ...q, status: "stopped", renderStatus: "stopped", uploadStatus: "stopped" }
          : q
      )
    );

    addLog("\n[⏹️ System] PROSES DIHENTIKAN PAKSA OLEH PENGGUNA.");
  };

  // ─── MESIN 1: WORKER RENDER (CPU/GPU) ──────────────────────────────────────
  const runRenderWorker = async (
    resArray: Resolution[],
    isCloudMode: boolean
  ): Promise<void> => {
    for (let i = 0; i < queueRef.current.length; i++) {
      if (!isPipelineRunning.current) break;

      const item = queueRef.current[i];
      addLog(`\n[Mesin Render ⚙️] Video #${i + 1}/${queueRef.current.length}: '${item.file.name}'`);

      setRenderDetails({
        active: true,
        videoName: item.file.name,
        overallPercent: 0,
        currentResPercent: 0,
        currentResolution: resArray[0] || singleResolution,
        totalResolutions: resArray.length,
        completedResolutions: 0,
        fps: 0,
        speed: "0x",
        eta: "Menghitung...",
        phase: `Rendering '${item.file.name}'...`,
      });

      setFileQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, renderStatus: "rendering", status: "rendering" } : q))
      );

      const formData = new FormData();
      formData.append("file", item.file);
      formData.append("renderMode", renderMode);
      formData.append("outputFormat", outputFormat);
      formData.append("resolution", singleResolution);
      formData.append("resolutions", JSON.stringify(resArray));
      formData.append("segmentDuration", String(segmentDuration));
      formData.append("performanceProfile", performanceProfile);
      formData.append("hardwareAccel", hardwareAccel);

      if (isCloudMode) {
        formData.append("isCloudMode", "true");
      } else {
        formData.append("outputFolder", outputFolder);
      }

      try {
        const res = await fetch("/api/convert", { method: "POST", body: formData });
        const data = await res.json();

        if (!data.success || !data.jobId) {
          throw new Error(data.error || "Gagal memulai render video ini");
        }

        const renderJobId = data.jobId;
        currentRenderJobId.current = renderJobId;
        const generatedOutputDir = data.outputDir || outputFolder;

        // Poll render progress until render completes
        const renderSuccess = await new Promise<boolean>((resolve) => {
          const pollTimer = setInterval(async () => {
            if (!isPipelineRunning.current) {
              clearInterval(pollTimer);
              resolve(false);
              return;
            }
            try {
              const pRes = await fetch(`/api/render/progress?jobId=${renderJobId}`);
              const pData = await pRes.json();
              if (!pData.success) return;

              const p = pData.progress;
              setRenderDetails({
                active: true,
                videoName: item.file.name,
                overallPercent: p.percentOverall,
                currentResPercent: p.percentCurrent,
                currentResolution: p.currentResolution || resArray[0] || singleResolution,
                totalResolutions: p.totalResolutions,
                completedResolutions: p.completedResolutions,
                fps: p.fps,
                speed: p.speed,
                eta: p.eta,
                phase: p.currentPhase,
              });

              setFileQueue((prev) =>
                prev.map((q) =>
                  q.id === item.id
                    ? {
                        ...q,
                        renderProgress: p.percentOverall,
                        currentResolution: p.currentResolution,
                        resProgress: p.percentCurrent,
                        outputDir: generatedOutputDir,
                      }
                    : q
                )
              );

              if (p.logs && p.logs.length > 0) {
                const lastLog = p.logs[p.logs.length - 1];
                setLogs((prev) => {
                  if (prev[prev.length - 1] !== lastLog) return [...prev.slice(-100), lastLog];
                  return prev;
                });
              }

              if (p.status === "done") {
                clearInterval(pollTimer);
                resolve(true);
              } else if (p.status === "error") {
                clearInterval(pollTimer);
                resolve(false);
              }
            } catch {}
          }, 350);
        });

        if (renderSuccess) {
          addLog(`[Mesin Render ✅] '${item.file.name}' selesai dirender!`);

          if (isCloudMode) {
            addLog(`[Pipeline 🚀] '${item.file.name}' dialihkan ke Mesin Upload.`);
            setFileQueue((prev) =>
              prev.map((q) =>
                q.id === item.id
                  ? {
                      ...q,
                      renderStatus: "done",
                      renderProgress: 100,
                      outputDir: generatedOutputDir,
                      uploadStatus: "queued",
                    }
                  : q
              )
            );
          } else {
            setFileQueue((prev) =>
              prev.map((q) =>
                q.id === item.id
                  ? {
                      ...q,
                      renderStatus: "done",
                      renderProgress: 100,
                      outputDir: generatedOutputDir,
                      status: "done",
                    }
                  : q
              )
            );
          }
        } else {
          if (!isPipelineRunning.current) return;
          addLog(`[Mesin Render ✗] Error saat render '${item.file.name}'.`);
          setFileQueue((prev) =>
            prev.map((q) =>
              q.id === item.id ? { ...q, renderStatus: "error", status: "error" } : q
            )
          );
        }
      } catch (err: any) {
        if (!isPipelineRunning.current) return;
        addLog(`[Mesin Render ✗] ${err.message}`);
        setFileQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, renderStatus: "error", status: "error", error: err.message } : q))
        );
      }
    }

    setRenderDetails({
      active: false,
      videoName: "",
      overallPercent: 100,
      currentResPercent: 100,
      currentResolution: "",
      totalResolutions: 1,
      completedResolutions: 1,
      fps: 0,
      speed: "0x",
      eta: "",
      phase: "Semua render selesai!",
    });
  };

  // ─── MESIN 2: WORKER UPLOAD (CLOUD STORAGE PARALEL) ─────────────────────────
  const runUploadWorker = async (): Promise<void> => {
    while (isPipelineRunning.current) {
      const itemToUpload = queueRef.current.find((q) => q.renderStatus === "done" && q.uploadStatus === "queued");

      if (!itemToUpload) {
        const allDone = queueRef.current.every((q) =>
          q.renderStatus === "error" || q.renderStatus === "stopped" || (q.renderStatus === "done" && (q.uploadStatus === "done" || q.uploadStatus === "error" || q.uploadStatus === "stopped"))
        );
        const anyPendingRender = queueRef.current.some((q) => q.renderStatus === "pending" || q.renderStatus === "rendering");

        if (allDone && !anyPendingRender) {
          break;
        }

        await new Promise((r) => setTimeout(r, 400));
        continue;
      }

      const uploadJobId = `job_upload_${itemToUpload.id}`;
      addLog(`\n[Mesin Upload ☁️] Mengunggah '${itemToUpload.file.name}' ke ${cloudConfig.provider.toUpperCase()} (${cloudConfig.bucket})...`);

      setUploadDetails({
        active: true,
        videoName: itemToUpload.file.name,
        percent: 0,
        uploadedFiles: 0,
        totalFiles: 0,
        currentFile: "",
      });

      setFileQueue((prev) =>
        prev.map((q) =>
          q.id === itemToUpload.id
            ? { ...q, uploadStatus: "uploading", status: "uploading", uploadJobId }
            : q
        )
      );

      try {
        await fetch("/api/cloud/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            localFolder: itemToUpload.outputDir || outputFolder,
            cloudConfig,
            jobId: uploadJobId,
            deleteLocalAfterUpload: true,
          }),
        });

        const uploadSuccess = await new Promise<boolean>((resolve) => {
          const upTimer = setInterval(async () => {
            if (!isPipelineRunning.current) {
              clearInterval(upTimer);
              resolve(false);
              return;
            }
            try {
              const uRes = await fetch(`/api/render/progress?jobId=${uploadJobId}`);
              const uData = await uRes.json();
              if (!uData.success) return;

              const up = uData.progress;
              setUploadDetails({
                active: true,
                videoName: itemToUpload.file.name,
                percent: up.uploadPercent || 0,
                uploadedFiles: up.uploadedFiles || 0,
                totalFiles: up.totalUploadFiles || 0,
                currentFile: up.currentPhase || "",
              });

              setFileQueue((prev) =>
                prev.map((q) =>
                  q.id === itemToUpload.id
                    ? {
                        ...q,
                        uploadProgress: up.uploadPercent || 0,
                        uploadedFiles: up.uploadedFiles || 0,
                        totalUploadFiles: up.totalUploadFiles || 0,
                      }
                    : q
                )
              );

              if (up.logs && up.logs.length > 0) {
                const lastLog = up.logs[up.logs.length - 1];
                setLogs((prev) => {
                  if (prev[prev.length - 1] !== lastLog) return [...prev.slice(-100), lastLog];
                  return prev;
                });
              }

              if (up.uploadStatus === "done" || up.status === "done") {
                clearInterval(upTimer);
                resolve(true);
              } else if (up.uploadStatus === "error" || up.status === "error") {
                clearInterval(upTimer);
                resolve(false);
              }
            } catch {}
          }, 400);
        });

        if (uploadSuccess) {
          addLog(`[Mesin Upload ✅] '${itemToUpload.file.name}' 100% terunggah ke Cloud Storage!`);
          setFileQueue((prev) =>
            prev.map((q) =>
              q.id === itemToUpload.id
                ? { ...q, uploadStatus: "done", uploadProgress: 100, status: "done" }
                : q
            )
          );
        } else {
          if (!isPipelineRunning.current) return;
          addLog(`[Mesin Upload ✗] Gagal upload '${itemToUpload.file.name}'.`);
          setFileQueue((prev) =>
            prev.map((q) =>
              q.id === itemToUpload.id
                ? { ...q, uploadStatus: "error", status: "error" }
                : q
            )
          );
        }
      } catch (upErr: any) {
        if (!isPipelineRunning.current) return;
        addLog(`[Mesin Upload ✗] ${upErr.message}`);
        setFileQueue((prev) =>
          prev.map((q) =>
            q.id === itemToUpload.id
              ? { ...q, uploadStatus: "error", status: "error" }
              : q
          )
        );
      }
    }

    setUploadDetails({
      active: false,
      videoName: "",
      percent: 100,
      uploadedFiles: 0,
      totalFiles: 0,
      currentFile: "",
    });
  };

  // ─── START PIPELINE (MENJALANKAN 2 MESIN SECARA SIMULTAN) ───────────────────
  const handleStartPipeline = async () => {
    if (fileQueue.length === 0) {
      alert("Silakan masukkan minimal 1 file video ke dalam antrian.");
      return;
    }

    if (outputDestination === "cloud") {
      if (!cloudConfig.endpoint || !cloudConfig.bucket || !cloudConfig.accessKeyId || !cloudConfig.secretAccessKey) {
        alert("Lengkapi konfigurasi Cloud Storage (Endpoint, Bucket, Access Key, Secret Key) terlebih dahulu.");
        return;
      }
    }

    isPipelineRunning.current = true;
    setStatus("rendering");

    const resArray = renderMode === "multi" && outputFormat === "hls"
      ? ALL_RESOLUTIONS.filter((r) => multiResolutions.has(r.id)).map((r) => r.id)
      : [singleResolution];

    addLog("═".repeat(60));
    addLog(`[🚀 Pipelined Dual-Engine] Memulai proses ${fileQueue.length} video:`);
    addLog(`  ⚙️ Mesin Render (CPU/GPU) + ☁️ Mesin Upload (Cloud Storage) Berjalan Simultan`);
    addLog("═".repeat(60));

    setFileQueue((prev) =>
      prev.map((q) => ({
        ...q,
        status: "pending",
        renderStatus: "pending",
        renderProgress: 0,
        uploadStatus: outputDestination === "cloud" ? "idle" : "done",
        uploadProgress: 0,
      }))
    );

    const renderPromise = runRenderWorker(resArray, outputDestination === "cloud");
    const uploadPromise = outputDestination === "cloud" ? runUploadWorker() : Promise.resolve();

    await Promise.all([renderPromise, uploadPromise]);

    if (isPipelineRunning.current) {
      isPipelineRunning.current = false;
      setStatus("done");
      addLog("\n" + "═".repeat(60));
      addLog(`[🎉 Selesai] Semua ${fileQueue.length} video telah selesai diproses!`);
    }
  };

  const handleReset = () => {
    isPipelineRunning.current = false;
    setStatus("idle");
    setRenderDetails({ active: false, videoName: "", overallPercent: 0, currentResPercent: 0, currentResolution: "", totalResolutions: 1, completedResolutions: 0, fps: 0, speed: "0x", eta: "", phase: "Standby" });
    setUploadDetails({ active: false, videoName: "", percent: 0, uploadedFiles: 0, totalFiles: 0, currentFile: "" });
    setFileQueue((prev) => prev.map((q) => ({ ...q, status: "pending", renderStatus: "pending", renderProgress: 0, uploadStatus: "idle", uploadProgress: 0 })));
    addLog("[Reset] Siap untuk antrian proses baru.");
  };

  const handleTestCloudConnection = async () => {
    if (!cloudConfig.endpoint || !cloudConfig.bucket || !cloudConfig.accessKeyId || !cloudConfig.secretAccessKey) {
      setCloudTestStatus("fail");
      setCloudTestMsg("Lengkapi semua field terlebih dahulu.");
      return;
    }
    setCloudTestStatus("testing");
    setCloudTestMsg("");
    try {
      const res = await fetch("/api/cloud/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test", cloudConfig }),
      });
      const data = await res.json();
      setCloudTestStatus(data.success ? "ok" : "fail");
      setCloudTestMsg(data.message);
      addLog(`[Cloud Test] ${data.message}`);
    } catch (err: any) {
      setCloudTestStatus("fail");
      setCloudTestMsg(err.message || "Gagal menghubungi server.");
    }
  };

  const handleSelectProvider = (provider: CloudProvider) => {
    const preset = CLOUD_PROVIDERS.find((p) => p.id === provider);
    setCloudConfig((prev) => ({
      ...prev,
      provider,
      endpoint: preset?.defaultEndpoint || prev.endpoint,
      region: preset?.defaultRegion || prev.region,
    }));
    setCloudTestStatus("idle");
  };

  const sortedMultiResolutions = ALL_RESOLUTIONS.filter((r) => multiResolutions.has(r.id)).map((r) => r.id);
  const completedVideosCount = fileQueue.filter((q) => q.status === "done").length;
  const isRunning = status === "rendering" || status === "uploading";

  return (
    <div className="min-h-screen bg-[#0d0f14] text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* ── Titlebar ── */}
      <header className="h-12 bg-[#111318] border-b border-slate-800/60 px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-brand-500 to-cyan-400 blur-sm opacity-50" />
            <div className="relative w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
              <Cloud className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-[13px] font-bold tracking-wide bg-gradient-to-r from-white via-brand-200 to-cyan-300 bg-clip-text text-transparent">Cloud Converter Video</h1>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-400 font-semibold uppercase tracking-wider flex items-center gap-1">
              <Workflow className="w-2.5 h-2.5" />
              v1.7.0
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setUpdateCheckTrigger((prev) => prev + 1)}
            title="Cek Pembaruan Versi"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 text-[11px] font-semibold text-slate-300 hover:text-white transition-all group"
          >
            <Sparkles className="w-3 h-3 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>Cek Update</span>
          </button>

          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-all
            ${performanceProfile === "low"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : performanceProfile === "medium"
              ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse
              ${performanceProfile === "low" ? "bg-emerald-400" : performanceProfile === "medium" ? "bg-amber-400" : "bg-rose-400"}`}
            />
            {performanceProfile === "low" ? "Low (~30% CPU)" : performanceProfile === "medium" ? "Med (~70% CPU)" : "High (100% Turbo 4K)"}
          </div>

          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </header>

      {/* ── Main Layout ── */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel: Configuration */}
        <div className="w-[490px] flex-shrink-0 border-r border-slate-800/60 flex flex-col overflow-y-auto">
          {/* 1. Antrian Video Sumber (Batch Multi-Video) */}
          <div className="p-4 border-b border-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ListOrdered className="w-3.5 h-3.5 text-violet-400" />
                1. Antrian Video ({fileQueue.length} Video)
              </p>
              {fileQueue.length > 0 && !isRunning && (
                <button
                  type="button"
                  onClick={handleClearQueue}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold"
                >
                  Bersihkan
                </button>
              )}
            </div>

            {/* Video Queue List */}
            {fileQueue.length > 0 && (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {fileQueue.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`p-2 rounded-xl border text-xs transition-all space-y-1
                      ${item.renderStatus === "rendering"
                        ? "bg-violet-600/15 border-violet-500/60 shadow-sm"
                        : item.uploadStatus === "uploading"
                        ? "bg-sky-600/15 border-sky-500/60 shadow-sm"
                        : item.status === "done"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : item.status === "stopped"
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                        : "bg-slate-900/50 border-slate-800 text-slate-300"
                      }`}
                  >
                    <div className="flex items-center justify-between min-w-0">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-white truncate text-[11px]">{item.file.name}</div>
                          <div className="text-[10px] text-slate-500">{(item.file.size / 1024 / 1024).toFixed(2)} MB</div>
                        </div>
                      </div>

                      {!isRunning && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQueueItem(item.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Compact Status Tags */}
                    <div className="flex items-center gap-1.5 pt-0.5 text-[10px]">
                      <span className={`px-1.5 py-0.5 rounded font-mono
                        ${item.renderStatus === "done"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : item.renderStatus === "rendering"
                          ? "bg-violet-500/20 text-violet-300 animate-pulse font-bold"
                          : item.renderStatus === "stopped"
                          ? "bg-rose-500/20 text-rose-400"
                          : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        ⚙️ Render: {item.renderStatus === "done" ? "✓" : item.renderStatus === "rendering" ? `${item.renderProgress}%` : item.renderStatus === "stopped" ? "Dihentikan" : "Antri"}
                      </span>

                      {outputDestination === "cloud" && (
                        <span className={`px-1.5 py-0.5 rounded font-mono
                          ${item.uploadStatus === "done"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : item.uploadStatus === "uploading"
                            ? "bg-sky-500/20 text-sky-300 animate-pulse font-bold"
                            : item.uploadStatus === "queued"
                            ? "bg-amber-500/20 text-amber-300"
                            : item.uploadStatus === "stopped"
                            ? "bg-rose-500/20 text-rose-400"
                            : "bg-slate-800 text-slate-500"
                          }`}
                        >
                          ☁️ Cloud: {item.uploadStatus === "done" ? "✓" : item.uploadStatus === "uploading" ? `${item.uploadProgress}%` : item.uploadStatus === "queued" ? "Siap" : item.uploadStatus === "stopped" ? "Dihentikan" : "Menunggu"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Files Button */}
            <label className="p-3 rounded-xl border-2 border-dashed border-slate-700 hover:border-violet-500/60 bg-slate-900/40 hover:bg-slate-900/70 cursor-pointer flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-all group">
              <input
                type="file"
                multiple
                accept="video/*,audio/*"
                onChange={handleAddFiles}
                disabled={isRunning}
                className="hidden"
              />
              <Plus className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
              <span>{fileQueue.length === 0 ? "Pilih Video (Bisa Pilih Banyak Sekaligus)" : "+ Tambah Video ke Antrian"}</span>
            </label>
          </div>

          {/* 2. Format Output */}
          <div className="p-4 border-b border-slate-800/40">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Film className="w-3 h-3 text-violet-400" />
              2. Format Output Target
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {OUTPUT_FORMATS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  disabled={isRunning}
                  onClick={() => setOutputFormat(f.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all
                    ${outputFormat === f.id
                      ? "bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-500/25 scale-[1.01]"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                >
                  <div className="text-xs font-bold">{f.label}</div>
                  <div className="text-[10px] opacity-75 mt-0.5">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Mode Render (HLS) */}
          {outputFormat === "hls" && (
            <div className="p-4 border-b border-slate-800/40">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-violet-400" />
                3. Mode Render HLS
              </p>
              <div className="flex gap-1.5 p-1 bg-slate-900/60 rounded-xl border border-slate-800/60">
                {([
                  { id: "single" as RenderMode, label: "⚡ Render Tunggal", desc: "1 resolusi" },
                  { id: "multi"  as RenderMode, label: "🎯 Multi-Kualitas ABR", desc: "Adaptive Bitrate" },
                ] as const).map((m) => (
                  <button
                    key={m.id}
                    disabled={isRunning}
                    onClick={() => setRenderMode(m.id)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all text-center
                      ${renderMode === m.id
                        ? "bg-violet-600 text-white shadow-md shadow-violet-500/30"
                        : "text-slate-400 hover:text-slate-200"
                      }`}
                  >
                    <div>{m.label}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Resolusi (4K UHD s/d 144p) */}
          {outputFormat !== "mp3" && (
            <div className="p-4 border-b border-slate-800/40">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Settings2 className="w-3 h-3 text-violet-400" />
                4. {outputFormat === "hls" && renderMode === "multi" ? "Pilih Resolusi Multi-ABR" : "Pilih Resolusi Target"}
              </p>

              {outputFormat !== "hls" || renderMode === "single" ? (
                <div className="grid grid-cols-4 gap-1.5">
                  {ALL_RESOLUTIONS.map((r) => (
                    <button
                      key={r.id}
                      disabled={isRunning}
                      onClick={() => setSingleResolution(r.id)}
                      className={`py-2 px-1.5 rounded-xl text-xs font-semibold border transition-all text-center
                        ${singleResolution === r.id
                          ? "bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-500/25 scale-[1.02]"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                        }`}
                    >
                      <div className="font-bold">{r.label.split(" ")[0]}</div>
                      <div className="text-[9px] opacity-60 mt-0.5">{r.bitrate}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {ALL_RESOLUTIONS.map((r) => {
                    const checked = multiResolutions.has(r.id);
                    return (
                      <label
                        key={r.id}
                        className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer border transition-all
                          ${checked
                            ? "border-violet-500/40 bg-violet-500/8"
                            : "border-slate-800 bg-slate-900/30 hover:border-slate-700"
                          }`}
                      >
                        <div
                          onClick={() => !isRunning && toggleMultiResolution(r.id)}
                          className={`w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer
                            ${checked
                              ? "bg-violet-600 border-violet-500"
                              : "border-slate-600 bg-slate-900"
                            }`}
                        >
                          {checked && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1" onClick={() => !isRunning && toggleMultiResolution(r.id)}>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{r.label}</span>
                            <span className="text-[10px] text-slate-500">{r.desc}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">{r.bitrate}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 5. Alokasi Beban Hardware (CPU & GPU) */}
          <div className="p-4 border-b border-slate-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-violet-400" />
                5. Alokasi Beban CPU & GPU
              </p>
              <span className="text-[10px] text-slate-500 font-mono">
                {performanceProfile === "low" ? "Beban Ringan" : performanceProfile === "medium" ? "Beban Standard" : "Turbo 4K Maksimal"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {PERF_PROFILES.map((p) => {
                const Icon = p.icon;
                const isSelected = performanceProfile === p.id;
                return (
                  <button
                    key={p.id}
                    disabled={isRunning}
                    onClick={() => setPerformanceProfile(p.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between
                      ${isSelected
                        ? `${p.color} shadow-md scale-[1.02]`
                        : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Icon className="w-4 h-4" />
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{p.label}</div>
                      <div className="text-[10px] opacity-75 mt-0.5">{p.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Durasi Segmen (HLS Only) */}
          {outputFormat === "hls" && (
            <div className="p-4 border-b border-slate-800/40">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-violet-400" />
                6. Durasi Segmen HLS (.ts)
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { sec: 5,  label: "5 Detik",  desc: "Ultra Cepat" },
                  { sec: 10, label: "10 Detik", desc: "Standar VOD" },
                  { sec: 15, label: "15 Detik", desc: "Kompresi +" },
                ].map((s) => (
                  <button
                    key={s.sec}
                    disabled={isRunning}
                    onClick={() => setSegmentDuration(s.sec)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center
                      ${segmentDuration === s.sec
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/25 scale-[1.02]"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                      }`}
                  >
                    <div>{s.label}</div>
                    <div className="text-[10px] opacity-60 mt-0.5">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 7. Lokasi Output (Lokal PC atau Cloud Storage) */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Folder className="w-3 h-3 text-violet-400" />
                7. Lokasi Output (Pilih Salah Satu)
              </p>
              <span className="text-[10px] text-slate-500 font-mono">
                {outputDestination === "local" ? "PC Lokal" : "Cloud Storage API"}
              </span>
            </div>

            <div className="flex gap-1.5 p-1 bg-slate-900/60 rounded-xl border border-slate-800/60">
              <button
                type="button"
                disabled={isRunning}
                onClick={() => {
                  setOutputDestination("local");
                  setCloudEnabled(false);
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all text-center flex items-center justify-center gap-1.5
                  ${outputDestination === "local"
                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/30"
                    : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>Simpan di PC</span>
              </button>

              <button
                type="button"
                disabled={isRunning}
                onClick={() => {
                  setOutputDestination("cloud");
                  setCloudEnabled(true);
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all text-center flex items-center justify-center gap-1.5
                  ${outputDestination === "cloud"
                    ? "bg-sky-600 text-white shadow-md shadow-sky-500/30"
                    : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Cloud Storage (R2/S3)</span>
              </button>
            </div>

            {outputDestination === "local" && (
              <div className="space-y-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800/70">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-semibold">Folder Penyimpanan di PC:</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Lokal Drive</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 py-2 px-3 rounded-xl bg-slate-900 border border-slate-700/80 text-[11px] font-mono text-slate-200 truncate">
                    {outputFolder}
                  </div>
                  <button
                    type="button"
                    disabled={isRunning}
                    onClick={handleSelectFolder}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
                  >
                    <Folder className="w-3.5 h-3.5" />
                    Ganti
                  </button>
                </div>
              </div>
            )}

            {outputDestination === "cloud" && (
              <div className="space-y-2.5 p-3 rounded-xl bg-slate-950/80 border border-sky-500/30">
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Layanan Cloud Storage:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {CLOUD_PROVIDERS.map((cp) => (
                      <button
                        key={cp.id}
                        type="button"
                        disabled={isRunning}
                        onClick={() => handleSelectProvider(cp.id)}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border text-center transition-all flex items-center justify-center gap-1
                          ${cloudConfig.provider === cp.id
                            ? "bg-sky-600/30 border-sky-500 text-sky-300 shadow-sm"
                            : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                          }`}
                      >
                        <span>{cp.icon}</span>
                        <span className="truncate">{cp.label.split(" ")[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-semibold mb-0.5 block">S3 / R2 Endpoint URL:</label>
                  <input
                    type="text"
                    disabled={isRunning}
                    value={cloudConfig.endpoint}
                    onChange={(e) => setCloudConfig({ ...cloudConfig, endpoint: e.target.value })}
                    placeholder="https://<account_id>.r2.cloudflarestorage.com"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-[11px] text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold mb-0.5 block">Bucket Name:</label>
                    <input
                      type="text"
                      disabled={isRunning}
                      value={cloudConfig.bucket}
                      onChange={(e) => setCloudConfig({ ...cloudConfig, bucket: e.target.value })}
                      placeholder="my-hls-videos"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-[11px] text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold mb-0.5 block">Region:</label>
                    <input
                      type="text"
                      disabled={isRunning}
                      value={cloudConfig.region}
                      onChange={(e) => setCloudConfig({ ...cloudConfig, region: e.target.value })}
                      placeholder="auto atau us-east-1"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-[11px] text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-semibold mb-0.5 block">Access Key ID:</label>
                  <input
                    type="text"
                    disabled={isRunning}
                    value={cloudConfig.accessKeyId}
                    onChange={(e) => setCloudConfig({ ...cloudConfig, accessKeyId: e.target.value })}
                    placeholder="Masukkan Access Key"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-[11px] text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] text-slate-400 font-semibold">Secret Access Key:</label>
                    <button
                      type="button"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1"
                    >
                      {showSecretKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {showSecretKey ? "Sembunyikan" : "Lihat"}
                    </button>
                  </div>
                  <input
                    type={showSecretKey ? "text" : "password"}
                    disabled={isRunning}
                    value={cloudConfig.secretAccessKey}
                    onChange={(e) => setCloudConfig({ ...cloudConfig, secretAccessKey: e.target.value })}
                    placeholder="Masukkan Secret Access Key"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-[11px] text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-semibold mb-0.5 block">Folder Tujuan di Bucket (Opsional):</label>
                  <input
                    type="text"
                    disabled={isRunning}
                    value={cloudConfig.basePath}
                    onChange={(e) => setCloudConfig({ ...cloudConfig, basePath: e.target.value })}
                    placeholder="asset.official/ (bisa dikosongkan)"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-[11px] text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleTestCloudConnection}
                    disabled={cloudTestStatus === "testing" || isRunning}
                    className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {cloudTestStatus === "testing" ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin text-sky-400" />
                        Menguji Koneksi API...
                      </>
                    ) : cloudTestStatus === "ok" ? (
                      <>
                        <Wifi className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Koneksi Berhasil ✓</span>
                      </>
                    ) : (
                      <>
                        <Wifi className="w-3 h-3 text-sky-400" />
                        Uji Koneksi API Storage
                      </>
                    )}
                  </button>
                  {cloudTestMsg && (
                    <p className={`text-[10px] mt-1 text-center font-mono ${cloudTestStatus === "ok" ? "text-emerald-400" : "text-rose-400"}`}>
                      {cloudTestMsg}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Clean Detailed Progress Bars & Action Center */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-[#0b0d11]">
          {/* Main Action Bar & Buttons */}
          <div className="p-4 border-b border-slate-800/60 bg-[#111318] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              {!isRunning ? (
                <button
                  disabled={fileQueue.length === 0}
                  onClick={handleStartPipeline}
                  className="py-3 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-violet-500/25 flex items-center gap-2 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  {status === "done"
                    ? "Render Ulang Antrian"
                    : fileQueue.length > 1
                    ? `Mulai Render ${fileQueue.length} Video di Antrian`
                    : `Mulai Render Video`}
                </button>
              ) : (
                <button
                  onClick={handleForceStop}
                  className="py-3 px-6 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm shadow-lg shadow-rose-500/30 flex items-center gap-2 transition-all animate-pulse"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>⏹️ Hentikan Paksa</span>
                </button>
              )}

              {(status === "done" || status === "stopped" || status === "error") && (
                <button
                  onClick={handleReset}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
            </div>

            {/* Overall Queue Progress Counter */}
            {fileQueue.length > 0 && (
              <div className="text-right">
                <div className="text-xs font-bold text-white">
                  {completedVideosCount} dari {fileQueue.length} Video Selesai
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {Math.round((completedVideosCount / Math.max(1, fileQueue.length)) * 100)}% Total Antrian
                </div>
              </div>
            )}
          </div>

          {/* ── HIGH-DETAIL PROGRESS BARS ── */}
          <div className="p-5 space-y-4 flex-1">
            {/* Status Notification Banners */}
            {status === "stopped" && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  Proses render telah berhasil dihentikan paksa oleh pengguna.
                </div>
                <button
                  onClick={handleReset}
                  className="px-2.5 py-1 rounded bg-rose-600/30 hover:bg-rose-600 text-rose-200 text-[11px]"
                >
                  Reset Status
                </button>
              </div>
            )}

            {status === "done" && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-bold">
                      {fileQueue.length > 1 ? `Semua ${fileQueue.length} Video Berhasil Diproses 100%!` : "Render & Upload Selesai 100%!"}
                    </div>
                    <div className="text-[11px] text-emerald-400/80">
                      {outputDestination === "cloud"
                        ? `Seluruh folder video berhasil tersimpan aman di Cloud Storage ${cloudConfig.provider.toUpperCase()} (${cloudConfig.bucket})`
                        : `Seluruh video tersimpan rapi di folder induk masing-masing di PC`}
                    </div>
                  </div>
                </div>
                {outputDestination === "local" && (
                  <button
                    onClick={handleOpenOutputFolder}
                    className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-600/30"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Buka Folder
                  </button>
                )}
              </div>
            )}

            {/* 1. BAR PROGRES RENDER (CPU/GPU) */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-violet-500/30 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
                    <Cpu className={`w-4 h-4 ${renderDetails.active ? "animate-spin" : ""}`} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Proses Render (CPU/GPU)</span>
                      {renderDetails.active && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-mono font-bold animate-pulse">
                          Sedang Berjalan
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate max-w-[340px]">
                      {renderDetails.videoName ? renderDetails.videoName : "Menunggu video..."}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-black text-violet-400 font-mono">
                    {renderDetails.overallPercent}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {renderDetails.active ? renderDetails.eta || "Menghitung..." : "Standby"}
                  </div>
                </div>
              </div>

              {/* Main Render Progress Bar */}
              <div className="space-y-1">
                <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800/80 overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-500 rounded-full transition-all duration-300 shadow-sm shadow-violet-500/50"
                    style={{ width: `${renderDetails.overallPercent}%` }}
                  />
                </div>
              </div>

              {/* Multi-Quality Sub Resolution Progress Bar */}
              {renderMode === "multi" && outputFormat === "hls" && renderDetails.active && (
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-medium">
                      Resolusi aktif: <strong className="text-violet-300 font-mono">{renderDetails.currentResolution}</strong>
                    </span>
                    <span className="text-violet-400 font-mono font-bold">{renderDetails.currentResPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className="h-full bg-violet-400 rounded-full transition-all duration-200"
                      style={{ width: `${renderDetails.currentResPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Render Telemetry Grid */}
              <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-800/60 text-center">
                <div className="p-1.5 rounded-lg bg-slate-950/50">
                  <div className="text-[9px] text-slate-500 font-semibold uppercase">FPS</div>
                  <div className="text-xs font-bold text-slate-200 font-mono">
                    {renderDetails.fps > 0 ? renderDetails.fps.toFixed(0) : "—"}
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-950/50">
                  <div className="text-[9px] text-slate-500 font-semibold uppercase">Kecepatan</div>
                  <div className="text-xs font-bold text-slate-200 font-mono">
                    {renderDetails.speed !== "0x" ? renderDetails.speed : "—"}
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-950/50">
                  <div className="text-[9px] text-slate-500 font-semibold uppercase">Sisa Waktu</div>
                  <div className="text-xs font-bold text-slate-200 font-mono">
                    {renderDetails.eta || "—"}
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-950/50">
                  <div className="text-[9px] text-slate-500 font-semibold uppercase">Profil CPU</div>
                  <div className="text-xs font-bold text-violet-300 font-mono">
                    {performanceProfile.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. BAR PROGRES UPLOAD (CLOUD STORAGE) */}
            {outputDestination === "cloud" && (
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-sky-500/30 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-600/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                      <CloudUpload className={`w-4 h-4 ${uploadDetails.active ? "animate-bounce" : ""}`} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Proses Upload Cloud (8x Parallel Stream)</span>
                        {uploadDetails.active && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono font-bold animate-pulse">
                            Sedang Upload
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate max-w-[340px]">
                        {uploadDetails.videoName ? uploadDetails.videoName : "Menunggu video selesai render..."}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black text-sky-400 font-mono">
                      {uploadDetails.percent}%
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {cloudConfig.provider.toUpperCase()} : {cloudConfig.bucket}
                    </div>
                  </div>
                </div>

                {/* Main Upload Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800/80 overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 via-indigo-400 to-cyan-400 rounded-full transition-all duration-300 shadow-sm shadow-sky-500/50"
                      style={{ width: `${uploadDetails.percent}%` }}
                    />
                  </div>
                </div>

                {/* Upload Details Counter */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                  <span>File terkirim: <strong className="text-white font-bold">{uploadDetails.uploadedFiles} / {uploadDetails.totalFiles || "—"}</strong></span>
                  <span className="text-sky-300">Multi-Part Concurrency: 8 Streams</span>
                </div>
              </div>
            )}

            {/* 3. BAR PROGRES ANTRIAN KESELURUHAN (BATCH PROGRESS) */}
            {fileQueue.length > 1 && (
              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <ListOrdered className="w-3.5 h-3.5 text-violet-400" />
                    Progres Antrian ({completedVideosCount} / {fileQueue.length} Video Selesai)
                  </span>
                  <span className="font-mono text-violet-400 font-bold">
                    {Math.round((completedVideosCount / fileQueue.length) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${(completedVideosCount / fileQueue.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Collapsible Console Log Toggle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowLogs(!showLogs)}
                className="w-full py-2 px-3 rounded-xl bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-violet-400" />
                  Log Detail Aktivitas Mesin ({logs.length} baris)
                </span>
                {showLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showLogs && (
                <div className="mt-2 h-44 rounded-xl bg-slate-950 border border-slate-800 p-3 overflow-y-auto font-mono text-[10px] leading-relaxed text-slate-400 space-y-0.5">
                  {logs.map((log, i) => (
                    <div
                      key={i}
                      className={`
                        ${log.startsWith("[Error]") || log.includes("✗") || log.includes("DIHENTIKAN") ? "text-rose-400 font-semibold" : ""}
                        ${log.startsWith("[Mesin Render ✅]") || log.startsWith("[Mesin Upload ✅]") || log.startsWith("[✅") || log.startsWith("[🎉") ? "text-emerald-400 font-semibold" : ""}
                        ${log.startsWith("[Mesin Render") || log.startsWith("[Start]") ? "text-violet-300" : ""}
                        ${log.startsWith("[Mesin Upload") || log.startsWith("[Upload]") || log.startsWith("[Cloud]") ? "text-sky-300" : ""}
                        ${log.startsWith("[Pipeline") ? "text-amber-300 font-semibold" : ""}
                        ${log.startsWith("═") || log.startsWith("─") ? "text-slate-700" : ""}
                      `}
                    >
                      {log}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Auto-Update Notification Component ── */}
      <UpdateNotifier manualCheckTrigger={updateCheckTrigger} />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Zap, CheckCircle2, XCircle, Loader2, Layers } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────
export type RenderStatus = "idle" | "rendering" | "done" | "error";

export interface RenderStage {
  id: string;
  label: string;
  /** Progress range this stage covers: [from, to] — 0..100 */
  range: [number, number];
}

export interface RenderState {
  status: RenderStatus;
  progress: number;
  currentStageId: string | null;
  elapsedMs: number;
  errorMessage?: string;
}

// ─── Stub Stages ───────────────────────────────────────────────────────────────
/** Stub render stages that simulate a realistic HLS conversion pipeline */
export const DEFAULT_RENDER_STAGES: RenderStage[] = [
  { id: "init", label: "Inisialisasi engine render…", range: [0, 10] },
  { id: "decode", label: "Memproses video sumber…", range: [10, 35] },
  { id: "encode", label: "Mengkonversi ke format HLS…", range: [35, 75] },
  { id: "segment", label: "Membagi menjadi segmen .ts…", range: [75, 90] },
  { id: "manifest", label: "Membuat file M3U8…", range: [90, 97] },
  { id: "zip", label: "Mengemas file output ke ZIP…", range: [97, 100] },
];

// ─── Simulation Hook ────────────────────────────────────────────────────────────
interface UseRenderSimulationOptions {
  stages?: RenderStage[];
  /** Average ms between each progress tick */
  tickIntervalMs?: number;
  /** How much progress (on avg) each tick advances */
  tickAmountMin?: number;
  tickAmountMax?: number;
  onComplete?: () => void;
  onError?: (msg: string) => void;
}

export function useRenderSimulation({
  stages = DEFAULT_RENDER_STAGES,
  tickIntervalMs = 220,
  tickAmountMin = 1.5,
  tickAmountMax = 8,
  onComplete,
  onError,
}: UseRenderSimulationOptions = {}) {
  const [state, setState] = useState<RenderState>({
    status: "idle",
    progress: 0,
    currentStageId: null,
    elapsedMs: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const resolveStage = useCallback(
    (progress: number): string | null => {
      const stage = stages.find(
        (s) => progress >= s.range[0] && progress < s.range[1]
      );
      return stage?.id ?? stages[stages.length - 1]?.id ?? null;
    },
    [stages]
  );

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    intervalRef.current = null;
    elapsedRef.current = null;
  }, []);

  const start = useCallback(() => {
    stop();
    startTimeRef.current = Date.now();

    setState({
      status: "rendering",
      progress: 0,
      currentStageId: stages[0]?.id ?? null,
      elapsedMs: 0,
    });

    // Elapsed timer
    elapsedRef.current = setInterval(() => {
      setState((prev) =>
        prev.status === "rendering"
          ? { ...prev, elapsedMs: Date.now() - startTimeRef.current }
          : prev
      );
    }, 500);

    // Progress ticker
    intervalRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.status !== "rendering") return prev;
        const tick =
          tickAmountMin + Math.random() * (tickAmountMax - tickAmountMin);
        const next = Math.min(100, prev.progress + tick);
        const stageId = resolveStage(next);

        if (next >= 100) {
          stop();
          onComplete?.();
          return {
            status: "done",
            progress: 100,
            currentStageId: stageId,
            elapsedMs: Date.now() - startTimeRef.current,
          };
        }
        return { ...prev, progress: next, currentStageId: stageId };
      });
    }, tickIntervalMs);
  }, [stages, tickIntervalMs, tickAmountMin, tickAmountMax, resolveStage, stop, onComplete]);

  const fail = useCallback(
    (message = "Terjadi kesalahan saat render.") => {
      stop();
      setState((prev) => ({
        ...prev,
        status: "error",
        errorMessage: message,
      }));
      onError?.(message);
    },
    [stop, onError]
  );

  const reset = useCallback(() => {
    stop();
    setState({
      status: "idle",
      progress: 0,
      currentStageId: null,
      elapsedMs: 0,
    });
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => () => stop(), [stop]);

  return { state, start, fail, reset, stages };
}

// ─── Helper ─────────────────────────────────────────────────────────────────────
function formatElapsed(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec / 60)}m ${sec % 60}s`;
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function StageList({
  stages,
  currentStageId,
  progress,
}: {
  stages: RenderStage[];
  currentStageId: string | null;
  progress: number;
}) {
  return (
    <ol className="space-y-1.5" aria-label="Tahapan render">
      {stages.map((stage) => {
        const isActive = stage.id === currentStageId;
        const isDone = progress >= stage.range[1];
        return (
          <li key={stage.id} className="flex items-center gap-2 text-xs">
            {isDone ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            ) : isActive ? (
              <Loader2 className="w-3.5 h-3.5 text-brand-500 animate-spin flex-shrink-0" />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 flex-shrink-0" />
            )}
            <span
              className={
                isDone
                  ? "text-emerald-600 dark:text-emerald-400"
                  : isActive
                  ? "text-brand-600 dark:text-brand-400 font-medium"
                  : "text-slate-400 dark:text-slate-500"
              }
            >
              {stage.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
interface RenderProgressProps {
  state: RenderState;
  stages?: RenderStage[];
  /** Whether to show the detailed stage list */
  showStages?: boolean;
  className?: string;
}

export function RenderProgress({
  state,
  stages = DEFAULT_RENDER_STAGES,
  showStages = true,
  className = "",
}: RenderProgressProps) {
  const { status, progress, currentStageId, elapsedMs, errorMessage } = state;

  if (status === "idle") return null;

  const pct = Math.round(progress);

  return (
    <div
      className={`space-y-4 ${className}`}
      role="region"
      aria-label="Status render"
      aria-live="polite"
    >
      {/* ── Status bar ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            {status === "rendering" && (
              <Zap className="w-3.5 h-3.5 text-brand-500 animate-pulse" />
            )}
            {status === "done" && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            )}
            {status === "error" && (
              <XCircle className="w-3.5 h-3.5 text-red-500" />
            )}

            {status === "rendering" && "Sedang merender…"}
            {status === "done" && "Render selesai!"}
            {status === "error" && "Render gagal"}
          </span>

          <span className="flex items-center gap-2 tabular-nums">
            <span className="text-slate-400">{formatElapsed(elapsedMs)}</span>
            <span
              className={
                status === "done"
                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                  : status === "error"
                  ? "text-red-500"
                  : "text-brand-600 dark:text-brand-400"
              }
            >
              {pct}%
            </span>
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progress render"
        >
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out
              ${status === "done"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                : status === "error"
                ? "bg-red-500"
                : "bg-gradient-to-r from-brand-500 to-indigo-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* ── Error message ── */}
      {status === "error" && errorMessage && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-xs">
          <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ── Stage list ── */}
      {showStages && (
        <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            Tahapan
          </div>
          <StageList
            stages={stages}
            currentStageId={currentStageId}
            progress={progress}
          />
        </div>
      )}
    </div>
  );
}

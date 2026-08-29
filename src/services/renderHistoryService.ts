import { INITIAL_RENDER_HISTORY, RenderHistoryItem } from "@/data/mockHistory";

const STORAGE_KEY = "cloud_converter_video_history_v1";


class RenderHistoryService {
  private isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  public getHistory(): RenderHistoryItem[] {
    if (!this.isBrowser()) {
      return INITIAL_RENDER_HISTORY;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Initialize with default mock data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RENDER_HISTORY));
      return INITIAL_RENDER_HISTORY;
    } catch {
      return INITIAL_RENDER_HISTORY;
    }
  }

  public getHistoryItem(id: string): RenderHistoryItem | undefined {
    const list = this.getHistory();
    return list.find((item) => item.id === id);
  }

  public addHistoryItem(item: Omit<RenderHistoryItem, "id" | "createdAt">): RenderHistoryItem {
    const newItem: RenderHistoryItem = {
      ...item,
      id: `job_hls_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`,
      createdAt: new Date().toISOString(),
    };

    const current = this.getHistory();
    const updated = [newItem, ...current];

    if (this.isBrowser()) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("render-history-updated", { detail: newItem }));
      } catch (err) {
        console.error("Failed to save history item", err);
      }
    }

    return newItem;
  }

  public updateStatus(id: string, status: "completed" | "processing" | "failed", progress: number = 100): RenderHistoryItem | null {
    const current = this.getHistory();
    const idx = current.findIndex((item) => item.id === id);
    if (idx === -1) return null;

    current[idx] = {
      ...current[idx],
      status,
      progress,
      completedAt: status === "completed" ? new Date().toISOString() : current[idx].completedAt,
    };

    if (this.isBrowser()) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        window.dispatchEvent(new CustomEvent("render-history-updated"));
      } catch (err) {
        console.error("Failed to update history item", err);
      }
    }

    return current[idx];
  }

  public deleteHistoryItem(id: string): boolean {
    const current = this.getHistory();
    const filtered = current.filter((item) => item.id !== id);

    if (this.isBrowser()) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        window.dispatchEvent(new CustomEvent("render-history-updated"));
      } catch (err) {
        console.error("Failed to delete history item", err);
      }
    }

    return true;
  }

  public clearAll(): boolean {
    if (this.isBrowser()) {
      try {
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new CustomEvent("render-history-updated"));
      } catch (err) {
        console.error("Failed to clear history", err);
      }
    }
    return true;
  }
}

export const renderHistoryService = new RenderHistoryService();

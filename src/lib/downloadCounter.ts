export interface DownloadEvent {
  id: string;
  packageId: string;
  os: "windows" | "mac" | "linux";
  arch: string;
  version: string;
  timestamp: string;
  userAgent?: string;
}

class DownloadCounter {
  private baseStats: Record<"windows" | "mac" | "linux", number> = {
    windows: 14820,
    mac: 6410,
    linux: 3190,
  };

  private recentEvents: DownloadEvent[] = [];

  public increment(os: "windows" | "mac" | "linux", packageId: string, arch: string = "x64", version: string = "1.4.2", userAgent?: string) {
    if (this.baseStats[os] !== undefined) {
      this.baseStats[os] += 1;
    }

    const event: DownloadEvent = {
      id: `dl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      packageId,
      os,
      arch,
      version,
      timestamp: new Date().toISOString(),
      userAgent: userAgent ? userAgent.substring(0, 100) : undefined,
    };

    this.recentEvents.unshift(event);
    if (this.recentEvents.length > 50) {
      this.recentEvents.pop();
    }

    return event;
  }

  public getStats() {
    const total = this.baseStats.windows + this.baseStats.mac + this.baseStats.linux;
    const windowsPct = ((this.baseStats.windows / total) * 100).toFixed(1);
    const macPct = ((this.baseStats.mac / total) * 100).toFixed(1);
    const linuxPct = ((this.baseStats.linux / total) * 100).toFixed(1);

    return {
      totalDownloads: total,
      breakdown: {
        windows: { count: this.baseStats.windows, percentage: `${windowsPct}%` },
        mac: { count: this.baseStats.mac, percentage: `${macPct}%` },
        linux: { count: this.baseStats.linux, percentage: `${linuxPct}%` },
      },
      recentEvents: this.recentEvents.slice(0, 10),
      lastUpdated: new Date().toISOString(),
    };
  }
}

export const downloadCounter = new DownloadCounter();

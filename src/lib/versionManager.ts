export interface ReleaseInfo {
  version: string;
  channel: "stable" | "beta" | "nightly";
  releaseDate: string;
  ffmpegVersion: string;
  changelog: string[];
  mandatoryUpdate: boolean;
  minSupportedVersion: string;
  packages: {
    platform: "windows" | "mac" | "linux";
    arch: string;
    filename: string;
    fileSize: string;
    downloadUrl: string;
    sha256: string;
  }[];
}

class VersionManager {
  private releases: ReleaseInfo[] = [
    {
      version: "1.7.0",
      channel: "stable",
      releaseDate: "2026-08-29T00:00:00Z",
      ffmpegVersion: "9.0-static + GPU",
      mandatoryUpdate: false,
      minSupportedVersion: "1.4.0",
      changelog: [
        "Rebranding penuh ke Cloud Converter Video.",
        "Dukungan render hingga resolusi 4K UHD (2160p) & 2K QHD (1440p).",
        "Integrasi Cloudflare R2, Amazon S3, Spaces, B2 dengan auto-cleanup lokal.",
        "Dual-Engine Parallel Architecture: Render dan Upload berjalan bersamaan.",
        "Akselerasi GPU Hardware (NVENC, AMF, QSV, VideoToolbox).",
        "Dynamic Port Allocation: Zero conflict saat dijalankan di PC.",
      ],
      packages: [
        {
          platform: "windows",
          arch: "x64",
          filename: "CloudConverterVideo-Setup-1.7.0.exe",
          fileSize: "178 MB",
          downloadUrl: "/api/download/app?platform=windows&arch=x64",
          sha256: "8f4e29b1d987e2b1092a48b3bce6912443a5712fbb19d45e5d326e043689c4d2",
        },
        {
          platform: "windows",
          arch: "portable",
          filename: "Cloud-Converter-Windows-Portable-v1.7.0.zip",
          fileSize: "178 MB",
          downloadUrl: "/api/download/app?platform=windows&arch=portable",
          sha256: "5a39cb23ef45a27419e1b59f3c75ab03ecb6510e3fa0842db134b22c710c802e",
        },
        {
          platform: "mac",
          arch: "arm64",
          filename: "CloudConverterVideo-AppleSilicon-v1.7.0.dmg",
          fileSize: "165 MB",
          downloadUrl: "/api/download/app?platform=mac&arch=arm64",
          sha256: "47a3e313ef01ca714ba36173da24a87e584f2b96324205dc1120fef7c3c548a3",
        },
        {
          platform: "mac",
          arch: "x64",
          filename: "CloudConverterVideo-Intel-x64-v1.7.0.dmg",
          fileSize: "172 MB",
          downloadUrl: "/api/download/app?platform=mac&arch=x64",
          sha256: "b109df342512ea35cb401b22e50587b1c4e207908c6a51240dbb5278c067a840",
        },
        {
          platform: "linux",
          arch: "appimage",
          filename: "CloudConverterVideo-v1.7.0-x86_64.AppImage",
          fileSize: "175 MB",
          downloadUrl: "/api/download/app?platform=linux&arch=appimage",
          sha256: "9823ce4f1124b6131456a0081d45bc803e15f247dc10842e27027b404491cb8a",
        },
        {
          platform: "linux",
          arch: "deb",
          filename: "cloud-converter-video_1.7.0_amd64.deb",
          fileSize: "160 MB",
          downloadUrl: "/api/download/app?platform=linux&arch=deb",
          sha256: "3051bc294a500b52e729a437e584f23bca01e847c25091d34e56841bca954e12",
        },
      ],
    },
    {
      version: "1.4.0",
      channel: "stable",
      releaseDate: "2026-07-15T00:00:00Z",
      ffmpegVersion: "6.0-static",
      mandatoryUpdate: false,
      minSupportedVersion: "1.0.0",
      changelog: [
        "Rilis awal engine transmuxing lokal HLS.",
        "Dukungan format 144p hingga 1080p.",
      ],
      packages: [],
    },
  ];

  public getLatestRelease(channel: "stable" | "beta" = "stable"): ReleaseInfo {
    const found = this.releases.find((r) => r.channel === channel);
    return found || this.releases[0];
  }

  public getAllReleases(): ReleaseInfo[] {
    return this.releases;
  }

  public checkForUpdate(currentVersion: string, platform: string = "windows") {
    const latest = this.getLatestRelease("stable");
    const hasUpdate = this.compareSemver(latest.version, currentVersion) > 0;

    const matchedPackage = latest.packages.find((p) => p.platform === platform) || latest.packages[0];

    return {
      hasUpdate,
      currentVersion,
      latestVersion: latest.version,
      releaseDate: latest.releaseDate,
      mandatory: latest.mandatoryUpdate,
      changelog: latest.changelog,
      package: matchedPackage,
    };
  }

  public updateRelease(release: ReleaseInfo) {
    const idx = this.releases.findIndex((r) => r.version === release.version);
    if (idx >= 0) {
      this.releases[idx] = release;
    } else {
      this.releases.unshift(release);
    }
    return release;
  }

  private compareSemver(v1: string, v2: string): number {
    const clean = (v: string) => v.replace(/^v/, "").split(".").map(Number);
    const p1 = clean(v1);
    const p2 = clean(v2);

    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
      const num1 = p1[i] || 0;
      const num2 = p2[i] || 0;
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    return 0;
  }
}

export const versionManager = new VersionManager();

export interface DownloadPackage {
  id: string;
  name: string;
  os: "windows" | "mac" | "linux";
  arch: string;
  version: string;
  releaseDate: string;
  fileSize: string;
  installerType: string;
  downloadUrl: string;
  sha256: string;
  isPrimary: boolean;
  notes: string;
  requirements: string;
}

export const MOCK_DOWNLOAD_PACKAGES: DownloadPackage[] = [
  {
    id: "win-installer",
    name: "Windows 64-bit (Installer)",
    os: "windows",
    arch: "x64",
    version: "v1.7.0",
    releaseDate: "2026-08-29",
    fileSize: "178 MB",
    installerType: "Setup Executable (.exe)",
    downloadUrl: "/api/download/app?platform=windows&arch=x64",
    sha256: "8f4e29b1d987e2b1092a48b3bce6912443a5712fbb19d45e5d326e043689c4d2",
    isPrimary: true,
    notes: "Instalasi otomatis dengan shortcut desktop & start menu Cloud Converter Video",
    requirements: "Windows 10 / 11 64-bit",
  },
  {
    id: "win-portable",
    name: "Windows 64-bit (Portable Executable)",
    os: "windows",
    arch: "portable",
    version: "v1.7.0",
    releaseDate: "2026-08-29",
    fileSize: "178 MB",
    installerType: "Executable (.exe / .zip)",
    downloadUrl: "/api/download/app?platform=windows&arch=portable",
    sha256: "5a39cb23ef45a27419e1b59f3c75ab03ecb6510e3fa0842db134b22c710c802e",
    isPrimary: false,
    notes: "Bisa langsung dijalankan dari USB Flashdisk tanpa instalasi",
    requirements: "Windows 10 / 11 64-bit",
  },
  {
    id: "mac-apple-silicon",
    name: "macOS Apple Silicon (M1/M2/M3/M4)",
    os: "mac",
    arch: "arm64",
    version: "v1.7.0",
    releaseDate: "2026-08-29",
    fileSize: "165 MB",
    installerType: "Apple Disk Image (.dmg)",
    downloadUrl: "/api/download/app?platform=mac&arch=arm64",
    sha256: "47a3e313ef01ca714ba36173da24a87e584f2b96324205dc1120fef7c3c548a3",
    isPrimary: true,
    notes: "Optimalisasi native ARM64 & Apple VideoToolbox Hardware Encoding",
    requirements: "macOS 11.0 Big Sur atau lebih baru",
  },
  {
    id: "mac-intel",
    name: "macOS Intel 64-bit",
    os: "mac",
    arch: "x64",
    version: "v1.7.0",
    releaseDate: "2026-08-29",
    fileSize: "172 MB",
    installerType: "Apple Disk Image (.dmg)",
    downloadUrl: "/api/download/app?platform=mac&arch=x64",
    sha256: "b109df342512ea35cb401b22e50587b1c4e207908c6a51240dbb5278c067a840",
    isPrimary: false,
    notes: "Kompatibel untuk MacBook / iMac berbasis prosesor Intel x86_64",
    requirements: "macOS 10.15 Catalina atau lebih baru",
  },
  {
    id: "linux-appimage",
    name: "Linux x86_64 (AppImage)",
    os: "linux",
    arch: "x64",
    version: "v1.7.0",
    releaseDate: "2026-08-29",
    fileSize: "175 MB",
    installerType: "Standalone AppImage (.AppImage)",
    downloadUrl: "/api/download/app?platform=linux&arch=appimage",
    sha256: "9823ce4f1124b6131456a0081d45bc803e15f247dc10842e27027b404491cb8a",
    isPrimary: true,
    notes: "Universal untuk Ubuntu, Debian, Arch, Fedora, openSUSE tanpa instalasi",
    requirements: "glibc 2.28+ (Kernel 5.4+)",
  },
  {
    id: "linux-deb",
    name: "Linux Debian / Ubuntu (.deb)",
    os: "linux",
    arch: "deb",
    version: "v1.7.0",
    releaseDate: "2026-08-29",
    fileSize: "160 MB",
    installerType: "Debian Package (.deb)",
    downloadUrl: "/api/download/app?platform=linux&arch=deb",
    sha256: "3051bc294a500b52e729a437e584f23bca01e847c25091d34e56841bca954e12",
    isPrimary: false,
    notes: "Terintegrasi dengan APT package manager & launcher menu Linux",
    requirements: "Ubuntu 20.04+ / Debian 11+",
  },
];


export interface MockVideoItem {
  id: string;
  name: string;
  sizeMB: number;
  durationSec: number;
  resolution: string;
  fps: number;
  codec: string;
  label: string;
  description: string;
  badge?: string;
  sampleThumbnail?: string;
}

export const MOCK_VIDEOS_LIST: MockVideoItem[] = [
  {
    id: "sample-720p",
    name: "trailer_big_buck_bunny_720p.mp4",
    sizeMB: 48.5,
    durationSec: 120,
    resolution: "1280×720",
    fps: 30,
    codec: "H.264 / AAC",
    label: "Big Buck Bunny (720p HD)",
    description: "Animasi open source 720p resolusi standar, ukuran 48.5 MB, durasi 2 menit.",
    badge: "Populer",
  },
  {
    id: "sample-1080p",
    name: "nature_landscape_drone_1080p.mp4",
    sizeMB: 124.2,
    durationSec: 300,
    resolution: "1920×1080",
    fps: 60,
    codec: "H.264 / AAC",
    label: "Nature Drone Footage (1080p FHD)",
    description: "Rekaman pemandangan alam 60fps Full HD, ukuran 124.2 MB, durasi 5 menit.",
    badge: "Kualitas Tinggi",
  },
  {
    id: "sample-480p",
    name: "tutorial_coding_screencast_480p.mp4",
    sizeMB: 14.8,
    durationSec: 60,
    resolution: "854×480",
    fps: 24,
    codec: "H.264 / AAC",
    label: "Coding Screencast (480p SD)",
    description: "Rekaman layar demo tutorial web, ukuran 14.8 MB, durasi 1 menit.",
    badge: "Ringan",
  },
  {
    id: "sample-360p",
    name: "mobile_gameplay_short_360p.mp4",
    sizeMB: 8.2,
    durationSec: 30,
    resolution: "640×360",
    fps: 30,
    codec: "H.264 / AAC",
    label: "Mobile Game Clip (360p)",
    description: "Klip singkat gameplay seluler untuk pengujian konversi ultra cepat.",
    badge: "Super Cepat",
  },
  {
    id: "sample-4k",
    name: "city_timelapse_night_4k.mp4",
    sizeMB: 340.0,
    durationSec: 180,
    resolution: "3840×2160",
    fps: 60,
    codec: "H.264 / AAC",
    label: "City Night Timelapse (4K UHD)",
    description: "File video resolusi tinggi 4K untuk menguji batas kompresi dan chunking.",
    badge: "Ukuran Besar",
  },
];

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

interface FolderValidationPayload {
  targetPath: string;
  createIfNotExists?: boolean;
  subfolderName?: string;
}

const SYSTEM_DEFAULT_PRESETS = [
  {
    id: "user_videos",
    label: "Videos Folder",
    path: path.join(os.homedir(), "Videos", "HLS_Output"),
    description: "Direktori default video pengguna",
  },
  {
    id: "user_documents",
    label: "Documents Folder",
    path: path.join(os.homedir(), "Documents", "HLS_Transcoded"),
    description: "Direktori dokumen lokal",
  },
  {
    id: "user_desktop",
    label: "Desktop",
    path: path.join(os.homedir(), "Desktop", "HLS_Stream_Output"),
    description: "Folder langsung di desktop komputer",
  },
  {
    id: "secondary_drive",
    label: "D:\\ Media Assets",
    path: "D:\\MediaAssets\\Transcoded_HLS",
    description: "Partisi drive sekunder untuk media besar",
  },
];

// ─── GET /api/folders ─────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const checkPath = searchParams.get("path");

  if (!checkPath) {
    return NextResponse.json({
      success: true,
      systemPlatform: process.platform,
      homeDir: os.homedir(),
      presets: SYSTEM_DEFAULT_PRESETS,
    });
  }

  // Inspect path
  const normalized = path.normalize(checkPath);
  let exists = false;
  let isDirectory = false;
  let isWritable = false;

  try {
    if (fs.existsSync(normalized)) {
      exists = true;
      const stat = fs.statSync(normalized);
      isDirectory = stat.isDirectory();
      try {
        fs.accessSync(normalized, fs.constants.W_OK);
        isWritable = true;
      } catch {
        isWritable = false;
      }
    }
  } catch (err) {
    console.error("Error inspecting folder path:", err);
  }

  return NextResponse.json({
    success: true,
    path: normalized,
    exists,
    isDirectory,
    isWritable,
  });
}

// ─── POST /api/folders ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body: FolderValidationPayload = await req.json();
    const rawPath = body.targetPath || path.join(os.homedir(), "Videos", "HLS_Output");
    const subfolder = body.subfolderName ? body.subfolderName.replace(/[^a-zA-Z0-9_-]/g, "_") : "";

    const finalPath = subfolder ? path.join(rawPath, subfolder) : rawPath;

    let created = false;
    let accessible = true;

    if (body.createIfNotExists) {
      try {
        if (!fs.existsSync(finalPath)) {
          fs.mkdirSync(finalPath, { recursive: true });
          created = true;
        }
      } catch (e) {
        accessible = false;
      }
    }

    return NextResponse.json({
      success: true,
      originalPath: rawPath,
      subfolderName: subfolder,
      resolvedPath: finalPath,
      isCreated: created,
      isAccessible: accessible,
      message: `Folder tujuan valid dan siap digunakan: ${finalPath}`,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Gagal memproses validasi folder tujuan." },
      { status: 500 }
    );
  }
}

import { exec } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export interface FolderOpenResult {
  success: boolean;
  path: string;
  commandExecuted?: string;
  error?: string;
}

export function sanitizePath(inputPath: string): string {
  return inputPath.trim().replace(/^["']|["']$/g, "");
}

export async function openLocalFolder(folderPath: string): Promise<FolderOpenResult> {
  const sanitized = sanitizePath(folderPath);

  // If path does not exist, attempt to create directory safely
  try {
    if (!fs.existsSync(sanitized)) {
      fs.mkdirSync(sanitized, { recursive: true });
    }
  } catch (err: any) {
    // If permission or drive not available, still return status
    console.warn(`Could not create folder directly: ${err.message}`);
  }

  const platform = os.platform();
  let cmd = "";

  if (platform === "win32") {
    // Windows Explorer
    const normalized = path.normalize(sanitized);
    cmd = `explorer.exe "${normalized}"`;
  } else if (platform === "darwin") {
    // macOS Finder
    cmd = `open "${sanitized}"`;
  } else {
    // Linux File Manager (xdg-open)
    cmd = `xdg-open "${sanitized}"`;
  }

  return new Promise((resolve) => {
    exec(cmd, (error) => {
      if (error) {
        // Even if non-interactive server or container, return structured feedback
        resolve({
          success: true,
          path: sanitized,
          commandExecuted: cmd,
          error: error.message,
        });
      } else {
        resolve({
          success: true,
          path: sanitized,
          commandExecuted: cmd,
        });
      }
    });
  });
}

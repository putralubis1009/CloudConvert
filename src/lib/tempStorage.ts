import fs from "fs";
import path from "path";
import os from "os";

export interface TempWorkspace {
  jobId: string;
  dirPath: string;
  createdAt: number;
  expiresAt: number;
  files: string[];
}

const TEMP_BASE_DIR = path.join(os.tmpdir(), "hls_transcode_workspaces");
const TTL_MS = 60 * 60 * 1000; // 1 hour expiration

// Ensure root temp directory exists
try {
  if (!fs.existsSync(TEMP_BASE_DIR)) {
    fs.mkdirSync(TEMP_BASE_DIR, { recursive: true });
  }
} catch (e) {
  console.warn("Could not create TEMP_BASE_DIR, using fallback memory storage", e);
}

// In-memory index of active workspaces
const workspaceRegistry = new Map<string, TempWorkspace>();

/**
 * Creates an isolated temp workspace directory for a specific render/transcode job
 */
export function createJobWorkspace(jobId: string): TempWorkspace {
  const workspacePath = path.join(TEMP_BASE_DIR, jobId);

  try {
    if (!fs.existsSync(workspacePath)) {
      fs.mkdirSync(workspacePath, { recursive: true });
      fs.mkdirSync(path.join(workspacePath, "segments"), { recursive: true });
    }
  } catch (err) {
    console.error(`Failed to create workspace on disk: ${workspacePath}`, err);
  }

  const now = Date.now();
  const workspace: TempWorkspace = {
    jobId,
    dirPath: workspacePath,
    createdAt: now,
    expiresAt: now + TTL_MS,
    files: [],
  };

  workspaceRegistry.set(jobId, workspace);
  return workspace;
}

/**
 * Writes a temporary file to a job workspace
 */
export function saveTempFile(
  jobId: string,
  relativePath: string,
  content: string | Buffer | Uint8Array
): string {
  const workspace = workspaceRegistry.get(jobId) || createJobWorkspace(jobId);
  const targetPath = path.join(workspace.dirPath, relativePath);
  const parentDir = path.dirname(targetPath);

  try {
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(targetPath, content);
    if (!workspace.files.includes(relativePath)) {
      workspace.files.push(relativePath);
    }
  } catch (err) {
    console.error(`Error saving temp file ${targetPath}:`, err);
  }

  return targetPath;
}

/**
 * Retrieves workspace info by jobId
 */
export function getJobWorkspace(jobId: string): TempWorkspace | undefined {
  return workspaceRegistry.get(jobId);
}

/**
 * Cleans up and deletes a workspace directory
 */
export function cleanupJobWorkspace(jobId: string): boolean {
  const workspace = workspaceRegistry.get(jobId);
  if (!workspace) return false;

  try {
    if (fs.existsSync(workspace.dirPath)) {
      fs.rmSync(workspace.dirPath, { recursive: true, force: true });
    }
    workspaceRegistry.delete(jobId);
    return true;
  } catch (err) {
    console.error(`Error cleaning workspace ${jobId}:`, err);
    return false;
  }
}

/**
 * Purges all expired temporary workspaces
 */
export function purgeExpiredWorkspaces(): number {
  const now = Date.now();
  let purgedCount = 0;

  workspaceRegistry.forEach((ws, jobId) => {
    if (now > ws.expiresAt) {
      cleanupJobWorkspace(jobId);
      purgedCount++;
    }
  });

  return purgedCount;
}

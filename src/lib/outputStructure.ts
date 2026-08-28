/**
 * Standardized HLS Storage & Folder Hierarchy Manager
 * Builds structured directory layouts for single-variant & adaptive multi-bitrate HLS streams.
 */

import { type Resolution, type SegmentDuration, PROFILE_DEFINITIONS } from "./transcodeEngine";

export interface HlsDirectoryLayout {
  rootDir: string;
  isMultiVariant: boolean;
  masterPlaylistPath: string;
  variants: Array<{
    resolution: Resolution;
    dirName: string;
    playlistPath: string;
    segmentsDirPath: string;
    expectedSegmentCount: number;
  }>;
  metadataJsonPath: string;
  readmePath: string;
}

export interface HlsTreeItem {
  name: string;
  type: "file" | "folder";
  sizeHint?: string;
  children?: HlsTreeItem[];
}

/**
 * Builds the standard directory hierarchy map for HLS outputs
 */
export function buildHlsDirectoryHierarchy(params: {
  baseDirectory: string;
  subfolderName?: string;
  isMultiVariant: boolean;
  resolutions: Resolution[];
  videoDurationSec: number;
  segmentDuration: SegmentDuration;
}): HlsDirectoryLayout {
  const {
    baseDirectory,
    subfolderName,
    isMultiVariant,
    resolutions,
    videoDurationSec,
    segmentDuration,
  } = params;

  const rootDir = subfolderName ? `${baseDirectory}\\${subfolderName}` : baseDirectory;
  const segmentCount = Math.max(1, Math.ceil(videoDurationSec / segmentDuration));

  const variants = resolutions.map((res) => {
    const dirName = isMultiVariant ? res : "";
    const prefix = dirName ? `${rootDir}\\${dirName}` : rootDir;

    return {
      resolution: res,
      dirName,
      playlistPath: `${prefix}\\${isMultiVariant ? "stream.m3u8" : `${res}.m3u8`}`,
      segmentsDirPath: `${prefix}\\segments`,
      expectedSegmentCount: segmentCount,
    };
  });

  return {
    rootDir,
    isMultiVariant,
    masterPlaylistPath: `${rootDir}\\master.m3u8`,
    variants,
    metadataJsonPath: `${rootDir}\\transcode_metadata.json`,
    readmePath: `${rootDir}\\README_STREAM.txt`,
  };
}

/**
 * Generates an interactive tree representation of the output directory structure
 */
export function getHlsTreeSummary(layout: HlsDirectoryLayout): HlsTreeItem {
  const rootNode: HlsTreeItem = {
    name: layout.rootDir.split(/[\/\\]/).pop() || "hls_output",
    type: "folder",
    children: [],
  };

  if (layout.isMultiVariant) {
    rootNode.children?.push({
      name: "master.m3u8",
      type: "file",
      sizeHint: "~1.2 KB (Master ABR Playlist)",
    });

    layout.variants.forEach((v) => {
      const variantFolder: HlsTreeItem = {
        name: v.dirName,
        type: "folder",
        children: [
          { name: "stream.m3u8", type: "file", sizeHint: "Index Playlist" },
          {
            name: "segments",
            type: "folder",
            children: [
              { name: "segment_000.ts", type: "file", sizeHint: "MPEG-TS Chunk" },
              { name: `segment_001.ts ... (${v.expectedSegmentCount} files)`, type: "file" },
            ],
          },
        ],
      };
      rootNode.children?.push(variantFolder);
    });
  } else {
    const v = layout.variants[0];
    if (v) {
      rootNode.children?.push({
        name: `${v.resolution}.m3u8`,
        type: "file",
        sizeHint: "VOD Playlist",
      });
      rootNode.children?.push({
        name: "segments",
        type: "folder",
        children: [
          { name: "segment_000.ts", type: "file", sizeHint: "MPEG-TS Chunk" },
          { name: `segment_001.ts ... (${v.expectedSegmentCount} files)`, type: "file" },
        ],
      });
    }
  }

  rootNode.children?.push({
    name: "transcode_metadata.json",
    type: "file",
    sizeHint: "Execution Log",
  });

  return rootNode;
}

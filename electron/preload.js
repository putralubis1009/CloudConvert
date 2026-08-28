const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use IPC
contextBridge.exposeInMainWorld("electronAPI", {
  isDesktop: true,
  platform: process.platform,
  selectFile: () => ipcRenderer.invoke("dialog:openFile"),
  selectFolder: () => ipcRenderer.invoke("dialog:openFolder"),
  openFolderInExplorer: (folderPath) => ipcRenderer.invoke("shell:openPath", folderPath),
  getAppVersion: () => ipcRenderer.invoke("app:getVersion"),
});

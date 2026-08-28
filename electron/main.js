const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const net = require("net");

let mainWindow = null;
let serverInstance = null;

function getAvailablePort(preferredPort = 3000) {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.once("error", () => {
      resolve(getAvailablePort(preferredPort + 1));
    });
    s.once("listening", () => {
      s.close(() => resolve(preferredPort));
    });
    s.listen(preferredPort, "127.0.0.1");
  });
}

// Sleek loading HTML data URI while Next.js prepares
const LOADING_HTML = `data:text/html;charset=utf-8,${encodeURIComponent(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      background: #090d16;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      user-select: none;
    }
    .spinner {
      width: 44px;
      height: 44px;
      border: 3px solid rgba(99, 102, 241, 0.2);
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.9s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .title {
      font-size: 15px;
      font-weight: 700;
      margin-top: 20px;
      background: linear-gradient(135deg, #ffffff, #a5b4fc, #67e8f9);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: 0.5px;
    }
    .subtitle {
      font-size: 11px;
      color: #64748b;
      margin-top: 6px;
    }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <div class="title">Cloud Converter Video</div>
  <div class="subtitle">Memulai Engine Studio...</div>
</body>
</html>
`)}`;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 900,
    minHeight: 650,
    title: "Cloud Converter Video",
    backgroundColor: "#090d16",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
  });

  // Load loading splash immediately
  mainWindow.loadURL(LOADING_HTML);

  try {
    let port = 3000;
    if (app.isPackaged) {
      port = await getAvailablePort(3000);
      const startNextServer = require("./server");
      const { server } = await startNextServer(port);
      serverInstance = server;
    }

    const appUrl = `http://127.0.0.1:${port}/desktop`;
    console.log("[Electron] Navigating to:", appUrl);

    // Load actual app page
    mainWindow.loadURL(appUrl);

    // Auto-retry if initial connection takes a moment
    mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
      console.log(`[Electron] Page did fail load (${errorCode}: ${errorDescription}), retrying...`);
      setTimeout(() => {
        if (mainWindow) mainWindow.loadURL(appUrl);
      }, 1000);
    });

  } catch (err) {
    console.error("[Electron] Failed to start server:", err);
    if (mainWindow) {
      dialog.showErrorBox(
        "Gagal Memulai Cloud Converter Video",
        `Terjadi kendala saat memulai server aplikasi:\n\n${err.message || err}`
      );
    }
  }

  // Developer Tools shortcut: F12 or Ctrl+Shift+I
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.key === "F12" || (input.control && input.shift && input.key.toLowerCase() === "i")) {
      mainWindow.webContents.toggleDevTools();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle("dialog:openFile", async () => {
  if (!mainWindow) return null;
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: "Pilih File Video",
    filters: [{ name: "Video Files", extensions: ["mp4", "mkv", "mov", "avi", "webm", "m4v"] }],
    properties: ["openFile", "multiSelections"],
  });
  return canceled ? null : filePaths;
});

ipcMain.handle("dialog:openFolder", async () => {
  if (!mainWindow) return null;
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: "Pilih Folder Output",
    properties: ["openDirectory", "createDirectory"],
  });
  return canceled ? null : filePaths[0];
});

ipcMain.handle("shell:openPath", async (_, targetPath) => {
  return await shell.openPath(targetPath);
});

ipcMain.handle("app:getVersion", () => {
  return app.getVersion();
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("will-quit", () => {
  if (serverInstance) {
    try {
      serverInstance.close();
    } catch {}
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});


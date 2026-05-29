const { app, BrowserWindow, net, protocol, shell } = require("electron");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

protocol.registerSchemesAsPrivileged([
  {
    scheme: "proofpack",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: false
    }
  }
]);

const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");
const dev = process.env.VITE_DEV_SERVER_URL || process.env.ELECTRON_RENDERER_URL;

function asset(request) {
  const url = new URL(request.url);
  const rel = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const file = path.normalize(path.join(dist, rel));
  if (!file.startsWith(dist)) return new Response("Forbidden", { status: 403 });
  return net.fetch(pathToFileURL(file).toString());
}

async function window() {
  const win = new BrowserWindow({
    width: 1440,
    height: 980,
    minWidth: 980,
    minHeight: 720,
    backgroundColor: "#0d0d0b",
    title: "Proof Pack",
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: true
    }
  });

  win.once("ready-to-show", () => win.show());
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://") || url.startsWith("mailto:")) void shell.openExternal(url);
    return { action: "deny" };
  });

  if (dev) await win.loadURL(dev);
  else await win.loadURL("proofpack://app/index.html");
}

app.whenReady().then(async () => {
  protocol.handle("proofpack", asset);
  await window();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) void window();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

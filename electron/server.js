const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const path = require("path");

function startNextServer(port) {
  return new Promise((resolve, reject) => {
    const dir = path.join(__dirname, "..");
    const dev = false;
    
    console.log("[Next.js] Starting custom server at dir:", dir, "on port:", port);
    
    const app = next({ dev, dir });
    const handle = app.getRequestHandler();

    app.prepare().then(() => {
      const server = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
      });

      server.on("error", (err) => {
        console.error("[Next.js] Server error:", err);
        reject(err);
      });

      server.listen(port, "127.0.0.1", () => {
        console.log(`[Next.js] Server ready on http://127.0.0.1:${port}`);
        resolve({ port, server });
      });
    }).catch(reject);
  });
}

module.exports = startNextServer;


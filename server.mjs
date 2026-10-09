import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createBareServer } from "@tomphttp/bare-server-node";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const bareServer = createBareServer("/bare/");

app.use((_req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

// The Ultraviolet worker lives in /uv/ but needs permission to control /service/.
app.use(["/uv/sw.js", "/uv/uv.sw.js"], (_req, res, next) => {
  res.setHeader("Service-Worker-Allowed", "/");
  next();
});

app.get("/uv/uv.config.js", (_req, res) => {
  res.type("application/javascript").send(`self.__uv$config = {
    prefix: "/service/",
    bare: "/bare/",
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: "/uv/uv.handler.js",
    bundle: "/uv/uv.bundle.js",
    config: "/uv/uv.config.js",
    sw: "/uv/uv.sw.js"
  };`);
});

// Bare HTTP requests must reach the proxy server before the static-file handler.
app.use((req, res, next) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeRequest(req, res);
    return;
  }
  next();
});

// Serve Lolite's own static files and use the npm package for Ultraviolet runtime files.
app.use(express.static(__dirname));
app.use("/uv/", express.static(uvPath));
app.get("/service/*path", (_req, res) => {
  res.status(404).type("text/plain").send("Ultraviolet service requests must be intercepted by /uv/sw.js. Register the service worker and retry.");
});

export default app;

// Vercel invokes the exported Express app as a serverless function. Local Node
// deployments still start a normal HTTP server with Bare/WebSocket upgrade support.
if (!process.env.VERCEL) {
  const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Lolite OS listening on http://localhost:${server.address().port}`);
  });
  server.on("upgrade", (req, socket, head) => {
    if (bareServer.shouldRoute(req)) bareServer.routeUpgrade(req, socket, head);
  });
}

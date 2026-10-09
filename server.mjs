import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { scramjetPath } from "@mercuryworkshop/scramjet/path";
import { createBareServer } from "@tomphttp/bare-server-node";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import wisp from "wisp-server-node";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const dirOf = (specifier) => path.dirname(require.resolve(specifier));
const app = express();
const bareServer = createBareServer("/bare/");

app.use((_req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

// The Ultraviolet worker lives in /uv/ but needs permission to control /service/.
app.use("/uv/sw.js", (_req, res, next) => {
  res.setHeader("Service-Worker-Allowed", "/");
  next();
});

app.get("/uv/uv.config.js", (_req, res) => {
  res.type("application/javascript").send(`self.__uv$config = {
    prefix: "/service/",
    bare: "/bare/",
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: "/uv/handler.js",
    bundle: "/uv/uv.bundle.js",
    config: "/uv/uv.config.js",
    sw: "/uv/sw.js"
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

app.use("/scram/", express.static(scramjetPath));
app.use("/utils/", express.static(dirOf("@mercuryworkshop/scramjet-utils")));
app.use("/controller/", express.static(dirOf("@mercuryworkshop/scramjet-controller")));
app.use("/baremod/", express.static(dirOf("@mercuryworkshop/bare-transport")));
// Serve Lolite's own uv.config.js first, then fill in the runtime bundle from npm.
app.use(express.static(__dirname));
app.use("/uv/", express.static(uvPath));
app.use("/epoxy/", express.static(epoxyPath));
app.use("/baremux/", express.static(baremuxPath));
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
    if (req.url?.startsWith("/wisp/")) {
      wisp.routeRequest(req, socket, head);
      return;
    }
    if (bareServer.shouldRoute(req)) bareServer.routeUpgrade(req, socket, head);
  });
}

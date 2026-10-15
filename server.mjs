import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createBareServer } from "@tomphttp/bare-server-node";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import * as wisp from "wisp-server-node";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const bareServer = createBareServer("/bare/");

const CHAT_AUTH_URL = "https://rztxhwfdbrzuhdqpegar.supabase.co/auth/v1/user";
const CHAT_PUBLIC_KEY = "sb_publishable_I3eswNK0zu8qQvDp1Kcfbw_zZzzi18u";

// Browser accounts are verified against Supabase Auth, not a local password list.
app.post("/api/browser/session", async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const origin = req.get("origin");
  if (origin) {
    try {
      const source = new URL(origin);
      if (source.host !== req.get("host") || !["https:", "http:"].includes(source.protocol))
        return res.status(403).json({ authenticated: false, error: "Origin not allowed" });
    } catch {
      return res.status(403).json({ authenticated: false, error: "Invalid origin" });
    }
  }
  const authorization = req.get("authorization") || "";
  if (!/^Bearer [A-Za-z0-9._-]+$/.test(authorization) || authorization.length > 4096)
    return res.status(401).json({ authenticated: false });
  try {
    const check = await fetch(CHAT_AUTH_URL, {
      headers: { apikey: CHAT_PUBLIC_KEY, Authorization: authorization },
      signal: AbortSignal.timeout(7000)
    });
    if (!check.ok) return res.status(401).json({ authenticated: false });
    const user = await check.json();
    if (!user?.id) return res.status(401).json({ authenticated: false });
    return res.json({ authenticated: true, userId: user.id });
  } catch {
    return res.status(503).json({ authenticated: false, error: "Account verification temporarily unavailable" });
  }
});
app.delete("/api/browser/session", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({ authenticated: false });
});

// Public relays need more than a login screen: never expose these open transports.
app.use((req, res, next) => {
  const url = req.originalUrl.split("?")[0];
  if (bareServer.shouldRoute(req) || /^\/(?:wisp|service)(?:\/|$)/.test(url) || url.startsWith("/~/sj/"))
    return res.status(403).type("text/plain").send("Proxy transport is disabled on this host.");
  next();
});

app.get("/healthz", (_req, res) => res.json({
  ok: true, service: "lolite-os", accounts: "supabase", browserLogin: true, proxyTransport: "disabled"
}));

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

// Serve Scramjet runtime and transport files from the installed npm packages.
app.use("/scramjet", express.static(path.join(__dirname, "node_modules/@mercuryworkshop/scramjet/dist")));
app.use("/controller", express.static(path.join(__dirname, "node_modules/@mercuryworkshop/scramjet-controller/dist")));
app.use("/clients/epoxy", express.static(path.join(__dirname, "node_modules/@mercuryworkshop/epoxy-transport/dist")));
app.get("/sw.js", (_req, res) => {
  res.setHeader("Service-Worker-Allowed", "/");
  res.type("application/javascript").send('importScripts("/controller/controller.sw.js");\naddEventListener("fetch", (event) => { if ($scramjetController.shouldRoute(event)) event.respondWith($scramjetController.route(event)); });');
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
  server.on("upgrade", (_req, socket) => {
    // No unauthenticated WebSocket relays.
    socket.destroy();
  });
}

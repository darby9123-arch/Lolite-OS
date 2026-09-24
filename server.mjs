import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { scramjetPath } from "@mercuryworkshop/scramjet/path";
import { createBareServer } from "@tomphttp/bare-server-node";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const dirOf = (specifier) => path.dirname(require.resolve(specifier));

const app = express();

app.use((_req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

app.use("/scram/", express.static(scramjetPath));
app.use("/utils/", express.static(dirOf("@mercuryworkshop/scramjet-utils")));
app.use("/controller/", express.static(dirOf("@mercuryworkshop/scramjet-controller")));
app.use("/baremod/", express.static(dirOf("@mercuryworkshop/bare-transport")));
app.use(express.static(__dirname));

const bareServer = createBareServer("/bare/");

const handler = (req, res) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeRequest(req, res);
    return;
  }
  app(req, res);
};

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Lolite OS listening on http://localhost:${server.address().port}`);
});

server.on("upgrade", (req, socket, head) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeUpgrade(req, socket, head);
  }
});

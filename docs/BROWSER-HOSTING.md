# Browser hosting and deployment

## GitHub Pages limitation

GitHub Pages cannot run Node.js, HTTP proxy endpoints, or WebSocket upgrades. The project site is also mounted below `/Lolite-OS/`, while the browser service workers intentionally use origin-root routes. GitHub Pages cannot host working Ultraviolet or Scramjet proxy services by itself.

## What was added

- `server.mjs` serves Ultraviolet assets and its Bare HTTP proxy.
- `server.mjs` serves Scramjet runtime/controller/Epoxy transport files from installed npm packages.
- `/sw.js` routes Scramjet requests through its service worker.
- `/wisp/` WebSocket upgrades are routed to Wisp for Scramjet's Epoxy transport.
- `/healthz` provides a deployment health check.
- `Dockerfile` lets you deploy the Node server on a host that supports persistent Node processes and WebSockets.

## Deploy the full browser host

Use a Docker-capable Node host that supports WebSocket upgrades (for example, a Render web service or Railway service). Connect the `darby9123-arch/Lolite-OS` repository and deploy from its root using the included Dockerfile. The app listens on the `PORT` environment variable.

After deployment, check `https://YOUR-HOST/healthz` and verify these runtime files return HTTP 200:

- `/uv/uv.bundle.js`
- `/uv/uv.handler.js`
- `/uv/uv.sw.js`
- `/scramjet/scramjet.js`
- `/scramjet/scramjet.wasm`
- `/controller/controller.api.js`
- `/controller/controller.inject.js`
- `/controller/controller.sw.js`
- `/clients/epoxy/index.js`

Then open the hosted Lolite desktop, launch each browser, and test an HTTPS website. A successful asset check alone does not prove the proxy works.

## Existing Vercel deployment

The existing Vercel site may still serve Ultraviolet HTTP endpoints, but Vercel Functions are not a suitable host for the persistent Wisp WebSocket service used by Scramjet. Keep Vercel for the current site/API if desired, but deploy the full browser-capable Node server separately and use that host for Scramjet. Do not expect GitHub Pages or the current Vercel function deployment to provide the full Scramjet transport.

## Security note

A public web proxy can be abused. Before advertising the Node host publicly, put appropriate access controls, usage limits, and monitoring in front of proxy routes. Wisp can relay network traffic and should not be exposed as an unrestricted general-purpose relay.

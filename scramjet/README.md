# Lolite OS — Scramjet integration

Lolite Browser is being wired to the current MercuryWorkshop Scramjet architecture instead of the old iframe-only browser.

## What is included

- Scramjet 2.x core and controller packages
- Bare transport, which uses normal HTTP rather than a WebSocket transport
- Bare server for the proxy endpoint
- A dedicated server entry point for serving the Scramjet runtime assets
- Lolite Browser integration hooks

The Scramjet runtime requires the Node dependencies to be installed before running the server.

## Run locally

```bash
pnpm install
pnpm start
```

The browser UI remains the normal Lolite OS page. The Scramjet runtime is served from the same origin so its service worker can control the browser window.

## Important

Scramjet is not just a JavaScript file that can be dropped into a static HTML page. Its current architecture uses the core rewriter, controller, service worker, transport, and server-side proxy pieces together. The Lolite integration keeps those pieces separated so the browser does not silently fall back to the old cross-origin iframe.


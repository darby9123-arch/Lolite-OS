# Lolite OS browser hosting

## Why the GitHub Pages copy cannot run the browsers

The GitHub Pages URL is a project site under `/Lolite-OS/`. GitHub Pages serves static files; it does not run `server.mjs`, Express, the Bare proxy, or a WebSocket/Wisp proxy. The current Ultraviolet code also requests root paths such as `/uv/...`, which are outside the project-site prefix on GitHub Pages.

This means the GitHub Pages copy cannot provide working proxied browsing by itself. Adding browser UI or copying the service-worker script into the repository does not create the server-side proxy.

## Recommended hosting layout

1. Keep GitHub Pages as the static preview if you want, but use the deployed Node-backed Lolite site for the actual browser apps: https://lolite-os.vercel.app/
2. Ultraviolet needs its runtime files served from the same origin as its service worker and a working Bare backend. The existing `server.mjs` is the intended Node-backed route for `/uv/`, `/service/`, and `/bare/`. A long-running Node host is the safer option if WebSocket upgrades are needed.
3. Scramjet needs its built runtime and controller assets, a service worker, a compatible transport client, and a reachable Wisp WebSocket endpoint. The current `core/scramjet.js` is only a diagnostic adapter; it is not a Scramjet controller or proxy implementation. The server must not advertise Scramjet as working until those pieces are deployed and initialized.
4. For both browsers to work reliably, the simplest architecture is to serve the Lolite frontend and browser runtime from one Node-backed origin and run the required proxy transports there (or configure the runtime to use a separately hosted, HTTPS/WSS-enabled proxy endpoint with the necessary cross-origin permissions).

## Current status

- Ultraviolet: the browser UI attempts to register the service worker and use the configured runtime, but the GitHub Pages copy cannot reach a same-origin proxy backend.
- Scramjet: the current UI reports missing runtime/controller pieces. It does not yet browse websites.
- The browser launchers now link GitHub Pages users to the Node-backed Lolite deployment rather than implying that static hosting can proxy sites.

## Verify after deployment

- Open the Node-backed deployment and check that `/uv/uv.bundle.js`, `/uv/uv.sw.js`, and `/bare/` are served by the application.
- Register the Ultraviolet service worker and test a simple HTTPS destination.
- For Scramjet, verify the actual controller bundle, Scramjet runtime/WASM, service-worker route, and Wisp WebSocket endpoint before testing a destination.
- Test on a fresh browser session after deployment, because stale service-worker registrations can keep old behavior alive.

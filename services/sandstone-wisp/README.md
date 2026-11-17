# Lolite Sandstone Wisp (restricted project relay)

This is a narrow compatibility service for testing Sandstone's original Wisp transport against **Lolite's own GitHub Pages host only**. It is **not an unrestricted browser proxy**.

- Endpoint: `wss://<your-railway-domain>/wisp/`.
- Health: `https://<your-railway-domain>/healthz`.
- Only `https://darby9123-arch.github.io` and local development pages can initiate browser upgrades.
- TCP only, destination hostname `darby9123-arch.github.io` only, port 443 only.
- Direct-IP, loopback, private-address and UDP connections are disabled; connections are rate-limited.
- The original Sandstone HTML remains untouched. The Lolite window bridge sets its Wisp URL using Sandstone's **existing Options control**.
- The relay does not remove school, workplace, ISP or site-level access restrictions.

Node 20+; `npm install && npm test && npm start`. In Railway, set the service root directory to `/services/sandstone-wisp`, start command `npm start`, and healthcheck `/healthz`. Use a public Railway domain to obtain WSS.

Uses `@mercuryworkshop/wisp-js` (LGPL-3.0-or-later). See upstream license and notices for redistribution requirements.

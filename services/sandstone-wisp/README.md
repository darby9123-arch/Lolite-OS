# Lolite Sandstone Wisp (restricted project relay)

This is a narrow compatibility service for testing Sandstone's original Wisp transport against **Lolite's own GitHub Pages host only**. It is **not an unrestricted browser proxy**.

- Authenticated ticket request: `POST https://<your-railway-domain>/api/ticket`, with `Authorization: Bearer <Supabase access token>` from a signed-in Lolite account.
- WebSocket endpoint: `wss://<your-railway-domain>/wisp/?ticket=<one-time-ticket>`.
- Health: `https://<your-railway-domain>/healthz`.
- Tickets are valid for 30 seconds, single use, and bound to the allowed Lolite origin. Requests without valid account credentials receive HTTP 401.
- Only `https://darby9123-arch.github.io` and local development pages can initiate browser upgrades.
- TCP only, destination hostname `darby9123-arch.github.io` only, port 443 only.
- Direct-IP, loopback, private-address and UDP connections are disabled; connections are rate-limited.
- The original Sandstone HTML remains untouched. Before connecting a Wisp-capable client, it must request a fresh ticket from the relay using a **verified Lolite session**; merely entering the relay hostname in Sandstone's original Options panel is insufficient.
- **Current status:** Railway deployment was blocked by an expired trial. No Railway domain or live browser integration is configured. Browser WebSocket clients must acquire a new ticket for each connection. The desktop's account-required login alone is not a substitute for this server-side check.
- The relay does not remove school, workplace, ISP or site-level access restrictions.

Node 20+; `npm install && npm test && npm start`. In Railway, set the service root directory to `/services/sandstone-wisp`, start command `npm start`, and healthcheck `/healthz`. Use a public Railway domain to obtain WSS.

Uses `@mercuryworkshop/wisp-js` (LGPL-3.0-or-later). See upstream license and notices for redistribution requirements.

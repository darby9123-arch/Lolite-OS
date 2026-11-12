# UV-Static in Lolite

Lolite bundles the runtime from [t9lat22/UV-Static](https://github.com/t9lat22/UV-Static), commit `54534367b297b9b273988453bddbb87d701a8e9d`. Credit: **TIW-UV-Static**, NC Gaming and kwazeh; Ultraviolet by Titanium Network. The upstream README is retained in `browser/uv-static/UPSTREAM-README.md`.

The bundle and handler are unchanged. Worker imports and configuration are relative. The directory is deployed on the separate static origin `https://lolite-uv-static.vercel.app/` (Vercel project `prj_rAEBcPJf0asmqjQQysW2kfDiNFcN`). This works with Lolite hosted on either Vercel or GitHub Pages. Lolite keeps its existing browser UI and account guard. The source website's trackers and unrelated UI scripts are not included.

**Setup:** open Ultraviolet Browser → Connection settings → enter an HTTPS Bare v1/v2 relay URL → Save relay → Go. Relay choices are saved with the current Lolite account's settings. The relay receives the websites requested through it; do not put credentials in its URL.

The upstream default `https://bare.benrogo.net/` returned an HTML “Site Unavailable” page during verification, not a Bare manifest. The integration is installed, but proxy browsing needs a working compatible relay. A failed connection stays visible with an actionable error; Direct and Open in tab remain available. End-to-end proxy traffic has not been verified against a working relay.

The worker runs only on the separate proxy origin and handles only its `service/` routes. It cannot intercept Lolite account or game requests. The proxy iframe can use its own origin's service workers and storage; the same-origin policy prevents it from reading the Lolite desktop. Direct and home frames remain opaque. The bootstrap refuses to run under a same-origin parent or Lolite's own subdirectory. No Lolite account tokens are sent to the proxy origin, and the server's public Bare/Wisp transports remain disabled.

To update the isolated host, deploy only the files in `browser/uv-static/` as the root of project `lolite-uv-static`. Do not deploy account code on that origin. The initial deployment contains those eight reviewed static files and no server relay.

Run `node --test tests/uv-static.test.cjs tests/game-account-browser-bugfixes.test.cjs` to verify setup, isolation, invalid relay handling, and app wrapper compatibility.

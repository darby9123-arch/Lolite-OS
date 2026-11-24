# Lolite browser apps and hosting

Ultraviolet, Scramjet, and Sandstone open regular websites directly by default after Lolite sign-in. The same controls work in Desktop Style and Browsing Style. Back and Forward track addresses entered through the app. Reload reloads the current address.

Searches open in a regular tab. Sites that restrict embedding can be visited with **Open in tab**. Lolite leaves each site's framing policy in effect.

[How sites control embedding](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors)

## Browser modes

- **Ultraviolet** offers its original UV-Static integration under **UV-Static connection**. It needs a compatible configured Bare relay. The isolated UV-Static host opens in a separate tab after a connection check. Relay errors are shown in Connection settings while the direct controls stay available.
- **Scramjet** uses direct browsing on the hosted Lolite site. Its rewritten browsing mode depends on a separately configured Scramjet runtime and transport.
- **Sandstone** opens its original HTML bundle on the hosted site. **Original mode** gives access to its original controls and renderer, which depend on a compatible authorised Wisp service for proxy pages. The installed Windows build uses the direct browser controls within the app.

## Hosting

GitHub Pages can serve the browser apps and direct navigation as static files. On Vercel and Node, the account session route validates Lolite's existing Supabase identity, and `/healthz` reports the host's transport status. The published Lolite builds have disabled public proxy transports. Direct browsing makes requests from the visitor's browser.

The repository's restricted Sandstone compatibility relay permits only Lolite's own GitHub Pages host. See [the relay service notes](../services/sandstone-wisp/README.md) for its current deployment status.

## Verification

Run `node --test tests/browser-navigation.test.cjs tests/uv-static.test.cjs tests/sandstone-browser.test.cjs` after installing the test dependencies with `npm ci --prefix tests/chat`. For a browser smoke test, sign in, open each browser, and load a page that allows embedding. Also check that a page which forbids embedding opens in a normal tab. A visible renderer or a successful relay check alone does not verify proxy playback.

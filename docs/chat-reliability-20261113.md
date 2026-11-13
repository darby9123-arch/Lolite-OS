# Chat and calls reliability — 13 November 2026

Chat background updates now retain the composer, caret, unchanged message nodes, open message menus and unfinished dialogs. Realtime subscriptions are reused until the account or conversation changes. A delayed load cannot replace a different conversation's messages. Temporary refresh errors keep the current chat usable and expose Retry. Sending is guarded per conversation, including across rerenders; newer drafts remain intact. Switching accounts clears the old composer and drafts before rendering, so unfinished text cannot pass between accounts.

The chat uses larger message text, sidebar labels and send controls. The search bar has a close control. The primary conversation action is Call; group room joining remains on the Calls page. A minimized call sits above the composer when its chat is open. Incoming call dialogs fit narrow windows, and call controls are retained during routine status updates.

Voice joins share one pending operation. Cancelling before microphone permission completes closes any late stream. Closed-session callbacks cannot affect a replacement session. Early signalling waits for presence sync, private broadcasts request acknowledgements, and failed tracking/signalling is surfaced. Peers use polite collision handling and bounded ICE recovery with Retry audio after failure. Call status and its timer follow the actual peer connection. All-declined/all-left calls end; stale status polls cannot terminate a new call. Screen capture is stopped if its call ends while the picker is open.

## Verification

Run `npm ci --prefix tests/chat --ignore-scripts` followed by `npm test --prefix tests/chat` for 19 isolated DOM and lifecycle regression tests. The test package has its own lockfile and does not require the game/proxy server dependencies. GitHub Actions runs this suite for Chat changes.

Twenty-seven existing account, shared game card, interface and Lolite 4.x checks also passed. Changed scripts passed syntax checks and the patch passed `git diff --check`.

Serve the repository over localhost, then open `tests/chat/browser-fixture.html` for a two-peer browser fixture. It uses fictional in-memory accounts and generated silent audio; it never signs in to production, reads real conversations or calls real people. Browser checks covered incoming calls, answering, signalling negotiation, minimizing, 350px layouts, draft preservation and release of both audio streams on hangup. Signalling reached stable offer/answer states, but the browser environment did not establish an audio transport. End-to-end audio between real devices has therefore not been verified.

The deployment still has the existing STUN-only ICE configuration. A production TURN service with properly managed credentials is a separate requirement for networks that cannot establish a direct connection. No public relay credentials were invented or embedded, and no auth or database policies were changed.

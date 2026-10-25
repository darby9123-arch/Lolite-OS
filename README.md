## Launch Lolite OS

- **[Download Lolite OS for Windows](https://github.com/darby9123-arch/Lolite-OS/releases)** — install `LoliteOS-Setup.exe` from a desktop release; includes the app and dedicated launcher
- **[Windows build, update and distribution guide](docs/DESKTOP.md)**
- **[Launch Lolite OS on GitHub Pages](https://darby9123-arch.github.io/Lolite-OS/)** — play and use Lolite OS in your browser
- **[Open Lolite OS on Vercel](https://lolite-os.vercel.app/)** — alternate hosted version

# Lolite OS

**Browser hosting note:** GitHub Pages is a static preview and cannot run the proxy backend. Scramjet also needs a persistent WebSocket-capable Node host. See [Browser Hosting Requirements](docs/BROWSER-HOSTING.md); the repository now includes a `Dockerfile` and `render.yaml` for that host.

The Vercel version includes Ultraviolet runtime files and the Bare HTTP endpoint, but its service worker currently fails in browser testing. Scramjet's proxy runtime is unavailable on Vercel. Both browser apps now offer a standard, non-proxy embedded browsing mode for sites that permit framing, with an Open in tab option.

A Lolite-branded browser desktop with a red and charcoal interface, apps, games, files, live wallpapers and a responsive desktop or browser workspace.

## Update Log

### Lolite OS 3.18.0 — Live videos & soundscape — 2026-10-25
- Added **24 MotionBGS live video wallpapers**: GTA IV/V/VI, Minecraft, cars, anime, space, nature and rainy city scenes. The full collection now has 41 wallpapers, including 32 live options.
- Added wallpaper search, category counts, source links, HD and Data saver quality, playback status and retry. Videos stream from MotionBGS and require internet; the existing 17 local wallpapers remain available offline.
- Only the selected video is loaded. Switching releases its player, and live motion pauses in hidden tabs, Browser style and reduced motion. Failed HD playback tries the published lightweight video once and retains the poster if unavailable.
- Expanded to **36 original system sounds** for windows, snapping, menus, buttons, switches, navigation, files, notes, calculator results, notifications, themes, wallpaper changes and fullscreen. Optional typing and hover sounds have separate switches.
- Added seven sound categories, a complete preview library, saved preferences and master volume/mute. Sound effects are grouped per action, rate limited and capped at 12 voices; game/call audio stays independent.
- Validation: 30 automated tests; all 24 HD sources played in Chromium inside the desktop. See [Live wallpapers & sounds checks](docs/LIVE-WALLPAPERS-SOUNDS.md).

### Lolite OS 3.17.0 — Windows-style desktop — 2026-10-25
- Rebuilt window management: clicking a background app raises it, taskbar buttons minimise and restore, and maximising, dragging, resizing and snapping use the available desktop area correctly.
- Added a centred Start menu with app search, pinned apps and recent apps; a full-width taskbar; Quick settings for sounds and motion; a month calendar; desktop context menu; and Show desktop.
- Added interruptible window opening, closing, minimise/restore and snap transitions. Reduce Motion immediately settles active transitions and disables further motion.
- Startup remembers Desktop or Browser workspace and no longer forces the chooser and Home window on every launch. Home retains the latest theme gallery and uses a compact app dashboard.
- Restored blank Calculator and Quick Notes windows with working arithmetic, keyboard input, saved notes and access to notes from earlier versions.
- Kept the red/charcoal default, existing wallpapers, live scenes, sounds, app icons, app data and alternative themes. Desktop icons select on click and open on double-click; Enter/Space and touch remain supported.
- Validation: 21 automated checks plus Chromium checks of Start/search, taskbar toggling, focus, snapping, both workspace modes, theme switching, notes persistence, calculator results and a 390px layout. See [Desktop refresh checks](docs/DESKTOP-REFRESH.md).

### Lolite OS 3.16.0 — Crimson — 2026-10-25
- A complete red and charcoal interface refresh across Desktop and Browser Lolite, Home, Start, search, window controls, stores, Files, Chat, Academy, Quests and creative tools. Manrope and Sora typography, flatter surfaces, clearer hierarchy and less gradient.
- New **Lolite Crimson** default in both theme pickers. All five earlier layouts in each mode remain available. The upgrade changes presentation preferences once; accounts, files, installed apps and game data are preserved.
- Redesigned local vector app icons with a consistent outline style and muted identifying colours.
- **17 local wallpapers, including 8 live scenes**: embers, city rain, alpine snow, stars, tides, flowing contours, meteors and desert dust. Includes original Crimson Dunes artwork, image uploads, category filters, remembered selections and a motion toggle.
- Live scenes use a single 24 fps capped canvas loop, capped pixel density, and pause in hidden tabs, Browser mode and reduced motion. Existing wallpaper IDs and purchased wallpaper selections still resolve.
- Original system tones for startup, app opening/closing, minimise/restore and notifications. Adjustable volume, mute, and six sound previews; audio begins only after interaction.
- New Settings sections for Appearance, Wallpapers, Sounds, and Motion & cursors. Short app-opening fades replace scaling and bouncy interactions. Removed the duplicate legacy welcome overlay.
- Validation: 8 automated lifecycle/persistence/syntax checks; Chromium UI checks of startup, both layouts, wallpaper selection, sound controls, reload persistence and search. Details: [Crimson notes](docs/CRIMSON.md).

### Lolite UI Refinement — 2026-10-23 (review branch)
- Introduced **Manrope** for OS body/interface text and **Sora** for headings and product identity. Both load from Google Fonts, with system fallbacks.
- Added `core/refined-ui.css`, a shared, presentation-only design layer for Desktop and Browser Lolite, launchers, window chrome, Start, search, notifications, Home, Settings, App Store, Game Store, Files, Chat, Academy, Quests, Paint, Notes, Clock, Terminal, Calculator, wallpaper tools, and browser utilities.
- Removed unnecessary hero decorations, purple-gradient accents, overlapping glass/card effects, excessive corner rounding, and hover movement in common interfaces. Improved type hierarchy, controls, borders, focus visibility, active states, and spacing.
- Integrated matching `games/life-rp/refined.css` into Life RP's separate iframe.
- **Preserves** the five Desktop themes and five Browser themes, apps, accounts, currency, games, storage, message/calling logic, and existing event handlers. No migration or data reset.
- These are code changes in a review branch, not a claim of comprehensive cross-browser/UI testing. Confirm layout and interactions in Firefox/Chromium before merging.


### Lolite Chat — Navigation and Visual Redesign — 2026-10-21
- Rebuilt the Chat interface into a consistent three-column layout: **clearly labeled Chats / Friends / Calls / Profile navigation**, a searchable conversations sidebar, and a focused message reading/composer area.
- Replaced miscellaneous symbols and one-off styling with consistent SVG icons, dark slate surfaces, quieter colours, accessible text, keyboard focus states, consistent button sizing and better spacing.
- Added a practical Chats landing page with recent conversations, **Find Friends**, **Voice Calls** and **New Group** shortcuts.
- Improved the Friends screen with clearer friend requests, people cards and more obvious actions.
- Reworked **Create Group** to select accepted friends using checkboxes instead of typing comma-separated usernames; backend friendship checks remain in place.
- Improved chat headers, search, pinned-message controls, message presentation and Send button; preserved message reactions, reply, edit, delete and read receipts.
- Added layout responsiveness based on **the width of the Lolite Chat window**, including a bottom navigation bar and a Back to Chats control for narrow/mobile windows.
- Distinguished **Join room** (enter without ringing) from **Call** (send incoming-call invitations). Existing notification, account, DM, group and calling backends are unchanged.
- Passed JavaScript syntax validation and UI smoke checks for Chats, Friends, messages and the group picker. Manual device/browser layout testing is still recommended.


### Lolite Chat — Messaging, Groups and Calling Reliability Fix — 2026-10-21
- Fixed a Supabase row-level-security issue where creating a DM or group and asking for the inserted row immediately could fail. The earlier code could not proceed to add chat members, blocking messages and calls.
- Added an atomic authenticated conversation-creation RPC (lolite_create_conversation), which validates friendship and membership and saves the chat with all members in one transaction; failed creations do not leave orphan conversations.
- Updated the Message and Create Group flows to call this RPC and reuse existing DMs.
- Fixed Call Friend to receive the newly created DM's ID directly rather than relying on a sometimes-stale list of chats.
- Granted the missing database permission needed for users to edit their own messages, with existing sender-only row-level security still enforced.
- Re-tested the database under the authenticated role for DM creation, group membership, sending/editing messages, and call invitations, with all temporary test data rolled back.
- Updated Chat asset cache versions so existing browser sessions fetch the repaired code. A full two-browser voice test is still recommended, and some networks may require TURN for WebRTC connectivity.


### Lolite Chat — Visible Voice Calls and Group Calling — 2026-10-20
- Added an always-visible **Voice Calls (☎)** navigation tab in Lolite Chat, including a dedicated Call Friends and Call Groups screen. It is available even when no direct-message conversation is selected.
- Added **Call** actions to friend cards and profiles, and **Call group** to group conversation headers and the Calls screen.
- Added actual cross-account call invitations through secure Supabase tables, with a ringing screen, **Answer** and **Decline**, timeouts and end-call handling.
- Added a floating in-call panel with **Open Chat**, **Mute** and **End Call**; the private WebRTC voice room starts after microphone permission is granted.
- Incoming calls can be received while Lolite OS is open even if the Chat window is not open. Windows/browser notification banners are used when system permission is granted; notifications while Lolite OS is fully closed are not yet supported.
- Fixed voice controls being hidden unless a DM or group was already open. Updated static script versions to refresh cached chat files.
- Connection limitation: WebRTC uses public STUN servers but does not yet have a TURN relay; some restrictive networks may fail to connect.


### Lolite Chat — Voice Rooms, Desktop Notifications & Read Receipts — 2026-10-20
- Added **live WebRTC voice rooms** to private direct messages and group chats, with microphone consent, Join/Leave, Mute, Deafen and participant names. Audio is peer-to-peer; Supabase private Realtime channels exchange connection signals. Some networks require a TURN relay for reliable connections.
- Added a **notifications bell** in the Lolite taskbar for new private messages and incoming friend requests. Notifications include a locally saved inbox, unread counter, Mark all seen, and Clear all.
- Added an **Enable desktop alerts** control; when you grant permission, Lolite can display real system notifications while Lolite is running. Closed-browser push notifications are not included.
- Added persistent, conversation-member-only **Seen by** read receipts for DMs and groups, saved in Supabase only when messages are actually viewed.
- Clicking a person's message name, avatar or friend card opens their profile, with options to **Add friend**, accept an incoming request, or start a private message.
- Chat notifications avoid putting private message text into operating-system notification previews.


### Free & Paid Stores — 2026-10-21
- **39 of 82 actual Game Store titles are now free-to-play**, not demos. Examples include Block Blast, Cookie Clicker, Cut the Rope, Fireboy and Watergirl, Slope, Paper.io, Moto X3M, OvO, Snow Rider, Tiny Fishing, and Pong. The other 43 titles keep their earned-virtual-currency purchase prices.
- The Game Store features a prominent **Free to Play** collection, FREE labels, and **Play for free** actions. Free games launch their actual game windows and do not change the Lolite Dollars wallet; paid games still require a one-time unlock.
- **Calculator and Lolite Paint are now free**, along with Life RP, Lolite Quests, Academy, Chat and Quick Notes. Optional extras such as Wallpaper Editor, AI, Focus Board and Arcade Shelf remain paid.
- The App Store now includes explicit **Free** and **Paid** filters. Uninstalled free apps use **Get** and immediately install at zero cost; paid ones continue to use Buy → Install → Open. Existing purchases and installed apps are preserved.
- Pricing and availability are virtual in-OS unlocks, not external service purchases or paid game licences.

### Lolite Dollars — Paid Game Store & App Store — 2026-10-21
- The **actual Game Store titles now have one-time Lolite Dollar prices** and direct checkout. Buying unlocks the title's real, existing embedded game player; pressing Play or the featured hero before buying cannot launch a paid game. Purchased titles remain accessible through **My Library**.
- Added **Free to Play** and **My Library** store views, ownership badges, price labels, and a live shared Lolite Dollars wallet linked to Lolite Quests. Selected original starter titles remain free.
- Added **price tiers** for different games (for example, Escape Road and Baldi's Basics). The existing Minecraft 1.8 client costs 3,500 **virtual** Lolite Dollars to unlock through the store; this does **not** purchase or grant an official Minecraft licence.
- The **App Store now requires a virtual purchase before installing its paid apps**, and paid apps check their entitlement when opened through desktop shortcuts, search or Start. After purchase, the real installed app launches; uninstallation does not remove ownership and reinstalling is free.
- The App Store offers functional paid apps including **Paint**, **Wallpaper Editor**, **Calculator**, **Lolite AI**, **Focus Board**, and **Arcade Shelf**. Essentials (Life RP, Lolite Quests, Academy, Chat and Notes) remain free.
- **Shared persistent purchases** deduct from the same currency earned through RP jobs, Lolite Quests and Academy lessons. Existing installed App Store apps are grandfathered; recognized previous RP/Quests item purchases also confer the matching entitlement.
- Purchases are entirely **fictional local-game unlocks**, not real payments, online store licences or an authoritative DRM system. Optional RP Online cloud saves can sync this progress when used.
  
### Lolite Quests & Life RP Skill Arcade Update — 2026-10-21
- Added the **Lolite Quests** app to the desktop, Start/Home and App Store; it uses the **same virtual cash balance** as Life RP. There is no real-money billing or new currency.
- Added 7 **active-window use quests** for Quick Notes, Paint, Files, Academy, Game Store, Settings and the App Store. Only foreground time with recent genuine interaction counts (90–180 seconds per quest), and each quest can be claimed once.
- Academy quiz completion now earns **$85 virtual cash per new completed lesson**, plus **$450 per fully completed course**. Previously completed lessons are credited retroactively, with one-time reward bookkeeping to prevent duplicate claims.
- Lolite Quests' **Market** lets players spend this money on virtual Plus/Pro membership unlocks, OS cursor packs, wallpapers, game launcher shortcuts and two new purchasable mini apps: **Focus Board** (working checklist) and **Arcade Shelf** (purchased game launcher hub).
- Replaced Life RP's simple selection-button minigames with **six real Canvas-based challenges**: moving targets, timing locks, rhythm notes, memory flipping, timed kitchen stations and navigable mazes. Players must finish successfully to receive cash and XP; failure pays nothing.
- Added **persistent 1–15 minute cooldowns** after successful jobs, activities and customer work; higher-paying tasks have longer cooldowns. Unfinished or failed tasks do not start a cooldown.
- Made Life RP **Season Pass significantly harder**: 650 season XP per free tier, 1,200 *separate Premium XP* per premium tier. Premium requires Specialist rank, six claimed quests, nine completed shifts, one property, one business, and a one-time $12,000 in-game unlock. Premium XP is earned only through claimed quests after activation, with especially large boosts from harder weekly and story quests.
- Added a **paged battle pass**, claimable/locked tier filters, a compact scrollable RP sidebar and shortcuts to the Quest Board, OS Quests, minigames, jobs and shop.
- Virtual cash saves with RP progress locally and can join its opt-in Life RP Online cloud-save workflow. This is a client-side game economy; it is not an authoritative anti-cheat multiplayer economy.
- Minecraft purchases only unlock a launcher shortcut within Lolite and **do not grant any Minecraft licence**. Previously available games remain accessible outside the virtual shop.

### Lolite Life RP City Update — Hands-On Gameplay, Businesses & Shop — 2026-10-20
- Reworked the **Life RP dashboard** with shortcuts to active gameplay, quests, promotions, businesses, minigames, and the shop.
- Replaced the old two-answer-only shifts with **three randomly selected work scenarios** from an expanded set of almost 100 occupation and industry questions, followed by a playable skill minigame. Completed work still pays virtual cash and resident XP.
- Added **16 playable activities** (12 regular and four member-exclusive) built around memory matching, precision sliders, order assembly, quick visual targets, rhythm sequences and navigation patterns. Mini game accuracy affects payouts; unfinished activities do not pay.
- Added the **City Quest Board** with 12 story quests and rotating daily and weekly tasks. Players must accept, complete, and claim quests to earn virtual cash, resident XP, and seasonal XP.
- Changed the **battle pass** into a 28-day, 18-tier season, with fixed free and premium rewards. **Season XP is earned through quest claims rather than every ordinary shift or minigame.** Premium rewards cost virtual game money only.
- Added **eight rank promotions** with specific requirements for work shifts, activity completions, quests, properties, businesses, XP, and promotion fees. Some careers, businesses, and activities are gated behind progression.
- Added **six player-owned businesses**, each with stock purchases, upgrades, customers served through interactive minigames, reputation milestones and revenue from successfully completed orders.
- Added a **shop** with 18 products, including six Lolite Life RP themes with matching actual Lolite OS wallpapers, cursor packs, house décor/profile titles, and launcher shortcuts for Lolite Pong, Lolite 2048, Lolite Sokoban and the existing Minecraft 1.8 entry.
- Introduced **Lolite Plus** (4,500 virtual coins) and **Lolite Pro** (12,500 virtual coins or an 8,000-coin upgrade from Plus). These are fictional, one-time in-game upgrades; no real payments, subscriptions or billing are involved.
- Expanded **resident profiles** with interactive avatar selection, collected items, wardrobe/equip actions, badges, purchased game launchers and stats.
- **Licensing note:** the Minecraft item only unlocks a shortcut to Lolite's existing launcher. It is not a purchase, license or entitlement to official Minecraft. Existing Lolite apps and Online Mode remain intact.

### Lolite Life RP Online Mode — Private Rooms & Cloud Saves — 2026-10-20
- Added an **Online Mode** tab to the Life RP app, using existing Lolite Chat accounts (no second registration).
- Players can create or join **private code-based multiplayer rooms**, see who's present live, and exchange preset roleplay actions without sharing location or personal contact details.
- Added a temporary **co-op town improvement challenge** and a view of existing accepted Lolite Chat friends for sharing invitations through Chat.
- Added **opt-in cross-device cloud saves** for careers, money, properties, achievements and battle pass. Existing cloud saves offer an explicit choice between loading the cloud copy and replacing it with the local copy.
- Cloud records have per-user database access controls; multiplayer channels require account authentication and an unguessable room code. Offline mode works as before.
- The virtual economy is saved per player; there is currently no shared cash, trading, free-text in-game chat, or persistent 3D world. Cloud save is not an anti-cheat or competitive leaderboard system.

### Lolite Life RP — Jobs, Properties & Season Pass — 2026-10-20
- Launched **Lolite Life RP**, an interactive in-desktop roleplaying game accessible from the desktop, Start menu, Home and App Store.
- Choose from **20 careers** with decision-based two-step shifts and virtual paychecks, plus **12 side activities** with XP and cash rewards.
- Buy, upgrade, and select homes from **10 properties**, with time-based rental earnings that can be collected from a unified virtual wallet.
- Added an **18-tier battle pass** with claimable free rewards and a premium track purchasable with earned *in-game cash only* (no real-money purchases).
- Added daily check-ins, resident missions, level progression, profile/avatar customisation, badges, transaction history and local progress saving.
- Battle pass, cash and properties are purely fictional game features; save data remains local to the device or browser.

### What's New — Live release notes — 2026-10-20
- Replaced the old placeholder announcements on the Lolite Home screen and welcome screen with **real changes** pulled from this README's Update Log.
- Added a modern **What's New** section with dated release cards for recent features like Academy, game artwork repairs, Cloud Gaming and desktop improvements.
- Added an interactive **See all updates** history with full release details and shortcuts to open the feature being described.
- The latest releases refresh from this README when Lolite loads (or from the public GitHub copy if a static host omits the Markdown file). A local set of verified release notes appears if both sources are unavailable.
- Removed outdated claims and stale version text from the Home and welcome content.

### Lolite Academy — Interactive Guide & Courses — 2026-10-20
- Added **Lolite Academy**, a fully integrated educational app, available from the desktop, Start menu, workspace search, Home shortcuts and App Store (Education).
- Added **7 guided courses with 21 practical lessons** covering the desktop, window controls, Game Store/cloud gaming, Files, personalisation, Lolite Chat, and browser troubleshooting.
- Each lesson includes step-by-step instructions, a useful tip, a **Try it in Lolite** button, and an interactive knowledge-check quiz with correct-answer explanations.
- Added lesson completion tracking, **20 XP per completed lesson**, progress bars, achievement milestones, course search and filters.
- Progress is saved **locally on the current device/browser**. No new account or external service is required.
- Academy uses its own responsive styling and a dedicated icon; it doesn't replace existing apps.

### Game cover image fix — 2026-10-20
- Game Store cover cards now start with a distinct, built-in SVG poster for each game, so there is always artwork even if a third-party image host blocks hotlinking or goes offline.
- Verified remote images replace the poster only after loading, and any failed images restore the per-game poster automatically.
- Kept wide images as covers and square logos with a blurred backdrop; added an image observer fallback and refreshed script caching.

### Game Store artwork reliability fix — 2026-10-20
- Repaired the SVG fallback covers so their gradients and background shapes render properly instead of becoming transparent.
- Stopped bulk-loading all remote cover images at once; visible game cards now get priority.
- When a third-party image is unavailable or stalls, Lolite keeps the matching game's own generated cover visible and can retry later.
- Updated the Game Store script cache version to load the fix on GitHub Pages and Vercel.

### 3.15.4 — Complete native installer downloads — 2026-10-18
- Fixed a native response-stream stall while writing installer downloads to disk.
- Added a full-download regression test covering buffering, delayed consumers and installer verification.

### 3.15.3 — Cloud Gaming launcher — 2026-10-19
- Added a dedicated **Cloud Gaming** desktop app with a searchable provider catalogue, favourites and one-click launch buttons.
- Added Cloud Gaming to the desktop, Start menu and Lolite home dashboard with a new themed SVG icon.
- Included official launch points for Xbox Cloud Gaming, NVIDIA GeForce NOW, Boosteroid and Amazon Luna, with account and regional availability notes.
- Cloud gaming runs on each provider's remote servers and opens in its supported browser environment; availability, subscriptions and games depend on the provider.
- The third-party onefile SVG was reviewed but not imported: its cloud gaming feature relies on an external API and API key, and the file alone does not provide streaming servers.

### 3.15.2 — Windows update download redirects — 2026-10-19
- Fixed Electron cancelling GitHub release-asset redirects during update checks and downloads.
- Redirect destinations remain restricted to the official HTTPS release service.
- Extended published-release verification to invoke the installed launcher's actual reinstall command and download through its native network client.

### 3.15.1 — Reliable desktop updates and fresh reinstall — 2026-10-19
- Added **Reinstall latest files**: recheck GitHub, download a fresh verified installer even at the current version, then replace program files while keeping personal data.
- Desktop and launcher startup now check the official release feed; the desktop has direct **Updates** and **README** buttons.
- Added the GitHub README inside the launcher, with refresh, a saved offline copy and safe Markdown rendering.
- Added last-successful-check timestamps, clearer errors, Windows system-proxy networking and stale-download protection.
- Changed Windows release automation to assign a new patch version when application files change, so new source changes reach desktop users.
- Removed Vice City from the game catalogue and featured carousel.

### 3.15.0 — Windows desktop and Lolite Launcher — 2026-10-18
- Added a bundled Electron desktop application and a separate Lolite Launcher entry executable.
- Added native file dialogs, selected-folder import, local fonts and offline file-viewer libraries.
- Added verified GitHub release downloads, pause/resume, stable/beta settings, repair checks and recovery installers.
- Added an NSIS installer with shortcuts and data-preserving upgrades/uninstall, plus Windows build and release automation.
- Desktop signing credentials are optional and never stored in the repository. See the desktop guide for verification status and configuration.

### 3.14.0 — File viewers and Explorer workspace — 2026-10-16
- Added media playback, subtitles, image transforms/export, PDF pages/search, code editing, CSV tables, spreadsheet values, document text previews, fonts and 3D models.
- Added a tempo-aware MIDI parser and basic synthesizer.
- Added worker-based ZIP/TAR/GZ/TGZ inspection/extraction with integrity and path checks.
- Added tabs, Recent, Favorites, recoverable Trash, filters, thumbnails, internal drag/drop and an optional preview/properties pane.
- Optional decoders load on demand; media codec support varies by browser. See [File viewer compatibility](docs/FILE-VIEWERS.md) for exact support and limitations.
- Preserves original files; edits require Save or export. Archive extraction uses a separate destination folder.

### 3.13.0 — Windows-inspired File Explorer — 2026-10-16
- Rebuilt Files with a Windows-style command bar, address breadcrumbs, editable paths, sidebar and status bar.
- Added Details / Large icons views, sorting, folder search, multi-selection, context menus and keyboard shortcuts.
- Added transactional copy, cut, paste, rename and delete, with collision-safe imports and folder-boundary checks.
- Added safe image/text previews, downloads and ZIP extraction into the current folder.
- Fixed the storage API exposure that prevented the previous Explorer module from initializing.
- Files remain stored locally in browser IndexedDB; this does not provide unrestricted access to the computer filesystem.

### 3.12.0 — A unified Lolite interface — 2026-10-16
- Redesigned desktop, full-width taskbar, Start menu and Home dashboard.
- Shared slate surfaces, accent colours, typography and controls across Settings, Files, Game Store, App Store, Chat, AI, browsers and creative tools.
- Refreshed device chooser, mobile surfaces and welcome screen.
- Added visible keyboard focus, labelled window controls, responsive layouts and reduced-motion support.
- Existing app functionality, files, preferences and optional Liquid Glass are preserved.

### 3.11.3 — Firefox search and iframe handling — 2026-10-16
- DuckDuckGo, Google, and Bing prevent their pages from being embedded inside Lolite's standard browser windows.
- When users search or open these sites, Lolite opens a normal browser tab instead of displaying Firefox's "Can't Open This Page" iframe error.
- Added a clean built-in browser home, a clear "Open in a browser tab" fallback, and improved Home, Reload, and Open in tab buttons.
- Both browser apps continue to support ordinary embedded browsing for sites that allow it. The proxy transports remain disabled.

### 3.11.2 — Browser account and fallback fixes — 2026-10-15
- Fixed both browser apps attempting unavailable proxy transports, which could leave blank or failed pages.
- Both browser apps now present standard embedded browsing after signing in with an existing Lolite Chat account, with Open in tab for websites that block embedding.
- Improved account-session error handling. Logging in through Lolite Chat can unlock open browser windows; logging out locks them again.
- **Proxy status:** Scramjet and Ultraviolet transport remains disabled, so this is standard web browsing, not a working proxy.

### 3.11.1 — Shared browser account sign-in — 2026-10-15
- Scramjet and Ultraviolet browser windows now ask for a Lolite Chat username and password before browsing.
- Reused the existing Supabase Auth accounts and registration flow instead of storing passwords in a new database.
- Added a backend account-token verification endpoint and closed the unauthenticated Bare and Wisp transport routes. General-purpose proxies are not enabled on the public host.
- Standard embedded browsing remains available after sign-in on websites that allow it.

### 3.11.0 — Minecraft 1.8 and browser fallback improvements — 2026-10-15
- Changed the Game Store's Minecraft entry to the upstream-hosted EaglercraftX 1.8 client from [Eaglercraft Extras](https://github.com/x8rr/Eaglercraft-Extras). The game opens in a Lolite window using the official hosted client; Lolite does not bundle copyrighted game files.
- Added Minecraft 1.8 shortcuts on the desktop, in the Start menu, Search, and the Phone/Tablet launchers.
- Added normal embedded browsing and an Open in tab option to Scramjet when the proxy runtime is unavailable. Added a corresponding Browse directly fallback to Ultraviolet when its service worker cannot initialize. Standard browsing does not bypass network restrictions and some websites block embedding.
- Kept the existing Minecraft Pocket Edition HTML file in the repository for compatibility, but replaced the visible Store listing with Minecraft 1.8.


### 3.9.8 — Ultraviolet Worker Path Fix — 2026-10-09
- Removed the broken mobile startup chooser and restored direct startup to the normal Lolite desktop.
- Added an Ultraviolet Browser app entry in the desktop and Start menu, with address/search input, home, reload and open-in-tab controls.
- Connected the browser UI to the Ultraviolet runtime assets, correctly named handler/service-worker bundles and Bare proxy endpoint.
- Added clearer runtime diagnostics when the site is running on static hosting without a proxy backend.
- Configured Vercel routes for the static desktop plus Ultraviolet runtime and Bare HTTP proxy endpoints. WebSocket-dependent sites may still require a full Node host.


### 3.9.4 — Local Lolite AI — 2026-10-09
- Replaced shared cloud AI requests with WebLLM running the Qwen2 0.5B model directly in the browser using WebGPU.
- Added a local model setup button and download/loading progress; the model is cached by the browser for later use.
- AI prompts and replies are generated on-device and are no longer sent to the Lolite AI API.
- Requires a WebGPU-compatible browser and enough available device memory; the first model download may take a while.

### 3.9.3 — Free Lolite AI — 2026-10-09
- Removed the paid OpenAI API-key requirement from Lolite AI.
- Connected the server-side AI endpoint to LLM7's keyless free-tier route referenced by the InferenceMesh provider registry.
- Added basic per-instance request throttling and clearer unavailable/rate-limit messages.
- Kept the provider call on the server so no provider credential is exposed in browser code. Free-tier availability and quotas may change.
- The InferenceMesh project itself was not installed as an npm dependency because the package was not resolvable from the npm registry in the deployment environment; this update used its provider route directly.

### 3.9.2 — AI Endpoint Routing Fix — 2026-10-09
- Routed the GitHub Pages Lolite AI client to the live `lolite-os.vercel.app/api/ai` endpoint instead of a nonexistent deployment hostname.
- Confirmed the public API health endpoint responds successfully; AI generation still requires the private `OPENAI_API_KEY` environment variable to be configured in Vercel.

### 3.9.1 — Lolite AI API Repair — 2026-10-09
- Switched Lolite AI to the supported `gpt-4.1-mini` default model while preserving the `OPENAI_MODEL` override.
- Improved API health reporting, timeout handling, provider error messages and empty-response handling.
- Increased the client timeout and prepared the client for a dedicated GitHub-linked Vercel API deployment.
- The Vercel deployment must have `OPENAI_API_KEY` configured in its server-side environment; the key is never stored in the browser.

### 3.9.0 — WebGL Liquid Glass & Browser Cleanup — 2026-10-09
- Removed Lolite Browser and Ultraviolet Browser from the desktop, Start menu, search, App Store and loaded runtime; removed their obsolete client modules.
- Replaced the CSS-only liquid-glass highlight with a WebGL shader rendering animated fluid caustics, refractive-style colour flow and specular edge reflections on windows, panels and taskbar.
- Kept translucent backdrop blur as the live background layer, with a CSS fallback when WebGL is unavailable.
- Connected the WebGL effect to the Liquid Glass setting and Reduce Motion; updated cache versions to 3.9.0.

### 3.8.0 — Real File Explorer — 2026-10-09
- Rebuilt Files with sidebar locations, breadcrumbs, back/forward/up navigation and folder-aware browsing.
- Added nested folders, file creation, uploads into the current folder, search, file-type icons and readable sizes.
- Preserved IndexedDB persistence and ZIP extraction/export while making stored paths behave like folders.
- Updated cache versions and compatibility checker to 3.8.0.

### 3.7.3 — Wallpapers That Actually Apply — 2026-10-09
- Fixed wallpaper selection so saved library wallpapers survive startup instead of being overwritten by the legacy default wallpaper.
- Made all still and animated wallpaper backgrounds clearly visible by removing the nearly opaque desktop overlay that was washing them out.
- Added wallpaper-matched accent colours across the OS, including controls, selection states and focus outlines.
- Preserved each animated wallpaper's motion identity and made pixel wallpapers render as a repeating pattern.
- Updated cache versions and the compatibility checker to 3.7.3.

### 3.7.2 — Premium 3D Brand & App Icons — 2026-10-09
- Rebuilt the Lolite logo finish with layered bevels, a glossy highlight, deeper extrusions and cleaner reflections.
- Refined app icon consistency and the desktop visual style.


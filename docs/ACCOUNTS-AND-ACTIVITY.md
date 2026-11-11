# Lolite accounts and game activity

Existing Lolite Chat credentials remain valid. The Supabase Auth IDs, usernames,
conversations, memberships and administrators are unchanged. The synthetic email
mapping remains `username@accounts.lolite.chat` for compatibility.

## Using it

The desktop starts at a login screen. Choose **Automatically log in on this device**
at login or under **Settings → Account & activity**. With it disabled, restarting
or reloading the desktop requires credentials. **Continue as guest** preserves the
old guest workspace. Use Settings or Start to switch accounts; this reloads the
whole desktop so open windows, calls, drafts and private state cannot carry across.

Desktop localStorage and the Files, saved HTML and imported-package IndexedDBs are
namespaced per account. Small supported preferences sync privately to Supabase.
Large uploads remain on that browser/device; this is not cloud file backup. Existing
guest files are not silently copied to a newly signed-in user. Games' own internal
save systems and third-party cloud saves are outside the desktop preference sync.

The Game Library activity panel shows accepted friends and links to player profiles.
Profiles contain total time, most played, favourites and longest individual sessions.
Only a successfully loaded game in the active Lolite window earns time; switching
apps, hiding Lolite or closing a game pauses it. Server heartbeats every 15 seconds
measure elapsed time. Sleep/disconnection gaps over 45 seconds and overlapping
sessions do not accrue time. Playtime starts with this update; no historical hours
are invented. A lost connection or abrupt shutdown may lose the final interval.
Activity refreshes about every 20 seconds and expires after 75 seconds without a
heartbeat. The profile's Invisible status and account privacy controls are respected.
Blocking in either direction excludes game statistics and live activity.

**Game Info → Copy game** copies a `lolite://game/…` identifier. Paste it with a
message into a DM or group; Chat resolves it against Lolite's installed catalog and
renders a Play button. Titles and actions never come from an untrusted message URL.
Recipients need the game in their catalog; personal uploads aren't redistributed.

## Discord setup

Native Electron builds now include a local Discord IPC client. It publishes Playing
(game name), Chatting on Lolite, Changing settings or browsing the library. It hides
presence on logout, window close, inactivity or when disabled in Settings. Ordinary
web pages cannot access native Discord IPC.

A real Discord Developer application ID has **not been supplied**. Its registered
application name should be **Lolite OS**. Set the public ID in
`desktop/src/config.cjs` (`discordClientId`) for all users, or enter it in Settings →
Account & activity → Discord application setup in an installed app. No Discord bot
token, user token or OAuth password is needed. Desktop Discord must be running and
its activity-sharing setting enabled. The app retries when Discord opens later.

The bridge is available only to the trusted top-level `lolite://app/index.html`;
game frames cannot invoke native presence or select arbitrary socket addresses.
Payloads are bounded, JSON frames are length checked, commands are throttled and
only the operating system's standard Discord IPC endpoints are used.

## Validation

- 76 focused Node checks passed for accounts, game cards, stores, window helpers,
  native IPC security, native file access and the desktop updater.
- Supabase transaction checks passed and were rolled back: own desktop access,
  cross-account isolation, no direct statistic writes, server elapsed time, offline
  gaps and blocking in both directions. No existing users or messages were changed.
- Browser QA verified the real startup/guest/settings flow, plus isolated local mock
  accounts for profiles, game-loaded timing and copied links rendered inside chat.
  The mock harness is not shipped. A real Discord desktop session has not been tested.
- Security-definer RPCs intentionally expose only authenticated, auth.uid-scoped
  mutations; counters and private session rows have no direct client write grants.
  Advisor notices for these intentional RPCs and deny-all session RLS were reviewed.

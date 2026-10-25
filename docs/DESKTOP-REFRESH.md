# Desktop refresh — 3.17.0

The desktop uses a single window manager for focus, visibility, stacking and normal/snapped bounds. It fixes the previous top-edge maximise toggle, inactive-window stacking, taskbar restore-only behavior, repeated startup chooser and uncontrolled resize edges.

## Interaction changes

- Mouse: click to select a desktop shortcut; double-click to open. Keyboard: Enter/Space. Touch: one tap.
- Taskbar: open a pinned app, minimise the active app, or restore an existing app.
- Titlebar: drag; double-click to maximise/restore. Snap button offers halves, quarters or maximise. Drag to the left/right/top edge for snapping. Ctrl+Alt+Arrow also snaps/minimises where the host permits.
- Start: search, Enter to open the first result, All apps and recent apps. Ctrl+Escape opens Start. Escape closes flyouts.
- Quick settings: sound mute/volume and Reduce Motion. Clock opens a real navigable calendar.
- Home: theme selection remains available. Existing Desktop and Browser theme choices are retained.

## Motion and compatibility

Web Animations use short 130–220ms transitions. Cancelling a minimise cannot later hide a restored window. Enabling Reduce Motion settles pending transitions immediately. Live wallpapers keep their existing pause rules. Narrow viewports use a compact taskbar and full-width snap regions; Browser workspace keeps its single-pane layout.

Quick Notes reads/writes the existing `lolite-v26-notes` collection, escapes saved content and refuses to overwrite unreadable storage. Calculator uses a small arithmetic parser rather than executable code.

## Verification

`node --test tests/*.test.cjs`: 21 passing tests covering window focus/lifecycle, top-edge maximise/restore, bounds and snapping, interrupted transitions, Show desktop, keyboard cycling, reduced motion, calculator parsing, legacy notes, wallpaper lifecycle/persistence, sounds and classic-script syntax.

Chromium UI checks: automatic saved-workspace startup; Start search/Enter; desktop single/double-click; Files and Settings open together; background focus; minimise/restore; maximise/restore; side-by-side snap controls; Quick settings; calendar month navigation; Browser workspace switching and reload; Home theme selection (GNOME top bar, Deepin dock, Crimson); Game Store rendering; Calculator 7+8=15 at 390px width; Quick Notes content after close/reopen.

Browser UI automation did not synthesize freeform drag/resize gestures; pointer-driven drag cancellation and top-edge snapping were exercised in the automated window-manager harness. Windows packaging and installer smoke checks run in the existing GitHub Actions workflow. This refresh does not change third-party game availability, proxy hosting or account/call backends.

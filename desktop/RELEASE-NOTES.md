Lolite OS now has a Windows desktop edition with its own dedicated Lolite Launcher.

- Bundled desktop, utilities, local games, fonts and file viewers.
- Native Windows Open/Save dialogs and authorized folder imports.
- Stable and beta release channels, download progress, pause/resume, SHA-512 verification and update history.
- Program-file integrity checks and verified repair installers.
- Fullscreen/windowed mode and remembered window placement.
- Separate user data, safe upgrade handling and recovery to a previous verified installer when available.

Download **LoliteOS-Setup.exe**. The installer includes **Lolite OS.exe** and **Lolite Launcher.exe**; both require the installed runtime files.

Online games, chat, online content and the first AI model download still require an internet connection. Browser-based Lolite data is separate: export your files from the website and import them into the desktop app.

This build may be unsigned until the project owner configures a Windows code-signing certificate. The launcher verifies installer size and SHA-512 against the official GitHub release metadata. Code-signing setup and complete build instructions are in `docs/DESKTOP.md`.

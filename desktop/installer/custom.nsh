!include "LogicLib.nsh"
!include "nsProcess.nsh"

; Never terminate a user's desktop to install an update. Check both entry points.
!macro customCheckAppRunning
  StrCpy $R2 0
  lolite_wait_for_exit:
    ${nsProcess::FindProcess} "Lolite OS.exe" $R0
    ${nsProcess::FindProcess} "Lolite Launcher.exe" $R1
    ${If} $R0 == 0
    ${OrIf} $R1 == 0
      IntOp $R2 $R2 + 1
      ${If} $R2 < 30
        Sleep 1000
        Goto lolite_wait_for_exit
      ${EndIf}
      MessageBox MB_RETRYCANCEL|MB_ICONEXCLAMATION "Close Lolite OS and Lolite Launcher before continuing. Save your work first." /SD IDCANCEL IDRETRY lolite_wait_for_exit
      SetErrorLevel 1618
      Quit
    ${EndIf}
!macroend

!macro customInstall
  CreateShortCut "$DESKTOP\Lolite Launcher.lnk" "$INSTDIR\Lolite Launcher.exe"
  CreateShortCut "$SMPROGRAMS\Lolite Launcher.lnk" "$INSTDIR\Lolite Launcher.exe"
  StrCpy $launchLink "$INSTDIR\Lolite Launcher.exe"
!macroend

!macro customUnInstall
  Delete "$DESKTOP\Lolite Launcher.lnk"
  Delete "$SMPROGRAMS\Lolite Launcher.lnk"
  ; Silent upgrades and silent uninstalls always preserve user data.
  ${IfNot} ${Silent}
  ${AndIfNot} ${isUpdated}
    MessageBox MB_YESNO|MB_DEFBUTTON2|MB_ICONQUESTION "Also delete your Lolite personal files, projects, settings and wallpapers? Choose No to keep them for a future reinstall." IDNO lolite_keep_data
      RMDir /r "$APPDATA\Lolite OS"
    lolite_keep_data:
  ${EndIf}
!macroend

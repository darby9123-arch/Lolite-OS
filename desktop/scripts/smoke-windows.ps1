$ErrorActionPreference = 'Stop'
$installRoot = Join-Path $env:RUNNER_TEMP 'LoliteDesktopTest'
$env:LOLITE_SMOKE_DATA = Join-Path $env:RUNNER_TEMP 'LoliteDesktopTestData'
New-Item -ItemType Directory -Force $env:LOLITE_SMOKE_DATA | Out-Null
Set-Content (Join-Path $env:LOLITE_SMOKE_DATA 'keep-my-project.txt') 'User data must survive upgrades.'
$setup = (Resolve-Path 'dist/LoliteOS-Setup.exe').Path
function Install-Lolite {
  $process = Start-Process -FilePath $setup -ArgumentList @('/S', "/D=$installRoot") -PassThru
  if (-not $process.WaitForExit(120000)) { $process.Kill(); throw 'Installer timed out.' }
  if ($process.ExitCode -ne 0) { throw "Installer failed: $($process.ExitCode)" }
}
function Test-Lolite($exe, $mode, $name) {
  $env:LOLITE_SMOKE_RESULT = Join-Path (Resolve-Path 'dist') "smoke-$name.json"
  $env:LOLITE_SMOKE_SCREENSHOT = Join-Path (Resolve-Path 'dist') "smoke-$name.png"
  $process = Start-Process -FilePath (Join-Path $installRoot $exe) -ArgumentList $mode -PassThru
  if (-not $process.WaitForExit(200000)) { $process.Kill(); throw "$name timed out." }
  if (-not (Test-Path $env:LOLITE_SMOKE_RESULT)) { throw "$name produced no health report." }
  $report = Get-Content $env:LOLITE_SMOKE_RESULT | ConvertFrom-Json
  if (-not $report.ok) { throw "$name failed: $($report.error)" }
  return $report
}
Install-Lolite
foreach ($name in @('Lolite OS.exe', 'Lolite Launcher.exe', 'resources/app.asar', 'resources/integrity.json')) {
  if (-not (Test-Path (Join-Path $installRoot $name))) { throw "Missing installed file: $name" }
}
$null = Test-Lolite 'Lolite OS.exe' '--smoke-test' 'desktop'
$null = Test-Lolite 'Lolite Launcher.exe' '--smoke-launcher' 'launcher'
$null = Test-Lolite 'Lolite Launcher.exe' '--smoke-network' 'network'
# Reinstall must restore an actually missing application archive, preserving the profile.
Remove-Item (Join-Path $installRoot 'resources/app.asar')
Install-Lolite
$report = Test-Lolite 'Lolite OS.exe' '--smoke-test' 'upgrade'
if (-not $report.previous) { throw 'IndexedDB data was lost during upgrade.' }
$uninstaller = Get-ChildItem $installRoot -Filter 'Uninstall*.exe' | Select-Object -First 1
if (-not $uninstaller) { throw 'Uninstaller is missing.' }
$process = Start-Process -FilePath $uninstaller.FullName -ArgumentList '/S' -PassThru
if (-not $process.WaitForExit(60000)) { throw 'Uninstaller timed out.' }
for ($attempt=0; $attempt -lt 120 -and (Test-Path (Join-Path $installRoot 'Lolite OS.exe')); $attempt++) { Start-Sleep -Milliseconds 250 }
if (Test-Path (Join-Path $installRoot 'Lolite OS.exe')) { throw 'Uninstaller left the application executable behind.' }
if (-not (Test-Path (Join-Path $env:LOLITE_SMOKE_DATA 'keep-my-project.txt'))) { throw 'Uninstaller removed personal data.' }
Write-Host 'Windows installation, both executables, storage persistence and uninstall verified.'

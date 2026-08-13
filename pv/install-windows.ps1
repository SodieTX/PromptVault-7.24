# PV native host installer — Windows (per-user, no admin needed).
# Usage:  powershell -ExecutionPolicy Bypass -File .\pv\install-windows.ps1
# Undo:   powershell -ExecutionPolicy Bypass -File .\pv\install-windows.ps1 -Uninstall
param([switch]$Uninstall)
$ErrorActionPreference = "Stop"

$HostName  = "com.sodietx.pv"
$ExtId     = "ofcdjhohhhogaeenjlpflakpjmkbkach"   # stable — derived from the pinned key in manifest.json
$PvDir     = Join-Path $env:USERPROFILE ".pv\host"
$RegPath   = "HKCU:\Software\Google\Chrome\NativeMessagingHosts\$HostName"

if ($Uninstall) {
  if (Test-Path $RegPath) { Remove-Item $RegPath -Force }
  if (Test-Path $PvDir)   { Remove-Item $PvDir -Recurse -Force }
  Write-Host "PV host uninstalled."
  exit 0
}

$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) {
  foreach ($p in @("$env:ProgramFiles\nodejs\node.exe", "${env:ProgramFiles(x86)}\nodejs\node.exe")) {
    if (Test-Path $p) { $node = $p; break }
  }
}
if (-not $node) { Write-Error "Node.js not found — install the LTS from https://nodejs.org first."; exit 1 }

New-Item -ItemType Directory -Force -Path $PvDir | Out-Null
Copy-Item (Join-Path $PSScriptRoot "host.mjs") (Join-Path $PvDir "host.mjs") -Force

# Chrome launches native hosts via an executable — a .bat shim that execs Node.
$bat = Join-Path $PvDir "pv-host.bat"
"@echo off`r`n""$node"" ""$PvDir\host.mjs"" %*" | Set-Content -Path $bat -Encoding ascii

$manifest = @{
  name            = $HostName
  description     = "Prompt Vault PV bridge — lets local MCP agents read/add vault items"
  path            = $bat
  type            = "stdio"
  allowed_origins = @("chrome-extension://$ExtId/")
} | ConvertTo-Json
$manifestPath = Join-Path $PvDir "$HostName.json"
$manifest | Set-Content -Path $manifestPath -Encoding utf8

New-Item -Path $RegPath -Force | Out-Null
Set-ItemProperty -Path $RegPath -Name "(Default)" -Value $manifestPath

Write-Host "PV host installed for Chrome (extension $ExtId)."
Write-Host "Restart Chrome, then connect an agent, e.g.:"
Write-Host "  claude mcp add pv -- node `"$((Resolve-Path (Join-Path $PSScriptRoot 'pv-mcp.mjs')).Path)`""

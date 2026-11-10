$ErrorActionPreference = 'Stop'
$ToolRoot = Join-Path $env:LOCALAPPDATA 'tauri'
$NsisRoot = Join-Path $ToolRoot 'NSIS'
$PluginPath = Join-Path $NsisRoot 'Plugins\x86-unicode\additional\nsis_tauri_utils.dll'
$NsisZipUrl = 'https://github.com/tauri-apps/binary-releases/releases/download/nsis-3.13/nsis-3.13.zip'
$PluginUrl = 'https://github.com/tauri-apps/nsis-tauri-utils/releases/download/nsis_tauri_utils-v0.5.3/nsis_tauri_utils.dll'
$NsisZipSha1 = 'DB14F8AF2EA346B786C6AE19343F61AAF5E09B8E'
$NsisExeSha1 = '6D45D4E8CCF18FE1FDAC9164058F356102A2ECF2'
$PluginSha1 = '75197FEE3C6A814FE035788D1C34EAD39349B860'

function Get-Sha1([string]$Path) {
    return (Get-FileHash -LiteralPath $Path -Algorithm SHA1).Hash.ToUpperInvariant()
}
function Invoke-DownloadWithRetry([string]$Url, [string]$Destination, [string]$ExpectedSha1) {
    $lastError = $null
    for ($attempt = 1; $attempt -le 5; $attempt++) {
        try {
            if (Test-Path $Destination) { Remove-Item -LiteralPath $Destination -Force }
            Write-Host "Downloading required Tauri bundler component (attempt $attempt/5)..." -ForegroundColor Yellow
            Invoke-WebRequest -Uri $Url -OutFile $Destination -UseBasicParsing -TimeoutSec 180
            $actual = Get-Sha1 $Destination
            if ($actual -ne $ExpectedSha1) { throw "SHA-1 mismatch. Expected $ExpectedSha1; received $actual." }
            return
        } catch {
            $lastError = $_
            if ($attempt -lt 5) {
                $delay = [Math]::Min(60, [Math]::Pow(2, $attempt) * 3)
                Write-Warning "Download failed: $($_.Exception.Message). Retrying in $delay seconds."
                Start-Sleep -Seconds $delay
            }
        }
    }
    throw "Unable to download and verify $Url after 5 attempts. Last error: $lastError"
}

New-Item -ItemType Directory -Force -Path $ToolRoot | Out-Null
$validNsis = (Test-Path (Join-Path $NsisRoot 'makensis.exe')) -and (Test-Path (Join-Path $NsisRoot 'NSIS.exe'))
if ($validNsis) {
    try { $validNsis = (Get-Sha1 (Join-Path $NsisRoot 'NSIS.exe')) -eq $NsisExeSha1 } catch { $validNsis = $false }
}
if (-not $validNsis) {
    $zipPath = Join-Path $env:TEMP 'tauri-nsis-3.13.zip'
    Invoke-DownloadWithRetry $NsisZipUrl $zipPath $NsisZipSha1
    if (Test-Path $NsisRoot) { Remove-Item -LiteralPath $NsisRoot -Recurse -Force }
    Expand-Archive -LiteralPath $zipPath -DestinationPath $ToolRoot -Force
    $extracted = Join-Path $ToolRoot 'nsis-3.13'
    if (-not (Test-Path $extracted)) { throw "The NSIS archive did not contain the expected nsis-3.13 folder." }
    Move-Item -LiteralPath $extracted -Destination $NsisRoot
    Remove-Item -LiteralPath $zipPath -Force -ErrorAction SilentlyContinue
    $actualNsis = Get-Sha1 (Join-Path $NsisRoot 'NSIS.exe')
    if ($actualNsis -ne $NsisExeSha1) { throw "Extracted NSIS failed hash verification: $actualNsis" }
}

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $PluginPath) | Out-Null
$validPlugin = $false
if (Test-Path $PluginPath) {
    try { $validPlugin = (Get-Sha1 $PluginPath) -eq $PluginSha1 } catch { $validPlugin = $false }
}
if (-not $validPlugin) {
    Invoke-DownloadWithRetry $PluginUrl $PluginPath $PluginSha1
}
Write-Host 'NSIS 3.13 and Tauri utility plugin are cached and SHA-1 verified.' -ForegroundColor Green

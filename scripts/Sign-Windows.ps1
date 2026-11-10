<#
  Optional Authenticode signing for Prayer Times (Windows x64).

  Signing runs ONLY when a code-signing certificate is supplied; otherwise the
  script prints a notice and exits successfully, so unsigned local builds keep
  working. No certificate is stored in this project.

  Provide ONE of:
    WINDOWS_CERTIFICATE_PATH      Path to a .pfx file
    WINDOWS_CERTIFICATE           Base64-encoded .pfx (e.g. a GitHub Actions secret)
  Optional:
    WINDOWS_CERTIFICATE_PASSWORD  Password for the .pfx
    WINDOWS_TIMESTAMP_URL         RFC 3161 timestamp server (default: DigiCert)
    SIGNTOOL_PATH                 Explicit path to signtool.exe

  Usage: .\scripts\Sign-Windows.ps1 -Path <file> [-Path <file2> ...]
#>
param(
    [Parameter(Mandatory = $true)]
    [string[]]$Path
)
$ErrorActionPreference = 'Stop'

$pfxBase64 = $env:WINDOWS_CERTIFICATE
$pfxPath = $env:WINDOWS_CERTIFICATE_PATH
$pfxPassword = $env:WINDOWS_CERTIFICATE_PASSWORD
$timestampUrl = if ([string]::IsNullOrWhiteSpace($env:WINDOWS_TIMESTAMP_URL)) { 'http://timestamp.digicert.com' } else { $env:WINDOWS_TIMESTAMP_URL }

if ([string]::IsNullOrWhiteSpace($pfxBase64) -and [string]::IsNullOrWhiteSpace($pfxPath)) {
    Write-Host 'Code signing skipped: no certificate provided (set WINDOWS_CERTIFICATE_PATH or WINDOWS_CERTIFICATE to sign).' -ForegroundColor DarkYellow
    $global:LASTEXITCODE = 0
    return
}

function Find-SignTool {
    if (-not [string]::IsNullOrWhiteSpace($env:SIGNTOOL_PATH) -and (Test-Path -LiteralPath $env:SIGNTOOL_PATH)) { return $env:SIGNTOOL_PATH }
    $command = Get-Command signtool.exe -ErrorAction SilentlyContinue
    if ($command) { return $command.Source }
    $kits = Join-Path ${env:ProgramFiles(x86)} 'Windows Kits\10\bin'
    if (Test-Path $kits) {
        $candidate = Get-ChildItem -Path $kits -Filter signtool.exe -Recurse -File -ErrorAction SilentlyContinue |
            Where-Object { $_.FullName -match '\\x64\\' } |
            Sort-Object { $_.Directory.Parent.Name } -Descending |
            Select-Object -First 1
        if ($candidate) { return $candidate.FullName }
    }
    throw 'signtool.exe was not found. Install the Windows SDK (signing tools) or set SIGNTOOL_PATH.'
}

$temporaryPfx = $null
try {
    if (-not [string]::IsNullOrWhiteSpace($pfxBase64)) {
        $temporaryPfx = Join-Path ([System.IO.Path]::GetTempPath()) ("prayer-times-sign-" + [guid]::NewGuid().ToString('N') + '.pfx')
        [System.IO.File]::WriteAllBytes($temporaryPfx, [Convert]::FromBase64String($pfxBase64.Trim()))
        $pfxPath = $temporaryPfx
    }
    if (-not (Test-Path -LiteralPath $pfxPath)) { throw "Code-signing certificate not found: $pfxPath" }

    $signtool = Find-SignTool
    foreach ($file in $Path) {
        if (-not (Test-Path -LiteralPath $file)) { throw "File to sign was not found: $file" }
        Write-Host "Signing $file" -ForegroundColor Yellow
        $arguments = @('sign', '/fd', 'SHA256', '/f', $pfxPath)
        if (-not [string]::IsNullOrEmpty($pfxPassword)) { $arguments += @('/p', $pfxPassword) }
        $arguments += @('/tr', $timestampUrl, '/td', 'SHA256', '/d', 'Prayer Times', $file)
        & $signtool @arguments
        if ($LASTEXITCODE -ne 0) { throw "signtool failed to sign $file (exit code $LASTEXITCODE)." }
        & $signtool verify /pa /q $file
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "The signature on $file was applied but does not chain to a trusted root on this machine (expected for self-signed test certificates)."
        } else {
            Write-Host "Signature verified: $file" -ForegroundColor Green
        }
    }
}
finally {
    if ($temporaryPfx -and (Test-Path -LiteralPath $temporaryPfx)) { Remove-Item -LiteralPath $temporaryPfx -Force -ErrorAction SilentlyContinue }
}

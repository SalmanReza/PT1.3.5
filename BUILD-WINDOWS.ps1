$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $ProjectRoot
try {
    Write-Host 'Prayer Times - Windows x64 build' -ForegroundColor Cyan

    foreach ($tool in @('node', 'npm', 'cargo', 'rustc', 'rustup')) {
        if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
            throw "Required tool '$tool' was not found. Install Node.js 20+ and Rust stable (MSVC x64), then reopen this shell."
        }
    }

    $rustVersionText = (& rustc --version)
    if ($rustVersionText -notmatch 'rustc (\d+)\.(\d+)\.(\d+)') {
        throw "Could not read the Rust version: $rustVersionText"
    }
    $rustMajor = [int]$Matches[1]
    $rustMinor = [int]$Matches[2]
    if (($rustMajor -lt 1) -or (($rustMajor -eq 1) -and ($rustMinor -lt 90))) {
        throw "Rust 1.90 or newer is required by the Tauri plugins. Found: $rustVersionText"
    }

    if (-not (Get-Command cl.exe -ErrorAction SilentlyContinue)) {
        throw 'MSVC C++ compiler is not active. Open Developer PowerShell for Visual Studio 2022 with Desktop development with C++ and a Windows SDK installed.'
    }

    Write-Host 'Preparing the Windows x64 MSVC target...' -ForegroundColor Yellow
    rustup target add x86_64-pc-windows-msvc
    if ($LASTEXITCODE -ne 0) { throw 'Could not install the x86_64-pc-windows-msvc Rust target.' }

    Write-Host 'Checking the source and running automated tests...' -ForegroundColor Yellow
    npm run check
    if ($LASTEXITCODE -ne 0) { throw 'Source checks failed.' }
    npm test
    if ($LASTEXITCODE -ne 0) { throw 'Automated tests failed.' }

    Write-Host 'Installing frontend and Tauri build dependencies...' -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) { throw 'npm install failed.' }

    # Build the actual application first. This step deliberately skips installer bundling,
    # so a GitHub/NSIS 504 cannot prevent the raw EXE from being produced.
    Write-Host 'Compiling the Windows x64 application executable (without bundling)...' -ForegroundColor Yellow
    npm run build -- --no-bundle
    if ($LASTEXITCODE -ne 0) { throw 'Tauri application compilation failed.' }

    $Executable = Join-Path $ProjectRoot 'src-tauri\target\release\prayer-times-desktop.exe'
    if (-not (Test-Path $Executable)) { throw "The application executable was not found: $Executable" }
    Write-Host "Application executable is ready: $Executable" -ForegroundColor Green

    # Optional Authenticode signing. Runs only when WINDOWS_CERTIFICATE_PATH or
    # WINDOWS_CERTIFICATE is set; otherwise it reports that signing was skipped.
    $SignScript = Join-Path $ProjectRoot 'scripts\Sign-Windows.ps1'
    & $SignScript -Path $Executable

    Write-Host 'Preparing and verifying NSIS 3.13 and its Tauri plugin...' -ForegroundColor Yellow
    try {
        & (Join-Path $ProjectRoot 'scripts\Prepare-NSIS.ps1')
    } catch {
        Write-Warning 'Installer tooling could not be prepared. The standalone application EXE is still available at the path printed above.'
        throw
    }

    Write-Host 'Creating the NSIS installer from the already compiled application...' -ForegroundColor Yellow
    $bundled = $false
    for ($attempt = 1; $attempt -le 3; $attempt++) {
        npx tauri bundle --bundles nsis
        if ($LASTEXITCODE -eq 0) { $bundled = $true; break }
        if ($attempt -lt 3) {
            $delay = [Math]::Min(60, [Math]::Pow(2, $attempt) * 5)
            Write-Warning "NSIS bundling failed (attempt $attempt/3). Retrying in $delay seconds. The EXE remains available."
            Start-Sleep -Seconds $delay
        }
    }
    if (-not $bundled) { throw "NSIS installer bundling failed after three attempts. The standalone EXE is still available: $Executable" }

    $InstallerDirectory = Join-Path $ProjectRoot 'src-tauri\target\release\bundle\nsis'
    $Installer = Get-ChildItem -Path $InstallerDirectory -Filter '*-setup.exe' -File -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $Installer) { throw "No NSIS installer was found under $InstallerDirectory. Standalone EXE: $Executable" }
    & $SignScript -Path $Installer.FullName

    Write-Host ''
    Write-Host 'Build completed successfully.' -ForegroundColor Green
    Write-Host "Installer: $($Installer.FullName)" -ForegroundColor Green
    Write-Host "Executable: $Executable" -ForegroundColor Green
    Write-Host 'The installer uses the small WebView2 bootstrapper if the runtime is missing.'
}
finally {
    Pop-Location
}

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readText } from './helpers/read-text.js';

const workflow = readText('../.github/workflows/build-windows.yml', import.meta.url);

test('GitHub Actions detects the actual project root before npm install', () => {
  assert.match(workflow, /name: Locate the actual desktop project directory/);
  assert.match(workflow, /Test-Path \(Join-Path \$root 'package\.json'\)/);
  assert.match(workflow, /Get-ChildItem -Path \$root -Filter 'package\.json' -File -Recurse/);
  assert.match(workflow, /src\/app\.js/);
  assert.match(workflow, /src-tauri\/tauri\.conf\.json/);
  assert.match(workflow, /working-directory: \$\{\{ steps\.locate\.outputs\.project_dir \}\}/);
  assert.match(workflow, /if \(-not \(Test-Path '\.\/package\.json'\)\)/);
  assert.match(workflow, /npm install/);
});

test('all build commands and artifacts use the detected project directory', () => {
  assert.match(workflow, /npm run build -- --no-bundle/);
  assert.match(workflow, /\$\{\{ steps\.locate\.outputs\.project_dir \}\}\/src-tauri\/target\/release\/prayer-times-desktop\.exe/);
  assert.match(workflow, /\$\{\{ steps\.locate\.outputs\.project_dir \}\}\/src-tauri\/target\/release\/bundle\/nsis/);
});

test('v1.3.1 workflow hardening: LF checkout, lockfile install, Rust check, cache, clean signing skip', () => {
  const signer = readText('../scripts/Sign-Windows.ps1', import.meta.url);
  assert.ok(workflow.indexOf('git config --global core.autocrlf false') < workflow.indexOf('uses: actions/checkout@v4'), 'autocrlf is disabled before checkout');
  assert.match(workflow, /cache: npm\n\s+cache-dependency-path: '\*\*\/package-lock\.json'/);
  assert.match(workflow, /if \(Test-Path '\.\/package-lock\.json'\) \{\n\s+npm ci\n/);
  assert.match(workflow, /Rust 1\.90 or newer is required/);
  assert.match(workflow, /workspaces: '\$\{\{ steps\.locate\.outputs\.project_rel \}\}\/src-tauri -> target'/);
  assert.match(workflow, /if \(-not \(Test-Path \$exe\)\) \{ throw "The executable was not produced/);
  assert.equal((workflow.match(/Sign-Windows\.ps1 -Path [^\n]+\n\s+exit 0/g) || []).length, 2, 'both signing steps end cleanly when skipped');
  assert.match(signer, /\$global:LASTEXITCODE = 0\n\s+return/);
  assert.match(readText('../package-lock.json', import.meta.url), /"node_modules\/@tauri-apps\/cli-win32-x64-msvc"/);
  assert.doesNotMatch(readText('../BUILD-WINDOWS.ps1', import.meta.url), /[^\x00-\x7F]/, 'ASCII-only for Windows PowerShell 5.1');
});

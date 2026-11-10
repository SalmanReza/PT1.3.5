import fs from 'node:fs';

// Read a project text file the same way on every OS: git on Windows may check
// files out with CRLF endings (core.autocrlf) or a BOM, which would break the
// source-level regex checks. Normalise to LF so tests are platform-independent.
export function normalizeText(text) {
  return String(text).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
}

export function readText(path, base) {
  return normalizeText(fs.readFileSync(new URL(path, base), 'utf8'));
}

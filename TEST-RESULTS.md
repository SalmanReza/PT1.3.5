# Test results — Prayer Times Desktop v1.3.5

## Windows CI failure (v1.3.0, windows-2022, 88/89)

- Failing test: `tray tooltip is wired cheaply and the tray keeps its menu` (tests/tray-tooltip.test.js).
- Root cause: the test checks source text with a regex that contains `\n`. On Windows, Git checked the files out with CRLF, so the regex did not match. Linux checkouts use LF, which is why it passed there.
- Fix: every test reads files through `tests/helpers/read-text.js`, which strips CRLF and BOM. `.gitattributes` keeps text files LF. The workflow sets `core.autocrlf false` before checkout. `tests/determinism.test.js` fails the suite if a test reads a file without normalising it or uses the real current date.

## Automated checks

- `npm test`: **246/246 passed** (v1.3.3; was 224 in v1.3.1). New test files:
  - sound
  - calculation-methods
  - time-format
  - day-status
  - daily-reflections
  - ui-fonts (10 options, sanitising, files, licences, size, CSS variable)
  - v1.3.2: progress-lines, prayer-evidence, prayer-card-notes, prayer-boundary, day-timeline, tick-lock, interval-rows, sky
  - determinism
  - workflow hardening
- Matrix: all 246 passed in every combination below (with `.gitattributes` present; with the file absent the one `.gitattributes` test skips and the other 245 pass).
  - CRLF copy of the whole project × `LANG=C`.
  - Time zones: UTC, Asia/Dhaka, America/Los_Angeles, Europe/London, Asia/Tehran, Pacific/Kiritimati, America/St_Johns.
  - Faked system clock (a Date preload): Ramadan last-ten night, both Eids, a Friday, the EU DST changes on 29 Mar and 25 Oct 2026, 00:30 before Fajr, and 31 Dec 2028 23:59.
- `npm run check`: passed.
- `npm ci` from the committed lockfile: passed.
- `npm run web:build`: passed.
- `cargo check --locked --target x86_64-pc-windows-msvc` (Rust 1.99.1, on Linux, with a stub resource compiler): passed. This checks that the code compiles only. It does not link a Windows .exe.
- Prayer times were compared with adhan-js and praytimes.org reference values for every method and school, and agree within 1 minute. Every method × school × high-latitude rule gives correctly ordered times across the dates and latitudes tested, including 60°N in June.

## Browser QA (headless Chrome, built frontend, mocked clock, TZ Asia/Dhaka)

- Coverage:
  - Every screen: home, countdown, settings, calculation profile, shortcut guide.
  - All 10 themes × EN/BN × normal/compact, half of them in 12-hour mode.
  - Widths 640–3840 in 12-hour mode.
- Result: **0 console errors and 0 overflowing or ellipsis-truncated elements.**
- Status line / progress card: 21 fake-date scenarios (Ramadan, Eid, Arafah, Ashura, white days, night 27, plain days at several times, Friday, Ja‘fari, no location, EN/BN, 12h/24h) report zero problems. Ordinary days show the conversational progress line; date-specific headlines keep priority.
- Fonts (Settings → Font): all 10 real options, i.e. System default plus the 9 bundled fonts, were run with EN/BN × normal/compact × widths 640/1024/1440/2560 in 12-hour mode, on a long-reflection day, a last-ten-nights day and a Friday (160 page loads; countdown and Settings screens at 640 and 1440). 0 console errors, 0 overflow, 0 ellipsis truncation, status text never overlaps the figure. Each run also checks that the font file actually loaded (no decode or network error) and that body text and buttons use the chosen family. A font choice saves, an unknown saved value falls back to System, and settings saved by older versions load with System.
- Clock: the Settings toggle switches every visible time and is saved. Default 24-hour output is byte-identical to v1.3.0.
- History migration: v1.2.8, v1.2.9, v1.3.0 and malformed saved data all load with no errors. Fard and voluntary records are unchanged, the weekly view draws 7 mini figures, and invalid settings fall back to their defaults.
- Keyboard: ? opens and Esc closes the guide; End, Home and PageDown scroll; F11 calls set_fullscreen; shortcuts are ignored while typing.
- Sound: ticking with sound on creates one AudioContext; with sound off it creates none.

## v1.3.2 browser QA (headless Chrome, fake clock and fake timers, TZ Asia/Dhaka)

- Full-day simulation (`day-sim`): midnight to midnight in 1-minute steps plus every boundary ±1 s, with hide/restore and clock-jump edges, for Hanafi, Shafi‘i and Ja‘fari × EN/BN × 12h/24h, on a Friday, a plain Tuesday, a Ramadan-end night and both Eid days. **0 problems** in 18 scenarios (about 1,500 snapshots each).
  - Checked each step: hero = next event of any kind from one timeline, never 00:00:00; "Current" never stale; live section is first; interval rows; lock state; tray tooltip; reminders.
- Lock QA: tick and untick before the next event, lock after it, persisted flag, click / Enter / Space ignored, tooltip and aria text, old history, weekly view. **ALL OK.**
- Reference section: 10 fonts × themes × normal/compact × EN/BN × widths 640–3840, **0 overflow**. Fonts QA: no problems.
- Sky panel: night, dawn, midday and dusk screenshots in dark and ivory themes; transform/opacity-only animation; paused when hidden.

### Bugs the full-day hunt found and fixed (v1.3.2)

1. Hero stuck at 00:00:00 after an event began, and "Current: Isha" shown after Fajr: refresh now runs at the exact boundary, on a 1 s check, and on gaps, clock-back, day change and visibility change.
2. Hero counted only prayers: now one ordered timeline (prayers, prohibited times, Ja‘fari midnight) with same-instant priority.
3. Tray tooltip, reminders and hero could disagree at a boundary: all use the same timeline.
4. A hard-coded profile label in the hero and untranslated Bangla headings.
5. Bangla "events" text corrupted by a replace.
6. `toggleSubPrayer` untick path referenced an undefined `kind` (now `layer`); `togglePrayer` untick now clears the saved time.
7. Lock QA caught an imported function used as a truthy flag, which marked every live button as locked: replaced with the lock text and a regression test added.
8. Sky panel: star radius compounded on resize; the altitude label could read "−1° above the horizon".
9. Compact Bangla at 3840 px: the live-event note overflowed; it now wraps.
10. Four tests assumed the Dhaka time zone or a longitude beyond ±180°: now independent of the machine zone (Kiritimati UTC+14 included).

### v1.3.2 rule fixes (second pass)

- No wording about missed prayers anywhere in the progress lines (the whole "Missed one" family is gone); a test scans every enumerable line in EN and BN.
- Heads-up cycle: reaction right after a tick, then plain facts, then the next-prayer heads-up only inside its learned 20-45 min window; Duha/Awwabin heads-up only in the 10 minutes before they open; none for batch-tickers. A day-simulation test asserts no heads-up outside its window.
- Variety: 398,054 English and 426,109 Bangla distinct lines (`variantCount`; a test asserts at least 100,000 each).
- Top layout: Available right now (live card and any prohibited-interval row), then one Next event card; the duplicate "next prayer event" row and empty-state card are gone.
- Sky panel: taller strip, large glowing sun (16 rays) and crescent, stepped retro halos, scanlines, 72 brighter stars.
- Checked again: full-day simulation (18 scenarios) 0 problems; CRLF copy, no-`.gitattributes` run and the time zones UTC, Kiritimati and Los Angeles all pass.

### v1.3.5 results

- `npm run check` passed; `npm test`: 256/256 (LF) and on a CRLF copy with `LANG=C`. Screenshots (headless Chrome, fake clock, TZ Asia/Dhaka): main, sky day, sky night, settings, no page errors. `day-sim`/`fonts-qa` were not re-run (budget). The tile patterns and sizes are unverified on real WebView2.

- F11 mouse: root cause is a hypothesis from source and issue-tracker reading (moderate confidence); the fix is not compiled or run here and needs a Windows 10 check: press F11, click and hover cards, press F11 again, repeat 5 times, also from a maximised and from a restored window.

### v1.3.4 results

- `npm run check` passed. `npm test`: **254/254** (LF) and **254/254** on a CRLF copy with `LANG=C`. New/changed tests: v134 (sky colours, zone accuracy, sound, layout, fullscreen wiring), sections-settings (per-card toggles, seasonal reminder rows), progress-lines (Bangla natural-phrasing check; the 100,000-line minimum checks were removed as requested, repeated-word, length and banned-wording checks kept).
- Browser QA (headless Chrome, fake clock, TZ Asia/Dhaka): main screen, sky, forbidden state, Bangla header and settings screenshots with no page errors; `lock-qa`: all checks OK except the one that read the removed 7-day History strip (expected, item 12). `day-sim` and `fonts-qa` were not re-run this round (budget); they last passed on v1.3.3.
- Not verified (Windows only, uncompiled here): the `set_window_fullscreen` Rust command (F11 mouse fix), the v1.3.3 native toast command, and the 20%-larger Fard tick and card ornament on real WebView2 rendering.

## v1.3.3 notes

### v1.3.3 results

- `npm test`: 246/246 (LF); CRLF copy with `LANG=C`: 246/246; without `.gitattributes`: 245 pass + 1 skipped. New: card-countdown, sections-settings, windows-notifications, reopen tests in progress-lines, zone/time-axis tests in sky.
- Browser QA (headless Chrome, fake clock, TZ Asia/Dhaka): `day-sim` (4 groups, Hanafi/Shafi'i/Ja'fari, English/Bangla, 12h/24h, edge dates) found no hero, forbidden-card, heading, reminder or notification problems. Its only findings are 19 daily-countdown readings that are one minute off at a sub-second sampling instant (the line refreshes every second; benign). `fonts-qa` (80 runs): no problems. `lock-qa`: all OK.
- Screenshots: /workspace/mock/v133-*.png.

### Windows 10 notifications

**Root cause (from reading the sources of tauri-plugin-notification 2 and notify-rust 4.19, and the NSIS bundler):**
- A Windows toast is shown only if its AppUserModelID (AUMID) is registered, which for a desktop app means a Start Menu shortcut carrying that AUMID. The NSIS installer's shortcut carries the bundle identifier `com.prayertimes.desktop`.
- The plugin sends every toast with that identifier (unless the exe sits in a `target\debug` or `target\release` folder) and throws away the result of `show()`. With no matching shortcut (portable copy, installer run without shortcuts, deleted shortcut, a stale shortcut from an older identifier) Windows 10 drops the toast without an error. The page also marked the reminder as sent, so it was never retried, and the plugin's permission call always answers "granted" on desktop, so nothing in the app ever showed a problem.

**Fix:** `notify_native` (src-tauri/src/main.rs) sends the toast itself with notify-rust. It uses the app identity when `Prayer Times.lnk` exists in the user or common Start Menu, otherwise the always-registered PowerShell identity (shown under that name, but shown). It returns the real error string. The page calls it first and falls back to the plugin only if the command is missing. A failed reminder is forgotten and retried. "Send test notification" in Settings reports the path used and a diagnosis (shortcut found or not, Focus assist, Windows notification settings).

**Verified here:** the page logic, fallback rules, retry-on-failure and the Settings button (unit tests and fake-clock browser QA with a mocked `invoke`); `Cargo.lock` is consistent (`cargo metadata --locked`); the notify-rust 4.19 API usage (`Notification::app_id(&str)`, `show()` returning a Result) was checked against the crate source.
**Assumed (not verified):** that the Rust compiles on Windows (this Linux box has Rust 1.85 and no Windows target, so `cargo check` cannot run, and the earlier v1.3.2 check does not cover the new code); that the NSIS shortcut is named `Prayer Times.lnk` in the Start Menu Programs folder; the behaviour of Windows 10 itself, including Focus assist.

### Manual test checklist (Windows 10 x64, installed NSIS build)

1. Install with the NSIS installer (not a copy of the exe). Confirm `Prayer Times` appears in the Start Menu.
2. Open Settings > Windows integration > Send test notification. A toast should appear and the status line should say the app's own identity is used.
3. Rename or delete the Start Menu shortcut, restart the app, press the button again: a toast under the name "Windows PowerShell" should appear and the status should say so. Restore the shortcut.
4. Turn Focus assist / Do not disturb on: the toast goes to Action Center (expected); confirm the status text mentions Focus assist when nothing is shown.
5. Settings > Notifications: set a reminder a few minutes ahead and confirm the toast arrives once, while the window is hidden in the tray.
6. Close the window to the tray, click the tray icon and confirm Today's progress shows a different line each time; clicking the tray icon while the window is already visible must not change it.
7. Hide and show Prayer descriptions, Sunnah & Seerah and On this day in Settings; restart the app and confirm the choice is kept.

## Not verified here (needs Windows hardware)

- Native .exe link and NSIS bundling. These are expected from the GitHub workflow.
- WebView2 rendering with Segoe UI / Nirmala UI.
- Tray tooltip, notifications (see the v1.3.3 notes above), the Rust build of the new native commands, F11 and audio output on a real Windows desktop.
- Authenticode signing with a real certificate.

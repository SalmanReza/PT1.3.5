# Prayer Times — Windows desktop application (v1.3.5)

**Windows 10/11 x64 · Tauri 2 · Rust · WebView2 · NSIS · v1.3.5**

© 2026–2027 Salman Reza Amit

Prayer Times is a local-first Windows prayer companion. It uses a native Tauri desktop shell and a bundled offline interface/calculation engine. It is not a browser extension and does not require Firefox.

## Product rules and privacy

- No calendar screen or calendar module.
- No automatic location detection, Windows location permission, login, user account, analytics, telemetry or cloud synchronisation.
- A fresh installation starts without a preset location. The user must provide a Google Maps link or enter latitude and longitude manually before prayer calculations begin.
- Users can replace the location using manual latitude/longitude or a Google Maps sharing link.
- Expanded Google Maps URLs containing coordinates are parsed locally. Shortened `maps.app.goo.gl` links cannot be expanded offline; copy the coordinates from Google Maps or enter them manually. Only latitude and longitude are stored locally; there is no separate place-name lookup.
- Prayer calculations, prayer history, settings, themes, language preference and location are stored in the app's local WebView2 profile. No cloud or account service is used.
- Prayer calculations, expanded Maps-link parsing, daily Islamic content and prayer history work without internet. The app itself makes no network requests. Windows may need internet during installation if the WebView2 runtime is missing.
- Location coordinates do not silently alter the Windows time zone. The app uses the time zone configured on the device.

## Included features

### Prayer times and daily information

- Daily Islamic content is ordered with **On this day in Islamic history** and the Qur’anic revelation card first, followed by **Sunnah & Seerah**. The former Hijri prayer-event card is grouped under Sunnah & Seerah rather than being called “Hijri Worship”.
- Weekly Prayer History and Weekly Prayer Progress are grouped together under Your Record.
- The Seerah glimpse is sourced and does not claim a general hadith report happened on the exact current date. The Islamic-history card shows every entry for the exact Hijri date, then month-level entries for the month (labelled as such); only when nothing matches does it display the nearest documented anniversary, clearly labelled as a nearest match, not an event occurring today. When several items match, a counter such as **1 / 4** and ‹ › buttons page through them.
- Qur’anic revelation matching checks exact date, then week of month, then month, then the nearest documented period. Every matching record is available through the card's ‹ › controls; each page displays only one verse and suggests the rest of the passage or Surah. The first-revelation record uses a qualified Ramadan month-level match because historical reports differ about both the month and exact day.

- Offline solar prayer-time calculation. Default (unchanged): Karachi 18° Fajr / 18° Isha and Hanafi Asr shadow factor 2. Settings → Calculation method offers Muslim World League, ISNA, Egyptian, Umm al-Qura (Isha +120 min in Ramadan), Karachi, Gulf, Kuwait, Qatar, Singapore, Turkey Diyanet, Tehran and Shia Ithna Ashari; Asr/juristic school Hanafi, Shafi‘i, Maliki, Hanbali or Ja‘fari; and a high-latitude rule (none, middle of the night, one-seventh, angle-based). Ja‘fari mode uses the angle-based Maghrib, Asr factor 1, shows midnight as the end of Isha, notes the combining of Dhuhr+Asr and Maghrib+Isha, and hides Hanafi-specific guidance. Changes recompute immediately; history is unaffected.
- Dhuhr begins after the six-minute Zawal exclusion interval; the prohibited interval is displayed separately.
- Hanafi prohibited times: the timetable shows sunrise → sunrise + 20 min, the Zawal interval, and the last 15 min before sunset in the same gold style, and a subtle bilingual notice appears under Prayer events while one of them is in progress (the sunset notice notes that the day's own unprayed Asr may still be offered). The 20/15-minute values are practical approximations.
- Five obligatory prayers, sunrise, sunset, date navigation and a live HH:MM:SS clock.
- Current/overlapping available prayer events and next obligatory prayer with continuously updating countdowns.
- Separate countdown screen with a Back control. Prayer-name buttons navigate to their reference description; countdown buttons open the focused countdown.
- A Hijri date is displayed alongside the Gregorian date. The calendar uses the device's Umm al-Qura implementation as an estimate; local moon-sighting may differ by a day.
- The Islamic History and Qur’anic revelation cards sit immediately below Voluntary Prayers; Sunnah & Seerah follows them. The Sunnah & Seerah area contains the Hijri observance guidance and a sourced daily-life glimpse, with disputed dates and practices qualified.
- Recognised days and periods include Ashura/Tasu’a, the first ten days of Dhul Hijjah, Arafah, Eid al-Fitr, Eid al-Adha, Ramadan, the last ten nights, the commonly observed Laylat al-Qadr date, Badr and the commonly cited date of the Conquest of Makkah.
- Date-specific prayer events are time-gated: Eid prayer appears only in its morning window on the two Eids; Tarawih appears only after Isha during Ramadan. They are not presented as everyday prayers.
- Jumu’ah guidance appears in place of the ordinary Dhuhr rak‘ah arrangement on Fridays. The mosque's actual khutbah and congregation time remain local and are not guessed by the app.

### Prayer tracking

- Circular completion controls appear only for events currently inside their calculated time windows.
- Completion marks can be corrected/unchecked. Every layer has its own short synthesised tick from one wooden family on a pentatonic scale (Fard fuller and lowest, Sunnah brighter, Nafl softer, standalone voluntary airy, seasonal festive); closing a ring plays a two-note flourish and completing the day a short rising chime. Settings → Tick sound: Wooden (default), Soft or Crystal. Web Audio only, under 120 ms, respects the sound toggle and reduced motion.
- **Today's progress** is a set of concentric circles, inside out: **white Fard centre** (five thin segments that become a solid white disc after the fifth Fard; soft ivory with a neutral outline on light themes), **green Sunnah ring** (#1E8E5A), **black Nafl ring** (#141414, with a faint light edge on dark themes), **red-and-black striped ring** for the standalone voluntary prayers (Duha, Witr, Tahajjud …), and on days that have them an outermost **saffron ring** (#E8A33D) for date-specific prayers (Tarawih, Eid prayer). The figure keeps the same diameter when the saffron ring appears.
- Each ring fills clockwise from 12 o'clock, one segment per item in prayer-time order; unfinished segments are faded tracks. A tick sweeps in only its own segment (~400 ms), a ring closes with a soft glow only when all its segments are done, and unticking reverts. When every present layer is complete, **الحمد لله** fades into the white centre in green Aref Ruqaa (bundled subset, SIL OFL).
- Each prayer row lists its parts in performance order (e.g. Dhuhr: 4 Sunnah before · 4 Fard · 2 Sunnah after · 2 Nafl): a larger white Fard tick and smaller green Sunnah and black Nafl ticks, labelled with rak‘ah counts; tick colours use the same tokens as the rings. Rows outside their window are faded with an “Opens at” note.
- **Good Job** = all five Fard. **Great Job** and the reward = every layer present that day. Weekly Prayer Progress shows a mini figure per day. Older records keep their marks; nothing is lost.
- **Day-aware status line** under Today's progress, chosen offline in priority order: (1) date-specific days from the Hijri calendar (Eid, Eid eve, Arafah, Days of Tashriq, first ten of Dhul Hijjah, Ramadan day N with the Iftar time, Tarawih after Isha, last ten nights and the commonly observed 27th night, mid-Sha‘ban, Tasu‘a/Ashura, Islamic New Year, the white days 13–15); (2) weekday (Friday: Jumu‘ah Mubarak with al-Kahf and salawat; Monday/Thursday fasting); (3) progress (Bismillah before the first Fard, “3 of 5 Fard done · Next: Asr at 3:38 PM”, Alhamdulillah); (4) the day's reflection. Ja'fari mode leaves out Sunni-specific items (Tarawih, the 27th-night convention, Monday/Thursday and Ashura fasting).
- **Daily reflection**: 365 short lines (200 brief Qur'an paraphrases with surah:ayah, 140 sahih/hasan hadith with their collection, 25 uncited adhkar and good-conduct reminders), each in English and Bangla, chosen by day of the year. Shown as a quiet subtitle (hidden in compact mode) and as the fallback status line.
- Every displayed prayer event has a rak‘ah breakdown, practical performance guidance and a concise history/context note. The guidance is Hanafi-oriented where relevant and explicitly identifies differences among schools or disputed reports.
- The reference includes the five Fard prayers, Friday Jumu’ah, regular Sunnah Rawatib, Duha/Ishraq, Awwabin, Qiyam, Tahajjud, Witr, Tarawih, Eid prayer, Tahiyyat al-Masjid, Istikhara and Tawbah.
- **Weekly Prayer Progress** covers seven full calendar days, **Saturday to Friday**, with Friday last and highlighted. Every day — Friday included — has five Fard cells, so a week has **35 Fard**. Each day keeps its five-cell Fard square and circular Nafl ring; Fard and Nafl totals are reported separately rather than combined into a weighted score, and today is outlined.
- Friday's midday slot is labelled **Dhuhr/Jumu’ah** (যোহর/জুমা) in the daily list, the weekly grid, the next-prayer card, reminders and the tray tooltip. Either prayer completes it: Jumu’ah replaces Dhuhr for those obliged to attend, and anyone who does not attend prays Dhuhr. Existing records keep their keys, so no history is lost.
- Why Saturday to Friday: classical fiqh texts (e.g. al-Nawawi, *al-Majmu‘*) count Saturday as the first day of the week and Friday as its last, citing the creation hadith in Sahih Muslim 2789, and Friday is the Muslim day of gathering (Sahih Muslim 855–856).
- Seven-day completion history and JSON data export/reset.

### Appearance and settings

- Ten colour themes: five dark and five light.
- English and Bangla interface modes, including navigation, settings, prayer guidance, historical notes, notifications, dates, and Bengali numerals/time formatting.
- Compact desktop mode.
- **Font** (Settings → Font, bilingual labels): ten interface fonts that all cover Latin and Bangla with Bengali digits. **System default** (Segoe UI Variable / Segoe UI + Nirmala UI, the unchanged v1.3.0 look) plus nine bundled offline WOFF2 subsets under the SIL OFL: Hind Siliguri, Noto Sans Bengali, Noto Serif Bengali, Anek Bangla, Baloo Da 2, Tiro Bangla, Atma, Mina and Galada (about 1.0 MB in total, licences in `src/fonts/ui/`). Applied app-wide through one CSS variable and saved locally; an unknown saved value falls back to the default. The الحمد لله reward keeps Aref Ruqaa.
- **Clock format**: 24-hour (default, as before) or 12-hour, applied everywhere a time appears (live clock, timetable, countdown targets, prohibited-time rows, reminders, “Opens at” notes, the status line). Bangla 12-hour uses Bengali digits with the day-period word first: ভোর ৪:৫২ · সকাল · দুপুর · বিকাল · সন্ধ্যা · রাত ৯:০০.
- Collapsible calculation profile showing the selected method, school, high-latitude rule, device time zone and the Zawal rule.
- Per-prayer manual time adjustments.
- Location and all preferences saved locally.

### Windows integration

- System-tray icon and menu: **Open Prayer Times** and **Exit Prayer Times**.
- Clicking the window's X hides it to the tray; it does not terminate the reminder scheduler.
- Left-clicking the tray icon restores the window. **Exit Prayer Times** fully terminates the app.
- Single-instance handling brings an existing window forward if the app is opened again.
- Optional **Start Prayer Times when Windows starts** setting. Startup launches hidden to the tray; this is disabled by default.
- The tray tooltip shows the next obligatory prayer and the time left, e.g. **Asr in 1h 23m** / **আসর শুরু হতে ১ ঘণ্টা ২৩ মিনিট বাকি**, following the language setting. It is refreshed by the existing 15-second tick, which keeps running while the window is hidden in the tray, and the tray is only updated when the text changes (about once a minute).
- **Remind me before a prayer begins**: for each of the five prayers, any whole number of minutes from 0 (off) to 180. One notification per prayer per day, sent only when Windows prayer notifications are enabled. This is in addition to the existing per-event reminders before a prayer period ends.
- Native Windows prayer notifications are optional and requested only when the user enables them. Notifications run while the app remains running, including in the tray. The app does not wake a sleeping or powered-off computer.

## Desktop sizing and 2160p / 4K displays

- The main window opens maximized on the available desktop work area. Press **F11** to enter true fullscreen mode (Escape exits); on a 3840 × 2160 (2160p/4K) display, fullscreen uses the full panel and the layout expands to the available screen, with a 1500 × 920 logical-pixel restored size.
- The window remains resizable; its minimum size is 640 × 480 logical pixels. F11 toggles native fullscreen mode; Escape exits fullscreen.
- The UI uses viewport-responsive root sizing (up to 28 CSS pixels at large viewports) and rem-based component dimensions, so typography, spacing, cards and controls scale smoothly as the window changes size.
- CSS container queries reflow the live-event cards, voluntary-prayer list, reference descriptions and Settings into wider desktop layouts when there is room. Narrower restored windows return to compact columns without changing prayer logic or hiding features.
- The maximum content width is 3400 CSS pixels, allowing the interface to use 2560 × 1440 and 3840 × 2160 desktops without stretching every text line across the entire screen. Windows/WebView2 logical pixels account for display scaling; the design does not apply a bitmap-style zoom transform.

## Resource use

The UI, fonts, prayer calculations and location settings are local. The one-second clock/countdown refresh is needed while the window is visible; a 15-second reminder check continues in the hidden app window while it remains in the tray. Tauri uses the installed Microsoft WebView2 runtime, so total Windows Task Manager memory use cannot honestly be guaranteed below 10 MB. This project avoids bundling a separate Chromium browser and avoids remote assets.

## Windows x64 build requirements

- Windows 10 x64 (version 1803 or later recommended) or Windows 11.
- Node.js 20+ and npm.
- Rust 1.90+ with the `x86_64-pc-windows-msvc` target.
- Visual Studio 2022 Build Tools with **Desktop development with C++**, MSVC and a Windows SDK.
- WebView2 Runtime. Windows 10 version 1803+ and Windows 11 normally include it.

Tauri's Windows installer uses NSIS. The configured `downloadBootstrapper` mode keeps the installer small and retrieves the WebView2 bootstrapper only if the runtime is missing. The fully offline WebView2 installer option adds approximately 127 MB, so it is not bundled by default. See the [official Tauri Windows prerequisites](https://v2.tauri.app/start/prerequisites/) and [Windows installer guide](https://v2.tauri.app/distribute/windows-installer/).

## Build locally on Windows

1. Extract the project ZIP to a writable folder.
2. Open **Developer PowerShell for VS 2022**.
3. Run:

   ```powershell
   Set-ExecutionPolicy -Scope Process Bypass
   .\BUILD-WINDOWS.ps1
   ```

4. The script first compiles the standalone executable with Tauri's `--no-bundle` option:

   `src-tauri\target\release\prayer-times-desktop.exe`

5. It then prepares the NSIS 3.13 cache, verifies the NSIS executable and utility DLL hashes, and bundles the installer separately:

   `src-tauri\target\release\bundle\nsis\`

If GitHub returns a 504 while NSIS is being downloaded, the script retries with increasing delays. If the installer stage still fails, the standalone EXE has already been compiled and remains available at the path above.

## Build with GitHub Actions

The repository includes `.github/workflows/build-windows.yml`. The workflow locates `package.json` and the Tauri project files before running npm, so it works whether the project files are at the repository root or inside one extracted project folder. Push this project to a GitHub repository and use the **Actions → Build Prayer Times for Windows** workflow (or push to `main`). The workflow builds on a Windows 2022 x64 runner and uploads `Prayer-Times-Windows-x64-Installer`. It also preserves `Prayer-Times-Windows-x64-Executable-Fallback` if the native executable was compiled but NSIS bundling still fails.

## Keyboard

| Key | Action |
| --- | --- |
| F11 | Toggle native fullscreen |
| Esc | Close the shortcut guide, exit fullscreen, leave the countdown screen, or return home from Settings |
| Home | Go to the home page and its top |
| Page Up / Page Down | Scroll by about one screen |
| End | Go to the bottom of the page |
| ? | Show or hide the shortcut guide |
| ← → | Previous / next item in a focused card with several items |
| Tab, Enter, Space | Move between and activate controls (including the tick circles) |

Shortcuts never fire while you are typing in a text field or choosing from a list (F11 and Esc excepted).

## Digital signature (optional Authenticode signing)

The app carries author metadata (`Salman Reza Amit`) in `package.json`, `src-tauri/Cargo.toml` and the Windows bundle (`publisher`, `copyright`). Authenticode signing is optional and is skipped automatically when no certificate is provided. No certificate is stored in the project.

- **Local build:** set `WINDOWS_CERTIFICATE_PATH` (path to a `.pfx`) and, if needed, `WINDOWS_CERTIFICATE_PASSWORD`, then run `BUILD-WINDOWS.ps1`. Both the standalone EXE and the NSIS installer are signed with SHA-256 and an RFC 3161 timestamp (`WINDOWS_TIMESTAMP_URL`, default DigiCert). `signtool.exe` comes from the Windows SDK, or set `SIGNTOOL_PATH`.
- **GitHub Actions:** add the repository secrets `WINDOWS_CERTIFICATE` (Base64 of the `.pfx`, e.g. `[Convert]::ToBase64String([IO.File]::ReadAllBytes('cert.pfx'))`) and `WINDOWS_CERTIFICATE_PASSWORD`. Without these secrets the signing steps print “Code signing skipped” and the build continues unsigned.
- The signing logic lives in `scripts/Sign-Windows.ps1`. Timestamping contacts the timestamp server only during the build; the app itself still makes no network requests.

## Project structure

```text
index.html                         Desktop UI
src/app.js                         UI, local history, progress, events and notifications
src/prayer-engine.js               Offline solar calculation engine
src/location.js                    Local coordinate and Maps URL parsing
src/islamic-content.js              Bilingual rak‘ah, guidance, source and Hijri-history data
src/daily-content.js                Date matching for the history, verse and Seerah carousels
src/weekly-cycle.js                 Saturday-to-Friday week, 35 Fard cells, Dhuhr/Jumu’ah slot
src/tray-tooltip.js                 Bilingual tray tooltip text (next prayer and time left)
src/forbidden-times.js              Hanafi prohibited intervals (sunrise, Zawal, before sunset)
src/reminder-schedule.js            Reminder minutes validation and due-window rules
src/keyboard.js                     Keyboard shortcut rules
src/carousel.js                     Carousel paging and bilingual counters
src/progress-figure.js              Today's progress circles, animation changes and reward rules
src/prayer-layers.js                Fard / Sunnah / Nafl / voluntary / seasonal layers and prayer parts
src/sound.js                        Synthesised per-layer ticks, flourish and chime (Web Audio)
src/time-format.js                  12/24-hour clock formatting (English and Bangla)
src/day-status.js                   Day-aware status line under Today's progress
src/daily-reflections.js            365 bilingual daily reflections with sources
src/branding.js                     Version, author and bilingual copyright
src/ui-fonts.js                    Ten interface font options and sanitising
src/fonts/                          Aref Ruqaa Bold subset (reward phrase); src/fonts/ui/ the nine selectable UI fonts (WOFF2 + OFL texts)
src/styles.css                     Ten themes and desktop interface
src-tauri/src/main.rs              Native tray, single instance and local-only desktop integration
src-tauri/tauri.conf.json          Tauri window and NSIS configuration
src-tauri/capabilities/default.json Native plugin permissions
tests/                              Node tests (calculations, location, content, keyboard, progress, carousels, branding)
scripts/Sign-Windows.ps1             Optional Authenticode signing (skips without a certificate)
scripts/Prepare-NSIS.ps1             Retry and SHA-1 verify NSIS 3.13 + utility DLL
.github/workflows/                  Windows x64 build workflow
BUILD-WINDOWS.ps1                   Local Windows build helper
```

## Verification status

v1.3.2: `npm test` passes all Node tests on Linux with LF and CRLF checkouts (see TEST-RESULTS.md); the native Windows executable is still not compiled here. v1.3.1: `npm test` passes all Node tests on Linux with LF and CRLF checkouts, in several time zones and with faked system dates; see TEST-RESULTS.md. v1.3.0: `npm test` passes all 89 Node tests and `npm run check` passes; see TEST-RESULTS.md. v1.2.9: `npm test` passed all 64 Node tests and `npm run check` passes the JavaScript syntax checks. `npm install` and `npm run web:build` (Vite) completed in the preparation environment. The built interface was also loaded in headless Chrome to check the progress figure, carousels, keyboard shortcuts, Bangla switching and the synthesised tick (rendered offline, ~60 ms).

**The native Windows executable has not been compiled in this environment** (no Windows/MSVC toolchain). Run `BUILD-WINDOWS.ps1` on Windows or use the GitHub Actions workflow. A Windows runtime check of F11 fullscreen, the tray and the sound is still recommended before release.

## v1.3.5 additions

- Tighter spacing scale; Alhambra/Isfahan-style tilework on the Available right now card edges; tile-mural sky panel (rosette sun, gold moon, tile stars, Persian scroll clouds, tile frame); per-card toggles grouped under each tab switch near the top of Settings.

## v1.3.4 additions

- Spacing scale, larger header clock, 'Location: <coordinates>' subtitle, a proportionate and lightly ornamented "Available right now" card (Fard tick 20% larger than Sunnah/Nafl).
- Sky: clean rounded shape, colour driven by the sun's altitude, exact forbidden-time zones, 8-point-star sun and stars.
- Per-card show/hide toggles in Settings; Weekly Prayer History removed (data kept); Tarawih and Eid reminder rows only in season.
- Fullscreen mouse fix (Rust command, Windows-only), louder notification sound, more natural Bangla.

## v1.3.3 additions

- "Available right now" is the most prominent section. A prohibited interval (sunrise, Zawal, before sunset) appears only while it is in progress, as a violet "Forbidden time" card, and is never a Next event target.
- Daily prayer cards show a quiet countdown line ("in 3h 54m" / "ends in 25m", Bangla supported).
- Redesigned sky panel (time-linear sun and moon path, exact prohibited-interval bands, four time-of-day palettes).
- Prayer descriptions: categories are vertical rows. Settings > Home page can hide Prayer descriptions, Sunnah & Seerah and On this day.
- The Local timetable section was removed from the home page; its method, Asr, time zone and interval details are in Settings.
- Today's progress picks a new line each time the window is shown again from the tray.
- Windows 10 notifications: native toast command with the app identity (or the PowerShell identity when the Start Menu shortcut is missing), real error reporting, retry of failed reminders and a "Send test notification" button. The Windows part is not compiled or run here; follow the manual checklist in TEST-RESULTS.md.

## v1.3.2 additions

- Conversational Today's-progress line (offline, bilingual, deterministic), offline habit learning, and the daily reflections moved to the Sunnah & Seerah carousel.
- Madhab-based evidence on the Daily prayers cards and in the reference section (one shared Sunni set; a separate Ja'fari set); reading-oriented reference cards.
- "Next event" hero from one ordered timeline (prayers, voluntary prayers, prohibited intervals, Ja'fari midnight); the stuck 00:00:00 hero is fixed at its root cause.
- "Available right now" is always at the top, followed by the next-event card; prohibited intervals appear as their own row between the available event and the next prayer event.
- Marked events lock when the next prayer event begins (Isha/Witr/Qiyam/Tahajjud at Fajr); standalone voluntary prayers have a single tick.
- Sky panel with the sun, the moon in its phase, stars and clouds, computed fully offline.

## v1.3.1 additions

- Fixed the Windows-only CI failure (88/89): a source-level test regex expected LF but the windows-2022 checkout had CRLF. Tests now read files through a line-ending-normalising helper, `.gitattributes` keeps text files LF, and the workflow disables `core.autocrlf` before checkout. The workflow also uses `npm ci` with the committed lockfile, checks Rust ≥ 1.90, caches npm and Cargo, verifies the EXE exists, and the signing steps end cleanly when no certificate is set.
- New concentric progress circles (white Fard, green Sunnah, black Nafl, red-black striped voluntary, saffron seasonal), per-prayer part ticks in matching colours, per-layer tick sounds with a Tick sound setting, selectable calculation methods / schools / high-latitude rules, a 12/24-hour clock setting, a ten-option font setting, a day-aware status line and 365 daily reflections. See the feature list above.

## v1.3.0 additions

- Tray countdown: the tray tooltip shows the next obligatory prayer and the time left in English or Bangla (Bengali digits), updated about once a minute, including while hidden to the tray. The tray menu (Open / Exit) and click-to-restore are unchanged.
- Pre-prayer reminders: per-prayer minutes before each prayer begins (any whole number 0–180), one notification per prayer per day, respecting the notifications toggle.
- Prohibited times: sunrise (+20 min) and the last 15 min before sunset now join the existing Zawal interval in the timetable, with a subtle live notice during any of them.
- Weekly Prayer Progress redesigned: Saturday-to-Friday full days, 5 Fard per day (35 per week), Friday highlighted with a Dhuhr/Jumu’ah slot, separate Fard, Sunnah, Nafl and voluntary-event totals, and a mini four-layer figure per day.
- Four-layer progress figure: blue Sunnah frame and gold Nafl ring between the black Fard square and the green voluntary ring, with Sunnah/Nafl sub-ticks on each Fard; the reward now needs all four layers.
- Carousels show only genuine matches for the date, with no padding and no cap. The Seerah card had been padded to five items on most days. Day-specific verses now match their own day only, and more history events and verse contexts were added, each with sources.
- Fixed: reminders threw an error after every notification (the notification call returns no Promise), which skipped saving the duplicate-protection marker. End-of-period reminders now use Bengali digits in Bangla. The reminder window now outlasts the roughly once-a-minute timer throttling of a hidden window.

## v1.2.9 additions

- Keyboard: F11 now has the Tauri permission it needs (`core:window:allow-set-fullscreen`); without it, fullscreen silently failed. Esc keeps its behaviour and also acts as Back from the countdown and Settings. Home returns to the home page top; Page Up/Down scroll about one screen; End goes to the bottom; ? toggles the bilingual shortcut guide. Left/Right page focused cards, focus outlines are visible, and keys are never taken while typing.
- Completion sound: replaced the three-note pluck with a crisp wooden tick inspired by a chess-move click, synthesised with Web Audio and stepping through a pentatonic set. Played once per new completion; the sound toggle is unchanged. Windows notifications keep the system sound.
- Today's progress: square stages are drawn exactly (nothing → line → L → three sides → hollow → filled black), sized to about 80% of the ring's inner edge. The voluntary ring no longer looks closed before the last voluntary event (round line caps were filling the gaps); full completion fills a green disc. With every Fard and Nafl done, الحمد لله appears inside the black square in a bundled 11 KB Amiri subset. Before Fajr, Today's progress now follows the prayer day that is still running.
- Carousels: Islamic history, the Qur’anic verse card, both Sunnah & Seerah cards, the date-specific (Eid/Tarawih) voluntary card and the seasonal prayer descriptions show all matching items with a 1 / N counter (Bengali digits in Bangla) and ‹ › buttons; controls hide for a single item. Offline data was expanded with documented events (Farewell Sermon, recovery of Jerusalem, ‘Ayn Jalut, Constantinople, Karbala, the deaths of Abu Bakr, ‘Uthman and ‘Ali, Granada, and month-level Hijrah, Khaybar, Mu’tah, Tabuk, Khandaq, Hunayn, Hudaybiyyah and the Prophet’s ﷺ passing) and verses with documented revelation context (2:185, 97:1, 5:3, 48:1, 2:144). Approximate and disputed dates are labelled.
- A tiny bilingual copyright line (© 2026–2027 Salman Reza Amit / © ২০২৬–২০২৭ সালমান রেজা অমিত) is fixed in the bottom-left corner. Author and copyright metadata, plus optional Authenticode signing, were added to the build.

## v1.2.8 additions

- Reorganised the daily information panels and renamed the old “Hijri Worship” grouping by placing that observance card under Sunnah & Seerah.
- Added a documented-history fallback spanning Prophetic and later Islamic history, including Badr, the Conquest of Makkah, Uhud, Hattin and the fall of Baghdad. When no event matches the exact Hijri day, the card identifies the closest documented anniversary; month-only records are labelled as such and are never presented as events occurring today.
- Qur’anic verse lookup follows exact day → week of month → month → nearest documented period. Only one verse is displayed; the remainder of the passage or Surah is suggested separately. The first-revelation record uses a qualified Ramadan month-level match because historical reports differ about both the month and exact day.
- Prayer descriptions are grouped into exactly five obligatory prayers, daily voluntary prayers, situational voluntary prayers, and dynamically visible seasonal prayer events. Tarawih appears 24 hours before the first Ramadan-night Isha and remains through the final Tarawih window; Eid prayer appears 24 hours before its local prayer window and ends at Zawal.
- Moved Weekly Prayer History and Weekly Prayer Progress together under Your Record, with progress directly below history.
- The displayed Hijri date and daily historical cards follow the local sunset boundary when a location is configured.
- Added F11, Esc, Home, Page Up, Page Down, End and ? keyboard controls.
- Replaced the previous tuck/thunk with a short three-note C-major pentatonic pluck.
- Enlarged the black progress square to sit close to the segmented outer ring. Fard progress draws green around the square; completing all five turns the square fully black. Voluntary completions fill the outer ring green.
- Added a small Bangla-aware visual maker signature and © 2026–2027 Salman Reza Amit at the bottom-left.

## Source provenance

The working Library contained a v1.2.0 desktop source archive and Firefox extension v2.1.13, but no v1.2.7 source archive. This v1.2.8 project uses the archived desktop source and reapplies the later v1.2.7 changes documented in the development history, then adds the current requests. The requested v2.1.16 extension archive was not present, so exact parity with v2.1.16 cannot be certified.

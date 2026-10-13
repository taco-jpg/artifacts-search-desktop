# Validation — macOS Desktop 0.2.0-rc.2

- Local Node behavior suite: 8 passing tests; shipped-client Chromium interaction suite: 1 passing end-to-end test.
- Both bundled SKILL.md files passed the skill-creator format validator.
- Live DuckDuckGo request returned real titles, destination URLs and snippets.
- In the installed Desktop app, a real model loaded both bundled skills, invoked `duckduckgo_search`, received visible source cards and invoked `present_artifact` with a generated SVG/JavaScript chart.
- Version 0.1.2 restored that persisted artifact after application restart and exposed the artifact card in the completed reply footer, independent of the collapsed tool process. Accessibility observation confirmed the title, source, reset and download controls.
- Version 0.1.3 was installed in the running macOS Desktop app. Playwright connected to a temporary localhost-only Electron CDP endpoint and clicked the actual iframe controls in the persisted test conversation. This replaced the earlier stale native screenshot method.
- Doubling clicks changed the multiplier ×1 → ×2 → ×4 and values 10/20/30 → 20/40/60 → 40/80/120. SVG bar geometry and axis ticks updated (axis maxima 30 → 60 → 150).
- Found and fixed a real bug: switching to source and back recreated the iframe and lost chart state. Source now hides the existing iframe; the test confirms ×4 survives the source round trip.
- The reset button restored ×1, the initial values and geometry. HTML download produced the expected filename and 6318 bytes of executable chart source.
- Host DOM access and artifact fetch were blocked as expected. No uncaught script errors were observed.
- Reloaded the Desktop page and repeated the full sequence successfully, confirming the persisted artifact remains interactive after reload. Runtime chart state itself intentionally initializes again after reload.
- [Actual Desktop screenshot after two clicks](docs/verification/desktop-chart.png) and [machine-readable results](docs/verification/desktop-result.json). Evidence contains only synthetic test data. These checks cover this SVG/JavaScript fixture and the plugin controls, not every possible model-generated artifact.
- Browser regression tests now run in GitHub Actions. Temporary Desktop debugging is disabled after validation.

No model settings, existing plugins or old conversations were replaced. The dedicated test conversation is named `插件端到端交互验证`.

## 0.1.4 locale hotfix

Uses DSH’s native locale dictionaries and slot locale subscription (English and Chinese, English fallback). Browser regression switches zh → en → fallback → zh without losing live chart state. Existing model-generated HTML and titles are preserved verbatim.

Installed 0.1.4 on macOS Desktop 0.2.0-rc.2; switched the actual General → Language preference English → 中文 → English. Existing artifact controls updated immediately (Source/Reset/Download HTML ↔ 源码/重置/下载 HTML). Restored the user’s English preference after checking.

The existing generated half-angle tutorial reports “Invalid or unexpected token” on page reload; the page-wide desktop smoke detects that separate HTML error. Locale switching passed in the real app, and the shipped-client regression fixture passed all controls and state-preservation checks. This locale hotfix does not rewrite existing generated HTML.

## 0.1.5 duplicate preview fix

The tool-history slot now renders a localized receipt instead of another iframe. The turn footer retains only the latest successful revision per artifact ID. Browser regression mounts both slots, repeated IDs, a failed revision and another turn; it verifies exactly one iframe with the latest successful HTML, and repeats interaction/state/download/locale checks.

Installed 0.1.5 in the real Desktop chat “Interactive Skill Trig Identity”. Two successful calls used the same pythagorean-identity ID (the model revised an angle arc); the footer now shows one card. Expanding both tool groups still leaves exactly one iframe, and reload keeps one iframe. Slider → 360°, source round trip and reset → 37° passed.

## 0.1.6 fullscreen viewer

Added localized View fullscreen / Exit fullscreen controls. A native HTML modal dialog fills the app viewport, keeping the same iframe mounted. The header and exit control remain visible; long artifact content scrolls within the expanded preview. Escape works with focus inside the sandboxed iframe through a source-checked, close-only message. Returning inline restores focus and preserves interaction state.

Installed and tested the final bundle in macOS Desktop 0.2.0-rc.2 with the existing unit-circle artifact: inline preview 640 × 480 → expanded preview 1280 × 741 in the current window. Slider interaction, fullscreen source/preview toggle, exit button, Escape from the focused iframe, reset and single-instance rendering all passed. Browser regression covers the same flows and rejects Escape messages from other sources.

[Fullscreen Desktop screenshot](docs/verification/fullscreen-desktop.png) · [Measured results](docs/verification/fullscreen-result.json).

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

# Validation — macOS Desktop 0.2.0-rc.2

- Local Node behavior suite: 8 passing tests.
- Both bundled SKILL.md files passed the skill-creator format validator.
- Live DuckDuckGo request returned real titles, destination URLs and snippets.
- In the installed Desktop app, a real model loaded both bundled skills, invoked `duckduckgo_search`, received visible source cards and invoked `present_artifact` with a generated SVG/JavaScript chart.
- Version 0.1.2 restored that persisted artifact after application restart and exposed the artifact card in the completed reply footer, independent of the collapsed tool process. Accessibility observation confirmed the title, source, reset and download controls.
- **Still unverified:** native screenshot capture stayed on an earlier screen while accessibility state updated. The iframe's internal SVG and doubling-button behavior could not be reliably observed through the available desktop automation. Model claims of successful interaction are not counted as test evidence. Treat this release as a preview until that visual/manual check is complete.

No model settings, existing plugins or old conversations were replaced. The dedicated test conversation is named `插件端到端交互验证`.

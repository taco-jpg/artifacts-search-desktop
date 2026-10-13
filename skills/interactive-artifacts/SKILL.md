---
name: interactive-artifacts
description: Create interactive charts, graphs, diagrams, calculators and simulations directly inside DeepSeek Harness Desktop chat using self-contained HTML and JavaScript.
---

Use `present_artifact` with `id`, `title` and `html`. The user sees a running preview, source toggle, reset and HTML download. Calling again creates another durable revision; reuse the id to indicate continuity. A prior card remains in the transcript.

Write a complete self-contained HTML document or HTML fragment. Inline CSS and JavaScript, including chart data. The preview runs in an iframe with scripts enabled and a unique origin. It cannot access host files, cookies, storage, parent DOM or external networks. Do not use CDN imports, fetch, remote images, external fonts or build steps. Use native SVG/Canvas/DOM for charts, graph layouts and controls. JavaScript alone should be wrapped in HTML with a script element. For library-dependent examples, inline an appropriately licensed library or use a native equivalent.

Choose useful interactions: sliders for parameters, toggles to compare series, tooltips for precise values, draggable graph nodes when helpful. Label axes and units, support narrow widths, and pair color with labels. Use real data from the user or cite searched sources in the surrounding answer. Clearly label illustrative data. Keep descriptions of the insight in the chat; the artifact contains the visual and its controls.

A good first example is a sine-wave chart with an amplitude slider and a live numeric readout. After calling the tool, explain briefly what the user can interact with. On a follow-up, regenerate the full revised HTML and preserve the artifact id. Do not claim the UI was tested unless it actually was.

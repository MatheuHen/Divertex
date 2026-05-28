# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the app

No build step required. Open `index.html` directly in a browser, or serve it with any static server:

```bash
npx serve .
# or
python -m http.server
```

The `@vite/client` file in the repo suggests Vite was used at some point — if you want hot-reload:

```bash
npx vite
```

## Architecture

This is a zero-dependency, vanilla JS single-page app. All logic lives in three files:

- `index.html` — markup and two `<section>` screens (`#screenMenu`, `#screenWheel`). Screen switching is done via the `screen--active` CSS class.
- `app.js` — entire application wrapped in a single IIFE. No modules, no frameworks.
- `styles.css` — CSS custom properties for theming; four themes (`neon`, `sunset`, `ocean`, `mono`) are declared as `html[data-theme="..."]` overrides on `:root`.

### State model (`app.js`)

All mutable game state lives in a single `state` object at the top of the IIFE. Key fields:

- `state.players[]` — active players with `{ id, name, lives, maxLives }`. Eliminated players are removed from the array.
- `state.activeWheels` — which wheel overlays are enabled (lives, challenges, time, etc.).
- `state.roundMode` — drives both the `state.mode` ("classic" | "timer") and which wheels are forced on.
- `state.isSpinning` / `state.timer` — used to lock the UI during a spin or active countdown.
- `state.currentSpinId` / `state.penaltyAppliedSpinId` — spin-ID guard that prevents double-applying life penalties when both a timer and a direct penalty path could fire.

### Wheel rendering

The roulette wheel is drawn on a `<canvas>` element via `renderWheel()`. Segments are colored by `segmentColor()` using HSL offsets from a theme-specific hue base (`themeHueBase()`). The spin animation uses `requestAnimationFrame` with `easeOutCubic`, and the target segment is pre-computed before animation starts — the visual stop is guaranteed to land on the pre-selected player.

### Round flow

1. `spinOnce()` picks a random player index, animates the wheel, then calls either `applyPenaltyForPlayer()` (classic mode) or `startCountdownForPlayer()` (timer mode).
2. `applyPenaltyForPlayer()` decrements lives via `decLife()`, removes the player if eliminated, and updates the result card.
3. `startCountdownForPlayer()` runs a `setInterval` tick that updates the SVG ring countdown; on expiry (or manual "Encerrar turno" / Escape), it delegates to `applyPenaltyForPlayer()`.

### Round modes

`setRoundMode()` maps the `<select>` value to `state.roundMode` and forces certain wheels on (e.g., `tempo` forces the time wheel; `desafio` forces the challenges wheel). The `roundModeLabel()` helper provides display strings.

---
applyTo: 'koboldx-frontend/**'
---

# Copilot Instructions for Dashboard (Svelte + Vite)

## Workspace rules for Copilot

- Apply file edits without asking; create new files if needed.
- After edits, check for bugs and fix failures automatically.
- Do not change formatting config; follow existing linters (prettier).
- For MCP tools (Kite): auto-call read-only tools;
- Prefer #codebase search before adding new deps;

---

## Project intent

Modular Svelte v5 trading dashboard. Server = source of truth. Client subscribes to topics over WebSockets and renders from small Svelte stores. No client-side indicator math.

## Stack & constraints

Vite + TypeScript + Tailwind + DaisyUI

Svelte stores per panel: selection, charts, chain, orders, account

Transport: one WS (/ws) with subscribe/unsubscribe and a few control messages

Auth: none (single-user dev)

Caching: optional later (IndexedDB for closed candles)

## File layout (suggested)

```css
src/
  lib/
    wsClient.ts
    bus.ts
    types.ts
    stores/
      selection.ts
      charts.ts
      chain.ts
      orders.ts
  components/
    ChartsPanel.svelte
    OptionChainPanel.svelte
    PlaceOrderPanel.svelte
    TradeLogPanel.svelte
  App.svelte
```

## Data contracts (from server)

**WebSocket: server → client**

```jsonc
{ "type":"selection", "stock":"NIFTY", "optionKey":"NIFTY25AUG48000PE", "intervals":["3m","5m","15m"] }

{ "type":"chain.slice", "underlying":"NIFTY", "atm":22350,
  "rows":[{"strike":22350,"call":{"ltp":120,"oi":110000},"put":{"ltp":130,"oi":125000}}] }

{ "type":"chart.snapshot", "symbol":"NIFTY",
  "bundles":{ "3m":[Candle], "5m":[Candle], "15m":[Candle] },
  "lastTick": { "time": 1723542057, "price": 22346.2 } }

{ "type":"chart.update", "key":"NIFTY:3m",
  "bar": { "time":1723542060,"open":22346,"high":22349,"low":22345,"close":22348,"volume":120 },
  "ind": { "ema20":22341.2, "rsi":56.3 } }

{ "type":"chart.history", "key":"NIFTY:3m", "data":[Candle, ...] }

{ "type":"order.update", "id":"O124", "status":"OPEN", "filledQty":15, "avgPrice":118.5 }
{ "type":"account", "marginAvailable":241000, "marginRequired":66000 }
```

**Candle:**

```ts
type Candle = {
	time: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume?: number;
};
```

**WebSocket: client → server**

```jsonc
{ "type":"subscribe",   "topics": ["selection","chain:NIFTY","chart:NIFTY:*","chart:NIFTY25AUG48000PE:*"] }
{ "type":"unsubscribe", "topics": ["chart:NIFTY25AUG48000PE:*"] }
{ "type":"need_history","key":"NIFTY:3m", "from":1723542000 }
{ "type":"select_option","optionKey":"NIFTY25AUG48000PE" }
```

**REST (rarely used)**

```bash
GET  /instruments
GET  /chart?symbol=SYM&intervals=3m,5m,15m&from_ts=...
POST /orders
POST /orders/:id/modify
POST /orders/:id/cancel
```

## Copilot rules (frontend)

- Use Svelte v5 with <script lang="ts">.
- Keep all WS parsing in lib/bus.ts. Components read stores only.
- For charts:
  - On chart.snapshot → setData(bundles[tf])
  - On chart.update → series.update(lastBar); append only when bar.time increases
  - On viewport/interval change → call requestHistory(symbol, tf)
- No indicator math in browser; render what server sends.

## Overview

This dashboard is built with Svelte 5 and Vite, providing interactive trading charts and logs. It consumes backend REST APIs to fetch data. It also generates mock data for development and testing.

## Architecture & Data Flow

- **Main entry**: `src/App.svelte` imports chart, interval buttons, and trade log components.
- **Charting**: `src/components/ChartsPanel.svelte` uses Lightweight Charts for candlestick and indicator rendering for 2 charts - stock and contract.
- **Change data intervals**: `IntervalButtons.svelte` updates the data to selected time interval (3m, 5m, etc.).
- **Option Chain**: `src/components/OptionChainPanel.svelte` displays the option chain for the selected stock.
- **Trade log**: `src/components/TradeLogPanel.svelte` displays an interactive table of trades with P&L coloring and options to modify each leg in trade.
- **Place Order**: `src/components/PlaceOrderPanel.svelte` provides a form for placing new orders.

## Developer Workflows

- Use VSCode tasks when possible
- **Dev server**: `npm run dev` (Vite)
- **Build**: `npm run build`
- **Preview**: `npm run preview`
- **Dependencies**: Install via `npm install`.

## Project-Specific Patterns

- **Market time alignment**: All time series start at 9:15 Asia/Kolkata, roll over at 15:30.
- **Component props**: Use `$props` and `$state` for reactivity. Pass `data`, `markers`, `indicatorData` to chart components.
- **Event handlers**: Use `onclick`, `onchange`, `ontoggle` directly on elements for event binding (Svelte 5 syntax).
- **Styling**: DaisyUI themes via Tailwind.
- **TypeScript**: Use `import type` for types in Svelte/TS files.

## Conventions

- **Svelte**: Use `$state` for local state, `$props` for props, `$effect` for side effects.
- **TypeScript**: Prefer explicit types for tradelog data structures

## Technology-Specific Guidelines

### Tailwind CSS v4

- Use `@import "tailwindcss";` in CSS and configure themes with the `@theme` directive.
- All config is now in CSS; legacy JS config files are deprecated.
- Utility classes have been renamed/removed (e.g., `shadow-sm` → `shadow-xs`, opacity utilities now use `/opacity`).
- Use `@utility` for custom utilities and `@custom-variant` for variants.
- v4 adds container queries, 3D transforms, enhanced gradients, text shadows, mask utilities, and OKLCH color system.
- Only modern browsers are supported (Safari 16.4+, Chrome 111+, Firefox 128+).
- Organize styles in `src/styles/` and use utility classes for most styling needs.

### daisyUI 5

- Built for Tailwind v4; install with `npm i -D daisyui@latest` and add `@plugin "daisyui";` to CSS.
- No JS config; all configuration is in CSS.
- Use daisyUI class names for components, parts, styles, behaviors, colors, sizes, and modifiers.
- Prefer daisyUI color names (e.g., `bg-primary`) for theme-aware styling.
- Customize via Tailwind utility classes, using `!` for specificity overrides if needed.
- Reference official docs for component usage and theming.

### Svelte 5 Syntax & Runes

- Use runes like `$state`, `$props`, and `$effect` for reactivity and prop management.
- `$state` for reactive local state, `$props` for component props, `$effect` for side effects.
- Event handlers use `on<Event>` syntax (e.g., `onclick`, `onchange`, `ontoggle`).
- Follow Svelte 5 syntax for compatibility and maintainability.

### Lightweight Charts v5

- Add series with `addSeries(<Type>, options)` and import each series type explicitly.
- Manage markers via the `createSeriesMarkers` primitive.
- Watermarks are pane plugins, created with `createTextWatermark`.
- Update TypeScript interface names as per v5 migration guide.
- Follow the migration checklist for updating v4 code to v5.

### Lightweight charts v5 examples

import { createChart, LineSeries } from 'lightweight-charts'; // v5
const chart = createChart(container, {});
const series = chart.addSeries(LineSeries, { color: 'red' });

````:contentReference[oaicite:1]{index=1}

**UMD pattern**

```js
const chart  = LightweightCharts.createChart(div, {});
const series = chart.addSeries(LightweightCharts.LineSeries, {});
``` :contentReference[oaicite:2]{index=2}

---

## 2  Series Markers — extracted primitive
1. **Import & attach**

```ts
import { createSeriesMarkers } from 'lightweight-charts';
const markers = createSeriesMarkers(series, initialArray);
``` :contentReference[oaicite:3]{index=3}

2. **Update / clear**
```ts
markers.setMarkers(newArray);   // or [] to remove all
``` :contentReference[oaicite:4]{index=4}

*Rationale: code that never uses markers doesn’t pay the bundle-size cost.* :contentReference[oaicite:5]{index=5}

---
````

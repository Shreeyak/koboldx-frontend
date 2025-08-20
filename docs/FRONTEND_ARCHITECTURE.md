# KoboldX Frontend Architecture

**Date:** August 20, 2025  
**Status:** Design Specification  
**Context:** Svelte 5 + DaisyUI + Lightweight Charts trading dashboard for derivatives trading

---

## Overview

The KoboldX frontend is a modular Svelte 5 trading dashboard that provides real-time derivatives trading capabilities. It features dual chart panels, option chain visualization, order placement, and trade management in a responsive layout optimized for trading workflows.

## Technology Stack

- **Framework:** Svelte 5 with runes (`$state`, `$props`, `$effect`)
- **Styling:** Tailwind CSS v4 + DaisyUI 5
- **Charts:** Lightweight Charts v5
- **Language:** TypeScript
- **Build Tool:** Vite
- **State Management:** Svelte stores
- **Real-time:** WebSocket + REST API

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Header (Logo, Account Info, Connection Status)             │
├─────────┬─────────────────────────────────┬─────────────────┤
│         │                                 │                 │
│ Left    │            Center               │     Right       │
│ Sidebar │                                 │    Sidebar      │
│         │                                 │                 │
│ Under-  │  ┌─────────────────────────────┐ │ ┌─────────────┐ │
│ lying   │  │    Order Placement Panel    │ │ │   Chart 1   │ │
│ Instru- │  └─────────────────────────────┘ │ │ (Underlying)│ │
│ ments   │                                 │ │             │ │
│ List    │  ┌─────────────────────────────┐ │ ├─────────────┤ │
│         │  │    Option Chain Panel       │ │ │   Chart 2   │ │
│         │  │                             │ │ │ (Selected   │ │
│         │  └─────────────────────────────┘ │ │  Option)    │ │
│         │                                 │ │             │ │
│         │  ┌─────────────────────────────┐ │ └─────────────┘ │
│         │  │    Trade Log Panel          │ │                 │
│         │  │                             │ │                 │
│         │  └─────────────────────────────┘ │                 │
└─────────┴─────────────────────────────────┴─────────────────┘
```

### Grid Specifications
- **Left Sidebar:** 280px fixed width, scrollable
- **Center Panel:** Flexible width, stacked cards with gaps
- **Right Sidebar:** 400px fixed width, dual charts stacked
- **Header:** 60px fixed height
- **Responsive:** Collapsible sidebars on smaller screens

---

## Component Architecture

```
src/
├── App.svelte                    # Main layout container
├── app.css                       # Global styles + Tailwind imports
├── main.ts                       # Application entry point
├── types.ts                      # TypeScript definitions
├── components/                   # UI components organized by purpose
│   ├── layout/
│   │   ├── Header.svelte        # Top navigation with account info
│   │   ├── LeftSidebar.svelte   # Instruments selection panel
│   │   └── RightSidebar.svelte  # Dual charts container
│   ├── panels/
│   │   ├── OrderPlacementPanel.svelte   # Buy/sell order form
│   │   ├── OptionChainPanel.svelte      # Option strikes table
│   │   └── TradeLogPanel.svelte         # Trade history & management
│   └── charts/
│       ├── TradingChart.svelte          # Reusable chart component
│       └── IntervalButtons.svelte       # Time interval selector
├── lib/                          # Core business logic
│   ├── stores/                   # Svelte stores for state management
│   │   ├── selection.ts         # Current stock/option selection
│   │   ├── instruments.ts       # Available instruments list
│   │   ├── charts.ts           # Chart data for both panels
│   │   ├── optionChain.ts      # Option chain data & filtering
│   │   ├── orders.ts           # Order management & status
│   │   ├── trades.ts           # Trade aggregation & P&L
│   │   └── account.ts          # Account balance & margins
│   ├── api/                     # External communication
│   │   ├── rest.ts             # REST API client functions
│   │   └── websocket.ts        # WebSocket connection management
│   └── utils/                   # Helper utilities
│       ├── formatting.ts       # Price/time/number formatting
│       └── calculations.ts     # P&L and trading calculations
└── assets/                      # Static resources
    └── icons/                   # SVG icon collection
```

---

## Data Flow Architecture

### Store-Centric Architecture
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  WebSocket  │◄──►│   Stores    │◄──►│ Components  │
│             │    │             │    │             │
│ Real-time   │    │ Centralized │    │ Reactive UI │
│ Updates     │    │ State       │    │ Updates     │
└─────────────┘    └─────────────┘    └─────────────┘
                           ▲
                           │
                   ┌─────────────┐
                   │  REST API   │
                   │             │
                   │ Persistent  │
                   │ Operations  │
                   └─────────────┘
```

### State Management Principles
1. **Single Source of Truth:** Each data type has one authoritative store
2. **Reactive Updates:** Components automatically update when store data changes
3. **Action-Based:** All state changes go through defined action functions
4. **WebSocket Integration:** Real-time updates directly update stores
5. **Optimistic Updates:** UI updates immediately, syncs with server

---

## Store Specifications

### Selection Store (`selection.ts`)
```typescript
interface Selection {
  stock: string;           // Currently selected underlying (e.g., "NIFTY")
  optionKey: string | null; // Selected option contract or null
  intervals: string[];     // Active chart intervals ["3m", "5m", "15m"]
}

// Actions:
// - selectStock(stock: string)
// - selectOption(optionKey: string)
// - updateIntervals(intervals: string[])
```

### Instruments Store (`instruments.ts`)
```typescript
interface Instrument {
  symbol: string;          // Display name
  token: string;          // Unique identifier
  exchange: string;       // Exchange code
  lot_size: number;       // Trading lot size
}

// Actions:
// - loadInstruments()
// - filterInstruments(query: string)
```

### Charts Store (`charts.ts`)
```typescript
interface ChartData {
  symbol: string;
  bundles: Record<string, Candle[]>; // timeframe -> candles
  indicators?: Record<string, number>; // latest indicator values
}

// Actions:
// - subscribeToChart(symbol: string, intervals: string[])
// - updateChartData(symbol: string, interval: string, candles: Candle[])
// - updateLastCandle(symbol: string, interval: string, candle: Candle)
```

### Option Chain Store (`optionChain.ts`)
```typescript
interface OptionChainRow {
  strike: number;
  call: { ltp: number; oi: number; iv?: number };
  put: { ltp: number; oi: number; iv?: number };
}

// Actions:
// - loadOptionChain(underlying: string)
// - updateOptionPrices(data: OptionChainRow[])
// - setAtmStrike(strike: number)
```

### Orders Store (`orders.ts`)
```typescript
interface Order {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  status: "PENDING" | "OPEN" | "FILLED" | "CANCELLED";
  filled_quantity: number;
  average_price: number;
  timestamp: string;
}

// Actions:
// - placeOrder(order: OrderRequest)
// - modifyOrder(id: string, changes: Partial<Order>)
// - cancelOrder(id: string)
// - updateOrderStatus(id: string, status: OrderStatus)
```

### Trades Store (`trades.ts`)
```typescript
interface Trade {
  id: string;
  strategy: string;
  legs: Order[];           // All orders that make up this trade
  pnl: number;            // Current P&L
  status: "OPEN" | "CLOSED";
  entry_time: string;
  exit_time?: string;
}

// Actions:
// - createTrade(orders: Order[])
// - updateTradePnL(id: string, pnl: number)
// - closeTrade(id: string)
```

### Account Store (`account.ts`)
```typescript
interface Account {
  margin_available: number;
  margin_used: number;
  margin_required: number;
  equity: number;
  pnl: number;
}

// Actions:
// - loadAccountInfo()
// - updateMargins(margins: MarginInfo)
```

---

## WebSocket Integration

### Topic Structure
```
- selection: Current stock/option selection broadcast
- chain:{STOCK}: Live option chain updates (e.g., "chain:NIFTY")
- chart:{SYMBOL}:*: All timeframes for symbol (e.g., "chart:NIFTY:*")
- chart:{SYMBOL}:{TF}: Specific timeframe (e.g., "chart:NIFTY:3m")
- order.update: Live order status changes
- account: Live margin/balance updates
```

### Message Formats
```typescript
// Selection broadcast
{ type: "selection", stock: "NIFTY", optionKey: "NIFTY25AUG24000CE", intervals: ["3m", "5m"] }

// Chart snapshot
{ type: "chart.snapshot", symbol: "NIFTY", bundles: { "3m": [...], "5m": [...] } }

// Chart update
{ type: "chart.update", key: "NIFTY:3m", bar: {...}, indicators: {...} }

// Option chain slice
{ type: "chain.slice", underlying: "NIFTY", atm: 24000, rows: [...] }

// Order update
{ type: "order.update", id: "O123", status: "FILLED", filled_quantity: 50 }
```

---

## Component Specifications

### Header Component
- **Purpose:** Navigation, account summary, connection status
- **Features:** Logo, current P&L, available margin, WebSocket status indicator
- **Styling:** Fixed height, dark theme, responsive

### LeftSidebar Component
- **Purpose:** Instrument selection and filtering
- **Features:** Search bar, categorized list, selection highlighting
- **Data:** Connected to instruments store
- **Styling:** Fixed width, scrollable, card-based layout

### RightSidebar Component
- **Purpose:** Dual chart display
- **Features:** Underlying chart (top), option chart (bottom), interval controls
- **Data:** Connected to charts store and selection store
- **Styling:** Fixed width, stacked layout, responsive height

### OrderPlacementPanel Component
- **Purpose:** Order entry and quick trading
- **Features:** Buy/sell buttons, quantity input, price controls, order type selection
- **Data:** Connected to orders store and selection store
- **Styling:** Compact form layout, prominent action buttons

### OptionChainPanel Component
- **Purpose:** Option strikes visualization and selection
- **Features:** Strike table, ATM highlighting, click-to-select options
- **Data:** Connected to optionChain store
- **Styling:** Dense table layout, color-coded columns

### TradeLogPanel Component
- **Purpose:** Trade history and active position management
- **Features:** Expandable rows, P&L coloring, modify/cancel actions
- **Data:** Connected to trades store
- **Styling:** Table with action buttons, status indicators

---

## Responsive Design

### Breakpoints
- **Desktop (lg+):** Full three-panel layout
- **Tablet (md):** Collapsible sidebars, center panel priority
- **Mobile (sm):** Single panel with tab navigation

### Interaction Patterns
- **Click:** Primary selection and actions
- **Hover:** Preview information and tooltips
- **Keyboard:** Arrow key navigation, Enter for selection, Escape for cancel
- **Touch:** Swipe gestures for panel navigation on mobile

---

## Performance Considerations

### Optimization Strategies
1. **Virtual Scrolling:** For large option chains and trade logs
2. **Chart Optimization:** Minimal re-renders, efficient data updates
3. **WebSocket Throttling:** Batch updates to prevent UI blocking
4. **Lazy Loading:** Load components on demand
5. **Memory Management:** Cleanup subscriptions and chart instances

### Caching Strategy
- **Chart Data:** Keep recent candles in memory, older data on-demand
- **Option Chain:** Cache last snapshot, apply incremental updates
- **Trade Data:** Paginated loading with infinite scroll

---

## Error Handling

### Error Boundaries
- **Network Errors:** Retry mechanisms with exponential backoff
- **WebSocket Disconnection:** Automatic reconnection with status indication
- **API Errors:** User-friendly error messages with retry options
- **Validation Errors:** Inline form validation with clear messaging

### Fallback Strategies
- **Offline Mode:** Display last known data with offline indicator
- **Partial Data:** Graceful degradation when some data is unavailable
- **Error Recovery:** Reset mechanisms for corrupted state

---

This architecture provides a solid foundation for building a professional trading interface that is maintainable, performant, and user-friendly.

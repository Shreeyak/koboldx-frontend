// KoboldX Frontend Type Definitions
// Date: August 20, 2025

// ============================================================================
// Core Trading Types
// ============================================================================

export interface Candle {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface Instrument {
  symbol: string; // Display name (e.g., "NIFTY")
  token: string; // Unique identifier from broker
  exchange: string; // Exchange code (NSE, NFO, etc.)
  lot_size: number; // Trading lot size
  tick_size: number; // Minimum price movement
  instrument_type: string; // EQ, FUT, CE, PE
  expiry?: string; // Expiry date for derivatives (YYYY-MM-DD)
  strike?: number; // Strike price for options
}

export interface Selection {
  stock: string; // Currently selected underlying (e.g., "NIFTY")
  optionKey: string | null; // Selected option contract identifier or null
  intervals: string[]; // Active chart intervals ["3m", "5m", "15m"]
}

// ============================================================================
// Chart & Market Data Types
// ============================================================================

export interface ChartData {
  symbol: string;
  bundles: Record<string, Candle[]>; // timeframe -> candles array
  indicators?: Record<string, number>; // latest indicator values
  lastTick?: {
    time: number;
    price: number;
  };
}

export interface IndicatorData {
  ema20?: number;
  ema50?: number;
  rsi?: number;
  macd?: number;
  signal?: number;
  histogram?: number;
}

export interface ChartMarker {
  time: number;
  position: "belowBar" | "aboveBar" | "inBar";
  color: string;
  shape: "circle" | "square" | "arrowUp" | "arrowDown";
  text?: string;
  size?: number;
}

// ============================================================================
// Option Chain Types
// ============================================================================

export interface OptionData {
  ltp: number; // Last traded price
  oi: number; // Open interest
  change?: number; // Price change
  change_percent?: number; // Percentage change
  iv?: number; // Implied volatility
  volume?: number; // Trading volume
  bid?: number; // Bid price
  ask?: number; // Ask price
}

export interface OptionChainRow {
  strike: number;
  call: OptionData;
  put: OptionData;
  expiry: string; // Expiry date
}

export interface OptionChain {
  underlying: string; // Base symbol (e.g., "NIFTY")
  atm: number; // At-the-money strike
  spot_price: number; // Current underlying price
  expiry: string; // Currently selected expiry
  expiries: string[]; // Available expiries
  rows: OptionChainRow[];
  last_updated: number; // Timestamp of last update
}

// ============================================================================
// Order Management Types
// ============================================================================

export type OrderSide = "BUY" | "SELL";
export type OrderType = "MARKET" | "LIMIT" | "SL" | "SL-M";
export type OrderStatus = "PENDING" | "OPEN" | "COMPLETE" | "CANCELLED" | "REJECTED";
export type OrderProduct = "MIS" | "CNC" | "NRML";

export interface OrderRequest {
  symbol: string;
  side: OrderSide;
  quantity: number;
  price?: number; // Required for LIMIT orders
  trigger_price?: number; // Required for SL orders
  order_type: OrderType;
  product: OrderProduct;
  validity?: "DAY" | "IOC" | "GTT";
  disclosed_quantity?: number;
}

export interface Order {
  id: string;
  symbol: string;
  side: OrderSide;
  quantity: number;
  price: number;
  trigger_price?: number;
  order_type: OrderType;
  product: OrderProduct;
  status: OrderStatus;
  filled_quantity: number;
  average_price: number;
  pending_quantity: number;
  cancelled_quantity: number;
  timestamp: string; // ISO string
  order_timestamp: string; // ISO string
  exchange_timestamp?: string;
  tag?: string; // Custom order tag
  parent_order_id?: string; // For bracket/cover orders
}

export interface OrderUpdate {
  id: string;
  status: OrderStatus;
  filled_quantity: number;
  average_price: number;
  timestamp: string;
}

// ============================================================================
// Trade & Portfolio Types
// ============================================================================

export interface Position {
  symbol: string;
  exchange: string;
  product: OrderProduct;
  quantity: number; // Net quantity (+ for long, - for short)
  overnight_quantity: number;
  day_quantity: number;
  average_price: number;
  last_price: number;
  pnl: number; // Realized + Unrealized P&L
  unrealized_pnl: number;
  realized_pnl: number;
  value: number; // Market value
  buy_quantity: number;
  buy_price: number;
  buy_value: number;
  sell_quantity: number;
  sell_price: number;
  sell_value: number;
}

export interface Trade {
  id: string;
  strategy?: string; // Strategy name/tag
  legs: Order[]; // All orders that make up this trade
  entry_time: string; // ISO string
  exit_time?: string; // ISO string for closed trades
  pnl: number; // Current P&L
  pnl_percent: number; // P&L as percentage
  status: "OPEN" | "CLOSED" | "PARTIAL";
  underlying: string; // Base symbol
  trade_type: "LONG" | "SHORT" | "STRADDLE" | "STRANGLE" | "SPREAD";
  max_profit?: number; // For defined risk strategies
  max_loss?: number; // For defined risk strategies
  breakeven?: number[]; // Breakeven points
}

export interface TradeLog {
  trades: Trade[];
  total_pnl: number;
  realized_pnl: number;
  unrealized_pnl: number;
  win_rate: number; // Percentage of winning trades
  profit_factor: number; // Total profit / Total loss
}

// ============================================================================
// Account & Margin Types
// ============================================================================

export interface Margin {
  equity: {
    enabled: boolean;
    net: number;
    available: {
      adhoc_margin: number;
      cash: number;
      opening_balance: number;
      live_balance: number;
      collateral: number;
      intraday_payin: number;
    };
    utilized: {
      debits: number;
      exposure: number;
      m2m_realised: number;
      m2m_unrealised: number;
      option_premium: number;
      payout: number;
      span: number;
      holding_sales: number;
      turnover: number;
      liquid_collateral: number;
      stock_collateral: number;
    };
  };
  commodity?: {
    // Similar structure for commodity segment
    enabled: boolean;
    net: number;
    available: Record<string, number>;
    utilized: Record<string, number>;
  };
}

export interface Account {
  user_id: string;
  user_name: string;
  user_shortname: string;
  email: string;
  user_type: string;
  broker: string;
  exchanges: string[];
  products: string[];
  order_types: string[];
  margin: Margin;
  segment_margins: Record<string, any>;
}

// ============================================================================
// WebSocket Message Types
// ============================================================================

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface SelectionMessage extends WebSocketMessage {
  type: "selection";
  stock: string;
  optionKey: string | null;
  intervals: string[];
}

export interface ChartSnapshotMessage extends WebSocketMessage {
  type: "chart.snapshot";
  symbol: string;
  bundles: Record<string, Candle[]>;
  lastTick?: {
    time: number;
    price: number;
  };
}

export interface ChartUpdateMessage extends WebSocketMessage {
  type: "chart.update";
  key: string; // "SYMBOL:TIMEFRAME"
  bar: Candle;
  indicators?: IndicatorData;
}

export interface ChartHistoryMessage extends WebSocketMessage {
  type: "chart.history";
  key: string; // "SYMBOL:TIMEFRAME"
  data: Candle[];
}

export interface OptionChainMessage extends WebSocketMessage {
  type: "chain.slice";
  underlying: string;
  atm: number;
  rows: OptionChainRow[];
  spot_price: number;
  last_updated: number;
}

export interface OrderUpdateMessage extends WebSocketMessage {
  type: "order.update";
  order: Order;
}

export interface AccountUpdateMessage extends WebSocketMessage {
  type: "account";
  margin: Margin;
  positions?: Position[];
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  status: "success" | "error";
  data?: T;
  message?: string;
  error?: string;
}

export interface InstrumentsResponse {
  stocks: Instrument[];
  derivatives: Instrument[];
}

export interface ChartResponse {
  symbol: string;
  bundles: Record<string, Candle[]>;
  indicators?: Record<string, IndicatorData[]>;
}

export interface OrderResponse {
  order_id: string;
  status: OrderStatus;
  message?: string;
}

// ============================================================================
// Store State Types
// ============================================================================

export interface SelectionState {
  current: Selection;
  loading: boolean;
  error: string | null;
}

export interface InstrumentsState {
  stocks: Instrument[];
  derivatives: Instrument[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filteredStocks: Instrument[];
}

export interface ChartsState {
  underlying: ChartData | null;
  option: ChartData | null;
  loading: Record<string, boolean>; // symbol -> loading state
  error: string | null;
}

export interface OptionChainState {
  data: OptionChain | null;
  loading: boolean;
  error: string | null;
  selectedStrike: number | null;
  selectedExpiry: string | null;
}

export interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  placingOrder: boolean;
}

export interface TradesState {
  trades: Trade[];
  summary: TradeLog;
  loading: boolean;
  error: string | null;
}

export interface AccountState {
  account: Account | null;
  margin: Margin | null;
  positions: Position[];
  loading: boolean;
  error: string | null;
}

// ============================================================================
// WebSocket State Types
// ============================================================================

export interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  subscriptions: Set<string>;
  lastMessage: WebSocketMessage | null;
  reconnectAttempts: number;
}

// ============================================================================
// UI Component Props Types
// ============================================================================

export interface ChartProps {
  data: Candle[];
  markers?: ChartMarker[];
  indicators?: IndicatorData[];
  loading?: boolean;
  height?: number;
  title?: string;
}

export interface IntervalButtonsProps {
  intervals: string[];
  selected: string[];
  onSelect: (intervals: string[]) => void;
  disabled?: boolean;
}

export interface InstrumentListProps {
  instruments: Instrument[];
  selected?: string;
  onSelect: (symbol: string) => void;
  loading?: boolean;
  searchable?: boolean;
}

export interface OrderFormProps {
  symbol: string;
  onSubmit: (order: OrderRequest) => void;
  loading?: boolean;
  disabled?: boolean;
}

export interface OptionChainTableProps {
  data: OptionChain;
  onOptionSelect: (optionKey: string) => void;
  selectedOption?: string;
  loading?: boolean;
}

export interface TradeLogTableProps {
  trades: Trade[];
  onModifyTrade: (tradeId: string) => void;
  onCloseTrade: (tradeId: string) => void;
  loading?: boolean;
}

// ============================================================================
// Utility Types
// ============================================================================

export type TimeInterval = "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "1d";

export interface PriceLevel {
  price: number;
  quantity: number;
}

export interface OrderBook {
  bids: PriceLevel[];
  asks: PriceLevel[];
  timestamp: number;
}

export interface Tick {
  symbol: string;
  ltp: number;
  change: number;
  change_percent: number;
  volume: number;
  oi?: number;
  timestamp: number;
}

// ============================================================================
// Error Types
// ============================================================================

export interface ApiError {
  code: number;
  message: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [field: string]: string[];
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface AppConfig {
  api: {
    baseUrl: string;
    wsUrl: string;
    timeout: number;
  };
  chart: {
    defaultInterval: TimeInterval;
    maxCandles: number;
    updateInterval: number;
  };
  trading: {
    defaultProduct: OrderProduct;
    defaultValidity: string;
    maxQuantity: number;
  };
  ui: {
    theme: string;
    autoRefresh: boolean;
    refreshInterval: number;
  };
}

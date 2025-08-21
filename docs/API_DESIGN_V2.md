# API Design V2 - Derivatives Trading Application

**Date:** August 18, 2025  
**Status:** Proposed Architecture  
**Context:** Enhanced API/WebSocket design for derivatives trading frontend with order placement, option chains, charts, and trade log panels.

---

## **Architecture Overview**

This design enhances the existing FastAPI/WebSocket foundation to support:
- Order placement panel
- Underlying symbols selector  
- Option chain panel (select option, view live details)
- Charts panel (both underlying and selected option)
- Trade log panel (list trades, modify open trades)

**Core Principles:**
- Server as source of truth
- Client subscribes to WebSocket topics
- Minimal frontend processing
- Real-time updates via WebSocket for selections
- REST API for persistent actions (orders, queries)

---

## **Current State Analysis**

**Existing Strengths:**
- ✅ WebSocket infrastructure with topic-based subscriptions
- ✅ Basic order management endpoints
- ✅ Market data endpoints (chart, quote, ltp, ohlc)
- ✅ Portfolio endpoints (positions, holdings, margins)

**Gaps to Address:**
- ⚠️ Option chain stub needs enhancement with real Kite data
- ❌ Missing selection persistence and broadcast mechanism
- ❌ Missing trade aggregation (grouping orders into trades)
- ❌ No live market data streaming for option chain

---

## **Enhanced REST Endpoints**

### **New Endpoints Required:**

```python
@app.get("/selection")
def get_selection():
    """Get current stock/option selection"""
    return load_json("data/selection.json", {
        "stock": "NIFTY", 
        "optionKey": None, 
        "intervals": ["3m", "5m", "15m"]
    })

@app.post("/selection")  
async def post_selection(req: Request):
    """Update selection and broadcast to all clients"""
    body = await req.json()
    save_json("data/selection.json", body)
    await broadcast("selection", {"type": "selection", **body})
    return {"ok": True}

@app.get("/option_chain/{underlying}")
def get_option_chain_enhanced(underlying: str):
    """Enhanced option chain with real Kite data"""
    # Use kite_client to get real option chain
    # Apply ATM filtering as per docs/ATM_STRIKE_FILTERING.md
    return enhanced_option_chain_data

@app.get("/trades")
def get_trades():
    """Aggregate orders into trades for trade log panel"""
    # Group orders by strategy/time to form trades
    # Calculate P&L per trade
    return trades_with_pnl

@app.get("/account")
def get_account():
    """Account summary for margin/balance display"""
    margins = kite_client.get_margins()
    return {
        "marginAvailable": margins.get("equity", {}).get("available", {}).get("cash", 0),
        "marginRequired": 0  # Calculate from current positions
    }
```

---

## **WebSocket Topics Architecture**

### **Topic Structure:**
```
- selection: Current stock/option selection
- chain:{STOCK}: Live option chain for underlying (e.g., "chain:NIFTY")  
- chart:{SYMBOL}:*: All timeframes for symbol (e.g., "chart:NIFTY:*")
- chart:{SYMBOL}:{TF}: Specific timeframe (e.g., "chart:NIFTY:3m")
- order.update: Live order status changes
- account: Live margin/balance updates
```

### **Enhanced WebSocket Handlers:**

```python
async def handle_subscribe(ws, msg):
    for topic in msg.get("topics", []):
        add_sub(ws, topic)
        
        # Send immediate snapshots for certain topics
        if topic.startswith("chart:") and topic.endswith(":*"):
            symbol = topic.split(":")[1]
            await send_chart_snapshot(ws, symbol)
        elif topic.startswith("chain:"):
            underlying = topic.split(":")[1]  
            await send_option_chain_snapshot(ws, underlying)
        elif topic == "selection":
            selection = load_json("data/selection.json", {})
            await ws.send_json({"type": "selection", **selection})

async def handle_select_option(ws, msg):
    option_key = msg.get("optionKey")
    selection = load_json("data/selection.json", {})
    selection["optionKey"] = option_key
    save_json("data/selection.json", selection)
    
    # Broadcast new selection
    await broadcast("selection", {"type": "selection", **selection})
    
    # Send chart snapshot for the new option
    if option_key:
        await send_chart_snapshot(ws, option_key)
```

---

## **Message Contracts**

### **Client → Server:**
```typescript
// Subscription management
{ "type": "subscribe", "topics": ["selection", "chain:NIFTY", "chart:NIFTY:*"] }
{ "type": "unsubscribe", "topics": ["chart:NIFTY25AUG48000PE:*"] }

// Data requests  
{ "type": "need_history", "key": "NIFTY:3m", "from": 1723542000 }

// User actions
{ "type": "select_option", "optionKey": "NIFTY25AUG48000PE" }
```

### **Server → Client:**
```typescript
// State updates
{ "type": "selection", "stock": "NIFTY", "optionKey": "NIFTY25AUG48000PE", "intervals": ["3m","5m","15m"] }

// Option chain updates
{ "type": "chain.slice", "underlying": "NIFTY", "atm": 22350,
  "rows": [{"strike": 22350, "call": {"ltp": 120, "oi": 110000}, "put": {"ltp": 130, "oi": 125000}}] }

// Chart data
{ "type": "chart.snapshot", "symbol": "NIFTY", 
  "bundles": {"3m": [Candle], "5m": [Candle], "15m": [Candle]},
  "lastTick": {"time": 1723542057, "price": 22346.2} }

{ "type": "chart.update", "key": "NIFTY:3m",
  "bar": {"time": 1723542060, "open": 22346, "high": 22349, "low": 22345, "close": 22348, "volume": 120},
  "ind": {"ema20": 22341.2, "rsi": 56.3} }

// Order updates  
{ "type": "order.update", "id": "O124", "status": "OPEN", "filledQty": 15, "avgPrice": 118.5 }

// Account updates
{ "type": "account", "marginAvailable": 241000, "marginRequired": 66000 }
```

---

## **Protocol Decision Matrix**

| Action Type | Protocol | Reason |
|-------------|----------|---------|
| Select underlying symbol | WebSocket | Real-time, rapid switching |
| Select option contract | WebSocket | Users browse strikes quickly |
| Subscribe to data feeds | WebSocket | Real-time data streaming |
| Place order | REST POST | Needs HTTP status, logging |
| Modify order | REST POST | Critical state change |
| Cancel order | REST POST | Needs confirmation |
| Query account | REST GET | Standard data retrieval |

**Rationale:** WebSocket for selection actions provides the low-latency, real-time experience traders expect when exploring option chains rapidly.

---

## **Implementation Priority**

1. **Enhance option chain endpoint** - Replace stub with real Kite data integration
2. **Add selection persistence** - `/selection` GET/POST endpoints with WebSocket broadcast
3. **Implement trade aggregation** - Group orders into trades for trade log display
4. **Add real-time streaming** - Option chain LTP/OI updates via WebSocket topics
5. **Enhance chart support** - Support both underlying and option symbols seamlessly

---

## **Frontend Integration Points**

**Svelte Frontend Requirements:**
- Subscribe to `selection`, `chain:NIFTY`, `chart:NIFTY:*` on startup
- Use `select_option` WebSocket message to switch between option contracts  
- Display trade log from `/trades` endpoint with modify/cancel actions
- Show real-time P&L updates from `order.update` WebSocket messages
- Minimal processing - render what server calculates

**Key Benefits:**
- ✅ Real-time option chain updates
- ✅ Seamless underlying/option chart switching  
- ✅ Live order status and P&L tracking
- ✅ Minimal frontend processing (server calculates everything)
- ✅ Scalable topic-based WebSocket design

---

## **Data Types**

```typescript
type Candle = { 
    time: number; 
    open: number; 
    high: number; 
    low: number; 
    close: number; 
    volume?: number 
};

type Selection = {
    stock: string;
    optionKey: string | null;
    intervals: string[];
};

type OptionChainRow = {
    strike: number;
    call: { ltp: number; oi: number; };
    put: { ltp: number; oi: number; };
};
```

---

**Next Steps:** Implement enhancements in priority order, starting with option chain integration and selection persistence.

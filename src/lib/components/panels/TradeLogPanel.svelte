<script lang="ts">
  import type { Trade, Order } from "$lib/types";

  // Mock trades data
  let trades = $state<Trade[]>([
    {
      id: "T001",
      strategy: "Long Call",
      legs: [
        {
          id: "O001",
          symbol: "NIFTY25AUG24400CE",
          side: "BUY",
          quantity: 50,
          price: 150.25,
          trigger_price: undefined,
          order_type: "MARKET",
          product: "MIS",
          status: "COMPLETE",
          filled_quantity: 50,
          average_price: 150.25,
          pending_quantity: 0,
          cancelled_quantity: 0,
          timestamp: "2025-08-20T09:30:15Z",
          order_timestamp: "2025-08-20T09:30:10Z",
        },
      ],
      entry_time: "2025-08-20T09:30:15Z",
      pnl: 1250,
      pnl_percent: 16.6,
      status: "OPEN",
      underlying: "NIFTY",
      trade_type: "LONG",
    },
    {
      id: "T002",
      strategy: "Short Strangle",
      legs: [
        {
          id: "O002",
          symbol: "NIFTY25AUG24450CE",
          side: "SELL",
          quantity: 50,
          price: 95.5,
          trigger_price: undefined,
          order_type: "MARKET",
          product: "MIS",
          status: "COMPLETE",
          filled_quantity: 50,
          average_price: 95.5,
          pending_quantity: 0,
          cancelled_quantity: 0,
          timestamp: "2025-08-20T10:15:30Z",
          order_timestamp: "2025-08-20T10:15:25Z",
        },
        {
          id: "O003",
          symbol: "NIFTY25AUG24300PE",
          side: "SELL",
          quantity: 50,
          price: 88.75,
          trigger_price: undefined,
          order_type: "MARKET",
          product: "MIS",
          status: "COMPLETE",
          filled_quantity: 50,
          average_price: 88.75,
          pending_quantity: 0,
          cancelled_quantity: 0,
          timestamp: "2025-08-20T10:16:45Z",
          order_timestamp: "2025-08-20T10:16:40Z",
        },
      ],
      entry_time: "2025-08-20T10:15:30Z",
      pnl: -850,
      pnl_percent: -9.2,
      status: "OPEN",
      underlying: "NIFTY",
      trade_type: "STRANGLE",
    },
    {
      id: "T003",
      strategy: "Long Put",
      legs: [
        {
          id: "O004",
          symbol: "BANKNIFTY25AUG51500PE",
          side: "BUY",
          quantity: 25,
          price: 275.8,
          trigger_price: undefined,
          order_type: "LIMIT",
          product: "MIS",
          status: "COMPLETE",
          filled_quantity: 25,
          average_price: 275.8,
          pending_quantity: 0,
          cancelled_quantity: 0,
          timestamp: "2025-08-20T11:45:20Z",
          order_timestamp: "2025-08-20T11:45:15Z",
        },
      ],
      entry_time: "2025-08-20T11:45:20Z",
      exit_time: "2025-08-20T14:20:10Z",
      pnl: 3200,
      pnl_percent: 46.4,
      status: "CLOSED",
      underlying: "BANKNIFTY",
      trade_type: "LONG",
    },
  ]);

  let expandedTrades = $state<Set<string>>(new Set());
  let loading = $state(false);
  let selectedTrade = $state<string | null>(null);

  // Toggle trade expansion
  const toggleExpand = (tradeId: string) => {
    if (expandedTrades.has(tradeId)) {
      expandedTrades.delete(tradeId);
    } else {
      expandedTrades.add(tradeId);
    }
    expandedTrades = new Set(expandedTrades);
  };

  // Close trade
  const closeTrade = async (tradeId: string) => {
    const trade = trades.find((t) => t.id === tradeId);
    if (!trade || trade.status === "CLOSED") return;

    if (!confirm(`Close trade ${tradeId}? This will place market orders to exit all positions.`)) {
      return;
    }

    loading = true;
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update trade status
      const tradeIndex = trades.findIndex((t) => t.id === tradeId);
      if (tradeIndex !== -1) {
        trades[tradeIndex] = {
          ...trades[tradeIndex],
          status: "CLOSED",
          exit_time: new Date().toISOString(),
        };
      }

      console.log(`Trade ${tradeId} closed`);
    } catch (error) {
      console.error("Failed to close trade:", error);
      alert("Failed to close trade. Please try again.");
    } finally {
      loading = false;
    }
  };

  // Modify trade (placeholder)
  const modifyTrade = (tradeId: string) => {
    selectedTrade = tradeId;
    console.log(`Modify trade ${tradeId}`);
    // TODO: Open modify dialog
    alert(`Modify functionality for trade ${tradeId} coming soon!`);
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format time
  const formatTime = (isoString: string): string => {
    return new Date(isoString).toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format date
  const formatDate = (isoString: string): string => {
    return new Date(isoString).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      month: "short",
      day: "numeric",
    });
  };

  // Get P&L color class
  const getPnLColor = (pnl: number): string => {
    return pnl >= 0 ? "text-success" : "text-error";
  };

  // Get status badge class
  const getStatusBadge = (status: string): string => {
    switch (status) {
      case "OPEN":
        return "badge-primary";
      case "CLOSED":
        return "badge-neutral";
      case "PARTIAL":
        return "badge-warning";
      default:
        return "badge-ghost";
    }
  };

  // Calculate total P&L
  let totalPnL = $derived(trades.reduce((sum, trade) => sum + trade.pnl, 0));
  let openTrades = $derived(trades.filter((t) => t.status === "OPEN").length);
  let closedTrades = $derived(trades.filter((t) => t.status === "CLOSED").length);

  // Refresh trades
  const refreshTrades = () => {
    loading = true;
    setTimeout(() => {
      // Simulate updated P&L
      trades = trades.map((trade) => ({
        ...trade,
        pnl: trade.pnl + (Math.random() - 0.5) * 200,
        pnl_percent: trade.pnl_percent + (Math.random() - 0.5) * 2,
      }));
      loading = false;
    }, 1000);
  };
</script>

<div class="flex h-full flex-col">
  <!-- Header with stats and controls -->
  <div class="mb-4">
    <!-- Summary stats -->
    <div class="stats mb-3 stats-horizontal bg-base-200 shadow-sm">
      <div class="stat py-2">
        <div class="stat-title text-xs">Total P&L</div>
        <div class="stat-value text-sm {getPnLColor(totalPnL)}">
          {formatCurrency(totalPnL)}
        </div>
      </div>
      <div class="stat py-2">
        <div class="stat-title text-xs">Open</div>
        <div class="stat-value text-sm">{openTrades}</div>
      </div>
      <div class="stat py-2">
        <div class="stat-title text-xs">Closed</div>
        <div class="stat-value text-sm">{closedTrades}</div>
      </div>
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-between">
      <h3 class="font-semibold">Active Trades</h3>
      <button class="btn btn-ghost btn-sm" onclick={refreshTrades} disabled={loading}>
        {#if loading}
          <span class="loading loading-xs loading-spinner"></span>
        {:else}
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            ></path>
          </svg>
        {/if}
        Refresh
      </button>
    </div>
  </div>

  <!-- Trades list -->
  <div class="flex-1 space-y-2 overflow-auto">
    {#if loading && trades.length === 0}
      <!-- Loading skeleton -->
      <div class="space-y-2">
        {#each Array(5) as _}
          <div class="animate-pulse">
            <div class="h-16 rounded-lg bg-base-300"></div>
          </div>
        {/each}
      </div>
    {:else if trades.length === 0}
      <!-- Empty state -->
      <div class="py-8 text-center text-base-content/60">
        <svg
          class="mx-auto mb-2 h-12 w-12 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h2m0-12h4m0 0v12m0-12V9a2 2 0 012 2v2a2 2 0 01-2 2h-4"
          ></path>
        </svg>
        <p class="text-sm">No trades found</p>
        <p class="mt-1 text-xs">Trades will appear here once you place orders</p>
      </div>
    {:else}
      {#each trades as trade (trade.id)}
        <div class="card-compact card border border-base-300 bg-base-100 shadow-sm">
          <!-- Trade summary -->
          <div class="card-body p-3">
            <div class="flex items-center justify-between">
              <!-- Trade info -->
              <div class="flex-1">
                <div class="mb-1 flex items-center gap-2">
                  <h4 class="text-sm font-semibold">{trade.id}</h4>
                  <span class="badge {getStatusBadge(trade.status)} badge-xs">
                    {trade.status}
                  </span>
                  <span class="badge badge-outline badge-xs">
                    {trade.strategy}
                  </span>
                </div>
                <div class="text-xs text-base-content/70">
                  {trade.underlying} • {formatDate(trade.entry_time)}
                  {formatTime(trade.entry_time)}
                  {#if trade.exit_time}
                    → {formatTime(trade.exit_time)}
                  {/if}
                </div>
              </div>

              <!-- P&L -->
              <div class="text-right">
                <div class="font-semibold {getPnLColor(trade.pnl)}">
                  {trade.pnl >= 0 ? "+" : ""}{formatCurrency(trade.pnl)}
                </div>
                <div class="text-xs {getPnLColor(trade.pnl_percent)}">
                  {trade.pnl_percent >= 0 ? "+" : ""}{trade.pnl_percent.toFixed(1)}%
                </div>
              </div>

              <!-- Actions -->
              <div class="ml-3 flex items-center gap-1">
                {#if trade.status === "OPEN"}
                  <button
                    class="btn btn-outline btn-xs btn-warning"
                    onclick={() => modifyTrade(trade.id)}
                    disabled={loading}
                  >
                    Modify
                  </button>
                  <button
                    class="btn btn-outline btn-xs btn-error"
                    onclick={() => closeTrade(trade.id)}
                    disabled={loading}
                  >
                    Close
                  </button>
                {/if}
                <button
                  class="btn btn-ghost btn-xs"
                  onclick={() => toggleExpand(trade.id)}
                  aria-label="Toggle details for trade"
                >
                  <svg
                    class="h-3 w-3 transition-transform"
                    class:rotate-180={expandedTrades.has(trade.id)}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Expanded details -->
          {#if expandedTrades.has(trade.id)}
            <div class="bg-base-50 border-t border-base-300">
              <div class="p-3">
                <h5 class="mb-2 text-sm font-medium">Trade Legs ({trade.legs.length})</h5>
                <div class="space-y-2">
                  {#each trade.legs as leg (leg.id)}
                    <div class="flex items-center justify-between rounded border bg-base-100 p-2">
                      <div class="flex-1">
                        <div class="flex items-center gap-2">
                          <span
                            class="badge badge-xs"
                            class:badge-success={leg.side === "BUY"}
                            class:badge-error={leg.side === "SELL"}
                          >
                            {leg.side}
                          </span>
                          <span class="font-mono text-xs">{leg.symbol}</span>
                        </div>
                        <div class="mt-1 text-xs text-base-content/70">
                          Qty: {leg.quantity} • Avg: ₹{leg.average_price.toFixed(2)}
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="text-xs font-semibold">
                          {formatCurrency(leg.quantity * leg.average_price)}
                        </div>
                        <div class="text-xs text-base-content/70">
                          {formatTime(leg.timestamp)}
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>

                <!-- Trade stats -->
                <div class="mt-3 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span class="text-base-content/70">Entry:</span>
                    <span class="ml-1 font-mono">{formatTime(trade.entry_time)}</span>
                  </div>
                  {#if trade.exit_time}
                    <div>
                      <span class="text-base-content/70">Exit:</span>
                      <span class="ml-1 font-mono">{formatTime(trade.exit_time)}</span>
                    </div>
                  {/if}
                  <div>
                    <span class="text-base-content/70">Type:</span>
                    <span class="ml-1">{trade.trade_type}</span>
                  </div>
                  <div>
                    <span class="text-base-content/70">Legs:</span>
                    <span class="ml-1">{trade.legs.length}</span>
                  </div>
                </div>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  /* Custom styling for trade cards */
  .card-body {
    padding: 0.75rem;
  }

  .stats-horizontal .stat {
    padding: 0.5rem;
  }

  /* Rotation animation for expand/collapse */
  .rotate-180 {
    transform: rotate(180deg);
  }

  .transition-transform {
    transition: transform 0.2s ease-in-out;
  }

  /* Loading animation */
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* Base-50 color for expanded sections */
  .bg-base-50 {
    background-color: hsl(var(--b1) / 0.5);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .btn-xs {
      padding: 0.125rem 0.25rem;
      font-size: 0.625rem;
    }

    .text-xs {
      font-size: 0.625rem;
    }
  }
</style>

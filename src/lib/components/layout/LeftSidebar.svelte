<script lang="ts">
  import type { Instrument } from "$lib/types";

  // Mock instruments data - will be connected to stores later
  let instruments = $state<Instrument[]>([
    { symbol: "NIFTY", token: "256265", exchange: "NSE", lot_size: 50, tick_size: 0.05, instrument_type: "EQ" },
    { symbol: "BANKNIFTY", token: "260105", exchange: "NSE", lot_size: 25, tick_size: 0.05, instrument_type: "EQ" },
    { symbol: "FINNIFTY", token: "257801", exchange: "NSE", lot_size: 40, tick_size: 0.05, instrument_type: "EQ" },
    { symbol: "RELIANCE", token: "738561", exchange: "NSE", lot_size: 1, tick_size: 0.05, instrument_type: "EQ" },
    { symbol: "TCS", token: "2953217", exchange: "NSE", lot_size: 1, tick_size: 0.05, instrument_type: "EQ" },
    { symbol: "HDFCBANK", token: "341249", exchange: "NSE", lot_size: 1, tick_size: 0.05, instrument_type: "EQ" },
    { symbol: "INFY", token: "408065", exchange: "NSE", lot_size: 1, tick_size: 0.05, instrument_type: "EQ" },
    { symbol: "ICICIBANK", token: "1270529", exchange: "NSE", lot_size: 1, tick_size: 0.05, instrument_type: "EQ" },
    { symbol: "HINDUNILVR", token: "356865", exchange: "NSE", lot_size: 1, tick_size: 0.05, instrument_type: "EQ" },
    { symbol: "ITC", token: "424961", exchange: "NSE", lot_size: 1, tick_size: 0.05, instrument_type: "EQ" },
  ]);

  let searchQuery = $state("");
  let selectedInstrument = $state<string | null>("NIFTY");
  let loading = $state(false);

  // Filter instruments based on search query
  let filteredInstruments = $derived(
    searchQuery.trim() === ""
      ? instruments
      : instruments.filter((instrument) => instrument.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle instrument selection
  const selectInstrument = (symbol: string) => {
    selectedInstrument = symbol;
    // TODO: Update selection store and trigger chart updates
    console.log(`Selected instrument: ${symbol}`);
  };

  // Handle search input
  const handleSearch = (event: Event) => {
    const target = event.target as HTMLInputElement;
    searchQuery = target.value;
  };

  // Clear search
  const clearSearch = () => {
    searchQuery = "";
  };

  // Get current price for instrument (mock data)
  const getCurrentPrice = (symbol: string): number => {
    const mockPrices: Record<string, number> = {
      NIFTY: 24350.5,
      BANKNIFTY: 51750.25,
      FINNIFTY: 23180.75,
      RELIANCE: 2485.6,
      TCS: 3890.45,
      HDFCBANK: 1675.8,
      INFY: 1825.3,
      ICICIBANK: 1255.9,
      HINDUNILVR: 2650.75,
      ITC: 485.2,
    };
    return mockPrices[symbol] || 0;
  };

  // Get price change (mock data)
  const getPriceChange = (symbol: string): { change: number; changePercent: number } => {
    const mockChanges: Record<string, { change: number; changePercent: number }> = {
      NIFTY: { change: 125.3, changePercent: 0.52 },
      BANKNIFTY: { change: -85.75, changePercent: -0.17 },
      FINNIFTY: { change: 45.2, changePercent: 0.2 },
      RELIANCE: { change: 12.6, changePercent: 0.51 },
      TCS: { change: -8.45, changePercent: -0.22 },
      HDFCBANK: { change: 15.8, changePercent: 0.95 },
      INFY: { change: -3.3, changePercent: -0.18 },
      ICICIBANK: { change: 8.9, changePercent: 0.71 },
      HINDUNILVR: { change: -12.75, changePercent: -0.48 },
      ITC: { change: 2.2, changePercent: 0.46 },
    };
    return mockChanges[symbol] || { change: 0, changePercent: 0 };
  };
</script>

<div class="h-full flex flex-col bg-base-200">
  <!-- Header -->
  <div class="p-4 border-b border-base-300">
    <h2 class="text-lg font-semibold mb-3">Instruments</h2>

    <!-- Search Input -->
    <div class="relative">
      <input
        type="text"
        placeholder="Search instruments..."
        class="input input-bordered input-sm w-full pr-8"
        value={searchQuery}
        oninput={handleSearch}
      />
      {#if searchQuery}
        <button class="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-xs" onclick={clearSearch}>
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          aria-label="Clear search"
        </button>
      {:else}
        <svg
          class="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-base-content/50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      {/if}
    </div>
  </div>

  <!-- Instruments List -->
  <div class="flex-1 overflow-auto">
    {#if loading}
      <!-- Loading skeleton -->
      <div class="p-4 space-y-2">
        {#each Array(8) as _}
          <div class="animate-pulse">
            <div class="h-12 bg-base-300 rounded-lg"></div>
          </div>
        {/each}
      </div>
    {:else if filteredInstruments.length === 0}
      <!-- Empty state -->
      <div class="p-4 text-center text-base-content/60">
        <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.901-6.06 2.379.96.636 2.101 1.02 3.316 1.14.398-.3.854-.513 1.344-.672A6.977 6.977 0 0112 15z"
          ></path>
        </svg>
        <p class="text-sm">No instruments found</p>
        {#if searchQuery}
          <p class="text-xs mt-1">Try a different search term</p>
        {/if}
      </div>
    {:else}
      <!-- Instruments list -->
      <div class="p-2">
        {#each filteredInstruments as instrument (instrument.token)}
          {@const price = getCurrentPrice(instrument.symbol)}
          {@const { change, changePercent } = getPriceChange(instrument.symbol)}

          <button
            class="
              w-full p-3 mb-1 rounded-lg text-left transition-colors
              hover:bg-base-300 focus:bg-base-300 focus:outline-none
              {selectedInstrument === instrument.symbol ? 'bg-primary/20 border border-primary/40' : 'bg-base-100'}
            "
            onclick={() => selectInstrument(instrument.symbol)}
          >
            <div class="flex items-center justify-between">
              <!-- Symbol and exchange -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="font-semibold text-sm truncate">{instrument.symbol}</h3>
                  <span class="badge badge-outline badge-xs">{instrument.exchange}</span>
                </div>
                {#if instrument.lot_size > 1}
                  <p class="text-xs text-base-content/60">Lot: {instrument.lot_size}</p>
                {/if}
              </div>

              <!-- Price and change -->
              <div class="text-right">
                <div class="font-semibold text-sm">
                  ₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div class="text-xs {change >= 0 ? 'text-success' : 'text-error'}">
                  {change >= 0 ? "+" : ""}{change.toFixed(2)} ({changePercent >= 0 ? "+" : ""}{changePercent.toFixed(
                    2
                  )}%)
                </div>
              </div>
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Footer with refresh button -->
  <div class="p-4 border-t border-base-300">
    <button
      class="btn btn-sm btn-ghost w-full"
      onclick={() => {
        loading = true;
        // Simulate API call
        setTimeout(() => (loading = false), 1000);
      }}
      disabled={loading}
    >
      {#if loading}
        <span class="loading loading-spinner loading-xs"></span>
        Refreshing...
      {:else}
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          ></path>
        </svg>
        Refresh
      {/if}
    </button>
  </div>
</div>

<style>
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

  /* Custom scrollbar */
  .overflow-auto::-webkit-scrollbar {
    width: 6px;
  }

  .overflow-auto::-webkit-scrollbar-track {
    background: transparent;
  }

  .overflow-auto::-webkit-scrollbar-thumb {
    background-color: hsl(var(--bc) / 0.2);
    border-radius: 3px;
  }

  .overflow-auto::-webkit-scrollbar-thumb:hover {
    background-color: hsl(var(--bc) / 0.3);
  }
</style>

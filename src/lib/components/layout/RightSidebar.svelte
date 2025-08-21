<script lang="ts">
  import type { Candle, ChartData } from "$lib/types";
  import type { TimeInterval } from "$lib/types";
  import TradingChart from "$lib/components/charts/TradingChart.svelte";
  import IntervalButtons from "$lib/components/charts/IntervalButtons.svelte";

  // Mock chart data - will be connected to stores later
  let underlyingSymbol = $state("NIFTY");
  let optionSymbol = $state<string | null>(null);
  let selectedIntervals = $state<TimeInterval[]>(["3m", "5m", "15m"]);
  let currentInterval = $state<TimeInterval>("5m");

  // Mock candle data for both charts
  let underlyingData = $state<Candle[]>([]);
  let optionData = $state<Candle[]>([]);
  let loading = $state({ underlying: false, option: false });

  // Generate mock data
  $effect(() => {
    generateMockData();
  });

  const generateMockData = () => {
    const now = Date.now();
    const candleCount = 100;
    const intervalMs = 5 * 60 * 1000; // 5 minutes

    // Generate underlying data
    const underlyingCandles: Candle[] = [];
    let price = 24350;

    for (let i = candleCount - 1; i >= 0; i--) {
      const time = Math.floor((now - i * intervalMs) / 1000);
      const change = (Math.random() - 0.5) * 50;
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) + Math.random() * 20;
      const low = Math.min(open, close) - Math.random() * 20;
      const volume = Math.floor(Math.random() * 1000000) + 500000;

      underlyingCandles.push({ time, open, high, low, close, volume });
      price = close;
    }

    underlyingData = underlyingCandles;

    // Generate option data (more volatile)
    if (optionSymbol) {
      const optionCandles: Candle[] = [];
      let optionPrice = 150;

      for (let i = candleCount - 1; i >= 0; i--) {
        const time = Math.floor((now - i * intervalMs) / 1000);
        const change = (Math.random() - 0.5) * 20;
        const open = optionPrice;
        const close = Math.max(0.05, optionPrice + change);
        const high = Math.max(open, close) + Math.random() * 10;
        const low = Math.max(0.05, Math.min(open, close) - Math.random() * 10);
        const volume = Math.floor(Math.random() * 50000) + 10000;

        optionCandles.push({ time, open, high, low, close, volume });
        optionPrice = close;
      }

      optionData = optionCandles;
    }
  };

  // Handle interval selection
  const handleIntervalChange = (intervals: TimeInterval[]) => {
    selectedIntervals = intervals;
    if (!intervals.includes(currentInterval)) {
      currentInterval = intervals[0];
    }
    // TODO: Fetch new data for selected intervals
    console.log("Intervals changed:", intervals);
  };

  // Handle current interval change
  const handleCurrentIntervalChange = (interval: TimeInterval) => {
    currentInterval = interval;
    // TODO: Switch chart data to selected interval
    console.log("Current interval changed:", interval);
  };

  // Simulate option selection
  const selectOption = (optionKey: string) => {
    optionSymbol = optionKey;
    generateMockData();
  };
</script>

<div class="flex h-full flex-col bg-base-200">
  <!-- Header with interval controls -->
  <div class="border-b border-base-300 p-4">
    <div class="mb-3 flex items-center justify-between">
      <h2 class="text-lg font-semibold">Charts</h2>
      <button
        class="btn btn-ghost btn-sm"
        onclick={() => generateMockData()}
        title="Refresh charts"
        aria-label="Refresh charts"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          ></path>
        </svg>
      </button>
    </div>

    <!-- Interval Selection -->
    <IntervalButtons
      intervals={["1m", "3m", "5m", "15m", "30m", "1h"]}
      selected={selectedIntervals}
      current={currentInterval}
      onSelect={handleIntervalChange}
      onCurrentChange={handleCurrentIntervalChange}
    />
  </div>

  <!-- Charts Container -->
  <div class="flex flex-1 flex-col overflow-hidden">
    <!-- Underlying Chart -->
    <div class="flex-1 border-b border-base-300">
      <div class="flex h-full flex-col">
        <!-- Chart Header -->
        <div class="border-b border-base-300 bg-base-100 px-4 py-2">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-semibold">{underlyingSymbol}</h3>
              <p class="text-xs text-base-content/60">Underlying • {currentInterval}</p>
            </div>
            <div class="text-right">
              <div class="text-sm font-semibold">₹24,350.50</div>
              <div class="text-xs text-success">+125.30 (+0.52%)</div>
            </div>
          </div>
        </div>

        <!-- Chart -->
        <div class="flex-1">
          <TradingChart
            data={underlyingData}
            height={220}
            title={`${underlyingSymbol} - ${currentInterval}`}
            loading={loading.underlying}
          />
        </div>
      </div>
    </div>

    <!-- Option Chart -->
    <div class="flex-1">
      <div class="flex h-full flex-col">
        <!-- Chart Header -->
        <div class="border-b border-base-300 bg-base-100 px-4 py-2">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-semibold">
                {optionSymbol || "Select Option"}
              </h3>
              <p class="text-xs text-base-content/60">
                {optionSymbol ? `Option • ${currentInterval}` : "No option selected"}
              </p>
            </div>
            {#if optionSymbol}
              <div class="text-right">
                <div class="text-sm font-semibold">₹150.25</div>
                <div class="text-xs text-error">-8.75 (-5.52%)</div>
              </div>
            {:else}
              <button
                class="btn btn-xs btn-primary"
                onclick={() => selectOption("NIFTY25AUG24400CE")}
              >
                Select Option
              </button>
            {/if}
          </div>
        </div>

        <!-- Chart -->
        <div class="flex-1">
          {#if optionSymbol}
            <TradingChart
              data={optionData}
              height={220}
              title={`${optionSymbol} - ${currentInterval}`}
              loading={loading.option}
            />
          {:else}
            <!-- Empty state -->
            <div class="flex h-full items-center justify-center bg-base-100">
              <div class="text-center text-base-content/60">
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  ></path>
                </svg>
                <p class="text-sm">Select an option to view chart</p>
                <p class="mt-1 text-xs">Choose from option chain</p>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Quick Actions Footer -->
  <div class="border-t border-base-300 bg-base-100 p-4">
    <div class="flex gap-2">
      <button
        class="btn flex-1 btn-outline btn-xs"
        onclick={() => handleCurrentIntervalChange("3m")}
        class:btn-active={currentInterval === "3m"}
      >
        3m
      </button>
      <button
        class="btn flex-1 btn-outline btn-xs"
        onclick={() => handleCurrentIntervalChange("5m")}
        class:btn-active={currentInterval === "5m"}
      >
        5m
      </button>
      <button
        class="btn flex-1 btn-outline btn-xs"
        onclick={() => handleCurrentIntervalChange("15m")}
        class:btn-active={currentInterval === "15m"}
      >
        15m
      </button>
    </div>
  </div>
</div>

<style>
  /* Ensure charts fill available space */
  :global(.chart-container) {
    height: 100%;
    width: 100%;
  }
</style>

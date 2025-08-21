<script lang="ts">
  import type { OptionChain, OptionChainRow } from "$lib/types";

  // Mock option chain data
  let optionChain = $state<OptionChain>({
    underlying: "NIFTY",
    atm: 24350,
    spot_price: 24350.5,
    expiry: "2025-08-28",
    expiries: ["2025-08-28", "2025-09-04", "2025-09-25", "2025-10-30"],
    rows: [],
    last_updated: Date.now(),
  });

  let selectedExpiry = $state("2025-08-28");
  let selectedOption = $state<string | null>(null);
  let loading = $state(false);

  // Generate mock option chain data
  $effect(() => {
    generateMockOptionChain();
  });

  const generateMockOptionChain = () => {
    const atmStrike = optionChain.atm;
    const strikes: number[] = [];

    // Generate strikes around ATM (±10 strikes)
    for (let i = -10; i <= 10; i++) {
      strikes.push(atmStrike + i * 50);
    }

    const rows: OptionChainRow[] = strikes.map((strike) => {
      const isAtm = Math.abs(strike - atmStrike) <= 25;
      const distanceFromAtm = Math.abs(strike - atmStrike) / 50;

      // Mock call data
      const callLtp = Math.max(
        0.05,
        isAtm
          ? 150 + Math.random() * 50
          : Math.max(0.05, 200 - distanceFromAtm * 30 + Math.random() * 20)
      );
      const callOi = Math.floor(
        (isAtm ? 800000 : 400000 - distanceFromAtm * 50000) + Math.random() * 200000
      );

      // Mock put data
      const putLtp = Math.max(
        0.05,
        isAtm
          ? 140 + Math.random() * 50
          : Math.max(0.05, 180 - distanceFromAtm * 25 + Math.random() * 20)
      );
      const putOi = Math.floor(
        (isAtm ? 750000 : 350000 - distanceFromAtm * 40000) + Math.random() * 180000
      );

      return {
        strike,
        call: {
          ltp: callLtp,
          oi: callOi,
          change: (Math.random() - 0.5) * 20,
          change_percent: (Math.random() - 0.5) * 15,
          iv: 15 + Math.random() * 10,
          volume: Math.floor(Math.random() * 100000),
          bid: callLtp - 0.25,
          ask: callLtp + 0.25,
        },
        put: {
          ltp: putLtp,
          oi: putOi,
          change: (Math.random() - 0.5) * 20,
          change_percent: (Math.random() - 0.5) * 15,
          iv: 14 + Math.random() * 10,
          volume: Math.floor(Math.random() * 80000),
          bid: putLtp - 0.25,
          ask: putLtp + 0.25,
        },
        expiry: selectedExpiry,
      };
    });

    optionChain.rows = rows;
  };

  // Handle expiry change
  const handleExpiryChange = (expiry: string) => {
    selectedExpiry = expiry;
    optionChain.expiry = expiry;
    generateMockOptionChain();
  };

  // Handle option selection
  const selectOption = (strike: number, type: "call" | "put") => {
    const optionKey = `${optionChain.underlying}${selectedExpiry.replace(/-/g, "")}${strike}${type.toUpperCase()[0]}E`;
    selectedOption = optionKey;
    console.log(`Selected option: ${optionKey}`);
    // TODO: Update selection store and trigger chart updates
  };

  // Check if strike is ATM
  const isAtmStrike = (strike: number): boolean => {
    return Math.abs(strike - optionChain.atm) <= 25;
  };

  // Format number with Indian locale
  const formatNumber = (num: number, decimals: number = 2): string => {
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  // Format large numbers (for OI)
  const formatLargeNumber = (num: number): string => {
    if (num >= 10000000) {
      return (num / 10000000).toFixed(1) + "Cr";
    } else if (num >= 100000) {
      return (num / 100000).toFixed(1) + "L";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  // Get color class for change
  const getChangeColor = (change: number): string => {
    return change >= 0 ? "text-success" : "text-error";
  };

  // Refresh option chain
  const refreshChain = () => {
    loading = true;
    setTimeout(() => {
      generateMockOptionChain();
      loading = false;
    }, 1000);
  };
</script>

<div class="flex h-full flex-col">
  <!-- Header with controls -->
  <div class="mb-4 space-y-3">
    <!-- Underlying info -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="font-semibold">{optionChain.underlying}</h3>
        <p class="text-sm text-base-content/70">
          Spot: ₹{formatNumber(optionChain.spot_price)} • ATM: {optionChain.atm}
        </p>
      </div>
      <button class="btn btn-ghost btn-sm" onclick={refreshChain} disabled={loading}>
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

    <!-- Expiry selection -->
    <div class="flex gap-2 overflow-x-auto">
      {#each optionChain.expiries as expiry}
        <button
          class="btn whitespace-nowrap btn-outline btn-sm"
          class:btn-active={selectedExpiry === expiry}
          onclick={() => handleExpiryChange(expiry)}
        >
          {new Date(expiry).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
          })}
        </button>
      {/each}
    </div>
  </div>

  <!-- Option chain table -->
  <div class="flex-1 overflow-auto">
    {#if loading}
      <!-- Loading skeleton -->
      <div class="space-y-2">
        {#each Array(10) as _}
          <div class="animate-pulse">
            <div class="h-12 rounded bg-base-300"></div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="table-pin-rows table table-xs">
          <thead>
            <tr class="bg-base-200">
              <th colspan="4" class="border-r border-base-300 text-center">CALLS</th>
              <th class="bg-primary/20 text-center">STRIKE</th>
              <th colspan="4" class="border-l border-base-300 text-center">PUTS</th>
            </tr>
            <tr class="bg-base-200 text-xs">
              <th class="text-right">OI</th>
              <th class="text-right">Chg</th>
              <th class="text-right">LTP</th>
              <th class="text-center">Buy</th>
              <th class="bg-primary/10 text-center font-bold">Strike</th>
              <th class="text-center">Buy</th>
              <th class="text-left">LTP</th>
              <th class="text-left">Chg</th>
              <th class="text-left">OI</th>
            </tr>
          </thead>
          <tbody>
            {#each optionChain.rows as row (row.strike)}
              {@const isAtm = isAtmStrike(row.strike)}
              <tr
                class="text-xs hover:bg-base-200/50 {isAtm ? 'border-primary/20 bg-primary/5' : ''}"
              >
                <!-- Call OI -->
                <td class="text-right font-mono">
                  {formatLargeNumber(row.call.oi)}
                </td>

                <!-- Call Change -->
                <td class="text-right {getChangeColor(row.call.change || 0)}">
                  {row.call.change ? formatNumber(row.call.change) : "-"}
                </td>

                <!-- Call LTP -->
                <td class="text-right font-semibold">
                  ₹{formatNumber(row.call.ltp)}
                </td>

                <!-- Call Buy Button -->
                <td class="text-center">
                  <button
                    class="btn btn-outline btn-xs btn-success"
                    onclick={() => selectOption(row.strike, "call")}
                  >
                    B
                  </button>
                </td>

                <!-- Strike Price -->
                <td
                  class="bg-base-200 text-center font-bold {isAtm
                    ? 'bg-primary/20 text-primary'
                    : ''}"
                >
                  {row.strike}
                </td>

                <!-- Put Buy Button -->
                <td class="text-center">
                  <button
                    class="btn btn-outline btn-xs btn-success"
                    onclick={() => selectOption(row.strike, "put")}
                  >
                    B
                  </button>
                </td>

                <!-- Put LTP -->
                <td class="text-left font-semibold">
                  ₹{formatNumber(row.put.ltp)}
                </td>

                <!-- Put Change -->
                <td class="text-left {getChangeColor(row.put.change || 0)}">
                  {row.put.change ? formatNumber(row.put.change) : "-"}
                </td>

                <!-- Put OI -->
                <td class="text-left font-mono">
                  {formatLargeNumber(row.put.oi)}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>

  <!-- Footer with stats -->
  <div class="mt-4 rounded-lg bg-base-200 p-3">
    <div class="grid grid-cols-3 gap-4 text-center text-xs">
      <div>
        <div class="font-semibold">Total Call OI</div>
        <div class="text-success">
          {formatLargeNumber(optionChain.rows.reduce((sum, row) => sum + row.call.oi, 0))}
        </div>
      </div>
      <div>
        <div class="font-semibold">PCR</div>
        <div>
          {(() => {
            const totalCallOi = optionChain.rows.reduce((sum, row) => sum + row.call.oi, 0);
            const totalPutOi = optionChain.rows.reduce((sum, row) => sum + row.put.oi, 0);
            return totalCallOi > 0 ? (totalPutOi / totalCallOi).toFixed(2) : "0.00";
          })()}
        </div>
      </div>
      <div>
        <div class="font-semibold">Total Put OI</div>
        <div class="text-error">
          {formatLargeNumber(optionChain.rows.reduce((sum, row) => sum + row.put.oi, 0))}
        </div>
      </div>
    </div>
  </div>

  {#if selectedOption}
    <div class="mt-2 alert alert-info py-2">
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
      <span class="text-xs">Selected: {selectedOption}</span>
    </div>
  {/if}
</div>

<style>
  /* Custom table styling */
  .table :where(th, td) {
    padding: 0.25rem 0.5rem;
  }

  .table th {
    font-weight: 600;
    font-size: 0.75rem;
  }

  /* ATM highlighting */
  .bg-primary\/5 {
    background-color: hsl(var(--p) / 0.05);
  }

  .bg-primary\/10 {
    background-color: hsl(var(--p) / 0.1);
  }

  .bg-primary\/20 {
    background-color: hsl(var(--p) / 0.2);
  }

  .border-primary\/20 {
    border-color: hsl(var(--p) / 0.2);
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

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .table {
      font-size: 0.625rem;
    }

    .btn-xs {
      padding: 0.125rem 0.25rem;
      font-size: 0.5rem;
    }
  }
</style>

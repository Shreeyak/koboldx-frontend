<script lang="ts">
  // Panel components (will be created)
  import OrderPlacementPanel from "$lib/components/panels/OrderPlacementPanel.svelte";
  import OptionChainPanel from "$lib/components/panels/OptionChainPanel.svelte";
  import TradeLogPanel from "$lib/components/panels/TradeLogPanel.svelte";
</script>

<svelte:head>
  <title>KoboldX Trading Dashboard</title>
  <meta name="description" content="Professional options trading dashboard with real-time data and advanced analytics" />
</svelte:head>

<!-- Trading Dashboard Content -->
<div class="p-4 gap-4 flex flex-col h-full">
  <!-- Order Placement Panel -->
  <div class="card bg-base-100 shadow-sm border border-base-300">
    <div class="card-body p-4">
      <h3 class="card-title text-lg mb-3">Order Placement</h3>
      <OrderPlacementPanel />
    </div>
  </div>

  <!-- Option Chain Panel -->
  <div class="card bg-base-100 shadow-sm border border-base-300 flex-1">
    <div class="card-body p-4 flex flex-col">
      <h3 class="card-title text-lg mb-3">Option Chain</h3>
      <div class="flex-1 overflow-auto">
        <OptionChainPanel />
      </div>
    </div>
  </div>

  <!-- Trade Log Panel -->
  <div class="card bg-base-100 shadow-sm border border-base-300">
    <div class="card-body p-4">
      <h3 class="card-title text-lg mb-3">Trade Log</h3>
      <TradeLogPanel />
    </div>
  </div>
</div>
